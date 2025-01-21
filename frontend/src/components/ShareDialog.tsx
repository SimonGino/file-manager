import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Switch, Input, Space, Button, message, Radio } from 'antd';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import { Document } from '@/types/document';
import type { InputRef } from 'antd';

interface ShareDialogProps {
  visible: boolean;
  onClose: () => void;
  document: Document | null;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ visible, onClose, document }) => {
  const [form] = Form.useForm();
  const [isSharing, setIsSharing] = useState(false);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const inputRef = useRef<InputRef>(null);

  // 获取分享状态
  useEffect(() => {
    const checkShareStatus = async () => {
      if (!document?.id || !visible) return;

      try {
        const response = await request.get(`/documents/${document.id}/share`);
        setShareInfo(response.data);
        setIsSharing(response.data.is_shared);

        if (response.data.is_shared) {
          // 设置表单初始值
          form.setFieldsValue({
            share_type: response.data.share_type,
            share_code: response.data.share_code,
            expire_days: response.data.expire_days || 'forever'
          });
        }
      } catch (error: any) {
        // 404 表示未分享，其他错误才提示
        if (error?.response?.status !== 404) {
          message.error('Failed to get share status');
        }
      }
    };

    checkShareStatus();
  }, [document?.id, visible]);

  // 处理分享开关
  const handleSharingChange = async (checked: boolean) => {
    if (!document?.id) return;

    if (checked) {
      // 创建分享
      try {
        const values = await form.validateFields();
        const shareData = {
          share_type: values.share_type || 'no_password',
          share_code: values.share_type === 'with_password' ? values.share_code : undefined,
          expire_days: values.expire_days === 'forever' ? null : parseInt(values.expire_days)
        };

        const response = await request.post(`/documents/${document.id}/share`, shareData);
        setShareInfo(response.data);
        setIsSharing(true);
        message.success('Document shared successfully');
      } catch (error) {
        setIsSharing(false);
        message.error('Failed to share document');
      }
    } else {
      // 取消分享
      try {
        await request.delete(`/documents/${document.id}/share`);
        setShareInfo(null);
        setIsSharing(false);
        form.resetFields();
        message.success('Share cancelled successfully');
      } catch (error) {
        setIsSharing(true);
        message.error('Failed to cancel share');
      }
    }
  };

  // 处理设置更新
  const handleSettingsChange = async () => {
    if (!document?.id || !isSharing) return;

    try {
      const values = await form.validateFields();
      const shareData = {
        share_type: values.share_type,
        share_code: values.share_type === 'with_password' ? values.share_code : undefined,
        expire_days: values.expire_days === 'forever' ? null : parseInt(values.expire_days)
      };

      const response = await request.put(`/documents/${document.id}/share`, shareData);
      setShareInfo(response.data);
    } catch (error) {
      message.error('Failed to update share settings');
    }
  };

  const copyToClipboard = async () => {
    try {
      if (!inputRef.current?.input?.value) return;
      const text = inputRef.current.input.value;
      await navigator.clipboard.writeText(text);
      message.success('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      
      // 降级方案：如果 clipboard API 失败，尝试使用传统方法
      try {
        if (inputRef.current) {
          inputRef.current.select();
          (document as any).execCommand('copy');
          message.success('Link copied to clipboard');
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        message.error('Failed to copy link');
      }
    }
  };

  return (
    <Modal
      title="Share Document"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>Share Document</span>
          <Switch
            checked={isSharing}
            onChange={handleSharingChange}
          />
        </Space>
      </div>

      {isSharing && (
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="expire_days"
            initialValue="forever"
          >
            <Radio.Group>
              <Radio value="forever">永久</Radio>
              <Radio value="7">7天</Radio>
              <Radio value="1">1天</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="share_type"
            initialValue="no_password"
          >
            <Radio.Group>
              <Radio value="no_password">无密码</Radio>
              <Radio value="with_password">密码访问</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.share_type !== currentValues.share_type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('share_type') === 'with_password' && (
                <Form.Item
                  name="share_code"
                  label="Access Code"
                  rules={[
                    { required: true, message: 'Please input access code' },
                    { len: 4, message: 'Access code must be 4 digits' },
                    { pattern: /^\d+$/, message: 'Access code must be digits' }
                  ]}
                >
                  <Input maxLength={4} style={{ width: 120 }} placeholder="4 digits" />
                </Form.Item>
              )
            }
          </Form.Item>

          {shareInfo?.share_uuid && (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>Share Link:</div>
                <Space>
                  <Input
                    ref={inputRef}
                    value={`${window.location.origin}/shared/${shareInfo.share_uuid}`}
                    readOnly
                  />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                  >
                    Copy
                  </Button>
                  <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        handleSettingsChange()
                        message.success('Share settings updated successfully');
                      }}
                    >
                      Update
                    </Button>
                </Space>
              </div>

              {/* {shareInfo.share_code && (
                <div>
                  <div style={{ marginBottom: 8 }}>Access Code:</div>
                  <Space>
                    <Input
                      value={shareInfo.share_code}
                      readOnly
                      style={{ width: 120 }}
                    />
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(shareInfo.share_code);
                        message.success('Code copied');
                      }}
                    >
                      Copy
                    </Button>

                   
                  </Space>
                </div>
              )} */}
            </div>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default ShareDialog;
