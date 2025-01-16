import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Button, message, Spin, Layout, Space } from 'antd';
import request from '@/utils/request';

const { Header, Content } = Layout;

interface ShareInfo {
  requires_password: boolean;
  filename: string;
}

interface DocumentInfo {
  filename: string;
  mime_type: string;
  preview_url: string;
}

const SharedDocument: React.FC = () => {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const [shareCode, setShareCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const navigate = useNavigate();

  // 检查分享类型
  useEffect(() => {
    const checkShareType = async () => {
      try {
        const response = await request.get(`/documents/shared/${shareUuid}/check`);
        setShareInfo(response.data);
        
        // 如果不需要密码，直接获取文件信息
        if (!response.data.requires_password) {
          getDocumentInfo();
        }
      } catch (error: any) {
        message.error('Share not found or expired');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareUuid) {
      checkShareType();
    }
  }, [shareUuid]);

  // 获取文件信息
  const getDocumentInfo = async (code?: string) => {
    try {
      const response = await request.get(`/documents/shared/${shareUuid}`, {
        params: code ? { share_code: code } : undefined
      });
      setDocumentInfo(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to access document');
      throw error;
    }
  };

  // 提交密码
  const handleSubmitCode = async () => {
    if (!shareCode || shareCode.length !== 4) {
      message.error('Please enter a valid share code');
      return;
    }

    setIsSubmitting(true);
    try {
      await getDocumentInfo(shareCode);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!shareInfo) {
      return (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>Share not found or expired</h2>
        </div>
      );
    }

    if (shareInfo.requires_password && !documentInfo) {
      return (
        <Card style={{ maxWidth: 400, margin: '48px auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <h2 style={{ textAlign: 'center', margin: 0 }}>
              This document is password protected
            </h2>
            <p style={{ textAlign: 'center', margin: 0 }}>
              {shareInfo.filename}
            </p>
            <div>
              <Input
                value={shareCode}
                onChange={e => setShareCode(e.target.value.replace(/[^\d]/g, ''))}
                maxLength={4}
                placeholder="Enter 4-digit code"
                style={{ 
                  textAlign: 'center', 
                  fontSize: '24px', 
                  letterSpacing: '8px',
                  padding: '8px'
                }}
                onPressEnter={handleSubmitCode}
              />
            </div>
            <Button 
              type="primary" 
              block
              size="large"
              onClick={handleSubmitCode}
              loading={isSubmitting}
            >
              View Document
            </Button>
          </Space>
        </Card>
      );
    }

    if (documentInfo) {
      return (
        <Card>
          <h2>{documentInfo.filename}</h2>
          {documentInfo.mime_type.startsWith('image/') ? (
            <img 
              src={documentInfo.preview_url} 
              style={{ maxWidth: '100%', maxHeight: '80vh' }} 
              alt={documentInfo.filename} 
            />
          ) : documentInfo.mime_type.startsWith('video/') ? (
            <video 
              controls 
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            >
              <source src={documentInfo.preview_url} type={documentInfo.mime_type} />
              Your browser does not support the video tag.
            </video>
          ) : documentInfo.mime_type.startsWith('audio/') ? (
            <audio controls style={{ width: '100%' }}>
              <source src={documentInfo.preview_url} type={documentInfo.mime_type} />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>This file type cannot be previewed directly.</p>
              <Button 
                type="primary" 
                href={documentInfo.preview_url}
                target="_blank"
              >
                Download File
              </Button>
            </div>
          )}
        </Card>
      );
    }

    return null;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          Shared Document
        </div>
        <Button type="link" onClick={() => navigate('/documents')}>
          Back to Documents
        </Button>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default SharedDocument; 