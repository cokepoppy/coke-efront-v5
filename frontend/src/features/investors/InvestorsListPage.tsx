import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchInvestors } from './investorsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InvestorsListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { investors, total, page, pageSize, loading } = useAppSelector(
    (state) => state.investors
  );

  const [search, setSearch] = useState('');
  const [investorTypeFilter, setInvestorTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');

  useEffect(() => {
    document.title = "投资者列表 - eFront 私募基金管理系统";
  }, []);

  useEffect(() => {
    dispatch(
      fetchInvestors({
        page,
        pageSize,
        search,
        investorType: investorTypeFilter,
        status: statusFilter,
        kycStatus: kycStatusFilter,
      })
    );
  }, [dispatch, page, pageSize, search, investorTypeFilter, statusFilter, kycStatusFilter]);

  const handleCreateInvestor = () => {
    navigate('/investors/create');
  };

  const getInvestorTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      institutional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      corporate: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      familyOffice: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      hnwi: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      fundOfFunds: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };

    const typeLabels: Record<string, string> = {
      institutional: '机构投资者',
      corporate: '企业投资者',
      familyOffice: '家族办公室',
      hnwi: '高净值个人',
      fundOfFunds: '基金中的基金',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          typeColors[type] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {typeLabels[type] || type}
      </span>
    );
  };

  const getKycStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const statusLabels: Record<string, string> = {
      pending: '待审核',
      inProgress: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    const statusLabels: Record<string, string> = {
      active: '活跃',
      inactive: '非活跃',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            投资者管理
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理所有投资者（LP）信息和关系
          </p>
        </div>
        <button
          onClick={handleCreateInvestor}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 shadow-md"
        >
          + 添加投资者
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <input
              type="text"
              placeholder="搜索投资者..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>
          <div>
            <select
              value={investorTypeFilter}
              onChange={(e) => setInvestorTypeFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有类型</option>
              <option value="institutional">机构投资者</option>
              <option value="corporate">企业投资者</option>
              <option value="familyOffice">家族办公室</option>
              <option value="hnwi">高净值个人</option>
              <option value="fundOfFunds">基金中的基金</option>
            </select>
          </div>
          <div>
            <select
              value={kycStatusFilter}
              onChange={(e) => setKycStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有KYC状态</option>
              <option value="pending">待审核</option>
              <option value="inProgress">审核中</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearch('');
                setInvestorTypeFilter('');
                setStatusFilter('');
                setKycStatusFilter('');
              }}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  投资者名称
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  类型
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  国家/地区
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  KYC状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  认证状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  基金数量
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  状态
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    加载中...
                  </td>
                </tr>
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    暂无投资者数据。点击上方按钮添加第一个投资者。
                  </td>
                </tr>
              ) : (
                investors.map((investor) => (
                  <tr
                    key={investor.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/investors/${investor.id}`)}
                        className="text-left hover:text-primary"
                      >
                        <p className="font-medium text-black dark:text-white">
                          {investor.name}
                        </p>
                        {investor.email && (
                          <p className="text-xs text-gray-500">{investor.email}</p>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      {getInvestorTypeBadge(investor.investorType)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{investor.country || '-'}</p>
                    </td>
                    <td className="px-4 py-4">
                      {getKycStatusBadge(investor.kycStatus)}
                    </td>
                    <td className="px-4 py-4">
                      {investor.accredited ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          已认证
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          未认证
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">
                        {investor._count?.fundInvestors || 0} 个基金
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(investor.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/investors/${investor.id}`)}
                          className="text-primary hover:underline"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => navigate(`/investors/${investor.id}/edit`)}
                          className="text-meta-5 hover:underline"
                        >
                          编辑
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
        {total > pageSize && (
          <div className="flex items-center justify-between border-t border-stroke p-4 dark:border-strokedark">
            <p className="text-sm text-gray-500">
              显示 {(page - 1) * pageSize + 1} 到{' '}
              {Math.min(page * pageSize, total)} 共 {total} 个投资者
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => dispatch(fetchInvestors({ page: page - 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                上一页
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => dispatch(fetchInvestors({ page: page + 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
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
