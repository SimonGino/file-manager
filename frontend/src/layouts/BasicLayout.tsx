import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Content } = Layout;

const BasicLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Content style={{ 
        padding: '24px', 
        backgroundColor: '#fff',
        flex: '1 0 auto'
      }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
};

export default BasicLayout; 