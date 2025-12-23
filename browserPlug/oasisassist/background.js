// 兼容Chrome和Firefox的API
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 创建右键菜单
browserAPI.runtime.onInstalled.addListener(() => {
  browserAPI.contextMenus.create({
    id: 'addToOasis',
    title: '添加到Oasis导航',
    contexts: ['page', 'link', 'selection']
  });
});

// 处理右键菜单点击事件
browserAPI.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToOasis') {
    // 获取页面信息
    const pageInfo = {
      name: tab.title || '',
      url: info.linkUrl || tab.url || '',
      selectedText: info.selectionText || '',
      pageUrl: tab.url || '',
      pageTitle: tab.title || ''
    };

    // 打开添加页面
    const width = 600;
    const height = 800;

    browserAPI.windows.create({
      url: browserAPI.runtime.getURL('add.html'),
      type: 'popup',
      width: width,
      height: height,
      focused: true
    }, (window) => {
      // 存储页面信息，供add.html读取
      browserAPI.storage.local.set({
        pendingNavigation: pageInfo
      });
    });
  }
});

// 监听来自popup或add页面的消息
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    // 获取当前活动标签页信息
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          name: tabs[0].title || '',
          url: tabs[0].url || '',
          pageTitle: tabs[0].title || '',
          pageUrl: tabs[0].url || ''
        });
      }
    });
    return true; // 保持消息通道开放
  }
});
