import React, { useState, useEffect } from 'react';
import { Modal, Form, Radio, Input, Space, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Document } from '@/types/document';
import request from '@/utils/request';

interface ShareDialogProps {
  visible: boolean;
  onClose: () => void;
  document: Document | null;
}

interface ShareResponse {
  share_uuid: string;
  share_type: 'no_password' | 'with_password';
  share_code?: string;
  share_expired_at: string;
  filename: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ visible, onClose, document }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shareInfo, setShareInfo] = useState<ShareResponse | null>(null);

  // 检查文件是否已分享
  useEffect(() => {
    const checkShareStatus = async () => {
      if (!document?.id || !visible) return;
      
      try {
        const response = await request.get(`/documents/${document.id}/share`);
        setShareInfo(response.data);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          message.error('Failed to check share status');
        }
      }
    };

    checkShareStatus();
  }, [document?.id, visible]);

  const handleClose = () => {
    setShareInfo(null);
    form.resetFields();
    onClose();
  };

  const handleShare = async (values: any) => {
    if (!document) return;
    
    setLoading(true);
    try {
      const response = await request.post(`/documents/share/${document.id}`, {
        share_type: values.share_type,
        share_code: values.share_code,
      });
      
      setShareInfo(response.data);
      message.success('Document shared successfully');
      handleClose();
    } catch (error) {
      message.error('Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCode = async () => {
    if (!shareInfo) return;
    
    try {
      const values = await form.validateFields();
      const response = await request.put(`/documents/share/${shareInfo.share_uuid}`, {
        share_code: values.new_share_code,
      });
      
      setShareInfo(response.data);
      message.success('Share code updated successfully');
    } catch (error) {
      message.error('Failed to update share code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard');
    });
  };

  const getShareLink = () => {
    if (!shareInfo) return '';
    return `${window.location.origin}/shared/${shareInfo.share_uuid}`;
  };

  const handleCancelShare = async () => {
    if (!document?.id) return;
    
    try {
      await request.delete(`/documents/${document.id}/share`);
      message.success('Share cancelled successfully');
      setShareInfo(null);
    } catch (error) {
      message.error('Failed to cancel share');
    }
  };

  return (
    <Modal
      title="Share Document"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      {!shareInfo?.is_shared ? (
        <Form form={form} onFinish={handleShare} initialValues={{ share_type: 'no_password' }}>
          <Form.Item
            name="share_type"
            label="Share Type"
          >
            <Radio.Group>
              <Radio value="no_password">No Password</Radio>
              <Radio value="with_password">With Password</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.share_type !== currentValues.share_type
            }
          >
            {({ getFieldValue }) => 
              getFieldValue('share_type') === 'with_password' ? (
                <Form.Item
                  name="share_code"
                  label="Share Code"
                  rules={[
                    { required: true, message: 'Please input share code' },
                    { len: 4, message: 'Share code must be 4 digits' },
                    { pattern: /^\d+$/, message: 'Share code must be digits' }
                  ]}
                >
                  <Input
                    maxLength={4}
                    style={{ width: 120 }}
                    placeholder="4 digits"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Share
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h4>Share Link:</h4>
            <Space>
              <Input 
                value={getShareLink()} 
                readOnly 
                style={{ width: 400 }}
              />
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(getShareLink())}
              >
                Copy
              </Button>
            </Space>
          </div>

          {shareInfo.share_type === 'with_password' && (
            <div style={{ marginBottom: 16 }}>
              <h4>Share Code:</h4>
              <Space>
                <Input 
                  value={shareInfo.share_code} 
                  readOnly 
                  style={{ width: 120 }}
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(shareInfo.share_code!)}
                >
                  Copy
                </Button>
              </Space>

              <div style={{ marginTop: 16 }}>
                <h4>Update Share Code:</h4>
                <Space>
                  <Form.Item
                    name="new_share_code"
                    rules={[
                      { required: true, message: 'Please input new share code' },
                      { len: 4, message: 'Share code must be 4 digits' },
                      { pattern: /^\d+$/, message: 'Share code must be digits' }
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      maxLength={4}
                      style={{ width: 120 }}
                      placeholder="New code"
                    />
                  </Form.Item>
                  <Button type="primary" onClick={handleUpdateCode}>
                    Update
                  </Button>
                </Space>
              </div>
            </div>
          )}

          <div>
            <p>Expires at: {new Date(shareInfo.share_expired_at).toLocaleString()}</p>
          </div>

          <div style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={handleClose}>
                Close
              </Button>
              <Button type="primary" onClick={() => {
                form.resetFields();
                setShareInfo(null);
              }}>
                Create New Share
              </Button>
              <Button 
                danger 
                type="primary" 
                onClick={handleCancelShare}
              >
                Cancel Share
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ShareDialog; 