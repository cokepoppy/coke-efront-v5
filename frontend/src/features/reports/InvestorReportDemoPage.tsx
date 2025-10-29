import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchFunds } from "../funds/fundsSlice";
import { fetchInvestors } from "../investors/investorsSlice";
import api from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface InvestorReportData {
  investor: {
    id: string;
    name: string;
    type: string;
    email: string;
    country: string;
  };
  summary: {
    totalCommitment: number;
    totalCalled: number;
    totalDistributed: number;
    totalUnfunded: number;
    netInvested: number;
  };
  commitments: any[];
}

export default function InvestorReportDemoPage() {
  const dispatch = useAppDispatch();
  const { funds } = useAppSelector((state) => state.funds);
  const { investors } = useAppSelector((state) => state.investors);

  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [selectedFundId, setSelectedFundId] = useState("");
  const [reportData, setReportData] = useState<InvestorReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "投资者报告演示 - eFront 私募基金管理系统";
    dispatch(fetchFunds());
    dispatch(fetchInvestors({}));
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedInvestorId) {
      toast.error("请选择投资者");
      return;
    }

    setLoading(true);
    try {
      const params: any = {};
      if (selectedFundId) params.fundId = selectedFundId;

      const response = await api.get(`/reports/investor/${selectedInvestorId}`, { params });
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("报告生成成功");
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.response?.data?.error?.message || "生成报告失败");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          投资者报告演示
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          查看投资者的承诺、资本调用和分配情况
        </p>
      </div>

      {/* Filter Section */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            选择投资者和基金
          </h3>
        </div>
        <div className="p-6.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                投资者 <span className="text-meta-1">*</span>
              </label>
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">选择投资者</option>
                {investors.map((investor) => (
                  <option key={investor.id} value={investor.id}>
                    {investor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                基金 (可选)
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

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={loading || !selectedInvestorId}
                className="w-full rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "生成中..." : "生成报告"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <>
          {/* Investor Info */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                投资者信息
              </h3>
            </div>
            <div className="p-6.5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">名称</p>
                  <p className="font-medium text-black dark:text-white">{reportData.investor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">类型</p>
                  <p className="font-medium text-black dark:text-white">{reportData.investor.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">邮箱</p>
                  <p className="font-medium text-black dark:text-white">{reportData.investor.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">国家</p>
                  <p className="font-medium text-black dark:text-white">{reportData.investor.country || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                投资总结
              </h3>
            </div>
            <div className="p-6.5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">总承诺</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(reportData.summary.totalCommitment)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">已调用</p>
                  <p className="text-2xl font-bold text-warning">
                    {formatCurrency(reportData.summary.totalCalled)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">已分配</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(reportData.summary.totalDistributed)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">未调用</p>
                  <p className="text-2xl font-bold text-meta-7">
                    {formatCurrency(reportData.summary.totalUnfunded)}
                  </p>
                </div>
                <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">净投资</p>
                  <p className={`text-2xl font-bold ${reportData.summary.netInvested >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(reportData.summary.netInvested)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Commitments */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                承诺详情 ({reportData.commitments.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      基金
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      承诺金额
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      已调用
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      已分配
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      未调用
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      承诺日期
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      资本调用
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      分配
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.commitments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-600">
                        暂无承诺记录
                      </td>
                    </tr>
                  ) : (
                    reportData.commitments.map((commitment, index) => (
                      <tr key={index} className="border-b border-stroke dark:border-strokedark">
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white font-medium">
                            {commitment.fund.name}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {formatCurrency(commitment.commitmentAmount)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {formatCurrency(commitment.calledAmount)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {formatCurrency(commitment.distributedAmount)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {formatCurrency(commitment.unfundedCommitment)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {format(new Date(commitment.commitmentDate), 'yyyy-MM-dd')}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {commitment.capitalCalls.length}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-black dark:text-white">
                            {commitment.distributions.length}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">选择投资者并点击"生成报告"查看投资者报告数据</p>
          </div>
        </div>
      )}
    </div>
  );
}
