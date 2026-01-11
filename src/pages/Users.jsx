import { useState, useEffect } from 'react'
import { Filter, Loader2 } from 'lucide-react'
import { EditOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { Table, Input, Space, Tag, Avatar, Button, Popconfirm, Spin } from 'antd'
import { usersAPI } from '../services/api'
import { subscribeToUsers, unsubscribeFromUsers } from '../services/websocket'
import toast from 'react-hot-toast'

const { Search: AntSearch } = Input

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await usersAPI.getAll()
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data)
        } else if (response.data?.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        if (error.response) {
          toast.error('Failed to load users')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()

    // Subscribe to real-time user updates
    const handleUserUpdate = {
      onNew: (newUser) => {
        setUsers((prev) => [newUser, ...prev])
        toast.success(`New user: ${newUser.username || newUser.email}`)
      },
      onUpdated: (updatedUser) => {
        setUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        )
      },
      onDeleted: (data) => {
        const userId = data.userId || data.id
        setUsers((prev) => prev.filter((user) => user.id !== userId))
        toast.success('User deleted')
      },
    }

    subscribeToUsers(handleUserUpdate)

    // Cleanup
    return () => {
      unsubscribeFromUsers(handleUserUpdate)
    }
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      user
  )

  const handleDelete = async (id) => {
    try {
      await usersAPI.delete(id)
      setUsers(users.filter((user) => user.id !== id))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleBan = async (id) => {
    try {
      const user = users.find((u) => u.id === id)
      const isCurrentlyBanned = user?.status === 'banned'
      
      if (isCurrentlyBanned) {
        await usersAPI.unban(id)
      } else {
        await usersAPI.ban(id)
      }
      
      setUsers(
        users.map((user) =>
          user.id === id
            ? { ...user, status: isCurrentlyBanned ? 'active' : 'banned' }
            : user
        )
      )
      toast.success(isCurrentlyBanned ? 'User unbanned' : 'User banned')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user status')
    }
  }

  const columns = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <Space>
          <Avatar style={{ backgroundColor: '#0ea5e9' }}>
            {text[0].toUpperCase()}
          </Avatar>
          <span>@{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joined',
      key: 'joined',
    },
    {
      title: 'Posts',
      dataIndex: 'posts',
      key: 'posts',
      sorter: (a, b) => a.posts - b.posts,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />}
            style={{ color: '#2563eb' }}
            title="Edit User"
          />
          <Button
            type="text"
            icon={<StopOutlined />}
            onClick={() => handleBan(record.id)}
            style={{ color: record.status === 'banned' ? '#16a34a' : '#dc2626' }}
            title={record.status === 'banned' ? 'Unban User' : 'Ban User'}
          />
          <Popconfirm
            title="Delete user"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
              title="Delete User"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage all platform users</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <AntSearch
                placeholder="Search users..."
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

        <div className="p-6">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Users

