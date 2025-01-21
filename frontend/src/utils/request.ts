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
    const { config, response } = error;
    const status = response?.status;
    const originMsg = response?.data?.detail?.message;
    
    // 清除认证信息
    if (status === 401) {
      clearUserAuth();
      
      // 检查是否是登录接口
      if (config.url.includes('/token')) {
        // 登录失败，显示错误信息
        message.error(originMsg || '登录失败');
        return new Promise(() => {}); // 阻止后续错误处理
      } else {
        // 其他接口的 401 错误，重定向到 shared 页面
        window.location.href = '/shared';
        return new Promise(() => {}); // 阻止后续错误处理
      }
    }

    // 显示错误信息（对于非 401 错误或登录失败）
    if (originMsg || response?.data?.detail) {
      message.error(originMsg || response?.data?.detail || '请求失败');
    } else {
      message.error('网络错误，请稍后重试');
    }

    return Promise.reject(error);
  }
);

export default request;
