from datetime import timedelta
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext

from src.db.database import get_db
from src.models.models import User
from src.schemas.user import UserCreate, UserResponse
from src.core.security import create_access_token
from src.core.config import get_settings
from src.api import success_response, APIException

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(tags=["auth"])

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    Form fields:
    - username: user's email
    - password: user's password
    """
    # 查找用户（使用 username 字段作为 email）
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Incorrect email or password",
            details={"headers": {"WWW-Authenticate": "Bearer"}}
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_admin": user.is_admin
        }
    }

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # 检查用户是否已存在
    query = select(User).where(User.email == user_data.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise APIException(
            status_code=400,
            message="Email already registered"
        )
    
    # 创建新用户
    hashed_password = pwd_context.hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        is_admin=False  # 默认为普通用户
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return success_response(
        data=UserResponse.model_validate(db_user),
        message="User registered successfully"
    ) 