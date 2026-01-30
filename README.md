# Kanly - Kanban Task Management MVP

A lightweight kanban task management application built with Next.js 14 and PostgreSQL.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: Email/Password with bcrypt hashing
- **Real-time**: WebSockets (for future implementation)
- **Deployment**: Nixpacks-compatible (Node 20+)

### Project Structure

```
kanly/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── boards/        # Board CRUD endpoints
│   │   │   ├── columns/       # Column CRUD endpoints
│   │   │   ├── tasks/         # Task CRUD endpoints
│   │   │   ├── labels/        # Label endpoints
│   │   │   └── activity/      # Activity log endpoints
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   ├── lib/
│   │   └── db/                # Database utilities
│   └── types/                 # TypeScript type definitions
├── schema.sql                 # PostgreSQL schema
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local.example         # Environment variables template
```

## Database Schema

### Tables

1. **users**
   - `id`: UUID (PK)
   - `email`: VARCHAR (UNIQUE)
   - `password_hash`: VARCHAR
   - `name`: VARCHAR
   - `created_at`, `updated_at`: TIMESTAMP

2. **boards**
   - `id`: UUID (PK)
   - `user_id`: UUID (FK → users)
   - `name`: VARCHAR
   - `description`: TEXT
   - `created_at`, `updated_at`: TIMESTAMP

3. **columns**
   - `id`: UUID (PK)
   - `board_id`: UUID (FK → boards)
   - `name`: VARCHAR
   - `position`: INT
   - `created_at`, `updated_at`: TIMESTAMP

4. **tasks**
   - `id`: UUID (PK)
   - `column_id`: UUID (FK → columns)
   - `title`: VARCHAR
   - `description`: TEXT
   - `priority`: VARCHAR (low/medium/high)
   - `due_date`: TIMESTAMP
   - `position`: INT (for ordering within column)
   - `created_at`, `updated_at`: TIMESTAMP

5. **labels**
   - `id`: UUID (PK)
   - `board_id`: UUID (FK → boards)
   - `name`: VARCHAR
   - `color`: VARCHAR (hex color)
   - `created_at`: TIMESTAMP

6. **task_labels** (Junction table)
   - `task_id`: UUID (FK → tasks, PK)
   - `label_id`: UUID (FK → labels, PK)

7. **activity_logs**
   - `id`: UUID (PK)
   - `board_id`: UUID (FK → boards)
   - `task_id`: UUID (FK → tasks, nullable)
   - `action`: VARCHAR (created/updated/moved/deleted)
   - `details`: JSONB
   - `created_at`: TIMESTAMP

### Indexes
- `boards.user_id`
- `columns.board_id`
- `tasks.column_id`
- `activity_logs.board_id`
- `labels.board_id`

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Boards
- `GET /api/boards` - List user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/[id]` - Get board details
- `PUT /api/boards/[id]` - Update board
- `DELETE /api/boards/[id]` - Delete board

### Columns
- `POST /api/columns` - Create column in board
- `PUT /api/columns/[id]` - Update column
- `DELETE /api/columns/[id]` - Delete column

### Tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/[id]/move` - Move task to different column with position

### Labels
- `GET /api/labels` - List labels for board
- `POST /api/labels` - Create label
- `DELETE /api/labels/[id]` - Delete label

### Activity
- `GET /api/activity` - Get activity log for board

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/kanly
NEXTAUTH_SECRET=random_secret_key
NEXTAUTH_URL=http://localhost:3000
ENABLE_DEBUG_ENDPOINTS=false
```

`/api/debug/*` routes are disabled in production unless `ENABLE_DEBUG_ENDPOINTS=true`.

## Features - MVP

✅ User authentication (email/password)
✅ User profiles
✅ Create/update/delete boards
✅ Create/edit columns (To Do, Doing, Done)
✅ Create tasks with title, description, priority, due date
✅ Assign labels to tasks
✅ Drag & drop task movement (persist order)
✅ Activity log (track changes)
✅ Real-time updates (WebSocket ready)

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   createdb kanly
   psql kanly < schema.sql
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your DATABASE_URL
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Deployment (Nixpacks)

The project is configured for Nixpacks with Node.js 20+ support. Ensure your VPS provider (Dokploy) uses:
- Node version 20 or higher (specified in `package.json` engines)
- PostgreSQL 12+

## Implementation Notes

- All endpoints require authentication (except register/login)
- Task position uses integer ordering within each column
- Activity log captures: created, updated, moved, deleted actions
- Labels are board-scoped (users can only see/use labels on their boards)
- Drag & drop will require client-side state management + API calls
- WebSocket support for real-time updates planned for Phase 2

## Future Enhancements

- Real-time collaboration with WebSockets
- Task comments and mentions
- File attachments
- Board templates
- Bulk operations
- Search and filters
