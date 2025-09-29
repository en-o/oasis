import React from 'react';
import type { NavItem } from '@/types';
import IconDisplay from '../IconDisplay';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';

interface Props {
  items: NavItem[];
  onNavigate: (item: NavItem) => void;
  accountMap: Record<number, boolean>;
  onToggleAccount: (id: number) => void;
}

const NavGrid: React.FC<Props> = ({ items, onNavigate, accountMap, onToggleAccount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/30 hover:bg-white/95"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <IconDisplay
                iconData={item.icon}
                title={item.name}
                size="w-10 h-10"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 truncate">{item.categoryName}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate(item)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="访问网站"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {item.remark && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.remark}</p>
          )}

          {item.accountInfo && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">账户信息</span>
                <button
                  onClick={() => onToggleAccount(item.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {accountMap[item.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {accountMap[item.id] && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs">
                    <span className="text-gray-500">账号：</span>
                    <span className="font-mono">{item.accountInfo.account}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">密码：</span>
                    <span className="font-mono">{item.accountInfo.password}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavGrid;