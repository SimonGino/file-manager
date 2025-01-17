from fastapi import APIRouter, Depends, UploadFile, Request, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Generator, List, Optional
import hashlib
from datetime import datetime, timedelta, timezone
import os
import urllib.parse
from sqlalchemy import select, and_, or_
import uuid
import random
import string

from src.db.database import get_db
from src.core.security import get_current_user
from src.schemas.document import DocumentCreate, DocumentResponse, ShareCreate, ShareUpdate, ShareResponse
from src.services.minio_service import MinioService
from src.services.document_service import DocumentService
from src.models.models import Document, ShareType
from src.api import success_response, APIException

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    minio_service: MinioService = Depends(MinioService),
    document_service: DocumentService = Depends(DocumentService)
):
    if not current_user.is_admin:
        raise APIException(status_code=403, message="Not authorized")

    # 计算文件MD5
    md5_hash = hashlib.md5()
    content = await file.read()
    md5_hash.update(content)
    file_md5 = md5_hash.hexdigest()

    # 获取文件后缀
    _, file_extension = os.path.splitext(file.filename)

    # 检查文件是否已存在
    existing_doc = await document_service.get_by_md5_and_user(
        db, file_md5, current_user.id
    )
    if existing_doc:
        raise APIException(status_code=400, message="File already exists")

    # 对用户email进行hash
    email_hash = hashlib.md5(current_user.email.encode()).hexdigest()[:8]

    # 构建文件路径 (包含文件后缀)
    current_date = datetime.now()
    minio_path = (
        f"{current_date.strftime('%Y/%m/%d')}/"  # 年/月/日
        f"{email_hash}/"                         # email的短hash
        f"{file_md5}{file_extension}"           # MD5 + 原始文件后缀
    )
    
    try:
        # 上传到MinIO
        await minio_service.upload_file(minio_path, content, file.content_type)

        # 保存文档信息到数据库
        doc_create = DocumentCreate(
            filename=file.filename,  # 原始文件名保存在数据库中
            file_md5=file_md5,
            file_size=len(content),
            mime_type=file.content_type,
            minio_path=minio_path,   # MinIO中的路径包含后缀
            file_uuid=file_md5,      # 使用MD5作为UUID
            uploader_id=current_user.id
        )

        doc = await document_service.create(db, doc_create)
        return success_response(
            data=DocumentResponse.model_validate(doc),
            message="File uploaded successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error uploading file",
            details={"error": str(e)}
        )

@router.get("/preview/{document_id}")
async def preview_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    minio_service: MinioService = Depends(MinioService)
):
    """获取文档预览URL"""
    try:
        # 查询文档
        query = select(Document).where(Document.id == document_id)
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Document not found")
            
        # 生成预签名URL（例如10分钟有效）
        presigned_url = await minio_service.get_presigned_url(
            document.minio_path,
            expires=600  # 10分钟
        )
        
        return success_response(
            data={
                "preview_url": presigned_url,
                "mime_type": document.mime_type,
                "filename": document.filename
            },
            message="Preview URL generated successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error generating preview URL",
            details={"error": str(e)}
        )

@router.get("/download/{document_id}")
async def download_document(
    request: Request,
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    minio_service: MinioService = Depends(MinioService),
    document_service: DocumentService = Depends(DocumentService)
):
    document = await document_service.get_by_id(db, document_id)
    if not document:
        raise APIException(status_code=404, message="Document not found")
    
    if not document.is_public and document.uploader_id != current_user.id:
        raise APIException(status_code=403, message="Not authorized to download this document")
    
    try:
        # 从 MinIO 获取文件
        file_response = await minio_service.get_file(document.minio_path)
        
        # 获取文件大小
        file_size = document.file_size
        
        # 处理断点续传
        range_header = request.headers.get("range")
        
        # 创建文件流生成器
        def iterfile(start: int = 0, chunk_size: int = 8192) -> Generator[bytes, None, None]:
            # 如果有range header，移动到指定位置
            if start > 0:
                file_response.read(start)
            
            while True:
                chunk = file_response.read(chunk_size)
                if not chunk:
                    break
                yield chunk
        
        # URL编码文件名
        encoded_filename = urllib.parse.quote(document.filename)
        
        headers = {
            "Content-Disposition": f"attachment; filename=\"{encoded_filename}\"",
            "Accept-Ranges": "bytes",
            "Content-Type": document.mime_type,
            "Cache-Control": "no-cache"
        }
        
        if range_header:
            # 处理断点续传请求
            start, end = range_header.replace("bytes=", "").split("-")
            start = int(start)
            end = int(end) if end else file_size - 1
            
            headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
            headers["Content-Length"] = str(end - start + 1)
            
            response = StreamingResponse(
                iterfile(start=start),
                status_code=206,
                headers=headers
            )
        else:
            # 普通下载请求
            headers["Content-Length"] = str(file_size)
            response = StreamingResponse(
                iterfile(),
                headers=headers
            )
        
        # 异步更新下载计数
        await document_service.increment_download_count(db, document_id)
        
        return response
        
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error retrieving file",
            details={"error": str(e)}
        )

