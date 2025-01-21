import React from 'react';
import { Layout, Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#f0f2f5',
        padding: '20px 50px',
        color: 'rgba(0, 0, 0, 0.65)',
        flexShrink: 0,
        marginTop: 'auto'
      }}
    >
      <Space direction="vertical" size={16}>
        <Space align="center" size={8}>
          <a
            href="https://github.com/SimonGino/file-manager"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: '24px',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.65)';
            }}
          >
            <GithubOutlined />
          </a>
        </Space>
        <div>
          <span>File Manager ©2024 Created by </span>
          <a
            href="https://github.com/SimonGino"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1890ff',
              textDecoration: 'none',
            }}
          >
            Simon Gino
          </a>
        </div>
      </Space>
    </AntFooter>
  );
};

export default Footer; 