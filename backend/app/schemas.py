"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import ChallengeStatus, DocumentType

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Business schemas
class BusinessCreate(BaseModel):
    name: str  # Required
    address: str  # Required
    city: str  # Required
    state: str  # Required
    zip_code: str  # Required
    country: str = "USA"  # Required, default to USA
    phone: Optional[str] = None  # Optional
    email: Optional[str] = None  # Optional
    website: Optional[str] = None  # Optional
    tax_id: Optional[str] = None  # Optional
    logo_url: Optional[str] = None  # Optional

class BusinessUpdate(BaseModel):
    name: Optional[str] = None  # Can update but must remain non-empty
    address: Optional[str] = None  # Can update but must remain non-empty
    city: Optional[str] = None  # Can update but must remain non-empty
    state: Optional[str] = None  # Can update but must remain non-empty
    zip_code: Optional[str] = None  # Can update but must remain non-empty
    country: Optional[str] = None  # Can update but must remain non-empty
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None

class BusinessResponse(BaseModel):
    id: int
    user_id: int
    name: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    country: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    tax_id: Optional[str]
    logo_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Item schema
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: float = 1.0
    unit_price: float
    total: float

# Receipt schemas
class ReceiptCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    date: Optional[datetime] = None
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    discount: float = 0.0
    total: float
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    items: List[Item]

class ReceiptResponse(BaseModel):
    id: int
    receipt_number: str
    user_id: int
    business_id: int
    customer_name: Optional[str]
    customer_email: Optional[str]
    customer_phone: Optional[str]
    customer_address: Optional[str]
    date: datetime
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount: float
    total: float
    payment_method: Optional[str]
    notes: Optional[str]
    items: List[Item]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceCreate(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    customer_tax_id: Optional[str] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    discount: float = 0.0
    total: float
    status: Optional[str] = "pending"
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    items: List[Item]

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    user_id: int
    business_id: int
    customer_name: str
    customer_email: Optional[str]
    customer_phone: Optional[str]
    customer_address: Optional[str]
    customer_tax_id: Optional[str]
    issue_date: datetime
    due_date: Optional[datetime]
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount: float
    total: float
    status: str
    payment_terms: Optional[str]
    notes: Optional[str]
    items: List[Item]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Challenge schemas
class ChallengeCreate(BaseModel):
    receipt_id: Optional[int] = None
    invoice_id: Optional[int] = None
    challenger_name: str
    challenger_email: EmailStr
    challenger_phone: Optional[str] = None
    reason: str

class ChallengeResponse(BaseModel):
    id: int
    receipt_id: Optional[int]
    invoice_id: Optional[int]
    challenger_name: str
    challenger_email: str
    challenger_phone: Optional[str]
    reason: str
    status: ChallengeStatus
    resolution_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# History schemas
class HistoryResponse(BaseModel):
    receipts: List[ReceiptResponse]
    invoices: List[InvoiceResponse]
