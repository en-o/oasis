import React from 'react';
import { getRandomGradient } from '@/utils/icon';
import './index.css';

interface Props {
  iconData: string;
  title: string;
  size?: string;
}

const IconDisplay: React.FC<Props> = ({ iconData, title, size = 'w-12 h-12' }) => {
  const defaultText = title.slice(0, 2).toUpperCase();
  const gradientClass = getRandomGradient(title);

  if (!iconData || iconData.trim() === '') {
    return (
      <div
        className={`icon-fallback ${size} ${gradientClass} ${
          size === 'w-8 h-8'
            ? 'icon-size-sm'
            : size === 'w-10 h-10'
            ? 'icon-size-md'
            : size === 'w-12 h-12'
            ? 'icon-size-lg'
            : 'icon-size-xl'
        }`}
      >
        {defaultText}
      </div>
    );
  }

  return (
    <div className={`icon-container ${size}`}>
      <img
        src={iconData}
        alt={title}
        className={`icon-image ${size}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const next = target.nextElementSibling as HTMLElement;
          if (next) next.style.display = 'flex';
        }}
      />
      <div
        className={`icon-fallback ${size} ${gradientClass} absolute top-0 left-0 ${
          size === 'w-8 h-8'
            ? 'icon-size-sm'
            : size === 'w-10 h-10'
            ? 'icon-size-md'
            : size === 'w-12 h-12'
            ? 'icon-size-lg'
            : 'icon-size-xl'
        }`}
        style={{ display: 'none' }}
      >
        {defaultText}
      </div>
    </div>
  );
};

export default IconDisplay;