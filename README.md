# MindCare

MindCare is a monorepo for multimodal mental-health **screening-style** analytics:

- AAM (acoustic)
- FEAM (facial/video)
- LAM (linguistic/text)
- CAFE (fusion)
- ERM (reporting/explainability)

Current ML behavior uses practical signals (VADER + lexicons, audio byte stats, image stats).  
It is **not** a diagnosis or medical device.

---

## Fast Start (Windows, recommended)

Run from the repo root:

```powershell
cd "c:\DRIVE D\MAJOR_PROJECT\MAJORPORJECT_CURSOR\mindcare"
pnpm install
copy .env.example .env
```

Edit `.env`:

- set `DATABASE_URL` for your PostgreSQL
- set a strong `JWT_SECRET`
- keep ports aligned (`PORT`, `VITE_DEV_PORT`, `ML_CORE_URL`, `VITE_PROXY_API`, `VITE_API_URL`)

### 1) Setup database (once)

```powershell
cd "c:\DRIVE D\MAJOR_PROJECT\MAJORPORJECT_CURSOR\mindcare\services\api-gateway"
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
```

Demo login:

- `demo@mindcare.local`
- `demo-demo`

### 2) Start ML service (Terminal A)

```powershell
cd "c:\DRIVE D\MAJOR_PROJECT\MAJORPORJECT_CURSOR\mindcare\services\ml-core"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8010
```

Use the same port as `ML_CORE_URL` in `.env`.

### 3) Start web + API (Terminal B)

```powershell
cd "c:\DRIVE D\MAJOR_PROJECT\MAJORPORJECT_CURSOR\mindcare"
pnpm dev
```

### 4) Open app

Open the URL Vite prints (usually):

- `http://localhost:5174/`

Health checks:

- API: `http://127.0.0.1:4001/health`
- ML: `http://127.0.0.1:8010/health`

---

## Important behavior in this project

- Vite uses `strictPort: false`, so if `VITE_DEV_PORT` is busy it auto-picks next free port.
- API dev CORS allows localhost origins (`origin: true` in dev) so port fallback still works.
- API and Prisma scripts load env from monorepo root (`mindcare/.env`).

---

## `.env` keys you will actually edit

| Key | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `PORT` | API Gateway port |
| `ML_CORE_URL` | API -> ML target URL |
| `VITE_DEV_PORT` | Preferred Vite port |
| `VITE_PROXY_API` | Vite `/api` proxy target |
| `VITE_API_URL` | Browser API base URL |
| `JWT_SECRET` | Token signing secret |
| `CORS_ORIGIN` | Used in production mode CORS |

---

## Troubleshooting (real issues seen in this repo)

| Problem | Fix |
|---|---|
| `DATABASE_URL` not found (Prisma) | Run `pnpm run db:push` from `services/api-gateway` (not raw `prisma db push`). |
| `ModuleNotFoundError: PIL` or `vaderSentiment` | Activate ML venv and run `pip install -r requirements.txt`. |
| Port already in use (`EADDRINUSE`) | Old process still running. Close prior terminals or kill old Node/Python process. |
| `WinError 10013` on ML port | Pick another allowed port (e.g. `8010`), update `ML_CORE_URL`, restart API + ML. |
| Browser shows wrong project | Open the exact URL Vite prints (can be 5174, 5175, etc). |
| `{"detail":"Not Found"}` on ML root | Expected for `/`. Use `/health` endpoint instead. |

---

## Scripts

From `mindcare/`:

| Command | What it does |
|---|---|
| `pnpm dev` | Starts web + API via Turborepo |
| `pnpm build` | Builds workspace |
| `pnpm lint` | Type/lint checks |
| `pnpm test` | Test suites |

From `services/api-gateway/`:

- `pnpm run db:generate`
- `pnpm run db:push`
- `pnpm run db:seed`

---

## Project layout

- `apps/web` - React + Vite frontend
- `services/api-gateway` - Express + Prisma backend
- `services/ml-core` - FastAPI ML service
- `packages/types` - Shared TypeScript types
- `packages/config` - Shared TS config
- `docs` - Architecture / API / patent mapping
- `infrastructure/docker` - Optional Docker stack

Interactive tree reference: `../mindcare_project_structure.html`

---

## Docker (optional)

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```

If using Docker DB, seed demo user afterward with `pnpm run db:seed`.

---

## License

Proprietary - align with your institution's IP policy.
