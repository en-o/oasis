// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

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

document.getElementById('openOptions').addEventListener('click', () => {
  browserAPI.runtime.openOptionsPage();
  window.close();
});
