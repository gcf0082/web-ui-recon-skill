import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Checkbox, Tag, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { articleApi, ArticleInput } from '../../api/articles'

interface Article {
  id: number
  title: string
  category: string
  tags: string[]
  is_published: boolean
  created_at: string
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const res = await articleApi.list()
      setArticles(res.data.data)
    } catch {
      message.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchArticles() }, [])

  const handleSubmit = async (values: ArticleInput) => {
    if (editingId) {
      await articleApi.update(editingId, values)
    } else {
      await articleApi.create(values)
    }
    message.success(`${editingId ? '更新' : '创建'}成功`)
    setModalOpen(false)
    form.resetFields()
    setEditingId(null)
    fetchArticles()
  }

  const handleDelete = async (id: number) => {
    await articleApi.delete(id)
    message.success('删除成功')
    fetchArticles()
  }

  const handleEdit = (record: Article) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => tags?.map(t => <Tag key={t}>{t}</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'is_published',
      key: 'is_published',
      render: (v: boolean) => v ? '已发布' : '草稿',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Article) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此文章?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建文章
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={articles} loading={loading} />

      <Modal
        title={editingId ? '编辑文章' : '新建文章'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingId(null); form.resetFields() }}
        width={800}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              <Select.Option value="tech">技术</Select.Option>
              <Select.Option value="life">生活</Select.Option>
              <Select.Option value="news">新闻</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cover_url" label="封面图 URL">
            <Input placeholder="https://example.com/cover.jpg" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={12} placeholder="请输入文章内容（支持 HTML）" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
          <Form.Item name="is_published" valuePropName="checked">
            <Checkbox>发布后立即公开</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingId ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
