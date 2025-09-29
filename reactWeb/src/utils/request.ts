import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    message.error('请求发送失败');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 后端返回格式: {code: 200, message: string, data: {...}}
    // 成功的判断条件：code为200
    if (data.code === 200) {
      return data;
    } else {
      // 业务错误，显示后端返回的错误信息
      const errorMessage = data.message || '请求失败';
      message.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
  (error) => {
    let errorMessage = '网络错误，请稍后重试';

    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          errorMessage = '登录已过期，请重新登录';
          localStorage.removeItem('token');
          // 避免在登录页面重复跳转
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
          break;
        case 403:
          errorMessage = '权限不足';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络';
    }

    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;