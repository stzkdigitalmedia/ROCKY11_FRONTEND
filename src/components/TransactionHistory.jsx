import { useState, useEffect } from "react";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import { Search, Filter, Settings, X, Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [transactions, setTransactions] = useState([]);
  const [gameTransactions, setGameTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  // Separate pagination states for game transactions
  const [gameTransactionPage, setGameTransactionPage] = useState(1);
  const [gameTransactionTotalPages, setGameTransactionTotalPages] = useState(1);
  const [gameTransactionTotal, setGameTransactionTotal] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "", reason: "" });
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [games, setGames] = useState([]);

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
  });

  // Filter states for game transactions
  const [gameFilters, setGameFilters] = useState({
    userId: "",
    providerName: "",
    gameId: "",
    gameName: "",
    type: "",
    startDate: "",
    endDate: "",
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

  const fetchGameTransactions = async (
    currentPage = 1,
    currentFilters = gameFilters,
  ) => {
    setLoading(true);
    try {
      // Check if advanced filters are being used
      const hasAdvancedFilters = currentFilters.userId || currentFilters.providerName || 
                                currentFilters.gameId || currentFilters.gameName;
      
      let response;
      
      if (hasAdvancedFilters) {
        // Use search API for advanced filters
        const payload = {
          page: currentPage,
          pageSize: 20,
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

        response = await apiHelper.post("/searchGAPTransactions", payload);
        
        const transactionsData = response?.data?.transactions || [];
        const pagination = response?.data?.pagination || {};
        
        setGameTransactions(transactionsData);
        setGameTransactionTotalPages(pagination.totalPages || 1);
        setGameTransactionTotal(pagination.total || 0);
        setGameTransactionPage(currentPage);
      } else {
        // Use basic API for simple filters
        const payload = {
          page: currentPage,
          pageSize: 50,
          type: currentFilters.type || "",
          startDate: currentFilters.startDate || "",
          endDate: currentFilters.endDate || "",
        };

        response = await apiHelper.post("/getGAPTransactions", payload);
        
        let transactionsData = [];
        let totalCount = 0;
        let totalPagesCount = 1;
        
        // Handle different response structures
        if (response?.data?.transactions && Array.isArray(response.data.transactions)) {
          transactionsData = response.data.transactions;
          const pagination = response?.data?.pagination || {};
          totalCount = pagination.total || response?.data?.total || response?.data?.count || transactionsData.length;
          totalPagesCount = pagination.totalPages || response?.data?.totalPages || Math.ceil(totalCount / 20);
        } else if (response?.transactions && Array.isArray(response.transactions)) {
          transactionsData = response.transactions;
          const pagination = response?.pagination || {};
          totalCount = pagination.total || response?.total || response?.count || transactionsData.length;
          totalPagesCount = pagination.totalPages || response?.totalPages || Math.ceil(totalCount / 20);
        } else if (Array.isArray(response?.data)) {
          transactionsData = response.data;
          totalCount = transactionsData.length;
          totalPagesCount = Math.ceil(totalCount / 20);
        } else if (Array.isArray(response)) {
          transactionsData = response;
          totalCount = transactionsData.length;
          totalPagesCount = Math.ceil(totalCount / 20);
        }
        
        setGameTransactions(transactionsData);
        setGameTransactionTotalPages(totalPagesCount);
        setGameTransactionTotal(totalCount);
        setGameTransactionPage(currentPage);
      }
    } catch (error) {
      toast.error("Failed to fetch game transactions: " + error.message);
      setGameTransactions([]);
      setGameTransactionTotalPages(1);
      setGameTransactionTotal(0);
    } finally {
      setLoading(false);
    }
  };



  const handleFilterChange = (key, value) => {
    if (activeTab === "user") {
      setFilters((prev) => ({ ...prev, [key]: value }));
    } else {
      setGameFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const applyFilters = () => {
    if (activeTab === "user") {
      setPage(1);
      fetchTransactions(1, filters);
    } else {
      setGameTransactionPage(1);
      fetchGameTransactions(1, gameFilters);
    }
  };

  const clearFilters = () => {
    if (activeTab === "user") {
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
      };
      setFilters(clearedFilters);
      setPage(1);
      fetchTransactions(1, clearedFilters);
    } else {
      const clearedGameFilters = {
        userId: "",
        providerName: "",
        gameId: "",
        gameName: "",
        type: "",
        startDate: "",
        endDate: "",
      };
      setGameFilters(clearedGameFilters);
      setGameTransactionPage(1);
      fetchGameTransactions(1, clearedGameFilters);
    }
  };

  useEffect(() => {
    if (activeTab === "user") {
      fetchTransactions(page, filters);
    } else {
      fetchGameTransactions(gameTransactionPage, gameFilters);
    }
  }, [page, gameTransactionPage, activeTab]);

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
        <p className="text-gray-600 mt-1">
          View and filter all transactions
        </p>
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "user"
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "game"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Game Transactions
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transaction Filters</h3>
              <p className="text-sm text-gray-600">Filter transactions by various criteria</p>
            </div>
          </div>
        </div>

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
                  onChange={(e) => handleFilterChange("status", e.target.value)}
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
                  onChange={(e) => handleFilterChange("clientName", e.target.value)}
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
                  onChange={(e) => handleFilterChange("minAmount", e.target.value)}
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
                  onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  placeholder="Max amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div
                onClick={() => document.getElementById("startDate").showPicker?.()}
                className="cursor-pointer"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                />
              </div>

              <div
                onClick={() => document.getElementById("endDate").showPicker?.()}
                className="cursor-pointer"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
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
                  <option value="DR">DR</option>
                  <option value="Bonus">Bonus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game Name
                </label>
                <select
                  value={filters.gameName}
                  onChange={(e) => handleFilterChange("gameName", e.target.value)}
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
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID / Client Name
                </label>
                <input
                  type="text"
                  value={gameFilters.userId}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                  placeholder="Enter user ID or client name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={gameFilters.providerName}
                  onChange={(e) => handleFilterChange("providerName", e.target.value)}
                  placeholder="Enter provider name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game ID
                </label>
                <input
                  type="text"
                  value={gameFilters.gameId}
                  onChange={(e) => handleFilterChange("gameId", e.target.value)}
                  placeholder="Enter game ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game Name
                </label>
                <input
                  type="text"
                  value={gameFilters.gameName}
                  onChange={(e) => handleFilterChange("gameName", e.target.value)}
                  placeholder="Enter game name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={gameFilters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="bet">Bet</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="rollback">Rollback</option>
                </select>
              </div>

              <div
                onClick={() => document.getElementById("gameStartDate").showPicker?.()}
                className="cursor-pointer"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                  Start Date
                </label>
                <input
                  id="gameStartDate"
                  type="date"
                  value={gameFilters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                />
              </div>

              <div
                onClick={() => document.getElementById("gameEndDate").showPicker?.()}
                className="cursor-pointer"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                  End Date
                </label>
                <input
                  id="gameEndDate"
                  type="date"
                  value={gameFilters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                />
              </div>
            </>
          )}
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
                  onClick={() => {
                    setGameTransactionPage(1);
                    fetchGameTransactions(1, gameFilters);
                  }}
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
                      "Client Name": t?.clientName || t?.user?.clientName || "N/A",
                      "Transaction Type": t?.transactionType || "N/A",
                      Amount: t?.amount || 0,
                      "Game Name": t?.gameName || "N/A",
                      Mode: t?.mode || "N/A",
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
                    toast.error("Failed to download report: " + error.message);
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

      {/* Transactions Table */}
      <div className="gaming-card">
        {(() => {
          const userTxns = Array.isArray(transactions) ? transactions : [];
          const gameTxns = Array.isArray(gameTransactions) ? gameTransactions : [];
          const currentTransactions = activeTab === "user" ? userTxns : gameTxns;
          
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
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance After
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Game
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Round ID
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processed At
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction, index) => (
                    <tr
                      key={transaction?.id || transaction?._id || index}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {activeTab === "user" ? (page - 1) * 20 + index + 1 : (gameTransactionPage - 1) * 20 + index + 1}
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
                              className={`badge ${
                                transaction?.transactionType === "Deposit"
                                  ? "badge-green"
                                  : "badge-blue"
                              }`}
                            >
                              {transaction?.transactionType || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm font-semibold text-green-600">
                              ₹{transaction?.amount || 0}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {transaction?.gameName || "N/A"}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {transaction?.mode || "N/A"}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`badge ${
                                transaction?.status === "Accept"
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
                                ? new Date(transaction.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction?.createdAt
                                ? new Date(transaction.createdAt).toLocaleTimeString(
                                    "en-IN",
                                  )
                                : ""}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {transaction?.updatedAt
                                ? new Date(transaction.updatedAt).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction?.updatedAt
                                ? new Date(transaction.updatedAt).toLocaleTimeString(
                                    "en-IN",
                                  )
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
                                {(
                                  transaction?.userName ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {transaction?.userName || "Unknown User"}
                                </p>
                                {/* <p className="text-xs text-gray-500">
                                  {transaction?.userEmail || "N/A"}
                                </p> */}
                                {transaction?.userMobile && (
                                  <p className="text-xs text-gray-400">{transaction.userMobile}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`badge ${
                                transaction?.type === "bet"
                                  ? "badge-red"
                                  : transaction?.type === "win"
                                    ? "badge-green"
                                    : transaction?.type === "rollback"
                                      ? "badge-yellow"
                                      : "badge-blue"
                              }`}
                            >
                              {transaction?.type?.toUpperCase() || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm font-semibold text-green-600">
                              ₹{transaction?.amount || 0}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm font-semibold text-blue-600">
                              ₹{transaction?.balanceAfter || 0}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transaction?.gameName || transaction?.gameDetails?.game_name || "N/A"}
                              </p>
                              {(transaction?.subProvider || transaction?.gameDetails?.sub_provider_name) && (
                                <p className="text-xs text-gray-400">
                                  Sub: {transaction?.subProvider || transaction?.gameDetails?.sub_provider_name}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                ID: {transaction?.gap_gameId || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction?.providerName || transaction?.gameDetails?.provider_name || "N/A"}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900 font-mono">
                              {transaction?.gap_gameRoundId || "N/A"}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {transaction?.processedAt
                                ? new Date(transaction.processedAt).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction?.processedAt
                                ? new Date(transaction.processedAt).toLocaleTimeString(
                                    "en-IN",
                                  )
                                : ""}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {transaction?.remarks || "N/A"}
                            </p>
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
        {((activeTab === "user" && totalPages > 1) || (activeTab === "game" && gameTransactionTotalPages > 1)) && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              {activeTab === "user" ? (
                <>Showing page {page} of {totalPages} (Total: {totalTransactions} transactions)</>
              ) : (
                <>Showing page {gameTransactionPage} of {gameTransactionTotalPages} (Total: {gameTransactionTotal} transactions)</>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (activeTab === "user") {
                    setPage(page - 1);
                  } else {
                    setGameTransactionPage(gameTransactionPage - 1);
                  }
                }}
                disabled={(activeTab === "user" ? page === 1 : gameTransactionPage === 1) || loading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(activeTab === "user" ? totalPages : gameTransactionTotalPages, 5) }, (_, i) => {
                  const currentPage = activeTab === "user" ? page : gameTransactionPage;
                  const currentTotalPages = activeTab === "user" ? totalPages : gameTransactionTotalPages;
                  
                  let pageNum;
                  if (currentTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= currentTotalPages - 2) {
                    pageNum = currentTotalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        if (activeTab === "user") {
                          setPage(pageNum);
                        } else {
                          setGameTransactionPage(pageNum);
                        }
                      }}
                      disabled={loading}
                      className={`px-3 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (activeTab === "user") {
                    setPage(page + 1);
                  } else {
                    setGameTransactionPage(gameTransactionPage + 1);
                  }
                }}
                disabled={(activeTab === "user" ? page === totalPages : gameTransactionPage === gameTransactionTotalPages) || loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

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
                Amount: ₹{selectedTransaction?.amount}
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
