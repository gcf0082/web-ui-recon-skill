import apiClient from './client'

export const fileApi = {
  list: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/files', { params }),

  upload: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
  },

  delete: (id: number) =>
    apiClient.delete(`/files/${id}`),

  getDownloadUrl: (id: number) =>
    `/api/files/download/${id}`,
}
