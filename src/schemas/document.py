from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from enum import Enum

class DocumentBase(BaseModel):
    filename: str
    file_md5: str
    file_size: int
    mime_type: str
    minio_path: str
    file_uuid: str
    is_public: bool = False

class DocumentCreate(DocumentBase):
    uploader_id: int

class DocumentResponse(DocumentBase):
    id: int
    uploader_id: int
    download_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 

class ShareType(str, Enum):
    NO_PASSWORD = "no_password"
    WITH_PASSWORD = "with_password"

class ShareCreate(BaseModel):
    share_type: ShareType
    share_code: Optional[str] = None
    expire_days: Optional[int] = None  # None 表示永久，7表示7天，1表示1天

class ShareUpdate(BaseModel):
    share_type: ShareType
    share_code: Optional[str] = None
    expire_days: Optional[int] = None  # None 表示永久，7表示7天，1表示1天

class ShareResponse(BaseModel):
    filename: str
    share_uuid: Optional[str] = None
    share_type: Optional[str] = None
    share_code: Optional[str] = None
    share_expired_at: Optional[datetime] = None
    is_shared: bool = False 