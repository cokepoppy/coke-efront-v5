import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfile, changePassword, getProfile, clearError } from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    document.title = "个人中心 - eFront 私募基金管理系统";
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件");
      return;
    }

    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error("图片大小不能超过2MB");
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;

    setUploadingAvatar(true);
    try {
      // 在实际应用中，这里应该上传到服务器
      // 现在我们直接更新到profile中
      await dispatch(updateProfile({ avatarUrl: avatarPreview })).unwrap();
      toast.success("头像更新成功");
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error?.message || "头像更新失败");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <div className="relative group">
              {user?.avatarUrl || avatarPreview ? (
                <img
                  src={avatarPreview || user?.avatarUrl}
                  alt="User Avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-opacity-90 transition-all"
                title="更换头像"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.email || 'User'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {user?.email}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>角色: {user?.role?.name || 'User'}</span>
                {user?.createdAt && (
                  <span>加入时间: {format(new Date(user.createdAt), 'yyyy-MM-dd')}</span>
                )}
              </div>
              {avatarPreview && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="px-4 py-1.5 bg-primary text-white text-sm rounded hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {uploadingAvatar ? "上传中..." : "保存头像"}
                  </button>
                  <button
                    onClick={handleAvatarCancel}
                    disabled={uploadingAvatar}
                    className="px-4 py-1.5 border border-stroke text-sm rounded hover:bg-gray-50 dark:hover:bg-meta-4 dark:border-strokedark disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              )}
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
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              偏好设置
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    名字 <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    required
                    placeholder="请输入名字"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    姓氏
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    placeholder="请输入姓氏"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
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
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
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

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                通知设置
              </h3>
            </div>
            <div className="p-6.5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">邮件通知</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">接收重要更新和通知的邮件</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">系统通知</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">显示系统级别的通知提醒</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">交易提醒</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">基金交易和分红相关的提醒</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                隐私设置
              </h3>
            </div>
            <div className="p-6.5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">个人资料可见性</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">允许其他用户查看你的个人资料</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">活动跟踪</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">记录你的活动以提供更好的服务</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                显示设置
              </h3>
            </div>
            <div className="p-6.5">
              <div className="space-y-4">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    语言
                  </label>
                  <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    时区
                  </label>
                  <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                    <option value="Asia/Shanghai">中国标准时间 (GMT+8)</option>
                    <option value="Asia/Hong_Kong">香港时间 (GMT+8)</option>
                    <option value="America/New_York">美东时间 (GMT-5)</option>
                    <option value="Europe/London">伦敦时间 (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    日期格式
                  </label>
                  <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="flex justify-center rounded bg-primary p-3 px-8 font-medium text-gray hover:bg-opacity-90"
                >
                  保存设置
                </button>
              </div>
            </div>
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
              <p className="font-medium text-black dark:text-white">{user?.role?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">账户状态</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium text-white ${
                user?.status === 'active' ? 'bg-success' : user?.status === 'inactive' ? 'bg-warning' : 'bg-danger'
              }`}>
                {user?.status === 'active' ? '活跃' : user?.status === 'inactive' ? '未激活' : '已暂停'}
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
