import React from 'react';

interface Props {
  iconData: string | null | undefined;
  title: string;
  size?: string;
  className?: string;
}

// 定义7种浅色系背景颜色（不包括黑色，以文字为重点）
const pastelColors = [
  'bg-blue-100 text-blue-700',      // 浅蓝色
  'bg-green-100 text-green-700',    // 浅绿色
  'bg-purple-100 text-purple-700',  // 浅紫色
  'bg-pink-100 text-pink-700',      // 浅粉色
  'bg-orange-100 text-orange-700',  // 浅橙色
  'bg-cyan-100 text-cyan-700',      // 浅青色
  'bg-indigo-100 text-indigo-700',  // 浅靛蓝色
];

// 根据标题生成固定的颜色索引（相同标题始终相同颜色）
const getColorByTitle = (title: string): string => {
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
  const colorClass = getColorByTitle(title);
  const abbr = getTitleAbbr(title);

  // 如果 iconData 为空，显示默认图标
  if (!iconData) {
    return (
      <div className={`${size} ${className} ${colorClass} rounded flex items-center justify-center font-bold text-sm`}>
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
          replacement.className = `${size} ${className} ${colorClass} rounded flex items-center justify-center font-bold text-sm`;
          replacement.textContent = abbr;
          target.parentNode?.insertBefore(replacement, target);
        }}
      />
    );
  }

  return (
    <div className={`${size} ${className} ${colorClass} rounded flex items-center justify-center font-bold text-sm`}>
      {abbr}
    </div>
  );
};

export default IconDisplay;