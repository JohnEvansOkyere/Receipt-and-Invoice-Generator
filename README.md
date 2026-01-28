# Professional Receipt & Invoice Generator

A full-stack web application for generating professional receipts and invoices. Features email authentication, business profile management, receipt/invoice history, and challenge/dispute system. Built with Next.js, FastAPI, and PostgreSQL (Neon).

## Features

- **Email Authentication**: Secure login and registration system
- **Business Profiles**: Save your business details once, use everywhere
- **Professional Receipts**: AWS/Claude-style professional receipt format
- **Professional Invoices**: Complete invoice management with status tracking
- **WhatsApp Sharing**: Share receipts directly via WhatsApp
- **PDF Download**: Download high-quality PDFs matching the preview
- **History & Tracking**: View all receipts and invoices in one place
- **Challenge System**: Customers can challenge receipts/invoices
- **Beautiful UI**: Unique color scheme with modern, mobile-first design
- **100% Free**: No credit card required, free forever

## Architecture

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: FastAPI, Python 3.11+
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens
- **PDF Generation**: html2pdf.js

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.11+
- PostgreSQL database (Neon recommended)
- pip (Python package manager)

## Setup Instructions

### 1. Clone the Repository

```bash
cd Receipt-and-Invoice-Generator
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL and SECRET_KEY
```

**Environment Variables** (`.env`):

```env
DATABASE_URL=postgresql://user:password@hostname.neon.tech/dbname?sslmode=require
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
```

### 3. Database Setup (Neon)

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to `backend/.env` as `DATABASE_URL`

### 3.1. Database Migrations

The project uses Alembic for database migrations. After setting up your database:

```bash
# Create the initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations to create all tables
alembic upgrade head
```

This will create all the necessary tables:

- `users` - User accounts
- `businesses` - Business profiles
- `receipts` - Receipt records
- `invoices` - Invoice records
- `challenges` - Challenge/dispute records

**Note**: See `backend/MIGRATIONS.md` for detailed migration documentation.

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL
```

**Environment Variables** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
# Or: uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# or
yarn dev
# or
pnpm dev
```

Frontend will run on `http://localhost:3000`

## Usage

### 1. Registration & Login

1. Visit the landing page at `http://localhost:3000`
2. Click "Get Started Free" or "Sign In"
3. Register with your email and password
4. You'll be redirected to the dashboard

### 2. Set Up Business Profile

1. From the dashboard, click "Business Profile"
2. Fill in your business details (name is required)
3. Save your profile
4. This information will be used on all receipts and invoices

### 3. Create a Receipt

1. Click "Create Receipt" from the dashboard
2. Fill in customer information (optional)
3. Add items with names, descriptions, quantities, and prices
4. Set tax rate and discount if needed
5. Preview your receipt in real-time
6. Save, share via WhatsApp, or download as PDF

### 4. Create an Invoice

1. Click "Create Invoice" from the dashboard
2. Fill in customer information (name is required)
3. Set due date and payment terms
4. Add items and calculate totals
5. Set invoice status (pending, paid, overdue, cancelled)
6. Save or download as PDF

### 5. View History

1. Click "History" from the dashboard
2. View all receipts and invoices
3. Filter by receipts or invoices
4. Download PDFs of any document

### 6. Challenge System

Customers can challenge receipts or invoices by:

1. Using the challenge API endpoint
2. Providing their information and reason
3. Business owners can view and resolve challenges from their dashboard

## Project Structure

```text
Receipt-and-Invoice-Generator/
├── frontend/                      # Next.js frontend application
│   ├── app/                       # Next.js app directory
│   │   ├── page.tsx               # Landing page
│   │   ├── login/                 # Login page
│   │   ├── register/              # Registration page
│   │   ├── dashboard/             # Dashboard pages
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   ├── business/          # Business profile
│   │   │   ├── receipt/           # Create receipt
│   │   │   ├── invoice/           # Create invoice
│   │   │   └── history/           # View history
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   │   ├── ProfessionalReceipt.tsx
│   │   └── ProfessionalInvoice.tsx
│   ├── lib/                       # Utility libraries
│   │   ├── api.ts                 # API client
│   │   └── auth.ts                # Auth utilities
│   ├── utils/                     # Utility functions
│   │   └── receiptUtils.ts
│   ├── package.json               # Frontend dependencies
│   ├── tsconfig.json              # TypeScript config
│   └── next.config.js             # Next.js config
├── backend/                       # FastAPI backend application
│   ├── main.py                    # FastAPI app entry
│   ├── app/
│   │   ├── database.py            # Database config
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── auth.py                # Auth utilities
│   │   └── routers/               # API routes
│   │       ├── auth.py            # Authentication
│   │       ├── business.py        # Business profile
│   │       ├── receipts.py        # Receipts
│   │       ├── invoices.py        # Invoices
│   │       └── history.py         # History & challenges
│   └── requirements.txt           # Python dependencies
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user

### Business

- `GET /api/business/` - Get business profile
- `POST /api/business/` - Create/update business profile
- `PATCH /api/business/` - Update business profile

### Receipts

- `GET /api/receipts/` - Get all receipts
- `GET /api/receipts/{id}` - Get specific receipt
- `POST /api/receipts/` - Create receipt

### Invoices

- `GET /api/invoices/` - Get all invoices
- `GET /api/invoices/{id}` - Get specific invoice
- `POST /api/invoices/` - Create invoice
- `PATCH /api/invoices/{id}` - Update invoice

### History

- `GET /api/history/` - Get all receipts and invoices
- `POST /api/history/challenge` - Create challenge
- `GET /api/history/challenges` - Get challenges
- `PATCH /api/history/challenges/{id}` - Resolve challenge

## Design

The application features a unique color scheme:

- **Primary**: Rich Purple (#6B46C1)
- **Secondary**: Vibrant Pink (#EC4899)
- **Accent**: Emerald Green (#10B981)
- **Background**: Deep Dark Blue (#0F0F23)

Receipts and invoices follow AWS/Claude-style professional formatting with:

- Clean typography
- Proper spacing and alignment
- Professional table layouts
- Clear hierarchy and branding

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection protection via SQLAlchemy
- Input validation with Pydantic

## Deployment

### Backend (FastAPI)

Deploy to platforms like:

- Railway
- Render
- Fly.io
- DigitalOcean App Platform

Set environment variables:

- `DATABASE_URL`
- `SECRET_KEY`

### Frontend (Next.js)

Deploy to:

- Vercel (recommended)
- Netlify
- Railway
- Any static hosting

**Note**: Make sure to deploy from the `frontend/` directory or configure your build tool to use `frontend/` as the root.

Set environment variable:

- `NEXT_PUBLIC_API_URL` (your backend URL)

## Notes

- All data is stored in PostgreSQL database
- Business profiles are required before creating receipts/invoices
- Receipts and invoices are automatically numbered
- PDF generation happens client-side
- WhatsApp sharing works with or without phone numbers

## Contributing

Feel free to submit issues or pull requests!

## License

See LICENSE file for details.

## Acknowledgments

- Built with Next.js, FastAPI, and PostgreSQL
- PDF generation powered by html2pdf.js
- Professional receipt design inspired by AWS and Claude receipts

