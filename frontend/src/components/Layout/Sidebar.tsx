import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { FileOutlined, ShareAltOutlined } from '@ant-design/icons';

const Sidebar: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  const menuItems = [
    // 只有登录后才显示 Documents 菜单
    ...(isAuthenticated ? [
      {
        key: 'documents',
        icon: <FileOutlined />,
        label: <Link to="/documents">Documents</Link>,
      },
    ] : []),
    // Shared Files 菜单始终显示
    {
      key: 'shared',
      icon: <ShareAltOutlined />,
      label: <Link to="/shared">Shared Files</Link>,
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['documents']}
      items={menuItems}
    />
  );
};

export default Sidebar;