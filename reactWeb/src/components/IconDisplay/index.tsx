import React from 'react';

interface Props {
  iconData: string | null | undefined;
  title: string;
  size?: string;
  className?: string;
}

const IconDisplay: React.FC<Props> = ({ iconData, title, size = 'w-6 h-6', className = '' }) => {
  // 如果 iconData 为空，显示默认图标
  if (!iconData) {
    return (
      <div className={`${size} ${className} bg-blue-500 rounded flex items-center justify-center text-white font-bold`}>
        {title.charAt(0).toUpperCase()}
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
          replacement.className = `${size} ${className} bg-blue-500 rounded flex items-center justify-center text-white font-bold`;
          replacement.textContent = title.charAt(0).toUpperCase();
          target.parentNode?.insertBefore(replacement, target);
        }}
      />
    );
  }

  return (
    <div className={`${size} ${className} bg-blue-500 rounded flex items-center justify-center text-white font-bold`}>
      {title.charAt(0).toUpperCase()}
    </div>
  );
};

export default IconDisplay;