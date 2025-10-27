import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchInvestments, createInvestment } from "./investmentsSlice";
import { fetchFunds } from "../funds/fundsSlice";
import { Link } from "react-router";
import toast from "react-hot-toast";

export default function InvestmentsListPage() {
  const dispatch = useAppDispatch();
  const { investments, loading, pagination } = useAppSelector((state) => state.investments);
  const { funds } = useAppSelector((state) => state.funds);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fundId: "",
    companyName: "",
    industry: "",
    sector: "",
    region: "",
    country: "",
    investmentDate: "",
    investmentStage: "seed",
    investmentType: "equity",
    initialInvestment: "",
    ownershipPercentage: "",
    description: "",
    website: "",
  });

  useEffect(() => {
    document.title = "投资列表 - eFront 私募基金管理系统";
    dispatch(fetchInvestments({ page: 1, limit: 10 }));
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

  const openCreateModal = () => {
    setFormData({
      fundId: "",
      companyName: "",
      industry: "",
      sector: "",
      region: "",
      country: "",
      investmentDate: "",
      investmentStage: "seed",
      investmentType: "equity",
      initialInvestment: "",
      ownershipPercentage: "",
      description: "",
      website: "",
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
      const investmentData = {
        fundId: formData.fundId,
        companyName: formData.companyName,
        industry: formData.industry || undefined,
        sector: formData.sector || undefined,
        region: formData.region || undefined,
        country: formData.country || undefined,
        investmentDate: new Date(formData.investmentDate),
        investmentStage: formData.investmentStage as any,
        investmentType: formData.investmentType as any,
        initialInvestment: parseFloat(formData.initialInvestment) * 1000000,
        ownershipPercentage: formData.ownershipPercentage
          ? parseFloat(formData.ownershipPercentage) / 100
          : undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        status: "active" as any,
      };

      await dispatch(createInvestment(investmentData)).unwrap();
      toast.success("投资创建成功！");
      setShowModal(false);
      dispatch(fetchInvestments({ page: 1, limit: 10 }));
    } catch (error: any) {
      toast.error(error?.message || "创建失败，请重试");
    }
  };

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
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
        >
          + 新建投资
        </button>
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

      {/* 创建投资模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              新建投资
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

                  {/* 公司名称 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      公司名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFormChange}
                      required
                      placeholder="请输入公司名称"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 行业 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      行业
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleFormChange}
                      placeholder="例如：科技、医疗、消费"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 细分领域 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      细分领域
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleFormChange}
                      placeholder="例如：SaaS、生物制药"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 地区 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      地区
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleFormChange}
                      placeholder="例如：华东、华南"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 国家 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      国家
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      placeholder="例如：中国、美国"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 网站 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      公司网站
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleFormChange}
                      placeholder="https://example.com"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 投资信息 */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">投资信息</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* 投资日期 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      投资日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="investmentDate"
                      value={formData.investmentDate}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 投资阶段 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      投资阶段 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="investmentStage"
                      value={formData.investmentStage}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value="seed">种子轮</option>
                      <option value="early">早期</option>
                      <option value="growth">成长期</option>
                      <option value="late">后期</option>
                      <option value="buyout">并购</option>
                    </select>
                  </div>

                  {/* 投资类型 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      投资类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="investmentType"
                      value={formData.investmentType}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value="equity">股权</option>
                      <option value="debt">债权</option>
                      <option value="convertible">可转换债券</option>
                      <option value="preferred">优先股</option>
                    </select>
                  </div>

                  {/* 初始投资金额 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      初始投资金额 (百万元) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="initialInvestment"
                      value={formData.initialInvestment}
                      onChange={handleFormChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="例如：10.5"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  {/* 持股比例 */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      持股比例 (%)
                    </label>
                    <input
                      type="number"
                      name="ownershipPercentage"
                      value={formData.ownershipPercentage}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="例如：15.5"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 项目描述 */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="请输入项目描述、投资逻辑等信息"
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
