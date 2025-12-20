interface FetchOptions extends RequestInit {
  body?: any
}

async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { body, ...restOptions } = options

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...restOptions.headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server error: Please check if environment variables are configured correctly')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const boardsApi = {
  list: () => apiFetch<{ boards: any[] }>('/api/boards'),

  get: (id: string) => apiFetch<{ board: any; columns: any[] }>(`/api/boards/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiFetch<{ board: any }>('/api/boards', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: { name?: string; description?: string | null }) =>
    apiFetch<{ board: any }>(`/api/boards/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/boards/${id}`, {
      method: 'DELETE',
    }),
}

export const columnsApi = {
  create: (data: { board_id: string; name: string; position: number }) =>
    apiFetch<{ column: any }>('/api/columns', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: { name?: string; position?: number }) =>
    apiFetch<{ column: any }>(`/api/columns/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/columns/${id}`, {
      method: 'DELETE',
    }),
}

export const tasksApi = {
  get: (id: string) => apiFetch<{ task: any }>(`/api/tasks/${id}`),

  create: (data: {
    column_id: string
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    due_date?: string | null
    position: number
  }) =>
    apiFetch<{ task: any }>('/api/tasks', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiFetch<{ task: any }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: data,
    }),

  move: (id: string, data: { column_id: string; position: number }) =>
    apiFetch<{ task: any }>(`/api/tasks/${id}/move`, {
      method: 'POST',
      body: data,
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
}

export const labelsApi = {
  list: (boardId: string) =>
    apiFetch<{ labels: any[] }>(`/api/labels?board_id=${boardId}`),

  create: (data: { board_id: string; name: string; color?: string }) =>
    apiFetch<{ label: any }>('/api/labels', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: { name?: string; color?: string | null }) =>
    apiFetch<{ label: any }>(`/api/labels/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/labels/${id}`, {
      method: 'DELETE',
    }),
}

export const activityApi = {
  list: (boardId: string, limit = 50) =>
    apiFetch<{ logs: any[] }>(`/api/activity?board_id=${boardId}&limit=${limit}`),
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    apiFetch<{ user: any; message: string }>('/api/auth/register', {
      method: 'POST',
      body: data,
    }),
}
