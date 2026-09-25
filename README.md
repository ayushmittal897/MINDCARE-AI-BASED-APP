# MindCare

A robust web application consisting of a React frontend, a Node.js/Express backend, and a FastAPI machine learning core.

## Running Locally

To run the entire MindCare project locally from a fresh clone, follow these steps:

### 1. Install Dependencies
Install all root and workspace dependencies using `pnpm`:
```bash
pnpm install
```

Install Python dependencies for the ML service:
```bash
cd services/ml-core
pip install -r requirements.txt
cd ../..
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Update the root `.env` with any necessary local configurations.

### 3. Start the Project
Run the unified dev script from the root to start the Frontend, Backend, and ML Core in parallel:
```bash
npm run dev
# or
pnpm dev
```
> Note: The `predev` script will automatically check if ports 5174, 4000, and 8010 are available. If any are occupied, it will print the offending PID and stop.

### 4. Stopping the Project
To elegantly stop all services and free up the ports, run:
```bash
npm run stop
# or
pnpm stop
```
