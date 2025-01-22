import React, { useEffect, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import request from '@/utils/request';

interface FilePreviewProps {
  visible: boolean;
  onClose: () => void;
  fileUrl: string;
  mimeType: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  visible,
  onClose,
  fileUrl,
  mimeType
}) => {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    if (visible && fileUrl) {
      setLoading(true);
      request.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Range': 'bytes=0-' // 支持断点续传
        }
      })
        .then((response: any) => {
          const url = URL.createObjectURL(response);
          setBlobUrl(url);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading preview:', error);
          message.error('加载预览失败');
          setLoading(false);
        });
    }
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [visible, fileUrl]);

  const renderPreview = () => {
    if (loading) {
      return <Spin size="large" />;
    }

    if (!blobUrl) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>预览不可用</p>
        </div>
      );
    }

    if (mimeType.startsWith('image/')) {
      return <img src={blobUrl} style={{ width: '100%' }} alt="preview" />;
    } else if (mimeType.startsWith('video/')) {
      return (
        <video controls style={{ width: '100%' }}>
          <source src={blobUrl} type={mimeType} />
          您的浏览器不支持视频标签。
        </video>
      );
    } else {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>预览不可用</p>
          <a href={blobUrl} target="_blank" rel="noopener noreferrer">
            在新标签页中打开
          </a>
        </div>
      );
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title="文件预览"
    >
      <div style={{ textAlign: 'center', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {renderPreview()}
      </div>
    </Modal>
  );
};

export default FilePreview;