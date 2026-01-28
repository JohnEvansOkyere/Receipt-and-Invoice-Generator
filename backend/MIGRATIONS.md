# Database Migrations Guide

This project uses Alembic for database migrations. This allows for version-controlled database schema changes.

## Initial Setup

### 1. Install Dependencies

Make sure you have all dependencies installed:

```bash
pip install -r requirements.txt
```

### 2. Configure Database

Set your `DATABASE_URL` in the `.env` file:

```env
DATABASE_URL=postgresql://user:password@hostname.neon.tech/dbname?sslmode=require
```

### 3. Create Initial Migration

Run the following command to create the initial migration based on your models:

```bash
alembic revision --autogenerate -m "Initial migration"
```

This will create a migration file in `alembic/versions/` that contains all the table definitions from your models.

### 4. Apply Migrations

Run the migration to create all tables:

```bash
alembic upgrade head
```

This will create all the database tables:
- `users`
- `businesses`
- `receipts`
- `invoices`
- `challenges`

## Common Migration Commands

### Create a New Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Create empty migration file (for manual changes)
alembic revision -m "Description of changes"
```

### Apply Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply migrations up to a specific revision
alembic upgrade <revision_id>

# Apply next migration only
alembic upgrade +1
```

### Rollback Migrations

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to a specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

### Check Migration Status

```bash
# Show current migration status
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic heads
```

## Workflow

### When Adding New Models or Changing Existing Ones

1. Update your models in `app/models.py`
2. Create a migration:
   ```bash
   alembic revision --autogenerate -m "Add new field to receipts"
   ```
3. Review the generated migration file in `alembic/versions/`
4. Apply the migration:
   ```bash
   alembic upgrade head
   ```

### Example: Adding a New Column

1. Edit `app/models.py` to add a new column
2. Generate migration:
   ```bash
   alembic revision --autogenerate -m "Add phone_verified column to users"
   ```
3. Check the generated migration file
4. Apply:
   ```bash
   alembic upgrade head
   ```

## Troubleshooting

### Migration Conflicts

If you have migration conflicts:
```bash
# Check current state
alembic current

# See all heads
alembic heads

# Merge multiple heads if needed
alembic merge heads -m "Merge migration branches"
```

### Reset Database (Development Only)

⚠️ **Warning**: This will delete all data!

```bash
# Rollback all migrations
alembic downgrade base

# Re-apply all migrations
alembic upgrade head
```

### Manual SQL in Migrations

If you need to run custom SQL, edit the migration file:

```python
def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN new_field VARCHAR(255)")
```

## Production Deployment

For production:

1. Always review migration files before applying
2. Test migrations on a staging database first
3. Backup your database before running migrations
4. Run migrations as part of your deployment process:
   ```bash
   alembic upgrade head
   ```

## Quick Start (First Time)

```bash
# 1. Set up environment
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create initial migration
alembic revision --autogenerate -m "Initial migration"

# 4. Apply migrations
alembic upgrade head

# 5. Start the server
python main.py
```

That's it! Your database tables are now created and ready to use.
