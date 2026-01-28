"""
Invoice routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
import uuid
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    return f"INV-{uuid.uuid4().hex[:8].upper()}"

@router.post("/", response_model=schemas.InvoiceResponse)
def create_invoice(
    invoice_data: schemas.InvoiceCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new invoice"""
    # Get user's business
    business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please create one first."
        )
    
    # Create invoice
    invoice_number = generate_invoice_number()
    items_json = json.dumps([item.model_dump() for item in invoice_data.items])
    
    # Set default due date if not provided (30 days from issue date)
    issue_date = invoice_data.issue_date or datetime.utcnow()
    due_date = invoice_data.due_date or (issue_date + timedelta(days=30))
    
    db_invoice = models.Invoice(
        invoice_number=invoice_number,
        user_id=current_user.id,
        business_id=business.id,
        customer_name=invoice_data.customer_name,
        customer_email=invoice_data.customer_email,
        customer_phone=invoice_data.customer_phone,
        customer_address=invoice_data.customer_address,
        customer_tax_id=invoice_data.customer_tax_id,
        issue_date=issue_date,
        due_date=due_date,
        subtotal=invoice_data.subtotal,
        tax_rate=invoice_data.tax_rate,
        tax_amount=invoice_data.tax_amount,
        discount=invoice_data.discount,
        total=invoice_data.total,
        status=invoice_data.status or "pending",
        payment_terms=invoice_data.payment_terms,
        notes=invoice_data.notes,
        items_json=items_json
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Convert to response schema
    invoice_dict = {
        **{c.name: getattr(db_invoice, c.name) for c in db_invoice.__table__.columns},
        "items": json.loads(db_invoice.items_json)
    }
    return schemas.InvoiceResponse(**invoice_dict)

@router.get("/", response_model=List[schemas.InvoiceResponse])
def get_invoices(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invoices for current user"""
    invoices = db.query(models.Invoice).filter(models.Invoice.user_id == current_user.id).order_by(models.Invoice.created_at.desc()).all()
    
    result = []
    for invoice in invoices:
        invoice_dict = {
            **{c.name: getattr(invoice, c.name) for c in invoice.__table__.columns},
            "items": json.loads(invoice.items_json)
        }
        result.append(schemas.InvoiceResponse(**invoice_dict))
    
    return result

@router.get("/{invoice_id}", response_model=schemas.InvoiceResponse)
def get_invoice(
    invoice_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific invoice"""
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice_dict = {
        **{c.name: getattr(invoice, c.name) for c in invoice.__table__.columns},
        "items": json.loads(invoice.items_json)
    }
    return schemas.InvoiceResponse(**invoice_dict)

@router.patch("/{invoice_id}", response_model=schemas.InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_data: schemas.InvoiceUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Update an invoice"""
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Update fields
    for key, value in invoice_data.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    
    db.commit()
    db.refresh(invoice)
    
    invoice_dict = {
        **{c.name: getattr(invoice, c.name) for c in invoice.__table__.columns},
        "items": json.loads(invoice.items_json)
    }
    return schemas.InvoiceResponse(**invoice_dict)
