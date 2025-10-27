import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchInvestorReports,
  createInvestorReport,
  generateInvestorReport,
  sendInvestorReport,
  deleteInvestorReport,
  downloadInvestorReport,
  setPage,
  setPageSize,
} from "./reportsSlice";
import { fetchFunds } from "../funds/fundsSlice";
import { fetchInvestors } from "../investors/investorsSlice";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function InvestorReportPage() {
  const dispatch = useAppDispatch();
  const { investorReports, total, page, pageSize, loading } = useAppSelector(
    (state) => state.reports
  );
  const { funds } = useAppSelector((state) => state.funds);
  const { investors } = useAppSelector((state) => state.investors);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [selectedFundId, setSelectedFundId] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    investorId: "",
    fundId: "",
    reportType: "quarterly",
    year: new Date().getFullYear().toString(),
    quarter: "1",
    reportDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  useEffect(() => {
    document.title = "投资者报告 - eFront 私募基金管理系统";
    dispatch(fetchFunds());
    dispatch(fetchInvestors({}));
    loadReports();
  }, []);

  useEffect(() => {
    // Body scroll lock when modal is open
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

  const loadReports = () => {
    dispatch(
      fetchInvestorReports({
        page,
        pageSize,
        investorId: selectedInvestorId || undefined,
        fundId: selectedFundId || undefined,
        reportType: selectedReportType || undefined,
        year: selectedYear ? parseInt(selectedYear) : undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
      })
    );
  };

  const handleFilter = () => {
    dispatch(setPage(1));
    loadReports();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedInvestorId("");
    setSelectedFundId("");
    setSelectedReportType("");
    setSelectedYear("");
    setSelectedStatus("");
    dispatch(setPage(1));
    dispatch(fetchInvestorReports({ page: 1, pageSize }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        investorId: formData.investorId,
        fundId: formData.fundId,
        reportType: formData.reportType,
        year: parseInt(formData.year),
        quarter: formData.reportType === "quarterly" ? parseInt(formData.quarter) : undefined,
        reportDate: formData.reportDate,
        notes: formData.notes,
      };

      await dispatch(createInvestorReport(data)).unwrap();
      toast.success("报告创建成功");
      setShowModal(false);
      resetForm();
      loadReports();
    } catch (error: any) {
      toast.error(error.message || "创建报告失败");
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      await dispatch(generateInvestorReport(id)).unwrap();
      toast.success("报告生成成功");
      loadReports();
    } catch (error: any) {
      toast.error(error.message || "生成报告失败");
    }
  };

  const handleSend = async (id: string) => {
    try {
      await dispatch(sendInvestorReport(id)).unwrap();
      toast.success("报告发送成功");
      loadReports();
    } catch (error: any) {
      toast.error(error.message || "发送报告失败");
    }
  };

  const handleDownload = async (id: string, reportName: string) => {
    try {
      const blob = await dispatch(downloadInvestorReport(id)).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("报告下载成功");
    } catch (error: any) {
      toast.error(error.message || "下载报告失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这份报告吗？")) return;

    try {
      await dispatch(deleteInvestorReport(id)).unwrap();
      toast.success("报告删除成功");
      loadReports();
    } catch (error: any) {
      toast.error(error.message || "删除报告失败");
    }
  };

  const resetForm = () => {
    setFormData({
      investorId: "",
      fundId: "",
      reportType: "quarterly",
      year: new Date().getFullYear().toString(),
      quarter: "1",
      reportDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-meta-7', text: 'text-white', label: '草稿' },
      generated: { bg: 'bg-primary', text: 'text-white', label: '已生成' },
      sent: { bg: 'bg-success', text: 'text-white', label: '已发送' },
    };
    const badge = badges[status] || { bg: 'bg-meta-7', text: 'text-white', label: status };
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getReportTypeBadge = (reportType: string, quarter?: number) => {
    if (reportType === 'quarterly') {
      return (
        <span className="inline-flex rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Q{quarter} 季度
        </span>
      );
    }
    return (
      <span className="inline-flex rounded bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
        年度
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
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

  // Generate years array for dropdown (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            投资者报告
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            生成和查看投资者季度/年度报告
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          创建报告
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            筛选条件
          </h3>
        </div>
        <div className="p-6.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                搜索
              </label>
              <input
                type="text"
                placeholder="搜索投资者或基金..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                投资者
              </label>
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">全部投资者</option>
                {investors.map((investor) => (
                  <option key={investor.id} value={investor.id}>
                    {investor.name}
                  </option>
                ))}
              </select>
            </div>

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
                报告类型
              </label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">全部类型</option>
                <option value="quarterly">季度报告</option>
                <option value="annual">年度报告</option>
              </select>
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                年份
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">全部年份</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                状态
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="generated">已生成</option>
                <option value="sent">已发送</option>
              </select>
            </div>
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

      {/* Reports Table */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex items-center justify-between">
          <h3 className="font-medium text-black dark:text-white">
            报告列表
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            共 {total} 条记录
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  投资者
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  基金
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  报告类型
                </th>
                <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                  年份
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  报告日期
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  状态
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  生成时间
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-600">
                    加载中...
                  </td>
                </tr>
              ) : investorReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-600">
                    暂无数据
                  </td>
                </tr>
              ) : (
                investorReports.map((report) => (
                  <tr key={report.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white font-medium">
                        {report.investor?.name || '-'}
                      </p>
                      {report.investor?.email && (
                        <p className="text-sm text-gray-600">
                          {report.investor.email}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {report.fund?.name || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {getReportTypeBadge(report.reportType, report.quarter)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {report.year}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {format(new Date(report.reportDate), 'yyyy-MM-dd')}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {report.generatedAt
                          ? format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleGenerate(report.id)}
                            className="inline-flex items-center justify-center rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                            title="生成报告"
                          >
                            生成
                          </button>
                        )}
                        {report.status === 'generated' && (
                          <>
                            <button
                              onClick={() => handleSend(report.id)}
                              className="inline-flex items-center justify-center rounded bg-success px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                              title="发送报告"
                            >
                              发送
                            </button>
                            <button
                              onClick={() => handleDownload(report.id, `${report.investor?.name}-${report.year}-${report.reportType}`)}
                              className="inline-flex items-center justify-center rounded bg-meta-3 px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                              title="下载报告"
                            >
                              下载
                            </button>
                          </>
                        )}
                        {report.status === 'sent' && (
                          <button
                            onClick={() => handleDownload(report.id, `${report.investor?.name}-${report.year}-${report.reportType}`)}
                            className="inline-flex items-center justify-center rounded bg-meta-3 px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                            title="下载报告"
                          >
                            下载
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="inline-flex items-center justify-center rounded bg-danger px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                          title="删除报告"
                        >
                          删除
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
        {total > 0 && (
          <div className="border-t border-stroke py-4 px-6.5 dark:border-strokedark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  每页显示
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    dispatch(setPageSize(Number(e.target.value)));
                    dispatch(setPage(1));
                    loadReports();
                  }}
                  className="rounded border border-stroke py-1 px-2 outline-none dark:border-strokedark dark:bg-boxdark"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  条
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (page > 1) {
                      dispatch(setPage(page - 1));
                      loadReports();
                    }
                  }}
                  disabled={page === 1}
                  className="rounded border border-stroke py-1 px-3 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  第 {page} 页，共 {Math.ceil(total / pageSize)} 页
                </span>
                <button
                  onClick={() => {
                    if (page < Math.ceil(total / pageSize)) {
                      dispatch(setPage(page + 1));
                      loadReports();
                    }
                  }}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="rounded border border-stroke py-1 px-3 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showModal && (
        <div
          className="fixed left-0 top-0 z-[100000] flex h-full min-h-screen w-full items-center justify-center px-4 py-5"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="w-full max-w-3xl rounded-lg bg-white dark:bg-boxdark p-8 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-black dark:text-white">
                创建投资者报告
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    投资者 <span className="text-meta-1">*</span>
                  </label>
                  <select
                    required
                    value={formData.investorId}
                    onChange={(e) => setFormData({ ...formData, investorId: e.target.value })}
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
                    基金 <span className="text-meta-1">*</span>
                  </label>
                  <select
                    required
                    value={formData.fundId}
                    onChange={(e) => setFormData({ ...formData, fundId: e.target.value })}
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

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    报告类型 <span className="text-meta-1">*</span>
                  </label>
                  <select
                    required
                    value={formData.reportType}
                    onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="quarterly">季度报告</option>
                    <option value="annual">年度报告</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    年份 <span className="text-meta-1">*</span>
                  </label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.reportType === 'quarterly' && (
                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">
                      季度 <span className="text-meta-1">*</span>
                    </label>
                    <select
                      required
                      value={formData.quarter}
                      onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="1">第一季度 (Q1)</option>
                      <option value="2">第二季度 (Q2)</option>
                      <option value="3">第三季度 (Q3)</option>
                      <option value="4">第四季度 (Q4)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    报告日期 <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.reportDate}
                    onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  备注
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="输入备注信息..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center rounded bg-primary p-3 px-8 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? "创建中..." : "创建报告"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex justify-center rounded border border-stroke p-3 px-8 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
