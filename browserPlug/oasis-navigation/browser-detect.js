/**
 * 浏览器检测脚本
 * 必须最先加载，用于检测Chrome浏览器并添加body类
 * 避免搜索引擎选择框闪现和布局错乱
 */

(function() {
  'use strict';

  // 检测是否为Chrome浏览器（排除Firefox和Edge）
  // 只有Chrome才使用Chrome Search API，Edge和Firefox使用自定义搜索引擎
  const isChrome = (function() {
    if (navigator.userAgent.includes('Firefox')) return false;
    if (navigator.userAgent.includes('Edg')) return false; // 排除Edge浏览器
    return typeof chrome !== 'undefined' && !!chrome.runtime;
  })();

  if (isChrome) {
    // 立即添加到html元素
    document.documentElement.classList.add('chrome-mode');
    console.log('✅ Chrome浏览器检测成功，已添加chrome-mode类');
  } else {
    console.log('🔍 检测到Firefox/Edge浏览器，保留搜索引擎选择功能');
  }
})();
