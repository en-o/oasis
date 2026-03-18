// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 构建API URL - 确保正确处理基础路径
function buildApiUrl(baseUrl, endpoint) {
  // 移除baseUrl末尾的斜杠（如果有）
  baseUrl = baseUrl.replace(/\/$/, '');
  // 移除endpoint开头的斜杠（如果有）
  endpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${endpoint}`;
}

// 获取 API Key
async function getApiKey() {
  return new Promise((resolve) => {
    browserAPI.storage.sync.get(['apiKey'], (result) => {
      resolve(result.apiKey || '');
    });
  });
}

// 发送带 API Key 的请求
async function fetchWithApiKey(url, options = {}) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('请先配置 API Key');
  }

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const result = await response.json();

  // 检查认证错误
  if (result.code === 401 || result.code === 403) {
    throw new Error(result.message || 'API Key 无效或无权限');
  }

  return { response, result };
}

document.addEventListener('DOMContentLoaded', () => {
  // 加载已保存的配置
  loadConfig();

  // 绑定事件
  document.getElementById('optionsForm').addEventListener('submit', saveConfig);
  document.getElementById('testBtn').addEventListener('click', testConnection);
});

// 加载配置
function loadConfig() {
  browserAPI.storage.sync.get(['apiUrl', 'apiKey', 'webUrl'], (result) => {
    if (result.apiUrl) {
      document.getElementById('apiUrl').value = result.apiUrl;
    } else {
      document.getElementById('apiUrl').value = 'http://localhost:1249';
    }

    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }

    if (result.webUrl) {
      document.getElementById('webUrl').value = result.webUrl;
    }
  });
}

// 保存配置
function saveConfig(e) {
  e.preventDefault();

  let apiUrl = document.getElementById('apiUrl').value.trim();
  let apiKey = document.getElementById('apiKey').value.trim();
  let webUrl = document.getElementById('webUrl').value.trim();

  // 去除末尾的斜杠
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }
  if (webUrl && webUrl.endsWith('/')) {
    webUrl = webUrl.slice(0, -1);
  }

  // 验证URL格式
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    showAlert('请输入有效的 HTTP 或 HTTPS 地址', 'error');
    return;
  }

  // 验证 API Key
  if (!apiKey) {
    showAlert('请输入 API Key', 'error');
    return;
  }

  if (webUrl && !webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
    showAlert('Web 地址必须是有效的 HTTP 或 HTTPS 地址', 'error');
    return;
  }

  // 保存配置
  const config = { apiUrl, apiKey };
  if (webUrl) {
    config.webUrl = webUrl;
  }

  browserAPI.storage.sync.set(config, () => {
    showAlert('设置已保存！');
  });
}

// 测试连接
async function testConnection() {
  let apiUrl = document.getElementById('apiUrl').value.trim();
  let apiKey = document.getElementById('apiKey').value.trim();

  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }

  if (!apiUrl) {
    showAlert('请先输入 API 地址', 'error');
    return;
  }

  if (!apiKey) {
    showAlert('请先输入 API Key', 'error');
    return;
  }

  try {
    // 使用 OpenAPI 的分类列表接口测试
    const response = await fetch(buildApiUrl(apiUrl, 'openapi/category/list'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });

    const result = await response.json();

    if (result.code === 200) {
      showAlert('连接成功！API Key 验证通过');
    } else if (result.code === 401 || result.code === 403) {
      showAlert(`连接失败：${result.message || 'API Key 无效或无权限'}`, 'error');
    } else {
      showAlert(`连接失败：${result.message || '服务器返回异常'}`, 'error');
    }
  } catch (error) {
    console.error('连接测试失败:', error);
    showAlert(`连接失败：${error.message}`, 'error');
  }
}

// 显示提示信息
function showAlert(message, type = 'success') {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert ${type} show`;

  setTimeout(() => {
    alert.classList.remove('show');
  }, 3000);
}
