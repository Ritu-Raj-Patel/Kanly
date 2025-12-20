export interface User {
  id: string
  email: string
  password_hash: string
  name: string | null
  created_at: Date
  updated_at: Date
}

export interface Board {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: Date
  updated_at: Date
}

export interface Column {
  id: string
  board_id: string
  name: string
  position: number
  created_at: Date
  updated_at: Date
}

export interface Task {
  id: string
  column_id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  due_date: Date | null
  position: number
  created_at: Date
  updated_at: Date
}

export interface Label {
  id: string
  board_id: string
  name: string
  color: string | null
  created_at: Date
}

export interface TaskLabel {
  task_id: string
  label_id: string
}

export interface ActivityLog {
  id: string
  board_id: string
  task_id: string | null
  action: string
  details: Record<string, any> | null
  created_at: Date
}
