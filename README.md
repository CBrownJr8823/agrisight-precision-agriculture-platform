# AgriSight — Precision Agriculture & Vision Analytics Platform

A full-stack precision-agriculture dashboard that combines interactive field telemetry, crop-image diagnostics, and a tabular yield/fertilizer recommendation engine.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_GITHUB_USERNAME/precision-agriculture-vision-analytics-platform)
[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_GITHUB_USERNAME/precision-agriculture-vision-analytics-platform)

> Replace `YOUR_GITHUB_USERNAME` in these links after pushing the repository.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ Next.js 14 App Router                                        │
│ Dashboard · Recharts · Lucide · mock-mode resiliency         │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP / multipart
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ FastAPI                                                      │
│ /health · /diagnose-crop · /predict-yield · /field-history  │
└──────────────┬──────────────────────────────┬───────────────┘
               ▼                              ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│ OpenCV Vision Screening  │      │ Scikit-Learn RandomForest │
│ color/stress region box  │      │ NPK + pH + climate yield  │
└──────────────────────────┘      └──────────────────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
                    SQLite / SQLAlchemy Async
                 (PostgreSQL-ready DB URL seam)
```

## Features

- Interactive parcel status and soil-moisture heatmap.
- Drag-and-drop crop-image diagnostics with confidence, severity, treatment protocol, and optional detection coordinates.
- Soil, climate, N-P-K, and pH controls with live yield comparison chart.
- Automatic frontend fallback data if the API cannot be reached.
- Async SQLAlchemy event history suitable for migration to PostgreSQL/PostGIS.
- Dockerized local deployment and GitHub Actions validation.

## Local setup

### Prerequisites

- Node.js 20+
- Python 3.11+

### Run frontend and backend together

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/precision-agriculture-vision-analytics-platform.git
cd precision-agriculture-vision-analytics-platform
npm install
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Run with Docker

```bash
docker compose up --build
```

The dashboard starts on port 3000 and FastAPI starts on port 8000.

## Environment variables

Copy `.env.example` to `.env.local` for the browser build and configure the following as needed:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Public FastAPI URL used by the Next.js client |
| `DATABASE_URL` | `sqlite+aiosqlite:///./agrisight.db` | Async SQLAlchemy connection string |

For PostgreSQL, use an async driver URL such as `postgresql+asyncpg://user:password@host:5432/agrisight` and add `asyncpg` to the backend requirements.

## API specification

| Method | Route | Request | Response |
|---|---|---|---|
| `GET` | `/api/v1/health` | None | Service, DB, and model readiness |
| `POST` | `/api/v1/diagnose-crop` | Multipart `file` image | Disease screen, confidence, severity, treatment, box |
| `POST` | `/api/v1/predict-yield` | JSON N-P-K, pH, rainfall, temperature | Projected and baseline yield plus fertilizer recommendation |
| `GET` | `/api/v1/field-history?limit=25` | Optional limit | Most recent prediction/diagnostic logs |

### Example yield request

```bash
curl -X POST http://localhost:8000/api/v1/predict-yield \
  -H "Content-Type: application/json" \
  -d '{"nitrogen":84,"phosphorus":39,"potassium":172,"ph":6.4,"rainfall":28,"temperature":79}'
```

## Deployment

### Vercel frontend

1. Import the GitHub repository into Vercel.
2. Set `NEXT_PUBLIC_API_URL` to your public Render API URL.
3. Deploy. `vercel.json` configures the Next.js framework build.

### Render API

Create a Render **Web Service** using this repository:

- Runtime: Docker
- Dockerfile path: `./Dockerfile`
- Exposed backend port: `8000`

For separate production services, use a backend-only Dockerfile or configure Render to run `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` after installing `backend/requirements.txt`. Configure CORS origins in `backend/main.py` for your Vercel domain before production use.

## Model limitations and production path

The included vision engine performs deterministic OpenCV stress screening rather than medical- or agronomy-certified disease detection. The yield engine trains a deterministic Random Forest on synthetic response curves at startup, making the repository runnable without a model artifact.

Before operational agronomic use:

- Train and validate detection/classification models against representative, labeled local crop imagery.
- Version models and track performance, drift, inference data, and human review outcomes.
- Use local soil-test calibration, crop variety, growth stage, and extension recommendations.
- Add authentication, object storage, rate limiting, audit logging, and secrets management.
