import { useState, useEffect } from 'react'
import { Filter, Loader2 } from 'lucide-react'
import { EyeOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { List, Input, Space, Tag, Avatar, Button, Popconfirm, Card, Typography, Spin } from 'antd'
import { postsAPI } from '../services/api'
import { subscribeToPosts, unsubscribeFromPosts } from '../services/websocket'
import toast from 'react-hot-toast'

const { Search: AntSearch } = Input
const { Text, Paragraph } = Typography

function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Fetch posts from API
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await postsAPI.getAll()
        if (response.data && Array.isArray(response.data)) {
          setPosts(response.data)
        } else if (response.data?.posts && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        if (error.response) {
          toast.error('Failed to load posts')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // Subscribe to real-time post updates
    const handlePostUpdate = {
      onNew: (newPost) => {
        setPosts((prev) => [newPost, ...prev])
        toast.success('New post created')
      },
      onUpdated: (updatedPost) => {
        setPosts((prev) =>
          prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
        )
      },
      onDeleted: (data) => {
        const postId = data.postId || data.id
        setPosts((prev) => prev.filter((post) => post.id !== postId))
        toast.success('Post deleted')
      },
    }

    subscribeToPosts(handlePostUpdate)

    // Cleanup
    return () => {
      unsubscribeFromPosts(handlePostUpdate)
    }
  }, [])

  const filteredPosts = posts.filter(
    (post) =>
      (post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.username?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      post
  )

  const handleDelete = async (id) => {
    try {
      await postsAPI.delete(id)
      setPosts(posts.filter((post) => post.id !== id))
      toast.success('Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleApprove = async (id) => {
    try {
      await postsAPI.approve(id)
      setPosts(
        posts.map((post) => (post.id === id ? { ...post, status: 'published' } : post))
      )
      toast.success('Post approved')
    } catch (error) {
      console.error('Error approving post:', error)
      toast.error('Failed to approve post')
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600 mt-2">Manage and moderate all posts</p>
        </div>
      </div>

      <Card className="shadow">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <AntSearch
                placeholder="Search posts..."
                allowClear
                enterButton
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <List
          itemLayout="vertical"
          dataSource={filteredPosts}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} posts`,
          }}
          renderItem={(post) => (
            <List.Item
              key={post.id}
              actions={[
                <Button 
                  type="text" 
                  icon={<EyeOutlined />}
                  style={{ color: '#2563eb' }}
                  title="View Post"
                />,
                post.status === 'flagged' && (
                  <Button
                    type="text"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(post.id)}
                    style={{ color: '#16a34a' }}
                    title="Approve Post"
                  />
                ),
                <Popconfirm
                  title="Delete post"
                  description="Are you sure you want to delete this post?"
                  onConfirm={() => handleDelete(post.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    title="Delete Post"
                  />
                </Popconfirm>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: '#0ea5e9' }}>
                    {post.author[0].toUpperCase()}
                  </Avatar>
                }
                title={
                  <Space>
                    <Text strong>@{post.author || post.username}</Text>
                    <Tag color={post.status === 'published' ? 'green' : post.status === 'flagged' ? 'red' : 'orange'}>
                      {(post.status || 'pending').toUpperCase()}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {post.date || (post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A')}
                    </Text>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph className="mb-3" style={{ marginBottom: '12px' }}>
                      {post.content || post.text || post.body}
                    </Paragraph>
                    <Space>
                      <Text type="secondary">
                        <strong>{post.likes || post.likeCount || 0}</strong> likes
                      </Text>
                      <Text type="secondary">
                        <strong>{post.comments || post.commentCount || 0}</strong> comments
                      </Text>
                      {post.views !== undefined && (
                        <Text type="secondary">
                          <strong>{post.views}</strong> views
                        </Text>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default Posts

