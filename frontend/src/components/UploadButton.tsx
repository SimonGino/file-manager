import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import request from '@/utils/request';

interface UploadButtonProps {
  onSuccess: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onSuccess }) => {
  const props: UploadProps = {
    name: 'file',
    action: '/api/documents/upload',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    onChange(info) {
      if (info.file.status === 'done') {
        onSuccess();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    showUploadList: false
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Upload File</Button>
    </Upload>
  );
};

export default UploadButton;
