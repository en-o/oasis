import React from 'react';
import { Tag, Space } from 'antd';
import type { NavItem } from '@/types';
import IconDisplay from '../IconDisplay';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';
import './NavGrid.css';

interface Props {
  items: NavItem[];
  accountMap: Record<number, boolean>;
  accountDataMap: Record<number, { account: string; password: string }>;
  onToggleAccount: (id: number) => void;
  jumpMethod: 'newTab' | 'currentTab';
}

const NavGrid: React.FC<Props> = ({ items, accountMap, accountDataMap, onToggleAccount, jumpMethod }) => {
  const handleItemClick = (item: NavItem) => {
    window.open(item.url, jumpMethod === 'currentTab' ? '_self' : '_blank');
  };

  // 解析分类为数组
  const parseCategories = (categoryStr: string): string[] => {
    if (!categoryStr) return [];
    return categoryStr.split(',').map(c => c.trim()).filter(c => c);
  };

  return (
    <div className="nav-grid">
      {items.map((item) => {
        const categories = parseCategories(item.category);

        return (
          <div key={item.id} className="nav-grid-item">
            <div className="nav-grid-header">
              <div className="nav-grid-info">
                <IconDisplay
                  iconData={item.icon}
                  title={item.name}
                  size="nav-grid-icon"
                />
                <div className="nav-grid-details">
                  <h3 className="nav-grid-title">{item.name}</h3>
                  <div className="mt-1">
                    <Space size={[0, 4]} wrap>
                      {categories.map((category, index) => (
                        <Tag key={index} color="blue">
                          {category}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleItemClick(item)}
                className="nav-grid-link-button"
                title="访问网站"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          {item.hasAccount ? (
            <>
              {item.remark && (
                <p className="nav-grid-description">{item.remark}</p>
              )}
              <div className="nav-grid-account">
                <div className="nav-grid-account-header">
                  <span className="nav-grid-account-label">
                    账户信息 {!item.lookAccount && '🔒'}
                  </span>
                  <button
                    onClick={() => onToggleAccount(item.id)}
                    className="nav-grid-account-toggle"
                  >
                    {accountMap[item.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {accountMap[item.id] && accountDataMap[item.id] && (
                  <div className="nav-grid-account-info">
                    <div className="nav-grid-account-row">
                      <span className="nav-grid-account-key">账号</span>
                      <span className="nav-grid-account-value">{accountDataMap[item.id].account}</span>
                    </div>
                    <div className="nav-grid-account-row">
                      <span className="nav-grid-account-key">密码</span>
                      <span className="nav-grid-account-value">{accountDataMap[item.id].password}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            item.remark && (
              <div className="nav-grid-description-only">
                <p className="nav-grid-description">{item.remark}</p>
              </div>
            )
          )}
        </div>
        );
      })}
    </div>
  );
};

export default NavGrid;