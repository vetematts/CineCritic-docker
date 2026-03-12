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

GitHub Actions requires these repository secrets:

- `JWT_SECRET`
- `TMDB_API_KEY`
- `POSTGRES_PASSWORD`

Path: **Settings -> Secrets and variables -> Actions**

Workflow triggers on push to `main`/`master` and via manual run in **Actions -> Docker build -> Run workflow**.
