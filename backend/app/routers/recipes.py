from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models import Recipe

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_recipes(db: Session = Depends(get_db)):
    """
    Get all recipes.

    Returns:
        List of all recipes in the database
    """
    recipes = db.query(Recipe).all()

    # Convert to dict format
    recipes_list = []
    for recipe in recipes:
        recipes_list.append({
            "id": str(recipe.id),
            "name": recipe.name,
            "description": recipe.description,
            "prep_time": recipe.prep_time,
            "cook_time": recipe.cook_time,
            "servings": recipe.servings,
            "difficulty": recipe.difficulty.value if recipe.difficulty else None,
            "ingredients": recipe.ingredients,
            "instructions": recipe.instructions,
            "tags": recipe.tags,
            "image_url": recipe.image_url,
            "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
        })

    return recipes_list


@router.get("/{recipe_id}", status_code=status.HTTP_200_OK)
async def get_recipe(recipe_id: str, db: Session = Depends(get_db)):
    """
    Get a single recipe by ID.

    Args:
        recipe_id: Recipe UUID

    Returns:
        Recipe details
    """
    try:
        recipe_uuid = uuid.UUID(recipe_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recipe ID format"
        )

    recipe = db.query(Recipe).filter(Recipe.id == recipe_uuid).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )

    return {
        "id": str(recipe.id),
        "name": recipe.name,
        "description": recipe.description,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "servings": recipe.servings,
        "difficulty": recipe.difficulty.value if recipe.difficulty else None,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "tags": recipe.tags,
        "image_url": recipe.image_url,
        "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
    }
