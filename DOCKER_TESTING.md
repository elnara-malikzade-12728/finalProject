# Synex Docker Test Environment

This stack is isolated from the Vercel production application and production database. It is intended for QA review and authorized Sprint 5 penetration testing.

## Services

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api
- Swagger: http://localhost:4000/api/docs
- PostgreSQL: localhost:5433

The PostgreSQL data is stored only in the `synex_test_db` Docker volume.

## Start the environment

```powershell
docker compose -f compose.test.yml up --build -d
docker compose -f compose.test.yml ps
```

Open http://localhost:8080 and register test accounts through the normal user interface.

## Run automated backend tests

```powershell
docker compose -f compose.test.yml --profile tools run --rm backend-tests
```

## View logs

```powershell
docker compose -f compose.test.yml logs -f backend frontend
```

## Optional sandbox integrations

Copy `.env.docker.test.example` to `.env.docker.test`, add sandbox-only credentials, and run:

```powershell
docker compose --env-file .env.docker.test -f compose.test.yml up --build -d
```

Never place production database, Stripe, Supabase, or Bunny credentials in this environment. External integrations should use dedicated test resources and test-mode keys.

## Reset the test database

This removes only the Docker test volume and all data inside it:

```powershell
docker compose -f compose.test.yml down -v
docker compose -f compose.test.yml up --build -d
```

## Stop the environment

```powershell
docker compose -f compose.test.yml down
```

## Pentest boundary

Only test `http://localhost:8080` and `http://localhost:4000`. Do not point scanners at the Vercel production domains. Record tool versions, test cases, evidence, severity, affected endpoint, remediation advice, and retest status in the final pentest report.
