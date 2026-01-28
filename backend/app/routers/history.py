"""
History and challenge routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.get("/", response_model=schemas.HistoryResponse)
def get_history(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all receipts and invoices for current user"""
    receipts = db.query(models.Receipt).filter(models.Receipt.user_id == current_user.id).order_by(models.Receipt.created_at.desc()).all()
    invoices = db.query(models.Invoice).filter(models.Invoice.user_id == current_user.id).order_by(models.Invoice.created_at.desc()).all()
    
    receipt_list = []
    for receipt in receipts:
        receipt_dict = {
            **{c.name: getattr(receipt, c.name) for c in receipt.__table__.columns},
            "items": json.loads(receipt.items_json)
        }
        receipt_list.append(schemas.ReceiptResponse(**receipt_dict))
    
    invoice_list = []
    for invoice in invoices:
        invoice_dict = {
            **{c.name: getattr(invoice, c.name) for c in invoice.__table__.columns},
            "items": json.loads(invoice.items_json)
        }
        invoice_list.append(schemas.InvoiceResponse(**invoice_dict))
    
    return schemas.HistoryResponse(receipts=receipt_list, invoices=invoice_list)

@router.post("/challenge", response_model=schemas.ChallengeResponse)
def create_challenge(
    challenge_data: schemas.ChallengeCreate,
    db: Session = Depends(get_db)
):
    """Create a challenge for a receipt or invoice"""
    # Validate that either receipt_id or invoice_id is provided
    if not challenge_data.receipt_id and not challenge_data.invoice_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either receipt_id or invoice_id must be provided"
        )
    
    # Verify receipt or invoice exists
    if challenge_data.receipt_id:
        receipt = db.query(models.Receipt).filter(models.Receipt.id == challenge_data.receipt_id).first()
        if not receipt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receipt not found"
            )
    
    if challenge_data.invoice_id:
        invoice = db.query(models.Invoice).filter(models.Invoice.id == challenge_data.invoice_id).first()
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
    
    # Create challenge
    db_challenge = models.Challenge(
        receipt_id=challenge_data.receipt_id,
        invoice_id=challenge_data.invoice_id,
        challenger_name=challenge_data.challenger_name,
        challenger_email=challenge_data.challenger_email,
        challenger_phone=challenge_data.challenger_phone,
        reason=challenge_data.reason
    )
    
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    
    return db_challenge

@router.get("/challenges", response_model=List[schemas.ChallengeResponse])
def get_challenges(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all challenges for current user's receipts and invoices"""
    # Get user's business
    business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    if not business:
        return []
    
    # Get challenges for receipts
    receipt_ids = [r.id for r in db.query(models.Receipt).filter(models.Receipt.business_id == business.id).all()]
    invoice_ids = [i.id for i in db.query(models.Invoice).filter(models.Invoice.business_id == business.id).all()]
    
    challenges = db.query(models.Challenge).filter(
        (models.Challenge.receipt_id.in_(receipt_ids)) | 
        (models.Challenge.invoice_id.in_(invoice_ids))
    ).order_by(models.Challenge.created_at.desc()).all()
    
    return challenges

@router.patch("/challenges/{challenge_id}", response_model=schemas.ChallengeResponse)
def resolve_challenge(
    challenge_id: int,
    resolution_notes: str,
    status: models.ChallengeStatus,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Resolve a challenge (only by the business owner)"""
    challenge = db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Verify user owns the receipt/invoice
    business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
    
    if challenge.receipt_id:
        receipt = db.query(models.Receipt).filter(
            models.Receipt.id == challenge.receipt_id,
            models.Receipt.business_id == business.id
        ).first()
        if not receipt:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized"
            )
    
    if challenge.invoice_id:
        invoice = db.query(models.Invoice).filter(
            models.Invoice.id == challenge.invoice_id,
            models.Invoice.business_id == business.id
        ).first()
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized"
            )
    
    # Update challenge
    challenge.status = status
    challenge.resolution_notes = resolution_notes
    if status != models.ChallengeStatus.PENDING:
        from datetime import datetime
        challenge.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(challenge)
    
    return challenge
