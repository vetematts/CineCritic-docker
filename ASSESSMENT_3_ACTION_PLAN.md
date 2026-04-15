# DEV1004 Assessment 3 Action Plan

## Note on repo presentation

This file is an **internal planning document** for tracking CI/CD improvements and documentation upgrades.

- The **application repository itself** (code, workflows, and `README.md`) is written and maintained as a **production-ready project**.
- Public-facing docs should avoid “assignment”, “rubric”, “todo”, or “planning” language. Keep explanations concise, professional, and consistent with the CineCritic project tone.
- Evidence images (if included in-repo) belong under `docs/screenshots/` and are referenced optionally from `README.md` without checklist-style wording.

## Goal

Build a proper CI/CD pipeline for CineCritic that is:

- logically staged across small, reviewable commits
- aligned with Google Cloud deployment
- stronger on production readiness than the previous container assignment

This plan also corrects the main issues raised in earlier feedback:

- use more production-ready container practices
- separate development and production concerns more clearly
- keep ignore files targeted to the actual project

## Current Starting Point

The repository already has:

- a working React frontend and Node/Express backend
- Dockerfiles and Docker Compose for local orchestration
- four GitHub Actions workflows: CI, Docker Build, Docker Publish, Deploy Cloud Run
- lint and test runs with artifact upload in CI
- `workflow_run` dependent trigger in Docker Publish
- Cloud Run deployment with environment-specific secrets and service URL capture
- a README with technology choices and deployment instructions

The remaining work is not rebuilding — it is five targeted commits that move specific rubric items from Distinction to High Distinction.

## Delivery Strategy

Use Google Cloud as the deployment target:

- Artifact Registry for Docker images
- Cloud Run for service deployment
- Secret Manager for runtime secrets

This is a good fit because it keeps the pipeline modern and simple:

- GitHub Actions handles CI and CD
- Docker images remain first-class deployment artefacts
- Cloud Run avoids unnecessary Kubernetes complexity for this scope

## Bloggy-API Comparison Notes

Key patterns from Bloggy-API worth adopting (addressed in Commits A–E below):

| Bloggy pattern | CineCritic equivalent | Status |
| --- | --- | --- |
| `jest-junit` + `jest.config.js` for XML reports | Add to `backend/` | ❌ Missing — **Commit A** |
| Cron schedule trigger in CI | Add to `ci.yml` | ❌ Missing — **Commit A** |
| `screenshots/` folder with evidence checklist | Add to repo root | ❌ Missing — **Commit E** |
| `workflow_run` dependent deploy trigger | `docker-publish.yml` already uses this | ✅ Done |
| Artifact upload for test results | `ci-test-logs` artifact already uploaded | ✅ Done |
| `.env.example` | Root, frontend, and backend all have one | ✅ Done |

The following parts of the Bloggy example are **not** worth copying:

- AWS-specific tooling (ECR, ECS, CloudWatch) — this project targets GCP
- scheduled deployments — manual deploy is cleaner for this scope
- any complexity that obscures the CI/CD story in the documentation

## Comments (workflow and pipeline code)

For any future commits that touch workflows, Docker, or deployment glue code:

- add comments only where behaviour is **not obvious** from the YAML or Dockerfile alone
- keep comments **short and to the point**, in the same tone as the rest of the repo
- avoid long “essay” comments or assessment-style narration

DRY optimisation target:

- where steps repeat (node setup, install, lint/test, docker metadata), prefer a **reusable workflow** (`workflow_call`) or a small **composite action** under `.github/actions/` to reduce duplication and keep pipeline code maintainable

## Rubric Snapshot (HD criteria)

These are the exact HD requirements from the marking rubric. Every next commit below is mapped to one or more of these.

| Rubric item | Weight | HD requires |
| --- | --- | --- |
| Valid workflow files | 10% | Completely semantically and syntactically valid |
| Automate testing | 15% | Stores logs in a **persistent location** (D = custom log file from test results) |
| Automate deployment | 15% | **Preserves deployment revisions** in a cloud hosting service |
| Triggers | 10% | **Two** complex triggers (conditions, schedules, or dependent workflows) |
| Optimised scripts | 10% | Custom action/plugin **or** export workflow files as downloadable items **or** export data to reuse in additional workflows |
| Explains purpose and functionalities | 20% | **Extensive** explanation of **all** purposes and functionalities, with **diagrams and examples** |
| Explains relations and dependencies | 20% | **Extensive** explanation of **all** services and technologies, comparison to **alternatives**, with **diagrams and examples** |

---

## Commit-by-Commit Plan

### Commit 1 ✅ DONE

**Commit message:** `docs: add assessment 3 delivery plan`

Added this action plan before pipeline changes began.

---

### Commit 2 ✅ DONE

**Commit message:** `chore: tighten ignore files for current project structure`

Cleaned up `.gitignore` and related ignore files to remove boilerplate entries unrelated to this project.

---

### Commit 3 ✅ DONE

**Commit message:** `build: pin runtime image versions for reproducible builds`

Replaced loose base image tags with explicit pinned versions for backend, frontend, and Postgres.

---

### Commits 4–5 — deferred

**Original idea:** multi-stage production Dockerfiles and separate `docker-compose.prod.yml`

**Decision:** Skip for this assessment cycle. Assessment 3 is centred on CI/CD workflows, not a second container story. Revisit only if a clear production Dockerfile target is needed later.

---

### Commit 6 ✅ DONE

**Commit message:** `ci: harden validation workflow for frontend and backend`

`ci.yml` now runs lint and tests for both frontend and backend, writes output to `ci-artifacts/test-logs/` via `tee`, and uploads the directory as the `ci-test-logs` artifact with 30-day retention.

**Remaining gap (see Commit A below):** The artifact currently holds raw stdout logs. The rubric D/HD criterion for testing specifically rewards a *custom log file built from test results* (e.g. JUnit XML), not just piped output. A structured XML report is needed to cleanly hit D and HD.

---

### Commit 7 ✅ DONE

**Commit message:** `ci: build docker images in workflow`

`docker-build.yml` verifies that both images build cleanly on a Linux runner and uploads `docker-build-logs` as an artifact.

---

### Commit 8 ✅ DONE

**Commit message:** `ci: publish images to container registry`

`docker-publish.yml` triggers via `workflow_run` after CI succeeds on `main`, builds both images with `docker/metadata-action` (short-SHA + `latest` tags), and pushes to Google Artifact Registry.

---

### Commit 9 ✅ DONE

**Commit message:** `cd: add cloud run deployment workflow`

`deploy-cloud-run.yml` deploys backend then frontend to Cloud Run via manual `workflow_dispatch`, injects `DATABASE_URL`, `JWT_SECRET`, `TMDB_API_KEY`, and `NODE_ENV=production` at deploy time, and writes service URLs to `$GITHUB_STEP_SUMMARY`.

**Remaining gap (see Commit C below):** The Cloud Run *revision name* is not yet captured or stored. The rubric HD criterion for deployment specifically requires *preserving deployment revisions in a cloud hosting service*.

---

### Commit A — NEXT

**Commit message:** `ci: add jest-junit xml report and cron schedule to ci workflow`

**Rubric targets:** Testing HD (custom log file + persistent location) · Triggers HD (second complex trigger)

**Objective**

Replace raw `tee` log output with a proper JUnit XML test report for the backend, and add a weekly cron schedule to `ci.yml` so the project has two distinct complex triggers.

**Work**

- add `jest-junit` to `backend/devDependencies` (`npm install --save-dev jest-junit`)
- add `backend/jest.config.js`:
  ```js
  module.exports = {
    reporters: [
      'default',
      ['jest-junit', { outputName: 'test-results.xml' }]
    ],
    testEnvironment: 'node'
  };
  ```
- update the backend test step in `ci.yml` to pass `--ci` so jest-junit writes the XML:
  ```yaml
  - name: Test backend
    working-directory: backend
    run: npm test -- --ci 2>&1 | tee ../ci-artifacts/test-logs/backend-jest.log
  ```
- add an upload step for the XML report specifically:
  ```yaml
  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: backend-test-results
      path: backend/test-results.xml
      retention-days: 30
  ```
- add a weekly cron schedule to `ci.yml` (second complex trigger alongside `workflow_run` in docker-publish):
  ```yaml
  schedule:
    - cron: '15 3 * * 0'  # Every Sunday at 1:15pm Melbourne time
  ```
- add `workflow_dispatch` to `ci.yml` if not already present (manual trigger for testing)

**Why this commit**

The rubric distinguishes between *running tests with default output* (Pass), *formatted output* (Credit), *custom log file from test results* (Distinction), and *storing logs in a persistent location* (HD). A JUnit XML file uploaded as an artifact is the clearest proof of D+HD. The cron schedule is a second *complex* trigger (a schedule counts as complex per the rubric), bringing the project to HD on the triggers criterion.

**After this commit the rubric score moves:**
- Testing: → HD
- Triggers: → HD (two complex triggers: `schedule` in ci.yml + `workflow_run` in docker-publish.yml)

