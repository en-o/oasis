import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import IconDisplay from '@/components/IconDisplay';
import NavFormModal from '@/components/NavFormModal';
import { useNavigation } from '@/hooks/useNavigation';
import type { NavItem } from '@/types';

const NavManagement: React.FC = () => {
  const { navItems, setNavItems, categories } = useNavigation();
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<Omit<NavItem, 'id'>>({
    order: 0,
    name: '',
    url: '',
    sort: 0,
    category: '',
    icon: '',
    remark: '',
    accountInfo: { account: '', password: '' },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      order: 0,
      name: '',
      url: '',
      sort: 0,
      category: '',
      icon: '',
      remark: '',
      accountInfo: { account: '', password: '' },
    });
    setShow(true);
  };

  const openEdit = (item: NavItem) => {
    setEditing(item);
    setForm(item);
    setShow(true);
  };

  const handleSave = () => {
    if (editing) {
      setNavItems(navItems.map((i) => (i.id === editing.id ? { ...form, id: editing.id } : i)));
    } else {
      const newId = Math.max(...navItems.map((i) => i.id), 0) + 1;
      setNavItems([...navItems, { ...form, id: newId } as NavItem]);
    }
    setShow(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个导航项吗？')) {
      setNavItems(navItems.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">导航页面管理</h2>
        <button
          onClick={openAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>添加导航</span>
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>名称</th>
              <th>网址</th>
              <th>分类</th>
              <th>排序</th>
              <th>账户信息</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {navItems.map((item) => (
              <tr key={item.id}>
                <td>{item.order}</td>
                <td>
                  <div className="flex items-center space-x-3">
                    <IconDisplay iconData={item.icon} title={item.name} size="w-8 h-8" />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="max-w-xs truncate">{item.url}</td>
                <td>{item.category}</td>
                <td>{item.sort}</td>
                <td className="text-sm text-gray-600">
                  {item.accountInfo?.account && item.accountInfo.password ? (
                    <div>
                      <div>账户：{item.accountInfo.account}</div>
                      <div>密码：{item.accountInfo.password}</div>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
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

      <NavFormModal
        visible={show}
        editing={editing}
        data={form}
        categories={categories}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onSave={handleSave}
        onClose={() => setShow(false)}
      />
    </div>
  );
};

export default NavManagement;