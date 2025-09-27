import os

# Override DB_URL for tests before importing anything else
os.environ["DB_URL"] = "sqlite:///./test.db"

import pytest
from customers.database.session import Base, get_db
from fastapi.testclient import TestClient
from customers.main import app
from customers.database.models.server_room import ServerRoom
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()  # pyright: ignore


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create and clean up test database for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_server_room_data():
    """Sample server room data for testing."""

    return {"name": "test server room", "customer_id": 1}


@pytest.fixture
def sample_server_room_data_2():
    """Sample server room data for testing."""

    return {"name": "test server room 2", "customer_id": 1}


@pytest.fixture
def sample_customer_data():
    """Sample customer data for testing."""

    return {
        "email": "test@example.com",
        "username": "testuser123",
        "password": "password123",
    }


class TestServerRooms:
    def test_create_server_room(self, sample_server_room_data):
        create_server_room_response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        assert create_server_room_response.status_code == 200
        db = TestingSessionLocal()
        existing_server_room = (
            db.query(ServerRoom)
            .filter(
                ServerRoom.name == sample_server_room_data["name"]
                and ServerRoom.customer_id == sample_server_room_data["customer_id"]
            )
            .first()
        )
        assert existing_server_room is not None

    def test_create_duplicate_server_room(self, sample_server_room_data):
        client.post("api/v1/server_rooms/new_room", json=sample_server_room_data)

        response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Room already exists for customer"

    def test_get_server_room_success(self, sample_server_room_data):
        create_response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        room_id = create_response.json()["id"]

        response = client.get(f"api/v1/server_rooms/room/{room_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == room_id
        assert data["name"] == sample_server_room_data["name"]

    def test_get_nonexistent_server_room(self):
        response = client.get("api/v1/server_rooms/room/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Server room not found"

    def test_list_server_rooms(
        self,
        sample_customer_data,
        sample_server_room_data,
        sample_server_room_data_2,
    ):
        create_client_response = client.post(
            "api/v1/customers/register", json=sample_customer_data
        )
        assert create_client_response.status_code == 200
        create_server_room_response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        assert create_server_room_response.status_code == 200

        create_server_room_response_2 = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data_2
        )
        assert create_server_room_response_2.status_code == 200

        existing_server_rooms_request = client.get("api/v1/server_rooms/list_rooms/1")
        assert existing_server_rooms_request.status_code == 200
        assert len(existing_server_rooms_request.json()) == 2

    def test_list_server_room_by_id(
        self,
        sample_customer_data,
        sample_server_room_data,
    ):
        create_client_response = client.post(
            "api/v1/customers/register", json=sample_customer_data
        )
        assert create_client_response.status_code == 200
        create_server_room_response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        assert create_server_room_response.status_code == 200

        existing_server_room_request = client.get(
            "api/v1/server_rooms/list_room_by_id/1"
        )

        assert existing_server_room_request.status_code == 200
        assert existing_server_room_request.json()["id"] == 1

    def test_update_server_room_success(self, sample_server_room_data):
        create_response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        room_id = create_response.json()["id"]

        updated_data = sample_server_room_data.copy()
        updated_data["name"] = "Updated Room"

        response = client.put(
            f"api/v1/server_rooms/update_room/{room_id}", json=updated_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Room"

    def test_update_nonexistent_server_room(self, sample_server_room_data):
        response = client.put(
            "api/v1/server_rooms/update_room/999", json=sample_server_room_data
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Server room not found"

    def test_delete_server_room_success(self, sample_server_room_data):
        create_response = client.post(
            "api/v1/server_rooms/new_room", json=sample_server_room_data
        )
        room_id = create_response.json()["id"]

        response = client.delete(f"api/v1/server_rooms/delete_room/{room_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "Server room deleted successfully"

    def test_delete_nonexistent_server_room(self):
        response = client.delete("api/v1/server_rooms/delete_room/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Server room not found"
