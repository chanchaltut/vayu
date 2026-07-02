# VAYU — CleanAir & Clear Streets

Spotting and fixing hyper-local pollution hotspots that city-level air quality apps miss — garbage dump fires, industrial clusters, smog traps at busy junctions — using citizen photos, Arduino sensors, and satellite imagery, fused through Google Cloud AI.

**Track 2: CleanAir & Clear Streets**

## The Problem

City-level air quality apps miss hyper-local events because authorities can't have eyes on every street. These pollution pockets go unnoticed while directly harming nearby residents.

## The Solution

A neighbourhood-level pollution map combining:
- Citizen-uploaded photos of smoke/dust
- Local Arduino sensor readings (PM2.5/smoke)
- Satellite imagery (Earth Engine feed)

The system automatically detects hidden pollution hotspots, predicts air quality spikes over the next 24 hours, and alerts municipal teams so they can deploy resources (water-mist cannons, cleanup crews) exactly where needed.

## Architecture

```
Inputs                          Google Cloud AI Layer              Outputs
─────────────                   ──────────────────────             ─────────────────
Citizen photos    ──┐                                          ┌──> Live hotspot map
(smoke/dust)         │                                          │     (Google Maps)
                      ├──>  Vertex AI Vision (smoke detection)  │
Arduino sensors   ──┤        BigQuery + Gemini (data fusion)  ──┤
(PM2.5/smoke)         │        Forecast model (24h AQI spikes)   │
                      │                                          └──> Municipal alerts
Satellite imagery ──┘                                                (SMS to cleanup crews)
(Earth Engine)
```

## Team & Ownership

| Person | Role | Owns |
|---|---|---|
| **Parth** | ECE / Hardware | Arduino circuit, sensors, pushing readings to cloud (Firebase/Cloud Function endpoint) |
| **Chanchal** | Gen AI Full-Stack Dev #1 | BigQuery + Gemini fusion layer, backend API, data pipeline connecting all inputs |
| **Ankit** | Gen AI Full-Stack Dev #2 | Frontend — Google Maps hotspot visualization, SMS alert system, citizen photo upload interface |
| **Sumit** | Core ML + Gen AI Bridge | Forecast model (trained end-to-end), smoke detection model (fine-tuned or Gemini Vision prompt-engineered), jumps in wherever there's a bottleneck |

## Folder Structure

```
vayu-project/
├── hardware/                      # Parth's domain
│   ├── arduino-firmware/          # .ino files, sensor reading code
│   ├── circuit-diagrams/          # schematics, wiring diagrams, Fritzing files
│   └── sensor-docs/               # PM2.5/smoke sensor datasheets, calibration notes
│
├── backend/                       # Chanchal's domain
│   ├── data-pipeline/             # ingestion scripts pulling from Firebase/sensors/uploads
│   ├── bigquery-gemini-fusion/    # BigQuery schemas, Gemini fusion logic
│   ├── api/                       # REST/GraphQL API connecting frontend to backend
│   └── cloud-functions/           # Firebase/GCP cloud functions (sensor ingest endpoint, triggers)
│
├── frontend/                      # Ankit's domain
│   ├── public/
│   └── src/
│       ├── components/            # map markers, alert cards, upload widget, etc.
│       ├── pages/                 # dashboard, hotspot map page, alerts page
│       └── services/              # API calls, Maps SDK integration, SMS trigger calls
│
├── ml-models/                     # Sumit's domain
│   ├── smoke-detection/           # Vertex AI Vision model / Gemini Vision prompt pipeline
│   ├── forecast-model/            # time-series AQI forecasting model (training + inference code)
│   ├── notebooks/                 # exploratory data analysis, training experiments
│   └── saved-models/              # exported model artifacts (gitignored if large — use GCS/DVC)
│
├── docs/                          # architecture diagrams, API docs, pitch deck assets
├── assets/                        # logos, images, demo screenshots/videos
├── .github/workflows/             # CI/CD (lint, test, build checks on PRs)
├── .gitignore
└── README.md
```

## Branching Strategy

We use one branch per person, mapped to their domain, branching off `main`. Nobody pushes directly to `main` — everything goes through a Pull Request.

| Branch | Owner | Scope |
|---|---|---|
| `main` | — | Always stable, demo-ready code only |
| `feature/hardware-arduino` | Parth | Hardware folder, sensor firmware, cloud ingestion endpoint |
| `feature/backend-fusion` | Chanchal | Backend folder, BigQuery + Gemini fusion, API |
| `feature/frontend-map-alerts` | Ankit | Frontend folder, Maps UI, SMS alerts, photo upload |
| `feature/ml-forecast-vision` | Sumit | ML-models folder, forecast model, smoke detection model |

