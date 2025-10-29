import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchFundPerformances,
  fetchInvestmentPerformances,
  fetchPerformanceSummary,
} from "./reportsSlice";
import { fetchFunds } from "../funds/fundsSlice";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function PerformanceReportPage() {
  const dispatch = useAppDispatch();
  const { fundPerformances, investmentPerformances, performanceSummary, loading } = useAppSelector(
    (state) => state.reports
  );
  const { funds } = useAppSelector((state) => state.funds);

  const [activeTab, setActiveTab] = useState<'fund' | 'investment'>('fund');
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    document.title = "绩效报告 - eFront 私募基金管理系统";
    dispatch(fetchFunds());
    loadData();
  }, []);

  const loadData = () => {
    const params = {
      fundId: selectedFundId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    dispatch(fetchPerformanceSummary(params));
    dispatch(fetchFundPerformances(params));

    const investmentParams = {
      ...params,
      status: statusFilter || undefined,
    };
    dispatch(fetchInvestmentPerformances(investmentParams));
  };

  const handleFilter = () => {
    loadData();
  };

  const handleReset = () => {
    setSelectedFundId('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    dispatch(fetchPerformanceSummary({}));
    dispatch(fetchFundPerformances({}));
    dispatch(fetchInvestmentPerformances({}));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00%';
    return `${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00x';
    return `${value.toFixed(2)}x`;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-success', text: 'text-white', label: '持有中' },
      exited: { bg: 'bg-primary', text: 'text-white', label: '已退出' },
      'written-off': { bg: 'bg-danger', text: 'text-white', label: '已核销' },
    };
    const badge = badges[status] || { bg: 'bg-meta-7', text: 'text-white', label: status };
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPerformanceColor = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return 'text-gray-600';
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-gray-600';
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          绩效报告
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          查看基金和投资的绩效分析报告
        </p>
      </div>

      {/* Performance Summary Cards */}
      {performanceSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {formatCurrency(performanceSummary.totalNetAssetValue, performanceSummary.currency)}
                </h4>
                <span className="text-sm font-medium">净资产价值</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 3.02816 21.3813 3.92191 21.3813H18.0157C18.8782 21.3813 19.7063 21.0031 20.2907 20.3844C20.875 19.7656 21.15 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.0157 19.8344H3.92191C3.37503 19.8344 2.99691 19.6625 2.72191 19.3531C2.44691 19.0438 2.34378 18.6313 2.41566 18.1875L4.13441 3.43751C4.24066 2.71563 4.84066 2.16563 5.56878 2.16563H16.4313C17.1594 2.16563 17.7594 2.71563 17.8657 3.43751L19.5844 18.1875C19.6219 18.6656 19.5188 19.0438 19.2157 19.3531Z" fill="" />
                  <path d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.18139 8.35313 8.18139 6.80625C8.18139 6.6 8.21577 6.42813 8.25014 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73764 5.87813C6.66577 6.1875 6.59389 6.49688 6.59389 6.80625C6.59389 9.2125 8.5939 11.2125 11.0001 11.2125C13.4064 11.2125 15.4064 9.2125 15.4064 6.80625C15.4064 6.49688 15.3345 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z" fill="" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-600">总承诺: {formatCurrency(performanceSummary.totalCommitments, performanceSummary.currency)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-title-md font-bold ${getPerformanceColor(performanceSummary.averageIRR)}`}>
                  {formatPercent(performanceSummary.averageIRR)}
                </h4>
                <span className="text-sm font-medium">平均 IRR</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 0C4.92545 0 0 4.92545 0 11C0 17.0745 4.92545 22 11 22C17.0745 22 22 17.0745 22 11C22 4.92545 17.0745 0 11 0ZM11 20C6.03818 20 2 15.9618 2 11C2 6.03818 6.03818 2 11 2C15.9618 2 20 6.03818 20 11C20 15.9618 15.9618 20 11 20Z" fill=""/>
                  <path d="M11 5C10.4477 5 10 5.44772 10 6V11C10 11.2652 10.1054 11.5196 10.2929 11.7071L13.2929 14.7071C13.6834 15.0976 14.3166 15.0976 14.7071 14.7071C15.0976 14.3166 15.0976 13.6834 14.7071 13.2929L12 10.5858V6C12 5.44772 11.5523 5 11 5Z" fill=""/>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-600">内部收益率</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {formatRatio(performanceSummary.averageTVPI)}
                </h4>
                <span className="text-sm font-medium">平均 TVPI</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.25 7.5625H18.5625V0.9375C18.5625 0.65625 18.3438 0.4375 18.0625 0.4375H3.9375C3.65625 0.4375 3.4375 0.65625 3.4375 0.9375V7.5625H0.75C0.46875 7.5625 0.25 7.78125 0.25 8.0625V13.9375C0.25 14.2188 0.46875 14.4375 0.75 14.4375H3.4375V21.0625C3.4375 21.3438 3.65625 21.5625 3.9375 21.5625H18.0625C18.3438 21.5625 18.5625 21.3438 18.5625 21.0625V14.4375H21.25C21.5312 14.4375 21.75 14.2188 21.75 13.9375V8.0625C21.75 7.78125 21.5312 7.5625 21.25 7.5625ZM5.4375 2.4375H16.5625V7.5625H5.4375V2.4375ZM16.5625 19.5625H5.4375V14.4375H16.5625V19.5625ZM19.75 12.4375H2.25V9.5625H19.75V12.4375Z" fill=""/>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-600">总价值倍数 (DPI: {formatRatio(performanceSummary.averageDPI)})</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {performanceSummary.totalFunds}
                </h4>
                <span className="text-sm font-medium">管理基金数</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 0C4.92545 0 0 4.92545 0 11C0 17.0745 4.92545 22 11 22C17.0745 22 22 17.0745 22 11C22 4.92545 17.0745 0 11 0ZM11 20C6.03818 20 2 15.9618 2 11C2 6.03818 6.03818 2 11 2C15.9618 2 20 6.03818 20 11C20 15.9618 15.9618 20 11 20Z" fill=""/>
                  <path d="M15 7H12V5C12 4.44772 11.5523 4 11 4C10.4477 4 10 4.44772 10 5V7H7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44772 9 7 9H10V12C10 12.5523 10.4477 13 11 13C11.5523 13 12 12.5523 12 12V9H15C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7Z" fill=""/>
                  <path d="M15 13H7C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H15C15.5523 15 16 14.5523 16 14C16 13.4477 15.5523 13 15 13Z" fill=""/>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-600">投资项目: {performanceSummary.totalInvestments}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            筛选条件
          </h3>
        </div>
        <div className="p-6.5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                基金
              </label>
              <select
                value={selectedFundId}
                onChange={(e) => setSelectedFundId(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">全部基金</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                结束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            {activeTab === 'investment' && (
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  投资状态
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="">全部状态</option>
                  <option value="active">持有中</option>
                  <option value="exited">已退出</option>
                  <option value="written-off">已核销</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFilter}
              className="flex justify-center rounded bg-primary p-3 px-6 font-medium text-gray hover:bg-opacity-90"
            >
              应用筛选
            </button>
            <button
              onClick={handleReset}
              className="flex justify-center rounded border border-stroke p-3 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-stroke dark:border-strokedark">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('fund')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'fund'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              基金绩效
            </button>
            <button
              onClick={() => setActiveTab('investment')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'investment'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              投资绩效
            </button>
          </div>
        </div>
      </div>

      {/* Fund Performance Table */}
      {activeTab === 'fund' && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              基金绩效分析
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    基金名称
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    币种
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    承诺资本
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    已实缴
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    净资产价值
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    IRR
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    TVPI
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    DPI
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    RVPI
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    MOIC
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-600">
                      加载中...
                    </td>
                  </tr>
                ) : fundPerformances.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-600">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  fundPerformances.map((performance) => (
                    <tr key={performance.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white font-medium">
                          {performance.fundName}
                        </p>
                        {performance.vintageYear && (
                          <p className="text-sm text-gray-600">
                            {performance.vintageYear} 年份
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white">
                          {performance.currency}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatCurrency(performance.totalCommitments, performance.currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatCurrency(performance.totalCalled, performance.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {((performance.totalCalled / performance.totalCommitments) * 100).toFixed(1)}%
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white font-medium">
                          {formatCurrency(performance.netAssetValue, performance.currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className={`font-medium ${getPerformanceColor(performance.irr)}`}>
                          {formatPercent(performance.irr)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatRatio(performance.tvpi)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatRatio(performance.dpi)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatRatio(performance.rvpi)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatRatio(performance.moic)}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Investment Performance Table */}
      {activeTab === 'investment' && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              投资绩效分析
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    公司名称
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    所属基金
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    行业
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    状态
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    投资金额
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    当前价值
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    已分配
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    IRR
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    MOIC
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-right">
                    持有期
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-600">
                      加载中...
                    </td>
                  </tr>
                ) : investmentPerformances.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-600">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  investmentPerformances.map((performance) => (
                    <tr key={performance.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white font-medium">
                          {performance.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(performance.investmentDate), 'yyyy-MM-dd')}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white">
                          {performance.fundName}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white">
                          {performance.sector || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(performance.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatCurrency(performance.totalInvested, performance.currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatCurrency(performance.currentValue, performance.currency)}
                        </p>
                        <p className={`text-sm ${getPerformanceColor(performance.unrealizedGain)}`}>
                          {performance.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(performance.unrealizedGain, performance.currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatCurrency(performance.distributions, performance.currency)}
                        </p>
                        {performance.realizedGain !== 0 && (
                          <p className={`text-sm ${getPerformanceColor(performance.realizedGain)}`}>
                            {performance.realizedGain >= 0 ? '+' : ''}{formatCurrency(performance.realizedGain, performance.currency)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className={`font-medium ${getPerformanceColor(performance.irr)}`}>
                          {formatPercent(performance.irr)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {formatRatio(performance.moic)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">
                          {performance.holdingPeriod} 月
                        </p>
                        {performance.exitDate && (
                          <p className="text-sm text-gray-600">
                            {format(new Date(performance.exitDate), 'yyyy-MM-dd')}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
