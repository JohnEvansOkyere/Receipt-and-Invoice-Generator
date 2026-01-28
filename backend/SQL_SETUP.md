# SQL Setup for Neon Database

Since you're having issues installing Alembic, you can run these SQL migrations directly in Neon's query editor.

## Quick Setup

1. **Open Neon Dashboard**: Go to your Neon project dashboard
2. **Open SQL Editor**: Click on "SQL Editor" or "Query"
3. **Copy and Paste**: Copy the entire contents of `sql_migrations.sql`
4. **Run**: Execute the SQL script

## Step-by-Step

### Option 1: Run All at Once (Recommended)

1. Open `sql_migrations.sql` file
2. Copy all the SQL statements
3. Paste into Neon's SQL Editor
4. Click "Run" or press `Ctrl+Enter`

### Option 2: Run Table by Table

If you prefer to run them one at a time, execute in this order:

1. **Users table** (lines 5-14)
2. **Businesses table** (lines 16-30)
3. **Receipts table** (lines 32-52)
4. **Invoices table** (lines 54-76)
5. **Challenges table** (lines 78-98)

## Verify Installation

After running the migrations, you can verify with this query:

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'businesses', 'receipts', 'invoices', 'challenges')
ORDER BY table_name;
```

You should see 5 tables:
- `users` (6 columns)
- `businesses` (13 columns)
- `receipts` (18 columns)
- `invoices` (20 columns)
- `challenges` (11 columns)

## Tables Created

### 1. `users`
- User accounts with email authentication
- Fields: id, email, hashed_password, created_at, updated_at, is_active

### 2. `businesses`
- Business profiles linked to users
- Fields: id, user_id, name, address, city, state, zip_code, country, phone, email, website, tax_id, logo_url

### 3. `receipts`
- Receipt records
- Fields: id, receipt_number, user_id, business_id, customer info, date, amounts, items_json, etc.

### 4. `invoices`
- Invoice records with status tracking
- Fields: id, invoice_number, user_id, business_id, customer info, dates, amounts, status, items_json, etc.

### 5. `challenges`
- Challenge/dispute records for receipts and invoices
- Fields: id, receipt_id, invoice_id, challenger info, reason, status, resolution_notes

## Notes

- All tables use `SERIAL` for auto-incrementing IDs (PostgreSQL native)
- Foreign keys have `ON DELETE CASCADE` to maintain referential integrity
- Indexes are created for faster lookups on commonly queried fields
- The `challenges` table has a constraint ensuring either `receipt_id` OR `invoice_id` is set (not both)

## Troubleshooting

If you get errors:

1. **"relation already exists"**: Tables might already exist. You can drop them first:
   ```sql
   DROP TABLE IF EXISTS challenges CASCADE;
   DROP TABLE IF EXISTS invoices CASCADE;
   DROP TABLE IF EXISTS receipts CASCADE;
   DROP TABLE IF EXISTS businesses CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```
   Then re-run the migrations.

2. **Foreign key errors**: Make sure you run the tables in order (users → businesses → receipts/invoices → challenges)

3. **Permission errors**: Make sure you're using a user with CREATE TABLE permissions

## After Setup

Once the tables are created, you can:

1. Start your FastAPI backend:
   ```bash
   cd backend
   python main.py
   ```

2. The application will work without Alembic since the tables are already created.

3. If you later want to use Alembic, you can mark the current state as the base:
   ```bash
   alembic stamp head
   ```
   (But this requires Alembic to be installed)
