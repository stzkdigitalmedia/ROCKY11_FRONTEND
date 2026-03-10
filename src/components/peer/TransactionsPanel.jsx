import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Bell,
} from "lucide-react";
import { apiHelper } from "../../utils/apiHelper";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";

const TransactionsPanel = ({ transactionType = "Deposit" }) => {
  const { user } = useAuth(true);
  const { on, off } = useSocket(user?.clientName);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [acceptForm, setAcceptForm] = useState({
    remarks: "",
    peerScreenShot: null,
  });
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectError, setRejectError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [filters, setFilters] = useState({
    status: null,
    clientName: "",
    minAmount: null,
    maxAmount: null,
    startDate: null,
    endDate: null,
  });

  //--------------------------------------------------------------------
  // Socket event listeners and Notifications ---(TransactionsPanel)------
  //--------------------------------------------------------------------

  useEffect(() => {
    if (!user?.clientName) return;

    const handleNewTransaction = (data) => {
      if (
        data?.transactionType === transactionType ||
        data?.transactionType ===
          (transactionType === "Deposit" ? "Deposit" : "Withdrawal")
      ) {
        // Show custom notification------
        setNotification({
          type: data?.transactionType,
          clientName: data?.clientName || "User",
          amount: data?.amount || 0,
        });

        setTimeout(() => setNotification(null), 7000);

        const audio = new Audio("/newnotification.mp3");
        audio.play().catch((e) => console.log("Audio play failed:", e));

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Transaction Request", {
            body: `${data?.clientName || "User"} - ₹${data?.amount || 0} ${data?.transactionType}`,
            icon: "/logo.png",
          });
        }

        fetchTransactions();
      }
    };

    const handleTransactionUpdate = (data) => {
      fetchTransactions();
    };

    on("newManualTransaction", handleNewTransaction);
    on("transactionStatusUpdated", handleTransactionUpdate);

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      off("newManualTransaction", handleNewTransaction);
      off("transactionStatusUpdated", handleTransactionUpdate);
    };
  }, [user, transactionType]);

  //-----------------------------------------------------------------------//

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const payload = {
        page: 1,
        limit: 20,
        status: filters.status,
        transactionType,
        clientName: filters.clientName || null,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const response = await apiHelper.post(
        "/transaction/getAllUser_Manual_TransactionsHistory",
        payload,
      );
      setTransactions(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [transactionType, filters]);

  const handleAccept = (transaction) => {
    setSelectedTransaction(transaction);
    setAcceptForm({ remarks: "", peerScreenShot: null });
    setShowAcceptModal(true);
  };

  const submitAccept = async () => {
    try {
      const formData = new FormData();
      formData.append("remarks", acceptForm.remarks);
      formData.append("status", "Accept");

      if (transactionType === "Withdrawal" && acceptForm.peerScreenShot) {
        formData.append("peerScreenShot", acceptForm.peerScreenShot);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transaction/updateManual_TransactionStatus/${selectedTransaction._id}`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok)
        throw new Error(result?.message || "Failed to accept transaction");

      setShowAcceptModal(false);
      fetchTransactions();
    } catch (error) {
      console.error("Failed to accept transaction:", error);
    }
  };

  // Reject flow-------
  const handleReject = (transaction) => {
    setSelectedTransaction(transaction);
    setRejectRemarks("");
    setRejectError(null);
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    try {
      setRejectError(null);

      // No screenshot required for rejection; server expects status and remarks

      const formData = new FormData();
      formData.append("status", "Reject");
      formData.append("remarks", rejectRemarks || "");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transaction/updateManual_TransactionStatus/${selectedTransaction._id}`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.message || "Failed to reject transaction");

      setShowRejectModal(false);
      fetchTransactions();
    } catch (error) {
      console.error("Failed to reject transaction:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: null,
      clientName: "",
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null,
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6">
      {/* Custom Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 min-w-[350px] border border-blue-500">
            <div className="bg-white/20 p-2 rounded-full animate-pulse">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">
                New {notification.type} Request
              </p>
              <p className="text-blue-100 text-sm">
                {notification.clientName} • ₹
                {notification.amount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {transactionType === "Deposit"
              ? "💰 Deposit Management"
              : "💸 Withdraw Management"}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all {transactionType.toLowerCase()} transactions
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-600">
            {transactions.length}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accept">Accept</option>
              <option value="Reject">Reject</option>
            </select>
          </div>

          {/* Client Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={filters.clientName}
              onChange={(e) => handleFilterChange("clientName", e.target.value)}
              placeholder="Search by client name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Min Amount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.minAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minAmount",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              placeholder="Minimum amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Amount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={filters.maxAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxAmount",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              placeholder="Maximum amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium shadow-sm"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchTransactions}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div
            className="loading-spinner mx-auto mb-4"
            style={{ width: "48px", height: "48px" }}
          ></div>
          <p className="text-gray-600 font-medium text-lg">
            Loading transactions...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Screenshot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg">
                        No transactions found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr
                      key={transaction._id || index}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {transaction.clientName?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {transaction.clientName || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.transactionType === "Deposit" ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-bold text-gray-900">
                            ₹{transaction.amount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {transaction.transactionType === "Withdrawal" ? (
                          <div className="text-xs space-y-1">
                            <p className="text-gray-700">
                              <span className="font-semibold">Bank:</span>{" "}
                              {transaction.bankName || "N/A"}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">A/C:</span>{" "}
                              {transaction.accNo || "N/A"}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Holder:</span>{" "}
                              {transaction.accHolderName || "N/A"}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">IFSC:</span>{" "}
                              {transaction.ifscCode || "N/A"}
                            </p>
                            {transaction.upiId && (
                              <p className="text-gray-700">
                                <span className="font-semibold">UPI:</span>{" "}
                                {transaction.upiId}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-700 font-mono">
                            UTR: {transaction.utrNo || "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status === "Accept"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status === "Pending" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {transaction.status === "Accept" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {transaction.status === "Reject" && (
                            <XCircle className="w-3 h-3" />
                          )}
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {transactionType === "Deposit" ? (
                          transaction.userScreenShot ? (
                            <button
                              onClick={() => {
                                setSelectedImage(transaction.userScreenShot);
                                setShowImageModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No screenshot
                            </span>
                          )
                        ) : transaction.peerScreenShot ? (
                          <button
                            onClick={() => {
                              setSelectedImage(transaction.peerScreenShot);
                              setShowImageModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No screenshot
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.status === "Pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(transaction)}
                              className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium shadow-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(transaction)}
                              className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Transaction Screenshot"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Accept Transaction</h3>
              <button onClick={() => setShowAcceptModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Remarks
                </label>
                <textarea
                  value={acceptForm.remarks}
                  onChange={(e) =>
                    setAcceptForm({ ...acceptForm, remarks: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  required
                />
              </div>

              {transactionType === "Withdrawal" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Peer Screenshot
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {!acceptForm.peerScreenShot ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file)
                              setAcceptForm({
                                ...acceptForm,
                                peerScreenShot: file,
                              });
                          }}
                          className="hidden"
                          id={`peer-screenshot-${transactionType}`}
                          required
                        />
                        <label
                          htmlFor={`peer-screenshot-${transactionType}`}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-sm text-gray-600">
                              Click to upload screenshot
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              PNG, JPG up to 10MB
                            </span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(acceptForm.peerScreenShot)}
                          alt="Screenshot Preview"
                          className="max-w-full h-40 object-contain rounded mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAcceptForm({
                              ...acceptForm,
                              peerScreenShot: null,
                            })
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                          Screenshot uploaded successfully
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAccept}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reject Transaction</h3>
              <button onClick={() => setShowRejectModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Remarks (optional)
                </label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>

              {/* No screenshot required for rejects; only remarks are collected */}

              {rejectError && (
                <p className="text-sm text-red-600">{rejectError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPanel;
