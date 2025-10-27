import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFunds, createFund, fetchFundById, clearCurrentFund } from './fundsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FundsListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { funds, currentFund, total, page, pageSize, loading } = useAppSelector(
    (state) => state.funds
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fundType: "PE",
    vintageYear: new Date().getFullYear(),
    currency: "CNY",
    totalSize: "",
    fundTerm: "",
    extensionPeriod: "",
    inceptionDate: "",
  });

  useEffect(() => {
    dispatch(fetchFunds({ page, pageSize, search, status: statusFilter, fundType: typeFilter }));
  }, [dispatch, page, pageSize, search, statusFilter, typeFilter]);

  // 处理模态框打开时的 body 滚动锁定
  useEffect(() => {
    if (showModal || showDetailModal) {
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
  }, [showModal, showDetailModal]);

  const handleCreateFund = () => {
    setFormData({
      name: "",
      fundType: "PE",
      vintageYear: new Date().getFullYear(),
      currency: "CNY",
      totalSize: "",
      fundTerm: "",
      extensionPeriod: "",
      inceptionDate: "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fundData = {
        name: formData.name,
        fundType: formData.fundType,
        vintageYear: formData.vintageYear,
        currency: formData.currency,
        totalSize: parseFloat(formData.totalSize) * 1000000,
        inceptionDate: new Date(formData.inceptionDate),
        fundTerm: formData.fundTerm ? parseInt(formData.fundTerm) : undefined,
        extensionPeriod: formData.extensionPeriod ? parseInt(formData.extensionPeriod) : undefined,
      };

      await dispatch(createFund(fundData)).unwrap();
      toast.success("基金创建成功！");
      setShowModal(false);
      dispatch(fetchFunds({ page, pageSize }));
    } catch (error: any) {
      toast.error(error?.message || "创建失败，请重试");
    }
  };

  const handleViewDetails = async (fundId: string) => {
    try {
      await dispatch(fetchFundById(fundId)).unwrap();
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error(error?.message || "获取基金详情失败");
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    dispatch(clearCurrentFund());
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      fundraising: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      investing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      harvesting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      liquidated: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  const getFundTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PE: 'Private Equity',
      VC: 'Venture Capital',
      RE: 'Real Estate',
      Infrastructure: 'Infrastructure',
      Debt: 'Debt',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          基金管理
        </h2>
        <button
          onClick={handleCreateFund}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 shadow-md"
        >
          + 创建基金
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <input
              type="text"
              placeholder="Search funds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">All Status</option>
              <option value="fundraising">Fundraising</option>
              <option value="investing">Investing</option>
              <option value="harvesting">Harvesting</option>
              <option value="liquidated">Liquidated</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">All Types</option>
              <option value="PE">Private Equity</option>
              <option value="VC">Venture Capital</option>
              <option value="RE">Real Estate</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Debt">Debt</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
              }}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
            >
              Reset
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
                  Fund Name
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Type
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Size
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Vintage
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Investments
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : funds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No funds found. Create your first fund to get started.
                  </td>
                </tr>
              ) : (
                funds.map((fund) => (
                  <tr
                    key={fund.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewDetails(fund.id)}
                        className="text-left hover:text-primary"
                      >
                        <p className="font-medium text-black dark:text-white">
                          {fund.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(fund.inceptionDate), 'MMM d, yyyy')}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{getFundTypeLabel(fund.fundType)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {formatCurrency(fund.totalSize, fund.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{fund.vintageYear}</p>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(fund.status)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">
                        {fund._count?.investments || 0} investments
                      </p>
                      <p className="text-xs text-gray-500">
                        {fund._count?.fundInvestors || 0} investors
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(fund.id)}
                          className="text-primary hover:underline"
                        >
                          查看详情
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
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, total)} of {total} funds
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => dispatch(fetchFunds({ page: page - 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                Previous
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => dispatch(fetchFunds({ page: page + 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建基金模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              创建基金
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 基金名称 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    基金名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="请输入基金名称"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 基金类型 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    基金类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fundType"
                    value={formData.fundType}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="PE">私募股权 (PE)</option>
                    <option value="VC">风险投资 (VC)</option>
                    <option value="RE">房地产 (RE)</option>
                    <option value="Infrastructure">基础设施</option>
                    <option value="Debt">债务基金</option>
                  </select>
                </div>

                {/* 年份 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    年份 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="vintageYear"
                    value={formData.vintageYear}
                    onChange={handleFormChange}
                    required
                    min="2000"
                    max="2100"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 货币 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    货币 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="CNY">人民币 (CNY)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="EUR">欧元 (EUR)</option>
                    <option value="GBP">英镑 (GBP)</option>
                    <option value="HKD">港币 (HKD)</option>
                  </select>
                </div>

                {/* 目标规模 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    目标规模（百万） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalSize"
                    value={formData.totalSize}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="请输入目标规模"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 成立日期 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    成立日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="inceptionDate"
                    value={formData.inceptionDate}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 基金期限（月） */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    基金期限（月）
                  </label>
                  <input
                    type="number"
                    name="fundTerm"
                    value={formData.fundTerm}
                    onChange={handleFormChange}
                    min="0"
                    placeholder="例如: 120"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 延期期限（月） */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    延期期限（月）
                  </label>
                  <input
                    type="number"
                    name="extensionPeriod"
                    value={formData.extensionPeriod}
                    onChange={handleFormChange}
                    min="0"
                    placeholder="例如: 24"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>
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
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 基金详情模态框 */}
      {showDetailModal && currentFund && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-black dark:text-white">
                基金详情
              </h3>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  基本信息
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">基金名称</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {currentFund.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">基金类型</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {getFundTypeLabel(currentFund.fundType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">成立日期</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {format(new Date(currentFund.inceptionDate), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">年份</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {currentFund.vintageYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">状态</p>
                    <div className="mt-1">
                      {getStatusBadge(currentFund.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">货币</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {currentFund.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* 规模信息 */}
              <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  规模信息
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">目标规模</p>
                    <p className="mt-1 text-xl font-bold text-black dark:text-white">
                      {formatCurrency(currentFund.totalSize, currentFund.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">已承诺</p>
                    <p className="mt-1 text-xl font-bold text-success">
                      {formatCurrency(currentFund.committed || 0, currentFund.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">已实缴</p>
                    <p className="mt-1 text-xl font-bold text-primary">
                      {formatCurrency(currentFund.called || 0, currentFund.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">已分配</p>
                    <p className="mt-1 text-xl font-bold text-meta-5">
                      {formatCurrency(currentFund.distributed || 0, currentFund.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 期限信息 */}
              <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  期限信息
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">基金期限</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {currentFund.fundTerm ? `${currentFund.fundTerm} 个月` : '未设置'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">延期期限</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {currentFund.extensionPeriod ? `${currentFund.extensionPeriod} 个月` : '未设置'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  统计信息
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {currentFund._count?.investments || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">投资项目</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">
                      {currentFund._count?.fundInvestors || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">投资者</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-meta-5">
                      {currentFund._count?.capitalCalls || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">催缴通知</p>
                  </div>
                </div>
              </div>

              {/* 描述信息 */}
              {currentFund.description && (
                <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                  <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                    基金描述
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {currentFund.description}
                  </p>
                </div>
              )}

              {/* 时间戳 */}
              <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  时间戳
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">创建时间</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {format(new Date(currentFund.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">更新时间</p>
                    <p className="mt-1 font-medium text-black dark:text-white">
                      {format(new Date(currentFund.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseDetailModal}
                className="inline-flex items-center justify-center rounded-md border border-stroke px-8 py-3 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
