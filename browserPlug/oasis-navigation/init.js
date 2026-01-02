/**
 * 初始化脚本 - 处理模板加载和应用启动
 * 符合浏览器插件的 Content Security Policy (CSP)
 */

// 等待模板加载完成后再初始化应用
document.addEventListener('templatesLoaded', function() {
  console.log('🚀 Templates loaded, initializing app...');

  // 显示页面（移除加载状态）
  document.body.classList.add('loaded');

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
