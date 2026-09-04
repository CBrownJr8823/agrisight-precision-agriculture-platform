# AgriSight — Precision Agriculture & Vision Analytics Platform

> An end-to-end AI application for crop-health screening, field telemetry visualization, and soil/climate-driven yield decision support.

[![CI](https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform)
[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform)

**AgriSight** is a portfolio-ready full-stack precision-agriculture platform. It combines a Next.js operational dashboard with a FastAPI backend that provides image-based crop stress screening, machine-learning-assisted yield forecasting, fertilizer guidance, and historical telemetry tracking.

> **Decision-support notice:** The included vision and yield engines are functional demo models designed for software demonstrations and portfolio use. They are not field-validated agronomic, pesticide, medical, or regulatory guidance. Production use requires regional validation, human agronomist review, and crop-label-compliant treatment procedures.

## Highlights

- **Interactive field intelligence:** Simulated field parcels, soil-moisture heatmaps, N-P-K status cards, rainfall indicators, and crop-health metrics.
- **Crop diagnostic workbench:** Drag-and-drop leaf or plant image upload with likely stress classification, confidence score, severity level, treatment guidance, and detection coordinates.
- **Yield and fertilizer predictor:** Interactive N-P-K, pH, rainfall, and temperature controls with projected-versus-baseline yield visualization.
- **Resilient frontend:** The dashboard automatically switches to realistic simulated telemetry when the FastAPI service is unavailable, allowing the deployed portfolio UI to remain interactive.
- **Async data layer:** SQLite with SQLAlchemy Async for local persistence, structured to support a PostgreSQL/PostGIS migration.
- **Deployment tooling:** Docker, Docker Compose, Vercel configuration, and GitHub Actions CI included.

## Architecture

```text
┌───────────────────────────────────────────────────────────────────────┐
│                         Next.js 14 App Router                          │
│      TypeScript · Tailwind CSS · Lucide · Recharts · Mock Fallback     │
│                                                                       │
│  Field Map + Telemetry     Crop Image Workbench     Yield Dashboard   │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │ HTTPS / JSON / multipart upload
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                              FastAPI API                                │
│  GET /health · POST /diagnose-crop · POST /predict-yield · /history   │
└─────────────────────┬─────────────────────────────┬───────────────────┘
                      │                             │
                      ▼                             ▼
      ┌────────────────────────────┐  ┌────────────────────────────────┐
      │ Vision Diagnostic Engine   │  │ Yield Recommendation Engine     │
      │ Pillow + OpenCV            │  │ scikit-learn Random Forest      │
      │ Stress region / bounding   │  │ N-P-K + pH + rainfall + temp    │
      │ box and severity screening │  │ Yield + fertilizer inference    │
      └──────────────┬─────────────┘  └───────────────┬────────────────┘
                     │                                │
                     └────────────────┬───────────────┘
                                      ▼
                   ┌──────────────────────────────────┐
                   │ SQLAlchemy Async                  │
                   │ SQLite locally                    │
                   │ PostgreSQL / PostGIS migration    │
                   │ path for production deployments   │
                   └──────────────────────────────────┘
```

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14 App Router, React, TypeScript, Tailwind CSS, Lucide React, Recharts |
| API | FastAPI, Uvicorn, Pydantic v2, CORS middleware, multipart file handling |
| Vision inference | Pillow, OpenCV, NumPy; replaceable with a trained PyTorch/Torchvision detector |
| Yield ML | scikit-learn `RandomForestRegressor`, deterministic synthetic agronomy response data |
| Persistence | SQLAlchemy 2 Async, SQLite via `aiosqlite`, PostgreSQL-ready database URL seam |
| DevOps | Docker, Docker Compose, Vercel configuration, GitHub Actions CI |

## Repository structure

```text
agrisight-precision-agriculture-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Frontend build and backend import checks
├── app/
│   ├── globals.css                # Tailwind-based application styling
│   ├── layout.tsx                 # App shell and metadata
│   └── page.tsx                   # Precision agriculture dashboard
├── backend/
│   ├── __init__.py
│   ├── database.py                # Async SQLAlchemy engine and logging
│   ├── main.py                    # FastAPI application and routes
│   ├── ml_engine.py               # Vision and yield inference engines
│   ├── models.py                  # SQLAlchemy telemetry model
│   ├── requirements.txt           # Python dependencies
│   └── schemas.py                 # Pydantic request and response contracts
├── components/
│   ├── CropDiagnosticUploader.tsx # Image upload and diagnosis UX
│   └── YieldPredictor.tsx         # Input controls and Recharts visualization
├── lib/
│   └── api.ts                     # API client and mock-mode fallback logic
├── public/
├── .env.example                   # Environment variable template
├── Dockerfile                     # Container build definition
├── docker-compose.yml             # Local container orchestration
├── next.config.js                 # Next.js configuration
├── package.json                   # Frontend scripts and dependencies
├── vercel.json                    # Vercel build configuration
└── README.md
```

## Local development

### Prerequisites

Install the following before running locally:

- Node.js 20 or later
- Python 3.11 or later
- npm 10 or later
- Docker Desktop, optional for containerized execution

### Clone and install

```bash
git clone https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform.git
cd agrisight-precision-agriculture-platform
npm install
```

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

### Start the application

Run both the Next.js frontend and FastAPI backend with one command:

```bash
npm run dev
```

Then open:

| Service | Local URL |
|---|---|
| Next.js dashboard | [http://localhost:3000](http://localhost:3000) |
| FastAPI interactive docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| FastAPI health endpoint | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) |

### Run services separately

Run only the frontend:

```bash
npm run dev:web
```

Run only the API:

```bash
npm run dev:api
```

### Run with Docker

Build and start the containerized application:

```bash
docker compose up --build
```

The Next.js dashboard is served on port `3000`, and the FastAPI API is served on port `8000`.

Stop services with:

```bash
docker compose down
```

## Environment configuration

Copy the sample environment file before configuring non-default values:

```bash
cp .env.example .env.local
```

| Variable | Default value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Browser-accessible FastAPI base URL consumed by the Next.js client |
| `DATABASE_URL` | `sqlite+aiosqlite:///./agrisight.db` | SQLAlchemy async connection string for local telemetry persistence |

### PostgreSQL migration

For PostgreSQL, install an async driver and configure a deployment environment variable similar to:

```text
DATABASE_URL=postgresql+asyncpg://USERNAME:PASSWORD@HOST:5432/agrisight
```

Then add the driver to `backend/requirements.txt`:

```text
asyncpg
```

For location-aware field geometry and spatial queries, introduce PostgreSQL with PostGIS and a geospatial model layer such as GeoAlchemy2.

## API reference

The API provides OpenAPI documentation automatically at `/docs` when running locally.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | Returns API status, database availability, and model readiness checks |
| `POST` | `/api/v1/diagnose-crop` | Accepts a crop image and returns crop-stress screening results |
| `POST` | `/api/v1/predict-yield` | Generates a projected yield and fertilizer recommendation from soil and climate inputs |
| `GET` | `/api/v1/field-history?limit=25` | Returns recent prediction and diagnostic telemetry logs |

### Health check

```bash
curl http://localhost:8000/api/v1/health
```

Example response:

```json
{
  "status": "healthy",
  "database": "connected",
  "vision_model_loaded": true,
  "yield_model_loaded": true
}
```

### Crop diagnosis

```bash
curl -X POST http://localhost:8000/api/v1/diagnose-crop \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./sample-leaf.jpg"
```

Example response shape:

```json
{
  "disease": "Leaf spot stress",
  "confidence": 89.4,
  "severity": "Moderate",
  "treatment": "Scout nearby plants within 48 hours...",
  "bounding_box": {
    "x": 112,
    "y": 74,
    "width": 268,
    "height": 194
  },
  "model": "opencv-agronomy-screen-v1"
}
```

### Yield prediction

```bash
curl -X POST http://localhost:8000/api/v1/predict-yield \
  -H "Content-Type: application/json" \
  -d '{
    "nitrogen": 84,
    "phosphorus": 39,
    "potassium": 172,
    "ph": 6.4,
    "rainfall": 28,
    "temperature": 79
  }'
```

Example response shape:

```json
{
  "projected_yield_bu_ac": 176.4,
  "baseline_yield_bu_ac": 151.2,
  "yield_lift_percent": 16.7,
  "fertilizer_recommendation": "Apply 35–55 lb N/ac as a split application before V6.",
  "rationale": "Random forest inference uses N-P-K, pH, rainfall, and temperature.",
  "model": "random-forest-synthetic-agronomy-v1"
}
```

## Mock mode behavior

The frontend remains interactive when the backend is unreachable. The API client uses a short request timeout; if a request fails, it supplies deterministic simulated diagnostic or yield data and marks the result as **Mock inference** or **Mock model fallback** in the UI.

This makes the project suitable for a frontend-only Vercel preview while retaining a complete FastAPI backend for full-stack deployments.

## Deployment

### Deploy the frontend to Vercel

1. Push this project to GitHub at [CBrownJr8823/agrisight-precision-agriculture-platform](https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform).
2. Import the repository into [Vercel](https://vercel.com/new).
3. Set the `NEXT_PUBLIC_API_URL` environment variable to the public URL of your deployed FastAPI backend.
4. Deploy the project.
5. Add the final Vercel domain to FastAPI's CORS allowlist before using the live backend from the browser.

Example Vercel variable:

```text
NEXT_PUBLIC_API_URL=https://your-agrisight-api.onrender.com
```

### Deploy the API to Render

For production, deploy FastAPI separately from the Vercel frontend.

1. Create a new [Render Web Service](https://render.com/).
2. Connect the GitHub repository: `CBrownJr8823/agrisight-precision-agriculture-platform`.
3. Use Python 3.11 or a backend-focused Docker deployment.
4. Configure the start command:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

5. Configure `DATABASE_URL` as a Render PostgreSQL connection string for persistent production telemetry.
6. Copy the deployed Render URL into Vercel as `NEXT_PUBLIC_API_URL`.

### Production CORS configuration

The starter API permits local Next.js origins. Before deploying, replace the local-only CORS origins in `backend/main.py` with your production frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-vercel-project.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

Avoid using `allow_origins=["*"]` with credentialed browser requests in production.

## Quality checks

Run the TypeScript compiler check:

```bash
npm run typecheck
```

Build the optimized Next.js application:

```bash
npm run build
```

The GitHub Actions workflow runs frontend type checking, the production frontend build, and backend model/API import validation on pushes and pull requests to `main`.

## Production hardening roadmap

This implementation is intentionally runnable without external model artifacts or cloud dependencies. Before using it for operational agricultural decisions, add the following controls:

- Train and validate crop-specific computer-vision models using representative, labeled field imagery across lighting, seasons, cultivars, and disease progression stages.
- Replace the synthetic yield-training data with historical farm, weather, soil, remote-sensing, and management-practice data.
- Track model versions, predictions, user feedback, drift indicators, calibration, confidence thresholds, and human-review outcomes.
- Introduce identity management, role-based access control, image/object storage, API rate limiting, request validation, audit logs, and secrets management.
- Use managed PostgreSQL, migrations such as Alembic, automated backups, observability, and error monitoring.
- Add PostGIS parcel geometry, satellite imagery ingestion, sensor integrations, weather data providers, and spatial analytics.
- Require local agronomist review and regionally applicable extension guidance before treatment or nutrient recommendations are acted upon.

## Author

**Corey Brown**  
AI Engineer · Solutions Architect · Full-Stack & Machine Learning Engineer

- GitHub: [@CBrownJr8823](https://github.com/CBrownJr8823)
- Repository: [CBrownJr8823/agrisight-precision-agriculture-platform](https://github.com/CBrownJr8823/agrisight-precision-agriculture-platform)

## License

Add a license that fits your intended use before publishing for reuse. The MIT License is a common option for an open-source portfolio project.
