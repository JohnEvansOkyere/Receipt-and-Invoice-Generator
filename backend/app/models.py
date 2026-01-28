"""
Database models
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

class ChallengeStatus(str, enum.Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class DocumentType(str, enum.Enum):
    RECEIPT = "receipt"
    INVOICE = "invoice"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    business = relationship("Business", back_populates="owner", uselist=False)
    receipts = relationship("Receipt", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")

class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Business details
    name = Column(String, nullable=False)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    country = Column(String, default="USA")
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    tax_id = Column(String)  # Tax ID or EIN
    logo_url = Column(String)  # URL to logo image
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="business")
    receipts = relationship("Receipt", back_populates="business")
    invoices = relationship("Invoice", back_populates="business")

class Receipt(Base):
    __tablename__ = "receipts"
    
    id = Column(Integer, primary_key=True, index=True)
    receipt_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    
    # Customer information
    customer_name = Column(String)
    customer_email = Column(String)
    customer_phone = Column(String)
    customer_address = Column(Text)
    
    # Receipt details
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String)
    notes = Column(Text)
    
    # Items stored as JSON string (SQLAlchemy Text field)
    items_json = Column(Text, nullable=False)  # JSON array of items
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="receipts")
    business = relationship("Business", back_populates="receipts")
    challenges = relationship("Challenge", back_populates="receipt")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    
    # Customer information
    customer_name = Column(String, nullable=False)
    customer_email = Column(String)
    customer_phone = Column(String)
    customer_address = Column(Text)
    customer_tax_id = Column(String)
    
    # Invoice details
    issue_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_date = Column(DateTime(timezone=True))
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="pending")  # pending, paid, overdue, cancelled
    payment_terms = Column(String)  # e.g., "Net 30"
    notes = Column(Text)
    
    # Items stored as JSON string
    items_json = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    business = relationship("Business", back_populates="invoices")
    challenges = relationship("Challenge", back_populates="invoice")

class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    
    # Challenger information
    challenger_name = Column(String, nullable=False)
    challenger_email = Column(String, nullable=False)
    challenger_phone = Column(String)
    
    # Challenge details
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(ChallengeStatus), default=ChallengeStatus.PENDING)
    resolution_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    receipt = relationship("Receipt", back_populates="challenges")
    invoice = relationship("Invoice", back_populates="challenges")
