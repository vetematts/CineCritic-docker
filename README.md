# 🐳 CineCritic Docker

Container orchestration for the CineCritic frontend, backend, and PostgreSQL database.

## Contents

- [Repositories](#-repositories)
- [Service Architecture](#-service-architecture)
- [Prerequisites](#-prerequisites)
- [Hardware Requirements](#-hardware-requirements)
- [Install Instructions](#-install-instructions)
- [Commands](#-commands)
- [Database Seed](#-database-seed)
- [Access URLs](#-access-urls)
- [Environment Variables](#-environment-variables)
- [CI](#-ci)
- [Deployment Flow](#-deployment-flow)
- [Technology Choices and Alternatives](#-technology-choices-and-alternatives)

## 📂 Repositories

- Docker orchestration: https://github.com/vetematts/CineCritic

## 🧱 Service Architecture

- `frontend`: React + Vite development server
- `backend`: Node.js + Express API
- `db`: PostgreSQL 16 (Alpine)
- `cinecritic-network`: shared bridge network for service-to-service communication
- `db_data`: named Docker volume for persistent Postgres data

## 🧩 Application Architecture (AAD)

In standard execution, CineCritic runs as three Docker services managed by Docker Compose: a React/Vite frontend (`frontend`), a Node/Express API (`backend`), and a PostgreSQL database (`db`). The user’s browser accesses the frontend at `http://localhost:5173`, and the frontend calls the backend over HTTP using `VITE_API_BASE_URL` (default `http://localhost:4000`). The backend applies middleware (Helmet, CORS), reads and writes data in Postgres over the internal `cinecritic-network` (`db:5432`), and calls the external TMDB API over HTTPS using `TMDB_API_KEY`. Environment variables are loaded from `.env` for local runs, and from GitHub Actions secrets when the CI workflow builds the images.

<img width="2123" height="860" alt="CineCritic-docker AAD drawio" src="https://github.com/user-attachments/assets/6a322742-e510-4736-aaad-f9bcc5c1ae88" />


## 🔧 Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Git

Verify Docker:

```bash
docker --version
docker compose version
```

## 💻 Hardware Requirements

- CPU: modern dual-core (or better)
- RAM: 4 GB minimum (8 GB recommended for running frontend + backend + Postgres)
- Disk: ~1 GB for Docker images, plus database volume growth over time

## 🛠️ Install Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/vetematts/CineCritic-docker.git
   cd CineCritic-docker
   ```
2. **Create `.env` from template**
   ```bash
   cp .env.example .env
   ```
3. **Set required values in `.env`**
   - `TMDB_API_KEY`
   - `JWT_SECRET`
   - `POSTGRES_PASSWORD`
4. **Build and start the containers**
   ```bash
   docker compose up --build -d
   ```

## 🧪 Commands

- `docker compose up -d` - start existing containers
- `docker compose up --build -d` - rebuild images and start containers
- `docker compose down` - stop and remove containers/networks
- `docker compose logs -f` - view logs
- `docker compose ps` - show service status and ports

## 🌱 Database Seed

Run the seed after containers are running:

```bash
docker compose run --rm backend npm run seed
```

Use this as a manual one-off command. It does not run during image build.

## 🚀 Access URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/docs`
- PostgreSQL: `localhost:5432`

## ⚙️ Environment Variables

Compose reads runtime values from the root `.env` file.

Core variables:

- `VITE_API_BASE_URL`
- `DATABASE_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `TMDB_API_KEY`

## CI

Workflows:

- **CI** — lint and test (frontend and backend); uploads **`ci-test-logs`** artifacts on each run.
- **Docker Build** — `docker compose build` to verify images; uses **placeholder** env values so **pull requests do not need secrets** (build does not start the database). Uploads **`docker-build-logs`**.
- **Docker Publish** — after **CI** succeeds on `main`/`master`, builds and pushes images to **Google Artifact Registry**, or run manually from **Actions**.
- **Deploy Cloud Run** — **manual only** (`workflow_dispatch`). Deploys the published Artifact Registry images to Cloud Run using production runtime variables and a selected GitHub Environment.

## Deployment Flow

The pipeline is split into separate stages:

1. **CI** validates the frontend and backend with linting and tests.
2. **Docker Build** verifies that the container images build correctly on a Linux runner.
3. **Docker Publish** pushes versioned images to **Google Artifact Registry** after validation succeeds.
4. **Deploy Cloud Run** is triggered manually when a deployment is required and is tied to a selected GitHub Environment.

Cloud Run deployment is kept manual so the application can be fully prepared and verified without creating unnecessary cloud runtime costs during normal development.

For **local** runs, set `JWT_SECRET`, `TMDB_API_KEY`, and `POSTGRES_PASSWORD` in `.env` (see `.env.example`).  
For **GitHub Actions**, keep app runtime secrets separate from pipeline secrets:

- **Docker Build** does not require real app secrets
- **Docker Publish** requires GCP authentication and Artifact Registry configuration secrets
- **Deploy Cloud Run** requires both GCP auth secrets and deploy-time runtime secrets

Path: **Settings → Secrets and variables → Actions**

### Where environment variables live

| Place | What it is for |
| ----- | ---------------- |
| **`.env` (local, not committed)** | Running `docker compose` on your machine (`DATABASE_URL`, `JWT_SECRET`, `TMDB_API_KEY`, etc.). |
| **GitHub Actions → Secrets** | Values the **workflows** need (for example GCP authentication, Artifact Registry configuration, and deploy-time runtime variables passed into `gcloud run deploy`). CI and Docker Build do **not** need your real app secrets. |
| **Cloud Run (or Secret Manager)** | What the **running containers** use in GCP. The deploy workflow passes secrets from GitHub into Cloud Run **at deploy time**; you can later move DB/passwords to **Secret Manager** only and reference them from Cloud Run. |

### Deploy to Cloud Run (when you are ready)

1. **Images** — Run **Docker Publish** so `cinecritic-frontend` and `cinecritic-backend` are published to your Artifact Registry repository with `latest` and short-SHA tags.
2. **GCP** — Create a **service account** with permission to push to Artifact Registry and deploy to Cloud Run. Download JSON and add it to GitHub as **`GCP_SA_KEY`**. Add **`GCP_PROJECT_ID`**, **`GCP_ARTIFACT_REGISTRY_REGION`**, and **`GCP_ARTIFACT_REGISTRY_REPOSITORY`** as secrets.
3. **App secrets for production DB** — Add GitHub secrets used only by deploy: **`RUN_DATABASE_URL`**, **`RUN_JWT_SECRET`**, **`RUN_TMDB_API_KEY`** (production Postgres URL and keys — not your local `.env` if those differ).
4. **GitHub Environment** — Create an environment such as `production` or `staging` if you want deployment approvals or environment-scoped secrets.
5. **Run workflow** — **Actions → Deploy Cloud Run → Run workflow** and choose the target GitHub Environment, region, and image tag.

The frontend service gets **`VITE_API_BASE_URL`** set automatically to the **backend** Cloud Run URL after the backend deploy step. If `DATABASE_URL` contains characters that break `gcloud --set-env-vars`, use **Secret Manager** bindings instead and adjust the workflow.

## 🧭 Technology Choices and Alternatives

### Docker + Docker Compose

- **Purpose:** Standard local orchestration for running a multi-service app (frontend, API, database) together.
- **Why chosen:** Simple, repeatable environment; service-name networking; easy for assessors/devs to run.
- **Alternatives:** Run services directly on the host; Kubernetes (too heavy for this scope).

### GitHub Actions (CI/CD)

- **Purpose:** Run lint/tests, verify container builds, publish images, and optionally deploy.
- **Why chosen:** Native to GitHub repos, fast setup, good ecosystem (Docker + Google actions), clear audit trail.
- **Alternatives:** GitLab CI, Jenkins, CircleCI.

### Container registry (Google Artifact Registry)

- **Purpose:** Store built images (`cinecritic-frontend`, `cinecritic-backend`) inside the same cloud platform used for deployment.
- **Why chosen:** Keeps image storage and deployment in GCP, simplifies the architecture story, and avoids cross-platform registry dependencies.
- **Alternatives:** GHCR, Docker Hub.

### Google Cloud Run (deployment target)

- **Purpose:** Deploy containers without managing servers.
- **Why chosen:** Straightforward container deploy, autoscaling, and easy rollbacks via revisions.
- **Alternatives:** GCE/EC2 (more ops), Kubernetes (more complexity).
