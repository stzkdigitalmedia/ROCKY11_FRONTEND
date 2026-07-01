import { useState, useEffect } from "react";
import { apiHelper } from "../utils/apiHelper";
import { Download, RefreshCw, Gamepad2, Search, X } from "lucide-react";
import { useToastContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import clsx from "clsx";

const CasinoActivities = () => {
  const toast = useToastContext();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/suprime/super-admin', { replace: true });
  };

  // Filters
  const [filters, setFilters] = useState({
    clientName: "",
    gameName: "",
    provider: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });

  const fetchActivities = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(currentFilters.clientName && { clientName: currentFilters.clientName }),
        ...(currentFilters.gameName && { gameName: currentFilters.gameName }),
        ...(currentFilters.provider && { provider: currentFilters.provider }),
        ...(currentFilters.startDate && { startDate: currentFilters.startDate }),
        ...(currentFilters.endDate && { endDate: currentFilters.endDate }),
      }).toString();

      const res = await apiHelper.get(`/game/casino-activities?${queryParams}`);
      if (res?.success) {
        setActivities(res.data.activities);
        setPagination({
          ...pagination,
          page: res.data.pagination.page,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, []); // Initial load

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchActivities(1);
  };

  const handleReset = () => {
    const emptyFilters = {
      clientName: "",
      gameName: "",
      provider: "",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    fetchActivities(1, emptyFilters);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(filters.clientName && { clientName: filters.clientName }),
        ...(filters.gameName && { gameName: filters.gameName }),
        ...(filters.provider && { provider: filters.provider }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }).toString();

      const blob = await apiHelper.get(`/game/casino-activities/export?${queryParams}`, {
        responseType: 'blob',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `casino_activities_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Export successful!");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 admin-page">
      <Sidebar activeTab="casino-activities" onLogout={handleLogout} />

      <div className="flex-1 min-w-0 lg:ml-64">
        <AdminHeader
          title="Casino Activities"
          subtitle="Monitor users' casino gameplay and history"
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className={clsx('text-2xl', 'font-bold', 'text-gray-900', 'flex', 'items-center', 'gap-2')}>
              <Gamepad2 className="text-blue-600" /> Casino Activities
            </h1>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className={clsx('mt-2', 'sm:mt-0', 'flex', 'items-center', 'gap-2', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'px-4', 'py-2', 'rounded-lg', 'transition-colors', 'disabled:opacity-50', 'w-full', 'sm:w-auto', 'justify-center')}
            >
              {exportLoading ? <RefreshCw className={clsx('animate-spin', 'w-4', 'h-4')} /> : <Download className={clsx('w-4', 'h-4')} />}
              Export Excel
            </button>
          </div>

      {/* Filters */}
      <div className={clsx('bg-white', 'rounded-xl', 'p-4', 'border', 'border-gray-200', 'mb-6', 'grid', 'grid-cols-1', 'md:grid-cols-3', 'xl:grid-cols-6', 'gap-4', 'shadow-sm')}>
        <input
          type="text"
          name="clientName"
          placeholder="Client Name"
          value={filters.clientName}
          onChange={handleFilterChange}
          className={clsx('bg-white', 'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'text-gray-900', 'focus:outline-none', 'focus:border-blue-500')}
        />
        <input
          type="text"
          name="provider"
          placeholder="Provider"
          value={filters.provider}
          onChange={handleFilterChange}
          className={clsx('bg-white', 'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'text-gray-900', 'focus:outline-none', 'focus:border-blue-500')}
        />
        <input
          type="text"
          name="gameName"
          placeholder="Game Name"
          value={filters.gameName}
          onChange={handleFilterChange}
          className={clsx('bg-white', 'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'text-gray-900', 'focus:outline-none', 'focus:border-blue-500')}
        />
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className={clsx('bg-white', 'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'text-gray-900', 'focus:outline-none', 'focus:border-blue-500', 'w-full')}
          />
        <div className={clsx('flex', 'gap-2', 'flex-wrap', 'sm:flex-nowrap', 'md:col-span-2')}>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className={clsx('bg-white', 'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'text-gray-900', 'focus:outline-none', 'focus:border-blue-500', 'w-full')}
          />
          <button
            onClick={handleSearch}
            className={clsx('bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'flex', 'items-center', 'justify-center')}
            title="Search"
          >
            <Search className={clsx('w-5', 'h-5')} />
          </button>
          <button
            onClick={handleReset}
            className={clsx('bg-gray-200', 'text-gray-700', 'px-4', 'py-2', 'rounded-lg', 'hover:bg-gray-300', 'transition-colors', 'flex', 'items-center', 'justify-center')}
            title="Reset Filters"
          >
            <X className={clsx('w-5', 'h-5')} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={clsx('bg-white', 'rounded-xl', 'border', 'border-gray-200', 'overflow-hidden', 'shadow-sm')}>
        <div className="overflow-x-auto">
          <table className={clsx('w-full', 'text-left', 'text-sm', 'text-gray-700', 'whitespace-nowrap')}>
            <thead className={clsx('bg-gray-50', 'text-xs', 'uppercase', 'text-gray-600', 'border-b', 'border-gray-200')}>
              <tr>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>Client Name</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>Phone</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>IP Address</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>Game ID</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>Game</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>Provider</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold', 'text-center')}>Launch Count</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold', 'text-center')}>Play Count</th>
                <th className={clsx('px-6', 'py-4', 'font-semibold')}>Last Launched</th>
              </tr>
            </thead>
            <tbody className={clsx('divide-y', 'divide-gray-200')}>
              {loading ? (
                <tr>
                  <td colSpan="9" className={clsx('px-6', 'py-8', 'text-center', 'text-gray-500')}>
                    <RefreshCw className={clsx('animate-spin', 'w-6', 'h-6', 'mx-auto', 'mb-2', 'text-blue-600')} />
                    Loading activities...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="9" className={clsx('px-6', 'py-8', 'text-center', 'text-gray-500')}>
                    No casino activities found.
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity._id} className={clsx('hover:bg-gray-50', 'transition-colors')}>
                    <td className={clsx('px-6', 'py-4', 'font-medium', 'text-gray-900')}>{activity.clientName}</td>
                    <td className={clsx('px-6', 'py-4')}>{activity.phone || "-"}</td>
                    <td className={clsx('px-6', 'py-4')}>
                      {activity.ipAddresses && activity.ipAddresses.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span>{activity.ipAddresses[activity.ipAddresses.length - 1]}</span>
                          {activity.ipAddresses.length > 1 && (
                            <div className="relative group flex items-center">
                              <span className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer">
                                +{activity.ipAddresses.length - 1}
                              </span>
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg z-50 w-max max-w-xs whitespace-normal break-words text-left">
                                {activity.ipAddresses.join(", ")}
                                <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className={clsx('px-6', 'py-4')}>{activity.gameId}</td>
                    <td className={clsx('px-6', 'py-4', 'text-blue-600', 'font-medium')}>{activity.gameName || "-"}</td>
                    <td className={clsx('px-6', 'py-4')}>{activity.provider || "-"}</td>
                    <td className={clsx('px-6', 'py-4', 'text-center')}>
                      <span className={clsx('bg-gray-100', 'text-gray-700', 'py-1', 'px-3', 'rounded-full', 'text-xs')}>{activity.launchCount}</span>
                    </td>
                    <td className={clsx('px-6', 'py-4', 'text-center')}>
                      <span className={clsx('bg-gray-100', 'text-gray-700', 'py-1', 'px-3', 'rounded-full', 'text-xs')}>{activity.playCount}</span>
                    </td>
                    <td className={clsx('px-6', 'py-4', 'text-gray-500')}>
                      {activity.lastLaunchedAt
                        ? new Date(activity.lastLaunchedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {(pagination.total > 0) && (
          <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'justify-between', 'items-center', 'p-4', 'border-t', 'border-gray-200', 'bg-gray-50')}>
            <span className={clsx('text-gray-500', 'text-sm')}>
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className={clsx('flex', 'gap-2')}>
              <button
                onClick={() => fetchActivities(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={clsx('px-3', 'py-1', 'bg-white', 'border', 'border-gray-300', 'rounded', 'text-gray-700', 'disabled:opacity-50', 'hover:bg-gray-50', 'transition-colors')}
              >
                Previous
              </button>
              <button
                onClick={() => fetchActivities(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={clsx('px-3', 'py-1', 'bg-white', 'border', 'border-gray-300', 'rounded', 'text-gray-700', 'disabled:opacity-50', 'hover:bg-gray-50', 'transition-colors')}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
};

export default CasinoActivities;
