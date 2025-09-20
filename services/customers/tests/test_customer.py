import json
from unittest.mock import patch

import pytest
from customers.api.utils import hashing
from customers.database.session import Base, get_db
from fastapi.testclient import TestClient
from customers.main import app
from customers.database.models.customer import Customer
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
def sample_customer_data():
    """Sample customer data for testing."""

    return {
        "email": "test@example.com",
        "username": "testuser123",
        "rooms": [0],
        "password": "password123",
    }


@pytest.fixture
def existing_customer(sample_customer_data):
    """Create an existing customer in the database."""
    db = TestingSessionLocal()
    hashed_password = hashing.hash_password(sample_customer_data["password"])
    customer = Customer(
        email=sample_customer_data["email"],
        username=sample_customer_data["username"],
        password_hash=hashed_password,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    db.close()
    return customer


class TestCustomerRegistration:
    """Test cases for customer registration endpoint."""

    def test_register_customer_success(self, sample_customer_data):
        """Test successful customer registration."""
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == sample_customer_data["email"]
        assert data["username"] == sample_customer_data["username"]
        assert "id" in data
        assert "password" not in data  # Password should not be in response

    def test_register_duplicate_email(self, existing_customer, sample_customer_data):
        """Test registration with duplicate email should fail."""
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 400
        assert response.json()["detail"] == "Email already registered"

    def test_register_invalid_email(self, sample_customer_data):
        """Test registration with invalid email format."""
        sample_customer_data["email"] = "invalid-email"
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 422  # Validation error

    def test_register_short_username(self, sample_customer_data):
        """Test registration with username too short."""
        sample_customer_data["username"] = "short"  # Less than 6 characters
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 422
        error_detail = response.json()["detail"][0]
        assert "Username must be between 6 and 12 caracters" in error_detail["msg"]

    def test_register_long_username(self, sample_customer_data):
        """Test registration with username too long."""
        sample_customer_data["username"] = "verylongusername"  # More than 12 characters
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 422
        error_detail = response.json()["detail"][0]
        assert "Username must be between 6 and 12 caracters" in error_detail["msg"]

    def test_register_weak_password_only_numbers(self, sample_customer_data):
        """Test registration with password containing only numbers."""
        sample_customer_data["password"] = "123456789"
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 422
        error_detail = response.json()["detail"][0]
        assert "Password must be a mix of nums and letters" in error_detail["msg"]

    def test_register_weak_password_only_letters(self, sample_customer_data):
        """Test registration with password containing only letters."""
        sample_customer_data["password"] = "onlyletters"
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 422
        error_detail = response.json()["detail"][0]
        assert "Password must be a mix of nums and letters" in error_detail["msg"]

    def test_register_short_password(self, sample_customer_data):
        """Test registration with password too short."""
        sample_customer_data["password"] = "short1"  # Less than 8 characters
        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 422
        error_detail = response.json()["detail"][0]
        assert "Password must be a mix of nums and letters" in error_detail["msg"]

    def test_register_missing_fields(self):
        """Test registration with missing required fields."""
        incomplete_data = {"email": "test@example.com"}
        response = client.post("api/v1/customers/register", json=incomplete_data)

        assert response.status_code == 422

    def test_register_empty_request(self):
        """Test registration with empty request body."""
        response = client.post("api/v1/customers/register", json={})

        assert response.status_code == 422


class TestCustomerLogin:
    """Test cases for customer login endpoint."""

    def test_login_success(self, existing_customer, sample_customer_data):
        """Test successful customer login."""
        login_data = {
            "email": sample_customer_data["email"],
            "password": sample_customer_data["password"],
        }
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # Verify the token is valid
        token = data["access_token"]
        assert isinstance(token, str)
        assert len(token) > 0

    def test_login_wrong_password(self, existing_customer, sample_customer_data):
        """Test login with incorrect password."""
        login_data = {
            "email": sample_customer_data["email"],
            "password": "wrongpassword123",
        }
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    def test_login_nonexistent_user(self):
        """Test login with non-existent email."""
        login_data = {"email": "nonexistent@example.com", "password": "password123"}
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    def test_login_invalid_email_format(self):
        """Test login with invalid email format."""
        login_data = {"email": "invalid-email", "password": "password123"}
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 422  # Validation error

    def test_login_missing_email(self):
        """Test login with missing email field."""
        login_data = {"password": "password123"}
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 422

    def test_login_missing_password(self):
        """Test login with missing password field."""
        login_data = {"email": "test@example.com"}
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 422

    def test_login_empty_credentials(self):
        """Test login with empty credentials."""
        login_data = {"email": "", "password": ""}
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 422


class TestTokenGeneration:
    """Test cases for token generation and validation."""

    def test_token_contains_correct_data(self, existing_customer, sample_customer_data):
        """Test that generated token contains correct user data."""
        login_data = {
            "email": sample_customer_data["email"],
            "password": sample_customer_data["password"],
        }
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 200
        token = response.json()["access_token"]

        import os

        from jose import jwt

        SECRET_KEY = os.environ.get("SECRET_KEY", "a_very_secret_key")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        assert payload["sub"] == sample_customer_data["email"]

    @patch("customers.api.utils.auth.create_access_token")
    def test_token_creation_called(
        self, mock_create_token, existing_customer, sample_customer_data
    ):
        """Test that token creation function is called during login."""
        mock_create_token.return_value = "mock_token"

        login_data = {
            "email": sample_customer_data["email"],
            "password": sample_customer_data["password"],
        }
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 200
        mock_create_token.assert_called_once_with(
            data={"sub": sample_customer_data["email"]}
        )


class TestPasswordHashing:
    """Test cases for password hashing functionality."""

    @patch("customers.api.utils.hashing.hash_password")
    def test_password_hashed_during_registration(self, mock_hash, sample_customer_data):
        """Test that password is hashed during registration."""
        mock_hash.return_value = "hashed_password"

        response = client.post("api/v1/customers/register", json=sample_customer_data)

        assert response.status_code == 200
        mock_hash.assert_called_once_with(sample_customer_data["password"])

    @patch("customers.api.utils.hashing.verify_password")
    def test_password_verified_during_login(
        self, mock_verify, existing_customer, sample_customer_data
    ):
        """Test that password verification is called during login."""
        mock_verify.return_value = True

        login_data = {
            "email": sample_customer_data["email"],
            "password": sample_customer_data["password"],
        }
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 200
        mock_verify.assert_called_once()


class TestDatabaseInteraction:
    """Test cases for database interactions."""

    def test_customer_saved_to_database(self, sample_customer_data):
        """Test that customer is actually saved to database after registration."""
        response = client.post("api/v1/customers/register", json=sample_customer_data)
        assert response.status_code == 200

        # Check if customer exists in database
        db = TestingSessionLocal()
        customer = (
            db.query(Customer)
            .filter(Customer.email == sample_customer_data["email"])
            .first()
        )
        assert customer is not None
        assert customer.username == sample_customer_data["username"]
        assert customer.email == sample_customer_data["email"]
        db.close()

    def test_database_query_during_login(self, existing_customer, sample_customer_data):
        """Test that database is queried correctly during login."""
        login_data = {
            "email": sample_customer_data["email"],
            "password": sample_customer_data["password"],
        }
        response = client.post("api/v1/customers/login", json=login_data)

        assert response.status_code == 200
        # If we get here, the database query worked correctly


class TestErrorHandling:
    """Test cases for error handling and edge cases."""

    def test_malformed_json_registration(self):
        """Test registration with malformed JSON."""
        response = client.post(
            "api/v1/customers/register",
            data="invalid json",
            headers={"content-type": "application/json"},
        )
        assert response.status_code == 422

    def test_malformed_json_login(self):
        """Test login with malformed JSON."""
        response = client.post(
            "api/v1/customers/login",
            data="invalid json",
            headers={"content-type": "application/json"},
        )
        assert response.status_code == 422

    def test_content_type_not_json(self, sample_customer_data):
        """Test endpoints with wrong content type."""
        response = client.post(
            "api/v1/customers/register",
            data=json.dumps(sample_customer_data),
            headers={"content-type": "text/plain"},
        )
        assert response.status_code == 422


class TestCustomerInfo:
    """Tests info getters"""

    def test_customer_get_info_by_id(self, sample_customer_data):
        register_response = client.post(
            "api/v1/customers/register",
            json=sample_customer_data,
        )
        assert register_response.status_code == 200

        customer = Customer(**register_response.json())

        response = client.post(f"api/v1/customers/info/{customer.id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == customer.id
        assert data["email"] == sample_customer_data["email"]
        assert data["username"] == sample_customer_data["username"]


# Integration tests
class TestIntegration:
    """Integration tests for complete registration and login flow."""

    def test_register_then_login_flow(self, sample_customer_data):
        """Test complete flow: register a customer then login."""
        # Register customer
        register_response = client.post(
            "api/v1/customers/register", json=sample_customer_data
        )
        assert register_response.status_code == 200

        # Login with same credentials
        login_data = {
            "email": sample_customer_data["email"],
            "password": sample_customer_data["password"],
        }
        login_response = client.post("api/v1/customers/login", json=login_data)
        assert login_response.status_code == 200

        # Verify token is returned
        token_data = login_response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"

    def test_multiple_customers_registration(self):
        """Test registering multiple customers with different data."""
        customers = [
            {
                "email": "user1@example.com",
                "username": "user123",
                "password": "password123",
            },
            {
                "email": "user2@example.com",
                "username": "user456",
                "password": "password456",
            },
            {
                "email": "user3@example.com",
                "username": "user789",
                "password": "password789",
            },
        ]

        for customer_data in customers:
            response = client.post("api/v1/customers/register", json=customer_data)
            assert response.status_code == 200

            # Verify each can login
            login_data = {
                "email": customer_data["email"],
                "password": customer_data["password"],
            }
            login_response = client.post("api/v1/customers/login", json=login_data)
            assert login_response.status_code == 200
