import os
from typing import Annotated, TypedDict, List
from datetime import datetime
import re
from io import StringIO

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from google.cloud import bigquery
import requests
from tabulate import tabulate

load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID", "atomic-climate-482314-q7")
LOCATION = os.getenv("LOCATION", "us-central1")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")

bq_client = bigquery.Client(project=PROJECT_ID)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@tool
def get_sensor_stats(sensor_id: str, hours: int = 24) -> dict:
    """Get statistical summary of sensor data including temperature and humidity averages, min, max, and standard deviation."""
    query = f"""
    SELECT
        AVG(temperature) as avg_temp,
        MIN(temperature) as min_temp,
        MAX(temperature) as max_temp,
        STDDEV(temperature) as stddev_temp,
        AVG(humidity) as avg_humidity,
        MIN(humidity) as min_humidity,
        MAX(humidity) as max_humidity,
        STDDEV(humidity) as stddev_humidity,
        COUNT(*) as reading_count
    FROM `{PROJECT_ID}.sensor_data.readings`
    WHERE node_id = '{sensor_id}'
    AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {hours} HOUR)
    """

    try:
        query_job = bq_client.query(query)
        results = list(query_job.result())

        if results:
            row = results[0]
            return {
                "temperature": {
                    "avg": round(float(row.avg_temp or 0), 2),
                    "min": round(float(row.min_temp or 0), 2),
                    "max": round(float(row.max_temp or 0), 2),
                    "stddev": round(float(row.stddev_temp or 0), 2),
                },
                "humidity": {
                    "avg": round(float(row.avg_humidity or 0), 2),
                    "min": round(float(row.min_humidity or 0), 2),
                    "max": round(float(row.max_humidity or 0), 2),
                    "stddev": round(float(row.stddev_humidity or 0), 2),
                },
                "reading_count": int(row.reading_count or 0),
                "time_range_hours": hours,
            }
        return {"error": "No data found"}
    except Exception as e:
        return {"error": str(e)}


@tool
def get_sensor_readings(sensor_id: str, hours: int = 24, limit: int = 100) -> dict:
    """Get recent sensor readings with timestamps, temperature, and humidity values."""
    query = f"""
    SELECT
        node_id,
        timestamp,
        temperature,
        humidity
    FROM `{PROJECT_ID}.sensor_data.readings`
    WHERE node_id = '{sensor_id}'
    AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {hours} HOUR)
    ORDER BY timestamp DESC
    LIMIT {limit}
    """

    try:
        query_job = bq_client.query(query)
        results = query_job.result()

        data = []
        for row in results:
            data.append({
                "sensor_id": row.node_id,
                "timestamp": row.timestamp.isoformat(),
                "temperature": float(row.temperature),
                "humidity": float(row.humidity)
            })

        return {"data": data, "count": len(data)}
    except Exception as e:
        return {"error": str(e)}


@tool
def list_all_sensors() -> dict:
    """Get list of all active sensor IDs from the last 7 days."""
    query = f"""
    SELECT DISTINCT node_id
    FROM `{PROJECT_ID}.sensor_data.readings`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
    ORDER BY node_id
    """

    try:
        query_job = bq_client.query(query)
        results = query_job.result()
        sensors = [row.node_id for row in results]
        return {"sensors": sensors, "count": len(sensors)}
    except Exception as e:
        return {"error": str(e)}


@tool
def get_active_alerts() -> dict:
    """Get recent alerts where temperature exceeds 30°C or humidity exceeds 70%."""
    query = f"""
    SELECT
        node_id,
        timestamp,
        temperature,
        humidity
    FROM `{PROJECT_ID}.sensor_data.readings`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
    AND (temperature > 30 OR humidity > 70)
    ORDER BY timestamp DESC
    LIMIT 20
    """

    try:
        query_job = bq_client.query(query)
        results = query_job.result()

        alerts = []
        for row in results:
            alerts.append(
                {
                    "sensor_id": row.node_id,
                    "timestamp": row.timestamp.isoformat(),
                    "temperature": float(row.temperature),
                    "humidity": float(row.humidity),
                }
            )

        return {"alerts": alerts, "count": len(alerts)}
    except Exception as e:
        return {"error": str(e)}


