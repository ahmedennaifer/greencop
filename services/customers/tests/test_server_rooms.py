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

    return {"name": "test server room", "customer_id": "1"}


@pytest.fixture
def sample_server_room_data_2():
    """Sample server room data for testing."""

    return {"name": "test server room 2", "customer_id": "1"}


@pytest.fixture
def sample_server_room_data_info():
    """Sample server room data for testing."""
    return {"customer_id": "1"}


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

    def test_list_server_rooms(
        self,
        sample_customer_data,
        sample_server_room_data,
        sample_server_room_data_2,
        sample_server_room_data_info,
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
