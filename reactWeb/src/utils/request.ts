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

    // 后端返回格式: {code: number, message: string, data: any, success: boolean}
    // 优先使用 success 字段判断，如果没有则用 code === 200 判断
    const isSuccess = data.success !== undefined ? data.success : data.code === 200;

    if (isSuccess) {
      return data;
    } else {
      // 业务错误，显示后端返回的错误信息
      const errorMessage = data.message || '请求失败';
      message.error(errorMessage);
      // 返回原始数据而不是抛出错误，让调用方可以处理
      return Promise.reject(data);
    }
  },
    (error) => {
      let errorMessage = '网络错误，请稍后重试';

      if (error.response) {
        const { status, data } = error.response;

        // 如果响应数据包含标准的后端错误格式，优先使用
        if (data && typeof data === 'object' && 'message' in data) {
          errorMessage = data.message || '请求失败';
        } else {
          // 否则根据 HTTP 状态码处理
          switch (status) {
            case 401:
              errorMessage = '登录已过期，请重新登录';
              localStorage.removeItem('token');
              // 避免在登录页面重复跳转
              if (window.location.pathname !== '/admin') {
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
              errorMessage =  '服务器内部错误';
              break;
            default:
              errorMessage = `请求失败 (${status})`;
          }
        }
      } else if (error.request) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
      return Promise.reject(error.response?.data || error);
    }
);

export default api;