@tool
def generate_green_it_recommendations(sensor_id: str, hours: int = 168) -> dict:
    """Generate Green IT energy efficiency recommendations based on sensor data. Analyzes temperature and humidity patterns."""
    stats = get_sensor_stats.invoke({"sensor_id": sensor_id, "hours": hours})

    if "error" in stats:
        return {"error": stats["error"]}

    recommendations = []

    avg_temp = stats["temperature"]["avg"]
    avg_humidity = stats["humidity"]["avg"]
    temp_stddev = stats["temperature"]["stddev"]

    if avg_temp > 27:
        recommendations.append(
            f"High Temperature: Average {avg_temp}°C exceeds recommended 27°C. Improve cooling efficiency. Every 1°C reduction saves 2-5% on cooling costs."
        )
    elif avg_temp < 18:
        recommendations.append(
            f"Over-Cooling: Average {avg_temp}°C is below 18°C. You're wasting energy. ASHRAE recommends 18-27°C."
        )

    if avg_humidity > 60:
        recommendations.append(
            f"High Humidity: {avg_humidity}% exceeds 60%. Risk of condensation and equipment damage."
        )
    elif avg_humidity < 40:
        recommendations.append(
            f"Low Humidity: {avg_humidity}% is below 40%. Risk of static discharge. Target 40-60%."
        )

    if temp_stddev > 2:
        recommendations.append(
            f"Temperature Instability: High variance (σ={temp_stddev:.2f}°C) reduces equipment lifespan."
        )

    if not recommendations:
        recommendations.append(
            "Optimal Conditions: Environment is within Green IT standards (18-27°C, 40-60% RH)."
        )

    return {"sensor_id": sensor_id, "stats": stats, "recommendations": recommendations}


@tool
def audit_ashrae_compliance(sensor_id: str, hours: int = 168) -> dict:
    """Audit compliance with ASHRAE TC 9.9 data center environmental standards. Returns compliance score and violations."""
    stats = get_sensor_stats.invoke({"sensor_id": sensor_id, "hours": hours})

    if "error" in stats:
        return {"error": stats["error"]}

    violations = []
    compliance_score = 100

    temp_avg = stats["temperature"]["avg"]
    temp_min = stats["temperature"]["min"]
    temp_max = stats["temperature"]["max"]
    humidity_avg = stats["humidity"]["avg"]
    humidity_min = stats["humidity"]["min"]
    humidity_max = stats["humidity"]["max"]

    if temp_avg < 18 or temp_avg > 27:
        violations.append(
            f"ASHRAE A1 Class Violation: Recommended temp 18-27°C, actual avg {temp_avg}°C"
        )
        compliance_score -= 25

    if temp_min < 15:
        violations.append(
            f"ASHRAE A1 Allowable Min Violation: Min temp {temp_min}°C below 15°C limit"
        )
        compliance_score -= 15

    if temp_max > 32:
        violations.append(
            f"ASHRAE A1 Allowable Max Violation: Max temp {temp_max}°C exceeds 32°C limit"
        )
        compliance_score -= 20

    if humidity_avg < 40 or humidity_avg > 60:
        violations.append(
            f"ASHRAE Recommended Humidity Violation: 40-60% RH recommended, actual avg {humidity_avg}%"
        )
        compliance_score -= 20

    if humidity_min < 20:
        violations.append(
            f"ASHRAE A1 Humidity Min Violation: Min {humidity_min}% below 20% limit (static risk)"
        )
        compliance_score -= 10

    if humidity_max > 80:
        violations.append(
            f"ASHRAE A1 Humidity Max Violation: Max {humidity_max}% exceeds 80% limit (condensation risk)"
        )
        compliance_score -= 10

    compliance_level = (
        "EXCELLENT"
        if compliance_score >= 90
        else "GOOD"
        if compliance_score >= 70
        else "MARGINAL"
        if compliance_score >= 50
        else "POOR"
    )

    return {
        "sensor_id": sensor_id,
        "standard": "ASHRAE TC 9.9 (A1 Class)",
        "compliance_score": max(0, compliance_score),
        "compliance_level": compliance_level,
        "violations": violations if violations else ["No violations - Full compliance"],
        "stats": stats,
    }


