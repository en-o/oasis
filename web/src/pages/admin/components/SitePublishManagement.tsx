import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { sitePublishApi } from '@/apis';
import type { SitePublish } from '@/types';

const SitePublishManagement: React.FC = () => {
  const [configs, setConfigs] = useState<SitePublish[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SitePublish | null>(null);
  const [formData, setFormData] = useState<Partial<SitePublish>>({
    name: '',
    routePath: '',
    showPlatform: undefined,
    hideAdminEntry: false,
    enabled: true,
    sort: 1,
    description: '',
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await sitePublishApi.list();
      setConfigs(data);
    } catch (error) {
      console.error('加载配置失败:', error);
      alert('加载配置失败');
    }
  };

  const handleAdd = () => {
    setEditingConfig(null);
    setFormData({
      name: '',
      routePath: '',
      showPlatform: undefined,
      hideAdminEntry: false,
      enabled: true,
      sort: 1,
      description: '',
    });
    setShowModal(true);
  };

  const handleEdit = (config: SitePublish) => {
    setEditingConfig(config);
    setFormData(config);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
      await sitePublishApi.remove(id);
      alert('删除成功');
      loadConfigs();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingConfig?.id) {
        await sitePublishApi.update({ ...formData, id: editingConfig.id } as any);
        alert('更新成功');
      } else {
        await sitePublishApi.add(formData as any);
        alert('添加成功');
      }
      setShowModal(false);
      loadConfigs();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">页面发布配置</h2>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>新增配置</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                路由路径
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                平台类型
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                隐藏管理入口
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                排序
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{config.name}</td>
                <td className="px-4 py-3 text-sm font-mono">{config.routePath}</td>
                <td className="px-4 py-3 text-sm">
                  {config.showPlatform !== undefined && config.showPlatform !== null
                    ? config.showPlatform
                    : '不过滤'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {config.hideAdminEntry ? '是' : '否'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      config.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {config.enabled ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{config.sort}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => config.id && handleDelete(config.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingConfig ? '编辑配置' : '新增配置'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">配置名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="如：开发运维主页"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">路由路径 *</label>
                <input
                  type="text"
                  required
                  value={formData.routePath}
                  onChange={(e) =>
                    setFormData({ ...formData, routePath: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  placeholder="如：/site, /dev, /cp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  平台类型（showPlatform）
                </label>
                <input
                  type="number"
                  value={formData.showPlatform ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      showPlatform: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="留空表示不过滤，0:dev, 1:cp"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hideAdminEntry}
                    onChange={(e) =>
                      setFormData({ ...formData, hideAdminEntry: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">隐藏管理入口</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, enabled: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">启用</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">排序</label>
                <input
                  type="number"
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({ ...formData, sort: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="配置说明"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingConfig ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitePublishManagement;
