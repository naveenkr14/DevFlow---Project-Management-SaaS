# DevFlow

DevFlow is a React/Vite frontend and an Express/Prisma backend for workspace-based project management. PostgreSQL is the application database. The repository keeps frontend and backend dependencies and build outputs separate.

## Architecture

- `client/` — React 19 + Vite frontend.
- `server/` — Express API, Prisma Client, and authentication/session handling.
- `server/prisma/schema.prisma` — current database schema.
- `server/prisma/migrations/` — active migrations deployed by Prisma.
- `docker-compose.yml` — local PostgreSQL only; it does not run the application services.

The browser uses `VITE_API_BASE_URL` and sends the HTTP-only `devflow_session` cookie with API requests. Local development uses an explicit localhost API URL; production builds must provide a non-localhost API URL, with `/api/v1` being the recommended same-origin value. The API accepts requests only from the configured `FRONTEND_URL`.

## Local setup

Prerequisites:

- Node.js 22 or newer.
- npm.
- PostgreSQL 17, or Docker Desktop for the included PostgreSQL container.

Install dependencies:

```powershell
cd client
npm ci

cd ..\server
npm ci
```

For Docker PostgreSQL, copy the root `.env.example` to `.env` and replace the placeholder PostgreSQL password locally. Do not commit `.env` files. Start the database from the repository root:

```powershell
docker compose up -d postgres
```

Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` to the running database. The development defaults are `FRONTEND_URL=http://localhost:5173`, `PORT=5000`, and `NODE_ENV=development`.

The optional `AUTH_LOGIN_RATE_LIMIT_*` and `AUTH_REGISTER_RATE_LIMIT_*` variables control the authentication request windows and maximum attempts. The example file contains the default values.

Set the frontend API URL in `client/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

When `vite` builds for production, `VITE_API_BASE_URL` is required and localhost URLs are rejected. Use `/api/v1` for the recommended same-origin deployment.

Run the services in separate terminals:

```powershell
cd server
npm run dev
```

```powershell
cd client
npm run dev
```

## Database and migrations

The backend reads `DATABASE_URL` from `server/.env` or the process environment. A managed PostgreSQL URL normally has this shape:

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=require
```

Use the provider-specific SSL and pooling parameters for the selected managed PostgreSQL service. Keep migration execution pointed at the database URL intended for schema administration when the provider supplies separate pooled and direct endpoints.

Apply committed migrations without resetting or reseeding data:

```powershell
cd server
npm run db:migrate:deploy
```

Do not use `prisma migrate reset` or destructive `db push` commands against a shared or production database.

## Development, tests, and builds

Backend:

```powershell
cd server
npm run dev
npm test
npm run build
npm start
```

Frontend:

```powershell
cd client
npm run dev
npm run lint
npm run build
npm run preview
```

The frontend production output is `client/dist`. The backend TypeScript output is `server/dist`; its production start command is `node dist/server.js`.

## Deployment prerequisites

The recommended Railway deployment shape is one HTTPS web service plus Railway PostgreSQL. The web service is built from the repository root, builds both packages, starts the Express server, and serves `client/dist` for browser routes while keeping the API under `/api/v1`. No separate frontend service or application reverse-proxy configuration is required for this shape. In that model:

- Set the Railway service root directory to `/` (the repository root).
- Set the build command to `npm ci --prefix client && npm ci --prefix server && npm run build --prefix client && npm run build --prefix server`.
- Set the start command to `npm start --prefix server`.
- Set `VITE_API_BASE_URL=/api/v1` at frontend build time.
- Set `NODE_ENV=production`.
- Set `FRONTEND_URL` to the exact public frontend origin.
- Set `DATABASE_URL` to the managed PostgreSQL connection URL.
- Set `PORT` to the platform-provided port.
- Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies, such as `1` for one controlled proxy. Leave it at `0` when the API is directly exposed.
- Configure the Railway health check path as `/api/v1/health`.
- Run `npm run db:migrate:deploy --prefix server` as the intentional production migration command before starting the new application version.
- The Express server serves `client/dist` with SPA fallback to `index.html` for client-side routes; `/api/v1/*` remains JSON API-only.
- Terminate TLS at the platform or reverse proxy and enable HSTS there.

The current cookie is HTTP-only, `SameSite=Lax`, and `Secure` in production. A same-site sibling-subdomain deployment such as `app.example.com` plus `api.example.com` can also work with an exact `FRONTEND_URL`, HTTPS, credentials-enabled CORS, and the existing cookie policy. A truly cross-site frontend/API deployment would require `SameSite=None; Secure` and CSRF protection; that architecture is not enabled by this repository yet.

The API keeps CORS enabled with the exact `FRONTEND_URL` for local development and controlled same-site cross-origin use. It never uses `*` or arbitrary credentialed origins. A same-origin `/api` proxy does not need browser CORS, but retaining the exact-origin policy avoids breaking local development and does not weaken production access control.

If the API is behind a reverse proxy, configure Express `trust proxy` only for the known proxy topology using `TRUST_PROXY_HOPS`; the default is zero. Do not trust arbitrary forwarded headers.

### CSRF decision

The selected deployment uses the existing HTTP-only, `SameSite=Lax` cookie and keeps state changes on non-GET endpoints. For the recommended same-origin `/api` proxy, browsers do not send the session cookie on ordinary cross-site API requests, so a synchronizer-token or double-submit-token layer is not required immediately. This is a deliberate scope decision, not a claim that cookie authentication is universally CSRF-proof.

Add CSRF protection before changing the deployment to a truly cross-site frontend/API arrangement, changing the cookie to `SameSite=None`, allowing cross-site credentialed requests, or introducing state-changing GET endpoints. Origin/Referer validation may be added as defense-in-depth if the hosting topology requires it.

### Deployment sequence

1. Provision managed PostgreSQL and store its connection string in the deployment secret manager.
2. Create one Railway web service from the repository with root directory `/`.
3. Configure backend `DATABASE_URL` as a Railway reference variable to the PostgreSQL service's `DATABASE_URL`.
4. Configure `NODE_ENV=production`, `FRONTEND_URL`, `TRUST_PROXY_HOPS`, and the authentication rate-limit variables; Railway supplies `PORT`.
5. Build with `VITE_API_BASE_URL=/api/v1` using the documented root build command.
6. Run `npm run db:migrate:deploy --prefix server` against the intended Railway database.
7. Start with `npm start --prefix server` and verify `/api/v1/health`, SPA fallback, cookies, and logs over HTTPS.

There is currently no application Dockerfile or application deployment workflow in this repository. `docker-compose.yml` is for local PostgreSQL only.

The current authentication rate limiter is process-local. It is suitable for a single backend instance. For multiple instances, replace the `Map` store inside `server/src/middleware/rate-limit.ts` with a shared Redis or equivalent store while keeping the existing middleware interface; no shared infrastructure is required for local development or a single instance.

## Environment files

Safe templates are provided at:

- `.env.example` — local Docker PostgreSQL variables.
- `server/.env.example` — backend runtime variables.
- `client/.env.example` — frontend build-time API URL.

Real passwords, connection strings, session values, and platform credentials must remain in local ignored files or the deployment platform's secret manager. They must never be placed in source code, CI YAML, or committed history.

## CI

`.github/workflows/ci.yml` runs dependency installation, Prisma validation and generation, backend security tests/build, and frontend lint/build. CI uses non-secret placeholder values only and does not connect to PostgreSQL or deploy anything.
