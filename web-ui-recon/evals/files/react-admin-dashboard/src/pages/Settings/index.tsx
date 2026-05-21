import { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, message, Spin, Divider } from 'antd'
import { settingsApi, SystemSettings } from '../../api/settings'

export default function SettingsPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const res = await settingsApi.get()
        form.setFieldsValue(res.data)
      } catch {
        message.error('获取配置失败')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [form])

  const handleSave = async (values: SystemSettings) => {
    setSaving(true)
    try {
      await settingsApi.update(values)
      message.success('配置已保存')
    } catch {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async (type: string) => {
    setTesting(true)
    try {
      const values = form.getFieldsValue()
      const configMap: Record<string, Record<string, unknown>> = {
        storage: {
          driver: values.storage_driver,
          endpoint: values.storage_endpoint,
          bucket: values.storage_bucket,
          access_key: values.access_key,
          secret_key: values.secret_key,
        },
        smtp: {
          host: values.smtp_host,
          port: values.smtp_port,
          encryption: values.smtp_encryption,
          username: values.smtp_username,
          password: values.smtp_password,
        },
      }
      await settingsApi.testConnection(type, configMap[type])
      message.success(`${type === 'storage' ? '存储' : '邮件'}连接测试成功`)
    } catch {
      message.error('连接测试失败')
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <Spin />

  return (
    <div style={{ maxWidth: 800 }}>
      <Form form={form} layout="vertical" onFinish={handleSave}>

        <Card title="基本设置" style={{ marginBottom: 16 }}>
          <Form.Item name="site_name" label="站点名称" rules={[{ required: true }]}>
            <Input placeholder="请输入站点名称" />
          </Form.Item>
          <Form.Item name="site_url" label="站点 URL" rules={[{ required: true }]}>
            <Input placeholder="https://example.com" />
          </Form.Item>
        </Card>

        <Card title="存储配置" style={{ marginBottom: 16 }}>
          <Form.Item name="storage_driver" label="存储方式">
            <Select>
              <Select.Option value="local">本地存储</Select.Option>
              <Select.Option value="s3">Amazon S3</Select.Option>
              <Select.Option value="oss">阿里云 OSS</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="storage_endpoint" label="Endpoint">
            <Input placeholder="https://s3.amazonaws.com" />
          </Form.Item>
          <Form.Item name="storage_bucket" label="Bucket">
            <Input placeholder="my-bucket" />
          </Form.Item>
          <Form.Item name="access_key" label="Access Key">
            <Input.Password placeholder="请输入 Access Key" />
          </Form.Item>
          <Form.Item name="secret_key" label="Secret Key">
            <Input.Password placeholder="请输入 Secret Key" />
          </Form.Item>
          <Button onClick={() => handleTestConnection('storage')} loading={testing}>
            测试存储连接
          </Button>
        </Card>

        <Card title="邮件配置" style={{ marginBottom: 16 }}>
          <Form.Item name="smtp_host" label="SMTP 主机" rules={[{ required: true }]}>
            <Input placeholder="smtp.example.com" />
          </Form.Item>
          <Form.Item name="smtp_port" label="SMTP 端口">
            <InputNumber style={{ width: '100%' }} placeholder="587" />
          </Form.Item>
          <Form.Item name="smtp_encryption" label="加密方式">
            <Select>
              <Select.Option value="none">无加密</Select.Option>
              <Select.Option value="starttls">STARTTLS</Select.Option>
              <Select.Option value="tls">TLS</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="smtp_username" label="SMTP 用户名">
            <Input placeholder="SMTP 用户名" />
          </Form.Item>
          <Form.Item name="smtp_password" label="SMTP 密码">
            <Input.Password placeholder="SMTP 密码" />
          </Form.Item>
          <Button onClick={() => handleTestConnection('smtp')} loading={testing}>
            测试邮件连接
          </Button>
        </Card>

        <Card title="Webhook" style={{ marginBottom: 16 }}>
          <Form.Item name="webhook_url" label="回调 URL">
            <Input placeholder="https://hook.example.com/callback" />
          </Form.Item>
        </Card>

        <Divider />
        <Button type="primary" htmlType="submit" loading={saving} size="large">
          保存配置
        </Button>
      </Form>
    </div>
  )
}
