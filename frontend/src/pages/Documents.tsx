import React, { useState } from 'react';
import { Table, Space, Button, message } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import request from '@/utils/request';
import { Document } from '@/types/document';
import UploadButton from '@/components/UploadButton';
import FilePreview from '@/components/FilePreview';
import ShareDialog from '@/components/ShareDialog';


const Documents: React.FC = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<Document | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // 获取我的文件
  const { data: documents, refetch } = useQuery<Document[]>(
    'my-documents',
    async () => {
      const response = await request.get('/documents/my-documents');
      console.log('API Response:', response);
      return response.data;
    }
  );

  const handleUploadSuccess = () => {
    refetch();
    message.success('File uploaded successfully');
  };

  const handlePreview = async(record: Document) => {
    const response = await request.get(`/documents/preview/${record.id}`);
    setPreviewFile(response.data);
    setPreviewVisible(true);
  };

  const handleDownload = async (record: Document) => {
    try {
      const response = await request.get(`/documents/download/${record.id}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Download failed');
    }
  };

  const handleShare = (record: Document) => {
    setSelectedDocument(record);
    setShareVisible(true);
  };

  const columns = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Size',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size: number) => {
        const kb = size / 1024;
        if (kb < 1024) {
          return `${kb.toFixed(2)} KB`;
        }
        return `${(kb / 1024).toFixed(2)} MB`;
      },
    },
    {
      title: 'Type',
      dataIndex: 'mime_type',
      key: 'mime_type',
    },
    {
      title: 'Upload Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Downloads',
      dataIndex: 'download_count',
      key: 'download_count',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            Preview
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            Download
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleShare(record)}
          >
            Share
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: '0' }}>
      <div style={{ marginBottom: 16,display:'flex',justifyContent:'flex-start' }}>
        <UploadButton onSuccess={handleUploadSuccess} />
      </div>
      
      <Table
        columns={columns}
        dataSource={documents || []}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {previewFile && (
        <FilePreview
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          fileUrl={previewFile.preview_url}
          mimeType={previewFile.mime_type}
        />
      )}

      <ShareDialog
        visible={shareVisible}
        onClose={() => {
          setShareVisible(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
};

export default Documents; 