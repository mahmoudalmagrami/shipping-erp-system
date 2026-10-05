import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as apiLogin } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { getDefaultRouteForRole } from '../components/ProtectedRoute';
import toast from 'react-hot-toast';
import { LogIn, ShieldCheck, User, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { currentLang, setLang } = useAppStore();
  
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin({ username, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast.success(`مرحباً بك، ${res.data.user.fullName || res.data.user.username}`);
        const destination = getDefaultRouteForRole(res.data.user.role);
        navigate(destination, { replace: true });
      } else {
        toast.error(res.message || t('common.error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في بيانات تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-cairo">
      {/* Background glowing effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={() => setLang(currentLang === 'ar' ? 'en' : 'ar')}
          className="text-white/80 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-xs font-semibold backdrop-blur-md transition-colors"
        >
          {currentLang === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/60 shadow-2xl z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">نظام إدارة الشحن والترحيل المالي</h1>
          <p className="text-sm text-slate-400">بوابة الدخول الموحدة حسب الأدوار والصلاحيات</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">اسم المستخدم</label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 flex justify-center items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 mt-2"
          >
            {loading ? 'جاري التحقق...' : (
              <>
                <span>تسجيل الدخول</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <p className="text-[11px] font-bold text-slate-400 mb-2.5 text-center">أزرار سريعة للاختبار حسب الدور الوظيفي:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickLogin('cashier', 'cashier123')}
              className="p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-slate-600/50 text-amber-400 text-right transition-colors"
            >
              <span className="font-bold block text-amber-300">الكاشير (الاستقبال)</span>
              <span className="text-[10px] text-slate-400">ينقله لصفحة: حجز الشحنة</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('warehouse', 'wh123')}
              className="p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-slate-600/50 text-blue-400 text-right transition-colors"
            >
              <span className="font-bold block text-blue-300">مسؤول المستودع</span>
              <span className="text-[10px] text-slate-400">ينقله لصفحة: الترحيل</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('accountant', 'acc123')}
              className="p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-slate-600/50 text-emerald-400 text-right transition-colors"
            >
              <span className="font-bold block text-emerald-300">المحاسب المالي</span>
              <span className="text-[10px] text-slate-400">ينقله لصفحة: دفتر الأستاذ</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin', 'admin123')}
              className="p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-slate-600/50 text-purple-400 text-right transition-colors"
            >
              <span className="font-bold block text-purple-300">المدير العام</span>
              <span className="text-[10px] text-slate-400">ينقله لصفحة: لوحة القيادة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
