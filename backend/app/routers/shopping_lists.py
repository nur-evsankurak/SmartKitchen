from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models import ShoppingList, User

router = APIRouter()


class ShoppingListItem(BaseModel):
    name: str
    quantity: str = "1"
    checked: bool = False


class ShoppingListCreate(BaseModel):
    name: str
    items: List[ShoppingListItem]


class ShoppingListUpdate(BaseModel):
    name: Optional[str] = None
    items: Optional[List[ShoppingListItem]] = None
    is_completed: Optional[bool] = None


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

    # Convert items to dict format
    items_data = [item.dict() for item in shopping_list_data.items]

    shopping_list = ShoppingList(
        user_id=first_user.id,
        name=shopping_list_data.name,
        items=items_data,
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
    items: List[ShoppingListItem],
    db: Session = Depends(get_db)
):
    """Add items to the latest shopping list, or create new one if none exists."""
    # Get or create shopping list
    shopping_list = db.query(ShoppingList).filter(
        ShoppingList.is_completed == False
    ).order_by(ShoppingList.created_at.desc()).first()

    # Convert items to dict format
    items_data = [item.dict() for item in items]

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
            items=items_data,
            is_completed=False
        )
        db.add(shopping_list)
    else:
        # Add items to existing list (avoid duplicates by name)
        existing_items = shopping_list.items or []
        existing_names = {item.get('name', '').lower() for item in existing_items}

        for new_item in items_data:
            if new_item['name'].lower() not in existing_names:
                existing_items.append(new_item)

        shopping_list.items = existing_items

    db.commit()
    db.refresh(shopping_list)

    return {
        "id": str(shopping_list.id),
        "name": shopping_list.name,
        "items": shopping_list.items,
        "is_completed": shopping_list.is_completed,
        "message": f"Added {len(items)} items to shopping list"
    }


@router.put("/{list_id}", status_code=status.HTTP_200_OK)
async def update_shopping_list(
    list_id: str,
    update_data: ShoppingListUpdate,
    db: Session = Depends(get_db)
):
    """Update a shopping list."""
    try:
        list_uuid = uuid.UUID(list_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid list ID format"
        )

    shopping_list = db.query(ShoppingList).filter(
        ShoppingList.id == list_uuid
    ).first()

    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found"
        )

    # Update fields if provided
    if update_data.name is not None:
        shopping_list.name = update_data.name

    if update_data.items is not None:
        shopping_list.items = [item.dict() for item in update_data.items]

    if update_data.is_completed is not None:
        shopping_list.is_completed = update_data.is_completed

    db.commit()
    db.refresh(shopping_list)

    return {
        "id": str(shopping_list.id),
        "name": shopping_list.name,
        "items": shopping_list.items,
        "is_completed": shopping_list.is_completed,
        "created_at": shopping_list.created_at.isoformat(),
        "message": "Shopping list updated successfully"
    }


@router.delete("/{list_id}/items/{item_index}", status_code=status.HTTP_200_OK)
async def delete_item_from_list(
    list_id: str,
    item_index: int,
    db: Session = Depends(get_db)
):
    """Delete a specific item from a shopping list."""
    try:
        list_uuid = uuid.UUID(list_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid list ID format"
        )

    shopping_list = db.query(ShoppingList).filter(
        ShoppingList.id == list_uuid
    ).first()

    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found"
        )

    items = shopping_list.items or []

    if item_index < 0 or item_index >= len(items):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item index"
        )

    # Remove the item
    deleted_item = items.pop(item_index)
    shopping_list.items = items

    db.commit()
    db.refresh(shopping_list)

    return {
        "id": str(shopping_list.id),
        "items": shopping_list.items,
        "deleted_item": deleted_item,
        "message": "Item deleted successfully"
    }
