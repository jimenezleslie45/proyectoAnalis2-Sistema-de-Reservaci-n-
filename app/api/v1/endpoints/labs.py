from fastapi import APIRouter, HTTPException
from app.models.lab import Lab
from app.schemas.lab import LabCreate, LabUpdate
from app.crud.lab import create_lab, get_lab, update_lab, delete_lab, get_labs

router = APIRouter()

@router.post("/", response_model=Lab)
async def create_new_lab(lab: LabCreate):
    return await create_lab(lab)

@router.get("/{lab_id}", response_model=Lab)
async def read_lab(lab_id: int):
    lab = await get_lab(lab_id)
    if lab is None:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab

@router.put("/{lab_id}", response_model=Lab)
async def update_existing_lab(lab_id: int, lab: LabUpdate):
    updated_lab = await update_lab(lab_id, lab)
    if updated_lab is None:
        raise HTTPException(status_code=404, detail="Lab not found")
    return updated_lab

@router.delete("/{lab_id}", response_model=dict)
async def delete_existing_lab(lab_id: int):
    result = await delete_lab(lab_id)
    if not result:
        raise HTTPException(status_code=404, detail="Lab not found")
    return {"detail": "Lab deleted successfully"}

@router.get("/", response_model=list[Lab])
async def read_labs(skip: int = 0, limit: int = 10):
    labs = await get_labs(skip=skip, limit=limit)
    return labs