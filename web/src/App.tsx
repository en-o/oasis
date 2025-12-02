import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavigationPage from '@/pages/navigation';
import AdminPage from '@/pages/admin';

function App() {
  const [view, setView] = useState<'nav' | 'admin'>('nav');

  return (
    <BrowserRouter>
      <Routes>
        {/* 管理后台路由 */}
        <Route
          path="/admin"
          element={
            view === 'admin' ? (
              <AdminPage onExit={() => setView('nav')} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 动态路由：支持任意路径 */}
        <Route
          path="*"
          element={
            view === 'nav' ? (
              <NavigationPage onEnterAdmin={() => setView('admin')} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
