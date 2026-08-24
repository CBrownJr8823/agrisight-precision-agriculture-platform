from typing import Literal
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    width: int = Field(gt=0)
    height: int = Field(gt=0)

class DiagnosticResponse(BaseModel):
    disease: str
    confidence: float = Field(ge=0, le=100)
    severity: Literal["None", "Low", "Moderate", "High"]
    treatment: str
    bounding_box: BoundingBox | None
    model: str

class YieldRequest(BaseModel):
    nitrogen: float = Field(ge=0, le=500)
    phosphorus: float = Field(ge=0, le=300)
    potassium: float = Field(ge=0, le=600)
    ph: float = Field(ge=3, le=12)
    rainfall: float = Field(ge=0, le=200)
    temperature: float = Field(ge=-20, le=150)

class YieldResponse(BaseModel):
    projected_yield_bu_ac: float
    baseline_yield_bu_ac: float
    yield_lift_percent: float
    fertilizer_recommendation: str
    rationale: str
    model: str

class HealthResponse(BaseModel):
    status: str
    database: str
    vision_model_loaded: bool
    yield_model_loaded: bool
