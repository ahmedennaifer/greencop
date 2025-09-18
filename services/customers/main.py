from api.routes import customer
from fastapi import FastAPI

app = FastAPI()

app.include_router(customer.router, prefix="/customers", tags=["customers"])


@app.get("/health")
async def health():
    return {"status": "OK"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
