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

document.addEventListener('DOMContentLoaded', () => {
  // 加载已保存的配置
  loadConfig();

  // 绑定事件
  document.getElementById('optionsForm').addEventListener('submit', saveConfig);
  document.getElementById('testBtn').addEventListener('click', testConnection);
});

// 加载配置
function loadConfig() {
  browserAPI.storage.sync.get(['apiUrl'], (result) => {
    if (result.apiUrl) {
      document.getElementById('apiUrl').value = result.apiUrl;
    } else {
      document.getElementById('apiUrl').value = 'http://localhost:9527';
    }
  });
}

// 保存配置
function saveConfig(e) {
  e.preventDefault();

  let apiUrl = document.getElementById('apiUrl').value.trim();

  // 去除末尾的斜杠
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }

  // 验证URL格式
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    showAlert('请输入有效的 HTTP 或 HTTPS 地址', 'error');
    return;
  }

  browserAPI.storage.sync.set({ apiUrl }, () => {
    showAlert('设置已保存！');
  });
}

// 测试连接
async function testConnection() {
  let apiUrl = document.getElementById('apiUrl').value.trim();

  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }

  if (!apiUrl) {
    showAlert('请先输入API地址', 'error');
    return;
  }

  try {
    const response = await fetch(buildApiUrl(apiUrl, 'oasis/navCategory/list'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.code === 200) {
      showAlert('连接成功！服务器响应正常');
    } else {
      showAlert(`连接失败：${result.msg || '服务器返回异常'}`, 'error');
    }
  } catch (error) {
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
