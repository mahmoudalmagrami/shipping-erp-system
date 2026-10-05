import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  PackagePlus, 
  Send, 
  ListOrdered, 
  Calculator, 
  BookOpen, 
  Menu, 
  LogOut 
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang, setLang } = useAppStore();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useWebSocket();

  const toggleLang = () => setLang(currentLang === 'ar' ? 'en' : 'ar');

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/booking', icon: PackagePlus, label: t('nav.booking') },
    { to: '/dispatch', icon: Send, label: t('nav.dispatch') },
    { to: '/orders', icon: ListOrdered, label: t('nav.orders') },
    { to: '/pricing', icon: Calculator, label: t('nav.pricing') },
    { to: '/ledger', icon: BookOpen, label: t('nav.ledger') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 mx-2">{t('app.title')}</h1>
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{t('app.version')}</span>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button onClick={toggleLang} className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {currentLang === 'ar' ? 'English' : 'عربي'}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
              <button onClick={logout} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title={t('common.logout')}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`fixed inset-y-0 ${currentLang === 'ar' ? 'right-0' : 'left-0'} z-10 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : (currentLang === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mx-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
