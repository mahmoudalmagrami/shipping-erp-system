import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  toggleUserActive, 
  updateUserPassword 
} from '../api/endpoints';
import { User } from '../types';
import { Modal } from '../components/Modal';
import { useDebounce } from '../hooks/useDebounce';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Edit3, 
  KeyRound, 
  UserX, 
  UserCheck2, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: usersResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  const users: User[] = usersResponse?.data || [];

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q))
    );
  });

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'cashier' as User['role'],
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'cashier' as User['role'],
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Open add
  const openAdd = () => {
    setAddForm({
      username: '',
      fullName: '',
      password: '',
      role: 'cashier',
    });
    setIsAddOpen(true);
  };

  // Open edit
  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      role: user.role,
    });
  };

  // Open password reset
  const openPassword = (user: User) => {
    setPasswordUser(user);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
  };

  // Handle Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username.trim() || !addForm.password.trim()) {
      toast.error('يرجى ملء اسم المستخدم وكلمة المرور');
      return;
    }
    if (addForm.password.length < 4) {
      toast.error('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(addForm);
      toast.success('تمت إضافة المستخدم بنجاح');
      setIsAddOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إضافة المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      await updateUser(editingUser.id, editForm);
      toast.success('تم تحديث بيانات المستخدم بنجاح');
      setEditingUser(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تحديث المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (!passwordForm.newPassword) {
      toast.error('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    setSubmitting(true);
    try {
      await updateUserPassword(passwordUser.id, { password: passwordForm.newPassword });
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (user: User) => {
    try {
      const res = await toggleUserActive(user.id);
      const isNowActive = res.data?.isActive;
      toast.success(isNowActive ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تغيير حالة التفعيل');
    }
  };

  const roleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'accountant':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'warehouse':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cashier':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة المستخدمين</h1>
            <p className="text-xs text-slate-500">إدارة حسابات النظام وتعيين الصلاحيات وحالة التفعيل وكلمات المرور</p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم المستخدم أو الاسم الكامل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          إجمالي المستخدمين: <span className="font-bold text-slate-800">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>جاري تحميل بيانات المستخدمين...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-rose-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            <span>حدث خطأ أثناء تحميل المستخدمين. يرجى إعادة المحاولة.</span>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <Users className="w-10 h-10 text-slate-300" />
            <span>لا يوجد مستخدمون مطابقون لمعايير البحث.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">اسم الدخول</th>
                  <th className="py-3 px-4">الدور / الصلاحية</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تاريخ الإنشاء</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isActive = user.isActive !== false;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                            {(user.fullName || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {user.fullName || user.username}
                            </span>
                            <span className="text-[11px] text-slate-400">ID: #{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                        {user.username}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${roleBadgeStyle(user.role)}`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t(`roles.${user.role}`) || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>نشط</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>معطّل</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل البيانات"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPassword(user)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="إعادة تعيين كلمة المرور"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive 
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' 
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="إضافة مستخدم جديد"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اسم المستخدم (للدخول) *
            </label>
            <input
              type="text"
              required
              value={addForm.username}
              onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="مثال: ahmed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={addForm.fullName}
              onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="مثال: أحمد محمد علي"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              كلمة المرور *
            </label>
            <input
              type="password"
              required
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الدور والصلاحية *
            </label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value as User['role'] })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="cashier">كاشير استقبال (حجز شحنات واستعلام أسعار)</option>
              <option value="warehouse">مسؤول مستودع (ترحيل الشحنات والطرود)</option>
              <option value="accountant">محاسب مالي (الدفاتر والتقارير والسندات)</option>
              <option value="admin">المدير العام (كامل الصلاحيات)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'إضافة المستخدم'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`تعديل المستخدم: ${editingUser?.username}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الدور والصلاحية
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as User['role'] })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="cashier">كاشير استقبال (Cashier)</option>
              <option value="warehouse">مسؤول مستودع (Warehouse)</option>
              <option value="accountant">محاسب مالي (Accountant)</option>
              <option value="admin">المدير العام (Admin)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!passwordUser}
        onClose={() => setPasswordUser(null)}
        title={`إعادة تعيين كلمة المرور: ${passwordUser?.username}`}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              كلمة المرور الجديدة *
            </label>
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تأكيد كلمة المرور الجديدة *
            </label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPasswordUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
