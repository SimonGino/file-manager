import React from 'react';
import { Table, Button, Space, message, Tag } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import request from '@/utils/request';
import type { ColumnsType } from 'antd/es/table';

interface SharedDocument {
  id: number;
  filename: string;
  share_uuid: string;
  share_type: 'no_password' | 'with_password';
  share_code?: string;
  share_expired_at: string;
  created_at: string;
  updated_at: string;
  download_count: number;
  file_size: number;
  mime_type: string;
}

const SharedFiles: React.FC = () => {
  const { data: sharedDocuments, refetch } = useQuery<SharedDocument[]>(
    'shared-documents',
    async () => {
      const response = await request.get('/documents/shared');
      return response.data;
    }
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard');
    });
  };

  const columns: ColumnsType<SharedDocument> = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Share Type',
      dataIndex: 'share_type',
      key: 'share_type',
      render: (type: string) => (
        <Tag color={type === 'with_password' ? 'blue' : 'green'}>
          {type === 'with_password' ? 'Password Protected' : 'Public'}
        </Tag>
      ),
    },
    {
      title: 'Share Link',
      key: 'share_link',
      render: (_, record) => {
        const shareUrl = `${window.location.origin}/shared/${record.share_uuid}`;
        return (
          <Space>
            <a
              style={{ 
                maxWidth: '200px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onClick={() => window.open(shareUrl, '_blank')}
            >
              {shareUrl}
            </a>
            <Button
              icon={<CopyOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(shareUrl);
              }}
            >
              Copy
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Downloads',
      dataIndex: 'download_count',
      key: 'download_count',
    },
    {
      title: 'Expires At',
      dataIndex: 'share_expired_at',
      key: 'share_expired_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },

  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2>Shared Files</h2>
      </div>
      <Table
        columns={columns}
        dataSource={sharedDocuments || []}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SharedFiles; 