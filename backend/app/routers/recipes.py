from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models import Recipe, RecipeDifficulty

router = APIRouter()


# Request/Response schemas
class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[str] = "medium"
    ingredients: Optional[list] = []
    instructions: Optional[list] = []
    tags: Optional[list] = []
    image_url: Optional[str] = None


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[str] = None
    ingredients: Optional[list] = None
    instructions: Optional[list] = None
    tags: Optional[list] = None
    image_url: Optional[str] = None


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


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_recipe(recipe_data: RecipeCreate, db: Session = Depends(get_db)):
    """
    Create a new recipe.

    Args:
        recipe_data: Recipe data

    Returns:
        Created recipe details
    """
    # Create new recipe
    recipe = Recipe(
        name=recipe_data.name,
        description=recipe_data.description,
        prep_time=recipe_data.prep_time,
        cook_time=recipe_data.cook_time,
        servings=recipe_data.servings,
        difficulty=RecipeDifficulty(recipe_data.difficulty) if recipe_data.difficulty else RecipeDifficulty.MEDIUM,
        ingredients=recipe_data.ingredients,
        instructions=recipe_data.instructions,
        tags=recipe_data.tags,
        image_url=recipe_data.image_url,
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

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


@router.put("/{recipe_id}", status_code=status.HTTP_200_OK)
async def update_recipe(
    recipe_id: str,
    recipe_data: RecipeUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing recipe.

    Args:
        recipe_id: Recipe UUID
        recipe_data: Updated recipe data

    Returns:
        Updated recipe details
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

    # Update fields if provided
    if recipe_data.name is not None:
        recipe.name = recipe_data.name
    if recipe_data.description is not None:
        recipe.description = recipe_data.description
    if recipe_data.prep_time is not None:
        recipe.prep_time = recipe_data.prep_time
    if recipe_data.cook_time is not None:
        recipe.cook_time = recipe_data.cook_time
    if recipe_data.servings is not None:
        recipe.servings = recipe_data.servings
    if recipe_data.difficulty is not None:
        recipe.difficulty = RecipeDifficulty(recipe_data.difficulty)
    if recipe_data.ingredients is not None:
        recipe.ingredients = recipe_data.ingredients
    if recipe_data.instructions is not None:
        recipe.instructions = recipe_data.instructions
    if recipe_data.tags is not None:
        recipe.tags = recipe_data.tags
    if recipe_data.image_url is not None:
        recipe.image_url = recipe_data.image_url

    db.commit()
    db.refresh(recipe)

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


@router.delete("/{recipe_id}", status_code=status.HTTP_200_OK)
async def delete_recipe(recipe_id: str, db: Session = Depends(get_db)):
    """
    Delete a recipe.

    Args:
        recipe_id: Recipe UUID

    Returns:
        Success message
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

    db.delete(recipe)
    db.commit()

    return {"message": "Recipe deleted successfully", "id": recipe_id}


@router.post("/recommend", status_code=status.HTTP_200_OK)
async def recommend_recipes(
    request: dict,
    db: Session = Depends(get_db)
):
    """
    Recommend recipes based on available ingredients.

    Args:
        request: {"available_ingredients": ["tomato", "egg", ...]}

    Returns:
        {
            "recommended_recipes": [...],
            "missing_ingredients": {...}
        }
    """
    available_ingredients = request.get("available_ingredients", [])

    # Normalize ingredient names (lowercase)
    available_set = set(ing.lower().strip() for ing in available_ingredients)

    # Get all recipes
    recipes = db.query(Recipe).all()

    recommended = []
    missing_by_recipe = {}

    for recipe in recipes:
        if not recipe.ingredients:
            continue

        # Get recipe ingredient names
        recipe_ingredients = []
        if isinstance(recipe.ingredients, list):
            for ing in recipe.ingredients:
                if isinstance(ing, dict):
                    name = ing.get('name', '').lower().strip()
                    if name:
                        recipe_ingredients.append(name)
                elif isinstance(ing, str):
                    recipe_ingredients.append(ing.lower().strip())

        recipe_ing_set = set(recipe_ingredients)

        # Calculate missing ingredients
        missing = recipe_ing_set - available_set
        match_percentage = (len(recipe_ing_set - missing) / len(recipe_ing_set) * 100) if recipe_ing_set else 0

        recipe_data = {
            "id": str(recipe.id),
            "name": recipe.name,
            "description": recipe.description,
            "prep_time": recipe.prep_time,
            "difficulty": recipe.difficulty.value if recipe.difficulty else None,
            "required_ingredients": list(recipe_ing_set),
            "missing_ingredients": list(missing),
            "match_percentage": round(match_percentage, 1),
            "can_make": len(missing) == 0
        }

        # Add to recommended if at least 50% match
        if match_percentage >= 50:
            recommended.append(recipe_data)
            if missing:
                missing_by_recipe[recipe.name] = list(missing)

    # Sort by match percentage (highest first)
    recommended.sort(key=lambda x: x["match_percentage"], reverse=True)

    return {
        "available_ingredients": list(available_set),
        "total_recipes_checked": len(recipes),
        "recommended_recipes": recommended,
        "missing_ingredients": missing_by_recipe
    }
