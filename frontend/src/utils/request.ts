import axios from 'axios';
import { getStoredToken, clearUserAuth } from './auth';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originMsg = error?.response?.data?.detail?.message;
    const { response, message: msg, detail = {} } = error || {};

    if (originMsg || msg || detail?.message) {
      message.error(originMsg || msg || detail?.message);
      return new Promise(() => { });
    }

    // 显示错误消息
    if (response?.data?.message) {
      message.error(response.data.message);
    } else {
      message.error('An error occurred');
    }

    // 只有在访问需要认证的接口时才跳转到登录页
    if (response?.status === 401 && !window.location.pathname.startsWith('/shared')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default request;