---

### Commit B — NEXT

**Commit message:** `ci: extract composite action for shared node setup`

**Rubric targets:** Optimised scripts HD (custom action/plugin)

**Objective**

Both `ci.yml` and `docker-build.yml` repeat the same Node.js setup and `npm ci` pattern. Extract it into a local composite action so the DRY requirement is structurally enforced, and to satisfy the HD criterion which specifically rewards writing a custom action/plugin.

**Work**

- create `.github/actions/node-setup/action.yml`:
  ```yaml
  name: Node setup
  description: Check out, set up Node 24, and restore npm cache for a given working directory
  inputs:
    working-directory:
      description: Subdirectory containing package-lock.json
      required: true
  runs:
    using: composite
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
          cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json
      - run: npm ci
        shell: bash
        working-directory: ${{ inputs.working-directory }}
  ```
- replace the repeated `actions/setup-node` + `npm ci` blocks in `ci.yml` with calls to this action:
  ```yaml
  - uses: ./.github/actions/node-setup
    with:
      working-directory: frontend
  - uses: ./.github/actions/node-setup
    with:
      working-directory: backend
  ```

**Why this commit**

The rubric HD criterion for optimised scripts requires *writing a custom action/plugin to use within a workflow*. A local composite action is the simplest form of this. It also satisfies the brief's DRY programming requirement structurally, which is stronger than just using env vars and secrets.

**After this commit the rubric score moves:**
- Optimised scripts: → HD

---

### Commit C — NEXT

**Commit message:** `cd: capture and store cloud run revision name in deployment artifact`

**Rubric targets:** Deployment HD (preserves deployment revisions in a cloud hosting service)

**Objective**

Cloud Run automatically creates a new numbered revision on every deploy. The current workflow writes the service URL to `$GITHUB_STEP_SUMMARY` but does not capture or store the revision name. Adding explicit revision capture satisfies the HD criterion.

**Work**

- after the backend deploy step in `deploy-cloud-run.yml`, add a step that reads the latest revision name from Cloud Run:
  ```yaml
  - name: Capture backend revision
    id: backend_revision
    env:
      GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
    run: |
      REV=$(gcloud run revisions list \
        --service "$BACKEND_SERVICE_NAME" \
        --project "$GCP_PROJECT_ID" \
        --region "$DEPLOY_REGION" \
        --format 'value(metadata.name)' \
        --limit 1)
      echo "revision=$REV" >> "$GITHUB_OUTPUT"
      echo "Backend revision: $REV" >> "$GITHUB_STEP_SUMMARY"
  ```
- repeat the same pattern for the frontend revision
- write a deployment summary file and upload it as an artifact:
  ```yaml
  - name: Write deployment summary artifact
    run: |
      {
        echo "environment: ${DEPLOY_ENVIRONMENT}"
        echo "region: ${DEPLOY_REGION}"
        echo "image_tag: ${IMAGE_TAG}"
        echo "backend_revision: ${{ steps.backend_revision.outputs.revision }}"
        echo "backend_url: ${{ steps.backend_url.outputs.url }}"
      } > deployment-summary.txt

  - uses: actions/upload-artifact@v4
    with:
      name: deployment-summary
      path: deployment-summary.txt
      retention-days: 90
  ```

**Why this commit**

The rubric HD criterion for deployment is *preserves deployment revisions in a cloud hosting service*. Capturing the Cloud Run revision name and storing it as a downloadable artifact is direct evidence of this. It also doubles as clear screenshot material for submission.

**After this commit the rubric score moves:**
- Deployment: → HD

---

### Commit D — NEXT

**Commit message:** `docs: expand readme with full workflow walkthrough, architecture diagrams, and tool comparisons`

**Rubric targets:** Explains purpose and functionalities HD (20%) · Explains relations and dependencies HD (20%)

**Objective**

The README currently has brief sections for CI, Deployment Flow, and Technology Choices. For HD on both documentation rubric items, it needs *extensive explanation of all purposes and functionalities*, *all services and technologies with comparison to alternatives*, and both **diagrams and examples** in each section.

**Work**

Add or expand these sections in `README.md`:

**CI/CD Pipeline section** — step-by-step walkthrough of every workflow file:
- `ci.yml`: triggers (push, pull_request, schedule), every step explained (checkout, node setup via composite action, lint, test, JUnit XML upload), what the artifact contains and how to download it
- `docker-build.yml`: when it runs, what it verifies, what the build-log artifact shows
- `docker-publish.yml`: how `workflow_run` chains it to CI, the matrix strategy for frontend/backend, metadata-action tag scheme (short-SHA + latest), how to find published images in Artifact Registry
- `deploy-cloud-run.yml`: manual dispatch inputs (environment, region, tag), backend deploy → URL capture → frontend deploy sequence, revision artifact, how environment-specific secrets are injected

