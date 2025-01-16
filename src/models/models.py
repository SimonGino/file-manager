from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
from enum import Enum as PyEnum

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ShareType(str, PyEnum):
    NO_PASSWORD = "no_password"
    WITH_PASSWORD = "with_password"

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_md5 = Column(String(32), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(127), nullable=False)
    minio_path = Column(String(512), nullable=False)
    file_uuid = Column(String(36), nullable=False, unique=True)
    uploader_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    share_type = Column(String, nullable=True)
    share_code = Column(String(4), nullable=True)
    share_expired_at = Column(DateTime(timezone=True), nullable=True)
    is_shared = Column(Boolean, default=False)
    share_uuid = Column(String, nullable=True) 