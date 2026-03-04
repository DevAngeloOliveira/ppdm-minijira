from typing import Generic, TypeVar, List, Optional

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    page: int
    size: int
    total: int


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
