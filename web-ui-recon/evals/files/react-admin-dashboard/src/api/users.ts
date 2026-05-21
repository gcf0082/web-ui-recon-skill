import apiClient from './client'

export interface CreateUserParams {
  username: string
  email: string
  password: string
  role: 'admin' | 'editor' | 'user'
}

export interface UpdateUserParams {
  id: number
  username?: string
  email?: string
  role?: 'admin' | 'editor' | 'user'
  status?: 'active' | 'disabled'
}

export const userApi = {
  list: (params?: { page?: number; page_size?: number; keyword?: string }) =>
    apiClient.get('/users', { params }),

  get: (id: number) =>
    apiClient.get(`/users/${id}`),

  create: (data: CreateUserParams) =>
    apiClient.post('/users', data),

  update: (id: number, data: UpdateUserParams) =>
    apiClient.put(`/users/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  batchDelete: (ids: number[]) =>
    apiClient.post('/users/batch-delete', { ids }),

  toggleStatus: (id: number, status: 'active' | 'disabled') =>
    apiClient.patch(`/users/${id}/status`, { status }),
}
