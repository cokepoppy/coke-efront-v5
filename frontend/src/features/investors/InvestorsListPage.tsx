import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchInvestors, createInvestor } from './investorsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InvestorsListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { investors, total, page, pageSize, loading } = useAppSelector(
    (state) => state.investors
  );

  const [search, setSearch] = useState('');
  const [investorTypeFilter, setInvestorTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    investorType: "institutional",
    entityType: "corporation",
    domicile: "",
    country: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    kycStatus: "pending",
    amlStatus: "pending",
    accredited: false,
    notes: "",
  });

  useEffect(() => {
    document.title = "投资者列表 - eFront 私募基金管理系统";
  }, []);

  useEffect(() => {
    dispatch(
      fetchInvestors({
        page,
        pageSize,
        search,
        investorType: investorTypeFilter,
        status: statusFilter,
        kycStatus: kycStatusFilter,
      })
    );
  }, [dispatch, page, pageSize, search, investorTypeFilter, statusFilter, kycStatusFilter]);

  // 处理模态框打开时的 body 滚动锁定
  useEffect(() => {
    if (showModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showModal]);

  const handleCreateInvestor = () => {
    setFormData({
      name: "",
      investorType: "institutional",
      entityType: "corporation",
      domicile: "",
      country: "",
      taxId: "",
      email: "",
      phone: "",
      address: "",
      kycStatus: "pending",
      amlStatus: "pending",
      accredited: false,
      notes: "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const investorData = {
        name: formData.name,
        investorType: formData.investorType as any,
        entityType: formData.entityType as any,
        domicile: formData.domicile || undefined,
        country: formData.country || undefined,
        taxId: formData.taxId || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        kycStatus: formData.kycStatus as any,
        amlStatus: formData.amlStatus as any,
        accredited: formData.accredited,
        status: 'active' as any,
        notes: formData.notes || undefined,
      };

      await dispatch(createInvestor(investorData)).unwrap();
      toast.success("投资者添加成功！");
      setShowModal(false);
      dispatch(fetchInvestors({ page, pageSize }));
    } catch (error: any) {
      toast.error(error?.message || "添加失败，请重试");
    }
  };

  const getInvestorTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      institutional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      corporate: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      familyOffice: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      hnwi: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      fundOfFunds: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };

    const typeLabels: Record<string, string> = {
      institutional: '机构投资者',
      corporate: '企业投资者',
      familyOffice: '家族办公室',
      hnwi: '高净值个人',
      fundOfFunds: '基金中的基金',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          typeColors[type] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {typeLabels[type] || type}
      </span>
    );
  };

  const getKycStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const statusLabels: Record<string, string> = {
      pending: '待审核',
      inProgress: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    const statusLabels: Record<string, string> = {
      active: '活跃',
      inactive: '非活跃',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            投资者管理
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理所有投资者（LP）信息和关系
          </p>
        </div>
        <button
          onClick={handleCreateInvestor}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 shadow-md"
        >
          + 添加投资者
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <input
              type="text"
              placeholder="搜索投资者..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>
          <div>
            <select
              value={investorTypeFilter}
              onChange={(e) => setInvestorTypeFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有类型</option>
              <option value="institutional">机构投资者</option>
              <option value="corporate">企业投资者</option>
              <option value="familyOffice">家族办公室</option>
              <option value="hnwi">高净值个人</option>
              <option value="fundOfFunds">基金中的基金</option>
            </select>
          </div>
          <div>
            <select
              value={kycStatusFilter}
              onChange={(e) => setKycStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有KYC状态</option>
              <option value="pending">待审核</option>
              <option value="inProgress">审核中</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearch('');
                setInvestorTypeFilter('');
                setStatusFilter('');
                setKycStatusFilter('');
              }}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  投资者名称
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  类型
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  国家/地区
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  KYC状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  认证状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  基金数量
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    加载中...
                  </td>
                </tr>
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    暂无投资者数据。点击上方按钮添加第一个投资者。
                  </td>
                </tr>
              ) : (
                investors.map((investor) => (
                  <tr
                    key={investor.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/investors/${investor.id}`)}
                        className="text-left hover:text-primary"
                      >
                        <p className="font-medium text-black dark:text-white">
                          {investor.name}
                        </p>
                        {investor.email && (
                          <p className="text-xs text-gray-500">{investor.email}</p>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      {getInvestorTypeBadge(investor.investorType)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{investor.country || '-'}</p>
                    </td>
                    <td className="px-4 py-4">
                      {getKycStatusBadge(investor.kycStatus)}
                    </td>
                    <td className="px-4 py-4">
                      {investor.accredited ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          已认证
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          未认证
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">
                        {investor._count?.fundInvestors || 0} 个基金
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(investor.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/investors/${investor.id}`)}
                          className="text-primary hover:underline"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => navigate(`/investors/${investor.id}/edit`)}
                          className="text-meta-5 hover:underline"
                        >
                          编辑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between border-t border-stroke p-4 dark:border-strokedark">
            <p className="text-sm text-gray-500">
              显示 {(page - 1) * pageSize + 1} 到{' '}
              {Math.min(page * pageSize, total)} 共 {total} 个投资者
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => dispatch(fetchInvestors({ page: page - 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                上一页
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => dispatch(fetchInvestors({ page: page + 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 添加投资者模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              添加投资者
            </h3>

            <form onSubmit={handleSubmit}>
              {/* 基本信息 */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">基本信息</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* 投资者名称 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      投资者名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      placeholder="请输入投资者名称"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 投资者类型 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      投资者类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="investorType"
                      value={formData.investorType}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value="institutional">机构投资者</option>
                      <option value="corporate">企业投资者</option>
                      <option value="familyOffice">家族办公室</option>
                      <option value="hnwi">高净值个人</option>
                      <option value="fundOfFunds">基金中的基金</option>
                    </select>
                  </div>

                  {/* 实体类型 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      实体类型
                    </label>
                    <select
                      name="entityType"
                      value={formData.entityType}
                      onChange={handleFormChange}
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value="individual">个人</option>
                      <option value="partnership">合伙企业</option>
                      <option value="corporation">公司</option>
                      <option value="trust">信托</option>
                    </select>
                  </div>

                  {/* 注册地 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      注册地
                    </label>
                    <input
                      type="text"
                      name="domicile"
                      value={formData.domicile}
                      onChange={handleFormChange}
                      placeholder="请输入注册地"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 国家/地区 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      国家/地区
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      placeholder="请输入国家/地区"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 税号 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      税号
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleFormChange}
                      placeholder="请输入税号"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 联系信息 */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">联系信息</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* 邮箱 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      邮箱
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="请输入邮箱地址"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 电话 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      电话
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="请输入电话号码"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 地址 */}
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      地址
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="请输入详细地址"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 合规信息 */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">合规信息</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* KYC状态 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      KYC状态
                    </label>
                    <select
                      name="kycStatus"
                      value={formData.kycStatus}
                      onChange={handleFormChange}
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value="pending">待审核</option>
                      <option value="inProgress">审核中</option>
                      <option value="approved">已通过</option>
                      <option value="rejected">已拒绝</option>
                    </select>
                  </div>

                  {/* AML状态 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      AML状态
                    </label>
                    <select
                      name="amlStatus"
                      value={formData.amlStatus}
                      onChange={handleFormChange}
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value="pending">待审核</option>
                      <option value="inProgress">审核中</option>
                      <option value="approved">已通过</option>
                      <option value="rejected">已拒绝</option>
                    </select>
                  </div>

                  {/* 认证投资者 */}
                  <div className="flex items-center md:col-span-2">
                    <input
                      type="checkbox"
                      name="accredited"
                      checked={formData.accredited}
                      onChange={handleFormChange}
                      id="accredited"
                      className="h-5 w-5 rounded border-stroke bg-gray text-primary focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-meta-4"
                    />
                    <label
                      htmlFor="accredited"
                      className="ml-3 text-sm font-medium text-black dark:text-white"
                    >
                      认证投资者
                    </label>
                  </div>
                </div>
              </div>

              {/* 备注 */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  备注
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="请输入备注信息"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 按钮 */}
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center justify-center rounded-md border border-stroke px-10 py-3 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-brand-500 px-10 py-3 text-center font-medium text-white hover:bg-brand-600"
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
