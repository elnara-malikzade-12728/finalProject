# KaryeraYol

KaryeraYol is a youth employment and career-development platform created as a Holberton School final project. It helps users explore career paths, follow structured learning roadmaps, track progress, and discover relevant jobs and internships.

## Live Demo

[https://karyerayol.vercel.app](https://karyerayol.vercel.app)

The current Vercel deployment uses mock API mode until the Express API and PostgreSQL database are publicly deployed.

## Current Status

Sprint 2 introduces the backend foundation and frontend API integration:

- Responsive React frontend
- Express REST API
- PostgreSQL database through Prisma ORM
- JWT authentication
- Password hashing with bcrypt
- User profile endpoints
- Career and roadmap endpoints
- Job listing endpoint
- Authenticated progress tracking
- Swagger/OpenAPI documentation for all current API endpoints
- Frontend loading, validation, success, error, and empty states
- Mock API fallback for frontend-only demonstrations

## Technology Stack

### Frontend

- React 19
- Vite 7
- React Router
- Lucide React
- JavaScript
- HTML5 and CSS3
- Browser Local Storage for mock sessions and tokens

### Backend

- Node.js
- Express 5
- PostgreSQL
- Prisma ORM
- JSON Web Tokens
- bcrypt
- CORS
- Swagger UI Express
- swagger-jsdoc

## Project Structure

```text
finalProject/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   └── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── career-platform/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   └── styles/
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- Git
- A reachable PostgreSQL database

Check the installed tools:

```bash
node --version
npm --version
git --version
```

## Installation

Clone the repository and switch to the integration branch:

```bash
git clone https://github.com/elnara-malikzade-12728/finalProject.git
cd finalProject
git switch dev
```

Install frontend dependencies:

```bash
cd career-platform
npm install
cd ..
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

## Environment Configuration

### Backend

Copy the example file:

```bash
cd backend
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure `backend/.env` with real private values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace_with_a_long_random_secret"
PORT=4000
```

Never commit `backend/.env` or share its credentials publicly.

### Frontend

Copy `career-platform/.env.example` to `career-platform/.env.local` and configure:

```env
VITE_API_URL=http://localhost:4000/api
VITE_USE_MOCK_API=false
```

Use `VITE_USE_MOCK_API=true` when demonstrating the frontend without a reachable backend and database. Restart Vite after changing environment variables.

## Database Setup

Generate the Prisma client:

```bash
cd backend
npx prisma generate
```

For a new development database, synchronize the schema and add sample data:

```bash
npx prisma db push
npm run seed
```

Do not run `db push` or `seed` against a shared database without team confirmation.

The current schema contains `User`, `Career`, `Step`, `Progress`, and `Job` models.

## Running Locally

Run the backend in the first terminal:

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:4000/api`. A basic server check is available at `http://localhost:4000/`.

Run the frontend in a second terminal:

```bash
cd career-platform
npm run dev
```

The frontend normally runs at `http://localhost:5173/`.

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|---:|---|
| `POST` | `/api/auth/register` | No | Register a user |
| `POST` | `/api/auth/login` | No | Log in and receive a token |
| `GET` | `/api/users/me` | Yes | Get the current profile |
| `PATCH` | `/api/users/me` | Yes | Update the current profile |
| `GET` | `/api/careers` | No | List careers |
| `GET` | `/api/careers/:id` | No | Get one career |
| `GET` | `/api/careers/:id/roadmap` | No | Get career roadmap steps |
| `GET` | `/api/jobs` | No | List jobs and internships |
| `PUT` | `/api/progress/:stepId` | Yes | Create or update step progress |

Authenticated requests use:

```http
Authorization: Bearer <token>
```

## Swagger/OpenAPI Documentation

Start the backend and open the interactive Swagger UI:

```text
http://localhost:4000/api/docs
```

The raw OpenAPI 3.0 specification is available at:

```text
http://localhost:4000/api/docs.json
```

The specification currently contains eight API paths and nine operations covering authentication, user profiles, careers, roadmaps, jobs, and progress tracking.

To test a protected endpoint:

1. Register or log in through the Authentication section.
2. Copy the returned JWT token.
3. Click **Authorize** in Swagger UI.
4. Enter the token and confirm authorization.
5. Execute a protected Users or Progress request.

Swagger UI loads without a database connection, but executing database-backed requests requires a reachable PostgreSQL database.

## Frontend Routes

| Route | Access | Description |
|---|---:|---|
| `/` | Public | Landing page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/careers` | Public | Career catalogue |
| `/careers/:careerId` | Public | Career details |
| `/roadmap/:careerId` | Authenticated | Interactive roadmap |
| `/jobs` | Public | Jobs and internships |
| `/profile` | Authenticated | User profile |

## Commands

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run lint checks |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start Express with Nodemon |
| `npm start` | Start Express with Node.js |
| `npm run seed` | Seed the configured database |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Synchronize schema to a development database |

## Git Workflow

- `main` — stable presentation-ready releases
- `dev` — frontend/backend integration
- `frontend` — frontend integration
- `backend` — backend integration
- `feature/...` — individual feature work

Feature branches are merged into their relevant integration branch. Tested frontend and backend changes are combined in `dev`; only verified releases should be merged into `main`.

## Testing Checklist

- Frontend production build completes with `npm run build`.
- Backend starts on port `4000`.
- PostgreSQL is reachable from Prisma.
- Registration, login, and logout work.
- Protected endpoints reject missing or invalid tokens.
- Careers, roadmap steps, and jobs load from the API.
- Profile updates persist in the database.
- Progress updates persist after refresh.
- Loading, empty, validation, and error states display correctly.
- Responsive navigation and pages work on mobile and desktop.

## Deployment

The frontend is deployed on Vercel from the `dev` branch. The Vercel project root directory is `career-platform`.

For the current frontend-only deployment:

```env
VITE_USE_MOCK_API=true
```

After deploying the backend and PostgreSQL publicly, configure Vercel with:

```env
VITE_USE_MOCK_API=false
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

`localhost` must never be used as the API URL for a public deployment.

## Known Limitations and Sprint 2 Follow-up

- The Express backend and PostgreSQL database are not yet publicly deployed.
- The production frontend currently uses mock API mode.
- Automated backend tests and end-to-end tests are not yet configured.
- Employer accounts, applications, CV uploads, mentoring, and AI recommendations remain future work.

## Security

- Never commit `.env`, `.env.local`, database credentials, JWT secrets, or API keys.
- Passwords are hashed by the backend with bcrypt.
- Protected API routes require JWT authentication.
- Use a strong JWT secret and restricted production database credentials.
- Review CORS restrictions and token storage before a production launch.

## Team

- **Elnara Malikzade** — Frontend development and project setup
- **Nesibe Zeynalli** — Backend development
- **Ibad Vahidov** — Frontend development
- **Zeyneb Pashazade** — Penetration testing
- **Zehra Mansirova** — Penetration testing

## Repository

[GitHub repository](https://github.com/elnara-malikzade-12728/finalProject)

## License

Created for educational purposes as part of the Holberton School curriculum.
