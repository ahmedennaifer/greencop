import os

# Override DB_URL for tests before importing anything else
os.environ["DB_URL"] = "sqlite:///./test.db"

import pytest
from customers.database.session import Base, get_db
from fastapi.testclient import TestClient
from customers.main import app
from customers.database.models.sensor import Sensor
from customers.database.models.server_room import ServerRoom
from customers.database.models.customer import Customer
from customers.api.utils import hashing
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_customer():
    db = TestingSessionLocal()
    hashed_password = hashing.hash_password("password123")
    customer = Customer(
        email="test@example.com",
        username="testuser123",
        password_hash=hashed_password,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    db.close()
    return customer


@pytest.fixture
def sample_room(sample_customer):
    db = TestingSessionLocal()
    room = ServerRoom(name="Test Room", customer_id=sample_customer.id)
    db.add(room)
    db.commit()
    db.refresh(room)
    db.close()
    return room


@pytest.fixture
def sample_sensor_data(sample_room):
    return {
        "name": "Temperature Sensor",
        "type": "temperature",
        "room_id": sample_room.id,
    }


class TestSensorCrud:
    def test_create_sensor_success(self, sample_sensor_data):
        response = client.post("api/v1/sensors/new_sensor", json=sample_sensor_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sample_sensor_data["name"]
        assert data["type"] == sample_sensor_data["type"]
        assert data["room_id"] == sample_sensor_data["room_id"]
        assert "id" in data

    def test_create_duplicate_sensor(self, sample_sensor_data):
        client.post("api/v1/sensors/new_sensor", json=sample_sensor_data)

        response = client.post("api/v1/sensors/new_sensor", json=sample_sensor_data)
        assert response.status_code == 400
        assert response.json()["detail"] == "Sensor already exists in this room"

    def test_get_sensor_success(self, sample_sensor_data):
        create_response = client.post(
            "api/v1/sensors/new_sensor", json=sample_sensor_data
        )
        sensor_id = create_response.json()["id"]

        response = client.get(f"api/v1/sensors/sensor/{sensor_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_id
        assert data["name"] == sample_sensor_data["name"]

    def test_get_nonexistent_sensor(self):
        response = client.get("api/v1/sensors/sensor/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Sensor not found"

    def test_list_sensors_by_room(self, sample_sensor_data, sample_room):
        client.post("api/v1/sensors/new_sensor", json=sample_sensor_data)

        response = client.get(f"api/v1/sensors/list_sensors/{sample_room.id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == sample_sensor_data["name"]

    def test_update_sensor_success(self, sample_sensor_data):
        create_response = client.post(
            "api/v1/sensors/new_sensor", json=sample_sensor_data
        )
        sensor_id = create_response.json()["id"]

        updated_data = sample_sensor_data.copy()
        updated_data["name"] = "Updated Sensor"

        response = client.put(
            f"api/v1/sensors/update_sensor/{sensor_id}", json=updated_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Sensor"

    def test_update_nonexistent_sensor(self, sample_sensor_data):
        response = client.put(
            "api/v1/sensors/update_sensor/999", json=sample_sensor_data
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Sensor not found"

    def test_delete_sensor_success(self, sample_sensor_data):
        create_response = client.post(
            "api/v1/sensors/new_sensor", json=sample_sensor_data
        )
        sensor_id = create_response.json()["id"]

        response = client.delete(f"api/v1/sensors/delete_sensor/{sensor_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "Sensor deleted successfully"

    def test_delete_nonexistent_sensor(self):
        response = client.delete("api/v1/sensors/delete_sensor/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Sensor not found"
