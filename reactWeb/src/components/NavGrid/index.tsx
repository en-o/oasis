import React from 'react';
import type { NavItem } from '@/types';
import IconDisplay from '../IconDisplay';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';
import './NavGrid.css';

interface Props {
  items: NavItem[];
  onNavigate: (item: NavItem) => void;
  accountMap: Record<number, boolean>;
  onToggleAccount: (id: number) => void;
  jumpMethod: 'newTab' | 'currentTab';
}

const NavGrid: React.FC<Props> = ({ items, onNavigate, accountMap, onToggleAccount, jumpMethod }) => {
  const handleItemClick = (item: NavItem) => {
    window.open(item.url, jumpMethod === 'currentTab' ? '_self' : '_blank');
  };

  return (
    <div className="nav-grid">
      {items.map((item) => (
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
                <span className="nav-grid-category">{item.category}</span>
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

          {item.remark && (
            <p className="nav-grid-description">{item.remark}</p>
          )}

          {item.accountInfo && (
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
              {accountMap[item.id] && (
                <div className="nav-grid-account-info">
                  <div className="nav-grid-account-row">
                    <span className="nav-grid-account-key">账号</span>
                    <span className="nav-grid-account-value">{item.accountInfo.account}</span>
                  </div>
                  <div className="nav-grid-account-row">
                    <span className="nav-grid-account-key">密码</span>
                    <span className="nav-grid-account-value">{item.accountInfo.password}</span>
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