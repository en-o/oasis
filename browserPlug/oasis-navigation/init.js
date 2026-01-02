/**
 * 初始化脚本 - 处理模板加载和应用启动
 * 符合浏览器插件的 Content Security Policy (CSP)
 */

// 立即执行：检测Chrome并添加body类，避免搜索框闪现
(function() {
  const isChromeBrowser = (() => {
    if (navigator.userAgent.includes('Firefox')) return false;
    if (navigator.userAgent.includes('Edg')) return false;
    return typeof chrome !== 'undefined' && !!chrome.runtime;
  })();

  if (isChromeBrowser) {
    document.documentElement.classList.add('chrome-mode');
    // 如果body已经加载，也添加类
    if (document.body) {
      document.body.classList.add('chrome-mode');
    } else {
      // 否则等待body加载
      document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('chrome-mode');
      });
    }
    console.log('✅ Chrome模式已启用');
  }
})();

// 等待模板加载完成后再初始化应用
document.addEventListener('templatesLoaded', function() {
  console.log('🚀 Templates loaded, initializing app...');

  // Chrome浏览器检测：立即隐藏搜索引擎选择框
  const isChromeBrowser = (() => {
    if (navigator.userAgent.includes('Firefox')) return false;
    if (navigator.userAgent.includes('Edg')) return false;
    return typeof chrome !== 'undefined' && !!chrome.runtime;
  })();

  if (isChromeBrowser) {
    const select = document.getElementById('engineSelect');
    if (select) {
      select.style.display = 'none';
      console.log('✅ Chrome检测：搜索引擎选择框已隐藏');
    }
  }

  // 动态加载主应用脚本
  const script = document.createElement('script');
  script.src = 'app.js';
  document.body.appendChild(script);
});

// 页面加载完成后开始加载模板
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadAllTemplates();
  });
} else {
  loadAllTemplates();
}
