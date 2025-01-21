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
    const {  config } = error;
    const originMsg = error?.response?.data?.detail?.message;
    const { message: msg, detail = {}, status } = error || {};
    // 如果是登录接口，不重定向
    const isLoginRequest = config.url.includes('/token');
    
    // 处理 401 未授权错误
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      clearUserAuth();
      window.location.href = '/shared';
      return new Promise(() => {});
    }


    if (originMsg || msg || detail?.message) {
      message.error(originMsg || msg || detail?.message);
      return new Promise(() => { });
    }

    return Promise.reject(error);
  }
);

export default request;
