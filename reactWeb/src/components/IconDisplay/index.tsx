import React from 'react';

interface Props {
  iconData: string;
  title: string;
  size?: string;
  className?: string;
}

const IconDisplay: React.FC<Props> = ({ iconData, title, size = 'w-6 h-6', className = '' }) => {
  if (iconData.startsWith('data:image/')) {
    return (
      <img
        src={iconData}
        alt={title}
        className={`${size} ${className}`}
      />
    );
  }

  if (iconData.startsWith('http')) {
    return (
      <img
        src={iconData}
        alt={title}
        className={`${size} ${className}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
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