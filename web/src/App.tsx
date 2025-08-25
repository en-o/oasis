// import NavigationSystem from './pages/NavigationSystem';
import { useState } from 'react';
import NavigationPage from '@/pages/navigation';
import AdminPage from '@/pages/admin';

function App() {
   const [view, setView] = useState<'nav' | 'admin'>('nav');

  return view === 'nav' ? (
    <NavigationPage onEnterAdmin={() => setView('admin')} />
  ) : (
    <AdminPage onExit={() => setView('nav')} />
  );
}

export default App;
