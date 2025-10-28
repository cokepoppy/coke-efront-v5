import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfile, changePassword, getProfile, clearError } from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.title = "个人中心 - eFront 私募基金管理系统";
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      toast.success("个人信息更新成功");
    } catch (error: any) {
      toast.error(error?.message || "更新失败");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("新密码至少需要6个字符");
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      toast.success("密码修改成功");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "密码修改失败");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          个人中心
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理个人信息和账户设置
        </p>
      </div>

      {/* User Info Card */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                {user?.name || 'User'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {user?.email}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>角色: {user?.role || 'User'}</span>
                {user?.createdAt && (
                  <span>加入时间: {format(new Date(user.createdAt), 'yyyy-MM-dd')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-stroke dark:border-strokedark">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              个人信息
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              修改密码
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              编辑个人信息
            </h3>
          </div>
          <div className="p-6.5">
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  姓名 <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  placeholder="请输入姓名"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  邮箱 <span className="text-meta-1">*</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                  placeholder="请输入邮箱"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  手机号
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center rounded bg-primary p-3 px-8 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存更改"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setProfileForm({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                      });
                    }
                  }}
                  className="flex justify-center rounded border border-stroke p-3 px-8 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  重置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              修改密码
            </h3>
          </div>
          <div className="p-6.5">
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  当前密码 <span className="text-meta-1">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  placeholder="请输入当前密码"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  新密码 <span className="text-meta-1">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  placeholder="请输入新密码（至少6个字符）"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  确认新密码 <span className="text-meta-1">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  placeholder="请再次输入新密码"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-4 rounded-lg border border-warning bg-warning/10 p-4">
                <h4 className="mb-2 text-sm font-semibold text-warning">密码安全提示：</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>密码长度至少6个字符</li>
                  <li>建议使用字母、数字和特殊字符的组合</li>
                  <li>不要使用过于简单或常见的密码</li>
                  <li>定期更换密码以保护账户安全</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center rounded bg-primary p-3 px-8 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? "修改中..." : "修改密码"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex justify-center rounded border border-stroke p-3 px-8 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  清空
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-6">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            账户信息
          </h3>
        </div>
        <div className="p-6.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">用户ID</p>
              <p className="font-medium text-black dark:text-white">{user?.id || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">角色</p>
              <p className="font-medium text-black dark:text-white">{user?.role || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">账户状态</p>
              <span className="inline-flex rounded-full bg-success px-3 py-1 text-sm font-medium text-white">
                活跃
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">创建时间</p>
              <p className="font-medium text-black dark:text-white">
                {user?.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最后更新</p>
              <p className="font-medium text-black dark:text-white">
                {user?.updatedAt ? format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