**Required secrets table** — list every GitHub secret with what it is for and which workflow uses it:

| Secret | Used by | Purpose |
| --- | --- | --- |
| `GCP_SA_KEY` | Publish, Deploy | Service account JSON for GCP auth |
| `GCP_PROJECT_ID` | Publish, Deploy | GCP project identifier |
| `GCP_ARTIFACT_REGISTRY_REGION` | Publish, Deploy | Region for Artifact Registry |
| `GCP_ARTIFACT_REGISTRY_REPOSITORY` | Publish, Deploy | Repository name in Artifact Registry |
| `RUN_DATABASE_URL` | Deploy | Production Postgres connection string |
| `RUN_JWT_SECRET` | Deploy | JWT signing key for production |
| `RUN_TMDB_API_KEY` | Deploy | TMDB API key for production |

**GCP deployment architecture diagram** — a diagram (draw.io or Mermaid) showing the relationship between:
- GitHub Actions runner → Google Artifact Registry → Cloud Run (backend service) → Cloud SQL / Postgres
- GitHub Actions runner → Google Artifact Registry → Cloud Run (frontend service) → Cloud Run backend
- GitHub Secrets → deploy workflow → Cloud Run env vars at deploy time

**Technology comparisons section** — expand the existing brief bullets into a table with alternatives for every tool:

| Tool | What it does in this project | Why chosen | Key alternatives |
| --- | --- | --- | --- |
| GitHub Actions | Orchestrates CI, image publish, and deploy | Native GitHub integration, matrix builds, artifact upload built in, large action ecosystem | GitLab CI, CircleCI, Jenkins |
| Google Artifact Registry | Stores versioned Docker images | Same platform as Cloud Run, IAM-based access, supports multi-region | Docker Hub, GitHub Container Registry (GHCR), AWS ECR |
| Google Cloud Run | Runs containers without managing servers | Serverless, revision tracking built in, automatic HTTPS, scales to zero | GKE (more ops overhead), AWS ECS Fargate, AWS App Runner |
| Docker + Compose | Local multi-service orchestration | Portable, reproducible dev environment matching CI image build | Podman Compose, Nix, bare host processes |
| PostgreSQL | Relational database for reviews, users, watchlist | Supported by Cloud SQL, used in local Compose stack | MySQL, MongoDB (not relational), SQLite (not production-grade) |

**Examples** — add concrete examples in the workflow walkthrough:
- an example of downloading the `ci-test-logs` artifact from GitHub Actions
- an example of triggering Docker Publish manually via the Actions tab
- an example of running Deploy Cloud Run with a specific SHA tag

**Why this commit**

The two documentation rubric items together are worth 40% of the total mark. Both require *extensive* explanations covering *all* items, with *diagrams and examples*. The current README has good structure but covers each area briefly. This commit turns brief bullets into full explanations with a diagram and concrete examples for every workflow and technology choice.

**After this commit the rubric score moves:**
- Explains purpose and functionalities: → HD
- Explains relations and dependencies: → HD

---

### Commit E — NEXT

**Commit message:** `docs: add screenshots directory and submission evidence checklist`

**Rubric targets:** Submission readiness (all rubric items depend on evidence)

**Objective**

Like the Bloggy-API example, add a `screenshots/` directory to the repo so every piece of required submission evidence has a named placeholder and checklist. This makes the final submission structured and reviewable.

**Work**

- create `screenshots/README.md` with an ordered checklist of required screenshots:

```
1. ci-success.png         — successful CI run showing all steps green
2. test-artifact.png      — GitHub Actions artifact panel showing backend-test-results and ci-test-logs
3. junit-xml.png          — contents of test-results.xml downloaded from the artifact
4. docker-build-logs.png  — docker-build workflow run showing build logs artifact
5. publish-success.png    — Docker Publish run showing both frontend and backend images pushed
6. artifact-registry.png  — Google Artifact Registry UI showing latest and sha-* tagged images
7. deploy-success.png     — Deploy Cloud Run run showing all steps green
8. revision-artifact.png  — deployment-summary artifact showing Cloud Run revision name
9. cloud-run-backend.png  — Google Cloud Run UI showing backend service and active revision
10. cloud-run-frontend.png — Google Cloud Run UI showing frontend service and active revision
11. live-url.png           — browser showing the deployed CineCritic frontend URL
```

