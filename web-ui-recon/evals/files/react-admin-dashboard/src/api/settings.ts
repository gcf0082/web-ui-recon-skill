import apiClient from './client'

export interface SystemSettings {
  site_name: string
  site_url: string
  storage_driver: 'local' | 's3' | 'oss'
  storage_endpoint: string
  storage_bucket: string
  access_key: string
  secret_key: string
  smtp_host: string
  smtp_port: number
  smtp_encryption: 'none' | 'starttls' | 'tls'
  smtp_username: string
  smtp_password: string
  webhook_url: string
}

export const settingsApi = {
  get: () =>
    apiClient.get('/settings'),

  update: (data: SystemSettings) =>
    apiClient.put('/settings', data),

  testConnection: (type: string, config: Record<string, unknown>) =>
    apiClient.post('/settings/test-connection', { type, config }),
}
