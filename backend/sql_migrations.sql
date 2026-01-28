-- SQL Migrations for Receipt and Invoice Generator
-- Run these in your Neon database query editor
-- Order matters due to foreign key constraints

-- Enable UUID extension (if needed for future use)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);

-- 2. Create Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    address TEXT,
    city VARCHAR,
    state VARCHAR,
    zip_code VARCHAR,
    country VARCHAR DEFAULT 'USA',
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    tax_id VARCHAR,
    logo_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_businesses_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_businesses_id ON businesses(id);
CREATE INDEX IF NOT EXISTS ix_businesses_user_id ON businesses(user_id);

-- 3. Create Receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_phone VARCHAR,
    customer_address TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tax_rate DOUBLE PRECISION DEFAULT 0.0,
    tax_amount DOUBLE PRECISION DEFAULT 0.0,
    discount DOUBLE PRECISION DEFAULT 0.0,
    total DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    payment_method VARCHAR,
    notes TEXT,
    items_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_receipts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receipts_business_id FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_receipts_id ON receipts(id);
CREATE INDEX IF NOT EXISTS ix_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS ix_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS ix_receipts_business_id ON receipts(business_id);

-- 4. Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    customer_name VARCHAR NOT NULL,
    customer_email VARCHAR,
    customer_phone VARCHAR,
    customer_address TEXT,
    customer_tax_id VARCHAR,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    subtotal DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tax_rate DOUBLE PRECISION DEFAULT 0.0,
    tax_amount DOUBLE PRECISION DEFAULT 0.0,
    discount DOUBLE PRECISION DEFAULT 0.0,
    total DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR DEFAULT 'pending',
    payment_terms VARCHAR,
    notes TEXT,
    items_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_invoices_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_business_id FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_invoices_id ON invoices(id);
CREATE INDEX IF NOT EXISTS ix_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS ix_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS ix_invoices_business_id ON invoices(business_id);

-- 5. Create Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER,
    invoice_id INTEGER,
    challenger_name VARCHAR NOT NULL,
    challenger_email VARCHAR NOT NULL,
    challenger_phone VARCHAR,
    reason TEXT NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_challenges_receipt_id FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    CONSTRAINT fk_challenges_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT check_challenge_has_document CHECK (
        (receipt_id IS NOT NULL AND invoice_id IS NULL) OR 
        (receipt_id IS NULL AND invoice_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS ix_challenges_id ON challenges(id);
CREATE INDEX IF NOT EXISTS ix_challenges_receipt_id ON challenges(receipt_id);
CREATE INDEX IF NOT EXISTS ix_challenges_invoice_id ON challenges(invoice_id);

-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'businesses', 'receipts', 'invoices', 'challenges')
ORDER BY table_name;
