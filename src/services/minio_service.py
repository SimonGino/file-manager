from typing import BinaryIO
from minio import Minio
from minio.error import S3Error  # 正确的导入路径
from fastapi import HTTPException
from datetime import timedelta
from fastapi import Depends
from src.core.config import get_settings

settings = get_settings()

class MinioService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """确保存储桶存在"""
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)

    async def upload_file(self, path: str, content: bytes, content_type: str):
        """上传文件到MinIO"""
        from io import BytesIO
        file_data = BytesIO(content)
        file_size = len(content)
        
        self.client.put_object(
            bucket_name=self.bucket_name,
            object_name=path,
            data=file_data,
            length=file_size,
            content_type=content_type
        )
        return path

    async def get_file(self, path: str):
        """从MinIO获取文件"""
        try:
            response = self.client.get_object(
                bucket_name=self.bucket_name,
                object_name=path
            )
            return response
        except Exception as e:
            raise Exception(f"Error retrieving file: {str(e)}") 

    async def get_presigned_url(self, object_path: str, expires: int = 600) -> str:
        """
        生成预签名URL
        :param object_path: MinIO中的对象路径
        :param expires: 过期时间（秒）
        :return: 预签名URL
        """
        try:
            # 将秒数转换为 timedelta 对象
            expiry = timedelta(seconds=expires)
            # 生成预签名URL
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_path,
                expires=expiry
            )
            return url
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating presigned URL: {str(e)}"
            )