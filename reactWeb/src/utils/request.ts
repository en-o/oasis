import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 获取 API 基础路径
// 开发环境：通过 Vite 代理转发到后端
// 生产环境-合并部署：直接调用同域名下的接口（无需前缀）
// 生产环境-单独部署：使用 /api 前缀
const getBaseURL = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  // 只有当 apiBaseUrl 为 undefined 时才使用默认值 '/api'
  // 如果 apiBaseUrl 是空字符串（合并部署模式），则返回空字符串
  return apiBaseUrl !== undefined ? apiBaseUrl : '/api';
};

// 创建自定义的 axios 实例接口，重写返回类型
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
}) as CustomAxiosInstance;

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
              // 如果在管理页面，不跳转，让 Admin 组件自己处理登录状态
              // 如果在其他页面，跳转到首页
              if (!window.location.pathname.startsWith('/admin')) {
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
