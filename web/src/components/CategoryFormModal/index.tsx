import React from 'react';
import { X } from 'lucide-react';
import './index.css';

interface Props {
  visible: boolean;
  editingIndex: number | null;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const CategoryFormModal: React.FC<Props> = ({
  visible,
  editingIndex,
  value,
  onChange,
  onSave,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="form-container">
      <div className="bg-white rounded-xl p-8 w-96 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editingIndex !== null ? '编辑分类' : '添加分类'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="form-group">
          <div>
            <label className="form-label">分类名称</label>
            <input
              type="text"
              className="form-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <button onClick={onSave} className="form-button">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;