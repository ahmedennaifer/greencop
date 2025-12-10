import os
import logging
from fastapi import APIRouter, HTTPException, Query
from google.cloud import bigquery
from datetime import datetime, timedelta
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
            humidity=row.humidity
        )
    except Exception as e:
        logger.error(f"Error fetching latest reading: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@data_router.get("/historical/{sensor_id}", response_model=List[SensorData])
async def get_historical_data(
    sensor_id: str,
    start_time: str = Query(...),
    end_time: str = Query(...)
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
                humidity=row.humidity
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
                humidity=row.humidity
            )

        return data_map
    except Exception as e:
        logger.error(f"Error fetching multi-sensor data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@data_router.get("/stats/{sensor_id}", response_model=SensorStats)
async def get_sensor_stats(
    sensor_id: str,
    period: str = Query("24h", regex="^(1h|24h|7d|30d)$")
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
            max_humidity=row.max_humidity
        )
    except Exception as e:
        logger.error(f"Error fetching sensor stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
