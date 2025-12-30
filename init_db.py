#!/usr/bin/env python3
"""
Database initialization script for SmartKitchen.
This script creates all database tables defined in the models.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import inspect, text
from app.database import engine, init_db
from app.models import Base


def get_table_names():
    """Get all table names from the database."""
    inspector = inspect(engine)
    return inspector.get_table_names()


def main():
    print("=" * 60)
    print("SmartKitchen Database Initialization")
    print("=" * 60)

    # Check database connection
    print("\n1. Checking database connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✓ Connected to PostgreSQL")
            print(f"  Version: {version.split(',')[0]}")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        sys.exit(1)

    # Check existing tables
    print("\n2. Checking existing tables...")
    existing_tables = get_table_names()
    if existing_tables:
        print(f"  Found {len(existing_tables)} existing table(s): {', '.join(existing_tables)}")
        response = input("\n  Do you want to drop existing tables and recreate? (yes/no): ")
        if response.lower() in ['yes', 'y']:
            print("  Dropping existing tables...")
            Base.metadata.drop_all(bind=engine)
            print("  ✓ Tables dropped")
        else:
            print("  Keeping existing tables...")
    else:
        print("  No existing tables found")

    # Create tables
    print("\n3. Creating database tables...")
    try:
        init_db()
        print("  ✓ Tables created successfully")
    except Exception as e:
        print(f"  ✗ Table creation failed: {e}")
        sys.exit(1)

    # Verify tables
    print("\n4. Verifying created tables...")
    tables = get_table_names()
    expected_tables = [
        'users',
        'magic_links',
        'recipes',
        'ingredients',
        'appliances',
        'meal_plans',
        'meal_plan_recipes',
        'shopping_lists',
        'activity_logs',
        'appliance_usage_logs'
    ]

    print(f"\n  Expected tables: {len(expected_tables)}")
    print(f"  Created tables:  {len(tables)}")

    print("\n  Table List:")
    for i, table in enumerate(sorted(tables), 1):
        status = "✓" if table in expected_tables else "?"
        print(f"    {status} {i}. {table}")

    # Summary
    print("\n" + "=" * 60)
    if len(tables) == len(expected_tables) and all(t in tables for t in expected_tables):
        print("SUCCESS: All tables created successfully!")
    else:
        missing = set(expected_tables) - set(tables)
        extra = set(tables) - set(expected_tables)
        if missing:
            print(f"WARNING: Missing tables: {', '.join(missing)}")
        if extra:
            print(f"WARNING: Unexpected tables: {', '.join(extra)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
