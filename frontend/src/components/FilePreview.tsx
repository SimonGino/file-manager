import React from 'react';
import { Modal } from 'antd';

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
  const renderPreview = () => {
    if (mimeType.startsWith('image/')) {
      return <img src={fileUrl} style={{ width: '100%' }} alt="preview" />;
    } else if (mimeType.startsWith('video/')) {
      return (
        <video controls style={{ width: '100%' }}>
          <source src={fileUrl} type={mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>Preview not available</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Open in new tab
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
      title="File Preview"
    >
      {renderPreview()}
    </Modal>
  );
};

export default FilePreview; 