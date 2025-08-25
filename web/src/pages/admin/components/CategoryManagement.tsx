import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import CategoryFormModal from '@/components/CategoryFormModal';
import { useNavigation } from '@/hooks/useNavigation';

const CategoryManagement: React.FC = () => {
  const { categories, setCategories, navItems } = useNavigation();
  const [show, setShow] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState('');

  const openAdd = () => {
    setEditingIndex(null);
    setForm('');
    setShow(true);
  };

  const openEdit = (idx: number) => {
    setEditingIndex(idx);
    setForm(categories[idx]);
    setShow(true);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const arr = [...categories];
      arr[editingIndex] = form;
      setCategories(arr);
    } else {
      setCategories([...categories, form]);
    }
    setShow(false);
  };

  const handleDelete = (idx: number) => {
    if (confirm('确定要删除这个分类吗？相关的导航项将需要重新分类。')) {
      setCategories(categories.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">分类管理</h2>
        <button
          onClick={openAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>添加分类</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{category}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEdit(idx)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {navItems.filter((i) => i.category === category).length} 个导航项
            </p>
          </div>
        ))}
      </div>

      <CategoryFormModal
        visible={show}
        editingIndex={editingIndex}
        value={form}
        onChange={setForm}
        onSave={handleSave}
        onClose={() => setShow(false)}
      />
    </div>
  );
};

export default CategoryManagement;