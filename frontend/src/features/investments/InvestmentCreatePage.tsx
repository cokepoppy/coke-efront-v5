import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createInvestment } from "./investmentsSlice";
import { fetchFunds } from "../funds/fundsSlice";
import toast from "react-hot-toast";

export default function InvestmentCreatePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { funds } = useAppSelector((state) => state.funds);
  const [loading, setLoading] = useState(false);

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
    document.title = "创建投资 - eFront 私募基金管理系统";
    // 获取基金列表
    dispatch(fetchFunds({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        initialInvestment: parseFloat(formData.initialInvestment) * 1000000, // Convert to actual amount
        ownershipPercentage: formData.ownershipPercentage
          ? parseFloat(formData.ownershipPercentage) / 100
          : undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        status: "active" as any,
      };

      await dispatch(createInvestment(investmentData)).unwrap();
      toast.success("投资创建成功！");
      navigate(`/investments`);
    } catch (error: any) {
      toast.error(error?.message || "创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            创建投资
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            添加新的投资项目
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/investments")}
          className="inline-flex items-center rounded-md border border-stroke px-6 py-3 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
        >
          返回列表
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit}>
          {/* 基本信息 */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              基本信息
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 所属基金 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  所属基金 <span className="text-red-500">*</span>
                </label>
                <select
                  name="fundId"
                  value={formData.fundId}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 投资信息 */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              投资信息
            </h3>
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="equity">股权</option>
                  <option value="debt">债权</option>
                  <option value="convertible">可转换债券</option>
                  <option value="preferred">优先股</option>
                </select>
              </div>

              {/* 初始投资金额 (百万) */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  初始投资金额 (百万元) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="initialInvestment"
                  value={formData.initialInvestment}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="例如：10.5"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 持股比例 (%) */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  持股比例 (%)
                </label>
                <input
                  type="number"
                  name="ownershipPercentage"
                  value={formData.ownershipPercentage}
                  onChange={handleChange}
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
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              项目描述
            </h3>
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                描述
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="请输入项目描述、投资逻辑等信息"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/investments")}
              className="inline-flex items-center justify-center rounded-md border border-stroke px-10 py-3 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-10 py-3 text-center font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "提交中..." : "提交"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
