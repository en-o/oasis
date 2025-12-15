    // 默认数据
    const defaultData = {
      engines: [
        { name: 'Google', url: 'https://www.google.com/search?q={query}' },
        { name: 'Bing', url: 'https://www.bing.com/search?q={query}' },
        { name: 'Baidu', url: 'https://www.baidu.com/s?wd={query}' }
      ],
      categories: ['常用', '工作', '娱乐'],
      sites: {
        '常用': [
          { name: 'Google', icon: '🔍', url: 'https://www.google.com', desc: '搜索引擎', accountInfo: {} },
          { name: 'GitHub', icon: '💻', url: 'https://github.com', desc: '代码托管', accountInfo: {} }
        ],
        '工作': [],
        '娱乐': []
      }
    };

    let data = JSON.parse(JSON.stringify(defaultData));
    let currentEngine = 'Google';
    let currentCategory = '常用';
    let editingCategory = null;
    let editingIndex = null;
    let openInNewTab = true; // 默认新标签页打开

    // 初始化
    async function init() {
      await loadData();
      loadOpenMode(); // 加载打开模式设置
      renderEngines();
      renderCategories();
      renderSites();
    }

    // 加载数据（从同步存储）
    async function loadData() {
      try {
        // 尝试从 Chrome Sync Storage 加载
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          const result = await new Promise((resolve) => {
            chrome.storage.sync.get(['navData'], resolve);
          });

          if (result.navData) {
            data = result.navData;
            console.log('✅ 数据已从云端同步加载');
            return;
          }
        }

        // 降级到 localStorage（用于兼容性或迁移）
        const stored = localStorage.getItem('navData');
        if (stored) {
          data = JSON.parse(stored);
          // 迁移数据到 sync storage
          await saveData();
          console.log('✅ 数据已从本地迁移到云端同步');
          return;
        }

        // 使用默认数据 - 重要：确保 data 包含默认数据
        data = JSON.parse(JSON.stringify(defaultData));
        await saveData();
        console.log('✅ 使用默认数据');
      } catch (error) {
        console.error('❌ 加载数据失败:', error);
        // 降级到 localStorage
        const stored = localStorage.getItem('navData');
        if (stored) {
          data = JSON.parse(stored);
        } else {
          // 最终降级：使用默认数据
          data = JSON.parse(JSON.stringify(defaultData));
        }
      }
    }

    // 保存数据（到同步存储）
    async function saveData() {
      try {
        // 保存到 Chrome Sync Storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          await new Promise((resolve, reject) => {
            chrome.storage.sync.set({ navData: data }, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            });
          });
          console.log('✅ 数据已同步到云端');
        }

        // 同时保存到 localStorage 作为备份
        localStorage.setItem('navData', JSON.stringify(data));
      } catch (error) {
        console.error('❌ 保存数据失败:', error);
        // 降级到 localStorage
        localStorage.setItem('navData', JSON.stringify(data));
      }
    }

    // 监听来自其他设备的同步更新
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.navData) {
          console.log('🔄 检测到数据同步更新');
          data = changes.navData.newValue;
          renderEngines();
          renderCategories();
          renderSites();
        }
      });
    }

    // 渲染搜索引擎
    function renderEngines() {
      const select = document.getElementById('engineSelect');
      select.innerHTML = data.engines.map(e =>
        `<option value="${e.name}" ${e.name === currentEngine ? 'selected' : ''}>${e.name}</option>`
      ).join('');

      // 监听下拉选择变化
      select.onchange = function() {
        currentEngine = this.value;
      };
    }

    function performSearch() {
      const query = document.getElementById('searchInput').value.trim();
      if (!query) return;

      const engine = data.engines.find(e => e.name === currentEngine);
      if (engine) {
        const url = engine.url.replace('{query}', encodeURIComponent(query));
        openSite(url);
      }
    }

    // 渲染分类
    function renderCategories() {
      const container = document.getElementById('categoryTabs');
      container.innerHTML = data.categories.map(c =>
        `<button class="category-tab ${c === currentCategory ? 'active' : ''}"
                data-category="${c}">${c}</button>`
      ).join('');

      // 绑定分类点击事件
      container.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          selectCategory(e.target.dataset.category);
        });
      });
    }

    function selectCategory(name) {
      currentCategory = name;
      renderCategories();
      renderSites();
    }

    // 渲染网站
    function renderSites() {
      const container = document.getElementById('sitesGrid');
      const sites = data.sites[currentCategory] || [];

      container.innerHTML = sites.map((site, i) => {
        const accountInfoHtml = site.accountInfo && Object.keys(site.accountInfo).length > 0
          ? `<div class="site-info">${Object.entries(site.accountInfo).map(([k, v]) => `${k}: ${v}`).join('<br>')}</div>`
          : '';

        // 根据图标类型渲染不同的内容
        let iconHtml = '';
        if (site.iconType === 'url' && site.iconUrl) {
          iconHtml = `<img src="${site.iconUrl}" alt="${site.name}" onerror="this.style.display='none'; this.parentElement.textContent='🌐';">`;
        } else {
          iconHtml = site.icon || '🌐';
        }

        return `
          <div class="site-card" data-url="${site.url}">
            <div class="site-avatar">${iconHtml}</div>
            <div class="site-name">${site.name}</div>
            ${site.desc ? `<div class="site-url">${site.desc}</div>` : ''}
            ${accountInfoHtml}
          </div>
        `;
      }).join('');

      // 绑定网站卡片点击事件
      container.querySelectorAll('.site-card').forEach(card => {
        card.addEventListener('click', () => {
          openSite(card.dataset.url);
        });
      });
    }

    function openSite(url) {
      if (openInNewTab) {
        // 新标签页打开
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: url });
        } else {
          window.open(url, '_blank');
        }
      } else {
        // 当前标签页打开
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
          chrome.tabs.update({ url: url });
        } else {
          window.location.href = url;
        }
      }
    }

    // 模态框管理
    function openManageModal() {
      document.getElementById('manageModal').classList.add('active');
      // 重置分类选择框，确保使用当前主界面的分类
      const siteCategory = document.getElementById('siteCategory');
      if (siteCategory) {
        siteCategory.value = '';
      }
      renderManageLists();
    }

    function closeManageModal() {
      document.getElementById('manageModal').classList.remove('active');
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));

      // 找到对应的标签按钮并激活
      const targetButton = document.querySelector(`.tab-button[data-tab="${tab}"]`);
      if (targetButton) {
        targetButton.classList.add('active');
      }

      document.getElementById('categoryManage').style.display = tab === 'category' ? 'block' : 'none';
      document.getElementById('siteManage').style.display = tab === 'site' ? 'block' : 'none';
      document.getElementById('engineManage').style.display = tab === 'engine' ? 'block' : 'none';
      document.getElementById('syncManage').style.display = tab === 'sync' ? 'block' : 'none';

      // 切换到网站管理时，初始化账号字段
      if (tab === 'site') {
        initAccountFields();
      }

      // 切换到数据同步时，更新存储信息
      if (tab === 'sync') {
        updateStorageInfo();
      }
    }

    // 初始化账号字段
    function initAccountFields() {
      const container = document.getElementById('accountFields');
      container.innerHTML = '';
    }

    // 添加账号字段
    function addAccountField(key = '', value = '') {
      const container = document.getElementById('accountFields');
      const index = container.children.length;

      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'account-field-item';
      fieldDiv.dataset.index = index;
      fieldDiv.innerHTML = `
        <input type="text" placeholder="字段名(如: 账号、密码)" value="${key}" class="field-key">
        <input type="text" placeholder="字段值" value="${value}" class="field-value">
        <button class="remove-field-btn" data-remove-index="${index}">×</button>
      `;

      container.appendChild(fieldDiv);

      // 绑定删除按钮事件
      fieldDiv.querySelector('.remove-field-btn').addEventListener('click', (e) => {
        removeAccountField(e.target.dataset.removeIndex);
      });
    }

    // 移除账号字段
    function removeAccountField(index) {
      const item = document.querySelector(`.account-field-item[data-index="${index}"]`);
      if (item) item.remove();
    }

    // 获取账号信息
    function getAccountInfo() {
      const fields = document.querySelectorAll('.account-field-item');
      const accountInfo = {};

      fields.forEach(field => {
        const key = field.querySelector('.field-key').value.trim();
        const value = field.querySelector('.field-value').value.trim();
        if (key && value) {
          accountInfo[key] = value;
        }
      });

      return accountInfo;
    }

    function renderManageLists() {
      // 渲染分类列表
      const categoryList = document.getElementById('categoryList');
      categoryList.innerHTML = data.categories.map((c, i) => `
        <div class="list-item">
          <span>${c}</span>
          <button class="delete-btn" data-action="delete-category" data-index="${i}">删除</button>
        </div>
      `).join('');

      // 渲染网站选择分类，如果已有选中的分类则保持，否则使用当前分类
      const siteCategory = document.getElementById('siteCategory');
      const previousSelected = siteCategory.value || currentCategory;
      siteCategory.innerHTML = data.categories.map(c =>
        `<option value="${c}" ${c === previousSelected ? 'selected' : ''}>${c}</option>`
      ).join('');

      // 渲染网站列表
      renderSiteListByCategory();

      // 监听分类选择变化（使用直接赋值避免重复绑定）
      siteCategory.onchange = renderSiteListByCategory;

      // 渲染搜索引擎列表
      const engineList = document.getElementById('engineList');
      engineList.innerHTML = data.engines.map((e, i) => `
        <div class="list-item">
          <span>${e.name}</span>
          <button class="delete-btn" data-action="delete-engine" data-index="${i}">删除</button>
        </div>
      `).join('');

      // 绑定事件
      categoryList.addEventListener('click', handleManageAction);
      const siteList = document.getElementById('siteList');
      siteList.addEventListener('click', handleManageAction);
      engineList.addEventListener('click', handleManageAction);
    }

    // 根据选择的分类渲染网站列表
    function renderSiteListByCategory() {
      const siteCategory = document.getElementById('siteCategory');
      const siteList = document.getElementById('siteList');
      const category = siteCategory.value || data.categories[0];
      const sites = data.sites[category] || [];
      siteList.innerHTML = sites.map((s, i) => {
        // 根据图标类型显示不同的图标
        let iconDisplay = '';
        if (s.iconType === 'url' && s.iconUrl) {
          iconDisplay = `<img src="${s.iconUrl}" alt="${s.name}" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px; border-radius: 4px;" onerror="this.style.display='none';">`;
        } else {
          iconDisplay = `<span style="margin-right: 8px;">${s.icon || '🌐'}</span>`;
        }

        return `
          <div class="list-item">
            <span>${iconDisplay}${s.name}</span>
            <div>
              <button class="edit-btn" data-action="edit-site" data-category="${category}" data-index="${i}">编辑</button>
              <button class="delete-btn" data-action="delete-site" data-category="${category}" data-index="${i}">删除</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function handleManageAction(e) {
      const target = e.target;
      const action = target.dataset.action;
      const index = parseInt(target.dataset.index);
      const category = target.dataset.category;

      switch(action) {
        case 'delete-category':
          deleteCategory(index);
          break;
        case 'edit-site':
          editSite(category, index);
          break;
        case 'delete-site':
          deleteSite(category, index);
          break;
        case 'delete-engine':
          deleteEngine(index);
          break;
      }
    }

    // 添加功能
    function addCategory() {
      const name = document.getElementById('categoryName').value.trim();
      if (!name) return alert('请输入分类名称');
      if (data.categories.includes(name)) return alert('分类已存在');

      data.categories.push(name);
      data.sites[name] = [];
      saveData();
      renderCategories();
      renderManageLists();
      document.getElementById('categoryName').value = '';
    }

    function addSite() {
      const category = document.getElementById('siteCategory').value;
      const name = document.getElementById('siteName').value.trim();
      const desc = document.getElementById('siteDesc').value.trim();
      const url = document.getElementById('siteUrl').value.trim();
      const accountInfo = getAccountInfo();

      // 获取图标类型
      const iconType = document.querySelector('input[name="iconType"]:checked').value;
      const icon = iconType === 'text' ? (document.getElementById('siteIcon').value.trim() || '🌐') : '🌐';
      const iconUrl = iconType === 'url' ? document.getElementById('siteIconUrl').value.trim() : '';

      if (!name || !url) return alert('请填写网站名称和地址');
      if (iconType === 'url' && !iconUrl) return alert('请填写图标地址');

      if (!data.sites[category]) data.sites[category] = [];
      data.sites[category].push({ name, icon, iconType, iconUrl, url, desc, accountInfo });

      saveData();
      renderSites();
      renderManageLists();

      clearSiteForm();
    }

    function saveSite() {
      if (editingCategory !== null && editingIndex !== null) {
        // 编辑模式
        updateSite();
      } else {
        // 添加模式
        addSite();
      }
    }

    function editSite(category, index) {
      const site = data.sites[category][index];

      editingCategory = category;
      editingIndex = index;

      // 填充表单
      document.getElementById('siteCategory').value = category;
      document.getElementById('siteName').value = site.name;
      document.getElementById('siteDesc').value = site.desc || '';
      document.getElementById('siteUrl').value = site.url;

      // 填充图标信息
      const iconType = site.iconType || 'text';
      if (iconType === 'url') {
        document.getElementById('iconTypeUrl').checked = true;
        document.getElementById('siteIconUrl').value = site.iconUrl || '';
        document.getElementById('siteIcon').value = '';
        toggleIconInputs();
      } else {
        document.getElementById('iconTypeText').checked = true;
        document.getElementById('siteIcon').value = site.icon || '';
        document.getElementById('siteIconUrl').value = '';
        toggleIconInputs();
      }

      // 填充账号信息
      initAccountFields();
      if (site.accountInfo && Object.keys(site.accountInfo).length > 0) {
        Object.entries(site.accountInfo).forEach(([key, value]) => {
          addAccountField(key, value);
        });
      }

      // 更新按钮状态
      document.getElementById('saveSiteBtn').textContent = '保存修改';
      document.getElementById('cancelEditBtn').style.display = 'inline-block';

      // 滚动到表单顶部
      document.getElementById('siteManage').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateSite() {
      const category = document.getElementById('siteCategory').value;
      const name = document.getElementById('siteName').value.trim();
      const desc = document.getElementById('siteDesc').value.trim();
      const url = document.getElementById('siteUrl').value.trim();
      const accountInfo = getAccountInfo();

      // 获取图标类型
      const iconType = document.querySelector('input[name="iconType"]:checked').value;
      const icon = iconType === 'text' ? (document.getElementById('siteIcon').value.trim() || '🌐') : '🌐';
      const iconUrl = iconType === 'url' ? document.getElementById('siteIconUrl').value.trim() : '';

      if (!name || !url) return alert('请填写网站名称和地址');
      if (iconType === 'url' && !iconUrl) return alert('请填写图标地址');

      // 如果分类改变，需要从旧分类删除并添加到新分类
      if (category !== editingCategory) {
        data.sites[editingCategory].splice(editingIndex, 1);
        if (!data.sites[category]) data.sites[category] = [];
        data.sites[category].push({ name, icon, iconType, iconUrl, url, desc, accountInfo });
      } else {
        // 同一分类，直接更新
        data.sites[category][editingIndex] = { name, icon, iconType, iconUrl, url, desc, accountInfo };
      }

      saveData();
      renderSites();
      renderManageLists();

      cancelEdit();
    }

    function cancelEdit() {
      editingCategory = null;
      editingIndex = null;

      clearSiteForm();

      document.getElementById('saveSiteBtn').textContent = '添加网站';
      document.getElementById('cancelEditBtn').style.display = 'none';
    }

    function clearSiteForm() {
      document.getElementById('siteName').value = '';
      document.getElementById('siteDesc').value = '';
      document.getElementById('siteIcon').value = '';
      document.getElementById('siteIconUrl').value = '';
      document.getElementById('siteUrl').value = '';
      document.getElementById('iconTypeText').checked = true;
      toggleIconInputs();
      initAccountFields();
    }

    // 切换图标输入框显示
    function toggleIconInputs() {
      const iconType = document.querySelector('input[name="iconType"]:checked').value;
      const siteIcon = document.getElementById('siteIcon');
      const siteIconUrl = document.getElementById('siteIconUrl');
      const iconTypeHint = document.getElementById('iconTypeHint');

      if (iconType === 'url') {
        siteIcon.style.display = 'none';
        siteIconUrl.style.display = 'block';
        iconTypeHint.textContent = '输入图标的完整URL地址（如 https://example.com/favicon.ico）';
      } else {
        siteIcon.style.display = 'block';
        siteIconUrl.style.display = 'none';
        iconTypeHint.textContent = '输入表情符号或1-2个文字作为图标';
      }
    }

    function addEngine() {
      const name = document.getElementById('engineName').value.trim();
      const url = document.getElementById('engineUrl').value.trim();

      if (!name || !url) return alert('请填写引擎名称和URL');
      if (!url.includes('{query}')) return alert('URL必须包含 {query}');

      data.engines.push({ name, url });
      saveData();
      renderEngines();
      renderManageLists();

      document.getElementById('engineName').value = '';
      document.getElementById('engineUrl').value = '';
    }

    // 删除功能
    function deleteCategory(index) {
      if (!confirm('确定删除此分类及其所有网站?')) return;
      const category = data.categories[index];
      data.categories.splice(index, 1);
      delete data.sites[category];
      if (currentCategory === category) {
        currentCategory = data.categories[0];
      }
      saveData();
      renderCategories();
      renderSites();
      renderManageLists();
    }

    function deleteSite(category, index) {
      if (!confirm('确定删除此网站?')) return;
      data.sites[category].splice(index, 1);
      saveData();
      renderSites();
      renderManageLists();
    }

    function deleteEngine(index) {
      if (!confirm('确定删除此搜索引擎?')) return;
      data.engines.splice(index, 1);
      saveData();
      renderEngines();
      renderManageLists();
    }

    // 数据同步功能

    // 导出数据
    function exportData() {
      try {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `oasis-backup-${timestamp}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('✅ 数据导出成功！');
      } catch (error) {
        console.error('导出失败:', error);
        alert('❌ 数据导出失败，请重试');
      }
    }

    // 导入数据
    function importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          // 验证数据格式
          if (!importedData.engines || !importedData.categories || !importedData.sites) {
            throw new Error('数据格式不正确');
          }

          if (!confirm('导入数据将覆盖当前所有设置，是否继续？')) {
            event.target.value = '';
            return;
          }

          data = importedData;
          await saveData();
          renderEngines();
          renderCategories();
          renderSites();
          renderManageLists();

          alert('✅ 数据导入成功！');
        } catch (error) {
          console.error('导入失败:', error);
          alert('❌ 数据导入失败，请确保文件格式正确');
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    // 更新存储信息
    async function updateStorageInfo() {
      try {
        const dataSize = new Blob([JSON.stringify(data)]).size;
        const sitesCount = Object.values(data.sites).reduce((sum, arr) => sum + arr.length, 0);

        let syncStatus = '❌ 未启用';
        let quota = '未知';

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          syncStatus = '✅ 已启用';

          // 获取存储配额信息
          try {
            const QUOTA_BYTES = chrome.storage.sync.QUOTA_BYTES || 102400;
            const usagePercent = ((dataSize / QUOTA_BYTES) * 100).toFixed(1);
            quota = `${(dataSize / 1024).toFixed(2)} KB / ${(QUOTA_BYTES / 1024).toFixed(0)} KB (${usagePercent}%)`;
          } catch (e) {
            quota = `${(dataSize / 1024).toFixed(2)} KB`;
          }
        }

        const infoHtml = `
          <div style="display: grid; gap: 8px;">
            <div><strong>云端同步状态:</strong> ${syncStatus}</div>
            <div><strong>数据大小:</strong> ${quota}</div>
            <div><strong>分类数量:</strong> ${data.categories.length} 个</div>
            <div><strong>网站数量:</strong> ${sitesCount} 个</div>
            <div><strong>搜索引擎:</strong> ${data.engines.length} 个</div>
          </div>
        `;

        document.getElementById('storageInfo').innerHTML = infoHtml;
      } catch (error) {
        console.error('更新存储信息失败:', error);
        document.getElementById('storageInfo').textContent = '❌ 获取信息失败';
      }
    }

    // 清空所有数据
    async function clearAllData() {
      if (!confirm('⚠️ 警告：此操作将删除所有数据，且不可恢复！\n\n确定要继续吗？')) {
        return;
      }

      if (!confirm('请再次确认：真的要删除所有分类、网站和搜索引擎吗？')) {
        return;
      }

      try {
        data = JSON.parse(JSON.stringify(defaultData));
        await saveData();

        renderEngines();
        renderCategories();
        renderSites();
        renderManageLists();
        updateStorageInfo();

        alert('✅ 所有数据已清空，已恢复为默认设置');
      } catch (error) {
        console.error('清空数据失败:', error);
        alert('❌ 清空数据失败，请重试');
      }
    }

    // 切换打开模式
    function toggleOpenMode() {
      openInNewTab = !openInNewTab;
      saveOpenMode();
      updateOpenModeUI();
    }

    function saveOpenMode() {
      localStorage.setItem('openInNewTab', JSON.stringify(openInNewTab));
    }

    function loadOpenMode() {
      const saved = localStorage.getItem('openInNewTab');
      if (saved !== null) {
        openInNewTab = JSON.parse(saved);
      }
      updateOpenModeUI();
    }

    function updateOpenModeUI() {
      const icon = document.getElementById('openModeIcon');
      const text = document.getElementById('openModeText');
      if (openInNewTab) {
        icon.textContent = '🔗';
        text.textContent = '新标签页';
      } else {
        icon.textContent = '📄';
        text.textContent = '当前标签页';
      }
    }

    // 绑定所有事件监听器
    function bindEventListeners() {
      // 搜索按钮
      document.getElementById('searchBtn').addEventListener('click', performSearch);

      // 打开模式切换
      document.getElementById('openModeBtn').addEventListener('click', toggleOpenMode);

      // 管理按钮
      document.getElementById('manageBtn').addEventListener('click', openManageModal);
      document.getElementById('closeModalBtn').addEventListener('click', closeManageModal);

      // Tab 切换
      document.getElementById('tabButtons').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-button')) {
          switchTab(e.target.dataset.tab);
        }
      });

      // 分类管理
      document.getElementById('addCategoryBtn').addEventListener('click', addCategory);

      // 网站管理
      document.getElementById('addFieldBtn').addEventListener('click', () => addAccountField());
      document.getElementById('saveSiteBtn').addEventListener('click', saveSite);
      document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

      // 图标类型切换
      document.querySelectorAll('input[name="iconType"]').forEach(radio => {
        radio.addEventListener('change', toggleIconInputs);
      });

      // 搜索引擎管理
      document.getElementById('addEngineBtn').addEventListener('click', addEngine);

      // 数据同步
      document.getElementById('exportDataBtn').addEventListener('click', exportData);
      document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
      });
      document.getElementById('importFile').addEventListener('change', importData);
      document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

      // 模态框背景点击关闭
      document.getElementById('manageModal').addEventListener('click', (e) => {
        if (e.target.id === 'manageModal') {
          closeManageModal();
        }
      });

      // 回车搜索
      document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bindEventListeners();
        init();
        checkPendingAddSite();
      });
    } else {
      bindEventListeners();
      init();
      checkPendingAddSite();
    }

    // 监听来自 background.js 的消息
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('收到消息:', request);
        if (request.action === 'addSiteFromContext') {
          // 打开管理模态框，切换到网站管理标签，预填数据
          openManageModal();
          setTimeout(() => {
            switchTab('site');
            preFillSiteForm(request.url, request.name, request.faviconUrl);
          }, 50);
          sendResponse({ success: true });
        }
        return true; // 保持消息通道开放
      });
    }

    // 检查是否有待添加的网站（从右键菜单触发）
    async function checkPendingAddSite() {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const result = await new Promise((resolve) => {
            chrome.storage.local.get(['pendingAddSite'], resolve);
          });

          if (result.pendingAddSite) {
            const pending = result.pendingAddSite;
            console.log('检测到待添加网站:', pending);
            // 检查时间戳，避免处理过期的数据（5分钟内有效）
            if (Date.now() - pending.timestamp < 5 * 60 * 1000) {
              // 打开管理模态框，切换到网站管理标签，预填数据
              openManageModal();
              setTimeout(() => {
                switchTab('site');
                preFillSiteForm(pending.url, pending.name, pending.faviconUrl);
              }, 50);
            }
            // 清除已处理的数据
            chrome.storage.local.remove(['pendingAddSite']);
          }
        }
      } catch (error) {
        console.error('检查待添加网站失败:', error);
      }
    }

    // 预填网站表单
    function preFillSiteForm(url, name, faviconUrl) {
      // 使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        // 确保在网站管理标签
        document.getElementById('siteName').value = name;
        document.getElementById('siteUrl').value = url;
        document.getElementById('siteDesc').value = name;

        // 处理图标
        if (faviconUrl && faviconUrl.trim()) {
          // 如果有 favicon URL，使用在线图标模式
          document.getElementById('iconTypeUrl').checked = true;
          document.getElementById('siteIconUrl').value = faviconUrl;
          document.getElementById('siteIcon').value = '';
          toggleIconInputs();
        } else {
          // 否则使用默认文字图标
          document.getElementById('iconTypeText').checked = true;
          document.getElementById('siteIcon').value = '🌐';
          document.getElementById('siteIconUrl').value = '';
          toggleIconInputs();
        }

        // 清空编辑状态
        editingCategory = null;
        editingIndex = null;
        document.getElementById('saveSiteBtn').textContent = '添加网站';
        document.getElementById('cancelEditBtn').style.display = 'none';

        // 滚动到表单顶部
        document.getElementById('siteManage').scrollIntoView({ behavior: 'smooth', block: 'start' });

        console.log('✅ 已预填网站信息:', name, url, faviconUrl);
      }, 100);
    }
