# KaryeraYol

KaryeraYol is a youth employment and career-development platform created as a Holberton School final project. It helps users explore career paths, follow structured learning roadmaps, track progress, and discover relevant jobs and internships.

## Live Deployment

- Frontend: https://karyerayol.vercel.app
- Backend API: https://karyerayol-api.vercel.app
- Swagger Documentation: https://karyerayol-api.vercel.app/api/docs

## Current Status

Sprint 3 expands the integrated application toward 75% completion:

- Responsive React frontend
- Express REST API
- PostgreSQL database through Prisma ORM
- JWT authentication
- Password hashing with bcrypt
- User profile endpoints
- Career and roadmap endpoints
- Job listing endpoint
- Authenticated progress tracking
- User and administrator roles
- Administrator dashboard and protected management routes
- Course, module, lesson, and enrollment data models
- Secure lesson video upload and deletion
- Private Supabase Storage with short-lived signed URLs
- Authenticated video playback for administrators and enrolled users
- Swagger/OpenAPI documentation for all current API endpoints
- Frontend loading, validation, success, error, and empty states
- Mock API fallback for frontend-only demonstrations

## Sprint Progress

### Sprint 1 – MVP Foundation and Project Setup

- Established the React/Vite frontend and Express backend structure.
- Designed the initial PostgreSQL schema and integrated Prisma ORM.
- Implemented user registration, login, JWT authentication, and password hashing.
- Added the first career, roadmap, job, progress, and profile endpoints.
- Created the initial responsive pages and reusable UI components.

### Sprint 2 – Core Integration and API Documentation

- Connected the frontend to the real backend API and retained an optional mock fallback.
- Integrated the Supabase-hosted PostgreSQL database and sample career/job data.
- Added protected routes, authenticated progress tracking, and profile management.
- Improved validation and localized API error messages in Azerbaijani.
- Added Swagger/OpenAPI documentation and deployed the frontend and backend to Vercel.

### Sprint 3 – Feature Completion and Deployment

- Introduced `USER` and `ADMIN` roles with protected administrator routes.
- Added the administrator dashboard and job/application management interfaces.
- Implemented job applications, application history, and administrator status management.
- Added persistent extended profile fields, including location, education, biography, interests, and skills.
- Added course, module, lesson, and enrollment models.
- Implemented secure lesson-video upload, playback, and deletion using private Supabase Storage and signed URLs.
- Added lazy-loaded frontend routes and consistent loading, empty, success, and error states.
- Improved Prisma resilience when Supabase closes idle pooled connections.
- Updated production deployment configuration and API documentation.

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
- Supabase Storage

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
DATABASE_URL="postgresql://USER:PASSWORD@TRANSACTION_POOLER:6543/DATABASE?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@SESSION_POOLER:5432/DATABASE"
JWT_SECRET="replace_with_a_long_random_secret"
PORT=4000
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_PRIVATE_SERVICE_ROLE_KEY
SUPABASE_VIDEO_BUCKET=course-videos
VIDEO_SIGNED_URL_TTL=600
MAX_VIDEO_SIZE_BYTES=52428800
```

`DATABASE_URL` is used by the running API through the transaction pooler. `DIRECT_URL` is used by Prisma schema operations through the session pooler. Never commit `backend/.env` or expose the database password, JWT secret, or Supabase service-role key.

### Frontend

Copy `career-platform/.env.example` to `career-platform/.env.local` and configure:

```env
VITE_API_URL=http://localhost:4000/api
VITE_USE_MOCK_API=false
VITE_ADMIN_PREVIEW=false
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
VITE_SUPABASE_VIDEO_BUCKET=course-videos
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

The current schema contains `User`, `Career`, `Step`, `Progress`, `Job`, `Course`, `CourseModule`, `Lesson`, and `Enrollment` models. The `UserRole` enum distinguishes regular users from administrators.

### Supabase Storage Setup

Create a private bucket named `course-videos` with:

- Public access disabled
- Maximum object size of 50 MB
- Allowed MIME types: `video/mp4`, `video/webm`, and `video/quicktime`

