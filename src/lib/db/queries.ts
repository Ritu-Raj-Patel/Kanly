import db from './index'
import type { Board, Column, Task, Label, ActivityLog } from '@/types/database'

export async function createUser(email: string, passwordHash: string, name?: string) {
  const [user] = await db`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name ?? null})
    RETURNING *
  `
  return user
}

export async function getUserByEmail(email: string) {
  const [user] = await db`
    SELECT * FROM users WHERE email = ${email}
  `
  return user
}

export async function getUserById(id: string) {
  const [user] = await db`
    SELECT * FROM users WHERE id = ${id}
  `
  return user
}

export async function getBoardsByUserId(userId: string): Promise<Board[]> {
  return await db<Board[]>`
    SELECT * FROM boards
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
}

export async function getBoardById(boardId: string): Promise<Board | null> {
  const [board] = await db<Board[]>`
    SELECT * FROM boards WHERE id = ${boardId}
  `
  return board || null
}

export async function createBoard(userId: string, name: string, description?: string) {
  const [board] = await db`
    INSERT INTO boards (user_id, name, description)
    VALUES (${userId}, ${name}, ${description ?? null})
    RETURNING *
  `
  return board
}

export async function updateBoard(boardId: string, updates: { name?: string; description?: string | null }) {
  const [board] = await db`
    UPDATE boards
    SET name = COALESCE(${updates.name ?? null}, name),
        description = COALESCE(${updates.description ?? null}, description),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${boardId}
    RETURNING *
  `
  return board
}

export async function deleteBoard(boardId: string) {
  await db`DELETE FROM boards WHERE id = ${boardId}`
}

export async function getColumnsByBoardId(boardId: string): Promise<Column[]> {
  return await db<Column[]>`
    SELECT * FROM columns
    WHERE board_id = ${boardId}
    ORDER BY position ASC
  `
}

export async function getColumnById(columnId: string): Promise<Column | null> {
  const [column] = await db<Column[]>`
    SELECT * FROM columns WHERE id = ${columnId}
  `
  return column || null
}

export async function createColumn(boardId: string, name: string, position: number) {
  const [column] = await db`
    INSERT INTO columns (board_id, name, position)
    VALUES (${boardId}, ${name}, ${position})
    RETURNING *
  `
  return column
}

export async function updateColumn(columnId: string, updates: { name?: string; position?: number }) {
  const [column] = await db`
    UPDATE columns
    SET name = COALESCE(${updates.name ?? null}, name),
        position = COALESCE(${updates.position ?? null}, position),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${columnId}
    RETURNING *
  `
  return column
}

export async function deleteColumn(columnId: string) {
  await db`DELETE FROM columns WHERE id = ${columnId}`
}

export async function getTasksByColumnId(columnId: string): Promise<Task[]> {
  return await db<Task[]>`
    SELECT * FROM tasks
    WHERE column_id = ${columnId}
    ORDER BY position ASC
  `
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const [task] = await db<Task[]>`
    SELECT * FROM tasks WHERE id = ${taskId}
  `
  return task || null
}

export async function createTask(data: {
  column_id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string | null
  position: number
}) {
  const [task] = await db`
    INSERT INTO tasks (column_id, title, description, priority, due_date, position)
    VALUES (${data.column_id}, ${data.title}, ${data.description ?? null}, ${data.priority ?? 'medium'}, ${data.due_date ?? null}, ${data.position})
    RETURNING *
  `
  return task
}

export async function updateTask(taskId: string, updates: {
  title?: string
  description?: string | null
  priority?: 'low' | 'medium' | 'high'
  due_date?: string | Date | null
  position?: number
}) {
  const [task] = await db`
    UPDATE tasks
    SET title = COALESCE(${updates.title ?? null}, title),
        description = COALESCE(${updates.description ?? null}, description),
        priority = COALESCE(${updates.priority ?? null}, priority),
        due_date = COALESCE(${updates.due_date ?? null}, due_date),
        position = COALESCE(${updates.position ?? null}, position),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${taskId}
    RETURNING *
  `
  return task
}

export async function moveTask(taskId: string, columnId: string, position: number) {
  const [task] = await db`
    UPDATE tasks
    SET column_id = ${columnId},
        position = ${position},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${taskId}
    RETURNING *
  `
  return task
}

export async function deleteTask(taskId: string) {
  await db`DELETE FROM tasks WHERE id = ${taskId}`
}

export async function getLabelsByBoardId(boardId: string): Promise<Label[]> {
  return await db<Label[]>`
    SELECT * FROM labels
    WHERE board_id = ${boardId}
    ORDER BY created_at ASC
  `
}

export async function getTaskLabels(taskId: string): Promise<Label[]> {
  return await db<Label[]>`
    SELECT l.* FROM labels l
    INNER JOIN task_labels tl ON l.id = tl.label_id
    WHERE tl.task_id = ${taskId}
  `
}

export async function createLabel(boardId: string, name: string, color?: string) {
  const [label] = await db`
    INSERT INTO labels (board_id, name, color)
    VALUES (${boardId}, ${name}, ${color ?? null})
    RETURNING *
  `
  return label
}

export async function updateLabel(labelId: string, updates: { name?: string; color?: string | null }) {
  const [label] = await db`
    UPDATE labels
    SET name = COALESCE(${updates.name ?? null}, name),
        color = COALESCE(${updates.color ?? null}, color)
    WHERE id = ${labelId}
    RETURNING *
  `
  return label
}

export async function deleteLabel(labelId: string) {
  await db`DELETE FROM labels WHERE id = ${labelId}`
}

export async function addTaskLabel(taskId: string, labelId: string) {
  await db`
    INSERT INTO task_labels (task_id, label_id)
    VALUES (${taskId}, ${labelId})
    ON CONFLICT DO NOTHING
  `
}

export async function removeTaskLabel(taskId: string, labelId: string) {
  await db`
    DELETE FROM task_labels
    WHERE task_id = ${taskId} AND label_id = ${labelId}
  `
}

// Ownership verification helpers
export async function verifyTaskOwnership(taskId: string, userId: string): Promise<boolean> {
  const [result] = await db`
    SELECT t.id FROM tasks t
    INNER JOIN columns c ON t.column_id = c.id
    INNER JOIN boards b ON c.board_id = b.id
    WHERE t.id = ${taskId} AND b.user_id = ${userId}
  `
  return !!result
}

export async function verifyColumnOwnership(columnId: string, userId: string): Promise<boolean> {
  const [result] = await db`
    SELECT c.id FROM columns c
    INNER JOIN boards b ON c.board_id = b.id
    WHERE c.id = ${columnId} AND b.user_id = ${userId}
  `
  return !!result
}

export async function verifyLabelOwnership(labelId: string, userId: string): Promise<boolean> {
  const [result] = await db`
    SELECT l.id FROM labels l
    INNER JOIN boards b ON l.board_id = b.id
    WHERE l.id = ${labelId} AND b.user_id = ${userId}
  `
  return !!result
}

export async function getActivityLogsByBoardId(boardId: string, limit = 50): Promise<ActivityLog[]> {
  return await db<ActivityLog[]>`
    SELECT * FROM activity_logs
    WHERE board_id = ${boardId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
}

export async function createActivityLog(
  boardId: string,
  action: string,
  taskId?: string | null,
  details?: Record<string, any> | null
) {
  const [log] = await db`
    INSERT INTO activity_logs (board_id, task_id, action, details)
    VALUES (${boardId}, ${taskId ?? null}, ${action}, ${details ? JSON.stringify(details) : null})
    RETURNING *
  `
  return log
}
