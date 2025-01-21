import React from 'react';
import { Layout, Space } from 'antd';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  return (
    <AntHeader
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
      }}
    >
      <Space size={24}>
        <Link
          to="/"
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1890ff',
            textDecoration: 'none',
          }}
        >
          File Manager
        </Link>
      </Space>
      <UserMenu />
    </AntHeader>
  );
};

export default Header; 