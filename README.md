# CineCritic-docker
Containerised full-stack application for CineCritic

---

## CI

The build workflow uses repository secrets. Add `JWT_SECRET`, `TMDB_API_KEY`, and `POSTGRES_PASSWORD` under **Settings → Secrets and variables → Actions**. It runs on push to `main`/`master` or via **Actions → Docker build → Run workflow**.
