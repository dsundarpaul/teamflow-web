# TeamFlow Web App

A production-ready frontend application for TeamFlow, built with Next.js, TypeScript, TailwindCSS, and React Query.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Server Components)
- **TailwindCSS** - Styling
- **shadcn/ui** - UI component library
- **React Query** - Server state management
- **Axios** - HTTP client
- **Zod** - Schema validation
- **React Hook Form** - Form handling

## Features

- 🔐 Authentication (Login/Logout)
- 👥 Team management
- 📁 Project management
- ✅ Task management with status tracking
- 🎨 Clean, modern UI with responsive design

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm/yarn

### Installation

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Replace `http://localhost:3000/api` with your actual TeamFlow backend API URL.

3. **Run the development server:**

```bash
pnpm dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

The app will automatically redirect to `/login` if you're not authenticated.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard page
│   ├── teams/[teamId]/    # Team detail page
│   └── projects/[projectId]/ # Project detail page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation bar
│   ├── sidebar.tsx       # Sidebar navigation
│   ├── team-card.tsx     # Team card component
│   ├── project-card.tsx  # Project card component
│   └── task-card.tsx     # Task card component
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   └── useProtectedRoute.ts # Route protection hook
└── lib/                  # Utilities and API
    ├── api/              # API client modules
    │   ├── client.ts     # Axios instance
    │   ├── auth.ts       # Auth API
    │   ├── users.ts      # Users API
    │   ├── teams.ts      # Teams API
    │   ├── projects.ts   # Projects API
    │   └── tasks.ts      # Tasks API
    └── utils.ts          # Utility functions
```

## API Integration

The app expects the following API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users
- `GET /users/me` - Get current user

### Teams
- `GET /teams` - List all teams
- `GET /teams/:id` - Get team details
- `POST /teams` - Create team

### Projects
- `GET /teams/:teamId/projects` - List projects in a team
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project

### Tasks
- `GET /projects/:projectId/tasks` - List tasks in a project
- `GET /tasks/:id` - Get task details
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task

## Authentication

- JWT tokens are stored in `localStorage` with the key `teamflow_token`
- The API client automatically injects the token in the `Authorization` header
- On 401 responses, users are automatically redirected to `/login`

## Building for Production

```bash
pnpm build
pnpm start
```

## Development

The app uses:
- **React Query** for all server data operations
- **React Hook Form** with **Zod** for form validation
- **shadcn/ui** components for consistent UI
- **TailwindCSS** for styling

## License

Private project - All rights reserved
