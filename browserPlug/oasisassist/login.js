// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 从存储中获取API基础URL
let API_BASE_URL = 'http://localhost:9527';

// 构建API URL
function buildApiUrl(endpoint) {
  let baseUrl = API_BASE_URL.replace(/\/$/, '');
  endpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${endpoint}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 加载API配置
  const config = await getConfig();
  API_BASE_URL = config.apiUrl || 'http://localhost:9527';

  // 绑定登录表单提交事件
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // 检查是否已经有token
  const token = await getToken();
  if (token) {
    showAlert('您已登录，即将关闭窗口...', 'success');
    setTimeout(() => {
      window.close();
    }, 1500);
  }
});

// 获取配置
async function getConfig() {
  return new Promise((resolve) => {
    browserAPI.storage.sync.get(['apiUrl'], (result) => {
      resolve(result);
    });
  });
}

// 获取Token
async function getToken() {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || '');
    });
  });
}

// 保存Token
async function saveToken(token) {
  return new Promise((resolve) => {
    browserAPI.storage.local.set({ authToken: token }, () => {
      resolve();
    });
  });
}

// 处理登录
async function handleLogin(e) {
  e.preventDefault();

  const loginName = document.getElementById('loginName').value.trim();
  const loginPwd = document.getElementById('loginPwd').value.trim();

  if (!loginName || !loginPwd) {
    showAlert('请输入用户名和密码', 'error');
    return;
  }

  // 显示加载状态
  setLoading(true);
  hideAlert();

  try {
    const response = await fetch(buildApiUrl('login/in'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loginName,
        loginPwd
      })
    });

    const result = await response.json();

    if (result.code === 200 && result.data && result.data.token) {
      // 保存Token
      await saveToken(result.data.token);

      showAlert('登录成功！即将关闭窗口...', 'success');

      // 延迟关闭窗口，让用户看到成功提示
      setTimeout(() => {
        // 通知其他页面token已更新
        browserAPI.runtime.sendMessage({
          action: 'tokenUpdated',
          token: result.data.token
        });
        window.close();
      }, 1500);
    } else {
      showAlert(result.message || '登录失败，请检查用户名和密码', 'error');
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    showAlert('登录失败：' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

// 显示提示信息
function showAlert(message, type = 'error') {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert ${type} show`;
}

// 隐藏提示信息
function hideAlert() {
  const alert = document.getElementById('alert');
  alert.classList.remove('show');
}

// 设置加载状态
function setLoading(loading) {
  const loginBtn = document.getElementById('loginBtn');
  const loadingDiv = document.getElementById('loading');

  loginBtn.disabled = loading;

  if (loading) {
    loadingDiv.classList.add('show');
  } else {
    loadingDiv.classList.remove('show');
  }
}
