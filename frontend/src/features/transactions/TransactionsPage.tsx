import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransactions, createTransaction } from './transactionsSlice';
import { fetchFunds } from '../funds/fundsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { transactions, total, page, pageSize, loading } = useAppSelector(
    (state) => state.transactions
  );
  const { funds } = useAppSelector((state) => state.funds);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundFilter, setFundFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fundId: "",
    transactionDate: "",
    transactionType: "income",
    amount: "",
    currency: "USD",
    description: "",
    referenceId: "",
    referenceType: "",
    settlementDate: "",
  });

  useEffect(() => {
    document.title = "交易管理 - eFront 私募基金管理系统";
  }, []);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        page,
        pageSize,
        search,
        transactionType: typeFilter,
        status: statusFilter,
        fundId: fundFilter,
      })
    );
  }, [dispatch, page, pageSize, search, typeFilter, statusFilter, fundFilter]);

  useEffect(() => {
    dispatch(fetchFunds({ page: 1, pageSize: 100 }));
  }, [dispatch]);

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

  const handleCreateTransaction = () => {
    setFormData({
      fundId: "",
      transactionDate: "",
      transactionType: "income",
      amount: "",
      currency: "USD",
      description: "",
      referenceId: "",
      referenceType: "",
      settlementDate: "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        fundId: formData.fundId,
        transactionDate: formData.transactionDate,
        transactionType: formData.transactionType,
        amount: parseFloat(formData.amount) * 1000000,
        currency: formData.currency,
        description: formData.description || undefined,
        referenceId: formData.referenceId || undefined,
        referenceType: formData.referenceType || undefined,
        settlementDate: formData.settlementDate || undefined,
      };

      await dispatch(createTransaction(data)).unwrap();
      toast.success("交易创建成功！");
      setShowModal(false);
      dispatch(fetchTransactions({ page, pageSize }));
    } catch (error: any) {
      toast.error(error?.message || "创建失败，请重试");
    }
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
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      settled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const statusLabels: Record<string, string> = {
      pending: '待处理',
      settled: '已结算',
      cancelled: '已取消',
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

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      capitalCall: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      distribution: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      exit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      fee: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      expense: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      income: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    const typeLabels: Record<string, string> = {
      capitalCall: '资本催缴',
      distribution: '资本分配',
      investment: '投资',
      exit: '退出',
      fee: '费用',
      expense: '支出',
      income: '收入',
      other: '其他',
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

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            交易管理
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理所有资金交易和现金流记录
          </p>
        </div>
        <button
          onClick={handleCreateTransaction}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 shadow-md"
        >
          + 创建交易
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <input
              type="text"
              placeholder="搜索交易记录..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有类型</option>
              <option value="capitalCall">资本催缴</option>
              <option value="distribution">资本分配</option>
              <option value="investment">投资</option>
              <option value="exit">退出</option>
              <option value="fee">费用</option>
              <option value="expense">支出</option>
              <option value="income">收入</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有状态</option>
              <option value="pending">待处理</option>
              <option value="settled">已结算</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="基金ID筛选"
              value={fundFilter}
              onChange={(e) => setFundFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setStatusFilter('');
                setFundFilter('');
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
                  交易日期
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  基金名称
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  交易类型
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  金额
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  货币
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  描述
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  结算日期
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
                  <td colSpan={9} className="px-4 py-8 text-center">
                    加载中...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    暂无交易记录。点击上方按钮创建第一笔交易。
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm">
                        {format(new Date(txn.transactionDate), 'yyyy-MM-dd')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">
                        {txn.fund?.name || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {getTypeBadge(txn.transactionType)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {formatCurrency(Number(txn.amount), txn.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{txn.currency}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm max-w-xs truncate">
                        {txn.description || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">
                        {txn.settlementDate
                          ? format(new Date(txn.settlementDate), 'yyyy-MM-dd')
                          : '-'
                        }
                      </p>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(txn.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/transactions/${txn.id}`)}
                          className="text-primary hover:underline"
                        >
                          查看
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/transactions/${txn.id}/edit`)
                          }
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
              {Math.min(page * pageSize, total)} 共 {total} 条记录
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() =>
                  dispatch(fetchTransactions({ page: page - 1, pageSize }))
                }
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                上一页
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() =>
                  dispatch(fetchTransactions({ page: page + 1, pageSize }))
                }
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建交易模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              创建交易
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 所属基金 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    所属基金 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fundId"
                    value={formData.fundId}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="">请选择基金</option>
                    {funds.map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 交易日期 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    交易日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 交易类型 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    交易类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="transactionType"
                    value={formData.transactionType}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="capitalCall">资本催缴</option>
                    <option value="distribution">资本分配</option>
                    <option value="investment">投资</option>
                    <option value="exit">退出</option>
                    <option value="fee">费用</option>
                    <option value="expense">支出</option>
                    <option value="income">收入</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                {/* 金额 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    金额 (百万元) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    placeholder="例如：10.5"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 货币 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    货币
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="USD">美元 (USD)</option>
                    <option value="CNY">人民币 (CNY)</option>
                    <option value="EUR">欧元 (EUR)</option>
                    <option value="GBP">英镑 (GBP)</option>
                    <option value="HKD">港币 (HKD)</option>
                  </select>
                </div>

                {/* 结算日期 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    结算日期
                  </label>
                  <input
                    type="date"
                    name="settlementDate"
                    value={formData.settlementDate}
                    onChange={handleFormChange}
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 关联类型 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    关联类型
                  </label>
                  <input
                    type="text"
                    name="referenceType"
                    value={formData.referenceType}
                    onChange={handleFormChange}
                    placeholder="例如：CapitalCall、Distribution"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 关联ID */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    关联ID
                  </label>
                  <input
                    type="text"
                    name="referenceId"
                    value={formData.referenceId}
                    onChange={handleFormChange}
                    placeholder="关联记录的ID"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 描述 */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    描述
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="请输入交易描述"
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
    </div>
  );
}
