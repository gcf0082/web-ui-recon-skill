import apiClient from './client'

export interface ArticleInput {
  title: string
  category: string
  content: string
  tags: string[]
  cover_url?: string
  is_published: boolean
}

export const articleApi = {
  list: (params?: { page?: number; page_size?: number; category?: string }) =>
    apiClient.get('/articles', { params }),

  get: (id: number) =>
    apiClient.get(`/articles/${id}`),

  create: (data: ArticleInput) =>
    apiClient.post('/articles', data),

  update: (id: number, data: ArticleInput) =>
    apiClient.put(`/articles/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/articles/${id}`),
}
