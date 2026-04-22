import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import { useSocket } from "../hooks/useSocket";
import PasswordInput from "../components/PasswordInput";
import PhoneInput from "../components/PhoneInput";
import {
	Wallet,
	Plus,
	BarChart3,
	Gamepad2,
	X,
	Check,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Copy,
	ArrowUp,
	ArrowDown,
	Link2,
	LinkIcon,
	CheckCircle,
	GiftIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

// Modal Components
import CreateIdModal from "../components/modals/CreateIdModal";
import WalletModal from "../components/modals/WalletModal";
import CreateTransactionModal from "../components/modals/CreateTransactionModal";
import AddBankModal from "../components/modals/AddBankModal";
import SubUserWithdrawModal from "../components/modals/SubUserWithdrawModal";
import SubUserDepositModal from "../components/modals/SubUserDepositModal";
import ResetPasswordModal from "../components/modals/ResetPasswordModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import AvailableBonuses from "../components/AvailableBonuses";

const UserDashboard = () => {
	const { user, logout } = useAuth(true);
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [showCreateId, setShowCreateId] = useState(false);
	const [games, setGames] = useState([]);
	const [subAccounts, setSubAccounts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [subAccountsLoading, setSubAccountsLoading] = useState(false);
	const [showWallet, setShowWallet] = useState(false);
	const [userTransactions, setUserTransactions] = useState([]);
	const [userBalance, setUserBalance] = useState(0);
	const [transactionsLoading, setTransactionsLoading] = useState(false);
	const [balanceLoading, setBalanceLoading] = useState(false);
	const [showCreateTransaction, setShowCreateTransaction] = useState(false);
	const [transactionProcessing, setTransactionProcessing] = useState(false);
	const [transactionForm, setTransactionForm] = useState({
		amount: "",
		transactionType: "Deposit",
		accountHolderName: "",
		accountNumber: "",
		ifscCode: "",
		bankName: "",
	});
	const [showAddBankModal, setShowAddBankModal] = useState(false);
	const [savedBanks, setSavedBanks] = useState([]);
	const [selectedBankId, setSelectedBankId] = useState("");
	const [banksLoading, setBanksLoading] = useState(false);
	const [bankForm, setBankForm] = useState({
		accountHolderName: "",
		accountNumber: "",
		ifscCode: "",
		bankName: "",
		upiId: "",
	});
	const [showSubUserWithdraw, setShowSubUserWithdraw] = useState(false);
	const [selectedSubUser, setSelectedSubUser] = useState(null);
	const [subUserWithdrawForm, setSubUserWithdrawForm] = useState({
		amount: "",
		selectedBankId: "",
	});
	const [subUserBalance, setSubUserBalance] = useState(0);
	const [subUserBalanceLoading, setSubUserBalanceLoading] = useState(false);
	const [showSubUserDeposit, setShowSubUserDeposit] = useState(false);
	const [subUserDepositForm, setSubUserDepositForm] = useState({
		amount: "",
	});
	const [showBalanceLog, setShowBalanceLog] = useState(false);
	const [balanceLogData, setBalanceLogData] = useState([]);
	const [balanceLogLoading, setBalanceLogLoading] = useState(false);
	const [idCreated, setIdCreated] = useState(false);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [selectedBranch, setSelectedBranch] = useState("");
	const [announcement, setAnnouncement] = useState(null); // { text, image }
	const [videoAnnouncement, setVideoAnnouncement] = useState(null); // { video }
	const [panels, setPanels] = useState([]);

	const [updatedTransactions, setUpdatedTransactions] = useState("");
	const [showResetPassword, setShowResetPassword] = useState(false);
	const [resetPasswordForm, setResetPasswordForm] = useState({
		newPassword: "",
	});
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalTransactions, setTotalTransactions] = useState(0);
	const [walletFilters, setWalletFilters] = useState({
		status: "",
		transactionType: "",
		minAmount: "",
		maxAmount: "",
	});

	const [accountToDelete, setAccountToDelete] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [notification, setNotification] = useState(null);
	const [userAnnouncement, setUserAnnouncement] = useState('');
	const { on, off } = useSocket(user?.clientName);

	const showNotification = (message, type = "success") => {
		setNotification({ message, type });
		setTimeout(() => setNotification(null), 4000);
	};

	const [currentSlide, setCurrentSlide] = useState(0);
	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);
	const [formData, setFormData] = useState({
		gameId: "",
		clientName: "",
		password: "",
		phone: "",
	});
	const toast = useToastContext();

	// Touch handlers for swipe functionality
	const handleTouchStart = (e) => {
		setTouchStart(e.targetTouches[0].clientX);
	};

	const handleTouchMove = (e) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > 50;
		const isRightSwipe = distance < -50;

		if (isLeftSwipe) {
			// Swipe left - go to next slide
			const step = window.innerWidth >= 640 ? 2 : 1;
			const maxSlide =
				window.innerWidth >= 640
					? Math.max(0, subAccounts.length - 2)
					: subAccounts.length - 1;
			setCurrentSlide(Math.min(maxSlide, currentSlide + step));
		}

		if (isRightSwipe) {
			// Swipe right - go to previous slide
			const step = window.innerWidth >= 640 ? 2 : 1;
			setCurrentSlide(Math.max(0, currentSlide - step));
		}
	};

	const fetchBanks = async () => {
		setBanksLoading(true);
		try {
			const userId = user?._id;
			if (!userId) return;
			const response = await apiHelper.get(
				`/bank/getAllBanksWithoutPagination/${userId}`,
			);
			const banksList = response?.banks || response?.data || response || [];
			setSavedBanks(banksList);
		} catch (error) {
			console.error("Failed to fetch banks:", error);
			setSavedBanks([]);
		} finally {
			setBanksLoading(false);
		}
	};

	const handleSaveBank = async (e) => {
		e.preventDefault();
		try {
			const userId = user?._id;
			if (!userId) {
				toast.error("User not found");
				return;
			}

			const payload = {
				userId: userId,
				upiId: bankForm.upiId,
				bankName: bankForm.bankName,
				accNo: bankForm.accountNumber,
				accHolderName: bankForm.accountHolderName,
				ifscCode: bankForm.ifscCode,
				isActive: true,
			};

			await apiHelper.post("/bank/addBank", payload);
			toast.success("Bank added successfully!");
			setBankForm({
				accountHolderName: "",
				accountNumber: "",
				ifscCode: "",
				bankName: "",
				upiId: "",
			});
			setShowAddBankModal(false);
			fetchBanks();
		} catch (error) {
			toast.error("Failed to add bank: " + error.message);
		}
	};

	const handleDeleteBank = async (bankId) => {
		try {
			if (!bankId) {
				toast.error("Bank ID not found");
				return;
			}

			if (
				window.confirm("Are you sure you want to delete this bank account?")
			) {
				await apiHelper.delete(`/bank/deleteBank/${bankId}`);
				toast.success("Bank account deleted successfully!");
				fetchBanks();
				setSelectedBankId("");
			}
		} catch (error) {
			toast.error("Failed to delete bank account: " + error.message);
		}
	};

	const createBalanceLog = async (userId) => {
		try {
			await apiHelper.post("/balance/createBalanceLog", { userId });
		} catch (error) {
			console.error("Failed to create balance log:", error);
		}
	};

	const fetchSubUserBalance = async (subAccountId) => {
		setSubUserBalanceLoading(true);
		try {
			const response = await apiHelper.get(
				`/balance/getBalanceLogBySubUserId/${subAccountId}`,
			);
			const logData = response?.data || response || [];
			const latestLog = Array.isArray(logData) ? logData[0] : logData;

			if (latestLog?.status === "Accept") {
				setSubUserBalance(latestLog?.CurrentBalance || 0);
				const payload = {
					amount: latestLog?.CurrentBalance,
					subUserId: subAccountId,
				};
				setSubUserBalanceLoading(false);
			} else {
				// Keep loading if status is pending
				setTimeout(() => fetchSubUserBalance(subAccountId));
			}
		} catch (error) {
			console.error("Failed to fetch sub-user balance:", error);
			setSubUserBalance(0);
			setSubUserBalanceLoading(false);
		}
	};

	const handleSubUserWithdraw = async (e) => {
		e.preventDefault();
		setTransactionProcessing(true);

		try {
			// if (subUserWithdrawForm.selectedBankId === '') {
			//   toast.error('Please select a bank account');
			//   setTransactionProcessing(false);
			//   return;
			// }

			// const selectedBank = savedBanks[parseInt(subUserWithdrawForm.selectedBankId)];
			// if (!selectedBank) {
			//   toast.error('Selected bank not found');
			//   setTransactionProcessing(false);
			//   return;
			// }

			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				amount: parseFloat(subUserWithdrawForm.amount),
				mode: "Wallet",
				role: "SubUser",
				// upiId: selectedBank.upiId,
				// bankName: selectedBank.bankName,
				// accNo: selectedBank.accNo,
				// accHolderName: selectedBank.accHolderName,
				// ifscCode: selectedBank.ifscCode
			};

			await apiHelper.post(
				"/transaction/withdrawAmountRequest_ForSubUser",
				payload,
			);
			toast.info(
				"Withdrawal request submitted successfully plese check history!",
			);
			setShowSubUserWithdraw(false);
			setSubUserWithdrawForm({ amount: "", selectedBankId: "" });
			setSelectedSubUser(null);
			fetchUserBalance();
		} catch (error) {
			toast.error("Failed to submit withdrawal request: " + error.message);
		} finally {
			setTransactionProcessing(false);
		}
	};

	const checkTransactionStatus = async (subAccountId) => {
		try {
			const response = await apiHelper.get(
				`/transaction/latest-transaction/${subAccountId}`,
			);
			const transaction = response?.data || response;

			if (transaction?.status === "Accept") {
				toast.success("Your transaction successful!");
				setTransactionProcessing(false);
				setShowSubUserDeposit(false);
				setSubUserDepositForm({ amount: "" });
				setSelectedSubUser(null);
				fetchUserBalance();
			} else {
				setTimeout(() => checkTransactionStatus(subAccountId), 1000);
			}
		} catch (error) {
			console.error("Failed to check transaction status:", error);
			setTransactionProcessing(false);
		}
	};

	const handleSubUserDeposit = async (e) => {
		e.preventDefault();
		setTransactionProcessing(true);

		try {
			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				amount: parseFloat(subUserDepositForm.amount),
				mode: "Wallet",
				role: "SubUser",
			};

			await apiHelper.post(
				"/transaction/depositAmountRequest_ForSubUser",
				payload,
			);
			checkTransactionStatus(selectedSubUser?.id || selectedSubUser?._id);
		} catch (error) {
			toast.error("Failed to submit deposit request: " + error.message);
			setTransactionProcessing(false);
		}
	};

	const checkPasswordResetStatus = async (clientName) => {
		try {
			const response = await apiHelper.get(
				`/password/get-latestPassword-change-by-clientName/${clientName}`,
			);
			const passwordChange = response?.data || response;

			if (passwordChange?.status === "Completed") {
				toast.success("Password reset completed successfully!");
				setResetPasswordLoading(false);
				setShowResetPassword(false);
				setResetPasswordForm({ newPassword: "" });
				setSelectedSubUser(null);
				fetchSubAccounts();
			} else {
				setTimeout(() => checkPasswordResetStatus(clientName), 2000);
			}
		} catch (error) {
			console.error("Failed to check password reset status:", error);
			setResetPasswordLoading(false);
		}
	};

	// const handleResetPassword = async (e) => {
	//   e.preventDefault();
	//   setResetPasswordLoading(true);

	//   try {
	//     if (resetPasswordForm.newPassword.includes(' ')) {
	//       toast.error('Password cannot contain spaces');
	//       setResetPasswordLoading(false);
	//       return;
	//     }

	//     if (!validatePassword(resetPasswordForm.newPassword)) {
	//       toast.error('Password must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character. Avoid common passwords and sequential patterns');
	//       setResetPasswordLoading(false);
	//       return;
	//     }

	//     const payload = {
	//       subUserId: selectedSubUser?.id || selectedSubUser?._id,
	//       clientName: selectedSubUser?.clientName,
	//       newPassword: resetPasswordForm.newPassword
	//     };

	//     await apiHelper.post('/password/create-password-change-log', payload);
	//     toast.success('Password reset request submitted successfully!');
	//     setResetPasswordLoading(false);
	//     setShowResetPassword(false);
	//     setResetPasswordForm({ newPassword: '' });
	//     setSelectedSubUser(null);
	//     checkPasswordResetStatus(selectedSubUser?.clientName);
	//   } catch (error) {
	//     toast.error('Failed to reset password: ' + error.message);
	//     setResetPasswordLoading(false);
	//   }
	// };

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setResetPasswordLoading(true);

		try {
			let finalPassword = resetPasswordForm.newPassword;

			// ✅ LOTUSBOOK default password
			if (selectedSubUser?.gameName === "LOTUSBOOK") {
				finalPassword = "Lotu@1255";
			} else {
				if (finalPassword.includes(" ")) {
					toast.error("Password cannot contain spaces");
					setResetPasswordLoading(false);
					return;
				}

				if (!validatePassword(finalPassword)) {
					toast.error(
						"Password must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character",
					);
					setResetPasswordLoading(false);
					return;
				}
			}

			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				clientName: selectedSubUser?.clientName,
				newPassword: finalPassword,
			};

			await apiHelper.post("/password/create-password-change-log", payload);

			toast.success("Password reset request submitted successfully!");
			setShowResetPassword(false);
			setResetPasswordForm({ newPassword: "" });
			setSelectedSubUser(null);

			checkPasswordResetStatus(selectedSubUser?.clientName);
		} catch (error) {
			toast.error("Failed to reset password: " + error.message);
		} finally {
			setResetPasswordLoading(false);
		}
	};

	const fetchGames = async () => {
		try {
			// Fetch both games and panels
			const [gamesResponse, panelsResponse] = await Promise.all([
				apiHelper.get("/game/getAllGamesWithPagination?page=1&limit=50"),
				apiHelper.get("/panel/getAllPanels?page=1&limit=10"),
			]);

			const gamesList =
				gamesResponse.games || gamesResponse.data || gamesResponse || [];
			const panelsData =
				panelsResponse.data?.panels ||
				panelsResponse.panels ||
				panelsResponse.data ||
				panelsResponse ||
				[];

			// Filter only active panels
			const activePanels = panelsData.filter(
				(panel) => panel?.isActive === true,
			);

			// Get unique game names from active panels
			const activeGameNames = [
				...new Set(activePanels.map((panel) => panel.panelName || panel.name)),
			];

			// Filter games that have active panels
			const availableGames = gamesList.filter(
				(game) =>
					activeGameNames.includes(game.name) && (game.status || game.isActive),
			);

			setGames(availableGames);
			setPanels(activePanels);
		} catch (error) {
			console.error("Failed to fetch games:", error);
			setGames([]);
		}
	};

	const fetchSubAccounts = async () => {
		setSubAccountsLoading(true);
		try {
			const response = await apiHelper.get(
				"/subAccount/getSubAccounts?page=1&limit=50",
			);
			const accountsList =
				response?.subAccounts || response?.data || response || [];
			const filteredAccounts = accountsList.filter(account => account.status !== 'Reject');
			setSubAccounts(filteredAccounts);
		} catch (error) {
			console.error("Failed to fetch sub accounts:", error);
			toast.error("Failed to fetch sub accounts: " + error.message);
		} finally {
			setSubAccountsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const checkIdCreationStatus = async (subAccountId) => {
		try {
			const response = await apiHelper.get(
				`/subAccount/latest-sub-user/${subAccountId}`,
			);
			const transaction = response?.data?.status;

			if (transaction === "Accept") {
				setIdCreated(true);
				setTimeout(() => {
					setLoading(false);
					setShowCreateId(false);
					setIdCreated(false);
					setFormData({
						gameId: formData.gameId,
						clientName: "",
						password: "",
						phone: "",
					});
					fetchSubAccounts();
					fetchGames();
				}, 2000);
				return; // Stop further API calls
			} else {
				setTimeout(() => checkIdCreationStatus(subAccountId), 2000);
			}
		} catch (error) {
			console.error("Failed to check ID creation status:", error);
			setLoading(false);
		}
	};

	const validatePassword = (password) => {
		const regex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		const commonPasswords = [
			"Abcd@1234",
			"Password@123",
			"Admin@123",
			"Test@1234",
			"User@1234",
		];

		// Check for sequential alphabetical patterns
		const hasSequentialPattern =
			/abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i.test(
				password,
			);

		return (
			regex.test(password) &&
			!commonPasswords.includes(password) &&
			!hasSequentialPattern
		);
	};

	const handleCreateId = async (e) => {
		e.preventDefault();

		if (formData.clientName.length > 6) {
			toast.error("Client name must be maximum 6 characters");
			return;
		}

		if (formData.clientName.includes(" ")) {
			toast.error("Client name cannot contain spaces");
			return;
		}

		if (!/^[a-zA-Z0-9]+$/.test(formData.clientName)) {
			toast.error("Client name can only contain letters and numbers");
			return;
		}

		setLoading(true);

		try {
			const payload = {
				gameId: formData.gameId,
				clientName: formData.clientName,
				phone: user?.phone || "",
			};

			const response = await apiHelper.post(
				"/subAccount/createSubAccount",
				payload,
			);
			const createdAccount = response?.data || response;
			const subAccountId = createdAccount?.id || createdAccount?._id;

			if (subAccountId) {
				checkIdCreationStatus(subAccountId);
			} else {
				toast.success("ID created successfully!");
				setLoading(false);
				setShowCreateId(false);
				setFormData({
					gameId: formData.gameId,
					clientName: "",
					password: "",
					phone: "",
				});
				fetchSubAccounts();
			}
		} catch (error) {
			toast.error("Failed to create ID: " + error.message);
			setLoading(false);
		}
	};

	const fetchUserBalance = async () => {
		setBalanceLoading(true);
		try {
			const userId = user?._id;
			if (!userId) {
				return;
			}
			const balanceResponse = await apiHelper.get(
				`/transaction/get_MainUserBalance/${userId}`,
			);
			setUserBalance(balanceResponse?.data?.balance || 0);
		} catch (error) {
			console.error("Failed to fetch balance:", error);
			setUserBalance(0);
		} finally {
			setBalanceLoading(false);
		}
	};

	const checkPendingTransactions = async () => {
		try {
			const userId = user?._id;
			if (!userId) return;

			const transactionsResponse = await apiHelper.post(
				`/transaction/getUserTransactions/${userId}?page=1&limit=15`,
			);
			const transactions = transactionsResponse?.data?.transactions || [];

			for (const transaction of transactions) {
				if (
					transaction?.status === "Accept" &&
					transaction?.mode == "Wallet" &&
					transaction?.transactionStatus != "Completed"
				) {
					try {
						// ✅ Step 1: Get transaction detail
						const statusResponse = await apiHelper.get(
							`/transaction/get_single_transactions/${transaction?._id}`,
						);

						if (statusResponse?.data) {
							const currentStatus = statusResponse?.data?.status;

							// ✅ Step 2: Update transaction based on status
							let updatedStatus = "Pending"; // default
							if (currentStatus === "Accept") {
								updatedStatus = "Completed";
							} else if (currentStatus === "Insufficent") {
								updatedStatus = "Reject";
							} else if (currentStatus === "Pending") {
								updatedStatus = "Pending";
							}

							await apiHelper.patch(
								`/transaction/update_Wallet_Withdrawal_Transaction/${transaction?._id}`,
								{
									status: updatedStatus,
								},
							);

							setUpdatedTransactions(transaction?._id);

							// ✅ Step 3: Handle toast + balance refresh
							if (updatedStatus === "Completed") {
								toast.success("Transaction completed successfully!");
								fetchUserBalance();
							}
						}
					} catch (error) {
						console.log("Error updating transaction:", transaction?._id, error);
					}
				}
			}

			for (const transaction of transactions) {
				try {
					const statusResponse = await apiHelper.get(
						`/transaction/callCheckStatus/${transaction?._id}`,
					);

					if (!statusResponse?.data?.success) continue;

					const newStatus = statusResponse?.data?.data?.status;

					// ❌ Withdrawal + Initial → UPDATE MAT KARO
					if (
						transaction?.transactionType === "Withdrawal" &&
						newStatus === "Initial"
					) {
						continue; // ⛔ yahin loop skip
					}

					// ✅ Sirf valid cases me update
					if (newStatus) {
						await apiHelper.patch(
							`/transaction/update_Transaction_Request_Data_of_Request/${transaction?._id}`,
							{ status: newStatus },
						);

						// ✅ Final actions
						if (newStatus === "Accept") {
							toast.success("Transaction completed successfully!");
							fetchUserBalance();
							setUpdatedTransactions(transaction?._id);
						} else if (newStatus === "Reject") {
							toast.error("Transaction Rejected");
							fetchUserBalance();
							setUpdatedTransactions(transaction?._id);
						} else if (newStatus === "Initial") {
						}
					}
				} catch (statusError) {
					console.log(
						"Status check error for transaction:",
						transaction?._id,
						statusError,
					);
				}
			}
		} catch (error) {
			console.log("Background status check error:", error);
		}
	};

	// useEffect(() => {
	//   setInterval(() => {
	//     checkPendingTransactions();
	//   }, 5000);
	// }, []);

	useEffect(() => {
		fetchUserBalance();
	}, [user, balanceLogData, userTransactions, showCreateTransaction]);

	useEffect(() => {
		if (user?._id) {
			checkPendingTransactions();
		}
	}, [user]);

	useEffect(() => {
		if (user?._id) {
			const interval = setInterval(() => {
				checkPendingTransactions();
			}, 5000); // Check every 5 seconds

			return () => clearInterval(interval);
		}
	}, [user]);

	// Socket event listeners
	useEffect(() => {
		if (!user?.clientName) return;

		const handleTransactionStatusUpdated = (data) => {
			if (data?.walletBalance !== undefined) {
				setUserBalance(data?.walletBalance);

				if (data && data?.transaction) {
					if (
						data?.transaction?.transactionType === "Deposit" &&
						data?.transaction?.status === "Accept"
					) {
						showNotification("Amount added to your wallet", "success");
						fetchUserBalance();
					} else if (
						data?.transaction?.transactionType === "Withdrawal" &&
						data?.transaction?.status === "Reject"
					) {
						showNotification("Amount refunded to your wallet", "success");
						fetchUserBalance();
					}
				}
			}
		};

		on("transactionStatusUpdated", handleTransactionStatusUpdated);

		return () => {
			off("transactionStatusUpdated", handleTransactionStatusUpdated);
		};
	}, [user]);

	const handleViewWallet = async (pageNum = 1, filters = walletFilters) => {
		// Ensure pageNum is a number
		const page = Number(pageNum) || 1;

		if (page === 1) {
			setShowWallet(true);
		}
		setTransactionsLoading(true);
		try {
			const userId = user?._id;
			if (!userId) {
				toast.error("User not found");
				setTransactionsLoading(false);
				return;
			}

			const payload = {
				page: page,
				limit: 10,
				...filters,
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

			const transactionsResponse = await apiHelper.post(
				`/transaction/getUserTransactions/${userId}`,
				payload,
			);
			const transactions = transactionsResponse?.data?.transactions || [];
			const pagination = transactionsResponse?.data?.pagination || {};

			setCurrentPage(Number(pagination.currentPage) || page);
			setTotalPages(Number(pagination.totalPages) || 1);
			setTotalTransactions(
				Number(pagination.totalTransactions) || transactions.length,
			);

			setUserTransactions(transactions);
		} catch (error) {
			console.error("Transaction fetch error:", error);
			toast.error("Failed to fetch transactions: " + error.message);
			setUserTransactions([]);
		} finally {
			setTransactionsLoading(false);
		}
	};

	const handleWalletFilterChange = (key, value) => {
		setWalletFilters((prev) => ({ ...prev, [key]: value }));
	};

	const applyWalletFilters = () => {
		setCurrentPage(1);
		handleViewWallet(1, walletFilters);
	};

	const clearWalletFilters = () => {
		const clearedFilters = {
			status: "",
			transactionType: "",
			minAmount: "",
			maxAmount: "",
		};
		setWalletFilters(clearedFilters);
		setCurrentPage(1);
		handleViewWallet(1, clearedFilters);
	};

	const handleCreateTransaction = async (e) => {
		e.preventDefault();

		// Validate payment method selection for Deposit transactions
		if (
			transactionForm?.transactionType === "Deposit" &&
			user?.teirId?.branches &&
			user.teirId.branches.length > 0 &&
			!selectedBranch
		) {
			toast.error("Please select a payment method");
			return;
		}

		setTransactionProcessing(true);

		try {
			const userId = user?._id;
			if (!userId) {
				toast.error("User not found");
				setTransactionProcessing(false);
				return;
			}

			// Check if ROCKY11 is selected for Deposit - use manual transaction API
			if (
				transactionForm?.transactionType === "Deposit" &&
				selectedBranch === "ROCKY11"
			) {
				const manualPayload = {
					userId: userId,
					amount: parseFloat(transactionForm?.amount),
					transactionType: "Deposit",
					role: "User",
					mode: "ROCKY11",
					utrNo: transactionForm?.utrNo || "",
					userScreenShot: transactionForm?.userScreenShot || "",
				};

				await apiHelper.post(
					"/transaction/create_Manual_Transaction_For_MainUser",
					manualPayload,
				);
				toast.success("Transaction request submitted successfully!");
				setShowCreateTransaction(false);
				setTransactionForm({
					amount: "",
					transactionType: "Deposit",
					utrNo: "",
					userScreenShot: "",
				});
				setSelectedBankId("");
				fetchUserBalance();
				return;
			}

			// Check if it's a withdrawal with ALLINONE branch selected
			if (transactionForm?.transactionType === 'Withdraw' && selectedBranch === 'ALLINONE') {
				const selectedBank = savedBanks[parseInt(selectedBankId)];
				if (!selectedBank) {
					toast.error('Please select a bank account for withdrawal');
					setTransactionProcessing(false);
					return;
				}

				const allinonePayload = {
					userId: userId,
					amount: parseFloat(transactionForm?.amount),
					transactionType: 'Withdrawal',
					upiId: selectedBank.upiId || '',
					bankName: selectedBank.bankName || '',
					accNo: selectedBank.accNo || '',
					branchUserName: 'ALLINONE',
					role: 'User',
					mode: 'ALLINONE',
					accHolderName: selectedBank.accHolderName || '',
					ifscCode: selectedBank.ifscCode || ''
				};

				await apiHelper.post('/transaction/createTransaction', allinonePayload);
				toast.success('Withdrawal request submitted successfully!');
				setShowCreateTransaction(false);
				setTransactionForm({ amount: '', transactionType: 'Deposit', utrNo: '', userScreenShot: '' });
				setSelectedBankId('');
				fetchUserBalance();
				return;
			}

			// Check if it's a withdrawal with ROCKY11 branch selected (peer transaction)
			if (
				transactionForm?.transactionType === "Withdraw" &&
				selectedBranch === "ROCKY11"
			) {
				const selectedBank = savedBanks[parseInt(selectedBankId)];
				if (!selectedBank) {
					toast.error("Please select a bank account for withdrawal");
					setTransactionProcessing(false);
					return;
				}

				const peerPayload = {
					userId: userId,
					// clientName: user?.clientName || '',
					amount: parseFloat(transactionForm?.amount),
					transactionType: "Withdrawal",
					upiId: selectedBank.upiId || "",
					bankName: selectedBank.bankName || "",
					accNo: selectedBank.accNo || "",
					branchUserName: "ROCKY11",
					role: "User",
					mode: "ROCKY11",
					accHolderName: selectedBank.accHolderName || "",
					ifscCode: selectedBank.ifscCode || "",
				};

				await apiHelper.post(
					"/transaction/create_Manual_Transaction_For_MainUser",
					peerPayload,
				);
				toast.success("Withdrawal request submitted successfully!");
				setShowCreateTransaction(false);
				setTransactionForm({
					amount: "",
					transactionType: "Deposit",
					utrNo: "",
					userScreenShot: "",
				});
				setSelectedBankId("");
				fetchUserBalance();
				return;
			}

			// For all other cases (non-ROCKY11 branches) - use createTransaction API
			const specialBranches = ['ALLINONE', 'LEOPAY'];
			let payload = {
				userId: userId,
				amount: parseFloat(transactionForm?.amount),
				transactionType:
					transactionForm?.transactionType === "Withdraw"
						? "Withdrawal"
						: transactionForm?.transactionType,
				role: "User",
				mode: specialBranches.includes(selectedBranch) ? selectedBranch : 'PowerPay',
				branchUserName: selectedBranch || 'RBIO1D',
			};

			// Add bank details for withdraw transactions
			if (transactionForm?.transactionType === "Withdraw") {
				const selectedBank = savedBanks[parseInt(selectedBankId)];
				if (selectedBank) {
					payload = {
						...payload,
						upiId: selectedBank.upiId,
						bankName: selectedBank.bankName,
						accNo: selectedBank.accNo,
						accHolderName: selectedBank.accHolderName,
						ifscCode: selectedBank.ifscCode,
					};
				}
			}

			const response = await apiHelper.post(
				"/transaction/createTransaction",
				payload,
			);

			if (response?.success && response?.data) {
				const transaction = response?.data;

				toast.success("Transaction created successfully!");
				setShowCreateTransaction(false);
				setTransactionForm({
					amount: "",
					transactionType: "Deposit",
					utrNo: "",
					userScreenShot: "",
				});
				setSelectedBankId("");
				fetchUserBalance();

				// Handle different transaction types
				if (transactionForm?.transactionType === 'Deposit') {
					// For all non-ROCKY11 branches - redirect to powerdreams
					toast.info('Processing payment... Please wait');
					if (transaction.mode == 'LEOPAY') {
						setTimeout(() => {
							window.location.href = `${transaction?.redirectUrl}`;
						}, 2000);
					} else {
						setTimeout(() => {
							window.location.href = `https://www.powerdreams.co/online/pay/${selectedBranch}/${transaction?._id}`;
						}, 2000);
					}
				} else if (transactionForm?.transactionType === 'Withdraw') {
					toast.info('Withdrawal request submitted successfully!');
				}

				return;
			}
		} catch (error) {
			console.error("Transaction error:", error);
			toast.error("Failed to create transaction: " + error.message);
		} finally {
			setTransactionProcessing(false);
		}
	};

	const handleDeleteSubAccount = (account) => {
		setAccountToDelete(account);
		setShowDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		setDeleteLoading(true);

		try {
			const subAccountId = accountToDelete?.id || accountToDelete?._id;

			// Create balance log
			await apiHelper.post("/balance/createBalanceLog", {
				userId: subAccountId,
			});

			// Keep checking until CurrentBalance is available
			const checkBalance = async () => {
				const response = await apiHelper.get(
					`/balance/getBalanceLogBySubUserId/${subAccountId}`,
				);
				const currentBalance = response?.data?.CurrentBalance;

				if (currentBalance === undefined) {
					setTimeout(checkBalance, 1000);
					return;
				}

				if (currentBalance >= 1) {
					toast.error(
						"Please withdraw the balance first before deleting the account",
					);
					setDeleteLoading(false);
					setShowDeleteConfirm(false);
					return;
				}

				// Delete account
				await apiHelper.delete(`/subAccount/deleteSubAccount/${subAccountId}`);
				toast.success(`${accountToDelete?.clientName} has been deleted...`);
				fetchSubAccounts();
				setDeleteLoading(false);
				setShowDeleteConfirm(false);
			};

			checkBalance();
		} catch (error) {
			toast.error("Failed to delete account: " + error.message);
			setDeleteLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	useEffect(() => {
		fetchGames();
		fetchSubAccounts();
		fetchUserBalance();
		apiHelper.get('/announcement/getAnnouncement')
			.then(res => setUserAnnouncement(res?.data?.userAnnouncement || res?.userAnnouncement || ''))
			.catch(() => { });
	}, []);
	useEffect(() => {
		if (sessionStorage.getItem('showAnnouncement') === 'true') {
			apiHelper.get('/announcement/getAnnouncement')
				.then(res => {
					const data = res?.data;
					const text = data?.userAnnouncement || '';
					const image = data?.bannerImage || '';
					const video = data?.bannerVideo || '';
					if (data?.isBanner && (text || image)) {
						setAnnouncement({ text, image, video: data?.isShowVideo ? video : '' });
					} else if (data?.isShowVideo && video) {
						setVideoAnnouncement({ video });
					}
				})
				.catch(() => { })
				.finally(() => {
					sessionStorage.removeItem('showAnnouncement');
				});
		}
	}, []);

	// Smart polling for sub accounts - only when there are pending statuses
	useEffect(() => {
		if (subAccounts.length === 0) return;

		const hasPendingAccounts = subAccounts.some(
			(account) => account.status === "Pending",
		);

		if (!hasPendingAccounts) {
			return; // Stop polling if no pending accounts
		}

		const interval = setInterval(() => {
			fetchSubAccounts();
		}, 5000); // Check every 3 seconds

		return () => clearInterval(interval);
	}, [subAccounts]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showUserDropdown && !event.target.closest(".relative")) {
				setShowUserDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showUserDropdown]);

	return (
		<div className="min-h-screen bg-[#0e0e0e] max-w-[769px] mx-auto">
			{/* Main Content */}
			<div className="max-w-[769px] mx-auto">
				{/* Modern Wallet Section */}
				<div
					className="relative w-full pt-10 pb-8 flex justify-center items-center"
					style={{
						background: "url(/bghero.svg)",
						backgroundSize: "400px",
					}}
				>
					<Link to="/profile" className=" absolute top-0 left-4">
						<div className="w-7 h-7 sm:w-9 p-4 sm:h-9 border-1 border-white mt-3 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer">
							<span className="text-white font-semibold text-md sm:text-md">
								{user?.clientName?.charAt(0)?.toUpperCase() || "U"}
							</span>
						</div>
					</Link>

					<div className="absolute top-0 right-0">
						<div className='flex items-center gap-2'>
							{/* <button onClick={() => navigate('/refer-earn')}
								className="p-[7px] mt-[12.5px] h-fit bg-gray-800 rounded-full border-1 border-white transition-colors">
								<GiftIcon className="w-5 h-5 text-white" />
							</button> */}
							<LanguageSelector />
						</div>
					</div>

					{/* CENTER WRAPPER */}
					<div className="relative flex items-center">
						{/* LEFT – DEPOSIT */}
						<div
							onClick={() => {
								setTransactionForm({
									...transactionForm,
									transactionType: "Deposit",
								});
								setShowCreateTransaction(true);
							}}
							className="w-[80px] h-[100px] mr-2 bg-[#1a1a1a] rounded-l-2xl
      flex flex-col items-center justify-center gap-2
      cursor-pointer shadow-2xl"
						>
							<span className="text-white text-xs">Deposit</span>
							<img src="/arrowup.svg" className="h-7 leading-none" />
						</div>

						{/* CENTER – MAIN WALLET */}
						<div
							className="w-[150px] h-[170px] bg-[#141414] rounded-3xl
      flex flex-col items-center justify-center
      mx-[-14px] z-10 shadow-2xl shadow-black"
						>
							<img src="/logoforlogin.png" alt="Logo" className="h-14 mb-4" />

							<p className="text-white/70 text-xs tracking-widest mb-1">
								WALLET BALANCE
							</p>

							<div className="flex items-center gap-2 text-white text-xl font-semibold">
								<img src="/coinsicon.png" className="w-5" alt="" />
								<span>{userBalance.toLocaleString()}</span>
							</div>
						</div>

						{/* RIGHT – WITHDRAW */}
						<div
							onClick={() => {
								setTransactionForm({
									...transactionForm,
									transactionType: "Withdraw",
								});
								setShowCreateTransaction(true);
								fetchBanks();
							}}
							className="w-[80px] h-[100px] ml-2 bg-[#1a1a1a] rounded-r-2xl
      flex flex-col items-center justify-center gap-2
      cursor-pointer shadow-2xl"
						>
							<span className="text-white text-xs">Withdraw</span>
							<img src="/arrowdown.svg" className="h-7 leading-none" />
						</div>
					</div>
				</div>

				{/* Marquee */}
				<div className="mt-2 mx-2 overflow-hidden rounded-xl bg-[#1a1a2e] border border-[#1477b0]/30 py-2 flex items-center gap-2 px-3">
					<span className="text-lg flex-shrink-0">📢</span>
					<div className="overflow-hidden flex-1">
						<marquee className="text-sm mt-1 font-medium text-white" onMouseOver={e => e.target.stop()} onMouseOut={e => e.target.start()}>
							{userAnnouncement || '	Welcome to Rockybook! Get ready for an epic gaming experience with our exclusive IDs and unbeatable bonuses. Dive in now and level up your play!'}
						</marquee>
					</div>
				</div>

				{/* Available Bonuses */}
				<AvailableBonuses
					userId={user?._id}
					subAccounts={subAccounts}
					onBalanceUpdate={fetchUserBalance}
				/>

				{/* Sub Accounts Slider */}
				<div className="m-1 rounded-2xl mt-2 mx-2 p-4 sm:p-6 bg-[#1b1b1b] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-xl font-semibold text-white">
								{t("myIds")} ({subAccounts.length})
							</h2>
							<p className="text-[12px] text-blue-200">{t("manageAccounts")}</p>
						</div>

						{subAccounts.length + games.filter(
							(game) =>
								!subAccounts.some(
									(account) =>
										account.gameId?._id === game._id ||
										account.gameId?.name === game.name,
								),
						).length > 1 && (
								<div className="flex flex-wrap justify-end gap-2">
									<Link to={"/my-ids"}>
										<button className="px-2 h-9 rounded-lg bg-[#005993] text-white text-[14px] sm:text-[16px] font-semibold">
											Get New Id
										</button>
									</Link>
									<div className="flex gap-1 sm:gap-2">
										<button
											onClick={() => {
												const step = window.innerWidth >= 640 ? 2 : 1;
												setCurrentSlide(Math.max(0, currentSlide - step));
											}}
											className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
										>
											<ChevronLeft className="mx-auto" />
										</button>
										<button
											onClick={() => {
												const step = window.innerWidth >= 640 ? 2 : 1;
												const totalCards =
													subAccounts.length +
													games.filter(
														(game) =>
															!subAccounts.some(
																(account) =>
																	account.gameId?._id === game._id ||
																	account.gameId?.name === game.name,
															),
													).length;
												const maxSlide =
													window.innerWidth >= 640
														? Math.max(0, totalCards - 2)
														: totalCards - 1;
												setCurrentSlide(Math.min(maxSlide, currentSlide + step));
											}}
											className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
										>
											<ChevronRight className="mx-auto" />
										</button>
									</div>
								</div>
							)}
					</div>
					<div className="relative overflow-hidden">
						<div
							className="flex transition-transform duration-300 ease-in-out"
							style={{
								transform: `translateX(-${currentSlide * (100 / (window.innerWidth >= 640 ? 2 : 1))}%)`,
							}}
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
						>
							{/* Existing Sub Accounts */}
							{subAccounts.map((account, index) => {
								const game = account.gameId?.name;
								const isRejected = account.status === "Reject";

								return (
									<div
										key={account.id || account._id || index}
										className="flex-shrink-0 px-2 sm:px-0.5"
										style={{ width: window.innerWidth >= 640 ? "50%" : "100%" }}
									>
										<div className="rounded-2xl p-5 bg-[#3f3f3f] text-white">
											{/* Header */}
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-12 h-12 overflow-hidden rounded-full bg-black flex items-center justify-center">
														<img
															src={account.gameId?.image}
															alt={account.gameId?.name}
															className="w-full m-auto h-auto rounded"
														/>
													</div>
													<div>
														<h3 className="font-bold text-sm sm:text-lg notranslate">
															{game || "Game"}
														</h3>
														{panels.some(p => p.panelName === game && p.isTrending) ? (
															<div className="flex items-center gap-1 mt-0.5">
																<span className="text-orange-400 text-xs">🔥</span>
																<span className="text-orange-300 text-[11px] font-semibold tracking-wide animate-pulse">TRENDING</span>
															</div>
														) : (
															<div className="h-[18px]" />
														)}
													</div>
												</div>

												<div className="flex gap-2">
													<span
														className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${account.status === "Accept"
															? "bg-green-100 text-green-800"
															: account.status === "Panding"
																? "bg-yellow-100 text-yellow-800"
																: account.status === "Reject"
																	? "bg-red-100 text-red-800"
																	: "bg-gray-100 text-gray-800"
															}`}
													>
														{account.status === "Accept"
															? t("active")
															: account.status === "Panding"
																? t("pending")
																: account.status === "Reject"
																	? t("reject")
																	: t("pending")}
													</span>

													{/* <button
                            onClick={() => handleDeleteSubAccount(account)}
                            className="p-1 -mr-0.5 text-red-600 bg-red-50 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button> */}
												</div>
											</div>

											{/* Account Details */}
											<div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
												{/* ID */}
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
														<span className="text-xs">👤</span>
													</div>
													<span className="text-xs sm:text-sm notranslate">
														ID:
													</span>

													<span
														className={`text-xs sm:text-sm font-mono truncate notranslate ${isRejected ? "blur-[2px] select-none" : ""
															}`}
													>
														{account?.clientName || "N/A"}
													</span>

													<button
														onClick={() => {
															if (isRejected) return;
															navigator.clipboard.writeText(
																account?.clientName || "",
															);
															toast.success("ID copied to clipboard!");
														}}
														disabled={isRejected}
														className={`ml-auto p-1 rounded ${isRejected
															? "opacity-40 cursor-not-allowed"
															: "hover:bg-gray-800"
															}`}
													>
														<Copy className="w-3 h-3" />
													</button>
												</div>

												{/* Password */}
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
														<span className="text-xs">🔒</span>
													</div>
													<span className="text-xs sm:text-sm notranslate">
														{t("password")}:
													</span>

													<span
														className={`text-xs sm:text-sm font-mono truncate flex-1 notranslate ${isRejected ? "blur-[2px] select-none" : ""
															}`}
													>
														{account?.password || "N/A"}
													</span>

													<button
														onClick={() => {
															if (isRejected) return;
															navigator.clipboard.writeText(
																account?.password || "",
															);
															toast.success("Password copied to clipboard!");
														}}
														disabled={isRejected}
														className={`p-1 rounded ${isRejected
															? "opacity-40 cursor-not-allowed"
															: "hover:bg-gray-800"
															}`}
													>
														<Copy className="w-3 h-3" />
													</button>
												</div>

												{/* Platform */}
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
														<span className="text-xs">🌐</span>
													</div>
													<span className="text-xs sm:text-sm notranslate">
														{t("platform")}:
													</span>

													<span
														className={`text-xs sm:text-sm font-mono truncate ${isRejected ? "blur-[2px] select-none" : ""
															}`}
													>
														{account?.gameId?.gameUrl || "N/A"}
													</span>

													<button
														onClick={() => {
															if (isRejected) return;
															if (account?.gameId?.gameUrl) {
																window.open(account.gameId.gameUrl, "_blank");
															} else {
																toast.error("Platform URL not available");
															}
														}}
														disabled={isRejected}
														className={`ml-auto p-1 rounded ${isRejected
															? "opacity-40 cursor-not-allowed"
															: "hover:bg-gray-800"
															}`}
													>
														<LinkIcon className="w-3 h-3" />
													</button>
												</div>
											</div>

											{/* Rejection Reason */}
											{account.status === "Reject" && account.remarks && (
												<div className="mb-4 p-3 bg-red-100 border border-red-700/50 rounded-lg">
													<div className="flex items-start gap-2">
														<div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
															<span className="text-xs text-white">!</span>
														</div>
														<div>
															<p className="text-xs font-medium text-red-700 mb-1">
																Rejection Reason:
															</p>
															<p className="text-xs text-red-700">
																{account.remarks}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Action Buttons */}
											{account.status !== "Reject" && (
												<div className="flex gap-2 sm:gap-3 flex-wrap">
													<button
														onClick={() => {
															setSelectedSubUser(account);
															setShowSubUserDeposit(true);
														}}
														disabled={account.status !== "Accept"}
														className={`flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors ${account.status === "Accept"
															? "bg-green-600 hover:bg-green-700 cursor-pointer"
															: "bg-gray-500 cursor-not-allowed opacity-50"
															}`}
													>
														<ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
														<span className="text-xs sm:text-sm font-medium">
															{t("deposit")}
														</span>
													</button>

													<button
														onClick={async () => {
															setSelectedSubUser(account);
															await createBalanceLog(
																account?.id || account?._id,
															);
															setShowSubUserWithdraw(true);
															fetchSubUserBalance(account?.id || account?._id);
														}}
														disabled={account.status !== "Accept"}
														className={`flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors ${account.status === "Accept"
															? "bg-red-600 hover:bg-red-700 cursor-pointer"
															: "bg-gray-500 cursor-not-allowed opacity-50"
															}`}
													>
														<ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
														<span className="text-xs sm:text-sm font-medium">
															{t("withdraw")}
														</span>
													</button>

													<button
														onClick={() => {
															setSelectedSubUser(account);
															setShowResetPassword(true);
														}}
														disabled={account.status !== "Accept"}
														className={`flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors ${account.status === "Accept"
															? "cursor-pointer"
															: "cursor-not-allowed opacity-50"
															}`}
														style={{
															backgroundColor:
																account.status === "Accept"
																	? "#1477b0"
																	: "#6b7280",
														}}
													>
														<span className="text-xs sm:text-sm font-medium">
															{t("resetPassword")}
														</span>
													</button>
												</div>
											)}
										</div>
									</div>
								);
							})}

							{/* Dummy Cards for Games Without IDs */}
							{games
								.filter(
									(game) =>
										!subAccounts.some(
											(account) =>
												account.gameId?._id === game._id ||
												account.gameId?.name === game.name,
										),
								)
								.map((game, index) => (
									<div
										key={game._id || index}
										className="flex-shrink-0 px-2 sm:px-0.5"
										style={{ width: window.innerWidth >= 640 ? "50%" : "100%" }}
									>
										<div className="rounded-2xl p-5 bg-gradient-to-br from-blue-50/10 to-purple-50/10 border-2 border-dashed border-blue-400/30 text-white h-full flex flex-col">
											{/* Header */}
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-12 h-12 overflow-hidden rounded-full bg-black flex items-center justify-center">
														<img
															src={game.image}
															alt={game.name}
															className="w-full m-auto h-auto rounded"
														/>
													</div>
													<div>
														<h3 className="font-bold text-sm sm:text-lg notranslate">
															{game.name}
														</h3>
														{panels.some(p => p.panelName === game.name && p.isTrending) ? (
															<div className="flex items-center gap-1 mt-0.5">
																<span className="text-orange-400 text-xs">🔥</span>
																<span className="text-orange-300 text-[11px] font-semibold tracking-wide animate-pulse">TRENDING</span>
															</div>
														) : (
															<div className="h-[18px]" />
														)}
													</div>
												</div>

												<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100/20 text-blue-300 border border-blue-400/30">
													Available
												</span>
											</div>

											{/* Account Details - Blank */}
											<div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
														<span className="text-xs">👤</span>
													</div>
													<span className="text-xs sm:text-sm notranslate">ID:</span>
													<span className="text-xs sm:text-sm font-mono text-gray-400">
														---
													</span>
												</div>

												<div className="flex items-center gap-2">
													<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
														<span className="text-xs">🔒</span>
													</div>
													<span className="text-xs sm:text-sm notranslate">
														{t("password")}:
													</span>
													<span className="text-xs sm:text-sm font-mono text-gray-400">
														---
													</span>
												</div>

												<div className="flex items-center gap-2">
													<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
														<span className="text-xs">🌐</span>
													</div>
													<span className="text-xs sm:text-sm notranslate">
														{t("platform")}:
													</span>
													<span className="text-xs sm:text-sm font-mono text-gray-400 truncate">
														{game.gameUrl || "---"}
													</span>
												</div>
											</div>

											{/* Action Buttons */}
											<div className="flex gap-2 sm:gap-3 flex-wrap">
												<button
													disabled
													className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-gray-500 cursor-not-allowed opacity-50"
												>
													<ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
													<span className="text-xs sm:text-sm font-medium">
														{t("deposit")}
													</span>
												</button>

												<button
													disabled
													className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-gray-500 cursor-not-allowed opacity-50"
												>
													<ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
													<span className="text-xs sm:text-sm font-medium">
														{t("withdraw")}
													</span>
												</button>

												<button
													onClick={() => {
														setFormData({
															...formData,
															gameId: game._id,
														});
														setShowCreateId(true);
													}}
													className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors cursor-pointer"
													style={{
														backgroundColor: "#1477b0",
													}}
												>
													<Plus className="w-3 h-3 sm:w-4 sm:h-4" />
													<span className="text-xs sm:text-sm font-medium">Create ID</span>
												</button>
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			</div>

			{/* Create ID Modal */}
			{showCreateId && (
				<CreateIdModal
					isOpen={showCreateId}
					onClose={() => { setShowCreateId(false); fetchGames(); }}
					formData={formData}
					onInputChange={handleInputChange}
					onSubmit={handleCreateId}
					isLoading={loading}
					isCreated={idCreated}
					games={games}
				/>
			)}

			{/* Wallet/Transaction History Modal */}
			{showWallet && (
				<WalletModal
					isOpen={showWallet}
					onClose={() => {
						setShowWallet(false);
						setWalletFilters({
							status: "",
							transactionType: "",
							minAmount: "",
							maxAmount: "",
						});
						fetchUserBalance();
					}}
					transactions={userTransactions}
					filters={walletFilters}
					onFilterChange={handleWalletFilterChange}
					onApplyFilters={applyWalletFilters}
					onClearFilters={clearWalletFilters}
					isLoading={transactionsLoading}
					currentPage={currentPage}
					onPageChange={handleViewWallet}
					onViewScreenshot={(id) => {
						// TODO: Implement screenshot fetch functionality
						console.log("View screenshot for:", id);
					}}
				/>
			)}

			{/* Create Transaction Modal */}
			{showCreateTransaction && (
				<CreateTransactionModal
					isOpen={showCreateTransaction}
					onClose={() => {
						setShowCreateTransaction(false);
						setSelectedBranch(""); // Reset branch selection
						fetchUserBalance();
					}}
					transactionForm={transactionForm}
					onFormChange={setTransactionForm}
					onSubmit={handleCreateTransaction}
					isProcessing={transactionProcessing}
					userBalance={userBalance}
					selectedBranch={selectedBranch}
					onBranchChange={setSelectedBranch}
					user={user}
					savedBanks={savedBanks}
					selectedBankId={selectedBankId}
					onBankIdChange={setSelectedBankId}
					banksLoading={banksLoading}
					onDeleteBank={handleDeleteBank}
					onAddBankClick={() => setShowAddBankModal(true)}
					fetchUserBalance={fetchUserBalance}
					fetchBanks={fetchBanks}
				/>
			)}

			{/* Add Bank Modal */}
			{showAddBankModal && (
				<AddBankModal
					isOpen={showAddBankModal}
					onClose={() => setShowAddBankModal(false)}
					bankForm={bankForm}
					onBankFormChange={setBankForm}
					onSubmit={handleSaveBank}
				/>
			)}

			{/* Sub User Withdraw Modal */}
			{showSubUserWithdraw && (
				<SubUserWithdrawModal
					isOpen={showSubUserWithdraw}
					onClose={() => {
						setShowSubUserWithdraw(false);
						fetchUserBalance();
					}}
					withdrawForm={subUserWithdrawForm}
					onFormChange={setSubUserWithdrawForm}
					onSubmit={handleSubUserWithdraw}
					isProcessing={transactionProcessing}
					subUserBalance={subUserBalance}
					isBalanceLoading={subUserBalanceLoading}
					selectedSubUserId={selectedSubUser?.clientName}
				/>
			)}

			{/* Sub User Deposit Modal */}

			{showSubUserDeposit && (
				<SubUserDepositModal
					isOpen={showSubUserDeposit}
					onClose={() => {
						setShowSubUserDeposit(false);
						fetchUserBalance();
					}}
					depositForm={subUserDepositForm}
					onFormChange={setSubUserDepositForm}
					onSubmit={handleSubUserDeposit}
					isProcessing={transactionProcessing}
					userBalance={userBalance}
					selectedSubUserId={selectedSubUser?.clientName}
				/>
			)}

			{/* Reset Password Modal */}
			{showResetPassword && (
				<ResetPasswordModal
					isOpen={showResetPassword}
					onClose={() => {
						setShowResetPassword(false);
						setResetPasswordForm({ newPassword: "" });
						setSelectedSubUser(null);
					}}
					passwordForm={resetPasswordForm}
					onPasswordFormChange={setResetPasswordForm}
					onSubmit={handleResetPassword}
					isLoading={resetPasswordLoading}
					selectedSubUserId={selectedSubUser?.clientName}
				/>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<DeleteConfirmModal
					isOpen={showDeleteConfirm}
					onClose={() => setShowDeleteConfirm(false)}
					onConfirm={confirmDelete}
					isLoading={deleteLoading}
					accountId={accountToDelete?.clientName}
				/>
			)}

			{/* Bottom padding to prevent content overlap */}
			{/* Announcement Popup */}
			{
				announcement && (
					<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
						<div className="bg-black rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative">
							<button
								onClick={() => {
									const video = announcement.video;
									setAnnouncement(null);
									if (video) setVideoAnnouncement({ video });
								}}
								className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
							{announcement.image && (
								<img src={announcement.image} alt="Announcement" className="w-full object-cover" />
							)}
							<div className="p-4">
								{announcement.text && (
									<p className="text-gray-700 text-sm whitespace-pre-wrap mb-4">{announcement.text}</p>
								)}
								<button
									onClick={() => {
										const video = announcement.video;
										setAnnouncement(null);
										if (video) setVideoAnnouncement({ video });
									}}
									className="w-full py-2 rounded-xl text-white font-semibold"
									style={{ background: 'linear-gradient(135deg, #1477b0 0%, #264e69 100%)' }}
								>
									OK
								</button>
							</div>
						</div>
					</div>
				)
			}

			{/* Video Announcement Popup */}
			{
				videoAnnouncement && (
					<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
						<div className="bg-black rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative">
							<button
								onClick={() => setVideoAnnouncement(null)}
								className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
							<video
								src={videoAnnouncement.video}
								controls
								autoPlay
								className="w-full"
								onError={(e) => { e.target.style.display = 'none'; }}
							/>
							<div className="p-4">
								<button
									onClick={() => setVideoAnnouncement(null)}
									className="w-full py-2 rounded-xl text-white font-semibold"
									style={{ background: 'linear-gradient(135deg, #1477b0 0%, #264e69 100%)' }}
								>
									OK
								</button>
							</div>
						</div>
					</div>
				)
			}


			{/* Bottom padding to prevent content overlap */}
			<BottomNavigation activePage="home" />

			{/* Custom Notification */}
			{notification && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
					<div
						className={`${notification.type === "success"
							? "bg-gradient-to-r from-green-500 to-green-600"
							: "bg-gradient-to-r from-blue-500 to-blue-600"
							} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] border border-white/20`}
					>
						<div className="bg-white/20 p-2 rounded-full">
							<CheckCircle className="w-5 h-5" />
						</div>
						<p className="flex-1 font-medium">{notification.message}</p>
						<button
							onClick={() => setNotification(null)}
							className="hover:bg-white/20 p-1 rounded transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserDashboard;
