from typing import TypeVar, Generic, Optional, Any, Dict
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi import HTTPException

T = TypeVar('T')

class ResponseModel(BaseModel, Generic[T]):
    code: int = 200
    message: str = "Success"
    data: Optional[T] = None

class ErrorResponseModel(BaseModel):
    code: int
    message: str
    details: Optional[Dict[str, Any]] = None

def success_response(data: Any = None, message: str = "Success") -> ResponseModel:
    return ResponseModel(
        code=200,
        message=message,
        data=data
    )

def error_response(code: int, message: str, details: Optional[Dict[str, Any]] = None) -> ErrorResponseModel:
    return ErrorResponseModel(
        code=code,
        message=message,
        details=details
    )

class APIException(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status_code,
            detail=error_response(
                code=status_code,
                message=message,
                details=details
            ).model_dump()
        )
