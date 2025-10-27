import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCapitalCalls, createCapitalCall } from './capitalCallsSlice';
import { fetchFunds } from '../funds/fundsSlice';
import { fetchInvestors } from './investorsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function CapitalCallsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { capitalCalls, total, page, pageSize, loading } = useAppSelector(
    (state) => state.capitalCalls
  );
  const { funds } = useAppSelector((state) => state.funds);
  const { investors } = useAppSelector((state) => state.investors);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundFilter, setFundFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fundId: "",
    callNumber: 1,
    callDate: "",
    dueDate: "",
    purpose: "",
    totalAmount: "",
    bankAccount: "",
    notes: "",
  });
  const [investorDetails, setInvestorDetails] = useState<Array<{investorId: string; calledAmount: string}>>([
    {investorId: "", calledAmount: ""}
  ]);

  useEffect(() => {
    document.title = "资本催缴 - eFront 私募基金管理系统";
  }, []);

  useEffect(() => {
    dispatch(
      fetchCapitalCalls({
        page,
        pageSize,
        search,
        status: statusFilter,
        fundId: fundFilter,
      })
    );
  }, [dispatch, page, pageSize, search, statusFilter, fundFilter]);

  useEffect(() => {
    dispatch(fetchFunds({ page: 1, pageSize: 100 }));
    dispatch(fetchInvestors({ page: 1, pageSize: 100 }));
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

  const handleCreateCapitalCall = () => {
    setFormData({
      fundId: "",
      callNumber: 1,
      callDate: "",
      dueDate: "",
      purpose: "",
      totalAmount: "",
      bankAccount: "",
      notes: "",
    });
    setInvestorDetails([{investorId: "", calledAmount: ""}]);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInvestor = () => {
    setInvestorDetails([...investorDetails, {investorId: "", calledAmount: ""}]);
  };

  const handleRemoveInvestor = (index: number) => {
    setInvestorDetails(investorDetails.filter((_, i) => i !== index));
  };

  const handleInvestorChange = (index: number, field: string, value: string) => {
    const newDetails = [...investorDetails];
    newDetails[index] = {...newDetails[index], [field]: value};
    setInvestorDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const details = investorDetails
        .filter(detail => detail.investorId && detail.calledAmount)
        .map(detail => ({
          investorId: detail.investorId,
          calledAmount: parseFloat(detail.calledAmount) * 1000000,
        }));

      if (details.length === 0) {
        toast.error("请至少添加一个投资者");
        return;
      }

      const data = {
        fundId: formData.fundId,
        callNumber: formData.callNumber,
        callDate: formData.callDate,
        dueDate: formData.dueDate,
        purpose: formData.purpose || undefined,
        totalAmount: parseFloat(formData.totalAmount) * 1000000,
        bankAccount: formData.bankAccount || undefined,
        notes: formData.notes || undefined,
        details,
      };

      await dispatch(createCapitalCall(data)).unwrap();
      toast.success("催缴通知创建成功！");
      setShowModal(false);
      dispatch(fetchCapitalCalls({ page, pageSize }));
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
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const statusLabels: Record<string, string> = {
      draft: '草稿',
      sent: '已发送',
      partial: '部分收到',
      complete: '已完成',
      overdue: '已逾期',
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

  const getProgressPercentage = (received: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((received / total) * 100);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            资本催缴管理
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理向投资者的资本催缴通知和收款记录
          </p>
        </div>
        <button
          onClick={handleCreateCapitalCall}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 shadow-md"
        >
          + 创建催缴通知
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <input
              type="text"
              placeholder="搜索催缴通知..."
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
              <option value="">所有状态</option>
              <option value="draft">草稿</option>
              <option value="sent">已发送</option>
              <option value="partial">部分收到</option>
              <option value="complete">已完成</option>
              <option value="overdue">已逾期</option>
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
                  催缴编号
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  基金名称
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  催缴日期
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  截止日期
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  催缴金额
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  已收金额
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  收款进度
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  投资者数量
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">
                    加载中...
                  </td>
                </tr>
              ) : capitalCalls.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    暂无催缴记录。点击上方按钮创建第一个催缴通知。
                  </td>
                </tr>
              ) : (
                capitalCalls.map((call) => {
                  const progress = getProgressPercentage(
                    Number(call.receivedAmount),
                    Number(call.totalAmount)
                  );
                  return (
                    <tr
                      key={call.id}
                      className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`/capital-calls/${call.id}`)}
                          className="text-left hover:text-primary"
                        >
                          <p className="font-medium text-black dark:text-white">
                            #{call.callNumber}
                          </p>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium">
                          {call.fund?.name || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm">
                          {format(new Date(call.callDate), 'yyyy-MM-dd')}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm">
                          {format(new Date(call.dueDate), 'yyyy-MM-dd')}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {formatCurrency(
                            Number(call.totalAmount),
                            call.fund?.currency
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm">
                          {formatCurrency(
                            Number(call.receivedAmount),
                            call.fund?.currency
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-full">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-brand-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(call.status)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm">
                          {call._count?.details || 0} 个投资者
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/capital-calls/${call.id}`)}
                            className="text-primary hover:underline"
                          >
                            查看
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/capital-calls/${call.id}/edit`)
                            }
                            className="text-meta-5 hover:underline"
                          >
                            编辑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                  dispatch(fetchCapitalCalls({ page: page - 1, pageSize }))
                }
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                上一页
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() =>
                  dispatch(fetchCapitalCalls({ page: page + 1, pageSize }))
                }
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建催缴通知模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              创建催缴通知
            </h3>

            <form onSubmit={handleSubmit}>
              {/* 基本信息 */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">基本信息</h4>
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

                  {/* 催缴编号 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      催缴编号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="callNumber"
                      value={formData.callNumber}
                      onChange={handleFormChange}
                      required
                      min="1"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 催缴日期 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      催缴日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="callDate"
                      value={formData.callDate}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 截止日期 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      截止日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 总金额 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      总金额 (百万元) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleFormChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="例如：10.5"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 银行账号 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      银行账号
                    </label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleFormChange}
                      placeholder="请输入收款银行账号"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 催缴目的 */}
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      催缴目的
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleFormChange}
                      placeholder="例如：项目投资、运营资金等"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 备注 */}
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      备注
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="请输入备注信息"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 投资者明细 */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-black dark:text-white">投资者明细</h4>
                  <button
                    type="button"
                    onClick={handleAddInvestor}
                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                  >
                    + 添加投资者
                  </button>
                </div>

                <div className="space-y-4">
                  {investorDetails.map((detail, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          投资者
                        </label>
                        <select
                          value={detail.investorId}
                          onChange={(e) => handleInvestorChange(index, 'investorId', e.target.value)}
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        >
                          <option value="">请选择投资者</option>
                          {investors.map((investor) => (
                            <option key={investor.id} value={investor.id}>
                              {investor.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          催缴金额 (百万元)
                        </label>
                        <input
                          type="number"
                          value={detail.calledAmount}
                          onChange={(e) => handleInvestorChange(index, 'calledAmount', e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="例如：5.0"
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        />
                      </div>

                      {investorDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInvestor(index)}
                          className="mt-8 rounded bg-red-500 px-4 py-3 text-white hover:bg-red-600"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
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