- add placeholder filenames for each screenshot (can be empty files or a note that screenshots are added before submission)

**Why this commit**

Assessment marks depend almost as much on submission evidence as on the working code. Having a named checklist in the repo means nothing is forgotten before the final zip is submitted.

---

### Commit 10 — hold until after Commits A–E

**Commit message:** `security: move deployment secrets to google secret manager`

**Objective**

Harden runtime secret handling by moving JWT secret, TMDB key, and database credentials to Secret Manager and binding them to the Cloud Run services.

**Work**

- create secrets in GCP Secret Manager for `JWT_SECRET`, `TMDB_API_KEY`, `DATABASE_URL`
- update `deploy-cloud-run.yml` to bind secrets at deploy time using `--set-secrets` instead of `--set-env-vars` for sensitive values:
  ```yaml
  gcloud run deploy "$BACKEND_SERVICE_NAME" \
    --set-secrets "JWT_SECRET=jwt-secret:latest,TMDB_API_KEY=tmdb-api-key:latest,DATABASE_URL=database-url:latest"
  ```
- grant the Cloud Run service account `roles/secretmanager.secretAccessor`
- remove `RUN_JWT_SECRET`, `RUN_TMDB_API_KEY`, `RUN_DATABASE_URL` from GitHub Secrets once Secret Manager bindings are confirmed working
- document the secret ownership and injection path in the README secrets table

**Why here**

Rubric HD for optimised scripts awards using secrets in an *optimal, secure way*. Moving secrets from GitHub → injected env vars (currently done) to GitHub → Secret Manager → Cloud Run binding is the most secure pattern. This also addresses the rubric's explicit mention of `security: encrypted keys`.

**Note:** Only attempt this after Commits A–E are done and the pipeline is running. Secret Manager setup requires a working GCP project with billing enabled. If time is tight, the current GitHub Secrets approach already covers the Distinction criterion for secrets — this is the HD hardening step.

---

### Commit 11 — final documentation polish

**Commit message:** `docs: finalise ci-cd guide with updated diagrams and evidence links`

After Commit D expands the README and Commit 10 moves secrets to Secret Manager, do a final pass to:

- update the secrets table to reflect Secret Manager bindings
- confirm all diagrams reflect the final architecture
- add any remaining evidence links or deployment output examples captured during the final run

---

### Commit 12 — submission wrap-up

**Commit message:** `chore: final pipeline verification and screenshot submission`

**Objective**

Confirm every workflow passes from a clean push, capture all required screenshots, and close the assignment.

**Checklist**

- push a PR to verify CI runs on `pull_request`
- merge to `main` to verify Docker Publish fires via `workflow_run`
- manually trigger Deploy Cloud Run and verify service URLs resolve
- download and inspect `backend-test-results` (JUnit XML), `ci-test-logs`, `docker-build-logs`, and `deployment-summary` artifacts
- fill the `screenshots/` directory with the named screenshots from the checklist in Commit E
- confirm all rubric items are covered before submitting via Canvas

---

## Immediate Next Steps

Work through Commits **A → B → C → D → E** in order. Each one is a small, focused change that directly moves a rubric item from its current level to HD. After those five commits the pipeline will be complete and the documentation will be ready for final submission.

**Commit A** is the highest priority — the JUnit XML report and cron schedule directly improve the two rubric items (testing and triggers) that are currently below HD.

## Recommended Workflow Behaviour

For this assignment, the cleanest final pipeline shape is:

1. Pull request opens or updates → CI runs lint, tests, and uploads JUnit XML + raw logs as artifacts
2. Merge to `main` → Docker Publish fires via `workflow_run`, pushes `sha-*` and `latest` images to Artifact Registry
3. Manual deploy → Deploy Cloud Run fires via `workflow_dispatch`, deploys selected tag, captures revision name and URL, uploads deployment summary artifact
4. Weekly cron → CI re-runs on schedule to catch dependency drift

Trigger wiring (rubric-aligned):

| Workflow | Complex trigger | Why complex |
| --- | --- | --- |
| `ci.yml` | `schedule` (cron) | Schedule = complex per rubric |
| `docker-publish.yml` | `workflow_run` with `if:` condition | Dependent workflow + condition = complex per rubric |

## What To Avoid

- do not mix development-only Docker behaviour into production deployment jobs
- do not use broad base image tags where reproducibility matters
- do not leave generic ignore rules unrelated to the project
- do not deploy directly from an unverified branch
- do not make CI and CD one large workflow — keep them modular so each rubric item is clearly visible
