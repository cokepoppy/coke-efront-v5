import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchFunds } from "../funds/fundsSlice";
import { fetchInvestments } from "../investments/investmentsSlice";
import api from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface PortfolioSummary {
  summary: {
    totalAUM: number;
    totalFunds: number;
    totalInvestments: number;
    totalInvested: number;
    totalValue: number;
    unrealizedGain: number;
  };
  byStatus: Record<string, number>;
  bySector: Record<string, number>;
  funds: any[];
}

interface FundPerformance {
  fund: {
    id: string;
    name: string;
    type: string;
    status: string;
    totalSize: number;
    currency: string;
    vintage: number;
  };
  metrics: {
    totalInvested: number;
    currentValue: number;
    totalDistributions: number;
    unrealizedGain: number;
    realizedGain: number;
    totalReturn: number;
    irr: number;
    moic: number;
  };
  transactions: any[];
  distributions: any[];
  investments: any[];
}

interface InvestmentPerformance {
  investment: {
    id: string;
    investmentDate: string;
    investmentAmount: number;
    ownershipPercentage: number;
    status: string;
    fund: { id: string; name: string; currency: string };
    companyName: string;
    industry: string;
    sector: string;
  };
  metrics: {
    currentValue: number;
    totalDistributions: number;
    unrealizedGain: number;
    realizedGain: number;
    totalReturn: number;
    returnMultiple: number;
    holdingPeriod: number;
  };
  valuations: any[];
  distributions: any[];
}

