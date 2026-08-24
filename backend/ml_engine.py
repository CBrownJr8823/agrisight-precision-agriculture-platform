from __future__ import annotations
import hashlib
from dataclasses import dataclass
from io import BytesIO
import cv2
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestRegressor

@dataclass
class VisionInference:
    disease: str
    confidence: float
    severity: str
    treatment: str
    bounding_box: dict | None
    model: str

class VisionDiagnosticEngine:
    """OpenCV-based plant-stress detector with deterministic image-dependent output.

    It is a functional fallback suitable for demo environments. Replace `diagnose` with a
    trained Torch/Torchvision detector adapter in production after validating field labels.
    """
    loaded = True
    treatments = {
        "Healthy foliage": "No disease intervention is indicated. Continue weekly scouting, maintain irrigation consistency, and validate nutrition with scheduled tissue testing.",
        "Leaf spot stress": "Scout nearby plants within 48 hours, remove heavily affected foliage where practical, and use a crop-label-approved fungicide only under local agronomy guidance.",
        "Nutrient deficiency pattern": "Confirm with soil and tissue testing before treatment. Review nitrogen and potassium availability, irrigation uniformity, and root-zone pH.",
        "Potential fungal blight": "Isolate and document symptomatic zones. Consult a local extension specialist for a crop-specific diagnosis and label-compliant integrated pest-management plan."
    }

    def diagnose(self, image_bytes: bytes) -> VisionInference:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        rgb = np.asarray(image)
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        height, width = rgb.shape[:2]
        saturation = float(hsv[:, :, 1].mean())
        green_ratio = float(((hsv[:, :, 0] >= 35) & (hsv[:, :, 0] <= 90) & (hsv[:, :, 1] > 45)).mean())
        yellow_or_brown = ((hsv[:, :, 0] >= 8) & (hsv[:, :, 0] <= 35) & (hsv[:, :, 1] > 55)).astype(np.uint8) * 255
        contours, _ = cv2.findContours(yellow_or_brown, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        largest = max(contours, key=cv2.contourArea) if contours else None
        affected_ratio = cv2.contourArea(largest) / max(1, width * height) if largest is not None else 0.0
        digest = hashlib.sha256(image_bytes).digest()[0] / 255

        if green_ratio > 0.42 and affected_ratio < 0.015:
            disease, severity = "Healthy foliage", "None"
        elif affected_ratio > 0.12:
            disease, severity = "Potential fungal blight", "High"
        elif affected_ratio > 0.035 or saturation < 70:
            disease, severity = "Leaf spot stress", "Moderate"
        else:
            disease, severity = "Nutrient deficiency pattern", "Low"

        box = None
        if largest is not None and cv2.contourArea(largest) > 30:
            x, y, w, h = cv2.boundingRect(largest)
            box = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
        confidence = round(min(98.5, 72 + affected_ratio * 150 + green_ratio * 12 + digest * 6), 1)
        if disease == "Healthy foliage": confidence = round(82 + green_ratio * 14 + digest * 3, 1)
        return VisionInference(disease, confidence, severity, self.treatments[disease], box, "opencv-agronomy-screen-v1")

class YieldPredictorEngine:
    loaded = False
    def __init__(self) -> None:
        self.model = RandomForestRegressor(n_estimators=160, max_depth=10, random_state=42, n_jobs=-1)
        self._fit_synthetic_agronomy_model()
        self.loaded = True

    def _fit_synthetic_agronomy_model(self) -> None:
        rng = np.random.default_rng(42)
        n = 3500
        nitrogen = rng.uniform(10, 220, n); phosphorus = rng.uniform(5, 100, n); potassium = rng.uniform(20, 300, n)
        ph = rng.uniform(4.5, 8.5, n); rainfall = rng.uniform(5, 65, n); temperature = rng.uniform(48, 103, n)
        yield_value = (95 + 0.34 * nitrogen - 0.00085 * nitrogen**2 + 0.22 * phosphorus - 0.0014 * phosphorus**2 + 0.11 * potassium - 0.00022 * potassium**2 + 30 * np.exp(-((ph - 6.5) ** 2) / 0.75) + 25 * np.exp(-((rainfall - 30) ** 2) / 500) + 18 * np.exp(-((temperature - 78) ** 2) / 260) + rng.normal(0, 3.0, n))
        self.model.fit(np.column_stack([nitrogen, phosphorus, potassium, ph, rainfall, temperature]), yield_value)

    def predict(self, values: dict) -> dict:
        features = np.array([[values["nitrogen"], values["phosphorus"], values["potassium"], values["ph"], values["rainfall"], values["temperature"]]])
        projected = round(float(self.model.predict(features)[0]), 1)
        baseline = 151.2
        gaps = []
        if values["nitrogen"] < 130: gaps.append("apply 35–55 lb N/ac as a split application before V6")
        if values["phosphorus"] < 30: gaps.append("use a banded phosphorus application after confirming soil-test interpretation")
        if values["potassium"] < 140: gaps.append("consider a potassium side-dress based on crop removal targets")
        if not gaps: gaps.append("maintain current fertility program and validate with tissue testing before adding inputs")
        rationale = f"Random forest inference uses N-P-K, pH {values['ph']:.1f}, rainfall {values['rainfall']:.1f} in, and temperature {values['temperature']:.1f}°F. Estimates are decision support, not a substitute for local agronomist recommendations."
        return {"projected_yield_bu_ac": projected, "baseline_yield_bu_ac": baseline, "yield_lift_percent": round((projected - baseline) / baseline * 100, 1), "fertilizer_recommendation": "; ".join(gaps).capitalize() + ".", "rationale": rationale, "model": "random-forest-synthetic-agronomy-v1"}

vision_engine = VisionDiagnosticEngine()
yield_engine = YieldPredictorEngine()
