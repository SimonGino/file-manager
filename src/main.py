from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.api import documents, auth
from src.core.config import get_settings
from src.db.migrations import create_tables

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时创建表
    await create_tables()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(documents.router) 