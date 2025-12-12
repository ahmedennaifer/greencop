from customers.api.routes.customer import customer_router
from customers.api.routes.server_room import server_room_router
from customers.api.routes.sensor import sensor_router
from customers.api.routes.data import data_router
from customers.api.routes.alert import alert_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customer_router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(
    server_room_router, prefix="/api/v1/server_rooms", tags=["server_rooms"]
)
app.include_router(sensor_router, prefix="/api/v1/sensors", tags=["sensors"])
app.include_router(data_router, prefix="/api/v1/data", tags=["data"])
app.include_router(alert_router, prefix="/api/v1/alerts", tags=["alerts"])


@app.get("/health")
async def health():
    return {"status": "OK"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
