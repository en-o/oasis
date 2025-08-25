import React from 'react';
import IconDisplay from '@/components/IconDisplay';
import { getIconType } from '@/utils/icon';
import { useNavigation } from '@/hooks/useNavigation';

const SystemManagement: React.FC = () => {
  const { systemConfig, setSystemConfig } = useNavigation();

  const update = <K extends keyof typeof systemConfig>(
    key: K,
    value: (typeof systemConfig)[K]
  ) => {
    setSystemConfig((s) => ({ ...s, [key]: value }));
  };

  const updateUser = <K extends keyof typeof systemConfig.user>(
    key: K,
    value: (typeof systemConfig.user)[K]
  ) => {
    setSystemConfig((s) => ({
      ...s,
      user: { ...s.user, [key]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">网站信息管理</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">网站标题</label>
            <input
              type="text"
              className="form-input"
              value={systemConfig.siteTitle}
              onChange={(e) => update('siteTitle', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">网站Logo</label>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                当前类型:{' '}
                <span className="font-medium">
                  {(() => {
                    const type = getIconType(systemConfig.siteLogo);
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
                  iconData={systemConfig.siteLogo}
                  title={systemConfig.siteTitle}
                  size="w-10 h-10"
                />
              </div>
              <textarea
                className="form-textarea"
                rows={3}
                value={systemConfig.siteLogo}
                onChange={(e) => update('siteLogo', e.target.value)}
                placeholder="请输入Logo地址或Base64编码..."
              />
              <div className="text-xs text-gray-500">
                支持HTTP链接或Base64编码，留空将使用网站标题前两字作为默认Logo
              </div>
            </div>
          </div>
          <div>
            <label className="form-label">默认跳转方式</label>
            <select
              className="form-select"
              value={systemConfig.defaultOpenMode}
              onChange={(e) =>
                update('defaultOpenMode', e.target.value as 'newTab' | 'currentTab')
              }
            >
              <option value="newTab">新标签页</option>
              <option value="currentTab">当前标签页</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hideAdmin"
              checked={systemConfig.hideAdminEntry}
              onChange={(e) => update('hideAdminEntry', e.target.checked)}
            />
            <label htmlFor="hideAdmin" className="text-sm font-medium">
              隐藏管理后台入口
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">用户管理</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={systemConfig.user.username}
              onChange={(e) => updateUser('username', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              value={systemConfig.user.password}
              onChange={(e) => updateUser('password', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;