@router.get("/my-documents")
async def get_my_documents(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    document_service: DocumentService = Depends(DocumentService)
):
    """获取当前用户上传的文件列表"""
    try:
        query = select(Document).where(
            Document.uploader_id == current_user.id
        ).order_by(Document.created_at.desc())
        
        result = await db.execute(query)
        documents = result.scalars().all()
        
        return success_response(
            data=[DocumentResponse.model_validate(doc) for doc in documents],
            message="Documents retrieved successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error retrieving documents",
            details={"error": str(e)}
        )

@router.post("/{document_id}/share")
async def share_document(
    document_id: int,
    share_data: ShareCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """分享文件，可选是否需要密码"""
    try:
        query = select(Document).where(Document.id == document_id)
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Document not found")
            
        if document.uploader_id != current_user.id:
            raise APIException(status_code=403, message="Not authorized")
        
        # 如果没有分享UUID或已过期，生成新的
        if not document.share_uuid or (
            document.share_expired_at and document.share_expired_at < datetime.now(timezone.utc)
        ):
            document.share_uuid = str(uuid.uuid4())
        
        # 更新分享信息
        document.share_type = share_data.share_type.value
        document.share_expired_at = datetime.now(timezone.utc) + timedelta(days=7)
        document.is_shared = True
        
        # 如果需要密码，验证或生成密码
        if share_data.share_type == ShareType.WITH_PASSWORD:
            if share_data.share_code:
                if not share_data.share_code.isdigit() or len(share_data.share_code) != 4:
                    raise APIException(status_code=400, message="Share code must be 4 digits")
                document.share_code = share_data.share_code
            else:
                # 生成随机4位数密码
                document.share_code = ''.join(random.choices(string.digits, k=4))
        else:
            document.share_code = None
        
        await db.commit()
        await db.refresh(document)
        
        return success_response(
            data=ShareResponse(
                share_uuid=document.share_uuid,
                share_type=document.share_type,
                share_code=document.share_code,
                share_expired_at=document.share_expired_at,
                filename=document.filename
            ),
            message="Document shared successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error sharing document",
            details={"error": str(e)}
        )

@router.get("/share/{document_id}")
async def share_document(
    document_id: int,
    share_data: ShareCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """分享文件，可选是否需要密码"""
    try:
        query = select(Document).where(Document.id == document_id)
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Document not found")
            
        if document.uploader_id != current_user.id:
            raise APIException(status_code=403, message="Not authorized")
        
        # 如果没有分享UUID或已过期，生成新的
        if not document.share_uuid or (
            document.share_expired_at and document.share_expired_at < datetime.now(timezone.utc)
        ):
            document.share_uuid = str(uuid.uuid4())
        
        # 更新分享信息
        document.share_type = share_data.share_type.value
        document.share_expired_at = datetime.now(timezone.utc) + timedelta(days=7)
        document.is_shared = True
        
        # 如果需要密码，验证或生成密码
        if share_data.share_type == ShareType.WITH_PASSWORD:
            if share_data.share_code:
                if not share_data.share_code.isdigit() or len(share_data.share_code) != 4:
                    raise APIException(status_code=400, message="Share code must be 4 digits")
                document.share_code = share_data.share_code
            else:
                # 生成随机4位数密码
                document.share_code = ''.join(random.choices(string.digits, k=4))
        else:
            document.share_code = None
        
        await db.commit()
        await db.refresh(document)
        
        return success_response(
            data=ShareResponse(
                share_uuid=document.share_uuid,
                share_type=document.share_type,
                share_code=document.share_code,
                share_expired_at=document.share_expired_at,
                filename=document.filename
            ),
            message="Document shared successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error sharing document",
            details={"error": str(e)}
        )

@router.get("/share/{share_uuid}")
async def get_share_info(
    share_uuid: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """获取分享信息"""
    try:
        query = select(Document).where(
            Document.share_uuid == share_uuid,
            Document.is_shared == True,
            Document.share_expired_at > datetime.now()
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Share not found or expired")
            
        if document.uploader_id != current_user.id:
            raise APIException(status_code=403, message="Not authorized")
            
        return success_response(
            data=ShareResponse(
                share_uuid=document.share_uuid,
                share_type=document.share_type,
                share_code=document.share_code,
                share_expired_at=document.share_expired_at,
                filename=document.filename
            ),
            message="Share info retrieved successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error retrieving share info",
            details={"error": str(e)}
        )

@router.put("/{document_id}/share")
async def update_share_code(
    document_id: int,
    share_data: ShareUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """更新分享密码"""
    try:
        query = select(Document).where(
            Document.id == document_id,
            Document.uploader_id == current_user.id,
            Document.is_shared == True
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Document not found or not shared")
            
        # 更新分享设置
        document.share_type = share_data.share_type
        if share_data.share_type == "with_password":
            document.share_code = share_data.share_code
        else:
            document.share_code = None
            
        # 更新过期时间
        if share_data.expire_days is not None:
            document.share_expired_at = datetime.now(timezone.utc) + timedelta(days=share_data.expire_days)
        else:
            document.share_expired_at = None
            
        await db.commit()
        
        return success_response(
            data=ShareResponse(
                share_uuid=document.share_uuid,
                share_type=document.share_type,
                share_code=document.share_code,
                share_expired_at=document.share_expired_at,
                filename=document.filename
            ),
            message="Share code updated successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error updating share code",
            details={"error": str(e)}
        )

@router.get("/shared/{share_uuid}")
async def access_shared_document(
    share_uuid: str,
    share_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    minio_service: MinioService = Depends(MinioService)
):
    """访问分享的文档"""
    try:
        # 构建查询条件
        conditions = [
            Document.share_uuid == share_uuid,
            Document.is_shared == True,
            or_(
                Document.share_expired_at == None,  # 永久有效
                Document.share_expired_at > datetime.now(timezone.utc)  # 未过期
            )
        ]
        
        query = select(Document).where(and_(*conditions))
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Share not found or expired")
            
        # 检查密码
        if document.share_type == ShareType.WITH_PASSWORD.value:
            if not share_code:
                raise APIException(status_code=403, message="Share code required")
            if share_code != document.share_code:
                raise APIException(status_code=403, message="Invalid share code")
        
        # 计算预览URL的过期时间
        if document.share_expired_at:
            now = datetime.now(timezone.utc)
            remaining_seconds = int((document.share_expired_at - now).total_seconds())
            expires = max(remaining_seconds, 600)  # 至少10分钟
        else:
            expires = 24 * 60 * 60  # 永久链接默认24小时
        
        # 生成预览URL
        preview_url = await minio_service.get_presigned_url(
            document.minio_path,
            expires=expires
        )
        
        # 更新下载次数
        document.download_count += 1
        await db.commit()
        
        return success_response(
            data={
                "filename": document.filename,
                "preview_url": preview_url,
                "mime_type": document.mime_type,
                "file_size": document.file_size
            },
            message="Document accessed successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error accessing shared document",
            details={"error": str(e)}
        )

@router.get("/shared/{share_uuid}/check")
async def check_share_type(
    share_uuid: str,
    db: AsyncSession = Depends(get_db)
):
    """检查分享类型（是否需要密码）"""
    try:
        conditions = [
            Document.share_uuid == share_uuid,
            Document.is_shared == True,
            or_(
                Document.share_expired_at == None,  # 永久有效
                Document.share_expired_at > datetime.now(timezone.utc)  # 未过期
            )
        ]
        
        query = select(Document).where(and_(*conditions))
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Share not found or expired")
        
        return success_response(
            data={
                "requires_password": document.share_type == ShareType.WITH_PASSWORD.value,
                "filename": document.filename
            },
            message="Share type checked successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error checking share type",
            details={"error": str(e)}
        )

@router.get("/{document_id}/share")
async def get_document_share_info(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """获取文档的分享信息（需要认证）"""
    try:
        query = select(Document).where(
            Document.id == document_id,
            Document.uploader_id == current_user.id  # 确保只能查看自己的文档
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Document not found")
            
        return success_response(
            data=ShareResponse(
                filename=document.filename,
                share_uuid=document.share_uuid,
                share_type=document.share_type,
                share_code=document.share_code,
                share_expired_at=document.share_expired_at,
                is_shared=document.is_shared
            ),
            message="Share info retrieved successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error retrieving share info",
            details={"error": str(e)}
        )

@router.delete("/{document_id}/share")
async def cancel_document_share(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """取消文档分享"""
    try:
        query = select(Document).where(
            Document.id == document_id,
            Document.uploader_id == current_user.id
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise APIException(status_code=404, message="Document not found")
            
        # 重置分享相关字段
        document.is_shared = False
        document.share_uuid = None
        document.share_type = None
        document.share_code = None
        document.share_expired_at = None
        
        await db.commit()
        
        return success_response(
            data=ShareResponse(
                filename=document.filename,
                is_shared=False
            ),
            message="Share cancelled successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error cancelling share",
            details={"error": str(e)}
        )

@router.get("/shared")
async def list_shared_documents(
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """获取当前用户所有已分享的文件列表"""
    try:
        query = select(Document).where(
            # Document.uploader_id == current_user.id,
            Document.is_shared == True,
            Document.share_expired_at > datetime.now(timezone.utc)
        ).order_by(Document.updated_at.desc())
        
        result = await db.execute(query)
        documents = result.scalars().all()
        
        shared_docs = []
        for doc in documents:
            shared_docs.append({
                "id": doc.id,
                "filename": doc.filename,
                "share_uuid": doc.share_uuid,
                "share_type": doc.share_type,
                "share_code": doc.share_code,
                "share_expired_at": doc.share_expired_at,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at,
                "download_count": doc.download_count,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type
            })
        
        return success_response(
            data=shared_docs,
            message="Shared documents retrieved successfully"
        )
    except Exception as e:
        raise APIException(
            status_code=500,
            message="Error retrieving shared documents",
            details={"error": str(e)}
        )
