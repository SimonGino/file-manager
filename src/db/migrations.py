from sqlalchemy.ext.asyncio import create_async_engine
from src.models.models import Base
from src.core.config import get_settings

settings = get_settings()

async def create_tables():
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()