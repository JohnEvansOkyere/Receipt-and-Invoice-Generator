"""
Receipt routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
import uuid
from datetime import datetime
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

def generate_receipt_number() -> str:
    """Generate unique receipt number"""
    return f"RCP-{uuid.uuid4().hex[:8].upper()}"

@router.post("/", response_model=schemas.ReceiptResponse)
def create_receipt(
    receipt_data: schemas.ReceiptCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new receipt"""
    # Get user's business
    business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please create one first."
        )
    
    # Create receipt
    receipt_number = generate_receipt_number()
    items_json = json.dumps([item.model_dump() for item in receipt_data.items])
    
    db_receipt = models.Receipt(
        receipt_number=receipt_number,
        user_id=current_user.id,
        business_id=business.id,
        customer_name=receipt_data.customer_name,
        customer_email=receipt_data.customer_email,
        customer_phone=receipt_data.customer_phone,
        customer_address=receipt_data.customer_address,
        date=receipt_data.date or datetime.utcnow(),
        subtotal=receipt_data.subtotal,
        tax_rate=receipt_data.tax_rate,
        tax_amount=receipt_data.tax_amount,
        discount=receipt_data.discount,
        total=receipt_data.total,
        payment_method=receipt_data.payment_method,
        notes=receipt_data.notes,
        items_json=items_json
    )
    
    db.add(db_receipt)
    db.commit()
    db.refresh(db_receipt)
    
    # Convert to response schema
    receipt_dict = {
        **{c.name: getattr(db_receipt, c.name) for c in db_receipt.__table__.columns},
        "items": json.loads(db_receipt.items_json)
    }
    return schemas.ReceiptResponse(**receipt_dict)

@router.get("/", response_model=List[schemas.ReceiptResponse])
def get_receipts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all receipts for current user"""
    receipts = db.query(models.Receipt).filter(models.Receipt.user_id == current_user.id).order_by(models.Receipt.created_at.desc()).all()
    
    result = []
    for receipt in receipts:
        receipt_dict = {
            **{c.name: getattr(receipt, c.name) for c in receipt.__table__.columns},
            "items": json.loads(receipt.items_json)
        }
        result.append(schemas.ReceiptResponse(**receipt_dict))
    
    return result

@router.get("/{receipt_id}", response_model=schemas.ReceiptResponse)
def get_receipt(
    receipt_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific receipt"""
    receipt = db.query(models.Receipt).filter(
        models.Receipt.id == receipt_id,
        models.Receipt.user_id == current_user.id
    ).first()
    
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receipt not found"
        )
    
    receipt_dict = {
        **{c.name: getattr(receipt, c.name) for c in receipt.__table__.columns},
        "items": json.loads(receipt.items_json)
    }
    return schemas.ReceiptResponse(**receipt_dict)
