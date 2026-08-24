export type BoundingBox = { x: number; y: number; width: number; height: number };
export type DiagnosticResult = { disease: string; confidence: number; severity: "None" | "Low" | "Moderate" | "High"; treatment: string; bounding_box: BoundingBox | null; model: string };
export type YieldInput = { nitrogen: number; phosphorus: number; potassium: number; ph: number; rainfall: number; temperature: number };
export type YieldResult = { projected_yield_bu_ac: number; baseline_yield_bu_ac: number; yield_lift_percent: number; fertilizer_recommendation: string; rationale: string; model: string };

type ApiEnvelope<T> = { data: T; mock: boolean };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit, fallback: () => T): Promise<ApiEnvelope<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return { data: await response.json(), mock: false };
  } catch {
    return { data: fallback(), mock: true };
  }
}

export function diagnoseCrop(file: File) {
  const form = new FormData(); form.append("file", file);
  return request<DiagnosticResult>("/api/v1/diagnose-crop", { method: "POST", body: form }, () => ({ disease: "Early Leaf Spot (simulated)", confidence: 88.6, severity: "Moderate", treatment: "Scout adjacent plants within 48 hours. Remove heavily affected foliage and apply a crop-label-approved fungicide according to local extension guidance.", bounding_box: { x: 112, y: 74, width: 268, height: 194 }, model: "mock-vision-v1" }));
}

export function predictYield(input: YieldInput) {
  return request<YieldResult>("/api/v1/predict-yield", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }, () => {
    const nutrientScore = Math.min(1, (input.nitrogen / 150 + input.phosphorus / 60 + input.potassium / 220) / 3);
    const climateScore = Math.max(0.55, 1 - Math.abs(input.rainfall - 30) / 80 - Math.abs(input.temperature - 78) / 180 - Math.abs(input.ph - 6.5) / 12);
    const projected = Number((118 + nutrientScore * 62 + climateScore * 36).toFixed(1)); const baseline = 151.2;
    return { projected_yield_bu_ac: projected, baseline_yield_bu_ac: baseline, yield_lift_percent: Number((((projected - baseline) / baseline) * 100).toFixed(1)), fertilizer_recommendation: input.nitrogen < 120 ? "Apply 35–55 lb N/ac in a split application before V6; maintain potassium availability with a targeted side-dress after tissue testing." : "Maintain current nutrient program; prioritize tissue testing before additional nitrogen input.", rationale: "Simulated fallback using nutrient sufficiency, pH proximity, rainfall, and temperature response curves.", model: "mock-agronomy-v1" };
  });
}
