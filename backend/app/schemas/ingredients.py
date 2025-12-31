from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    calories_per_unit: Optional[float] = None


class IngredientCreate(IngredientBase):
    additional_data: Optional[dict] = {}


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    calories_per_unit: Optional[float] = None
    additional_data: Optional[dict] = None


class IngredientResponse(IngredientBase):
    id: uuid.UUID
    additional_data: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
