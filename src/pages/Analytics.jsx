import { useState, useEffect } from 'react'
import { TrendingUp, Users, FileText, Eye, Heart, Calendar, Loader2 } from 'lucide-react'
import { Statistic, Card, Row, Col, Radio, Space, Typography, Spin } from 'antd'
import { UserOutlined, FileTextOutlined, EyeOutlined, HeartOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { analyticsAPI } from '../services/api'
import { subscribeToAnalytics, unsubscribeFromAnalytics } from '../services/websocket'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, change: 0, icon: <UserOutlined />, color: '#1890ff' },
    { label: 'Total Posts', value: 0, change: 0, icon: <FileTextOutlined />, color: '#52c41a' },
    { label: 'Total Views', value: 0, change: 0, icon: <EyeOutlined />, color: '#722ed1' },
    { label: 'Total Likes', value: 0, change: 0, icon: <HeartOutlined />, color: '#eb2f96' },
  ])
  const [topCommunities, setTopCommunities] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [userGrowthData, setUserGrowthData] = useState([])
  const [postEngagementData, setPostEngagementData] = useState([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const [statsResponse, topCommunitiesResponse, activityResponse] = await Promise.all([
          analyticsAPI.getStats(timeRange),
          analyticsAPI.getTopCommunities(timeRange),
          analyticsAPI.getRecentActivity(timeRange),
        ])

        if (statsResponse.data) {
          const data = statsResponse.data
          setStats([
            {
              label: 'Total Users',
              value: data.totalUsers || 0,
              change: data.userChange || 0,
              icon: <UserOutlined />,
              color: '#1890ff',
            },
            {
              label: 'Total Posts',
              value: data.totalPosts || 0,
              change: data.postChange || 0,
              icon: <FileTextOutlined />,
              color: '#52c41a',
            },
            {
              label: 'Total Views',
              value: data.totalViews || 0,
              change: data.viewChange || 0,
              icon: <EyeOutlined />,
              color: '#722ed1',
            },
            {
              label: 'Total Likes',
              value: data.totalLikes || 0,
              change: data.likeChange || 0,
              icon: <HeartOutlined />,
              color: '#eb2f96',
            },
          ])
        }

        if (topCommunitiesResponse.data) {
          setTopCommunities(
            Array.isArray(topCommunitiesResponse.data)
              ? topCommunitiesResponse.data
              : topCommunitiesResponse.data.communities || []
          )
        }

        if (activityResponse.data) {
          setRecentActivity(
            Array.isArray(activityResponse.data)
              ? activityResponse.data
              : activityResponse.data.activity || []
          )
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        if (error.response) {
          toast.error('Failed to load analytics')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    const handleAnalyticsUpdate = (updatedData) => {
      if (updatedData.stats) {
        const data = updatedData.stats
        setStats([
          {
            label: 'Total Users',
            value: data.totalUsers || stats[0].value,
            change: data.userChange || stats[0].change,
            icon: <UserOutlined />,
            color: '#1890ff',
          },
          {
            label: 'Total Posts',
            value: data.totalPosts || stats[1].value,
            change: data.postChange || stats[1].change,
            icon: <FileTextOutlined />,
            color: '#52c41a',
          },
          {
            label: 'Total Views',
            value: data.totalViews || stats[2].value,
            change: data.viewChange || stats[2].change,
            icon: <EyeOutlined />,
            color: '#722ed1',
          },
          {
            label: 'Total Likes',
            value: data.totalLikes || stats[3].value,
            change: data.likeChange || stats[3].change,
            icon: <HeartOutlined />,
            color: '#eb2f96',
          },
        ])
      }
    }

    subscribeToAnalytics(handleAnalyticsUpdate)

    return () => {
      unsubscribeFromAnalytics(handleAnalyticsUpdate)
    }
  }, [timeRange])

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Analytics</Title>
          <Text type="secondary" className="mt-2 block">Platform insights and statistics</Text>
        </div>
        <Radio.Group
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value)
            setLoading(true)
          }}
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="7d">7d</Radio.Button>
          <Radio.Button value="30d">30d</Radio.Button>
          <Radio.Button value="90d">90d</Radio.Button>
          <Radio.Button value="1y">1y</Radio.Button>
        </Radio.Group>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.label}
                value={stat.value}
                prefix={stat.icon}
                suffix={
                  <Space>
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                    <Text type="success" strong>{stat.change}%</Text>
                  </Space>
                }
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="User Growth" className="shadow">
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-2" />
                <p>Chart visualization would go here</p>
                <Text type="secondary" className="text-sm">Connect a charting library like Recharts</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Post Engagement" className="shadow">
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-2" />
                <p>Chart visualization would go here</p>
                <Text type="secondary" className="text-sm">Connect a charting library like Recharts</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Communities" className="shadow">
            <Space direction="vertical" size="middle" className="w-full">
              {loading ? (
                <div className="text-center py-8">
                  <Spin />
                </div>
              ) : topCommunities.length > 0 ? (
                topCommunities.map((community, index) => (
                  <div key={community.id || index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <Text strong>{community.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {community.members || community.memberCount || 0} members
                        </Text>
                      </div>
                    </div>
                    <Text type="secondary">#{index + 1}</Text>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Text type="secondary">No communities data available</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Activity" className="shadow">
            <Space direction="vertical" size="middle" className="w-full">
              {loading ? (
                <div className="text-center py-8">
                  <Spin />
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                    <Text>{activity.message || activity.description}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                    </Text>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Text type="secondary">No recent activity</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Analytics

