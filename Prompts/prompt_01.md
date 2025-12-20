Build a simple Kanboard clone MVP — a kanban task management app where users can create boards, add lists/columns, create tasks, move tasks across columns (drag & drop), and see updates in real time.

Tech stack: Next.js 14 (App Router) for frontend + API routes, PostgreSQL for database (will connect via DATABASE_URL env var).

This will be deployed on a VPS using Dokploy, so ensure the project works with Nixpacks (specify Node 20+ in package.json engines).

Core features for MVP:

Auth (email/password) + basic user profile

Boards (create/list/update/delete)

Columns (To Do / Doing / Done by default, editable)

Tasks (title, description, priority, due date, labels)

Drag & drop task movement + persist order (task position within column)

Activity log (task moved, created, updated)

Start by creating the project structure, a detailed README, and a clear database schema (users, boards, columns, tasks, labels, task_labels, activity_logs tables).

Don't implement yet — just architecture and docs.
