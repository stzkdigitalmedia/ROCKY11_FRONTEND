import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import { useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useToastContext } from '../App';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import AllInOneTransactions from '../components/AllInOneTransactions';

const AllInOneReq = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const toast = useToastContext();
    const refreshRef = useRef(null);
    const { on, off } = useSocket(user?.clientName);

    useEffect(() => {
        const handleNewTransaction = (data) => {
            toast.success(`New INSTANT PAYOUT request from ${data?.clientName || 'a user'} — ₹${data?.amount}`);
            if (refreshRef.current) refreshRef.current();
        };

        on('NEW_ALLINONE_TRANSACTION', handleNewTransaction);
        return () => off('NEW_ALLINONE_TRANSACTION', handleNewTransaction);
    }, []);

    const handleLogout = async () => {
        try {
            await apiHelper.get('/auth/logout');
        } catch (_) {}
        logout();
        const role = localStorage.getItem('userRole') || user?.role;
        navigate(role === 'SA' || role === 'SubAdmin' ? '/suprime/super-admin' : '/login', { replace: true });
    };

    const handleNavigation = (tab) => {
        const routes = {
            dashboard: '/dashboard',
            overview: '/overview',
            games: '/games',
            panels: '/panels',
            settings: '/settings',
            'balance-logs': '/balance-logs',
            'transaction-history': '/transaction-history',
            'transaction-logs': '/transaction-logs',
            'tier-management': '/tier-management',
            'telegram-otp': '/telegram-otp',
            bonuses: '/sa-bonuses',
            referral: '/referral',
            'allinreq': '/allinreq',
        };
        if (routes[tab]) navigate(routes[tab]);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar activeTab="allinreq" setActiveTab={handleNavigation} onLogout={handleLogout} />
            <div className="flex-1 lg:ml-64">
                <AdminHeader
                    title="INSTANT PAYOUT Requests"
                    subtitle="All ALLINONE branch transactions"
                />
                <div className="p-4 sm:p-6 lg:p-8">
                    <AllInOneTransactions onRegisterRefresh={(fn) => { refreshRef.current = fn; }} />
                </div>
            </div>
        </div>
    );
};

export default AllInOneReq;
