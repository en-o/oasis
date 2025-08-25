import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import './index.css';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
}

const LoginModal: React.FC<Props> = ({ visible, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(username, password);
    if (!ok) alert('用户名或密码错误！');
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">管理员登录</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label">密码</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-0 px-3"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            默认账户: tan / 123
          </div>
          <button type="submit" className="form-button">
            登录
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;