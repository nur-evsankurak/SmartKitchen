from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from contextlib import contextmanager
import os
from typing import Generator


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/smartkitchen"
)

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Usage with FastAPI:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database session.
    Usage:
        with get_db_context() as db:
            db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Creates all tables defined in models.py
    """
    from app.models import Base
    Base.metadata.create_all(bind=engine)


def drop_db():
    """
    Drop all database tables.
    WARNING: This will delete all data!
    """
    from app.models import Base
    Base.metadata.drop_all(bind=engine)


def reset_db():
    """
    Reset database by dropping and recreating all tables.
    WARNING: This will delete all data!
    """
    drop_db()
    init_db()


class DatabaseManager:
    """
    Database manager class for advanced operations.
    """

    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal

    def create_all_tables(self):
        """Create all tables"""
        from app.models import Base
        Base.metadata.create_all(bind=self.engine)

    def drop_all_tables(self):
        """Drop all tables"""
        from app.models import Base
        Base.metadata.drop_all(bind=self.engine)

    def get_session(self) -> Session:
        """Get a new database session"""
        return self.SessionLocal()

    def health_check(self) -> bool:
        """Check database connection health"""
        try:
            with self.engine.connect() as conn:
                conn.execute("SELECT 1")
            return True
        except Exception:
            return False


db_manager = DatabaseManager()
