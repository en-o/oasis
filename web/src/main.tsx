import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { worker } from './mocks/browser';

const envFlag = import.meta.env.VITE_USE_MSW === 'true';
const localFlag = localStorage.getItem('useMsw') === 'true';
const shouldStart = envFlag || localFlag;

// 开发环境启动 mock

 worker.start({ onUnhandledRequest: 'bypass' });
if (shouldStart) {
  // // 打开 Mock
  // localStorage.setItem('useMsw', 'true'); location.reload()
  // 关闭 Mock
  // localStorage.removeItem('useMsw'); location.reload()
 
}

console.log('VITE_USE_MSW:', import.meta.env.VITE_USE_MSW);

console.log('shouldStart:', shouldStart);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);