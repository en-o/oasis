// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addToNavigation',
    title: '添加到导航助手',
    contexts: ['page']
  });
  console.log('✅ 右键菜单已创建');
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToNavigation') {
    // 获取当前页面的 URL 和标题
    const url = info.pageUrl || tab.url;
    const title = tab.title;
    // 获取 favicon URL
    const faviconUrl = tab.favIconUrl || '';

    console.log('右键菜单被点击:', { url, title, faviconUrl });

    // 发送消息到新标签页，通知打开管理页面并预填数据
    chrome.tabs.query({ url: chrome.runtime.getURL('index.html') }, (tabs) => {
      if (tabs.length > 0) {
        // 如果新标签页已打开，发送消息到该页面
        console.log('发送消息到已打开的标签页:', tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'addSiteFromContext',
          url: url,
          name: title,
          faviconUrl: faviconUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('发送消息失败:', chrome.runtime.lastError);
            // 如果发送失败，尝试存储方式
            chrome.storage.local.set({
              pendingAddSite: {
                url: url,
                name: title,
                faviconUrl: faviconUrl,
                timestamp: Date.now()
              }
            });
          } else {
            console.log('消息发送成功:', response);
          }
        });
        // 切换到该标签页
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        // 如果新标签页未打开，先存储数据，打开新标签页后会读取
        console.log('存储待添加网站数据，准备打开新标签页');
        chrome.storage.local.set({
          pendingAddSite: {
            url: url,
            name: title,
            faviconUrl: faviconUrl,
            timestamp: Date.now()
          }
        }, () => {
          console.log('数据已存储');
          // 打开新标签页
          chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
        });
      }
    });
  }
});

// 监听来自页面的下载请求（用于百度网盘同步，绕过CORS限制）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadFile') {
    console.log('收到下载请求:', request.url);

    // 在后台脚本中下载文件，不受CORS限制
    fetch(request.url, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`下载失败: HTTP ${response.status}`);
        }
        return response.text();
      })
      .then(content => {
        console.log('下载成功，文件大小:', content.length);
        sendResponse({ success: true, content: content });
      })
      .catch(error => {
        console.error('下载失败:', error);
        sendResponse({ success: false, error: error.message });
      });

    // 返回true表示异步响应
    return true;
  }
});