The browser never receives the Supabase service-role key. The backend authorizes the administrator and issues a short-lived signed upload token. After the browser uploads directly to Supabase, the backend verifies the object and saves its metadata on the associated lesson.

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
| `POST` | `/api/jobs` | Admin | Create a job |
| `GET` | `/api/jobs/:id` | No | Get job details |
| `PATCH` | `/api/jobs/:id` | Admin | Update a job |
| `DELETE` | `/api/jobs/:id` | Admin | Delete a job and its applications |
| `POST` | `/api/jobs/:id/apply` | Yes | Apply to a job |
| `GET` | `/api/applications/me` | Yes | List the current user's applications |
| `GET` | `/api/applications` | Admin | List and filter all applications |
| `PATCH` | `/api/applications/:id/status` | Admin | Update an application status |
| `DELETE` | `/api/applications/:id` | Admin | Delete an application |
| `PUT` | `/api/progress/:stepId` | Yes | Create or update step progress |
| `POST` | `/api/lessons/:lessonId/video/upload-url` | Admin | Create signed video-upload credentials |
| `POST` | `/api/lessons/:lessonId/video/complete` | Admin | Verify the upload and save lesson metadata |
| `GET` | `/api/lessons/:lessonId/video` | Yes | Get a temporary signed playback URL |
| `DELETE` | `/api/lessons/:lessonId/video` | Admin | Delete a lesson video and clear its metadata |

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

The specification covers authentication, user profiles, careers, roadmaps, jobs, progress tracking, and secure lesson video operations.

To test a protected endpoint:

1. Register or log in through the Authentication section.
2. Copy the returned JWT token.
3. Click **Authorize** in Swagger UI.
4. Enter the token and confirm authorization.
5. Execute a protected Users, Progress, or Videos request. Video upload and deletion endpoints additionally require an account whose database role is `ADMIN`.

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
| `/admin` | Administrator | Administration dashboard |
| `/admin/jobs` | Administrator | Vacancy management |
| `/admin/jobs/new` | Administrator | Create a vacancy |
| `/admin/jobs/:jobId/edit` | Administrator | Edit a vacancy |
| `/admin/applications` | Administrator | Application management |
| `/admin/videos` | Administrator | Lesson video management |

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
- Regular users cannot access administrator operations.
- Administrators can upload MP4, WebM, and MOV videos up to 50 MB.
- Invalid lesson identifiers and unsupported files are rejected.
- Uploaded videos remain available after refresh and a new login.
- Private videos play through expiring signed URLs.
- Deleting a video removes it from storage and clears database metadata.
- Loading, empty, validation, and error states display correctly.
- Responsive navigation and pages work on mobile and desktop.

## Deployment

The frontend and backend are deployed as separate Vercel projects. The frontend project root is `career-platform`, and the backend project root is `backend`.

Configure the deployed frontend with:

```env
VITE_USE_MOCK_API=false
VITE_API_URL=https://karyerayol-api.vercel.app/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
VITE_SUPABASE_VIDEO_BUCKET=course-videos
```

Configure the deployed backend with `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_VIDEO_BUCKET`, `VIDEO_SIGNED_URL_TTL`, and `MAX_VIDEO_SIZE_BYTES`. Redeploy after changing environment variables. `localhost` must never be used as the API URL for a public deployment.

## Known Limitations and Follow-up

- Automated backend tests and end-to-end tests are not yet configured.
- Video selection currently uses a numeric lesson ID; course, module, and lesson dropdowns remain a UX improvement.
- Custom video display titles and original filenames are not yet stored.
- Employer workflows, CV uploads, mentoring, and AI recommendations remain future work.

## Security

- Never commit `.env`, `.env.local`, database credentials, JWT secrets, or API keys.
- Passwords are hashed by the backend with bcrypt.
- Protected API routes require JWT authentication.
- Administrator operations verify the role from the database.
- Lesson videos are stored in a private bucket and accessed using expiring signed URLs.
- The Supabase service-role key is used only by the backend.
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