@tool
def calculate_cooling_efficiency(sensor_id: str, hours: int = 168) -> dict:
    """Calculate cooling efficiency metrics and estimate potential energy savings based on temperature data."""
    stats = get_sensor_stats.invoke({"sensor_id": sensor_id, "hours": hours})

    if "error" in stats:
        return {"error": stats["error"]}

    avg_temp = stats["temperature"]["avg"]
    temp_range = stats["temperature"]["max"] - stats["temperature"]["min"]

    optimal_temp = 22.0
    temp_deviation = abs(avg_temp - optimal_temp)

    energy_waste_percent = temp_deviation * 2.5

    potential_savings_percent = 0
    if avg_temp < 18:
        potential_savings_percent = (18 - avg_temp) * 3.5
    elif avg_temp > 27:
        potential_savings_percent = (avg_temp - 27) * 2.0

    efficiency_rating = (
        "EXCELLENT"
        if temp_deviation < 1
        else "GOOD"
        if temp_deviation < 3
        else "FAIR"
        if temp_deviation < 5
        else "POOR"
    )

    stability_rating = (
        "STABLE" if temp_range < 3 else "MODERATE" if temp_range < 5 else "UNSTABLE"
    )

    return {
        "sensor_id": sensor_id,
        "optimal_temperature": optimal_temp,
        "current_avg_temperature": avg_temp,
        "deviation_from_optimal": round(temp_deviation, 2),
        "temperature_range": round(temp_range, 2),
        "energy_waste_estimate_percent": round(energy_waste_percent, 1),
        "potential_savings_percent": round(potential_savings_percent, 1),
        "efficiency_rating": efficiency_rating,
        "stability_rating": stability_rating,
        "time_range_hours": hours,
    }


@tool
def analyze_environmental_stability(sensor_id: str, hours: int = 168) -> dict:
    """Analyze environmental stability and predict equipment impact. High variance reduces hardware lifespan."""
    stats = get_sensor_stats.invoke({"sensor_id": sensor_id, "hours": hours})

    if "error" in stats:
        return {"error": stats["error"]}

    temp_stddev = stats["temperature"]["stddev"]
    humidity_stddev = stats["humidity"]["stddev"]
    temp_range = stats["temperature"]["max"] - stats["temperature"]["min"]
    humidity_range = stats["humidity"]["max"] - stats["humidity"]["min"]

    stability_score = 100
    issues = []

    if temp_stddev > 3:
        stability_score -= 30
        issues.append(
            f"High temperature variance (σ={temp_stddev:.2f}°C) causes thermal cycling stress on components"
        )
    elif temp_stddev > 2:
        stability_score -= 15
        issues.append(
            f"Moderate temperature variance (σ={temp_stddev:.2f}°C) may reduce equipment lifespan by 10-15%"
        )

    if humidity_stddev > 15:
        stability_score -= 25
        issues.append(
            f"High humidity variance (σ={humidity_stddev:.2f}%) increases corrosion risk"
        )
    elif humidity_stddev > 10:
        stability_score -= 10
        issues.append(f"Moderate humidity variance (σ={humidity_stddev:.2f}%) detected")

    if temp_range > 10:
        stability_score -= 20
        issues.append(
            f"Extreme temperature swings ({temp_range:.1f}°C range) accelerate hardware degradation"
        )

    if humidity_range > 30:
        stability_score -= 15
        issues.append(
            f"Large humidity fluctuations ({humidity_range:.1f}% range) detected"
        )

    lifespan_impact = (
        "MINIMAL"
        if stability_score >= 90
        else "MODERATE"
        if stability_score >= 70
        else "SIGNIFICANT"
        if stability_score >= 50
        else "SEVERE"
    )

    return {
        "sensor_id": sensor_id,
        "stability_score": max(0, stability_score),
        "temperature_stddev": round(temp_stddev, 2),
        "humidity_stddev": round(humidity_stddev, 2),
        "temperature_range": round(temp_range, 2),
        "humidity_range": round(humidity_range, 2),
        "lifespan_impact": lifespan_impact,
        "issues": issues
        if issues
        else ["Stable environment - No significant variance detected"],
        "time_range_hours": hours,
    }


