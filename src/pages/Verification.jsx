import { useState } from 'react'
import { Filter, Shield } from 'lucide-react'
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined, FileTextOutlined, ShopOutlined, GlobalOutlined } from '@ant-design/icons'
import { Card, Input, Space, Tag, Avatar, Button, Select, Descriptions, Empty, Statistic, Row, Col, Typography } from 'antd'
import toast from 'react-hot-toast'

const { Search: AntSearch } = Input
const { Title, Text, Paragraph } = Typography

function Verification() {
  const [verificationRequests, setVerificationRequests] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredRequests = verificationRequests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.applicant.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const handleApprove = (id) => {
    setVerificationRequests(requests =>
      requests.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    )
    toast.success('Verification request approved')
  }

  const handleReject = (id) => {
    setVerificationRequests(requests =>
      requests.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    )
    toast.error('Verification request rejected')
  }

  const pendingCount = verificationRequests.filter(r => r.status === 'pending').length
  const approvedCount = verificationRequests.filter(r => r.status === 'approved').length
  const rejectedCount = verificationRequests.filter(r => r.status === 'rejected').length

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <ClockCircleOutlined /> },
      approved: { color: 'success', icon: <CheckCircleOutlined /> },
      rejected: { color: 'error', icon: <CloseCircleOutlined /> },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.toUpperCase()}
      </Tag>
    )
  }

  const getTypeTag = (type) => {
    return (
      <Tag color={type === 'business' ? 'blue' : 'purple'} icon={type === 'business' ? <ShopOutlined /> : <UserOutlined />}>
        {type.toUpperCase()}
      </Tag>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-primary-500" size={32} />
          <Title level={2} style={{ margin: 0 }}>Verification Requests</Title>
        </div>
        <Text type="secondary">Review and approve verification requests for businesses and users</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending Requests"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Approved"
              value={approvedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Rejected"
              value={rejectedCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <AntSearch
                placeholder="Search requests..."
                allowClear
                enterButton
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
              size="large"
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </div>
        </div>

        <Space direction="vertical" size="large" className="w-full">
          {filteredRequests.length === 0 ? (
            <Empty
              image={<Shield className="mx-auto text-gray-400" size={48} />}
              description={<Text type="secondary">No verification requests found</Text>}
            />
          ) : (
            filteredRequests.map((request) => (
              <Card
                key={request.id}
                hoverable
                actions={
                  request.status === 'pending'
                    ? [
                        <Button
                          key="approve"
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleApprove(request.id)}
                          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                          Approve
                        </Button>,
                        <Button
                          key="reject"
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>,
                      ]
                    : undefined
                }
              >
                <div className="mb-4">
                  <Space size="middle" wrap>
                    <Avatar
                      size={40}
                      icon={request.type === 'business' ? <ShopOutlined /> : <UserOutlined />}
                      style={{
                        backgroundColor: request.type === 'business' ? '#1890ff' : '#722ed1',
                      }}
                    />
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {request.name}
                      </Title>
                      <Space className="mt-2">
                        {getStatusTag(request.status)}
                        {getTypeTag(request.type)}
                      </Space>
                    </div>
                  </Space>
                </div>

                <Paragraph className="mb-4">{request.description}</Paragraph>

                <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined />
                        <span>Applicant</span>
                      </Space>
                    }
                  >
                    {request.applicant}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <MailOutlined />
                        <span>Email</span>
                      </Space>
                    }
                  >
                    {request.email}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        <span>Phone</span>
                      </Space>
                    }
                  >
                    {request.phone}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <ClockCircleOutlined />
                        <span>Applied</span>
                      </Space>
                    }
                  >
                    {request.appliedDate}
                  </Descriptions.Item>
                  {request.website && (
                    <Descriptions.Item
                      label={
                        <Space>
                          <GlobalOutlined />
                          <span>Website</span>
                        </Space>
                      }
                    >
                      <a
                        href={`https://${request.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {request.website}
                      </a>
                    </Descriptions.Item>
                  )}
                  {request.socialMedia && (
                    <Descriptions.Item label="Social Media">{request.socialMedia}</Descriptions.Item>
                  )}
                </Descriptions>

                <Card
                  size="small"
                  className="mt-4"
                  style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}
                >
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Submitted Documents:</Text>
                  </Space>
                  <div className="mt-2">
                    <Space wrap>
                      {request.documents.map((doc, index) => (
                        <Tag key={index} color="blue">
                          {doc}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Card>
              </Card>
            ))
          )}
        </Space>
      </Card>
    </div>
  )
}

export default Verification

