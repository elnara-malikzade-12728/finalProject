# KaryeraYol

KaryeraYol is a youth employment and career development platform designed to help young people discover career paths, develop relevant skills, follow structured learning roadmaps, and explore suitable job and internship opportunities.

This project was developed as a Holberton School final project.

## Project Objective

Many young people experience difficulty choosing a profession and understanding which skills they need to enter the job market.

KaryeraYol addresses this problem by providing:

- Career information
- Structured career roadmaps
- Skill-development steps
- Progress tracking
- Job and internship listings
- User profile management

## MVP Features

The Sprint 1 frontend MVP includes:

- Responsive landing page
- User registration
- User login and logout
- Demo user account
- Persistent browser sessions
- Editable user profile
- Career catalogue
- Career search and category filtering
- Detailed career information
- Interactive career roadmaps
- User-specific progress tracking
- Job and internship listings
- Vacancy search and filtering
- Protected profile and roadmap routes
- Responsive desktop and mobile design
- Empty, validation, and error states
- Custom 404 page

## Current MVP Scope

The current version is a frontend MVP.

User accounts, profile information, and roadmap progress are stored in the browser using `localStorage`. Career and vacancy information is currently provided through local mock data.

The current version does not include:

- A production authentication system
- A backend API
- A shared database
- Real employer accounts
- Real job applications
- Mentor communication
- AI-generated career recommendations

These features are planned for future development.

## Demo Account

Use the following credentials to explore the application:

```text
Email: demo@karyerayol.az
Password: demo123
```

You can also register a new account. Accounts created in the MVP are stored only in the current browser.

## Pilot Career Paths

The MVP currently includes the following career paths:

1. Frontend Developer
2. Data Analyst
3. Digital Marketing Specialist
4. Graphic Designer
5. Electrician

Each career contains:

- Career description
- Estimated learning duration
- Difficulty level
- Labour-market demand
- Required skills
- Six structured roadmap steps
- Related jobs and internships

## Technologies

### Frontend

- React
- Vite
- React Router
- Lucide React
- JavaScript
- HTML5
- CSS3
- Browser Local Storage

### Planned Backend

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JSON Web Tokens
- bcrypt
- Swagger/OpenAPI

## Project Structure

```text
finalProject/
├── career-platform/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
└── README.md
```

## Installation

### Prerequisites

Install the following before running the project:

- Node.js 20 or newer
- npm
- Git

Confirm the installations:

```bash
node --version
npm --version
git --version
```

### Clone the Repository

```bash
git clone https://github.com/elnara-malikzade-12728/finalProject.git
cd finalProject
```

### Switch to the Frontend Branch

If the frontend has not yet been merged into `main`:

```bash
git switch frontend
```

### Install Dependencies

```bash
cd career-platform
npm install
```

## Running the Application

Start the Vite development server:

```bash
npm run dev
```

Open the address shown in the terminal. The default address is:

```text
http://localhost:5173
```

The application automatically refreshes after saved code changes.

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated production files are placed in:

```text
career-platform/dist/
```

## Available Commands

| Command | Description |
|---|---|
| `npm install` | Installs project dependencies |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates the production build |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs the configured lint checks |

## Application Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | User login | Public |
| `/register` | User registration | Public |
| `/careers` | Career catalogue | Public |
| `/careers/:careerId` | Career details | Public |
| `/roadmap/:careerId` | Interactive roadmap | Authenticated |
| `/jobs` | Jobs and internships | Public |
| `/profile` | User profile | Authenticated |
| `/404` | Not-found page | Public |

## Data Persistence

The frontend MVP uses browser `localStorage` for:

- Registered users
- Current user session
- Profile information
- Completed roadmap steps
- Progress percentages

Because the data is stored locally:

- Data is not shared between browsers or devices.
- Clearing browser storage removes saved accounts and progress.
- This mechanism is intended only for MVP demonstration.
- Passwords must not be stored this way in production.

Production authentication will be managed by a backend using password hashing, secure tokens, validation, and a database.

## Planned API

The future backend will provide endpoints similar to:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
PATCH  /api/users/me
GET    /api/careers
GET    /api/careers/:id
GET    /api/careers/:id/roadmap
GET    /api/jobs
PUT    /api/progress/:stepId
POST   /api/applications
```

## Git Workflow

The repository uses the following permanent branches:

- `main` — stable and presentation-ready code
- `frontend` — frontend integration
- `backend` — backend integration

Developers work in feature branches created from the appropriate integration branch.

Example frontend workflow:

```bash
git switch frontend
git pull origin frontend
git switch -c feature/frontend-roadmap
```

After completing the work:

```bash
git add .
git commit -m "feat: add interactive career roadmap"
git push -u origin feature/frontend-roadmap
```

Then create a pull request:

```text
feature/frontend-roadmap → frontend
```

Stable frontend and backend changes are eventually merged into `main` through reviewed pull requests.

## Commit Convention

Examples:

```text
feat: add career search
feat: implement roadmap progress
fix: preserve user session after refresh
docs: update installation instructions
style: improve mobile navigation
chore: configure Vite project
```

## Testing Checklist

Before merging changes, verify:

- The application starts with `npm run dev`.
- `npm run build` completes successfully.
- Registration works.
- Login and logout work.
- Protected routes redirect unauthenticated users.
- Career search and filtering work.
- Roadmap progress is saved after refresh.
- Job search and filtering work.
- Profile changes persist after refresh.
- Navigation works on desktop and mobile.
- Unknown URLs display the 404 page.
- The browser console contains no errors.

## MVP User Flow

The primary demonstration flow is:

1. Register a new account or use the demo account.
2. Browse available career paths.
3. Open a career and review its required skills.
4. Start the career roadmap.
5. Complete roadmap steps.
6. Observe the updated progress percentage.
7. Open related job and internship listings.
8. Update and save profile information.

## Future Improvements

Future versions may include:

- Express REST API
- PostgreSQL database
- Secure authentication and authorization
- Employer accounts and dashboards
- Vacancy creation and management
- Real job applications
- CV upload and profile documents
- Mentor matching and communication
- Automated career assessment
- Personalized career recommendations
- Gamification, points, and badges
- Notifications
- Admin dashboard
- Analytics and labour-market insights
- Automated testing and CI/CD

## Security Notice

This repository currently contains a demonstration frontend. Its browser-based authentication is not appropriate for production use.

Never commit:

- `.env` files
- Database credentials
- JWT secrets
- API keys
- Real user passwords

Use `.env.example` to document required environment variables without including sensitive values.

## Team

- **Elnara Malikzade** - Frontend development and project setup
- **Nesibe Zeynalli** - Backend development
- **Ibad Vahidov** - Frontend development
- **Zeyneb Pashazade** - Pen tester
- **Zehra Mansirova** - Pen tester

## Repository

[GitHub repository](https://github.com/elnara-malikzade-12728/finalProject)


## Live Demo

[KaryeraYol — Live Application](https://karyerayol.vercel.app)

## License

This project was created for educational purposes as part of the Holberton School curriculum.