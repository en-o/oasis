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

const NavList: React.FC<Props> = ({ items, onNavigate, accountMap, onToggleAccount }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/30 hover:bg-white/95 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <IconDisplay
                iconData={item.icon}
                title={item.name}
                size="w-8 h-8"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{item.categoryName}</span>
                  {item.remark && <span className="truncate">{item.remark}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {item.accountInfo && (
                <button
                  onClick={() => onToggleAccount(item.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title={accountMap[item.id] ? '隐藏账户信息' : '显示账户信息'}
                >
                  {accountMap[item.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => onNavigate(item)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                title="访问网站"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {item.accountInfo && accountMap[item.id] && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">账号：</span>
                  <span className="font-mono ml-1">{item.accountInfo.account}</span>
                </div>
                <div>
                  <span className="text-gray-500">密码：</span>
                  <span className="font-mono ml-1">{item.accountInfo.password}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavList;