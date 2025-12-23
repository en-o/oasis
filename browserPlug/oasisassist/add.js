// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 从存储中获取API基础URL
let API_BASE_URL = 'http://localhost:3000';

// 登录窗口打开标志，防止重复打开
let loginWindowOpening = false;

// 初始化页面
document.addEventListener('DOMContentLoaded', async () => {
  // 加载配置
  const config = await getConfig();
  API_BASE_URL = config.apiUrl || 'http://localhost:3000';

  // 加载分类和平台列表
  await loadCategories();
  await loadPlatforms();

  // 从存储中获取待添加的页面信息
  browserAPI.storage.local.get(['pendingNavigation'], (result) => {
    if (result.pendingNavigation) {
      const pageInfo = result.pendingNavigation;
      const pageName = pageInfo.name || pageInfo.pageTitle || '';
      const url = pageInfo.url || pageInfo.pageUrl || '';

      document.getElementById('name').value = pageName;
      document.getElementById('url').value = url;

      // 将网页名称填充到备注
      if (pageName) {
        document.getElementById('remark').value = pageName;
      }

      // 自动获取并填充网站图标
      if (url) {
        autoFillFavicon(url);
      }

      // 清除存储
      browserAPI.storage.local.remove(['pendingNavigation']);
    }
  });

  // 绑定事件
  bindEvents();
});

// 获取配置
async function getConfig() {
  return new Promise((resolve) => {
    browserAPI.storage.sync.get(['apiUrl'], (result) => {
      resolve(result);
    });
  });
}

// 自动填充网站图标
function autoFillFavicon(url) {
  try {
    const urlObj = new URL(url);

    // 检查是否是本地地址或特殊地址，如果是则不自动填充图标
    const isLocalhost = urlObj.hostname === 'localhost' ||
                        urlObj.hostname === '127.0.0.1' ||
                        urlObj.hostname.startsWith('192.168.') ||
                        urlObj.hostname.startsWith('10.') ||
                        urlObj.hostname.endsWith('.local');

    if (isLocalhost) {
      console.log('检测到本地地址，跳过自动获取图标:', url);
      // 保持默认的"无图标"选项
      document.querySelector('input[name="iconType"][value="none"]').checked = true;
      return;
    }

    const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    console.log('尝试获取网站图标:', faviconUrl);

    // 预加载图标以验证是否存在
    const img = new Image();

    // 设置超时，避免长时间等待
    const timeout = setTimeout(() => {
      console.log('图标加载超时，设置为无图标');
      img.src = ''; // 取消加载
      // 保持默认的"无图标"选项
      document.querySelector('input[name="iconType"][value="none"]').checked = true;
    }, 5000); // 5秒超时

    img.onload = () => {
      clearTimeout(timeout);
      console.log('图标加载成功:', faviconUrl);

      // 检查图标尺寸，有些网站返回的是 1x1 的占位图
      if (img.width <= 1 || img.height <= 1) {
        console.log('图标尺寸无效，尝试备用方案');
        tryGoogleFavicon(urlObj);
      } else {
        // 选择 URL 类型的图标
        document.querySelector('input[name="iconType"][value="url"]').checked = true;
        document.getElementById('iconUrlInput').style.display = 'block';
        document.getElementById('iconUploadInput').style.display = 'none';

        // 填充图标 URL
        document.getElementById('iconUrl').value = faviconUrl;
        updateIconPreview(faviconUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.log('默认图标不存在，尝试 Google favicon 服务');
      tryGoogleFavicon(urlObj);
    };

    img.src = faviconUrl;
  } catch (error) {
    console.error('获取网站图标失败:', error);
    // 保持默认的"无图标"选项
    document.querySelector('input[name="iconType"][value="none"]').checked = true;
  }
}

// 尝试使用 Google Favicon 服务
function tryGoogleFavicon(urlObj) {
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  console.log('尝试 Google favicon 服务:', googleFaviconUrl);

  const img = new Image();

  const timeout = setTimeout(() => {
    console.log('Google favicon 服务超时，设置为无图标');
    img.src = '';
    document.querySelector('input[name="iconType"][value="none"]').checked = true;
  }, 5000);

  img.onload = () => {
    clearTimeout(timeout);

    // 检查是否是有效图标（Google 返回的默认图标尺寸通常是 16x16 或更大）
    if (img.width > 1 && img.height > 1) {
      console.log('Google favicon 加载成功');

      // 选择 URL 类型的图标
      document.querySelector('input[name="iconType"][value="url"]').checked = true;
      document.getElementById('iconUrlInput').style.display = 'block';
      document.getElementById('iconUploadInput').style.display = 'none';

      // 填充图标 URL
      document.getElementById('iconUrl').value = googleFaviconUrl;
      updateIconPreview(googleFaviconUrl);
    } else {
      console.log('Google favicon 尺寸无效，设置为无图标');
      document.querySelector('input[name="iconType"][value="none"]').checked = true;
    }
  };

  img.onerror = () => {
    clearTimeout(timeout);
    console.log('Google favicon 加载失败，设置为无图标');
    // 保持默认的"无图标"选项
    document.querySelector('input[name="iconType"][value="none"]').checked = true;
  };

  img.src = googleFaviconUrl;
}

// 获取Token
async function getToken() {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(['authToken'], (result) => {
      console.log('从storage获取token:', result.authToken);
      resolve(result.authToken || '');
    });
  });
}

