import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchInvestments } from "./investmentsSlice";
import { Link } from "react-router";

export default function InvestmentsListPage() {
  const dispatch = useAppDispatch();
  const { investments, loading, pagination } = useAppSelector((state) => state.investments);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  useEffect(() => {
    document.title = "投资列表 - eFront 私募基金管理系统";
    dispatch(fetchInvestments({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchInvestments({ page: 1, limit: 10, search, stage }));
  };

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 1000000).toFixed(2)}M`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getStageLabel = (stage: string) => {
    const labels: any = {
      SEED: '种子轮',
      ANGEL: '天使轮',
      SERIES_A: 'A轮',
      SERIES_B: 'B轮',
      SERIES_C: 'C轮',
      GROWTH: '成长期',
      PRE_IPO: 'Pre-IPO',
    };
    return labels[stage] || stage;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      ACTIVE: { label: '持有中', className: 'bg-success text-white' },
      EXITED: { label: '已退出', className: 'bg-meta-3 text-white' },
      WRITTEN_OFF: { label: '已核销', className: 'bg-danger text-white' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray text-black' };
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            投资列表
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            管理所有投资项目和投资组合
          </p>
        </div>
        <Link
          to="/investments/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
        >
          + 新建投资
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="搜索公司名称或行业..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="">所有阶段</option>
            <option value="SEED">种子轮</option>
            <option value="ANGEL">天使轮</option>
            <option value="SERIES_A">A轮</option>
            <option value="SERIES_B">B轮</option>
            <option value="SERIES_C">C轮</option>
            <option value="GROWTH">成长期</option>
            <option value="PRE_IPO">Pre-IPO</option>
          </select>
          <button
            onClick={handleSearch}
            className="rounded bg-primary px-6 py-2 text-white hover:bg-opacity-90"
          >
            搜索
          </button>
          <button
            onClick={() => {
              setSearch("");
              setStage("");
              dispatch(fetchInvestments({ page: 1, limit: 10 }));
            }}
            className="rounded border border-stroke px-6 py-2 hover:shadow-1 dark:border-strokedark"
          >
            重置
          </button>
        </div>
      </div>

      {/* 投资列表表格 */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">公司名称</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">所属基金</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">行业</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">阶段</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">投资日期</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">初始成本</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">持股比例</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">状态</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    暂无投资记录
                  </td>
                </tr>
              ) : (
                investments.map((investment: any) => (
                  <tr key={investment.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-5">
                      <Link
                        to={`/investments/${investment.id}`}
                        className="font-medium text-black hover:text-primary dark:text-white"
                      >
                        {investment.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-5">{investment.fund?.name || '-'}</td>
                    <td className="px-4 py-5">{investment.sector || '-'}</td>
                    <td className="px-4 py-5">{investment.stage ? getStageLabel(investment.stage) : '-'}</td>
                    <td className="px-4 py-5">{formatDate(investment.investmentDate)}</td>
                    <td className="px-4 py-5">{formatCurrency(investment.initialCost)}</td>
                    <td className="px-4 py-5">
                      {investment.ownershipPercentage ? `${investment.ownershipPercentage}%` : '-'}
                    </td>
                    <td className="px-4 py-5">{getStatusBadge(investment.status)}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/investments/${investment.id}`}
                          className="hover:text-primary"
                        >
                          查看
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && investments.length > 0 && (
          <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(fetchInvestments({ page: pagination.page - 1, limit: 10 }))}
                disabled={pagination.page === 1}
                className="rounded border border-stroke px-4 py-2 hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark"
              >
                上一页
              </button>
              <button
                onClick={() => dispatch(fetchInvestments({ page: pagination.page + 1, limit: 10 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded border border-stroke px-4 py-2 hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark"
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
