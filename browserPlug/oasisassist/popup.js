// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 添加当前页面
document.getElementById('addCurrentPage').addEventListener('click', () => {
  // 获取当前标签页信息并打开添加页面
  browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const pageInfo = {
        name: tabs[0].title || '',
        url: tabs[0].url || '',
        pageTitle: tabs[0].title || '',
        pageUrl: tabs[0].url || ''
      };

      // 存储页面信息
      browserAPI.storage.local.set({
        pendingNavigation: pageInfo
      }, () => {
        // 打开添加页面
        browserAPI.windows.create({
          url: browserAPI.runtime.getURL('add.html'),
          type: 'popup',
          width: 600,
          height: 800,
          focused: true
        });

        // 关闭popup
        window.close();
      });
    }
  });
});

// 打开 Oasis
document.getElementById('openOasis').addEventListener('click', () => {
  // 从配置中获取 Web URL 或 API URL
  browserAPI.storage.sync.get(['webUrl', 'apiUrl'], (result) => {
    // 优先使用 webUrl，如果没有则使用 apiUrl
    const url = result.webUrl || result.apiUrl || 'http://localhost:1249';

    // 打开新标签页
    browserAPI.tabs.create({
      url: url
    });

    // 关闭popup
    window.close();
  });
});

// 打开设置
document.getElementById('openOptions').addEventListener('click', () => {
  browserAPI.runtime.openOptionsPage();
  window.close();
});
