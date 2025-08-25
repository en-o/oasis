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

const NavList: React.FC<Props> = ({
  items,
  onNavigate,
  accountMap,
  onToggleAccount,
}) => (
  <div className="list-container">
    {items.map((item) => (
      <div
        key={item.id}
        className="list-item"
        onClick={() => onNavigate(item)}
      >
        <IconDisplay iconData={item.icon} title={item.name} size="w-10 h-10" />
        <div className="list-item-info">
          <h3 className="list-item-title">{item.name}</h3>
          <p className="list-item-description">{item.remark}</p>
        </div>
        <span className="list-item-category">{item.category}</span>
        <ExternalLink className="w-5 h-5 text-gray-400 external-link-icon" />

        <div className="flex-shrink-0">
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

export default NavList;