@tool
def estimate_carbon_footprint(sensor_id: str, hours: int = 168) -> dict:
    """Estimate CO2 emissions from cooling inefficiency. Based on temperature deviation from optimal 22°C."""
    stats = get_sensor_stats.invoke({"sensor_id": sensor_id, "hours": hours})

    if "error" in stats:
        return {"error": stats["error"]}

    avg_temp = stats["temperature"]["avg"]
    optimal_temp = 22.0

    temp_deviation = abs(avg_temp - optimal_temp)

    avg_cooling_power_kw = 5.0

    hours_in_period = hours
    base_energy_kwh = avg_cooling_power_kw * hours_in_period

    waste_multiplier = 1 + (temp_deviation * 0.025)
    actual_energy_kwh = base_energy_kwh * waste_multiplier
    wasted_energy_kwh = actual_energy_kwh - base_energy_kwh

    co2_per_kwh_kg = 0.475

    base_co2_kg = base_energy_kwh * co2_per_kwh_kg
    actual_co2_kg = actual_energy_kwh * co2_per_kwh_kg
    excess_co2_kg = wasted_energy_kwh * co2_per_kwh_kg

    annual_excess_co2_kg = excess_co2_kg * (8760 / hours_in_period)

    trees_to_offset = annual_excess_co2_kg / 21.77

    return {
        "sensor_id": sensor_id,
        "measurement_period_hours": hours,
        "avg_temperature": avg_temp,
        "optimal_temperature": optimal_temp,
        "temperature_deviation": round(temp_deviation, 2),
        "estimated_cooling_power_kw": avg_cooling_power_kw,
        "base_energy_consumption_kwh": round(base_energy_kwh, 2),
        "actual_energy_consumption_kwh": round(actual_energy_kwh, 2),
        "wasted_energy_kwh": round(wasted_energy_kwh, 2),
        "base_co2_emissions_kg": round(base_co2_kg, 2),
        "actual_co2_emissions_kg": round(actual_co2_kg, 2),
        "excess_co2_emissions_kg": round(excess_co2_kg, 2),
        "annual_excess_co2_kg": round(annual_excess_co2_kg, 2),
        "trees_needed_to_offset_annual": round(trees_to_offset, 1),
        "co2_per_kwh_kg": co2_per_kwh_kg,
    }


tools = [
    get_sensor_stats,
    get_sensor_readings,
    list_all_sensors,
    get_active_alerts,
    generate_green_it_recommendations,
    audit_ashrae_compliance,
    calculate_cooling_efficiency,
    analyze_environmental_stability,
    estimate_carbon_footprint,
]

llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview", project=PROJECT_ID, temperature=1.0
)

llm_with_tools = llm.bind_tools(tools)


def should_continue(state: MessagesState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END


def call_model(state: MessagesState):
    system_prompt = SystemMessage(
        content="""You are a direct, helpful AI assistant for GreenCop IoT monitoring.

CRITICAL: When tools return JSON data, format sensor readings as HTML tables.

Example tool output:
{"data": [{"sensor_id": "abc", "timestamp": "2024-01-15T10:30:00", "temperature": 22.5, "humidity": 45.2}], "count": 1}

Your response MUST use this exact HTML format:
<table border="1" style="border-collapse: collapse; width: 100%; text-align: left;"><thead><tr><th style="padding: 8px; border: 1px solid black;">Time</th><th style="padding: 8px; border: 1px solid black;">Temperature (°C)</th><th style="padding: 8px; border: 1px solid black;">Humidity (%)</th></tr></thead><tbody><tr><td style="padding: 8px; border: 1px solid black;">10:30:00</td><td style="padding: 8px; border: 1px solid black;">22.5</td><td style="padding: 8px; border: 1px solid black;">45.2</td></tr></tbody></table>

NO spaces between columns. Use inline styles on every th and td element. Be direct."""
    )

    messages = [system_prompt] + state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


workflow = StateGraph(MessagesState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", END])
workflow.add_edge("tools", "agent")

memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        thread_id = "default"

        result = graph.invoke(
            {"messages": [HumanMessage(content=request.message)]},
            config={"configurable": {"thread_id": thread_id}},
        )

        last_message = result["messages"][-1]
        response_text = last_message.text if hasattr(last_message, 'text') else last_message.content

        return ChatResponse(response=response_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8081)
