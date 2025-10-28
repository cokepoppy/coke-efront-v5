import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchValuations,
  createValuation,
  updateValuation,
  deleteValuation,
} from "../valuations/valuationsSlice";
import { fetchInvestments } from "./investmentsSlice";
import toast from "react-hot-toast";

export default function ValuationsPage() {
  const dispatch = useAppDispatch();
  const { valuations, loading, pagination } = useAppSelector(
    (state) => state.valuations
  );
  const { investments } = useAppSelector((state) => state.investments);

  const [filters, setFilters] = useState({
    investmentId: "",
    valuationMethod: "",
    audited: "",
    search: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingValuation, setEditingValuation] = useState<any>(null);
  const [formData, setFormData] = useState({
    investmentId: "",
    valuationDate: "",
    fairValue: "",
    valuationMethod: "market",
    multiple: "",
    notes: "",
    audited: false,
  });

  useEffect(() => {
    document.title = "估值管理 - eFront 私募基金管理系统";
    dispatch(fetchValuations({}));
    dispatch(fetchInvestments({ page: 1, limit: 100 }));
  }, [dispatch]);

  // 处理模态框打开时的 body 滚动锁定
  useEffect(() => {
    if (showModal) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      // 锁定body滚动
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // 恢复body滚动
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // 恢复滚动位置
        window.scrollTo(0, scrollY);
      };
    }
  }, [showModal]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    dispatch(
      fetchValuations({
        investmentId: filters.investmentId || undefined,
        valuationMethod: filters.valuationMethod || undefined,
        audited:
          filters.audited === ""
            ? undefined
            : filters.audited === "true",
        search: filters.search || undefined,
      })
    );
  };

  const handleClearFilters = () => {
    setFilters({
      investmentId: "",
      valuationMethod: "",
      audited: "",
      search: "",
    });
    dispatch(fetchValuations({}));
  };

  const openCreateModal = () => {
    setEditingValuation(null);
    setFormData({
      investmentId: "",
      valuationDate: "",
      fairValue: "",
      valuationMethod: "market",
      multiple: "",
      notes: "",
      audited: false,
    });
    setShowModal(true);
  };

  const openEditModal = (valuation: any) => {
    setEditingValuation(valuation);
    setFormData({
      investmentId: valuation.investmentId,
      valuationDate: valuation.valuationDate.split("T")[0],
      fairValue: (valuation.fairValue / 1000000).toString(),
      valuationMethod: valuation.valuationMethod,
      multiple: valuation.multiple?.toString() || "",
      notes: valuation.notes || "",
      audited: valuation.audited,
    });
    setShowModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

    try {
      const data = {
        investmentId: formData.investmentId,
        valuationDate: new Date(formData.valuationDate),
        fairValue: parseFloat(formData.fairValue) * 1000000,
        valuationMethod: formData.valuationMethod as any,
        multiple: formData.multiple ? parseFloat(formData.multiple) : undefined,
        notes: formData.notes || undefined,
        audited: formData.audited,
      };

      if (editingValuation) {
        await dispatch(
          updateValuation({ id: editingValuation.id, data })
        ).unwrap();
        toast.success("估值更新成功！");
      } else {
        await dispatch(createValuation(data)).unwrap();
        toast.success("估值创建成功！");
      }

      setShowModal(false);
      dispatch(fetchValuations({}));
    } catch (error: any) {
      toast.error(error?.message || "操作失败，请重试");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这条估值记录吗？")) {
      return;
    }

    try {
      await dispatch(deleteValuation(id)).unwrap();
      toast.success("估值删除成功！");
      dispatch(fetchValuations({}));
    } catch (error: any) {
      toast.error(error?.message || "删除失败，请重试");
    }
  };

  const getValuationMethodBadge = (method: string) => {
    const methodLabels: Record<string, string> = {
      market: "市场法",
      income: "收益法",
      cost: "成本法",
      transaction: "交易法",
    };

    const methodColors: Record<string, string> = {
      market: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      income:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cost: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      transaction:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
          methodColors[method] || "bg-gray-100 text-gray-800"
        }`}
      >
        {methodLabels[method] || method}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            估值管理
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            管理投资项目的估值和价值评估
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600"
        >
          新建估值
        </button>
      </div>

      {/* 筛选区 */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          筛选条件
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              投资项目
            </label>
            <select
              name="investmentId"
              value={filters.investmentId}
              onChange={handleFilterChange}
              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">全部项目</option>
              {investments.map((investment) => (
                <option key={investment.id} value={investment.id}>
                  {investment.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              估值方法
            </label>
            <select
              name="valuationMethod"
              value={filters.valuationMethod}
              onChange={handleFilterChange}
              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">全部方法</option>
              <option value="market">市场法</option>
              <option value="income">收益法</option>
              <option value="cost">成本法</option>
              <option value="transaction">交易法</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              审计状态
            </label>
            <select
              name="audited"
              value={filters.audited}
              onChange={handleFilterChange}
              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">全部</option>
              <option value="true">已审计</option>
              <option value="false">未审计</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              搜索
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="搜索项目或备注"
              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleApplyFilters}
            className="inline-flex items-center rounded-md bg-brand-500 px-6 py-2 text-center font-medium text-white hover:bg-brand-600"
          >
            应用筛选
          </button>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center rounded-md border border-stroke px-6 py-2 text-center font-medium hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
          >
            清除筛选
          </button>
        </div>
      </div>

      {/* 估值列表 */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  估值日期
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  投资项目
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  所属基金
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  公允价值
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  估值方法
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  倍数
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  审计状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    加载中...
                  </td>
                </tr>
              ) : valuations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    暂无估值记录
                  </td>
                </tr>
              ) : (
                valuations.map((valuation) => (
                  <tr
                    key={valuation.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="px-4 py-5">
                      {new Date(valuation.valuationDate).toLocaleDateString(
                        "zh-CN"
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {valuation.investment?.companyName || "-"}
                    </td>
                    <td className="px-4 py-5">
                      {valuation.investment?.fund?.name || "-"}
                    </td>
                    <td className="px-4 py-5 font-medium">
                      {formatCurrency(valuation.fairValue)}
                    </td>
                    <td className="px-4 py-5">
                      {getValuationMethodBadge(valuation.valuationMethod)}
                    </td>
                    <td className="px-4 py-5">
                      {valuation.multiple
                        ? `${Number(valuation.multiple).toFixed(2)}x`
                        : "-"}
                    </td>
                    <td className="px-4 py-5">
                      {valuation.audited ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                          已审计
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          未审计
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(valuation)}
                          className="text-primary hover:underline"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(valuation.id)}
                          className="text-red-500 hover:underline"
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

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              共 {pagination.total} 条记录
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  dispatch(fetchValuations({ page: pagination.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="rounded border border-stroke px-4 py-2 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
              >
                上一页
              </button>
              <span className="flex items-center px-4">
                第 {pagination.page} / {pagination.totalPages} 页
              </span>
              <button
                onClick={() =>
                  dispatch(fetchValuations({ page: pagination.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="rounded border border-stroke px-4 py-2 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-boxdark">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              {editingValuation ? "编辑估值" : "新建估值"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 投资项目 */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    投资项目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="investmentId"
                    value={formData.investmentId}
                    onChange={handleFormChange}
                    required
                    disabled={!!editingValuation}
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="">请选择投资项目</option>
                    {investments.map((investment) => (
                      <option key={investment.id} value={investment.id}>
                        {investment.companyName} - {investment.fund?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 估值日期 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    估值日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="valuationDate"
                    value={formData.valuationDate}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 公允价值 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    公允价值 (百万元) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="fairValue"
                    value={formData.fairValue}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="例如：10.5"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 估值方法 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    估值方法 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="valuationMethod"
                    value={formData.valuationMethod}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <option value="market">市场法</option>
                    <option value="income">收益法</option>
                    <option value="cost">成本法</option>
                    <option value="transaction">交易法</option>
                  </select>
                </div>

                {/* 倍数 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    倍数 (Multiple)
                  </label>
                  <input
                    type="number"
                    name="multiple"
                    value={formData.multiple}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    placeholder="例如：2.5"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* 已审计 */}
                <div className="flex items-center md:col-span-2">
                  <input
                    type="checkbox"
                    name="audited"
                    checked={formData.audited}
                    onChange={handleFormChange}
                    id="audited"
                    className="h-5 w-5 rounded border-stroke bg-gray text-primary focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-meta-4"
                  />
                  <label
                    htmlFor="audited"
                    className="ml-3 text-sm font-medium text-black dark:text-white"
                  >
                    已审计
                  </label>
                </div>

                {/* 备注 */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    备注
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="请输入备注信息"
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>
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
                  {editingValuation ? "更新" : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
