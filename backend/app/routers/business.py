"""
Business profile routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.post("/", response_model=schemas.BusinessResponse)
def create_business(
    business_data: schemas.BusinessCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update business profile"""
    # Validate required fields
    if not business_data.name or not business_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business name is required"
        )
    if not business_data.address or not business_data.address.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address is required"
        )
    if not business_data.city or not business_data.city.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City is required"
        )
    if not business_data.state or not business_data.state.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State is required"
        )
    if not business_data.zip_code or not business_data.zip_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZIP code is required"
        )
    
    # Check if business already exists
    db_business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    
    if db_business:
        # Update existing business
        for key, value in business_data.model_dump(exclude_unset=True).items():
            setattr(db_business, key, value)
        db.commit()
        db.refresh(db_business)
        return db_business
    else:
        # Create new business
        db_business = models.Business(
            user_id=current_user.id,
            **business_data.model_dump()
        )
        db.add(db_business)
        db.commit()
        db.refresh(db_business)
        return db_business

@router.get("/", response_model=schemas.BusinessResponse)
def get_business(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's business profile"""
    db_business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    
    if not db_business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please create one first."
        )
    
    return db_business

@router.patch("/", response_model=schemas.BusinessResponse)
def update_business(
    business_data: schemas.BusinessUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Update business profile"""
    db_business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
    
    if not db_business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    # Update fields
    for key, value in business_data.model_dump(exclude_unset=True).items():
        # Validate required fields if they're being updated
        if key in ['name', 'address', 'city', 'state', 'zip_code'] and (not value or not value.strip()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{key.replace('_', ' ').title()} is required and cannot be empty"
            )
        setattr(db_business, key, value)
    
    # Ensure required fields are still present after update
    if not db_business.name or not db_business.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business name is required"
        )
    if not db_business.address or not db_business.address.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address is required"
        )
    if not db_business.city or not db_business.city.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City is required"
        )
    if not db_business.state or not db_business.state.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State is required"
        )
    if not db_business.zip_code or not db_business.zip_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZIP code is required"
        )
    
    db.commit()
    db.refresh(db_business)
    return db_business
