import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCapitalCalls } from './capitalCallsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function CapitalCallsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { capitalCalls, total, page, pageSize, loading } = useAppSelector(
    (state) => state.capitalCalls
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundFilter, setFundFilter] = useState('');

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

  const handleCreateCapitalCall = () => {
    navigate('/capital-calls/create');
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
    </div>
  );
}