If a task needs a smaller sub-branch (e.g. a quick fix or experiment), branch off your own feature branch like `feature/backend-fusion-bugfix` rather than off `main`.

## Git Workflow — Step by Step

### 1. One-time setup (everyone does this once)

```bash
# Clone the repo
git clone https://github.com/<org-or-username>/vayu-project.git
cd vayu-project

# Set your identity (if not already set globally)
git config user.name "Your Name"
git config user.email "your@email.com"
```

### 2. Create and switch to your branch (do this once per person, at the start)

```bash
# Make sure main is up to date first
git checkout main
git pull origin main

# Create your branch and switch to it
git checkout -b feature/hardware-arduino       # Parth
git checkout -b feature/backend-fusion         # Chanchal
git checkout -b feature/frontend-map-alerts    # Ankit
git checkout -b feature/ml-forecast-vision     # Sumit

# Push the branch to GitHub so others can see it
git push -u origin <your-branch-name>
```

### 3. Daily workflow (repeat this every work session)

```bash
# 1. Always start by syncing main into your branch to avoid conflicts later
git checkout main
git pull origin main
git checkout <your-branch-name>
git merge main

# 2. Do your work — edit files in your owned folder

# 3. Check what changed
git status

# 4. Stage your changes
git add .
# or stage specific files:
# git add backend/api/sensor_routes.py

# 5. Commit with a clear message
git commit -m "Add PM2.5 ingestion endpoint to cloud function"

# 6. Push to your branch on GitHub
git push origin <your-branch-name>
```

### 4. Opening a Pull Request (when a feature/chunk of work is ready)

1. Go to the GitHub repo in your browser.
2. You'll see a prompt "Compare & pull request" for your recently pushed branch — click it.
3. Set base branch = `main`, compare branch = your feature branch.
4. Write a short description of what you built/changed.
5. Tag at least one teammate as a reviewer (ideally Sumit, since he bridges all parts, or whoever owns an adjacent module).
6. Once approved, click **Merge Pull Request** → **Confirm merge**.
7. Delete the branch on GitHub after merge (optional, keeps things clean) — you can always recreate it locally for the next chunk of work.

### 5. After your PR is merged

```bash
git checkout main
git pull origin main

# Re-sync your local feature branch with the latest main
git checkout <your-branch-name>
git merge main
```

### Commit Message Convention

Keep it simple and consistent:

```
<type>: <short description>

feat: add SMS alert trigger on hotspot detection
fix: correct PM2.5 threshold in forecast model
docs: update README with API endpoints
chore: add gitignore for saved model weights
```

### Handling Merge Conflicts

If `git merge main` shows a conflict:

```bash
# Git will mark conflicted files. Open them, look for:
# <<<<<<< HEAD
# your code
# =======
# incoming code
# >>>>>>> main

# Manually edit to keep the correct version, then:
git add <the-fixed-file>
git commit -m "fix: resolve merge conflict in api routes"
git push origin <your-branch-name>
```

If unsure, ping whoever owns the conflicting code before resolving — don't guess on someone else's module.

## Integration Points (where branches need to talk to each other)

These are the spots where your work depends on a teammate's output — flag early if blocked:

- **Parth → Chanchal**: Sensor JSON payload format (what fields, units) must be agreed upfront so the cloud function endpoint and the BigQuery schema match.
- **Sumit → Chanchal**: Forecast model and smoke detection model need a defined input/output contract (e.g. model takes fused BigQuery row, returns `{hotspot: bool, confidence: float, predicted_aqi_24h: int}`) so the backend can call it without knowing internals.
- **Chanchal → Ankit**: API response schema for hotspot data and alerts must be fixed early so frontend can build against it (use mock JSON before backend is fully ready, to unblock frontend work).
- **Ankit → Chanchal**: Photo upload format/size and SMS trigger payload need to be agreed so backend can process uploads and fire alerts correctly.

Recommendation: define these contracts in `docs/api-contracts.md` on day one, before writing implementation code, so nobody blocks anybody.

## Quick Reference Cheat Sheet

```bash
git checkout main && git pull                 # sync main
git checkout <branch>                          # switch to your branch
git merge main                                  # bring main's updates into your branch
git add . && git commit -m "message"            # save your work
git push origin <branch>                        # send it to GitHub
# then open a PR on GitHub → review → merge
```
