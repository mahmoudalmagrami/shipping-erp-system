import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as apiLogin } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { currentLang, setLang } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin({ username, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        toast.error(res.message || t('common.error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setLang(currentLang === 'ar' ? 'en' : 'ar')}
          className="text-white/80 hover:text-white px-4 py-2 rounded-lg backdrop-blur-sm bg-white/10"
        >
          {currentLang === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('app.title')}</h1>
          <p className="text-gray-300">{t('common.login')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">{t('common.username')}</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">{t('common.password')}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 flex justify-center items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? t('common.loading') : (
              <>
                <span>{t('common.login')}</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
