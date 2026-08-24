import os
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agrisight.db")
engine = create_async_engine(DATABASE_URL, future=True, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def init_db() -> None:
    from backend.models import TelemetryLog
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

async def log_telemetry(event_type: str, payload: dict) -> None:
    from backend.models import TelemetryLog
    async with SessionLocal() as session:
        session.add(TelemetryLog(event_type=event_type, payload=payload, created_at=datetime.utcnow()))
        await session.commit()