export default function PerformanceReportDemoPage() {
  const dispatch = useAppDispatch();
  const { funds } = useAppSelector((state) => state.funds);
  const { investments } = useAppSelector((state) => state.investments);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'fund' | 'investment'>('portfolio');
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [fundPerformance, setFundPerformance] = useState<FundPerformance | null>(null);
  const [investmentPerformance, setInvestmentPerformance] = useState<InvestmentPerformance | null>(null);
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "绩效报告演示 - eFront 私募基金管理系统";
    dispatch(fetchFunds());
    dispatch(fetchInvestments({}));
    loadPortfolioSummary();
  }, []);

  const loadPortfolioSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/portfolio');
      if (response.data.success) {
        setPortfolioSummary(response.data.data);
      }
    } catch (error: any) {
      console.error("Error loading portfolio summary:", error);
      toast.error(error.response?.data?.error?.message || "加载投资组合总结失败");
    } finally {
      setLoading(false);
    }
  };

  const loadFundPerformance = async (fundId: string) => {
    if (!fundId) {
      toast.error("请选择基金");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reports/fund/${fundId}`);
      if (response.data.success) {
        setFundPerformance(response.data.data);
        toast.success("基金绩效报告加载成功");
      }
    } catch (error: any) {
      console.error("Error loading fund performance:", error);
      toast.error(error.response?.data?.error?.message || "加载基金绩效失败");
    } finally {
      setLoading(false);
    }
  };

  const loadInvestmentPerformance = async (investmentId: string) => {
    if (!investmentId) {
      toast.error("请选择投资项目");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reports/investment/${investmentId}`);
      if (response.data.success) {
        setInvestmentPerformance(response.data.data);
        toast.success("投资绩效报告加载成功");
      }
    } catch (error: any) {
      console.error("Error loading investment performance:", error);
      toast.error(error.response?.data?.error?.message || "加载投资绩效失败");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-success', text: 'text-white', label: '活跃' },
      closed: { bg: 'bg-meta-7', text: 'text-white', label: '已关闭' },
      liquidation: { bg: 'bg-warning', text: 'text-white', label: '清算中' },
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

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          绩效报告演示
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          查看基金和投资的绩效分析报告
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-stroke dark:border-strokedark">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              投资组合总览
            </button>
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

      {/* Portfolio Summary Tab */}
      {activeTab === 'portfolio' && portfolioSummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {formatCurrency(portfolioSummary.summary.totalAUM, 'USD')}
                  </h4>
                  <span className="text-sm font-medium">管理资产总额</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">AUM (Assets Under Management)</span>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {formatCurrency(portfolioSummary.summary.totalValue, 'USD')}
                  </h4>
                  <span className="text-sm font-medium">当前价值</span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${getPerformanceColor(portfolioSummary.summary.unrealizedGain)}`}>
                  未实现收益: {formatCurrency(portfolioSummary.summary.unrealizedGain, 'USD')}
                </span>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {portfolioSummary.summary.totalFunds}
                  </h4>
                  <span className="text-sm font-medium">管理基金数</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  投资项目: {portfolioSummary.summary.totalInvestments}
                </span>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {formatCurrency(portfolioSummary.summary.totalInvested, 'USD')}
                  </h4>
                  <span className="text-sm font-medium">已投资金额</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  回报率: {formatPercent(((portfolioSummary.summary.totalValue - portfolioSummary.summary.totalInvested) / portfolioSummary.summary.totalInvested) * 100)}
                </span>
              </div>
            </div>
          </div>

          {/* By Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  按状态分布
                </h3>
              </div>
              <div className="p-6.5">
                {Object.entries(portfolioSummary.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-3 border-b border-stroke dark:border-strokedark last:border-0">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(status)}
                    </div>
                    <span className="font-medium text-black dark:text-white">{count} 个项目</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  按行业分布
                </h3>
              </div>
              <div className="p-6.5">
                {Object.entries(portfolioSummary.bySector).map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between py-3 border-b border-stroke dark:border-strokedark last:border-0">
                    <span className="text-black dark:text-white">{sector}</span>
                    <span className="font-medium text-primary">{count} 个项目</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Funds List */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                基金列表 ({portfolioSummary.funds.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">基金名称</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">类型</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">状态</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white text-right">基金规模</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white text-right">投资项目</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioSummary.funds.map((fund) => (
                    <tr key={fund.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white font-medium">{fund.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-black dark:text-white">{fund.type}</p>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(fund.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">{formatCurrency(fund.totalSize, 'USD')}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-black dark:text-white">{fund.investmentCount}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Fund Performance Tab */}
      {activeTab === 'fund' && (
        <>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                选择基金
              </h3>
            </div>
            <div className="p-6.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    基金 <span className="text-meta-1">*</span>
                  </label>
                  <select
                    value={selectedFundId}
                    onChange={(e) => setSelectedFundId(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="">选择基金</option>
                    {funds.map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => loadFundPerformance(selectedFundId)}
                    disabled={loading || !selectedFundId}
                    className="w-full rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "加载中..." : "查看绩效"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {fundPerformance && (
            <>
              {/* Fund Info */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    基金信息
                  </h3>
                </div>
                <div className="p-6.5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">名称</p>
                      <p className="font-medium text-black dark:text-white">{fundPerformance.fund.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">类型</p>
                      <p className="font-medium text-black dark:text-white">{fundPerformance.fund.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">状态</p>
                      {getStatusBadge(fundPerformance.fund.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">年份</p>
                      <p className="font-medium text-black dark:text-white">{fundPerformance.fund.vintage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">已投资</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {formatCurrency(fundPerformance.metrics.totalInvested, fundPerformance.fund.currency)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">当前价值</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(fundPerformance.metrics.currentValue, fundPerformance.fund.currency)}
                  </p>
                  <p className={`text-sm ${getPerformanceColor(fundPerformance.metrics.unrealizedGain)}`}>
                    未实现: {formatCurrency(fundPerformance.metrics.unrealizedGain, fundPerformance.fund.currency)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">IRR</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(fundPerformance.metrics.irr)}`}>
                    {formatPercent(fundPerformance.metrics.irr)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">MOIC</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {formatRatio(fundPerformance.metrics.moic)}
                  </p>
                </div>
              </div>

              {/* Investments */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    投资项目 ({fundPerformance.investments.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">公司名称</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-right">投资金额</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-right">当前价值</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-right">持股比例</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fundPerformance.investments.map((inv: any, index: number) => (
                        <tr key={index} className="border-b border-stroke dark:border-strokedark">
                          <td className="py-4 px-4">
                            <p className="text-black dark:text-white font-medium">{inv.companyName || `投资 #${index + 1}`}</p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-black dark:text-white">{formatCurrency(inv.investmentAmount, fundPerformance.fund.currency)}</p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-black dark:text-white">{formatCurrency(inv.currentValue, fundPerformance.fund.currency)}</p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-black dark:text-white">{formatPercent(inv.ownershipPercentage)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!fundPerformance && !loading && (
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                <p className="text-lg">选择基金并点击"查看绩效"查看基金绩效数据</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Investment Performance Tab */}
      {activeTab === 'investment' && (
        <>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                选择投资项目
              </h3>
            </div>
            <div className="p-6.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    投资项目 <span className="text-meta-1">*</span>
                  </label>
                  <select
                    value={selectedInvestmentId}
                    onChange={(e) => setSelectedInvestmentId(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="">选择投资项目</option>
                    {investments.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => loadInvestmentPerformance(selectedInvestmentId)}
                    disabled={loading || !selectedInvestmentId}
                    className="w-full rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "加载中..." : "查看绩效"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {investmentPerformance && (
            <>
              {/* Investment Info */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    投资信息
                  </h3>
                </div>
                <div className="p-6.5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">公司名称</p>
                      <p className="font-medium text-black dark:text-white">{investmentPerformance.investment.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">所属基金</p>
                      <p className="font-medium text-black dark:text-white">{investmentPerformance.investment.fund.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">行业</p>
                      <p className="font-medium text-black dark:text-white">{investmentPerformance.investment.sector || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">投资日期</p>
                      <p className="font-medium text-black dark:text-white">
                        {format(new Date(investmentPerformance.investment.investmentDate), 'yyyy-MM-dd')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">投资金额</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {formatCurrency(investmentPerformance.investment.investmentAmount, investmentPerformance.investment.fund.currency)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">当前价值</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(investmentPerformance.metrics.currentValue, investmentPerformance.investment.fund.currency)}
                  </p>
                  <p className={`text-sm ${getPerformanceColor(investmentPerformance.metrics.unrealizedGain)}`}>
                    未实现: {formatCurrency(investmentPerformance.metrics.unrealizedGain, investmentPerformance.investment.fund.currency)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">回报倍数</p>
                  <p className="text-2xl font-bold text-success">
                    {formatRatio(investmentPerformance.metrics.returnMultiple)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">持有期</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {Math.floor(investmentPerformance.metrics.holdingPeriod / 30)} 个月
                  </p>
                  <p className="text-sm text-gray-600">{investmentPerformance.metrics.holdingPeriod} 天</p>
                </div>
              </div>

              {/* Valuations */}
              {investmentPerformance.valuations.length > 0 && (
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
                  <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                      估值历史 ({investmentPerformance.valuations.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                          <th className="py-4 px-4 font-medium text-black dark:text-white">估值日期</th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white text-right">总价值</th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white text-right">估值方法</th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white text-right">倍数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investmentPerformance.valuations.map((val: any, index: number) => (
                          <tr key={index} className="border-b border-stroke dark:border-strokedark">
                            <td className="py-4 px-4">
                              <p className="text-black dark:text-white">
                                {format(new Date(val.valuationDate), 'yyyy-MM-dd')}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-black dark:text-white">
                                {formatCurrency(val.totalValue, investmentPerformance.investment.fund.currency)}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-black dark:text-white">{val.valuationMethod || '-'}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-black dark:text-white">{formatRatio(val.multiple)}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {!investmentPerformance && !loading && (
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                <p className="text-lg">选择投资项目并点击"查看绩效"查看投资绩效数据</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