// 打开登录窗口
function openLoginWindow() {
  // 防止重复打开
  if (loginWindowOpening) {
    console.log('登录窗口已在打开中，跳过重复请求');
    return;
  }

  loginWindowOpening = true;
  console.log('准备打开登录窗口');

  browserAPI.windows.create({
    url: browserAPI.runtime.getURL('login.html'),
    type: 'popup',
    width: 480,
    height: 600,
    focused: true
  }, (window) => {
    console.log('登录窗口已创建:', window);
  });

  // 5秒后重置标志，允许再次打开（防止窗口被用户关闭后无法重新打开）
  setTimeout(() => {
    loginWindowOpening = false;
    console.log('登录窗口标志已重置');
  }, 5000);
}

// 发送带Token的请求
async function fetchWithAuth(url, options = {}) {
  const token = await getToken();
  console.log('fetchWithAuth - 使用token:', token);

  // 添加Token到请求头
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['token'] = token;
  }

  console.log('fetchWithAuth - 请求URL:', url);
  console.log('fetchWithAuth - 请求头:', headers);

  const response = await fetch(url, {
    ...options,
    headers
  });

  const result = await response.json();
  console.log('fetchWithAuth - 响应:', result);

  // 检查是否需要登录（403错误）
  if (result.code === 403) {
    console.error('收到403错误，需要重新登录');
    showAlert('登录已过期，请重新登录', 'error');
    // 延迟打开登录窗口
    setTimeout(() => {
      openLoginWindow();
    }, 1500);
    throw new Error('需要登录');
  }

  return { response, result };
}

// 构建API URL - 确保正确处理基础路径
function buildApiUrl(endpoint) {
  // 移除API_BASE_URL末尾的斜杠（如果有）
  let baseUrl = API_BASE_URL.replace(/\/$/, '');

  // 移除endpoint开头的斜杠（如果有）
  endpoint = endpoint.replace(/^\//, '');

  return `${baseUrl}/${endpoint}`;
}

// 加载分类列表
async function loadCategories() {
  try {
    const { result } = await fetchWithAuth(buildApiUrl('navCategory/lists'), {
      method: 'GET'
    });

    const categorySelect = document.getElementById('category');

    if (result.code === 200 && result.data && result.data.length > 0) {
      categorySelect.innerHTML = '<option value="">请选择分类</option>';
      result.data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.categoryName;
        option.textContent = cat.categoryName;
        categorySelect.appendChild(option);
      });
    } else {
      categorySelect.innerHTML = '<option value="">暂无分类</option>';
      showAlert('警告：无法加载分类列表，请先在管理后台创建分类', 'error');
    }
  } catch (error) {
    console.error('加载分类失败:', error);
    if (error.message !== '需要登录') {
      showAlert('加载分类失败: ' + error.message, 'error');
    }
  }
}

