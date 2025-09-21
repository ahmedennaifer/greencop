from customers.api.routes.customer import customer_router
from customers.api.routes.server_room import server_room_router
from fastapi import FastAPI

app = FastAPI()


app.include_router(customer_router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(
    server_room_router, prefix="/api/v1/server_rooms", tags=["server_rooms"]
)


@app.get("/health")
async def health():
    return {"status": "OK"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
