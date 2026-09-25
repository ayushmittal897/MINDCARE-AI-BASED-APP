# Environment Variables Reference

This document lists all environment variables actually utilized across the MindCare monorepo, based on the source code.

| Variable Name | Service | Stage | Description |
|---|---|---|---|
| `VITE_API_URL` | `apps/web` | Build | Base URL for the backend API |
| `VITE_GOOGLE_CLIENT_ID` | `apps/web` | Build | Google OAuth Client ID for frontend login |
| `PORT` | `services/api-gateway` | Runtime | Port the API Gateway listens on |
| `NODE_ENV` | `services/api-gateway` | Runtime | Node environment (development/production) |
| `DATABASE_URL` | `services/api-gateway` | Runtime | Connection pool URL for PostgreSQL |
| `DIRECT_URL` | `services/api-gateway` | Runtime | Direct connection URL for PostgreSQL (used by Prisma) |
| `JWT_SECRET` | `services/api-gateway` | Runtime | Secret key for signing and verifying JWT tokens |
| `CORS_ORIGIN` | `services/api-gateway` | Runtime | Allowed origins for cross-origin resource sharing |
| `SUPER_ADMIN_EMAIL` | `services/api-gateway` | Runtime | Email address granted automatic bootstrap admin access |
| `GOOGLE_CLIENT_ID` | `services/api-gateway` | Runtime | Google OAuth Client ID for verifying tokens on backend |
| `GEMINI_API_KEY` | `services/api-gateway` | Runtime | API key for authenticating with Gemini AI |
| `ML_CORE_URL` | `services/api-gateway` | Runtime | Base URL of the ML Core service for prediction requests |
| `LOG_LEVEL` | `services/api-gateway` | Runtime | Application logging level (e.g., info, debug, error) |
| `BREVO_SMTP_HOST` | `services/api-gateway` | Runtime | SMTP server host for sending verification emails |
| `BREVO_SMTP_PORT` | `services/api-gateway` | Runtime | SMTP server port |
| `BREVO_SMTP_USER` | `services/api-gateway` | Runtime | SMTP username for authentication |
| `BREVO_SMTP_KEY` | `services/api-gateway` | Runtime | SMTP key/password for authentication |
| `MAIL_FROM_ADDRESS` | `services/api-gateway` | Runtime | Default sender email address for outgoing mail |
| `ML_DEVICE` | `services/ml-core` | Runtime | Compute device to run ML models (e.g., cpu, cuda) |
| `LOG_LEVEL` | `services/ml-core` | Runtime | Logging level for ML Core operations |
