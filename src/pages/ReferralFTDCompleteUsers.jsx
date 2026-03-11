import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const ReferralFTDCompleteUsers = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [branchNames, setBranchNames] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const toast = useToastContext();

    const handleLogout = async () => {
        const userRole = localStorage.getItem('userRole') || user?.role;
        await logout();
        if (userRole === 'SA' || userRole === 'SubAdmin') {
            navigate('/suprime/super-admin', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    };

    const handleNavigation = (tab) => {
        switch (tab) {
            case 'dashboard':
                navigate('/dashboard');
                break;
            default:
                break;
        }
    };

    const fetchBranchNames = async () => {
        try {
            const response = await apiHelper.get('/referal/getUniqueBranchNames');
            setBranchNames(response?.data || []);
        } catch (error) {
            console.error('Failed to fetch branch names:', error);
        }
    };

    const fetchFTDCompleteUsers = async (startDate = dateRange[0].startDate, endDate = dateRange[0].endDate, currentPage = page) => {
        setLoading(true);
        try {
            const startDateStr = startDate.getFullYear() + '-' +
                String(startDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(startDate.getDate()).padStart(2, '0');

            const endDateStr = endDate.getFullYear() + '-' +
                String(endDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(endDate.getDate()).padStart(2, '0');

            const payload = {
                startDate: startDateStr,
                endDate: endDateStr,
                page: currentPage,
                limit: 500,
                referalCode: selectedBranch
            };

            const response = await apiHelper.post('/referal/getTodayFTD_For_Referal_Dashboard', payload);
            const usersData = response?.users || [];
            const pagination = response?.pagination || {};

            setUsers(Array.isArray(usersData) ? usersData : []);
            setTotalPages(pagination.totalPages || 1);
            setTotalRecords(pagination.totalRecords || 0);
        } catch (error) {
            toast.error('Failed to fetch FTD complete users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (ranges) => {
        setDateRange([ranges.selection]);
    };

    const applyDateFilter = () => {
        setShowDatePicker(false);
        setPage(1);
        fetchFTDCompleteUsers(dateRange[0].startDate, dateRange[0].endDate, 1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchFTDCompleteUsers(dateRange[0].startDate, dateRange[0].endDate, newPage);
    };

    useEffect(() => {
        fetchBranchNames();
        fetchFTDCompleteUsers();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            setPage(1);
            fetchFTDCompleteUsers(dateRange[0].startDate, dateRange[0].endDate, 1);
        }
    }, [selectedBranch]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar activeTab="dashboard" setActiveTab={handleNavigation} onLogout={handleLogout} />

            <div className="flex-1 lg:ml-64">
                <AdminHeader
                    title="FTD Complete Users"
                    subtitle="Users who completed their first transaction today"
                />

                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={() => navigate('/referral')}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[150px]"
                            >
                                <option value="">Select Branch</option>
                                {branchNames.map((branch, index) => (
                                    <option key={index} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                            <div className="relative">
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Calendar className="w-4 h-4" />
                                    {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
                                        ? dateRange[0].startDate.toDateString()
                                        : `${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`
                                    }
                                </button>
                                {showDatePicker && (
                                    <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-lg border">
                                        <DateRangePicker
                                            ranges={dateRange}
                                            onChange={handleDateRangeChange}
                                            showSelectionPreview={false}
                                            moveRangeOnFirstSelection={false}
                                            months={1}
                                            direction="horizontal"
                                        />
                                        <div className="p-3 border-t flex justify-end gap-2">
                                            <button
                                                onClick={() => setShowDatePicker(false)}
                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={applyDateFilter}
                                                className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">FTD Complete Users</h3>
                                    <span className="text-sm text-gray-500">({totalRecords} total)</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
                                        ? `Date: ${dateRange[0].startDate.toLocaleDateString()}`
                                        : `Date Range: ${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                                    }
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
                                    <p className="text-gray-600 font-medium">Loading users...</p>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium mb-2">No FTD Complete Users Found</p>
                                    <p className="text-gray-500 text-sm">No users completed their first transaction in the selected date range.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user, index) => (
                                            <tr key={user.userId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(page - 1) * 500 + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.clientName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.branchName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.referalCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                    ₹{user.amount?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{user.balance?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(user.transactionCreatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing page {page} of {totalPages} ({totalRecords} total records)
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralFTDCompleteUsers; 