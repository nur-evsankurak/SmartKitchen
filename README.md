# SmartKitchen

A comprehensive smart kitchen management system built with Python, PostgreSQL, and modern web technologies.

## Overview

SmartKitchen is an intelligent kitchen management platform that helps users manage recipes, meal planning, shopping lists, and connected kitchen appliances. The system provides detailed analytics and activity tracking to optimize your cooking experience.

## Features

- **User Management**: Secure authentication with role-based access control
- **Recipe Management**: Create, store, and share recipes with nutritional information
- **Meal Planning**: Schedule meals with integrated recipe suggestions
- **Shopping Lists**: Auto-generate shopping lists from meal plans and recipes
- **Appliance Control**: Monitor and control smart kitchen appliances
- **Activity Tracking**: Comprehensive logging of user actions and appliance usage
- **Analytics**: Detailed metrics on energy usage, cooking patterns, and more

## Technology Stack

- **Backend**: Python 3.11+
- **Database**: PostgreSQL 14+ with UUID and JSONB support
- **ORM**: SQLAlchemy 2.0+
- **API Framework**: FastAPI (recommended)

## Database Schema

### Core Models

- **Users**: User accounts with preferences and role management
- **Magic Links**: Passwordless authentication tokens with expiration tracking
- **Recipes**: Recipe storage with ingredients, instructions, and nutrition data
- **Ingredients**: Ingredient catalog with nutritional information
- **Appliances**: Smart kitchen appliance registry and monitoring
- **Meal Plans**: Meal scheduling and planning
- **Shopping Lists**: Dynamic shopping list management
- **Activity Logs**: User activity tracking with JSONB metadata
- **Appliance Usage Logs**: Detailed appliance usage metrics and error tracking

## Project Structure

```
SmartKitchen/
├── backend/
│   └── app/
│       ├── models.py       # SQLAlchemy database models
│       └── database.py     # Database connection and utilities
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- pip or poetry for package management

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SmartKitchen
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

4. Set up environment variables:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/smartkitchen"
export SQL_ECHO="false"
```

5. Initialize the database:
```python
from backend.app.database import init_db
init_db()
```

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE smartkitchen;
```

2. Enable UUID extension (if not already enabled):
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

3. Initialize tables:
```python
from backend.app.database import init_db
init_db()
```

## Usage

### Database Connection

```python
from backend.app.database import get_db_context

# Using context manager
with get_db_context() as db:
    users = db.query(User).all()
```

### Creating Records

```python
from backend.app.models import User, Recipe
from backend.app.database import get_db_context
import uuid

with get_db_context() as db:
    # Create a new user
    user = User(
        email="user@example.com",
        username="johndoe",
        password_hash="hashed_password",
        full_name="John Doe",
        preferences={"theme": "dark", "notifications": True}
    )
    db.add(user)
    db.commit()

    # Create a recipe
    recipe = Recipe(
        user_id=user.id,
        name="Spaghetti Carbonara",
        description="Classic Italian pasta dish",
        difficulty="medium",
        prep_time=10,
        cook_time=20,
        servings=4,
        ingredients=[
            {"name": "spaghetti", "amount": 400, "unit": "g"},
            {"name": "eggs", "amount": 4, "unit": "pcs"},
            {"name": "bacon", "amount": 200, "unit": "g"}
        ],
        instructions=[
            {"step": 1, "description": "Boil pasta"},
            {"step": 2, "description": "Cook bacon"},
            {"step": 3, "description": "Mix eggs and cheese"},
            {"step": 4, "description": "Combine all ingredients"}
        ],
        tags=["italian", "pasta", "quick"]
    )
    db.add(recipe)
    db.commit()
```

### Querying Data

```python
from backend.app.models import User, Recipe, ActivityLog
from backend.app.database import get_db_context

with get_db_context() as db:
    # Get all users
    users = db.query(User).all()

    # Get recipes by difficulty
    easy_recipes = db.query(Recipe).filter(Recipe.difficulty == "easy").all()

    # Query JSONB fields
    italian_recipes = db.query(Recipe).filter(
        Recipe.tags.contains(["italian"])
    ).all()

    # Get activity logs with specific action
    login_logs = db.query(ActivityLog).filter(
        ActivityLog.action == "user_login"
    ).all()
```

## Database Utilities

The `database.py` module provides several utility functions:

- `get_db()`: Dependency injection for FastAPI
- `get_db_context()`: Context manager for database sessions
- `init_db()`: Initialize all database tables
- `drop_db()`: Drop all database tables
- `reset_db()`: Reset database (drop and recreate)
- `db_manager.health_check()`: Check database connection status

## API Development

This project is designed to work seamlessly with FastAPI. Example endpoint:

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User

app = FastAPI()

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the GitHub repository.

## Roadmap

- [ ] RESTful API implementation with FastAPI
- [ ] Frontend web application
- [ ] Mobile app integration
- [ ] IoT device integration for appliances
- [ ] Machine learning recipe recommendations
- [ ] Voice assistant integration
- [ ] Meal prep automation
- [ ] Nutritional analysis and tracking.
