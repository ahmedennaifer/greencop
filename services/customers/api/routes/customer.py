import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...models.customer import Customer
from ..schemas import customer as customer_schema
from ..utils import auth, hashing

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", response_model=customer_schema.Customer)
def register_customer(
    customer: customer_schema.CustomerCreate, db: Session = Depends(get_db)
):
    db_customer = db.query(Customer).filter(Customer.email == customer.email).first()
    if db_customer:
        logger.warning(f"Registration attempt for existing email: {customer.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hashing.hash_password(customer.password)
    db_customer = Customer(
        email=customer.email, password_hash=hashed_password, username=customer.username
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    logger.info(f"Customer registered: {customer.email}")
    return db_customer


@router.post("/login")
def login(customer: customer_schema.CustomerLogin, db: Session = Depends(get_db)):
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
