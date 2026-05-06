import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersList from './UsersList';
import AddUserForm from './AddUserForm';
import { Users, Calendar, RotateCcw, RefreshCw } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  const colorMap = { 'PayIn': '#22c55e', 'PayOut': '#ef4444', 'PayIn Count': '#22c55e', 'PayOut Count': '#ef4444' };
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      {label && <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</p>}
      {payload.map((p, i) => {
        const color = colorMap[p.name] || (typeof p.color === 'string' && !p.color.startsWith('url') ? p.color : p.fill && !p.fill.startsWith('url') ? p.fill : '#fff');
        return (
          <p key={i} style={{ color, fontWeight: 600, fontSize: 13, margin: '2px 0' }}>
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </p>
        );
      })}
    </div>
  );
};

const GraphCard = ({ title, subtitle, children }) => (
  <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: 16, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const useWindowSize = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const StatSideCards = ({ items, horizontal }) => (
  <div style={horizontal
    ? { display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8, marginBottom: 16 }
    : { display: 'flex', flexDirection: 'column', gap: 10, width: 200, flexShrink: 0 }
  }>
    {items.map((item, i) => (
      <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', borderLeft: `4px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{item.name}</span>
        <span style={{ fontSize: horizontal ? 15 : 18, fontWeight: 800, color: item.color }}>{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
      </div>
    ))}
  </div>
);

const CasinoTable = ({ title, columns, data, loading }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>{title}</h2>
    {loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div className="loading-spinner" style={{ width: 36, height: 36 }}></div>
      </div>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {columns.map((col, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No data available</td></tr>
            ) : data.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {columns.map((col, ci) => (
                  <td key={ci} style={{ padding: '10px 14px', textAlign: ci === 0 ? 'left' : 'right', color: '#0f172a', fontWeight: ci === 0 ? 600 : 400 }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const OverviewStats = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [dashSummary, setDashSummary] = useState(null);
  const [activeUsercount, setActiveUsercount] = useState(null);
  const [deleteIdsCount, setDeleteIdsCount] = useState(0);
  const [todayDepositCount, setTodayDepositCount] = useState(0);
  const [todayWithdrawalCount, setTodayWithdrawalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ftdPendingLoading, setFtdPendingLoading] = useState(false);
  const [ftdCompleteLoading, setFtdCompleteLoading] = useState(false);
  const [casinoLoading, setCasinoLoading] = useState(false);
  const [casinoSubTab, setCasinoSubTab] = useState('games');
  const [topGames, setTopGames] = useState([]);
  const [gamesPagination, setGamesPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [gamesPage, setGamesPage] = useState(1);
  const [topProviders, setTopProviders] = useState([]);
  const [providerPagination, setProviderPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [providerPage, setProviderPage] = useState(1);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [playersPagination, setPlayersPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [playersPage, setPlayersPage] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
  const [panelStats, setPanelStats] = useState(null);
  const hasFetched = useRef(false);
  const toast = useToastContext();
  const navigate = useNavigate();

  const fetchDashboardSummary = async (startDate, endDate) => {
    setLoading(true);
    try {
      const start = startDate || new Date();
      const end = endDate || new Date();
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      // Make main API calls in parallel (excluding FTD data)
      const [payInOutResponse, userRegResponse, statusWiseResponse, bonusResponse, deleteIdsResponse, activeUserResponse, todayDepositResponse, todayWithdrawalResponse, panelResponse] = await Promise.all([
        apiHelper.get(`/transaction/dash-transaction-DW-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-user-registration-count-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-transaction-statusWise-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-bonus-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.post('/deletelog/getCount_of_DeleteId', { startDate: startStr, endDate: endStr }),
        apiHelper.post('/user/getActiveUserLogsCount', { startDate: startStr, endDate: endStr }),
        apiHelper.get(`/transaction/getDeposit_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/getWithdraw_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.post('/transaction/getMasterPanelStats', { startDate: startStr, endDate: endStr, panelId: '' })
      ]);

      // Extract data from responses
      const payInOutData = payInOutResponse?.data || payInOutResponse;
      const userRegData = userRegResponse?.data || userRegResponse;
      const statusWiseData = statusWiseResponse?.data || statusWiseResponse;
      const bonusData = bonusResponse?.data || bonusResponse;

      // Combine data into dashSummary object (FTD data will be loaded on demand)
      const summaryData = {
        transactionsDetails: {
          totalDeposit: payInOutData?.transactionsDetails?.totalDeposit || 0,
          depositCount: payInOutData?.transactionsDetails?.depositCount || 0,
          totalWithdrawal: payInOutData?.transactionsDetails?.totalWithdrawal || 0,
          withdrawalCount: payInOutData?.transactionsDetails?.withdrawalCount || 0
        },
        userRegistrationsCount: userRegData?.userRegistrationsCount || 0,
        userRegistrationsNoTranxCount: 0, // Will be loaded on demand
        ftd_users_count: 0, // Will be loaded on demand
        statusWiseBreakdown: statusWiseData?.statusWiseBreakdown || {},
        totalBonus: {
          totalAmount: bonusData?.totalAmount || 0,
          count: bonusData?.count || 0
        },
        totalRefereEarning: { totalAmount: 0, count: 0 }
      };
      
      setDashSummary(summaryData);
      setDeleteIdsCount(deleteIdsResponse?.data || 0);
      setActiveUsercount(activeUserResponse);
      setTodayDepositCount(todayDepositResponse?.userCount || 0);
      setTodayWithdrawalCount(todayWithdrawalResponse?.userCount || 0);
      setPanelStats(panelResponse);

      // Casino Stats
      setCasinoLoading(true);
      try {
        const [gamesRes, providersRes, playersRes] = await Promise.all([
          apiHelper.get(`/game/games/dashboard/top-games?startDate=${startStr}&endDate=${endStr}&page=1&pageSize=10`),
          apiHelper.get(`/game/games/dashboard/top-providers?startDate=${startStr}&endDate=${endStr}&page=1&pageSize=10`),
          apiHelper.get(`/game/games/dashboard/top-players?startDate=${startStr}&endDate=${endStr}&page=1&pageSize=10`),
        ]);
        // games: { data: { games: [], pagination: {} } }
        setTopGames(gamesRes?.data?.games ?? []);
        setGamesPagination(gamesRes?.data?.pagination ?? { total: 0, page: 1, pageSize: 10, totalPages: 1 });
        setGamesPage(1);
        // providers: { data: { providers: [], pagination: {} } }
        setTopProviders(providersRes?.data?.providers ?? []);
        setProviderPagination(providersRes?.data?.pagination ?? { total: 0, page: 1, pageSize: 10, totalPages: 1 });
        setProviderPage(1);
        setExpandedProvider(null);
        // players: { data: { players: [], pagination: {} } } or { data: [] }
        const playersData = playersRes?.data;
        setTopPlayers(Array.isArray(playersData) ? playersData : (playersData?.players ?? []));
        setPlayersPagination(playersData?.pagination ?? { total: 0, page: 1, pageSize: 10, totalPages: 1 });
        setPlayersPage(1);
      } catch (casinoErr) {
        toast.error('Failed to fetch casino stats: ' + casinoErr.message);
      } finally {
        setCasinoLoading(false);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard summary: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch FTD pending data
  const fetchFtdPendingData = async () => {
    if (ftdPendingLoading) return;
    setFtdPendingLoading(true);
    try {
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      
      const ftdPendingResponse = await apiHelper.get(`/transaction/dash-user-registered-no-tranx-count-summary?startDate=${startUTC}&endDate=${endUTC}`);
      const ftdPendingData = ftdPendingResponse?.data || ftdPendingResponse;
      
      setDashSummary(prev => ({
        ...prev,
        userRegistrationsNoTranxCount: ftdPendingData?.userRegistrationsNoTranxCount || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch FTD pending data: ' + error.message);
    } finally {
      setFtdPendingLoading(false);
    }
  };

  // Separate function to fetch FTD complete data
  const fetchFtdCompleteData = async () => {
    if (ftdCompleteLoading) return;
    setFtdCompleteLoading(true);
    try {
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      
      const ftdCompleteResponse = await apiHelper.get(`/transaction/dash-ftd-summary?startDate=${startUTC}&endDate=${endUTC}`);
      const ftdCompleteData = ftdCompleteResponse?.data || ftdCompleteResponse;
      
      setDashSummary(prev => ({
        ...prev,
        ftd_users_count: ftdCompleteData?.ftd_users_count || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch FTD complete data: ' + error.message);
    } finally {
      setFtdCompleteLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardSummary();
    }
  }, []);

  const fetchGamesPage = async (page) => {
    const startStr = dateRange[0].startDate.toISOString().split('T')[0];
    const endStr = dateRange[0].endDate.toISOString().split('T')[0];
    setCasinoLoading(true);
    try {
      const res = await apiHelper.get(`/game/games/dashboard/top-games?startDate=${startStr}&endDate=${endStr}&page=${page}&pageSize=10`);
      setTopGames(res?.data?.games ?? []);
      setGamesPagination(res?.data?.pagination ?? gamesPagination);
      setGamesPage(page);
    } catch (err) { toast.error('Failed to fetch games: ' + err.message); }
    finally { setCasinoLoading(false); }
  };

  const fetchPlayersPage = async (page) => {
    const startStr = dateRange[0].startDate.toISOString().split('T')[0];
    const endStr = dateRange[0].endDate.toISOString().split('T')[0];
    setCasinoLoading(true);
    try {
      const res = await apiHelper.get(`/game/games/dashboard/top-players?startDate=${startStr}&endDate=${endStr}&page=${page}&pageSize=10`);
      const d = res?.data;
      setTopPlayers(Array.isArray(d) ? d : (d?.players ?? []));
      setPlayersPagination(d?.pagination ?? playersPagination);
      setPlayersPage(page);
    } catch (err) { toast.error('Failed to fetch players: ' + err.message); }
    finally { setCasinoLoading(false); }
  };

  const fetchProviderPage = async (page) => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setCasinoLoading(true);
    try {
      const res = await apiHelper.get(`/game/games/dashboard/top-providers?startDate=${startStr}&endDate=${endStr}&page=${page}&pageSize=10`);
      setTopProviders(res?.data?.providers ?? []);
      setProviderPagination(res?.data?.pagination ?? providerPagination);
      setProviderPage(page);
      setExpandedProvider(null);
    } catch (err) {
      toast.error('Failed to fetch providers: ' + err.message);
    } finally {
      setCasinoLoading(false);
    }
  };

  const applyDateFilter = () => {
    fetchDashboardSummary(dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  const resetFilter = () => {
    const today = new Date();
    setDateRange([{ startDate: today, endDate: today, key: 'selection' }]);
    fetchDashboardSummary(today, today);
  };

  // Graph data
  const payInOutAmountData = [
    {
      name: 'Amount (₹)',
      PayIn: dashSummary?.transactionsDetails?.totalDeposit || 0,
      PayOut: dashSummary?.transactionsDetails?.totalWithdrawal || 0,
    },
  ];

  const payInOutCountData = [
    {
      name: 'Count',
      PayIn: dashSummary?.transactionsDetails?.depositCount || 0,
      PayOut: dashSummary?.transactionsDetails?.withdrawalCount || 0,
    },
  ];

  const userStatsData = [
    { name: 'New Registrations', value: dashSummary?.userRegistrationsCount || 0 },
    { 
      name: 'FTD Complete', 
      value: dashSummary?.ftd_users_count || 0,
      hasReload: true,
      loading: ftdCompleteLoading,
      onReload: fetchFtdCompleteData
    },
    { 
      name: 'FTD Pending', 
      value: dashSummary?.userRegistrationsNoTranxCount || 0,
      hasReload: true,
      loading: ftdPendingLoading,
      onReload: fetchFtdPendingData
    },
    { name: 'Active Users', value: activeUsercount?.totalActiveUsers || 0 },
  ];

  const statusBreakdownData = [
    { name: 'Bonus',   amount: dashSummary?.totalBonus?.totalAmount || 0,                        count: dashSummary?.totalBonus?.count || 0,                        color: '#8b5cf6' },
    { name: 'Initial', amount: dashSummary?.statusWiseBreakdown?.Initial?.amount || 0,           count: dashSummary?.statusWiseBreakdown?.Initial?.count || 0,           color: '#3b82f6' },
    { name: 'Pending', amount: dashSummary?.statusWiseBreakdown?.Pending?.amount || 0,           count: dashSummary?.statusWiseBreakdown?.Pending?.count || 0,           color: '#eab308' },
    { name: 'Accept',  amount: dashSummary?.statusWiseBreakdown?.Accept?.amount || 0,            count: dashSummary?.statusWiseBreakdown?.Accept?.count || 0,            color: '#22c55e' },
    { name: 'Reject',  amount: dashSummary?.statusWiseBreakdown?.Reject?.amount || 0,            count: dashSummary?.statusWiseBreakdown?.Reject?.count || 0,            color: '#ef4444' },
  ];

  const overallData = [
    { name: 'Total Users', value: usersCount },
    { name: 'Wallet Balance', value: totalBalance },
  ];

  const reqCountData = [
    { name: 'Deposit Req', value: todayDepositCount, color: '#22c55e' },
    { name: 'Withdrawal Req', value: todayWithdrawalCount, color: '#ef4444' },
  ];

  // Panel stats graph data
  const panelList = Array.isArray(panelStats?.data) ? panelStats.data
    : Array.isArray(panelStats) ? panelStats : [];

  const panelDepositAmtData = panelList.map(p => ({
    name: p.panelName || 'Panel',
    Deposit: p.depositAmount || 0,
    Withdrawal: p.withdrawalAmount || 0,
    DepositCount: p.depositCount || 0,
    WithdrawalCount: p.withdrawalCount || 0,
  }));

  const panelTotalsData = [
    {
      name: 'Total',
      Deposit: panelStats?.totalDepositAmount ?? 0,
      Withdrawal: panelStats?.totalWithdrawalAmount ?? 0,
      DepositCount: panelStats?.totalDepositCount ?? 0,
      WithdrawalCount: panelStats?.totalWithdrawalCount ?? 0,
    },
  ];

  const isMobile = useWindowSize() < 768;
  const axisStyle = { fontSize: 12, fill: '#64748b', fontWeight: 500 };
  const gridStyle = { stroke: '#f1f5f9', strokeDasharray: '4 4' };
  const rowGrid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 };
  const innerFlex = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 };

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: isMobile ? '16px' : '24px 28px', marginBottom: 28, borderRadius: '0 0 20px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 0 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>Overview</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Platform analytics & transaction summary</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[{ key: 'overview', label: 'Overview' }, { key: 'casino', label: '🎰 Casino Stats' }].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ padding: '6px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === tab.key ? '#2563eb' : 'rgba(255,255,255,0.12)', color: activeTab === tab.key ? '#fff' : '#cbd5e1', transition: 'all 0.2s' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
              >
                <Calendar size={15} />
                {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
                  ? dateRange[0].startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : `${dateRange[0].startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${dateRange[0].endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
              </button>
              {showDatePicker && (
                <div style={{ position: 'absolute', right: 0, top: 46, zIndex: 50, background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={(ranges) => setDateRange([ranges.selection])}
                    showSelectionPreview={true}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    direction="horizontal"
                  />
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => setShowDatePicker(false)} style={{ padding: '6px 14px', fontSize: 13, color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={applyDateFilter} style={{ padding: '6px 16px', fontSize: 13, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={resetFilter} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '0 12px' : '0 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <div className="loading-spinner" style={{ width: 44, height: 44 }}></div>
          </div>
        ) : activeTab === 'casino' ? (
          <div>
            {/* Casino Sub-Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[
                { key: 'games',     label: '🎮 Top Games' },
                { key: 'providers', label: '🏢 Top Providers' },
                { key: 'players',   label: '👤 Top Players' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setCasinoSubTab(t.key)}
                  style={{
                    padding: '8px 20px', borderRadius: 10, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                    background: casinoSubTab === t.key ? '#0f172a' : '#fff',
                    color: casinoSubTab === t.key ? '#fff' : '#64748b',
                    boxShadow: casinoSubTab === t.key ? '0 4px 12px rgba(15,23,42,0.25)' : '0 1px 4px rgba(0,0,0,0.08)',
                    border: casinoSubTab === t.key ? 'none' : '1px solid #e2e8f0',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {casinoSubTab === 'games' && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>🎮 Top Games by GGR</h2>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Total: {gamesPagination.total} games</span>
                </div>
                {casinoLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 36, height: 36 }}></div></div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['Game ID','Game Name','Provider','Rounds','Players','Total Bet (₹)','Total Win (₹)','GGR (₹)'].map((h, i) => (
                              <th key={i} style={{ padding: '10px 14px', textAlign: i < 3 ? 'left' : 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {topGames.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No data available</td></tr>
                          ) : topGames.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', color: '#64748b' }}>{r._id}</td>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{r.game_name}</td>
                              <td style={{ padding: '10px 14px' }}>{r.provider}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{r.rounds?.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{r.playerCount}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{r.totalBet?.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{r.totalWin?.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}><span style={{ color: r.ggr >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>₹{r.ggr?.toLocaleString()}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {gamesPagination.totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Page {gamesPagination.page} of {gamesPagination.totalPages} ({gamesPagination.total} total)</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button disabled={gamesPage <= 1} onClick={() => fetchGamesPage(gamesPage - 1)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: gamesPage <= 1 ? '#f8fafc' : '#fff', color: gamesPage <= 1 ? '#cbd5e1' : '#0f172a', cursor: gamesPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>← Prev</button>
                          {Array.from({ length: gamesPagination.totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === gamesPagination.totalPages || Math.abs(p - gamesPage) <= 1).reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('...'); acc.push(p); return acc; }, []).map((p, i) => p === '...' ? <span key={i} style={{ padding: '5px 8px', color: '#94a3b8', fontSize: 13 }}>...</span> : <button key={i} onClick={() => fetchGamesPage(p)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: gamesPage === p ? '#0f172a' : '#fff', color: gamesPage === p ? '#fff' : '#0f172a', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{p}</button>)}
                          <button disabled={gamesPage >= gamesPagination.totalPages} onClick={() => fetchGamesPage(gamesPage + 1)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: gamesPage >= gamesPagination.totalPages ? '#f8fafc' : '#fff', color: gamesPage >= gamesPagination.totalPages ? '#cbd5e1' : '#0f172a', cursor: gamesPage >= gamesPagination.totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>Next →</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {casinoSubTab === 'providers' && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>🏢 Top Providers by GGR</h2>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Total: {providerPagination.total} providers</span>
                </div>
                {casinoLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <div className="loading-spinner" style={{ width: 36, height: 36 }}></div>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Provider</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Rounds</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Games</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Players</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Total Bet (₹)</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Total Win (₹)</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>GGR (₹)</th>
                            <th style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Top Games</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProviders.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No data available</td></tr>
                          ) : topProviders.map((row, ri) => (
                            <>
                              <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: expandedProvider === ri ? '#f8fafc' : 'transparent' }}>
                                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{row._id}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>{row.rounds?.toLocaleString()}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>{row.gameCount}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>{row.playerCount}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{row.totalBet?.toLocaleString()}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{row.totalWin?.toLocaleString()}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                  <span style={{ color: row.ggr >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>₹{row.ggr?.toLocaleString()}</span>
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                  {row.topGames?.length > 0 && (
                                    <button
                                      onClick={() => setExpandedProvider(expandedProvider === ri ? null : ri)}
                                      style={{ padding: '4px 12px', fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0', background: expandedProvider === ri ? '#0f172a' : '#f8fafc', color: expandedProvider === ri ? '#fff' : '#64748b', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                      {expandedProvider === ri ? '▲ Hide' : '▼ View'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {expandedProvider === ri && row.topGames?.length > 0 && (
                                <tr key={`exp-${ri}`}>
                                  <td colSpan={8} style={{ padding: '0 14px 12px 32px', background: '#f8fafc' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                      <thead>
                                        <tr>
                                          <th style={{ padding: '6px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Game Name</th>
                                          <th style={{ padding: '6px 10px', textAlign: 'right', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Game ID</th>
                                          <th style={{ padding: '6px 10px', textAlign: 'right', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Rounds</th>
                                          <th style={{ padding: '6px 10px', textAlign: 'right', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Players</th>
                                          <th style={{ padding: '6px 10px', textAlign: 'right', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Bet (₹)</th>
                                          <th style={{ padding: '6px 10px', textAlign: 'right', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Win (₹)</th>
                                          <th style={{ padding: '6px 10px', textAlign: 'right', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>GGR (₹)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {row.topGames.map((g, gi) => (
                                          <tr key={gi} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '6px 10px', fontWeight: 500, color: '#334155' }}>{g.game_name}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b' }}>{g.gameId}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{g.rounds?.toLocaleString()}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{g.playerCount}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>₹{g.totalBet?.toLocaleString()}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>₹{g.totalWin?.toLocaleString()}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                                              <span style={{ color: g.ggr >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>₹{g.ggr?.toLocaleString()}</span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {providerPagination.totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                          Page {providerPagination.page} of {providerPagination.totalPages} ({providerPagination.total} total)
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            disabled={providerPage <= 1}
                            onClick={() => fetchProviderPage(providerPage - 1)}
                            style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: providerPage <= 1 ? '#f8fafc' : '#fff', color: providerPage <= 1 ? '#cbd5e1' : '#0f172a', cursor: providerPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
                          >← Prev</button>
                          {Array.from({ length: providerPagination.totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === providerPagination.totalPages || Math.abs(p - providerPage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, i) => p === '...' ? (
                              <span key={i} style={{ padding: '5px 8px', color: '#94a3b8', fontSize: 13 }}>...</span>
                            ) : (
                              <button
                                key={i}
                                onClick={() => fetchProviderPage(p)}
                                style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: providerPage === p ? '#0f172a' : '#fff', color: providerPage === p ? '#fff' : '#0f172a', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                              >{p}</button>
                            ))}
                          <button
                            disabled={providerPage >= providerPagination.totalPages}
                            onClick={() => fetchProviderPage(providerPage + 1)}
                            style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: providerPage >= providerPagination.totalPages ? '#f8fafc' : '#fff', color: providerPage >= providerPagination.totalPages ? '#cbd5e1' : '#0f172a', cursor: providerPage >= providerPagination.totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
                          >Next →</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {casinoSubTab === 'players' && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>👤 Top Players</h2>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Total: {playersPagination.total || topPlayers.length} players</span>
                </div>
                {casinoLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 36, height: 36 }}></div></div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['Name','Phone','Bets','Wins','Total Bet (₹)','Total Win (₹)','Net Loss (₹)'].map((h, i) => (
                              <th key={i} style={{ padding: '10px 14px', textAlign: i < 2 ? 'left' : 'right', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {topPlayers.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No data available</td></tr>
                          ) : topPlayers.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{r.clientName}</td>
                              <td style={{ padding: '10px 14px', color: '#64748b' }}>{r.phone || '—'}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{r.betCount}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{r.winCount}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{r.totalBet?.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{r.totalWin?.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}><span style={{ color: r.netLoss >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>₹{r.netLoss?.toLocaleString()}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {playersPagination.totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Page {playersPagination.page} of {playersPagination.totalPages} ({playersPagination.total} total)</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button disabled={playersPage <= 1} onClick={() => fetchPlayersPage(playersPage - 1)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: playersPage <= 1 ? '#f8fafc' : '#fff', color: playersPage <= 1 ? '#cbd5e1' : '#0f172a', cursor: playersPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>← Prev</button>
                          {Array.from({ length: playersPagination.totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === playersPagination.totalPages || Math.abs(p - playersPage) <= 1).reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('...'); acc.push(p); return acc; }, []).map((p, i) => p === '...' ? <span key={i} style={{ padding: '5px 8px', color: '#94a3b8', fontSize: 13 }}>...</span> : <button key={i} onClick={() => fetchPlayersPage(p)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: playersPage === p ? '#0f172a' : '#fff', color: playersPage === p ? '#fff' : '#0f172a', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{p}</button>)}
                          <button disabled={playersPage >= playersPagination.totalPages} onClick={() => fetchPlayersPage(playersPage + 1)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: playersPage >= playersPagination.totalPages ? '#f8fafc' : '#fff', color: playersPage >= playersPagination.totalPages ? '#cbd5e1' : '#0f172a', cursor: playersPage >= playersPagination.totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>Next →</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Row 1 - PayIn vs PayOut */}
            <div style={rowGrid}>
              <GraphCard title="PayIn vs PayOut" subtitle="Transaction amount comparison (₹)">
                <div style={innerFlex}>
                  <StatSideCards horizontal={isMobile} items={[
                    { name: 'PayIn', value: dashSummary?.transactionsDetails?.totalDeposit || 0, color: '#22c55e' },
                    { name: 'PayOut', value: dashSummary?.transactionsDetails?.totalWithdrawal || 0, color: '#ef4444' },
                  ]} />
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={payInOutAmountData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="40%">
                        <defs>
                          <linearGradient id="payInAmtGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={1} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0.45} /></linearGradient>
                          <linearGradient id="payOutAmtGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={1} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.45} /></linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={55} />
                        <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                        <Bar dataKey="PayIn" name="PayIn" fill="url(#payInAmtGrad)" radius={[8, 8, 0, 0]} maxBarSize={80} />
                        <Bar dataKey="PayOut" name="PayOut" fill="url(#payOutAmtGrad)" radius={[8, 8, 0, 0]} maxBarSize={80} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>

              <GraphCard title="PayIn vs PayOut" subtitle="Transaction count comparison">
                <div style={innerFlex}>
                  <StatSideCards horizontal={isMobile} items={[
                    { name: 'PayIn Count', value: dashSummary?.transactionsDetails?.depositCount || 0, color: '#22c55e' },
                    { name: 'PayOut Count', value: dashSummary?.transactionsDetails?.withdrawalCount || 0, color: '#ef4444' },
                  ]} />
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={payInOutCountData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="40%">
                        <defs>
                          <linearGradient id="payInCntGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={1} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0.45} /></linearGradient>
                          <linearGradient id="payOutCntGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={1} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.45} /></linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} width={55} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                        <Bar dataKey="PayIn" name="PayIn" fill="url(#payInCntGrad)" radius={[8, 8, 0, 0]} maxBarSize={80} />
                        <Bar dataKey="PayOut" name="PayOut" fill="url(#payOutCntGrad)" radius={[8, 8, 0, 0]} maxBarSize={80} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>
            </div>

            {/* Row 2 - User Statistics */}
            <div style={{ marginBottom: 20 }}>
              <GraphCard title="User Statistics" subtitle="Registrations, FTD & active users">
                <div style={innerFlex}>
                  <div style={isMobile
                    ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }
                    : { display: 'flex', flexDirection: 'column', gap: 12, width: 220, flexShrink: 0 }
                  }>
                    {userStatsData.map((item, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', borderLeft: `4px solid ${COLORS[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20, fontWeight: 800, color: COLORS[i] }}>{item.value.toLocaleString()}</span>
                          {item.hasReload && (
                            <button
                              onClick={item.onReload}
                              disabled={item.loading}
                              style={{ padding: '4px', background: 'none', border: 'none', cursor: item.loading ? 'not-allowed' : 'pointer', color: COLORS[i] }}
                            >
                              <RefreshCw size={14} className={item.loading ? 'animate-spin' : ''} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Bar Chart */}
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={userStatsData} margin={{ top: 24, right: 16, left: 0, bottom: 5 }} barCategoryGap="30%">
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} width={55} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }} />
                        <Bar dataKey="value" name="Count" radius={[10, 10, 0, 0]} maxBarSize={64}
                          label={{ position: 'top', fontSize: 12, fontWeight: 700, fill: '#334155', formatter: v => v > 0 ? v : '' }}>
                          {userStatsData.map((_, i) => (
                            <Cell key={i} fill={`url(#ugrad${i})`} />
                          ))}
                        </Bar>
                        <defs>
                          {userStatsData.map((_, i) => (
                            <linearGradient key={i} id={`ugrad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS[i]} stopOpacity={1} />
                              <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0.45} />
                            </linearGradient>
                          ))}
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>
            </div>

            {/* Row 3 - Status Wise */}
            <div style={rowGrid}>
              <GraphCard title="Status Wise Amount" subtitle="Transaction amount by status (₹)">
                <div style={innerFlex}>
                  <StatSideCards horizontal={isMobile} items={statusBreakdownData.map(d => ({ name: d.name, value: d.amount, color: d.color }))} />
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={statusBreakdownData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          {statusBreakdownData.map((d, i) => (
                            <linearGradient key={i} id={`sAmtGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                              <stop offset="100%" stopColor={d.color} stopOpacity={0.45} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={55} />
                        <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="amount" name="Amount (₹)" radius={[8, 8, 0, 0]} maxBarSize={60}>
                          {statusBreakdownData.map((_, i) => <Cell key={i} fill={`url(#sAmtGrad${i})`} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>

              <GraphCard title="Status Wise Count" subtitle="Transaction count distribution by status">
                <div style={innerFlex}>
                  <StatSideCards horizontal={isMobile} items={statusBreakdownData.map(d => ({ name: d.name, value: d.count, color: d.color }))} />
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={statusBreakdownData} dataKey="count" nameKey="name" cx="50%" cy="45%" outerRadius={85} innerRadius={35} paddingAngle={3}>
                          {statusBreakdownData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>
            </div>

            {/* Row 4 - Overall + Req Count */}
            <div style={rowGrid}>
              <GraphCard title="Overall Platform Data" subtitle="Total users & wallet balance">
                <div style={innerFlex}>
                  <StatSideCards horizontal={isMobile} items={[
                    { name: 'Total Users', value: usersCount, color: '#3b82f6' },
                    { name: 'Wallet Balance', value: totalBalance, color: '#8b5cf6' },
                  ]} />
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={overallData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          {overallData.map((_, i) => (
                            <linearGradient key={i} id={`ovGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS[i]} stopOpacity={1} />
                              <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0.45} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="value" name="Value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                          {overallData.map((_, i) => <Cell key={i} fill={`url(#ovGrad${i})`} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>

              <GraphCard title="Deposit vs Withdrawal Requests" subtitle="User request count comparison">
                <div style={innerFlex}>
                  <StatSideCards horizontal={isMobile} items={[
                    { name: 'Deposit Req', value: todayDepositCount, color: '#22c55e' },
                    { name: 'Withdrawal Req', value: todayWithdrawalCount, color: '#ef4444' },
                  ]} />
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={reqCountData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={1} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0.45} /></linearGradient>
                          <linearGradient id="wdGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={1} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.45} /></linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} width={55} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]} maxBarSize={80}>
                          {reqCountData.map((entry, i) => <Cell key={i} fill={i === 0 ? 'url(#depGrad)' : 'url(#wdGrad)'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GraphCard>
            </div>

            {/* Row 5 - Master Panel Stats */}
            {panelList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
                <GraphCard title="Panel-wise Amount" subtitle="Deposit & withdrawal amount per panel (count in tooltip)">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={panelDepositAmtData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }} barCategoryGap="30%">
                      <defs>
                        <linearGradient id="pDepGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={1} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0.45} /></linearGradient>
                        <linearGradient id="pWdGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={1} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.45} /></linearGradient>
                      </defs>
                      <CartesianGrid {...gridStyle} vertical={false} />
                      <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={55} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px' }}>
                            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</p>
                            <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, margin: '2px 0' }}>Deposit: ₹{d?.Deposit?.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: 11 }}>({d?.DepositCount} txns)</span></p>
                            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 13, margin: '2px 0' }}>Withdrawal: ₹{d?.Withdrawal?.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: 11 }}>({d?.WithdrawalCount} txns)</span></p>
                          </div>
                        );
                      }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Bar dataKey="Deposit" fill="url(#pDepGrad)" radius={[6,6,0,0]} maxBarSize={50} />
                      <Bar dataKey="Withdrawal" fill="url(#pWdGrad)" radius={[6,6,0,0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </GraphCard>

                <GraphCard title="Overall Panel Totals" subtitle="Total deposit & withdrawal amount (count in tooltip)">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={panelTotalsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="40%">
                      <defs>
                        <linearGradient id="ptDepGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={1} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0.45} /></linearGradient>
                        <linearGradient id="ptWdGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={1} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.45} /></linearGradient>
                      </defs>
                      <CartesianGrid {...gridStyle} vertical={false} />
                      <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={55} />
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px' }}>
                            <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, margin: '2px 0' }}>Deposit: ₹{d?.Deposit?.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: 11 }}>({d?.DepositCount} txns)</span></p>
                            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 13, margin: '2px 0' }}>Withdrawal: ₹{d?.Withdrawal?.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: 11 }}>({d?.WithdrawalCount} txns)</span></p>
                          </div>
                        );
                      }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Bar dataKey="Deposit" fill="url(#ptDepGrad)" radius={[8,8,0,0]} maxBarSize={80}
                        // label={{ position: 'top', fontSize: 12, fontWeight: 700, fill: '#22c55e', formatter: v => v > 0 ? `₹${(v/1000).toFixed(0)}k` : '' }}
                         />
                      <Bar dataKey="Withdrawal" fill="url(#ptWdGrad)" radius={[8,8,0,0]} maxBarSize={80}
                        // label={{ position: 'top', fontSize: 12, fontWeight: 700, fill: '#ef4444', formatter: v => v > 0 ? `₹${(v/1000).toFixed(0)}k` : '' }}
                         />
                    </BarChart>
                  </ResponsiveContainer>
                </GraphCard>
              </div>
            )}

            <div className="hidden gaming-card p-4 sm:p-6">
              <UsersList
                key={refreshTrigger}
                onUserDeleted={() => setRefreshTrigger(p => p + 1)}
                onUsersCountChange={setUsersCount}
                onBalanceSumChange={setTotalBalance}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OverviewStats;
