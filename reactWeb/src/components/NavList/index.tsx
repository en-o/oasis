import React from 'react';
import { Tag, Space } from 'antd';
import type { NavItem } from '@/types';
import IconDisplay from '../IconDisplay';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';
import './NavList.css';

interface Props {
  items: NavItem[];
  accountMap: Record<number, boolean>;
  accountDataMap: Record<number, { account: string; password: string }>;
  onToggleAccount: (id: number) => void;
  jumpMethod: 'newTab' | 'currentTab';
}

const NavList: React.FC<Props> = ({ items, accountMap, accountDataMap, onToggleAccount, jumpMethod }) => {
  const handleItemClick = (item: NavItem) => {
    window.open(item.url, jumpMethod === 'currentTab' ? '_self' : '_blank');
  };

  // 解析分类为数组
  const parseCategories = (categoryStr: string): string[] => {
    if (!categoryStr) return [];
    return categoryStr.split(',').map(c => c.trim()).filter(c => c);
  };

  return (
    <div className="nav-list">
      {items.map((item) => {
        const categories = parseCategories(item.category);

        return (
          <div key={item.id} className="nav-list-item">
            <div className="nav-list-main">
              <div className="nav-list-info">
                <IconDisplay
                  iconData={item.icon}
                  title={item.name}
                  size="nav-list-icon"
                />
                <div className="nav-list-details">
                  <h3 className="nav-list-title">{item.name}</h3>
                  <div className="nav-list-meta">
                    <Space size={[0, 4]} wrap>
                      {categories.map((category, index) => (
                        <Tag key={index} color="blue">
                          {category}
                        </Tag>
                      ))}
                    </Space>
                    {item.remark && <span className="nav-list-description">{item.remark}</span>}
                  </div>
                </div>
              </div>

            <div className="nav-list-actions">
              {item.hasAccount && (
                <button
                  onClick={() => onToggleAccount(item.id)}
                  className="nav-list-button"
                  title={`${accountMap[item.id] ? '隐藏' : '显示'}账户信息${!item.lookAccount ? ' (需密钥)' : ''}`}
                >
                  {accountMap[item.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {!item.lookAccount && <span className="ml-1">🔒</span>}
                </button>
              )}
              <button
                onClick={() => handleItemClick(item)}
                className="nav-list-link-button"
                title="访问网站"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {item.hasAccount && accountMap[item.id] && accountDataMap[item.id] && (
            <div className="nav-list-account">
              <div className="nav-list-account-grid">
                <div className="nav-list-account-item">
                  <div className="nav-list-account-key">账号</div>
                  <div className="nav-list-account-value">{accountDataMap[item.id].account}</div>
                </div>
                <div className="nav-list-account-item">
                  <div className="nav-list-account-key">密码</div>
                  <div className="nav-list-account-value">{accountDataMap[item.id].password}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default NavList;