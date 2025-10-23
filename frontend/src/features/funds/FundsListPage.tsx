import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFunds } from './fundsSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FundsListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { funds, total, page, pageSize, loading } = useAppSelector(
    (state) => state.funds
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    dispatch(fetchFunds({ page, pageSize, search, status: statusFilter, fundType: typeFilter }));
  }, [dispatch, page, pageSize, search, statusFilter, typeFilter]);

  const handleCreateFund = () => {
    navigate('/funds/create');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      fundraising: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      investing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      harvesting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      liquidated: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  const getFundTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PE: 'Private Equity',
      VC: 'Venture Capital',
      RE: 'Real Estate',
      Infrastructure: 'Infrastructure',
      Debt: 'Debt',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          基金管理
        </h2>
        <button
          onClick={handleCreateFund}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 shadow-md"
        >
          + 创建基金
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <input
              type="text"
              placeholder="Search funds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">All Status</option>
              <option value="fundraising">Fundraising</option>
              <option value="investing">Investing</option>
              <option value="harvesting">Harvesting</option>
              <option value="liquidated">Liquidated</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">All Types</option>
              <option value="PE">Private Equity</option>
              <option value="VC">Venture Capital</option>
              <option value="RE">Real Estate</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Debt">Debt</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
              }}
              className="w-full rounded border border-stroke bg-transparent px-4 py-2 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
            >
              Reset
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
                  Fund Name
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Type
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Size
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Vintage
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Investments
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : funds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No funds found. Create your first fund to get started.
                  </td>
                </tr>
              ) : (
                funds.map((fund) => (
                  <tr
                    key={fund.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/funds/${fund.id}`)}
                        className="text-left hover:text-primary"
                      >
                        <p className="font-medium text-black dark:text-white">
                          {fund.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(fund.inceptionDate), 'MMM d, yyyy')}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{getFundTypeLabel(fund.fundType)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {formatCurrency(fund.totalSize, fund.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{fund.vintageYear}</p>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(fund.status)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">
                        {fund._count?.investments || 0} investments
                      </p>
                      <p className="text-xs text-gray-500">
                        {fund._count?.fundInvestors || 0} investors
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/funds/${fund.id}`)}
                          className="text-primary hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/funds/${fund.id}/edit`)}
                          className="text-meta-5 hover:underline"
                        >
                          Edit
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
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, total)} of {total} funds
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => dispatch(fetchFunds({ page: page - 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                Previous
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => dispatch(fetchFunds({ page: page + 1, pageSize }))}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-meta-4"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
