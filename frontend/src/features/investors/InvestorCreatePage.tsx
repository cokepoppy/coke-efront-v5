import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../store/hooks";
import { createInvestor } from "./investorsSlice";
import toast from "react-hot-toast";

export default function InvestorCreatePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    investorType: "institutional",
    entityType: "corporation",
    domicile: "",
    country: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    kycStatus: "pending",
    amlStatus: "pending",
    accredited: false,
    notes: "",
  });

  useEffect(() => {
    document.title = "添加投资者 - eFront 私募基金管理系统";
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const investorData = {
        name: formData.name,
        investorType: formData.investorType as any,
        entityType: formData.entityType as any,
        domicile: formData.domicile || undefined,
        country: formData.country || undefined,
        taxId: formData.taxId || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        kycStatus: formData.kycStatus as any,
        amlStatus: formData.amlStatus as any,
        accredited: formData.accredited,
        status: 'active' as any,
        notes: formData.notes || undefined,
      };

      await dispatch(createInvestor(investorData)).unwrap();
      toast.success("投资者添加成功！");
      navigate(`/investors`);
    } catch (error: any) {
      toast.error(error?.message || "添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            添加投资者
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            添加新的投资者（LP）信息
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/investors")}
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
              {/* 投资者名称 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  投资者名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="请输入投资者名称"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 投资者类型 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  投资者类型 <span className="text-red-500">*</span>
                </label>
                <select
                  name="investorType"
                  value={formData.investorType}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="institutional">机构投资者</option>
                  <option value="corporate">企业投资者</option>
                  <option value="familyOffice">家族办公室</option>
                  <option value="hnwi">高净值个人</option>
                  <option value="fundOfFunds">基金中的基金</option>
                </select>
              </div>

              {/* 实体类型 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  实体类型
                </label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="individual">个人</option>
                  <option value="partnership">合伙企业</option>
                  <option value="corporation">公司</option>
                  <option value="trust">信托</option>
                </select>
              </div>

              {/* 注册地 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  注册地
                </label>
                <input
                  type="text"
                  name="domicile"
                  value={formData.domicile}
                  onChange={handleChange}
                  placeholder="请输入注册地"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 国家/地区 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  国家/地区
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="请输入国家/地区"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 税号 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  税号
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="请输入税号"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 联系信息 */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              联系信息
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 邮箱 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  邮箱
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱地址"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 电话 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  电话
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="请输入电话号码"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* 地址 */}
              <div className="md:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  地址
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="请输入详细地址"
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 合规信息 */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              合规信息
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* KYC状态 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  KYC状态
                </label>
                <select
                  name="kycStatus"
                  value={formData.kycStatus}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="pending">待审核</option>
                  <option value="inProgress">审核中</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>

              {/* AML状态 */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  AML状态
                </label>
                <select
                  name="amlStatus"
                  value={formData.amlStatus}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value="pending">待审核</option>
                  <option value="inProgress">审核中</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>

              {/* 认证投资者 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="accredited"
                  checked={formData.accredited}
                  onChange={handleChange}
                  id="accredited"
                  className="h-5 w-5 rounded border-stroke bg-gray text-primary focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-meta-4"
                />
                <label
                  htmlFor="accredited"
                  className="ml-3 text-sm font-medium text-black dark:text-white"
                >
                  认证投资者
                </label>
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              备注信息
            </h3>
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                备注
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="请输入备注信息"
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/investors")}
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
