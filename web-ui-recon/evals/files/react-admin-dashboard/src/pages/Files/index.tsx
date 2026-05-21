import { useState, useEffect } from 'react'
import { Table, Button, Modal, Upload, message, Popconfirm, Space, Progress } from 'antd'
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { fileApi } from '../../api/files'
import type { UploadFile } from 'antd/es/upload/interface'

interface FileItem {
  id: number
  filename: string
  size: number
  mime_type: string
  created_at: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const res = await fileApi.list()
      setFiles(res.data.data)
    } catch {
      message.error('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFiles() }, [])

  const handleUpload = async (file: File) => {
    try {
      await fileApi.upload(file, setUploadProgress)
      message.success('上传成功')
      setUploadProgress(0)
      fetchFiles()
    } catch {
      message.error('上传失败')
    }
    return false
  }

  const handleDelete = async (id: number) => {
    await fileApi.delete(id)
    message.success('删除成功')
    fetchFiles()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '文件名', dataIndex: 'filename', key: 'filename' },
    { title: '大小', dataIndex: 'size', key: 'size', render: (size: number) => `${(size / 1024).toFixed(2)} KB` },
    { title: '类型', dataIndex: 'mime_type', key: 'mime_type' },
    { title: '上传时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: FileItem) => (
        <Space>
          <Button type="link" icon={<DownloadOutlined />} href={fileApi.getDownloadUrl(record.id)}>
            下载
          </Button>
          <Popconfirm title="确定删除此文件?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Upload
          accept="image/*,.pdf,.doc,.docx"
          showUploadList={false}
          beforeUpload={handleUpload}
        >
          <Button type="primary" icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
        {uploadProgress > 0 && (
          <Progress percent={uploadProgress} style={{ width: 200, marginTop: 8 }} />
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={files} loading={loading} />
    </div>
  )
}
