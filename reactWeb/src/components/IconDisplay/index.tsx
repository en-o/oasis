import React from 'react';

interface Props {
  iconData: string | null | undefined;
  title: string;
  size?: string;
  className?: string;
}

// 定义7种浅色系背景颜色（不包括黑色，以文字为重点）
const pastelColors = [
  { bg: '#DBEAFE', text: '#1D4ED8' },  // 浅蓝色
  { bg: '#D1FAE5', text: '#047857' },  // 浅绿色
  { bg: '#E9D5FF', text: '#7C3AED' },  // 浅紫色
  { bg: '#FCE7F3', text: '#BE185D' },  // 浅粉色
  { bg: '#FED7AA', text: '#C2410C' },  // 浅橙色
  { bg: '#CFFAFE', text: '#0E7490' },  // 浅青色
  { bg: '#E0E7FF', text: '#4338CA' },  // 浅靛蓝色
];

// 根据标题生成固定的颜色索引（相同标题始终相同颜色）
const getColorByTitle = (title: string): { bg: string; text: string } => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
};

// 获取标题的前两个字符
const getTitleAbbr = (title: string): string => {
  if (!title) return '';
  // 移除空格后取前两个字符
  const trimmed = title.trim();
  return trimmed.length >= 2 ? trimmed.slice(0, 2).toUpperCase() : trimmed.toUpperCase();
};

const IconDisplay: React.FC<Props> = ({ iconData, title, size = 'w-6 h-6', className = '' }) => {
  const color = getColorByTitle(title);
  const abbr = getTitleAbbr(title);

  // 如果 iconData 为空，显示默认图标
  if (!iconData) {
    return (
      <div
        className={`${size} ${className} rounded flex items-center justify-center font-bold text-sm`}
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {abbr}
      </div>
    );
  }

  if (iconData.startsWith('data:image/')) {
    return (
      <img
        src={iconData}
        alt={title}
        className={`${size} ${className}`}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  if (iconData.startsWith('http')) {
    return (
      <img
        src={iconData}
        alt={title}
        className={`${size} ${className}`}
        style={{ objectFit: 'cover' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          // 创建替代元素
          const replacement = document.createElement('div');
          replacement.className = `${size} ${className} rounded flex items-center justify-center font-bold text-sm`;
          replacement.style.backgroundColor = color.bg;
          replacement.style.color = color.text;
          replacement.textContent = abbr;
          target.parentNode?.insertBefore(replacement, target);
        }}
      />
    );
  }

  return (
    <div
      className={`${size} ${className} rounded flex items-center justify-center font-bold text-sm`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {abbr}
    </div>
  );
};

export default IconDisplay;