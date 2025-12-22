import os
import logging
from fastapi import APIRouter, HTTPException, Query
from google.cloud import bigquery
from typing import List, Dict
from customers.api.schemas.data import SensorData, SensorStats

data_router = APIRouter()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")

client = bigquery.Client(project=PROJECT_ID)


@data_router.get("/latest/{sensor_id}", response_model=SensorData)
async def get_latest_reading(sensor_id: str):
    """Get the latest sensor reading for a specific sensor (node_id)"""
    query = f"""
    SELECT
        node_id,
        message_id,
        timestamp,
        temperature,
        humidity
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    WHERE node_id = '{sensor_id}'
    ORDER BY timestamp DESC
    LIMIT 1
    """

    try:
        query_job = client.query(query)
        results = list(query_job.result())

        if not results:
            raise HTTPException(status_code=404, detail="No data found for this sensor")

        row = results[0]
        return SensorData(
            node_id=row.node_id,
            message_id=row.message_id,
            timestamp=row.timestamp,
            temperature=row.temperature,
            humidity=row.humidity,
        )
    except Exception as e:
        logger.error(f"Error fetching latest reading: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@data_router.get("/historical/{sensor_id}", response_model=List[SensorData])
async def get_historical_data(
    sensor_id: str, start_time: str = Query(...), end_time: str = Query(...)
):
    """Get historical sensor data for a time range"""
    query = f"""
    SELECT
        node_id,
        message_id,
        timestamp,
        temperature,
        humidity
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    WHERE node_id = '{sensor_id}'
        AND timestamp BETWEEN TIMESTAMP('{start_time}')
        AND TIMESTAMP('{end_time}')
    ORDER BY timestamp DESC
    LIMIT 1000
    """

    try:
        query_job = client.query(query)
        results = list(query_job.result())

        return [
            SensorData(
                node_id=row.node_id,
                message_id=row.message_id,
                timestamp=row.timestamp,
                temperature=row.temperature,
                humidity=row.humidity,
            )
            for row in results
        ]
    except Exception as e:
        logger.error(f"Error fetching historical data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@data_router.post("/multi-sensor", response_model=Dict[str, SensorData])
async def get_multi_sensor_data(sensor_ids: List[str]):
    """Get latest readings for multiple sensors"""
    if not sensor_ids:
        return {}

    sensor_ids_str = ",".join(f"'{sid}'" for sid in sensor_ids)
    query = f"""
    WITH RankedReadings AS (
        SELECT
            node_id,
            message_id,
            timestamp,
            temperature,
            humidity,
            ROW_NUMBER() OVER (PARTITION BY node_id ORDER BY timestamp DESC) as rn
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        WHERE node_id IN ({sensor_ids_str})
    )
    SELECT
        node_id,
        message_id,
        timestamp,
        temperature,
        humidity
    FROM RankedReadings
    WHERE rn = 1
    """

    try:
        query_job = client.query(query)
        results = list(query_job.result())

        data_map = {}
        for row in results:
            sensor_id = row.node_id
            data_map[sensor_id] = SensorData(
                node_id=row.node_id,
                message_id=row.message_id,
                timestamp=row.timestamp,
                temperature=row.temperature,
                humidity=row.humidity,
            )

        return data_map
    except Exception as e:
        logger.error(f"Error fetching multi-sensor data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@data_router.get("/stats/{sensor_id}", response_model=SensorStats)
async def get_sensor_stats(
    sensor_id: str, period: str = Query("24h", regex="^(1h|24h|7d|30d)$")
):
    """Get statistical summary for a sensor over a time period"""
    hours_map = {"1h": 1, "24h": 24, "7d": 168, "30d": 720}
    hours = hours_map[period]

    query = f"""
    SELECT
        AVG(temperature) as avg_temperature,
        AVG(humidity) as avg_humidity,
        MIN(temperature) as min_temperature,
        MAX(temperature) as max_temperature,
        MIN(humidity) as min_humidity,
        MAX(humidity) as max_humidity
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    WHERE node_id = '{sensor_id}'
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {hours} HOUR)
    """

    try:
        query_job = client.query(query)
        results = list(query_job.result())

        if not results or results[0].avg_temperature is None:
            raise HTTPException(status_code=404, detail="No data found for this period")

        row = results[0]
        return SensorStats(
            avg_temperature=row.avg_temperature,
            avg_humidity=row.avg_humidity,
            min_temperature=row.min_temperature,
            max_temperature=row.max_temperature,
            min_humidity=row.min_humidity,
            max_humidity=row.max_humidity,
        )
    except Exception as e:
        logger.error(f"Error fetching sensor stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@data_router.get("/recent", response_model=List[Dict])
async def get_recent_data(limit: int = Query(50, le=500)):
    """Get recent sensor readings with ML predictions"""
    query = f"""
    SELECT
        node_id,
        timestamp,
        temperature,
        humidity,
        prediction
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    ORDER BY timestamp DESC
    LIMIT {limit}
    """

    try:
        query_job = client.query(query)
        results = list(query_job.result())

        return [
            {
                "node_id": row.node_id,
                "timestamp": row.timestamp.isoformat(),
                "temperature": row.temperature,
                "humidity": row.humidity,
                "prediction": row.prediction if hasattr(row, 'prediction') else None,
            }
            for row in results
        ]
    except Exception as e:
        logger.error(f"Error fetching recent data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@data_router.get("/predict-anomaly/{sensor_id}")
async def predict_anomaly(sensor_id: str, lookback: int = Query(20, le=50)):
    import numpy as np
    import requests
    
    ML_PREDICT_URL = os.environ.get("ML_PREDICT_URL", "https://ml-predict-x6j3tvo2ca-ew.a.run.app")
    
    query = f"""
    SELECT temperature, humidity, timestamp
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    WHERE node_id = '{sensor_id}'
    ORDER BY timestamp DESC
    LIMIT {lookback}
    """
    
    try:
        query_job = client.query(query)
        results = list(query_job.result())
        
        if len(results) < 5:
            return {
                "sensor_id": sensor_id,
                "anomaly_predicted": False,
                "confidence": 0.0,
                "message": "Insufficient data"
            }
        
        results = results[::-1]
        temps = [r.temperature for r in results]
        hums = [r.humidity for r in results]
        
        temp_deltas = [temps[i] - temps[i-1] for i in range(1, len(temps))]
        hum_deltas = [hums[i] - hums[i-1] for i in range(1, len(hums))]
        
        avg_temp_delta = np.mean(temp_deltas) if temp_deltas else 0
        avg_hum_delta = np.mean(hum_deltas) if hum_deltas else 0
        
        steps_ahead = 5
        predicted_temp = temps[-1] + (avg_temp_delta * steps_ahead)
        predicted_hum = hums[-1] + (avg_hum_delta * steps_ahead)
        
        from datetime import datetime
        current_time = datetime.fromisoformat(str(results[-1].timestamp).replace('Z', '+00:00'))
        hour_of_day = current_time.hour
        day_of_week = current_time.weekday()
        
        temp_rolling_mean = np.mean(temps[-6:]) if len(temps) >= 6 else np.mean(temps)
        hum_rolling_mean = np.mean(hums[-6:]) if len(hums) >= 6 else np.mean(hums)
        
        features = [
            predicted_temp,
            predicted_hum,
            hour_of_day,
            day_of_week,
            avg_temp_delta,
            avg_hum_delta,
            temp_rolling_mean,
            hum_rolling_mean
        ]
        
        response = requests.post(
            f"{ML_PREDICT_URL}/predict",
            json={"instances": [features]},
            timeout=5
        )
        
        prediction = response.json()["predictions"][0]
        
        temp_change = abs(predicted_temp - temps[-1])
        hum_change = abs(predicted_hum - hums[-1])
        confidence = min(1.0, (temp_change + hum_change) / 10.0)
        
        return {
            "sensor_id": sensor_id,
            "anomaly_predicted": prediction == -1,
            "confidence": round(confidence, 2),
            "current_temp": round(temps[-1], 1),
            "current_humidity": round(hums[-1], 1),
            "predicted_temp": round(predicted_temp, 1),
            "predicted_humidity": round(predicted_hum, 1),
            "trend": {
                "temp_delta_per_reading": round(avg_temp_delta, 2),
                "humidity_delta_per_reading": round(avg_hum_delta, 2)
            },
            "message": "Anomaly predicted in next 5-10 seconds" if prediction == -1 else "Normal behavior expected"
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
