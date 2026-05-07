import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import BottomNavigation from "../components/BottomNavigation";
import { useTranslation } from "react-i18next";
import { BookOpen, Filter, X, Eye, ArrowDown, ArrowUp } from "lucide-react";

const Passbook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastContext();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: "", transactionType: "", minAmount: "", maxAmount: "" });
  const [casinoFilters, setCasinoFilters] = useState({ type: "", startDate: "", endDate: "" });
  const [casinoHistory, setCasinoHistory] = useState([]);
  const [casinoLoading, setCasinoLoading] = useState(false);
  const [casinoPage, setCasinoPage] = useState(1);
  const [casinoTotalPages, setCasinoTotalPages] = useState(1);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [screenshotData, setScreenshotData] = useState(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      if (activeTab === "transactions") fetchTransactions();
      else if (activeTab === "casino") fetchCasinoHistory();
    }
  }, [page, casinoPage, user, activeTab]);

  const fetchTransactions = async (currentPage = page, currentFilters = filters) => {
    setLoading(true);
    try {
      const payload = { page: currentPage, limit: 20, ...currentFilters };
      Object.keys(payload).forEach((k) => { if (!payload[k] && payload[k] !== 0) delete payload[k]; });
      const response = await apiHelper.post(`/transaction/getUserTransactions/${user?._id}`, payload);
      setTransactions(response?.data?.transactions || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch transactions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => { setPage(1); fetchTransactions(1, filters); setShowFilters(false); };

  const clearFilters = () => {
    if (activeTab === "transactions") {
      const c = { status: "", transactionType: "", minAmount: "", maxAmount: "" };
      setFilters(c); setPage(1); fetchTransactions(1, c);
    } else {
      const c = { type: "", startDate: "", endDate: "" };
      setCasinoFilters(c); setCasinoPage(1); fetchCasinoHistory(1, c);
    }
    setShowFilters(false);
  };

  const fetchCasinoHistory = async (currentPage = casinoPage, currentFilters = casinoFilters) => {
    setCasinoLoading(true);
    try {
      const payload = { userId: user?._id, page: currentPage, pageSize: 20, ...currentFilters };
      Object.keys(payload).forEach((k) => { if (!payload[k] && payload[k] !== 0) delete payload[k]; });
      const response = await apiHelper.post("/getGAPTransactions", payload);
      setCasinoHistory(response?.data?.transactions || []);
      setCasinoTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch casino history: " + error.message);
    } finally {
      setCasinoLoading(false);
    }
  };

  const handleCasinoFilterChange = (key, value) => setCasinoFilters((prev) => ({ ...prev, [key]: value }));
  const applyCasinoFilters = () => { setCasinoPage(1); fetchCasinoHistory(1, casinoFilters); setShowFilters(false); };

  const fetchTransactionScreenshot = async (transactionId) => {
    setScreenshotLoading(true);
    try {
      const response = await apiHelper.get(`/transaction/fetch_powerPay_transaction_screenshot/${transactionId}`);
      setScreenshotData(response);
      setShowScreenshot(true);
    } catch (error) {
      toast.error("Failed to fetch screenshot: " + error.message);
    } finally {
      setScreenshotLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Accept") return { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Accept" };
    if (status === "Reject") return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Rejected" };
    if (status === "Initial") return { bg: "rgba(99,102,241,0.15)", color: "#818cf8", label: "Initial" };
    return { bg: "rgba(251,146,60,0.15)", color: "#fb923c", label: status || "Pending" };
  };

  const inputCls = "w-full px-4 py-3 rounded-xl outline-none text-white text-sm bg-[#2a2a2a] border border-white/10 focus:border-[#1477b0]";
  const labelCls = "text-xs font-medium text-gray-400 mb-1 block";

  return (
    <div className="min-h-screen bg-[#0e0e0e] max-w-[769px] mx-auto">

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between" style={{ background: "#1b1b1b", borderBottom: "1px solid rgba(20,119,176,0.3)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(20,119,176,0.2)" }}>
            <BookOpen size={18} className="text-[#1477b0]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{t("history")}</h1>
            <p className="text-[11px] text-gray-500">{t("viewHistory")}</p>
          </div>
        </div>
        <button onClick={() => setShowFilters(true)} className="p-2 rounded-xl transition" style={{ background: "rgba(20,119,176,0.15)", border: "1px solid rgba(20,119,176,0.3)" }}>
          <Filter size={18} className="text-[#1477b0]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex rounded-xl p-1 gap-1" style={{ background: "#1b1b1b", border: "1px solid rgba(255,255,255,0.07)" }}>
          {["transactions", "casino"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab ? "#1477b0" : "transparent",
                color: activeTab === tab ? "#fff" : "#666",
              }}
            >
              {tab === "transactions" ? "Transactions" : "Casino History"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-24 pt-2 space-y-3">

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#1477b0] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen size={40} className="text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">No transactions found</p>
              </div>
            ) : (
              transactions.map((tx, i) => {
                const isDeposit = tx.transactionType === "Deposit";
                const status = getStatusStyle(tx.status);
                return (
                  <div key={tx._id || i} className="rounded-2xl p-4" style={{ background: "#1b1b1b", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isDeposit ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}>
                        {isDeposit
                          ? <ArrowDown size={20} style={{ color: "#22c55e" }} />
                          : <ArrowUp size={20} style={{ color: "#ef4444" }} />}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {tx.transactionType} — {tx.mode === "ALLINONE" ? "INSTANT PAYOUT" : tx.mode === "LEOPAY" ? "QUICKPAY" : tx.mode || "N/A"}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          #{tx._id?.slice(-6)} · {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                      {/* Amount + Status */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold" style={{ color: isDeposit ? "#22c55e" : "#ef4444" }}>
                          {isDeposit ? "+" : "-"}₹{tx.amount}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      {[
                        { label: t("gameName"), value: tx.gameName || "N/A" },
                        { label: t("clientName"), value: tx.clientName || "N/A" },
                        { label: t("remark"), value: tx.remarks || "—" },
                        { label: t("createdAt"), value: tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-IN") : "N/A" },
                        { label: t("updatedAt"), value: tx.updatedAt ? new Date(tx.updatedAt).toLocaleString("en-IN") : "N/A" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start gap-2">
                          <span className="text-gray-100 text-xs flex-shrink-0">{label}:</span>
                          <span className="text-gray-300 text-xs text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Screenshot button */}
                    {tx.transactionType === "Withdrawal" && tx.mode === "PowerPay" && tx.status !== "Reject" && (
                      <button
                        onClick={() => fetchTransactionScreenshot(tx._id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition"
                        style={{ background: "rgba(20,119,176,0.15)", color: "#1477b0", border: "1px solid rgba(20,119,176,0.3)" }}
                      >
                        <Eye size={15} /> View Screenshot
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1 pt-2">
                <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>
                    Prev
                  </button>
                  <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* CASINO TAB */}
        {activeTab === "casino" && (
          <>
            {casinoLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#1477b0] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading casino history...</p>
              </div>
            ) : casinoHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 text-sm">No casino history found</p>
              </div>
            ) : (
              casinoHistory.map((game, i) => {
                const isWin = game.type === "win" || game.type === "rollback";
                const typeColors = {
                  win: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", sign: "+" },
                  loss: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", sign: "-" },
                  bet: { bg: "rgba(99,102,241,0.15)", color: "#818cf8", sign: "-" },
                  rollback: { bg: "rgba(251,146,60,0.15)", color: "#fb923c", sign: "+" },
                };
                const tc = typeColors[game.type] || { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", sign: "" };
                return (
                  <div key={game._id || i} className="rounded-2xl p-4" style={{ background: "#1b1b1b", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
                        {isWin ? <ArrowDown size={20} style={{ color: tc.color }} /> : <ArrowUp size={20} style={{ color: tc.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {game?.gameDetails?.game_name || "Casino Game"} — {game.type?.toUpperCase() || "N/A"}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          #{game._id?.slice(-6)} · {game.createdAt ? new Date(game.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold" style={{ color: tc.color }}>
                          {tc.sign}₹{game.amount || 0}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: tc.bg, color: tc.color }}>
                          {game.type?.toUpperCase() || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      {[
                        { label: "Game", value: game?.gameDetails?.game_name || "N/A" },
                        { label: "Provider", value: game?.gameDetails?.provider_name || "N/A" },
                        { label: "Round ID", value: game.gap_gameRoundId || "N/A" },
                        { label: "Remark", value: game.remarks || "N/A" },
                        { label: "Created At", value: game.createdAt ? new Date(game.createdAt).toLocaleString("en-IN") : "N/A" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start gap-2">
                          <span className="text-gray-100 text-xs flex-shrink-0">{label}:</span>
                          <span className="text-gray-300 text-xs text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {casinoTotalPages > 1 && (
              <div className="flex items-center justify-between px-1 pt-2">
                <span className="text-gray-500 text-sm">Page {casinoPage} of {casinoTotalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setCasinoPage(casinoPage - 1)} disabled={casinoPage === 1}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>
                    Prev
                  </button>
                  <button onClick={() => setCasinoPage(casinoPage + 1)} disabled={casinoPage === casinoTotalPages}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-[9999] max-w-[769px] mx-auto">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5" style={{ background: "#1b1b1b", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-base">{t("applyFilters")}</h3>
              <button onClick={() => setShowFilters(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            {activeTab === "transactions" ? (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>{t("status")}</label>
                  <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} className={inputCls}>
                    <option value="">{t("allStatus")}</option>
                    <option value="Initial">{t("initial")}</option>
                    <option value="Pending">{t("pending")}</option>
                    <option value="Accept">{t("accept")}</option>
                    <option value="Reject">{t("reject")}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("type")}</label>
                  <select value={filters.transactionType} onChange={(e) => handleFilterChange("transactionType", e.target.value)} className={inputCls}>
                    <option value="">{t("allTypes")}</option>
                    <option value="Deposit">{t("deposit")}</option>
                    <option value="Withdrawal">{t("withdraw")}</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Min Amount</label>
                    <input type="number" placeholder="0" value={filters.minAmount} onChange={(e) => handleFilterChange("minAmount", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Amount</label>
                    <input type="number" placeholder="0" value={filters.maxAmount} onChange={(e) => handleFilterChange("maxAmount", e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={applyFilters} className="flex-1 py-3 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>
                    {t("applyFilters")}
                  </button>
                  <button onClick={clearFilters} className="flex-1 py-3 rounded-xl font-medium text-sm" style={{ background: "#2a2a2a", color: "#1477b0", border: "1px solid rgba(20,119,176,0.4)" }}>
                    {t("clear")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={casinoFilters.type} onChange={(e) => handleCasinoFilterChange("type", e.target.value)} className={inputCls}>
                    <option value="">All Types</option>
                    <option value="bet">Bet</option>
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="rollback">Rollback</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="date" value={casinoFilters.startDate} onChange={(e) => handleCasinoFilterChange("startDate", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="date" value={casinoFilters.endDate} onChange={(e) => handleCasinoFilterChange("endDate", e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={applyCasinoFilters} className="flex-1 py-3 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>
                    Apply Filters
                  </button>
                  <button onClick={clearFilters} className="flex-1 py-3 rounded-xl font-medium text-sm" style={{ background: "#2a2a2a", color: "#1477b0", border: "1px solid rgba(20,119,176,0.4)" }}>
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {showScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#1b1b1b", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-semibold text-sm">Transaction Screenshot</h3>
              <button onClick={() => { setShowScreenshot(false); setScreenshotData(null); }}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              {screenshotLoading ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-8 h-8 border-2 border-[#1477b0] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-gray-500 text-sm">Loading...</p>
                </div>
              ) : screenshotData?.data?.data?.screenshotPeer ? (
                <img src={screenshotData.data.data.screenshotPeer} alt="Screenshot" className="w-full rounded-xl" />
              ) : (
                <p className="text-center text-gray-500 text-sm py-8">No screenshot available</p>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activePage="passbook" />
    </div>
  );
};

export default Passbook;
