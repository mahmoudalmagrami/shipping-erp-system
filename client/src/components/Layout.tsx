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
  LogOut,
  UserCheck,
  Users,
  Truck,
  FileSpreadsheet,
  UserCog
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang, setLang } = useAppStore();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useWebSocket();

  const toggleLang = () => setLang(currentLang === 'ar' ? 'en' : 'ar');

  const role = user?.role || 'admin';

  // تحديد القوائم المتاحة لكل دور بدقة
  const allNavItems = [
    { 
      to: '/dashboard', 
      icon: LayoutDashboard, 
      label: t('nav.dashboard'),
      roles: ['admin', 'accountant'] 
    },
    { 
      to: '/booking', 
      icon: PackagePlus, 
      label: t('nav.booking'),
      roles: ['admin', 'cashier'] 
    },
    { 
      to: '/dispatch', 
      icon: Send, 
      label: t('nav.dispatch'),
      roles: ['admin', 'warehouse'] 
    },
    { 
      to: '/orders', 
      icon: ListOrdered, 
      label: t('nav.orders'),
      roles: ['admin', 'cashier', 'warehouse', 'accountant'] 
    },
    { 
      to: '/customers', 
      icon: Users, 
      label: t('nav.customers'),
      roles: ['admin', 'cashier', 'accountant'] 
    },
    { 
      to: '/carriers', 
      icon: Truck, 
      label: t('nav.carriers'),
      roles: ['admin', 'warehouse', 'accountant'] 
    },
    { 
      to: '/pricing', 
      icon: Calculator, 
      label: t('nav.pricing'),
      roles: ['admin', 'cashier'] 
    },
    { 
      to: '/ledger', 
      icon: BookOpen, 
      label: t('nav.ledger'),
      roles: ['admin', 'accountant'] 
    },
    { 
      to: '/reports', 
      icon: FileSpreadsheet, 
      label: t('nav.reports'),
      roles: ['admin', 'accountant'] 
    },
    { 
      to: '/users', 
      icon: UserCog, 
      label: t('nav.users'),
      roles: ['admin'] 
    },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const roleBadgeColor = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    cashier: 'bg-amber-100 text-amber-800 border-amber-200',
    warehouse: 'bg-blue-100 text-blue-800 border-blue-200',
    accountant: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }[role] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-cairo">
      <header className="bg-white border-b border-slate-200 z-20 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{t('app.title')}</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                v2.0 Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang} 
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {currentLang === 'ar' ? 'English' : 'عربي'}
            </button>

            <div className="flex items-center gap-3 pl-2 pr-2 py-1 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.fullName || user?.name || user?.username}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {user?.username}
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
                {t(`roles.${role}`)}
              </span>
              <button 
                onClick={logout} 
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1" 
                title={t('common.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`fixed inset-y-0 ${currentLang === 'ar' ? 'right-0' : 'left-0'} z-10 w-64 bg-white border-l border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : (currentLang === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between`}>
          <div className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              القوائم المصرح بها ({t(`roles.${role}`)})
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4 mx-2.5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            نظام الشحن والترحيل المالي المتكامل
          </div>
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-0 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