// 加载平台列表
async function loadPlatforms() {
  try {
    const { result } = await fetchWithAuth(buildApiUrl('sitePublish/lists'), {
      method: 'GET'
    });

    const platformSelect = document.getElementById('showPlatform');

    if (result.code === 200 && result.data && result.data.length > 0) {
      platformSelect.innerHTML = '<option value="">所有页面</option>';
      result.data.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.routePath;
        option.textContent = platform.name;
        platformSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('加载平台失败:', error);
  }
}

// 绑定事件
function bindEvents() {
  // 图标类型切换
  const iconTypeRadios = document.querySelectorAll('input[name="iconType"]');
  iconTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const type = e.target.value;
      document.getElementById('iconUrlInput').style.display = type === 'url' ? 'block' : 'none';
      document.getElementById('iconUploadInput').style.display = type === 'upload' ? 'block' : 'none';

      // 清空预览
      const preview = document.getElementById('iconPreview');
      preview.innerHTML = '<span style="color: #999; font-size: 12px;">预览</span>';
    });
  });

  // 图标URL输入
  document.getElementById('iconUrl').addEventListener('input', (e) => {
    const url = e.target.value;
    if (url) {
      updateIconPreview(url);
    }
  });

  // 图片文件上传
  document.getElementById('iconFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showAlert('只支持 JPG/PNG/GIF/WEBP 格式的图片！', 'error');
        return;
      }

      // 验证文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        showAlert('图片大小不能超过 2MB！', 'error');
        return;
      }

      // 转换为base64
      const base64 = await fileToBase64(file);
      updateIconPreview(base64);
    }
  });

  // 取消按钮
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });

  // 表单提交
  document.getElementById('addNavForm').addEventListener('submit', handleSubmit);
}

// 更新图标预览
function updateIconPreview(url) {
  const preview = document.getElementById('iconPreview');
  preview.innerHTML = `<img src="${url}" alt="预览">`;
}

// 文件转base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// 处理表单提交
async function handleSubmit(e) {
  e.preventDefault();

  // 获取表单数据
  const name = document.getElementById('name').value.trim();
  const url = document.getElementById('url').value.trim();
  const category = document.getElementById('category').value;
  const sort = parseInt(document.getElementById('sort').value) || 1;
  const remark = document.getElementById('remark').value.trim();
  const account = document.getElementById('account').value.trim();
  const password = document.getElementById('password').value.trim();
  const lookAccount = document.getElementById('lookAccount').checked;
  const nvaAccessSecret = document.getElementById('nvaAccessSecret').value.trim() || 'tan';
  const showPlatform = document.getElementById('showPlatform').value;
  const status = document.getElementById('status').checked ? 1 : 0;

  // 验证必填字段
  if (!name || !url || !category) {
    showAlert('请填写所有必填字段', 'error');
    return;
  }

  // 验证URL格式
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showAlert('URL 必须是 HTTP 或 HTTPS 地址', 'error');
    return;
  }

  // 获取图标
  let icon = '';
  const iconType = document.querySelector('input[name="iconType"]:checked').value;
  if (iconType === 'url') {
    const iconUrl = document.getElementById('iconUrl').value.trim();
    if (iconUrl && !iconUrl.startsWith('http://') && !iconUrl.startsWith('https://')) {
      showAlert('图标 URL 必须是 HTTP 或 HTTPS 地址', 'error');
      return;
    }
    icon = iconUrl;
  } else if (iconType === 'upload') {
    const file = document.getElementById('iconFile').files[0];
    if (file) {
      icon = await fileToBase64(file);
    }
  }

  // 构建提交数据
  const submitData = {
    name,
    url,
    category,
    sort,
    icon,
    remark,
    account,
    password,
    lookAccount,
    nvaAccessSecret,
    status,
    showPlatform: showPlatform || undefined
  };

  // 显示加载状态
  document.getElementById('loading').classList.add('show');
  document.getElementById('submitBtn').disabled = true;

  try {
    const { result } = await fetchWithAuth(buildApiUrl('navigation/append'), {
      method: 'POST',
      body: JSON.stringify(submitData)
    });

    if (result.code === 200) {
      showAlert('添加成功！', 'success');
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      showAlert('添加失败: ' + (result.msg || result.message || '未知错误'), 'error');
    }
  } catch (error) {
    console.error('提交失败:', error);
    if (error.message !== '需要登录') {
      showAlert('提交失败: ' + error.message, 'error');
    }
  } finally {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('submitBtn').disabled = false;
  }
}

// 显示提示信息
function showAlert(message, type = 'success') {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert ${type} show`;

  if (type === 'success') {
    setTimeout(() => {
      alert.classList.remove('show');
    }, 3000);
  }
}
