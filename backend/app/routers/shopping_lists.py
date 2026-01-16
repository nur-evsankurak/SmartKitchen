from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models import ShoppingList, User

router = APIRouter()


class ShoppingListCreate(BaseModel):
    name: str
    items: List[str]


class ShoppingListUpdate(BaseModel):
    name: str = None
    items: List[str] = None
    is_completed: bool = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_shopping_list(
    shopping_list_data: ShoppingListCreate,
    db: Session = Depends(get_db)
):
    """Create a new shopping list."""
    # Get first user (in production, use current authenticated user)
    first_user = db.query(User).first()

    if not first_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No users found"
        )

    shopping_list = ShoppingList(
        user_id=first_user.id,
        name=shopping_list_data.name,
        items=shopping_list_data.items,
        is_completed=False
    )

    db.add(shopping_list)
    db.commit()
    db.refresh(shopping_list)

    return {
        "id": str(shopping_list.id),
        "name": shopping_list.name,
        "items": shopping_list.items,
        "is_completed": shopping_list.is_completed,
        "created_at": shopping_list.created_at.isoformat()
    }


@router.get("/", status_code=status.HTTP_200_OK)
async def get_shopping_lists(db: Session = Depends(get_db)):
    """Get all shopping lists."""
    shopping_lists = db.query(ShoppingList).all()

    return [
        {
            "id": str(sl.id),
            "name": sl.name,
            "items": sl.items,
            "is_completed": sl.is_completed,
            "created_at": sl.created_at.isoformat()
        }
        for sl in shopping_lists
    ]


@router.post("/add-items", status_code=status.HTTP_200_OK)
async def add_items_to_latest_list(
    items: List[str],
    db: Session = Depends(get_db)
):
    """Add items to the latest shopping list, or create new one if none exists."""
    # Get or create shopping list
    shopping_list = db.query(ShoppingList).filter(
        ShoppingList.is_completed == False
    ).order_by(ShoppingList.created_at.desc()).first()

    if not shopping_list:
        # Create new shopping list
        first_user = db.query(User).first()
        if not first_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No users found"
            )

        shopping_list = ShoppingList(
            user_id=first_user.id,
            name="Shopping List",
            items=items,
            is_completed=False
        )
        db.add(shopping_list)
    else:
        # Add items to existing list (avoid duplicates)
        existing_items = set(shopping_list.items or [])
        new_items = existing_items.union(set(items))
        shopping_list.items = list(new_items)

    db.commit()
    db.refresh(shopping_list)

    return {
        "id": str(shopping_list.id),
        "name": shopping_list.name,
        "items": shopping_list.items,
        "is_completed": shopping_list.is_completed,
        "message": f"Added {len(items)} items to shopping list"
    }
