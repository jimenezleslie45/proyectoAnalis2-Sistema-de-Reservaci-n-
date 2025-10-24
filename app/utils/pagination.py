from typing import List, TypeVar, Generic

T = TypeVar('T')

class PaginatedResponse(Generic[T]):
    total: int
    items: List[T]
    page: int
    size: int

def paginate(items: List[T], page: int, size: int) -> PaginatedResponse[T]:
    total = len(items)
    start = (page - 1) * size
    end = start + size
    paginated_items = items[start:end]
    return PaginatedResponse(total=total, items=paginated_items, page=page, size=size)