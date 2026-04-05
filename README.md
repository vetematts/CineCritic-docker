# 🐳 CineCritic Docker

Container orchestration for the CineCritic frontend, backend, and PostgreSQL database.

## Contents

- [Repositories](#-repositories)
- [Service Architecture](#-service-architecture)
- [Prerequisites](#-prerequisites)
- [Install Instructions](#-install-instructions)
- [Commands](#-commands)
- [Database Seed](#-database-seed)
- [Access URLs](#-access-urls)
- [Environment Variables](#-environment-variables)
- [CI](#-ci)

## 📂 Repositories

- Docker orchestration: https://github.com/vetematts/CineCritic-docker

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
- **Docker Publish** — after **CI** succeeds on `main`/`master`, builds and pushes images to **GitHub Container Registry** (`ghcr.io`), or run manually from **Actions**.

For **local** runs, set `JWT_SECRET`, `TMDB_API_KEY`, and `POSTGRES_PASSWORD` in `.env` (see `.env.example`). Add the same as **repository secrets** if a workflow or deploy step you add later needs them; **Docker Build** and **Docker Publish** (as configured here) do not require those secrets.

Path: **Settings → Secrets and variables → Actions**
