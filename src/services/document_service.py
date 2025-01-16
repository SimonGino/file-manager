from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional

from src.schemas.document import DocumentCreate, DocumentResponse
from src.models.models import Document

class DocumentService:
    async def create(
        self, 
        db: AsyncSession, 
        document: DocumentCreate
    ) -> DocumentResponse:
        db_document = Document(**document.model_dump())
        db.add(db_document)
        await db.commit()
        await db.refresh(db_document)
        return DocumentResponse.model_validate(db_document)

    async def get_by_md5_and_user(
        self, 
        db: AsyncSession, 
        file_md5: str, 
        user_id: int
    ) -> Optional[Document]:
        query = select(Document).where(
            Document.file_md5 == file_md5,
            Document.uploader_id == user_id
        )
        result = await db.execute(query)
        return result.scalar_one_or_none() 

    async def get_by_id(
        self, 
        db: AsyncSession, 
        document_id: int
    ) -> Optional[Document]:
        query = select(Document).where(Document.id == document_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def increment_download_count(
        self,
        db: AsyncSession,
        document_id: int
    ):
        stmt = (
            update(Document)
            .where(Document.id == document_id)
            .values(download_count=Document.download_count + 1)
        )
        await db.execute(stmt)
        await db.commit() 