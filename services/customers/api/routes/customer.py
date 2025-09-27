from __future__ import annotations
import logging

from customers.api.utils import auth, hashing
from customers.database.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from customers.database.models.customer import Customer
from customers.api.schemas import customer as customer_schema

customer_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@customer_router.post("/register", response_model=customer_schema.Customer)
async def register_customer(
    customer: customer_schema.CustomerCreate, db: Session = Depends(get_db)
):
    existing_customer = (
        db.query(Customer).filter(Customer.email == customer.email).first()
    )
    if existing_customer:
        logger.warning(f"Registration attempt for existing email: {customer.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hashing.hash_password(customer.password)
    db_customer = Customer(
        email=customer.email, password_hash=hashed_password, username=customer.username
    )
    try:
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        logger.info(f"Customer registered: {customer.email}")
        return db_customer
    except Exception as e:
        logger.error(
            f"Error registring customer: {db_customer.id}:{db_customer.email} to db"
        )
        db.rollback()
        raise HTTPException(
            status_code=401, detail=f"Error registering customer to db: {e}"
        )


@customer_router.post("/login")
async def login(customer: customer_schema.CustomerLogin, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.email == customer.email).first()
    if not db_customer or not hashing.verify_password(
        customer.password,
        db_customer.password_hash,  # pyright: ignore
    ):
        logger.warning(f"Failed login attempt for: {customer.email}")
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": db_customer.email})
    logger.info(f"Customer logged in: {customer.email}")
    return {"access_token": access_token, "token_type": "bearer"}


@customer_router.post("/info/{customer_id}")
async def get_customer_info_by_id(customer_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Fetching info for customer id: {id}")
    try:
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not db_customer:
            logger.error(f"Customer with id: {customer_id} not found")
            raise HTTPException(
                status_code=404, detail=f"Customer with id: {customer_id} not found"
            )

        logger.debug(f"Fetched customer: {db_customer}")
        return db_customer

    except Exception as e:
        logger.error(f"Error fetching customer by id: {e}")
        raise HTTPException(status_code=404, detail=f"Customer not found: {e}")
