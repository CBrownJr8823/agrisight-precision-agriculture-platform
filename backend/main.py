from contextlib import asynccontextmanager
from typing import Any
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from backend.database import SessionLocal, init_db, log_telemetry
from backend.ml_engine import vision_engine, yield_engine
from backend.models import TelemetryLog
from backend.schemas import DiagnosticResponse, HealthResponse, YieldRequest, YieldResponse

@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield

app = FastAPI(title="AgriSight Precision Agriculture API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/v1/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    database = "connected"
    try:
        async with SessionLocal() as session:
            await session.execute(select(TelemetryLog.id).limit(1))
    except Exception:
        database = "unavailable"
    return HealthResponse(status="healthy" if database == "connected" else "degraded", database=database, vision_model_loaded=vision_engine.loaded, yield_model_loaded=yield_engine.loaded)

@app.post("/api/v1/diagnose-crop", response_model=DiagnosticResponse)
async def diagnose_crop(file: UploadFile = File(...)) -> DiagnosticResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload a valid image content type.")
    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be between 1 byte and 12 MB.")
    try:
        result = vision_engine.diagnose(image_bytes)
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"Could not decode image: {error}") from error
    payload = {"disease": result.disease, "confidence": result.confidence, "severity": result.severity, "treatment": result.treatment, "bounding_box": result.bounding_box, "model": result.model}
    await log_telemetry("crop_diagnosis", {"filename": file.filename, **payload})
    return DiagnosticResponse(**payload)

@app.post("/api/v1/predict-yield", response_model=YieldResponse)
async def predict_yield(request: YieldRequest) -> YieldResponse:
    result = yield_engine.predict(request.model_dump())
    await log_telemetry("yield_prediction", {"inputs": request.model_dump(), "result": result})
    return YieldResponse(**result)

@app.get("/api/v1/field-history")
async def field_history(limit: int = 25) -> list[dict[str, Any]]:
    safe_limit = min(max(limit, 1), 100)
    async with SessionLocal() as session:
        result = await session.execute(select(TelemetryLog).order_by(TelemetryLog.created_at.desc()).limit(safe_limit))
        logs = result.scalars().all()
    return [{"id": log.id, "event_type": log.event_type, "payload": log.payload, "created_at": log.created_at.isoformat()} for log in logs]
