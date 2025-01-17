import React, { useMemo } from 'react';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clearUserAuth, getStoredUser } from '@/utils/auth';
import type { MenuProps } from 'antd';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);

  const handleLogout = () => {
    clearUserAuth();
    navigate('/login');
  };

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
        <span style={{ color: '#fff' }}>{user?.username}</span>
      </div>
    </Dropdown>
  );
};

export default UserMenu;
