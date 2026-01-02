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
 * 加载单个模板（带重试机制）
 * @param {Object} template - 模板配置对象
 * @param {number} retries - 重试次数
 * @returns {Promise<void>}
 */
async function loadTemplate(template, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
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
      return; // 成功，退出重试循环
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt}/${retries} failed for ${template.file}:`, error.message);

      if (attempt < retries) {
        // 等待一小段时间后重试
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }

  // 所有重试都失败
  console.error(`❌ Error loading template ${template.file} after ${retries} attempts:`, lastError);
  throw lastError;
}

/**
 * 加载所有模板
 * @returns {Promise<void>}
 */
async function loadAllTemplates() {
  console.log('📦 Loading templates...');
  const failures = [];

  try {
    // 串行加载模板，确保顺序正确
    for (const template of templates) {
      try {
        await loadTemplate(template);
      } catch (error) {
        // 记录失败的模板，但继续加载其他模板
        failures.push({ template: template.file, error: error.message });
        console.error(`❌ Failed to load ${template.file}, continuing...`);
      }
    }

    if (failures.length > 0) {
      console.warn(`⚠️ ${failures.length} template(s) failed to load:`, failures);
    } else {
      console.log('✅ All templates loaded successfully');
    }

    // 即使有失败，也触发事件让应用继续初始化
    const event = new CustomEvent('templatesLoaded', {
      detail: { failures }
    });
    document.dispatchEvent(event);
  } catch (error) {
    console.error('❌ Critical error during template loading:', error);
    // 即使发生严重错误，也尝试初始化应用
    const event = new CustomEvent('templatesLoaded', {
      detail: { failures: [{ template: 'unknown', error: error.message }] }
    });
    document.dispatchEvent(event);
  }
}

// 导出加载函数（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadAllTemplates, loadTemplate };
}
