import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersList from './UsersList';
import AddUserForm from './AddUserForm';
import { Users, Calendar, RotateCcw } from 'lucide-react';
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

const OverviewStats = () => {
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

      const localResponse = await apiHelper.get(`/transaction/dash-summary?startDate=${startUTC}&endDate=${endUTC}`);
      const summaryData = localResponse?.data || localResponse;
      setDashSummary(summaryData);

      const deleteIdsPayload = { startDate: startStr, endDate: endStr };
      const deleteIdsResponse = await apiHelper.post('/deletelog/getCount_of_DeleteId', deleteIdsPayload);
      setDeleteIdsCount(deleteIdsResponse?.data || 0);

      const activeUser = await apiHelper.post('/user/getActiveUserLogsCount', deleteIdsPayload);
      setActiveUsercount(activeUser);

      const todayDepositResponse = await apiHelper.get(`/transaction/getDeposit_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`);
      setTodayDepositCount(todayDepositResponse?.userCount || 0);

      const todayWithdrawalResponse = await apiHelper.get(`/transaction/getWithdraw_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`);
      setTodayWithdrawalCount(todayWithdrawalResponse?.userCount || 0);

      // Master Panel Stats
      const panelRes = await apiHelper.post('/transaction/getMasterPanelStats', {
        startDate: startStr,
        endDate: endStr,
        panelId: '',
      });
      setPanelStats(panelRes);
    } catch (error) {
      toast.error('Failed to fetch dashboard summary: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardSummary();
    }
  }, []);

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
    { name: 'FTD Complete', value: dashSummary?.ftd_users_count || 0 },
    { name: 'FTD Pending', value: dashSummary?.userRegistrationsNoTranxCount || 0 },
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
                      <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', borderLeft: `4px solid ${COLORS[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{item.name}</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: COLORS[i] }}>{item.value.toLocaleString()}</span>
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
