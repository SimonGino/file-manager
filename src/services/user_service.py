from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.models import User as UserModel
from src.schemas.user import UserResponse


class UserService:
    async def get_user_by_username(
            self,
            db: AsyncSession,
            username: str
    ) -> UserResponse:
        """根据用户名或邮箱获取用户信息"""
        query = select(UserModel).where(UserModel.email == username)
        result = await db.execute(query)
        user_db = result.scalar_one_or_none()

        if not user_db:
            return None

        return UserResponse(
            id=user_db.id,
            username=user_db.username,
            email=user_db.email,
            is_admin=user_db.is_admin,
            created_at=user_db.created_at,
            updated_at=user_db.updated_at
        )