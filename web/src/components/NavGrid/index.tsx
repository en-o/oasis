import React from 'react';
import IconDisplay from '@/components/IconDisplay';
import { ExternalLink } from 'lucide-react';
import type { NavItem } from '@/types';
import './index.css';

interface Props {
  items: NavItem[];
  onNavigate: (item: NavItem) => void;
  accountMap: Record<number, boolean>;
  onToggleAccount: (id: number) => void;
}

const NavGrid: React.FC<Props> = ({
  items,
  onNavigate,
  accountMap,
  onToggleAccount,
}) => (
  <div className="grid-container">
    {items.map((item) => (
      <div
        key={item.id}
        className="grid-item"
        onClick={() => onNavigate(item)}
      >
        <div className="grid-item-content">
          <IconDisplay iconData={item.icon} title={item.name} size="w-12 h-12" />
          <div className="grid-item-info">
            <h3 className="grid-item-title">{item.name}</h3>
            <p className="grid-item-description">{item.remark}</p>
            <span className="grid-item-category">{item.category}</span>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-400 external-link-icon" />
        </div>

        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAccount(item.id);
            }}
            className="account-info-toggle"
          >
            查看账户信息
          </button>
          {accountMap[item.id] && item.accountInfo?.account && (
            <div className="account-info-content">
              <div>账户：{item.accountInfo.account}</div>
              <div>密码：{item.accountInfo.password}</div>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default NavGrid;