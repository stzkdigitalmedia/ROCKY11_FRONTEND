import { useState, useEffect } from "react";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import { Search, Filter, Settings, X, Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

const currencySymbol = (currency) => currency === 'USDT' ? '₮' : '₹';

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [transactions, setTransactions] = useState([]);
  const [bettingUsers, setBettingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "", reason: "" });
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [games, setGames] = useState([]);
  const [bettingUserModal, setBettingUserModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyUserId, setHistoryUserId] = useState(null);
  const [historyUserName, setHistoryUserName] = useState("");
  const [historyFilters, setHistoryFilters] = useState({
    gameName: "",
    providerName: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [gameTransactions, setGameTransactions] = useState([]);
  const [gameTransactionPage, setGameTransactionPage] = useState(1);
  const [gameTransactionTotalPages, setGameTransactionTotalPages] = useState(1);
  const [gameTransactionTotal, setGameTransactionTotal] = useState(0);
  const [bettingPage, setBettingPage] = useState(1);
  const [bettingTotalPages, setBettingTotalPages] = useState(1);
  const [bettingTotal, setBettingTotal] = useState(0);
  const [bettingSearch, setBettingSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [bettingFilters, setBettingFilters] = useState({ startDate: today, endDate: today });

  const [exchangeBets, setExchangeBets] = useState([]);
  const [exchangePage, setExchangePage] = useState(1);
  const [exchangeTotalPages, setExchangeTotalPages] = useState(1);
  const [exchangeTotal, setExchangeTotal] = useState(0);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeFilters, setExchangeFilters] = useState({
    clientName: "",
    sportName: "",
    status: "",
    startDate: "",
    endDate: "",
    selectedCurrency: "",
  });

  // Filter states for user transactions
  const [filters, setFilters] = useState({
    status: "",
    transactionType: "",
    clientName: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    mode: "",
    gameName: "",
    selectedCurrency: "",
  });

  const toast = useToastContext();

  const fetchTransactions = async (
    currentPage = 1,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const payload = {
        page: currentPage,
        limit: 20,
        ...currentFilters,
      };

      // Remove empty filters
      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === "" ||
          payload[key] === null ||
          payload[key] === undefined
        ) {
          delete payload[key];
        }
      });

      const response = await apiHelper.post(
        "/transaction/getAllUserTransactionsHistory_ForSuperAdmin",
        payload,
      );

      let transactionsData =
        response?.data?.transactions ||
        response?.transactions ||
        response?.data ||
        response ||
        [];

      // Ensure we have an array
      if (!Array.isArray(transactionsData)) {
        transactionsData = [];
      }

      setTransactions(transactionsData);
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1);
      setTotalTransactions(
        response?.data?.totalTransactions ||
        response?.totalTransactions ||
        transactionsData?.length ||
        0,
      );
    } catch (error) {
      toast.error("Failed to fetch transactions: " + error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBettingUsers = async (pg = 1, search = bettingSearch, filters = bettingFilters) => {
    setLoading(true);
    setBettingPage(pg);
    try {
      const payload = { page: pg, limit: 10 };

      if (filters.startDate) payload.startDate = filters.startDate;
      if (filters.endDate) payload.endDate = filters.endDate;

      // Try multiple parameter names that the backend might expect
      if (search && search.trim()) {
        const searchValue = search.trim();
        payload.search = searchValue;
        payload.query = searchValue;
        payload.username = searchValue;
        payload.mobile = searchValue;
        payload.userName = searchValue;
        payload.userMobile = searchValue;
      }

      console.log('Fetching betting users with payload:', payload);
      const response = await apiHelper.post("/getBettingUsers", payload);
      console.log("getBettingUsers full response:", response);
      const data = response?.data?.users || response?.data?.data || response?.users || response?.data || [];
      console.log('Extracted data:', data);
      console.log('Data length:', data.length);
      console.log('Is array?', Array.isArray(data));
      setBettingUsers(Array.isArray(data) ? data : []);
      setBettingTotalPages(
        response?.data?.totalPages ||
        response?.data?.pagination?.totalPages ||
        response?.totalPages ||
        Math.ceil((response?.data?.total || response?.data?.totalUsers || 0) / 10) ||
        1
      );
      setBettingTotal(
        response?.data?.total ||
        response?.data?.totalUsers ||
        response?.data?.pagination?.total ||
        response?.totalUsers ||
        data.length ||
        0
      );
    } catch (error) {
      console.error('Error fetching betting users:', error);
      toast.error("Failed to fetch betting users: " + error.message);
      setBettingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeBets = async (pg = 1, currentFilters = exchangeFilters) => {
    setExchangeLoading(true);
    setExchangePage(pg);
    try {
      console.log(`Fetching exchange bets for page ${pg}...`, currentFilters);

      const params = new URLSearchParams();
      params.append("page", pg.toString());
      params.append("limit", "20");

      if (currentFilters.clientName) params.append("clientName", currentFilters.clientName);
      if (currentFilters.sportName) params.append("sportName", currentFilters.sportName);
      if (currentFilters.status) params.append("status", currentFilters.status.toUpperCase());
      if (currentFilters.startDate) params.append("startDate", currentFilters.startDate);
      if (currentFilters.endDate) params.append("endDate", currentFilters.endDate);
      if (currentFilters.selectedCurrency) params.append("selectedCurrency", currentFilters.selectedCurrency);

      const response = await apiHelper.get(
        `/exchange/admin/list-bets?${params.toString()}`
      );
      console.log("Exchange API response:", response);

      const data =
        response?.data?.bets ||
        response?.data?.data ||
        response?.data?.results ||
        response?.data ||
        response?.bets ||
        (Array.isArray(response) ? response : []);

      const total =
        response?.data?.totalCount ||
        response?.data?.total ||
        response?.data?.count ||
        response?.totalCount ||
        response?.total ||
        (Array.isArray(data) ? data.length : 0);

      setExchangeBets(Array.isArray(data) ? data : []);
      setExchangeTotalPages(
        response?.data?.totalPages ||
        response?.totalPages ||
        Math.ceil(total / 20) ||
        1
      );
      setExchangeTotal(total);
    } catch (error) {
      console.error("Error fetching exchange bets:", error);
      toast.error("Failed to fetch exchange bets: " + error.message);
      setExchangeBets([]);
    } finally {
      setExchangeLoading(false);
    }
  };

  // Use all betting users directly from API (backend handles search)
  const filteredBettingUsers = bettingUsers;

  // If backend doesn't support search, fallback to client-side filtering
  const clientSideFilteredUsers = bettingSearch.trim()
    ? bettingUsers.filter((u) => {
      const q = bettingSearch.toLowerCase();
      return (
        (u?.userName || "").toLowerCase().includes(q) ||
        (u?.userMobile || "").toLowerCase().includes(q) ||
        (u?.userEmail || "").toLowerCase().includes(q) ||
        (u?.userId || "").toLowerCase().includes(q)
      );
    })
    : bettingUsers;

  const openHistory = async (userId, pg = 1, filters = historyFilters) => {
    setHistoryModal(true);
    setHistoryUserId(userId);
    setHistoryUserName(
      bettingUsers.find((u) => u.userId === userId)?.userName || "",
    );
    if (pg === 1) setHistoryData([]);
    setHistoryLoading(true);
    try {
      const hasFilters =
        filters.gameName ||
        filters.providerName ||
        filters.type ||
        filters.startDate ||
        filters.endDate;
      const body = { userId, page: pg, limit: 10 };
      if (filters.gameName) body.gameName = filters.gameName;
      if (filters.providerName) body.providerName = filters.providerName;
      if (filters.type) body.type = filters.type;
      if (filters.startDate) body.startDate = filters.startDate;
      if (filters.endDate) body.endDate = filters.endDate;

      const endpoint = hasFilters
        ? `/searchGAPTransactions`
        : `/getGAPTransactions`;
      const response = await apiHelper.post(endpoint, body);
      const data = response?.data?.transactions || [];
      setHistoryData(Array.isArray(data) ? data : []);
      setHistoryTotalPages(
        response?.data?.pagination?.totalPages ||
        response?.data?.totalPages ||
        1,
      );
      setHistoryTotal(
        response?.data?.total || response?.data?.totalTransactions || 0,
      );
      setHistoryPage(pg);
    } catch (error) {
      toast.error("Failed to fetch history: " + error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchTransactions(1, filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: "",
      transactionType: "",
      clientName: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
      mode: "",
      gameName: "",
      selectedCurrency: "",
    };
    setFilters(clearedFilters);
    setPage(1);
    fetchTransactions(1, clearedFilters);
  };

  useEffect(() => {
    if (activeTab === "user") {
      fetchTransactions(page, filters);
    } else if (activeTab === "game") {
      fetchBettingUsers(bettingPage, bettingSearch);
    } else if (activeTab === "exchange") {
      fetchExchangeBets(exchangePage, exchangeFilters);
    }
  }, [page, activeTab, exchangePage]);

  // Auto-search with debounce when user types in game transactions tab
  useEffect(() => {
    if (activeTab !== "game") return;
  }, [bettingSearch, activeTab]);



  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await apiHelper.get(
          "/game/getAllGamesWithPagination?page=1&limit=100",
        );
        setGames(response?.data || response?.games || []);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Transaction History
        </h1>
        <p className="text-gray-600 mt-1">View and filter all transactions</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab("user");
                setPage(1);
                setGameTransactionPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "user"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              User Transactions
            </button>
            <button
              onClick={() => {
                setActiveTab("game");
                setPage(1);
                setGameTransactionPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "game"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Game Transactions
            </button>
            <button
              onClick={() => {
                setActiveTab("exchange");
                setExchangePage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "exchange"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Exchange Bets
            </button>
          </nav>
        </div>
      </div>

      {/* Game Transaction Filters */}
      {activeTab === "game" && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Game Transaction Filters</h3>
                  <p className="text-sm text-gray-600">Filter by date range or search by user</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-bold text-xl">{bettingTotal}</p>
                <p className="text-gray-500 text-xs">Total Users</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                <div
                  className="relative cursor-pointer"
                  onClick={() => document.getElementById('gameStartDate').showPicker?.()}
                >
                  <input
                    id="gameStartDate"
                    type="date"
                    value={bettingFilters.startDate}
                    onChange={(e) => setBettingFilters(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                <div
                  className="relative cursor-pointer"
                  onClick={() => document.getElementById('gameEndDate').showPicker?.()}
                >
                  <input
                    id="gameEndDate"
                    type="date"
                    value={bettingFilters.endDate}
                    onChange={(e) => setBettingFilters(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search User</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={bettingSearch}
                    onChange={(e) => setBettingSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (setBettingPage(1), fetchBettingUsers(1, bettingSearch, bettingFilters))}
                    placeholder="Username or mobile number..."
                    className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 hover:bg-white transition-colors"
                  />
                  {bettingSearch && (
                    <button
                      onClick={() => { setBettingSearch(""); setBettingPage(1); fetchBettingUsers(1, "", bettingFilters); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setBettingPage(1); fetchBettingUsers(1, bettingSearch, bettingFilters); }}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
              >
                <Search size={15} />
                {loading ? "Searching..." : "Apply Filters"}
              </button>
              <button
                onClick={() => {
                  const reset = { startDate: today, endDate: today };
                  setBettingFilters(reset);
                  setBettingSearch("");
                  setBettingPage(1);
                  fetchBettingUsers(1, "", reset);
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-all"
              >
                <RefreshCw size={15} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Filters */}
      {activeTab === "exchange" && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Exchange Bet Filters</h3>
                <p className="text-sm text-gray-600">Filter exchange bets by name, sport, date, or status</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="Search by client name"
                  value={exchangeFilters.clientName}
                  onChange={(e) => setExchangeFilters(p => ({ ...p, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                <input
                  type="text"
                  placeholder="Search by sport"
                  value={exchangeFilters.sportName}
                  onChange={(e) => setExchangeFilters(p => ({ ...p, sportName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={exchangeFilters.startDate}
                  onChange={(e) => setExchangeFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={exchangeFilters.endDate}
                  onChange={(e) => setExchangeFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={exchangeFilters.status}
                  onChange={(e) => setExchangeFilters(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="settled">Settled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={exchangeFilters.selectedCurrency}
                  onChange={(e) => setExchangeFilters(p => ({ ...p, selectedCurrency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
                >
                  <option value="">All</option>
                  <option value="INR">INR</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setExchangePage(1);
                  fetchExchangeBets(1, exchangeFilters);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Search size={18} />
                Apply Filters
              </button>
              <button
                onClick={() => {
                  const cleared = {
                    clientName: "",
                    sportName: "",
                    status: "",
                    startDate: "",
                    endDate: "",
                    selectedCurrency: "",
                  };
                  setExchangeFilters(cleared);
                  setExchangePage(1);
                  fetchExchangeBets(1, cleared);
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction Filters
              </h3>
              <p className="text-sm text-gray-600">
                Filter transactions by various criteria
              </p>
            </div>
          </div>
        </div>

        {activeTab === "user" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {activeTab === "user" ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
                    >
                      <option value="">All Status</option>
                      <option value="Initial">Initial</option>
                      <option value="Pending">Pending</option>
                      <option value="Accept">Accept</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Type
                    </label>
                    <select
                      value={filters.transactionType}
                      onChange={(e) =>
                        handleFilterChange("transactionType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">All Types</option>
                      <option value="Deposit">Deposit</option>
                      <option value="Withdrawal">Withdrawal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={filters.clientName}
                      onChange={(e) =>
                        handleFilterChange("clientName", e.target.value)
                      }
                      placeholder="Enter client name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) =>
                        handleFilterChange("minAmount", e.target.value)
                      }
                      placeholder="Min amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) =>
                        handleFilterChange("maxAmount", e.target.value)
                      }
                      placeholder="Max amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div
                    onClick={() =>
                      document.getElementById("startDate").showPicker?.()
                    }
                    className="cursor-pointer"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                    />
                  </div>

                  <div
                    onClick={() =>
                      document.getElementById("endDate").showPicker?.()
                    }
                    className="cursor-pointer"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode
                    </label>
                    <select
                      value={filters.mode}
                      onChange={(e) => handleFilterChange("mode", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">All Modes</option>
                      <option value="PowerPay">PowerPay</option>
                      <option value="Wallet">Wallet</option>
                      <option value="DR">MANUALLY</option>
                      <option value="Bonus">Bonus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game Name
                    </label>
                    <select
                      value={filters.gameName}
                      onChange={(e) =>
                        handleFilterChange("gameName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">All Games</option>
                      {games.map((game) => (
                        <option key={game._id} value={game.gameName}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={filters.selectedCurrency}
                      onChange={(e) => handleFilterChange("selectedCurrency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">All</option>
                      <option value="INR">INR</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </>
              ) : null}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={applyFilters}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <Search size={16} />
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    Clear Filters
                  </button>
                </div>

                <div className="flex gap-3">
                  {activeTab === "game" && (
                    <button
                      onClick={() => fetchBettingUsers(1, bettingSearch)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      setDownloading(true);
                      try {
                        const payload = { ...filters };
                        Object.keys(payload).forEach((key) => {
                          if (
                            payload[key] === "" ||
                            payload[key] === null ||
                            payload[key] === undefined
                          ) {
                            delete payload[key];
                          }
                        });
                        const response = await apiHelper.post(
                          "/transaction/getAllUser_TrxsHistory_Without_Pagination",
                          payload,
                        );
                        const allData =
                          response?.data?.transactions ||
                          response?.transactions ||
                          response?.data ||
                          response ||
                          [];
                        const data = allData.map((t, i) => ({
                          "S.No": i + 1,
                          "Client Name":
                            t?.clientName || t?.user?.clientName || "N/A",
                          "Transaction Type": t?.transactionType || "N/A",
                          Amount: t?.amount || 0,
                          "Game Name": t?.gameName || "N/A",
                          Mode: t?.mode === "DR" ? "MANUALLY" : t?.mode || "N/A",
                          Status: t?.status || "Pending",
                          "Created At": t?.createdAt
                            ? new Date(t.createdAt).toLocaleString("en-IN")
                            : "N/A",
                          "Updated At": t?.updatedAt
                            ? new Date(t.updatedAt).toLocaleString("en-IN")
                            : "N/A",
                        }));
                        const ws = XLSX.utils.json_to_sheet(data);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
                        XLSX.writeFile(
                          wb,
                          `Transaction_History_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`,
                        );
                        toast.success(
                          `Downloaded ${data.length} transactions successfully!`,
                        );
                      } catch (error) {
                        toast.error(
                          "Failed to download report: " + error.message,
                        );
                      } finally {
                        setDownloading(false);
                      }
                    }}
                    disabled={downloading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <Download size={16} />
                    {downloading ? "Downloading..." : "Download Report"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="gaming-card">
          {(() => {
            if (activeTab === "exchange") {
              if (exchangeLoading) {
                return (
                  <div className="text-center py-8">
                    <div
                      className="loading-spinner mx-auto mb-4"
                      style={{ width: "32px", height: "32px" }}
                    ></div>
                    <p className="text-gray-600">Loading exchange bets...</p>
                  </div>
                );
              }

              if (exchangeBets.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">No exchange bets found</p>
                  </div>
                );
              }

              return (
                <div className="w-full overflow-hidden">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">#</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">User Details</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Event Name</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Market Name</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Selection Name</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Sport Name</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Bet Type & Odds</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Odds Size</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Stake</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Liability</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Status</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Result</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Settled</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">Bet Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchangeBets.map((bet, index) => (
                        <tr key={bet._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-2 text-[11px] text-gray-900 font-medium">
                            {(exchangePage - 1) * 20 + index + 1}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex flex-col max-w-[100px]">
                              <p className="font-bold text-gray-900 text-[11px] leading-tight break-words">{bet.clientName || "N/A"}</p>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <p className="text-[11px] text-gray-900 leading-tight break-words max-w-[120px]">{bet.eventName || "N/A"}</p>
                          </td>
                          <td className="py-2 px-2 text-[11px] text-gray-900 leading-tight break-words max-w-[80px]">{bet.marketName || "N/A"}</td>
                          <td className="py-2 px-2 text-[11px] font-bold text-blue-600 leading-tight break-words max-w-[80px]">{bet.selectionName || "N/A"}</td>
                          <td className="py-2 px-2 text-[11px] text-gray-800 break-words">{bet.sportName || "N/A"}</td>
                          <td className="py-2 px-2">
                            <div className={`inline-flex flex-col sm:flex-row items-center gap-1 px-1.5 py-1 rounded font-bold text-gray-900 ${(bet.betType || bet.type)?.toUpperCase() === 'LAY' ? 'bg-pink-200' : 'bg-blue-200'
                              }`}>
                              <span className="text-[9px] uppercase">{(bet.betType || bet.type)?.toUpperCase()}</span>
                              <span className="text-[11px] font-mono">{bet.odds}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-[11px] text-gray-900 font-mono">{bet.size || "N/A"}</td>
                          <td className="py-2 px-2 text-[11px] font-bold text-gray-900 whitespace-nowrap">
                            {currencySymbol(bet.currency)}{Math.round(bet.stake || bet.amount || 0)}
                          </td>
                          <td className="py-2 px-2 text-[11px] font-bold text-orange-600 whitespace-nowrap">
                            {currencySymbol(bet.currency)}{Math.round(bet.liability || 0)}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${bet.status?.toUpperCase() === 'WON' ? 'bg-green-100 text-green-700' :
                                bet.status?.toUpperCase() === 'LOST' ? 'bg-red-100 text-red-700' :
                                  bet.status?.toUpperCase() === 'PENDING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {bet.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-[11px] text-gray-700 leading-tight break-words">{bet.result || "Pending"}</td>
                          <td className="py-2 px-2 text-[11px] font-bold text-indigo-600 whitespace-nowrap">
                            {currencySymbol(bet.currency)}{Math.round(bet.settledAmount || 0)}
                          </td>
                          <td className="py-2 px-2 text-[10px] text-gray-600">
                            <div className="flex flex-col">
                              <span className="whitespace-nowrap">{bet.createdAt ? new Date(bet.createdAt).toLocaleDateString("en-IN") : "N/A"}</span>
                              <span className="text-[9px] text-gray-400">{bet.createdAt ? new Date(bet.createdAt).toLocaleTimeString("en-IN") : ""}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            const userTxns = Array.isArray(transactions) ? transactions : [];
            const gameTxns = Array.isArray(filteredBettingUsers) ? filteredBettingUsers : [];
            const currentTransactions =
              activeTab === "user" ? userTxns : gameTxns;

            if (loading) {
              return (
                <div className="text-center py-8">
                  <div
                    className="loading-spinner mx-auto mb-4"
                    style={{ width: "32px", height: "32px" }}
                  ></div>
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              );
            }

            if (currentTransactions.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No transactions found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      {activeTab === "user" ? (
                        <>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Game
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mode
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Updated At
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          {/* <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th> */}
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mobile
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Bet
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Win
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bet Count
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Win Count
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            GGR
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction, index) => (
                      <tr
                        key={transaction?.userId || transaction?._id || index}
                        className="border-b border-gray-100"
                      >
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">
                            {activeTab === "user"
                              ? (page - 1) * 20 + index + 1
                              : (bettingPage - 1) * 10 + index + 1}
                          </p>
                        </td>

                        {activeTab === "user" ? (
                          <>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {(
                                    transaction?.clientName ||
                                    transaction?.user?.clientName ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {transaction?.clientName ||
                                      transaction?.user?.clientName ||
                                      "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`badge ${transaction?.transactionType === "Deposit"
                                  ? "badge-green"
                                  : "badge-blue"
                                  }`}
                              >
                                {transaction?.transactionType || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-green-600">
                                {currencySymbol(transaction?.currency)}{transaction?.amount || 0}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.gameName || "N/A"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.mode === "DR" ? "MANUALLY" : transaction?.mode || "N/A"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`badge ${transaction?.status === "Accept"
                                  ? "badge-green"
                                  : transaction?.status === "Reject"
                                    ? "badge-red"
                                    : "badge-blue"
                                  }`}
                              >
                                {transaction?.status || "Pending"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.createdAt
                                  ? new Date(
                                    transaction.createdAt,
                                  ).toLocaleDateString("en-IN")
                                  : "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {transaction?.createdAt
                                  ? new Date(
                                    transaction.createdAt,
                                  ).toLocaleTimeString("en-IN")
                                  : ""}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.updatedAt
                                  ? new Date(
                                    transaction.updatedAt,
                                  ).toLocaleDateString("en-IN")
                                  : "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {transaction?.updatedAt
                                  ? new Date(
                                    transaction.updatedAt,
                                  ).toLocaleTimeString("en-IN")
                                  : ""}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setStatusForm({
                                    status: transaction?.status || "",
                                    reason: "",
                                  });
                                  setShowStatusModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                              >
                                <Settings size={14} />
                                Update
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {(transaction?.userName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <p className="font-medium text-gray-900">
                                  {transaction?.userName || "N/A"}
                                </p>
                              </div>
                            </td>
                            {/* <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.userEmail || "N/A"}
                              </p>
                            </td> */}
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.userMobile || "N/A"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-red-600">
                                {currencySymbol(transaction?.currency)}{transaction?.totalBetAmount || 0}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-green-600">
                                {currencySymbol(transaction?.currency)}{transaction?.totalWinAmount || 0}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.totalBetCount || 0}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {transaction?.totalWinCount || 0}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-blue-600">
                                {currencySymbol(transaction?.currency)}{transaction?.ggr || 0}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() =>
                                  openHistory(transaction?.userId, 1, {
                                    gameName: "",
                                    providerName: "",
                                    type: "",
                                    startDate: "",
                                    endDate: "",
                                  })
                                }
                                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium"
                              >
                                History
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Pagination Controls */}
          {((activeTab === "user" && totalPages > 1) || activeTab === "game" || (activeTab === "exchange" && exchangeTotalPages > 1)) && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-3 border-t border-gray-200 gap-3">
              <div className="text-sm text-gray-500">
                {activeTab === "user" ? (
                  <>Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span> &nbsp;·&nbsp; {totalTransactions} total</>
                ) : activeTab === "game" ? (
                  <>Page <span className="font-semibold text-gray-700">{bettingPage}</span> of <span className="font-semibold text-gray-700">{bettingTotalPages}</span> &nbsp;·&nbsp; {bettingTotal} total users</>
                ) : (
                  <>Page <span className="font-semibold text-gray-700">{exchangePage}</span> of <span className="font-semibold text-gray-700">{exchangeTotalPages}</span> &nbsp;·&nbsp; {exchangeTotal} total bets</>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (activeTab === "user") setPage(page - 1);
                    else if (activeTab === "game") fetchBettingUsers(bettingPage - 1, bettingSearch);
                    else if (activeTab === "exchange") fetchExchangeBets(exchangePage - 1);
                  }}
                  disabled={
                    (activeTab === "user" ? page === 1 :
                      activeTab === "game" ? bettingPage === 1 :
                        exchangePage === 1) ||
                    loading || exchangeLoading
                  }
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(activeTab === "user" ? totalPages : activeTab === "game" ? bettingTotalPages : exchangeTotalPages, 5) }, (_, i) => {
                    const cp = activeTab === "user" ? page : activeTab === "game" ? bettingPage : exchangePage;
                    const tp = activeTab === "user" ? totalPages : activeTab === "game" ? bettingTotalPages : exchangeTotalPages;
                    let pageNum;
                    if (tp <= 5) pageNum = i + 1;
                    else if (cp <= 3) pageNum = i + 1;
                    else if (cp >= tp - 2) pageNum = tp - 4 + i;
                    else pageNum = cp - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          if (activeTab === "user") setPage(pageNum);
                          else if (activeTab === "game") fetchBettingUsers(pageNum, bettingSearch);
                          else if (activeTab === "exchange") fetchExchangeBets(pageNum);
                        }}
                        disabled={loading || exchangeLoading}
                        className={`w-8 h-8 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${(activeTab === "user" ? page : activeTab === "game" ? bettingPage : exchangePage) === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    if (activeTab === "user") setPage(page + 1);
                    else if (activeTab === "game") fetchBettingUsers(bettingPage + 1, bettingSearch);
                    else if (activeTab === "exchange") fetchExchangeBets(exchangePage + 1);
                  }}
                  disabled={
                    (activeTab === "user" ? page === totalPages :
                      activeTab === "game" ? bettingPage === bettingTotalPages :
                        exchangePage === exchangeTotalPages) ||
                    loading || exchangeLoading
                  }
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Game Transaction History{" "}
                  {historyUserName && (
                    <span className="text-blue-600">— {historyUserName}</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  Total:{" "}
                  <span className="font-semibold text-blue-600">
                    {historyTotal}
                  </span>{" "}
                  transactions
                </p>
              </div>
              <button
                onClick={() => {
                  setHistoryModal(false);
                  setHistoryData([]);
                  setHistoryPage(1);
                  setHistoryUserName("");
                  setHistoryFilters({
                    gameName: "",
                    providerName: "",
                    type: "",
                    startDate: "",
                    endDate: "",
                  });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Search game..."
                  value={historyFilters.gameName}
                  onChange={(e) =>
                    setHistoryFilters((p) => ({
                      ...p,
                      gameName: e.target.value,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Search provider..."
                  value={historyFilters.providerName}
                  onChange={(e) =>
                    setHistoryFilters((p) => ({
                      ...p,
                      providerName: e.target.value,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <select
                  value={historyFilters.type}
                  onChange={(e) =>
                    setHistoryFilters((p) => ({ ...p, type: e.target.value }))
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="bet">Bet</option>
                  <option value="win">Win</option>
                  <option value="refund">Refund</option>
                </select>
                <input
                  type="date"
                  value={historyFilters.startDate}
                  onChange={(e) =>
                    setHistoryFilters((p) => ({
                      ...p,
                      startDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <input
                  type="date"
                  value={historyFilters.endDate}
                  onChange={(e) =>
                    setHistoryFilters((p) => ({
                      ...p,
                      endDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const f = historyFilters;
                    openHistory(historyUserId, 1, f);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Search size={14} /> Apply
                </button>
                <button
                  onClick={() => {
                    const cleared = {
                      gameName: "",
                      providerName: "",
                      type: "",
                      startDate: "",
                      endDate: "",
                    };
                    setHistoryFilters(cleared);
                    openHistory(historyUserId, 1, cleared);
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-white"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="overflow-auto flex-1">
              {historyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div
                      className="loading-spinner mx-auto mb-3"
                      style={{ width: "32px", height: "32px" }}
                    ></div>
                    <p className="text-gray-500">Loading transactions...</p>
                  </div>
                </div>
              ) : historyData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No transactions found
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      {[
                        "Type",
                        "Amount",
                        "Balance After",
                        "Game",
                        "Provider",
                        "Round ID",
                        "Processed At",
                        "Remarks",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((t, i) => (
                      <tr
                        key={t?._id || i}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-400 text-xs">
                          {(historyPage - 1) * 10 + i + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${t?.type === "bet" ? "badge-red" : t?.type === "win" ? "badge-green" : "badge-blue"}`}
                          >
                            {t?.type?.toUpperCase() || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          {currencySymbol(t?.currency)}{t?.amount || 0}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-600">
                          {currencySymbol(t?.currency)}{Number(t?.balanceAfter || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {t?.gameName || t?.gameDetails?.game_name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {t?.providerName ||
                            t?.gameDetails?.provider_name ||
                            "N/A"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">
                          {t?.gap_gameRoundId || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {t?.processedAt
                            ? new Date(t.processedAt).toLocaleString("en-IN")
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {t?.remarks || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold">{historyPage}</span> of{" "}
                <span className="font-semibold">{historyTotalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    openHistory(historyUserId, historyPage - 1, historyFilters)
                  }
                  disabled={historyPage === 1 || historyLoading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(historyTotalPages, 5) },
                    (_, i) => {
                      let pageNum;
                      if (historyTotalPages <= 5) pageNum = i + 1;
                      else if (historyPage <= 3) pageNum = i + 1;
                      else if (historyPage >= historyTotalPages - 2)
                        pageNum = historyTotalPages - 4 + i;
                      else pageNum = historyPage - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            openHistory(historyUserId, pageNum, historyFilters)
                          }
                          disabled={historyLoading}
                          className={`px-3 py-2 text-sm rounded-lg disabled:opacity-50 ${historyPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-white"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() =>
                    openHistory(historyUserId, historyPage + 1, historyFilters)
                  }
                  disabled={historyPage === historyTotalPages || historyLoading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Transaction Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Transaction ID: {selectedTransaction?._id}
              </p>
              <p className="text-sm text-gray-600">
                Amount: {currencySymbol(selectedTransaction?.currency)}{selectedTransaction?.amount}
              </p>
              <p className="text-sm text-gray-600">
                User: {selectedTransaction?.clientName}
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUpdating(true);
                try {
                  const payload = {
                    transactionId: selectedTransaction?._id,
                    status: statusForm.status,
                    reason: statusForm.reason,
                  };
                  await apiHelper.post(
                    "/transaction/update-status-by-super-admin",
                    payload,
                  );
                  toast.success("Transaction status updated successfully!");
                  setShowStatusModal(false);
                  fetchTransactions(page, filters);
                } catch (error) {
                  toast.error("Failed to update status: " + error.message);
                } finally {
                  setUpdating(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Initial">Initial</option>
                  <option value="Pending">Pending</option>
                  <option value="Accept">Accept</option>
                  <option value="Reject">Reject</option>
                  <option value="Insufficent">Insufficient</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={statusForm.reason}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, reason: e.target.value })
                  }
                  placeholder="Enter reason for status change"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
