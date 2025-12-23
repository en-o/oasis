// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 从存储中获取API基础URL
let API_BASE_URL = 'http://localhost:3000';

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
  API_BASE_URL = config.apiUrl || 'http://localhost:3000';

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

  const username = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPwd').value.trim();

  if (!username || !password) {
    showAlert('请输入用户名和密码', 'error');
    return;
  }

  // 显示加载状态
  setLoading(true);
  hideAlert();

  try {
    const response = await fetch(buildApiUrl('login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP错误：${response.status} ${response.statusText}`);
    }

    // 检查响应内容类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('非JSON响应:', text);
      throw new Error(`服务器返回非JSON格式数据。可能的原因：\n1. API地址错误\n2. 服务器未正常运行\n3. 跨域问题\n\n响应内容: ${text.substring(0, 100)}`);
    }

    const result = await response.json();
    console.log('登录响应:', result);

    // 后端返回格式: ResultVO.success("登录成功", token)
    // 所以 token 直接在 result.data 中
    if (result.code === 200 && result.data) {
      const token = typeof result.data === 'string' ? result.data : result.data.token;
      console.log('提取的token:', token);

      if (!token) {
        throw new Error('登录成功但未返回token');
      }

      // 保存Token
      await saveToken(token);
      console.log('Token已保存到storage');

      // 验证token是否保存成功
      const savedToken = await getToken();
      console.log('验证已保存的token:', savedToken);

      showAlert('登录成功！即将关闭窗口...', 'success');

      // 延迟关闭窗口，让用户看到成功提示
      setTimeout(() => {
        // 通知其他页面token已更新
        try {
          browserAPI.runtime.sendMessage({
            action: 'tokenUpdated',
            token: token
          }, (response) => {
            console.log('消息发送结果:', response);
          });
        } catch (e) {
          console.log('发送消息失败（这是正常的）:', e.message);
        }

        window.close();
      }, 1500);
    } else {
      console.error('登录失败，响应数据:', result);
      showAlert(result.message || result.msg || '登录失败，请检查用户名和密码', 'error');
    }
  } catch (error) {
    console.error('登录请求失败:', error);

    // 更详细的错误信息
    let errorMessage = '登录失败：';
    if (error.message.includes('Failed to fetch')) {
      errorMessage += '无法连接到服务器，请检查：\n1. API地址是否正确\n2. 服务器是否运行\n3. 网络连接是否正常';
    } else if (error.message.includes('JSON')) {
      errorMessage += error.message;
    } else {
      errorMessage += error.message;
    }

    showAlert(errorMessage, 'error');
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
