from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()


class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class ApplianceStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class RecipeDifficulty(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    preferences = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="user", cascade="all, delete-orphan")
    shopping_lists = relationship("ShoppingList", back_populates="user", cascade="all, delete-orphan")
    appliances = relationship("Appliance", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    magic_links = relationship("MagicLink", back_populates="user", cascade="all, delete-orphan")


class MagicLink(Base):
    __tablename__ = "magic_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="magic_links")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    difficulty = Column(Enum(RecipeDifficulty), default=RecipeDifficulty.MEDIUM)
    prep_time = Column(Integer)
    cook_time = Column(Integer)
    servings = Column(Integer, default=1)
    ingredients = Column(JSONB, nullable=False, default=[])
    instructions = Column(JSONB, nullable=False, default=[])
    nutrition_info = Column(JSONB, default={})
    tags = Column(JSONB, default=[])
    is_public = Column(Boolean, default=False)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="recipes")
    meal_plan_recipes = relationship("MealPlanRecipe", back_populates="recipe", cascade="all, delete-orphan")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100))
    unit = Column(String(50))
    calories_per_unit = Column(Float)
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Appliance(Base):
    __tablename__ = "appliances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    brand = Column(String(100))
    model = Column(String(100))
    status = Column(Enum(ApplianceStatus), default=ApplianceStatus.INACTIVE, nullable=False)
    settings = Column(JSONB, default={})
    last_maintenance = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="appliances")
    usage_logs = relationship("ApplianceUsageLog", back_populates="appliance", cascade="all, delete-orphan")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="meal_plans")
    meal_plan_recipes = relationship("MealPlanRecipe", back_populates="meal_plan", cascade="all, delete-orphan")


class MealPlanRecipe(Base):
    __tablename__ = "meal_plan_recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meal_plan_id = Column(UUID(as_uuid=True), ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    meal_type = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    meal_plan = relationship("MealPlan", back_populates="meal_plan_recipes")
    recipe = relationship("Recipe", back_populates="meal_plan_recipes")


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    items = Column(JSONB, nullable=False, default=[])
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="shopping_lists")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))
    details = Column(JSONB, default={})
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User", back_populates="activity_logs")


class ApplianceUsageLog(Base):
    __tablename__ = "appliance_usage_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appliance_id = Column(UUID(as_uuid=True), ForeignKey("appliances.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False)
    duration = Column(Integer)
    energy_used = Column(Float)
    temperature = Column(Float)
    settings_used = Column(JSONB, default={})
    metrics = Column(JSONB, default={})
    error_logs = Column(JSONB, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    appliance = relationship("Appliance", back_populates="usage_logs")
