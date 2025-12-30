    // 默认数据
    const defaultData = {
      engines: [
        { name: 'Google', url: 'https://www.google.com/search?q={query}' },
        { name: 'Bing', url: 'https://www.bing.com/search?q={query}' },
        { name: 'Baidu', url: 'https://www.baidu.com/s?wd={query}' }
      ],
      categories: [
        { name: '常用', pinned: false },
        { name: '工作', pinned: false },
        { name: '娱乐', pinned: false }
      ],
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
    let isLocalSearching = false; // 本地搜索状态
    let searchResults = []; // 搜索结果

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
            // 数据迁移：将旧格式的 categories (字符串数组) 转换为新格式 (对象数组)
            const needsMigration = migrateCategoriesFormat();
            // 如果进行了迁移，需要保存回去
            if (needsMigration) {
              await saveData();
              console.log('✅ 数据已从云端同步加载并迁移');
            } else {
              console.log('✅ 数据已从云端同步加载');
            }
            return;
          }
        }

        // 降级到 localStorage（用于兼容性或迁移）
        const stored = localStorage.getItem('navData');
        if (stored) {
          data = JSON.parse(stored);
          // 数据迁移
          migrateCategoriesFormat();
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
          migrateCategoriesFormat();
        } else {
          // 最终降级：使用默认数据
          data = JSON.parse(JSON.stringify(defaultData));
        }
      }
    }

    // 迁移分类数据格式（从字符串数组到对象数组）
    function migrateCategoriesFormat() {
      if (data.categories && data.categories.length > 0) {
        // 检查第一个元素是否为字符串（旧格式）
        if (typeof data.categories[0] === 'string') {
          console.log('🔄 检测到旧格式分类数据，正在迁移...');
          data.categories = data.categories.map(name => ({
            name: name,
            pinned: false
          }));
          console.log('✅ 分类数据迁移完成');
          return true; // 返回 true 表示进行了迁移
        }
      }
      return false; // 返回 false 表示不需要迁移
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

    // 本地搜索功能 - 搜索所有已保存的网站
    function performLocalSearch() {
      const query = document.getElementById('searchInput').value.trim().toLowerCase();
      if (!query) {
        alert('请输入搜索内容');
        return;
      }

      // 搜索所有分类中的网站
      searchResults = [];
      Object.keys(data.sites).forEach(category => {
        data.sites[category].forEach((site, index) => {
          // 在名称、描述、URL中搜索
          const matchName = site.name.toLowerCase().includes(query);
          const matchDesc = site.desc && site.desc.toLowerCase().includes(query);
          const matchUrl = site.url.toLowerCase().includes(query);

          if (matchName || matchDesc || matchUrl) {
            searchResults.push({
              site: site,
              category: category,
              index: index
            });
          }
        });
      });

      // 显示搜索结果
      isLocalSearching = true;
      renderSearchResults();
    }

    // 渲染搜索结果
    function renderSearchResults() {
      const resultHeader = document.getElementById('localSearchResult');
      const resultCount = document.getElementById('searchResultCount');
      const container = document.getElementById('sitesGrid');
      const categoryTabs = document.getElementById('categoryTabs');

      if (searchResults.length === 0) {
        resultHeader.style.display = 'block';
        resultCount.textContent = '未找到匹配的网站';
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #5f6368;">😔 没有找到相关网站</div>';
        categoryTabs.style.display = 'none';
        return;
      }

      resultHeader.style.display = 'block';
      resultCount.textContent = `找到 ${searchResults.length} 个匹配的网站`;
      categoryTabs.style.display = 'none';

      // 渲染搜索结果
      container.innerHTML = searchResults.map(result => {
        const site = result.site;
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

        // 显示网站所属分类
        const categoryBadge = `<div class="site-category-badge">${result.category}</div>`;

        return `
          <div class="site-card" data-url="${site.url}">
            <div class="site-avatar">${iconHtml}</div>
            <div class="site-name">${site.name}</div>
            ${site.desc ? `<div class="site-url">${site.desc}</div>` : ''}
            ${categoryBadge}
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

    // 清除本地搜索
    function clearLocalSearch() {
      isLocalSearching = false;
      searchResults = [];
      document.getElementById('localSearchResult').style.display = 'none';
      document.getElementById('searchInput').value = '';
      document.getElementById('categoryTabs').style.display = 'flex';
      renderSites();
    }

    // 渲染分类
    function renderCategories() {
      const pinnedContainer = document.getElementById('categoryTabsPinned');
      const scrollContainer = document.getElementById('categoryTabs');

      // 分类排序：置顶的在前面，非置顶的在后面
      const pinnedCategories = data.categories.filter(c => c.pinned);
      const unpinnedCategories = data.categories.filter(c => !c.pinned);

      // 渲染置顶分类（固定在左侧）
      pinnedContainer.innerHTML = pinnedCategories.map(c =>
        `<button class="category-tab ${c.name === currentCategory ? 'active' : ''} pinned-category"
                data-category="${c.name}">📌 ${c.name}</button>`
      ).join('');

      // 渲染非置顶分类（可滚动）
      scrollContainer.innerHTML = unpinnedCategories.map(c =>
        `<button class="category-tab ${c.name === currentCategory ? 'active' : ''}"
                data-category="${c.name}">${c.name}</button>`
      ).join('');

      // 绑定分类点击事件
      [pinnedContainer, scrollContainer].forEach(container => {
        container.querySelectorAll('.category-tab').forEach(tab => {
          tab.addEventListener('click', (e) => {
            selectCategory(e.target.dataset.category);
          });
        });
      });

      // 初始化滚动控制
      initCategoryScroll();
    }

    // 初始化分类滚动控制
    function initCategoryScroll() {
      const scrollContainer = document.getElementById('categoryTabs');
      const scrollLeftBtn = document.getElementById('categoryScrollLeft');
      const scrollRightBtn = document.getElementById('categoryScrollRight');

      if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) {
        return;
      }

      // 更新箭头按钮显示状态
      function updateScrollButtons() {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

        // 显示/隐藏左箭头
        if (scrollLeft > 0) {
          scrollLeftBtn.classList.add('show');
        } else {
          scrollLeftBtn.classList.remove('show');
        }

        // 显示/隐藏右箭头
        if (scrollLeft < scrollWidth - clientWidth - 1) {
          scrollRightBtn.classList.add('show');
        } else {
          scrollRightBtn.classList.remove('show');
        }
      }

      // 左箭头点击事件
      scrollLeftBtn.onclick = () => {
        scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
      };

      // 右箭头点击事件
      scrollRightBtn.onclick = () => {
        scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
      };

      // 监听滚动事件，更新箭头显示
      scrollContainer.addEventListener('scroll', updateScrollButtons);

      // 初始化箭头状态
      updateScrollButtons();

      // 鼠标拖拽滑动功能
      let isDragging = false;
      let startX = 0;
      let scrollLeftStart = 0;

      scrollContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeftStart = scrollContainer.scrollLeft;
        scrollContainer.style.cursor = 'grabbing';
        e.preventDefault();
      });

      scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5; // 拖拽速度系数
        scrollContainer.scrollLeft = scrollLeftStart - walk;
      });

      scrollContainer.addEventListener('mouseup', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
      });

      scrollContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
      });

      // 设置初始光标样式
      scrollContainer.style.cursor = 'grab';
    }

    function selectCategory(name) {
      currentCategory = name;
      renderCategories();
      renderSites();
    }

    // 渲染网站
    function renderSites() {
      const container = document.getElementById('sitesGrid');
      let sites = data.sites[currentCategory] || [];

      // 置顶的网站排在前面
      sites = [...sites].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });

      container.innerHTML = sites.map((site, i) => {
        // 获取原始索引（排序前）
        const originalIndex = data.sites[currentCategory].findIndex(s => s.url === site.url);

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

        // 置顶标记
        const pinBadge = site.pinned ? '<div class="pin-badge">📌 置顶</div>' : '';

        // 快捷编辑按钮
        const quickEditBtn = `<button class="quick-edit-btn" data-category="${currentCategory}" data-index="${originalIndex}" title="编辑">✏️</button>`;

        return `
          <div class="site-card ${site.pinned ? 'pinned-site' : ''}" data-url="${site.url}">
            ${pinBadge}
            ${quickEditBtn}
            <div class="site-avatar">${iconHtml}</div>
            <div class="site-name">${site.name}</div>
            ${site.desc ? `<div class="site-url">${site.desc}</div>` : ''}
            ${accountInfoHtml}
          </div>
        `;
      }).join('');

      // 绑定网站卡片点击事件
      container.querySelectorAll('.site-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // 如果点击的是快捷编辑按钮，不打开网站
          if (e.target.classList.contains('quick-edit-btn')) {
            e.stopPropagation();
            const category = e.target.dataset.category;
            const index = parseInt(e.target.dataset.index);
            // 打开管理模态框并编辑
            openManageModal();
            setTimeout(() => {
              switchTab('site');
              editSite(category, index);
            }, 50);
            return;
          }
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

      // 切换到数据同步时，更新存储信息和百度网盘状态
      if (tab === 'sync') {
        updateStorageInfo();
        loadBaiduStatus();
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
      // 渲染分类列表（排序：置顶在前）
      const categoryList = document.getElementById('categoryList');
      const sortedCategories = [...data.categories].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });

      categoryList.innerHTML = sortedCategories.map((c, i) => {
        // 找到原始索引
        const originalIndex = data.categories.findIndex(cat => cat.name === c.name);
        const pinIcon = c.pinned ? '📌 ' : '';

        return `
          <div class="list-item">
            <span>${pinIcon}${c.name}</span>
            <div>
              <button class="pin-btn ${c.pinned ? 'pinned' : ''}" data-action="${c.pinned ? 'unpin-category' : 'pin-category'}" data-index="${originalIndex}">${c.pinned ? '取消置顶' : '置顶'}</button>
              <button class="delete-btn" data-action="delete-category" data-index="${originalIndex}">删除</button>
            </div>
          </div>
        `;
      }).join('');

      // 渲染网站选择分类，如果已有选中的分类则保持，否则使用当前分类
      const siteCategory = document.getElementById('siteCategory');
      const previousSelected = siteCategory.value || currentCategory;
      siteCategory.innerHTML = data.categories.map(c =>
        `<option value="${c.name}" ${c.name === previousSelected ? 'selected' : ''}>${c.pinned ? '📌 ' : ''}${c.name}</option>`
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
      const category = siteCategory.value || (data.categories[0] ? data.categories[0].name : '');
      const sites = data.sites[category] || [];
      siteList.innerHTML = sites.map((s, i) => {
        // 根据图标类型显示不同的图标
        let iconDisplay = '';
        if (s.iconType === 'url' && s.iconUrl) {
          iconDisplay = `<img src="${s.iconUrl}" alt="${s.name}" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px; border-radius: 4px;" onerror="this.style.display='none';">`;
        } else {
          iconDisplay = `<span style="margin-right: 8px;">${s.icon || '🌐'}</span>`;
        }

        // 置顶标记
        const pinIcon = s.pinned ? '<span style="margin-right: 4px;">📌</span>' : '';

        return `
          <div class="list-item">
            <span>${pinIcon}${iconDisplay}${s.name}</span>
            <div>
              <button class="pin-btn ${s.pinned ? 'pinned' : ''}" data-action="${s.pinned ? 'unpin-site' : 'pin-site'}" data-category="${category}" data-index="${i}">${s.pinned ? '取消置顶' : '置顶'}</button>
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
        case 'pin-category':
          toggleCategoryPin(index, true);
          break;
        case 'unpin-category':
          toggleCategoryPin(index, false);
          break;
        case 'delete-category':
          deleteCategory(index);
          break;
        case 'pin-site':
          togglePin(category, index, true);
          break;
        case 'unpin-site':
          togglePin(category, index, false);
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

    // 切换分类置顶状态
    function toggleCategoryPin(index, pinned) {
      data.categories[index].pinned = pinned;
      saveData();
      renderCategories();
      renderManageLists();
    }

    // 切换网站置顶状态
    function togglePin(category, index, pinned) {
      data.sites[category][index].pinned = pinned;
      saveData();
      renderSites();
      renderManageLists();
    }

    // 添加功能
    function addCategory() {
      const name = document.getElementById('categoryName').value.trim();
      if (!name) return alert('请输入分类名称');
      if (data.categories.some(c => c.name === name)) return alert('分类已存在');

      data.categories.push({ name: name, pinned: false });
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
      data.sites[category].push({ name, icon, iconType, iconUrl, url, desc, accountInfo, pinned: false });

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

      // 保留原有的置顶状态
      const originalSite = data.sites[editingCategory][editingIndex];
      const pinned = originalSite.pinned || false;

      // 如果分类改变，需要从旧分类删除并添加到新分类
      if (category !== editingCategory) {
        data.sites[editingCategory].splice(editingIndex, 1);
        if (!data.sites[category]) data.sites[category] = [];
        data.sites[category].push({ name, icon, iconType, iconUrl, url, desc, accountInfo, pinned });
      } else {
        // 同一分类，直接更新
        data.sites[category][editingIndex] = { name, icon, iconType, iconUrl, url, desc, accountInfo, pinned };
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
      const categoryName = data.categories[index].name;
      data.categories.splice(index, 1);
      delete data.sites[categoryName];
      if (currentCategory === categoryName) {
        currentCategory = data.categories[0] ? data.categories[0].name : '';
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

    // 统一的数据合并函数 - 只添加新数据，不覆盖现有数据
    function mergeData(importedData) {
      // 验证数据格式
      if (!importedData.engines || !importedData.categories || !importedData.sites) {
        throw new Error('数据格式不正确');
      }

      let mergeReport = {
        engines: { added: 0, skipped: 0 },
        categories: { added: 0, skipped: 0 },
        sites: { added: 0, skipped: 0 }
      };

      // 1. 合并搜索引擎 - 根据名称判断是否已存在
      importedData.engines.forEach(engine => {
        const exists = data.engines.some(e => e.name === engine.name);
        if (!exists) {
          data.engines.push(engine);
          mergeReport.engines.added++;
        } else {
          mergeReport.engines.skipped++;
        }
      });

      // 2. 合并分类 - 只添加新分类
      importedData.categories.forEach(category => {
        const categoryName = typeof category === 'string' ? category : category.name;
        const categoryPinned = typeof category === 'string' ? false : (category.pinned || false);

        // 检查分类名是否已存在
        const existingCategory = data.categories.find(c => c.name === categoryName);
        if (!existingCategory) {
          data.categories.push({ name: categoryName, pinned: categoryPinned });
          data.sites[categoryName] = [];
          mergeReport.categories.added++;
        } else {
          mergeReport.categories.skipped++;
        }
      });

      // 3. 合并网站 - 在每个分类下，根据URL判断是否已存在
      Object.keys(importedData.sites).forEach(category => {
        // 确保分类存在
        if (!data.sites[category]) {
          data.sites[category] = [];
        }

        importedData.sites[category].forEach(site => {
          // 根据URL判断网站是否已存在
          const exists = data.sites[category].some(s => s.url === site.url);
          if (!exists) {
            data.sites[category].push(site);
            mergeReport.sites.added++;
          } else {
            mergeReport.sites.skipped++;
          }
        });
      });

      return mergeReport;
    }

    // 导出数据
    function exportData() {
      try {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `oasis-backup-${timestamp}.json`;

        // 兼容 Chrome 和 Firefox 的 API
        const browserAPI = typeof chrome !== 'undefined' && chrome.downloads ? chrome : (typeof browser !== 'undefined' && browser.downloads ? browser : null);

        if (browserAPI && browserAPI.downloads) {
          // 使用 downloads API（推荐方式）
          const url = URL.createObjectURL(blob);
          browserAPI.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
          }, (downloadId) => {
            URL.revokeObjectURL(url);
            if (browserAPI.runtime.lastError) {
              console.error('导出失败:', browserAPI.runtime.lastError);
              alert('❌ 数据导出失败，请重试');
            } else {
              alert('✅ 数据导出成功！');
            }
          });
        } else {
          // 降级方案：使用传统的 a 标签下载
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // 延迟释放 URL，确保下载完成
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);
          alert('✅ 数据导出成功！');
        }
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

          // 询问用户是合并还是覆盖
          const message = '请选择导入方式：\n\n' +
            '【确定】= 合并数据（只添加新内容，保留现有数据）\n' +
            '【取消】= 完全覆盖（删除现有数据，使用导入的数据替换）\n\n' +
            '⚠️ 建议选择"合并数据"以避免数据丢失';

          const shouldMerge = confirm(message);

          if (shouldMerge) {
            // 合并模式
            const mergeReport = mergeData(importedData);
            await saveData();
            renderEngines();
            renderCategories();
            renderSites();
            renderManageLists();

            const reportMessage = '✅ 数据合并成功！\n\n' +
              `✨ 新增搜索引擎: ${mergeReport.engines.added} 个 (跳过重复: ${mergeReport.engines.skipped})\n` +
              `📁 新增分类: ${mergeReport.categories.added} 个 (跳过重复: ${mergeReport.categories.skipped})\n` +
              `🌐 新增网站: ${mergeReport.sites.added} 个 (跳过重复: ${mergeReport.sites.skipped})`;

            alert(reportMessage);
          } else {
            // 覆盖模式 - 二次确认
            if (confirm('⚠️ 警告：此操作将删除所有现有数据！\n\n确定要完全覆盖吗？')) {
              data = importedData;
              await saveData();
              renderEngines();
              renderCategories();
              renderSites();
              renderManageLists();

              alert('✅ 数据已完全覆盖导入！');
            }
          }
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

    // 导入浏览器书签
    async function importBookmarks() {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        alert('❌ 当前环境不支持书签访问功能');
        return;
      }

      try {
        // 询问用户导入方式
        const message = '📚 导入浏览器书签\n\n' +
          '请选择导入方式：\n\n' +
          '【确定】= 合并书签（只添加新内容，保留现有数据）\n' +
          '【取消】= 完全覆盖（删除现有数据，使用书签替换）\n\n' +
          '⚠️ 建议选择"合并书签"以避免数据丢失';

        const shouldMerge = confirm(message);

        if (!shouldMerge) {
          // 覆盖模式需要二次确认
          if (!confirm('⚠️ 警告：此操作将删除所有现有数据！\n\n确定要完全覆盖吗？')) {
            return;
          }
        }

        // 获取所有书签
        const bookmarkTree = await new Promise((resolve) => {
          chrome.bookmarks.getTree(resolve);
        });

        // 解析书签树
        const importedData = {
          engines: [...data.engines], // 保留搜索引擎
          categories: [],
          sites: {}
        };

        function parseBookmarkNode(node, categoryName = '未分类书签') {
          if (node.url) {
            // 这是一个书签
            if (!importedData.sites[categoryName]) {
              importedData.sites[categoryName] = [];
              // 检查分类是否已存在（使用对象格式）
              if (!importedData.categories.find(c => c.name === categoryName)) {
                importedData.categories.push({ name: categoryName, pinned: false });
              }
            }

            // 尝试获取favicon
            const domain = new URL(node.url).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

            importedData.sites[categoryName].push({
              name: node.title || domain,
              icon: '🌐',
              iconType: 'url',
              iconUrl: faviconUrl,
              url: node.url,
              desc: domain,
              accountInfo: {}
            });
          } else if (node.children) {
            // 这是一个文件夹
            const folderName = node.title || categoryName;
            // 跳过"书签栏"、"其他书签"等顶层文件夹的名称，直接使用子文件夹名称
            const isTopLevel = !node.parentId || node.parentId === '0';

            node.children.forEach(child => {
              if (child.url) {
                parseBookmarkNode(child, isTopLevel ? '书签栏' : folderName);
              } else {
                parseBookmarkNode(child, child.title || folderName);
              }
            });
          }
        }

        // 遍历书签树
        bookmarkTree.forEach(root => {
          if (root.children) {
            root.children.forEach(node => parseBookmarkNode(node));
          }
        });

        // 统计导入的书签数量
        const totalBookmarks = Object.values(importedData.sites).reduce((sum, arr) => sum + arr.length, 0);

        if (totalBookmarks === 0) {
          alert('❌ 未找到可导入的书签');
          return;
        }

        // 确认导入
        if (!confirm(`找到 ${totalBookmarks} 个书签，分布在 ${importedData.categories.length} 个分类中。\n\n确定要导入吗？`)) {
          return;
        }

        // 根据用户选择的模式处理数据
        if (shouldMerge) {
          // 合并模式
          const mergeReport = mergeData(importedData);
          await saveData();

          renderEngines();
          renderCategories();
          renderSites();
          renderManageLists();

          const reportMessage = '✅ 书签导入成功！\n\n' +
            `📁 新增分类: ${mergeReport.categories.added} 个 (跳过重复: ${mergeReport.categories.skipped})\n` +
            `🌐 新增网站: ${mergeReport.sites.added} 个 (跳过重复: ${mergeReport.sites.skipped})`;

          alert(reportMessage);
        } else {
          // 覆盖模式
          data = importedData;
          await saveData();

          renderEngines();
          renderCategories();
          renderSites();
          renderManageLists();

          alert('✅ 书签已完全覆盖导入！');
        }
      } catch (error) {
        console.error('导入书签失败:', error);
        alert('❌ 导入书签失败：' + error.message);
      }
    }


    // 百度网盘同步功能（基于Cookie）
    const BAIDU_BACKUP_FILENAME = 'oasis-navigation-backup.json';
    const BAIDU_BACKUP_PATH = '/apps/oasis-nav/' + BAIDU_BACKUP_FILENAME;
    const BAIDU_PCS_URL = 'https://c2.pcs.baidu.com';

    // 登录百度网盘并获取Cookie
    async function loginBaidu() {
      updateBaiduStatus('正在打开百度网盘登录页面...');

      try {
        // 打开百度网盘登录页面
        const loginUrl = 'https://pan.baidu.com';
        const width = 800;
        const height = 700;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        const loginWindow = window.open(
          loginUrl,
          '百度网盘登录',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!loginWindow) {
          updateBaiduStatus('❌ 无法打开登录窗口');
          alert('❌ 请允许弹出窗口以完成登录');
          return;
        }

        updateBaiduStatus('请在弹出窗口中登录百度网盘...');

        // 持续检测登录状态
        const checkInterval = setInterval(async () => {
          // 如果窗口被关闭，停止检测
          if (loginWindow.closed) {
            clearInterval(checkInterval);
            // 最后检查一次登录状态
            await checkBaiduLogin(false);
            return;
          }

          // 检查是否已经登录成功
          const isLoggedIn = await checkBaiduLogin(true);
          if (isLoggedIn) {
            clearInterval(checkInterval);
            // 自动关闭登录窗口
            loginWindow.close();
            updateBaiduStatus('✅ 已登录');
            alert('✅ 百度网盘登录成功！');
          }
        }, 2000); // 每2秒检测一次

      } catch (error) {
        console.error('打开登录窗口失败:', error);
        updateBaiduStatus('❌ 登录失败');
        alert('❌ 登录失败：' + error.message);
      }
    }

    // 检查百度网盘登录状态
    async function checkBaiduLogin(silent = false) {
      try {
        if (typeof chrome !== 'undefined' && chrome.cookies) {
          // 获取百度网盘的关键Cookie（BDUSS）
          const bduss = await new Promise((resolve) => {
            chrome.cookies.get({
              url: 'https://pan.baidu.com',
              name: 'BDUSS'
            }, (cookie) => {
              resolve(cookie ? cookie.value : null);
            });
          });

          if (bduss) {
            // 保存Cookie标记
            localStorage.setItem('baiduLoggedIn', 'true');
            if (!silent) {
              updateBaiduStatus('✅ 已登录');
              alert('✅ 百度网盘登录成功！');
            }
            return true;
          } else {
            if (!silent) {
              updateBaiduStatus('❌ 未检测到登录信息');
              alert('❌ 未检测到登录信息，请确保已成功登录百度网盘');
            }
            return false;
          }
        } else {
          if (!silent) {
            updateBaiduStatus('❌ 浏览器不支持Cookie访问');
            alert('❌ 当前浏览器不支持Cookie访问功能');
          }
          return false;
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        if (!silent) {
          updateBaiduStatus('❌ 检查登录失败');
        }
        return false;
      }
    }

    // 加载百度网盘登录状态
    function loadBaiduStatus() {
      const loggedIn = localStorage.getItem('baiduLoggedIn');
      if (loggedIn === 'true') {
        updateBaiduStatus('✅ 已登录');
      } else {
        updateBaiduStatus('未登录');
      }
    }

    // 更新百度网盘状态显示
    function updateBaiduStatus(status) {
      const statusEl = document.getElementById('baiduSyncStatus');
      if (statusEl) {
        statusEl.textContent = status;
      }
    }

    // 备份到百度网盘
    async function syncToBaidu() {
      const loggedIn = localStorage.getItem('baiduLoggedIn');
      if (loggedIn !== 'true') {
        alert('❌ 请先登录百度网盘');
        return;
      }

      // 备份前的详细警告
      const warningMessage = '⚠️ 重要提示：备份到百度网盘\n\n' +
        '📤 此操作将把【当前浏览器】的数据上传到百度网盘，并【覆盖】云端已有的备份文件。\n\n' +
        '✅ 请确认：\n' +
        '1. 当前浏览器的数据是最新的\n' +
        '2. 您希望用当前数据覆盖云端备份\n\n' +
        '💡 如果您不确定哪边数据更新，建议：\n' +
        '• 先点击"从百度网盘恢复"查看云端数据\n' +
        '• 或先"导出数据"到本地作为额外备份\n\n' +
        '确定要继续备份吗？';

      if (!confirm(warningMessage)) {
        return;
      }

      updateBaiduStatus('正在备份到百度网盘...');

      try {
        // 准备上传的数据
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });

        // 使用FormData上传
        const formData = new FormData();
        formData.append('file', blob, BAIDU_BACKUP_FILENAME);

        // 构造上传URL - 使用百度PCS简单上传接口
        const uploadUrl = `${BAIDU_PCS_URL}/rest/2.0/pcs/file?method=upload&app_id=250528&channel=chunlei&clienttype=0&web=1&path=${encodeURIComponent(BAIDU_BACKUP_PATH)}&ondup=overwrite`;

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          credentials: 'include' // 包含Cookie
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('上传失败响应:', errorText);
          throw new Error(`上传失败: HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('上传响应:', result);

        // 百度PCS API 成功时 返回path等信息
        if (result.path || result.error_code === 0 || response.ok) {
          updateBaiduStatus('✅ 备份成功 - ' + new Date().toLocaleString());
          alert('✅ 数据已成功备份到百度网盘！');
        } else {
          throw new Error(result.error_msg || result.errmsg || '上传失败');
        }
      } catch (error) {
        console.error('百度网盘备份失败:', error);
        updateBaiduStatus('❌ 备份失败');
        alert('❌ 备份失败：' + error.message + '\n\n请确保已登录百度网盘，或重新登录后再试');
      }
    }

    // 从百度网盘恢复
    async function syncFromBaidu() {
      const loggedIn = localStorage.getItem('baiduLoggedIn');
      if (loggedIn !== 'true') {
        alert('❌ 请先登录百度网盘');
        return;
      }

      // 询问用户是合并还是覆盖
      const message = '📥 从百度网盘恢复数据\n\n' +
        '请选择恢复方式：\n\n' +
        '【确定】= 合并数据（只添加新内容，保留现有数据）\n' +
        '【取消】= 完全覆盖（删除现有数据，使用云端数据替换）\n\n' +
        '⚠️ 建议选择"合并数据"以避免数据丢失';

      const shouldMerge = confirm(message);

      if (!shouldMerge) {
        // 覆盖模式需要二次确认
        if (!confirm('⚠️ 警告：此操作将删除所有现有数据！\n\n确定要完全覆盖吗？')) {
          return;
        }
      }

      updateBaiduStatus('正在从百度网盘恢复...');

      try {
        // 第一步：获取文件列表，得到文件的fs_id
        const listUrl = `https://pan.baidu.com/api/list?app_id=250528&clienttype=0&web=1&dir=${encodeURIComponent('/apps/oasis-nav')}&num=100&order=name`;

        const listResponse = await fetch(listUrl, {
          method: 'GET',
          credentials: 'include'
        });

        if (!listResponse.ok) {
          throw new Error(`获取文件列表失败: HTTP ${listResponse.status}`);
        }

        const listResult = await listResponse.json();
        console.log('文件列表响应:', listResult);

        if (listResult.errno !== 0) {
          throw new Error(listResult.errmsg || '获取文件列表失败');
        }

        // 查找备份文件
        const backupFile = listResult.list?.find(file =>
          file.server_filename === BAIDU_BACKUP_FILENAME ||
          file.path === BAIDU_BACKUP_PATH
        );

        if (!backupFile) {
          throw new Error('未找到备份文件，请先备份数据到百度网盘');
        }

        console.log('找到备份文件:', backupFile);

        // 第二步：使用后台脚本下载文件内容（绕过CORS限制）
        const downloadUrl = `${BAIDU_PCS_URL}/rest/2.0/pcs/file?method=download&app_id=250528&clienttype=0&web=1&path=${encodeURIComponent(BAIDU_BACKUP_PATH)}`;

        console.log('发送下载请求到后台脚本...');

        // 通过chrome.runtime.sendMessage发送到background.js
        const downloadResult = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'downloadFile',
            url: downloadUrl
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        if (!downloadResult.success) {
          throw new Error(downloadResult.error || '下载失败');
        }

        console.log('下载成功，文件大小:', downloadResult.content.length);

        // 解析JSON数据
        const downloadedData = JSON.parse(downloadResult.content);
        console.log('解析后的数据:', downloadedData);

        // 验证数据格式
        if (!downloadedData.engines || !downloadedData.categories || !downloadedData.sites) {
          throw new Error('备份数据格式不正确');
        }

        // 根据用户选择的模式处理数据
        if (shouldMerge) {
          // 合并模式
          const mergeReport = mergeData(downloadedData);
          await saveData();

          renderEngines();
          renderCategories();
          renderSites();
          renderManageLists();

          const reportMessage = '✅ 数据从百度网盘合并成功！\n\n' +
            `✨ 新增搜索引擎: ${mergeReport.engines.added} 个 (跳过重复: ${mergeReport.engines.skipped})\n` +
            `📁 新增分类: ${mergeReport.categories.added} 个 (跳过重复: ${mergeReport.categories.skipped})\n` +
            `🌐 新增网站: ${mergeReport.sites.added} 个 (跳过重复: ${mergeReport.sites.skipped})`;

          updateBaiduStatus('✅ 合并成功 - ' + new Date().toLocaleString());
          alert(reportMessage);
        } else {
          // 覆盖模式
          data = downloadedData;
          await saveData();

          renderEngines();
          renderCategories();
          renderSites();
          renderManageLists();

          updateBaiduStatus('✅ 恢复成功 - ' + new Date().toLocaleString());
          alert('✅ 数据已从百度网盘完全覆盖恢复！');
        }
      } catch (error) {
        console.error('百度网盘恢复失败:', error);
        updateBaiduStatus('❌ 恢复失败');
        alert('❌ 恢复失败：' + error.message + '\n\n请确保已登录百度网盘且备份文件存在，或重新登录后再试');
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

      // 本地搜索按钮
      document.getElementById('localSearchBtn').addEventListener('click', performLocalSearch);
      document.getElementById('clearSearchBtn').addEventListener('click', clearLocalSearch);

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
      document.getElementById('importBookmarksBtn').addEventListener('click', importBookmarks);
      document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

      // 百度网盘同步
      document.getElementById('baiduLoginBtn').addEventListener('click', loginBaidu);
      document.getElementById('syncToBaiduBtn').addEventListener('click', syncToBaidu);
      document.getElementById('syncFromBaiduBtn').addEventListener('click', syncFromBaidu);

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
