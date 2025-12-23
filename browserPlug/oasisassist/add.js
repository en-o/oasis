// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 从存储中获取API基础URL
let API_BASE_URL = 'http://localhost:9527';

// 初始化页面
document.addEventListener('DOMContentLoaded', async () => {
  // 加载配置
  const config = await getConfig();
  API_BASE_URL = config.apiUrl || 'http://localhost:9527';

  // 加载分类和平台列表
  await loadCategories();
  await loadPlatforms();

  // 从存储中获取待添加的页面信息
  browserAPI.storage.local.get(['pendingNavigation'], (result) => {
    if (result.pendingNavigation) {
      const pageInfo = result.pendingNavigation;
      document.getElementById('name').value = pageInfo.name || pageInfo.pageTitle || '';
      document.getElementById('url').value = pageInfo.url || pageInfo.pageUrl || '';

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

// 加载分类列表
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/oasis/navCategory/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
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
    showAlert('加载分类失败: ' + error.message, 'error');
  }
}

// 加载平台列表
async function loadPlatforms() {
  try {
    const response = await fetch(`${API_BASE_URL}/oasis/sitePublish/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/oasis/navigation/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submitData)
    });

    const result = await response.json();

    if (result.code === 200) {
      showAlert('添加成功！', 'success');
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      showAlert('添加失败: ' + (result.msg || '未知错误'), 'error');
    }
  } catch (error) {
    console.error('提交失败:', error);
    showAlert('提交失败: ' + error.message, 'error');
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
