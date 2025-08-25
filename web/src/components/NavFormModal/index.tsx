import React from 'react';
import { X } from 'lucide-react';
import IconDisplay from '@/components/IconDisplay';
import { getIconType } from '@/utils/icon';
import type { NavItem } from '@/types';
import './index.css';

interface Props {
  visible: boolean;
  editing: NavItem | null;
  data: Omit<NavItem, 'id'>;
  categories: string[];
  onChange: <K extends keyof Omit<NavItem, 'id'>>(
    key: K,
    value: Omit<NavItem, 'id'>[K]
  ) => void;
  onSave: () => void;
  onClose: () => void;
}

const NavFormModal: React.FC<Props> = ({
  visible,
  editing,
  data,
  categories,
  onChange,
  onSave,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="form-container">
      <div className="form-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{editing ? '编辑导航' : '添加导航'}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="form-group">
          <div>
            <label className="form-label">名称</label>
            <input
              type="text"
              className="form-input"
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">网址</label>
            <input
              type="url"
              className="form-input"
              value={data.url}
              onChange={(e) => onChange('url', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">分类</label>
            <select
              className="form-select"
              value={data.category}
              onChange={(e) => onChange('category', e.target.value)}
            >
              <option value="">请选择分类</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">排序</label>
            <input
              type="number"
              className="form-input"
              value={data.sort}
              onChange={(e) => onChange('sort', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="form-label">图标</label>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                当前类型:{' '}
                <span className="font-medium">
                  {(() => {
                    const type = getIconType(data.icon);
                    switch (type) {
                      case 'base64':
                        return 'Base64 编码图片';
                      case 'url':
                        return 'HTTP/HTTPS 链接';
                      case 'empty':
                        return '空值 (将显示默认图标)';
                      case 'invalid':
                        return '无效格式';
                      default:
                        return '未知';
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-start space-x-4 mb-3">
                <span className="text-sm font-medium mt-2">预览:</span>
                <IconDisplay
                  iconData={data.icon}
                  title={data.name || '示例'}
                  size="w-10 h-10"
                />
              </div>
              <textarea
                className="form-textarea"
                rows={3}
                value={data.icon}
                onChange={(e) => onChange('icon', e.target.value)}
                placeholder="请输入图标地址或Base64编码..."
              />
              <div className="text-xs text-gray-500">
                支持HTTP链接或Base64编码，留空将使用名称前两字作为默认图标
              </div>
            </div>
          </div>
          <div>
            <label className="form-label">备注</label>
            <input
              type="text"
              className="form-input"
              value={data.remark}
              onChange={(e) => onChange('remark', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">账户信息</label>
            <div className="space-y-2">
              <input
                type="text"
                className="form-input"
                placeholder="账户"
                value={data.accountInfo.account}
                onChange={(e) =>
                  onChange('accountInfo', {
                    ...data.accountInfo,
                    account: e.target.value,
                  })
                }
              />
              <input
                type="text"
                className="form-input"
                placeholder="密码"
                value={data.accountInfo.password}
                onChange={(e) =>
                  onChange('accountInfo', {
                    ...data.accountInfo,
                    password: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <button onClick={onSave} className="form-button">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavFormModal;