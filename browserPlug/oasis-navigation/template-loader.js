/**
 * 模板加载器 - 负责加载和注入 HTML 模板
 */

// 模板配置
const templates = [
  { id: 'search-template', file: 'templates/search-section.html', target: '.container' },
  { id: 'nav-template', file: 'templates/nav-section.html', target: '.container' },
  { id: 'toolbar-template', file: 'templates/toolbar.html', target: 'body' },
  { id: 'modal-template', file: 'templates/modal.html', target: 'body' }
];

/**
 * 加载单个模板
 * @param {Object} template - 模板配置对象
 * @returns {Promise<void>}
 */
async function loadTemplate(template) {
  try {
    const response = await fetch(template.file);
    if (!response.ok) {
      throw new Error(`Failed to load ${template.file}: ${response.statusText}`);
    }
    const html = await response.text();

    // 创建临时容器
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // 获取目标容器
    const targetElement = document.querySelector(template.target);
    if (!targetElement) {
      throw new Error(`Target element "${template.target}" not found`);
    }

    // 将模板内容追加到目标容器
    while (tempDiv.firstChild) {
      targetElement.appendChild(tempDiv.firstChild);
    }

    console.log(`✅ Template loaded: ${template.file}`);
  } catch (error) {
    console.error(`❌ Error loading template ${template.file}:`, error);
    throw error;
  }
}

/**
 * 加载所有模板
 * @returns {Promise<void>}
 */
async function loadAllTemplates() {
  console.log('📦 Loading templates...');
  try {
    // 串行加载模板，确保顺序正确
    for (const template of templates) {
      await loadTemplate(template);
    }
    console.log('✅ All templates loaded successfully');

    // 触发自定义事件，通知模板加载完成
    const event = new CustomEvent('templatesLoaded');
    document.dispatchEvent(event);
  } catch (error) {
    console.error('❌ Failed to load templates:', error);
    throw error;
  }
}

// 导出加载函数（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadAllTemplates, loadTemplate };
}
