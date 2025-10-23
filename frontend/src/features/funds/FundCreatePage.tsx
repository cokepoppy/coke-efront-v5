import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../store/hooks";
import { createFund } from "./fundsSlice";
import toast from "react-hot-toast";

export default function FundCreatePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    fundType: "PE",
    vintageYear: new Date().getFullYear(),
    currency: "CNY",
    totalSize: "",
    fundTerm: "",
    extensionPeriod: "",
    inceptionDate: "",
  });

  useEffect(() => {
    document.title = "创建基金 - eFront 私募基金管理系统";
  }, []);

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
      const fundData = {
        name: formData.name,
        fundType: formData.fundType,
        vintageYear: formData.vintageYear,
        currency: formData.currency,
        totalSize: parseFloat(formData.totalSize) * 1000000, // Convert millions to actual amount
        inceptionDate: new Date(formData.inceptionDate),
        fundTerm: formData.fundTerm ? parseInt(formData.fundTerm) : undefined,
        extensionPeriod: formData.extensionPeriod ? parseInt(formData.extensionPeriod) : undefined,
      };

      const result = await dispatch(createFund(fundData)).unwrap();
      toast.success("基金创建成功！");
      navigate(`/funds`);
    } catch (error: any) {
      toast.error(error?.message || "创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          创建基金
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          创建新的私募股权基金
        </p>
      </div>

      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 基金名称 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                基金名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="请输入基金名称"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>

            {/* 基金类型 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                基金类型 <span className="text-red-500">*</span>
              </label>
              <select
                name="fundType"
                value={formData.fundType}
                onChange={handleChange}
                required
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                <option value="PE">私募股权 (PE)</option>
                <option value="VC">风险投资 (VC)</option>
                <option value="RE">房地产 (RE)</option>
                <option value="Infrastructure">基础设施</option>
                <option value="Debt">债务基金</option>
              </select>
            </div>

            {/* 年份 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                年份 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="vintageYear"
                value={formData.vintageYear}
                onChange={handleChange}
                required
                min="2000"
                max="2100"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>

            {/* 货币 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                货币 <span className="text-red-500">*</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                <option value="CNY">人民币 (CNY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">欧元 (EUR)</option>
                <option value="GBP">英镑 (GBP)</option>
                <option value="HKD">港币 (HKD)</option>
              </select>
            </div>

            {/* 目标规模 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                目标规模（百万） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalSize"
                value={formData.totalSize}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="请输入目标规模"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>

            {/* 成立日期 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                成立日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="inceptionDate"
                value={formData.inceptionDate}
                onChange={handleChange}
                required
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>

            {/* 基金期限（月） */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                基金期限（月）
              </label>
              <input
                type="number"
                name="fundTerm"
                value={formData.fundTerm}
                onChange={handleChange}
                min="0"
                placeholder="例如: 120"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>

            {/* 延期期限（月） */}
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                延期期限（月）
              </label>
              <input
                type="number"
                name="extensionPeriod"
                value={formData.extensionPeriod}
                onChange={handleChange}
                min="0"
                placeholder="例如: 24"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>

          {/* 按钮 */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/funds")}
              className="rounded border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? "创建中..." : "创建基金"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
