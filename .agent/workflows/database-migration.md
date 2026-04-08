---
description: How to safely add new tables or columns to the AlloyDB schema in the AI Chief of Staff system
---

# Skill: Database Migration

Use this skill whenever you need to add or modify the AlloyDB/PostgreSQL database schema (new tables, new columns, or new indexes).

## Rules
- NEVER modify production schema directly
- ALWAYS use migration files — never run raw `ALTER TABLE` manually
- Every migration must be reversible (has a downgrade function)
- Test migrations on local Docker Postgres before applying to AlloyDB

## Tool: Alembic

This project uses **Alembic** for database migrations.

Install (already in requirements.txt):
```
alembic
```

## Step 1: Update the SQLAlchemy Model

Open `backend/app/db/models.py` and add your new column or table:

```python
new_column = Column(String, nullable=True, default=None)
```

## Step 2: Generate the Migration File

```bash
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "add_new_column_to_workflow_jobs"
```

This generates a file in `backend/alembic/versions/`.

## Step 3: Review the Migration File

Open the generated file and verify:
- `upgrade()` adds the correct column/table
- `downgrade()` reverses it completely

## Step 4: Apply Migration Locally

```bash
alembic upgrade head
```

Verify in the database:
```bash
docker exec -it postgres psql -U user -d aicos -c "\d workflow_jobs"
```

## Step 5: Apply to AlloyDB (Production)

From your CI/CD pipeline or a secure shell with AlloyDB access:

```bash
DATABASE_URL=postgresql://user:password@{ALLOYDB_IP}/aicos alembic upgrade head
```

## Step 6: For pgvector Column Changes

If you are changing the vector dimension (e.g. from 768 to 1024), you must:
1. Drop the existing index on the vector column
2. Alter the column type
3. Rebuild the HNSW or IVFFlat index

This is a breaking change — always do a full data backup before proceeding.
