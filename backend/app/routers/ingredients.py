from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Ingredient
from app.schemas.ingredients import (
    IngredientCreate,
    IngredientUpdate,
    IngredientResponse
)

router = APIRouter()


@router.get("", response_model=List[IngredientResponse])
async def get_ingredients(db: Session = Depends(get_db)):
    """
    Get all ingredients.
    """
    ingredients = db.query(Ingredient).order_by(Ingredient.name).all()
    return ingredients


@router.get("/analytics", status_code=200)
async def get_ingredient_analytics(db: Session = Depends(get_db)):
    """
    Get ingredient usage counts across all recipes.
    Returns each ingredient name and how many recipes use it.
    """
    from app.models import Recipe

    recipes = db.query(Recipe).all()

    usage: dict = {}
    for recipe in recipes:
        if not recipe.ingredients:
            continue
        for ing in recipe.ingredients:
            if isinstance(ing, dict):
                name = ing.get("name", "").strip()
            elif isinstance(ing, str):
                name = ing.strip()
            else:
                continue
            if name:
                usage[name] = usage.get(name, 0) + 1

    result = [{"ingredient": name, "recipe_count": count} for name, count in usage.items()]
    result.sort(key=lambda x: x["recipe_count"], reverse=True)
    return result


@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient(ingredient_id: str, db: Session = Depends(get_db)):
    """
    Get a specific ingredient by ID.
    """
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )

    return ingredient


@router.post("", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
async def create_ingredient(
    ingredient_data: IngredientCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new ingredient.
    """
    # Check if ingredient with same name already exists
    existing = db.query(Ingredient).filter(
        Ingredient.name == ingredient_data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ingredient with name '{ingredient_data.name}' already exists"
        )

    # Create new ingredient
    ingredient = Ingredient(
        name=ingredient_data.name,
        category=ingredient_data.category,
        unit=ingredient_data.unit,
        calories_per_unit=ingredient_data.calories_per_unit,
        additional_data=ingredient_data.additional_data or {}
    )

    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)

    return ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: str,
    ingredient_data: IngredientUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing ingredient.
    """
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )

    # Update fields if provided
    if ingredient_data.name is not None:
        # Check if new name conflicts with existing ingredient
        existing = db.query(Ingredient).filter(
            Ingredient.name == ingredient_data.name,
            Ingredient.id != ingredient_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ingredient with name '{ingredient_data.name}' already exists"
            )

        ingredient.name = ingredient_data.name

    if ingredient_data.category is not None:
        ingredient.category = ingredient_data.category

    if ingredient_data.unit is not None:
        ingredient.unit = ingredient_data.unit

    if ingredient_data.calories_per_unit is not None:
        ingredient.calories_per_unit = ingredient_data.calories_per_unit

    if ingredient_data.additional_data is not None:
        ingredient.additional_data = ingredient_data.additional_data

    db.commit()
    db.refresh(ingredient)

    return ingredient


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(ingredient_id: str, db: Session = Depends(get_db)):
    """
    Delete an ingredient.
    """
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )

    db.delete(ingredient)
    db.commit()

    return None


