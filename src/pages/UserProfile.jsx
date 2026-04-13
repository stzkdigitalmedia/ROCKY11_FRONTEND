import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
	User,
	Phone,
	MapPin,
	Building,
	CreditCard,
	Calendar,
	Shield,
	X,
	Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useToastContext } from "../App";
import { apiHelper } from "../utils/apiHelper";
import AddBankModal from "../components/modals/AddBankModal";
import CreateTransactionModal from "../components/modals/CreateTransactionModal";

const UserProfile = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const toast = useToastContext();
	const [showCreateTransaction, setShowCreateTransaction] = useState(false);
	const [transactionForm, setTransactionForm] = useState({
		amount: "",
		transactionType: "Deposit",
	});
	const [transactionProcessing, setTransactionProcessing] = useState(false);
	const [userBalance, setUserBalance] = useState(0);
	const [savedBanks, setSavedBanks] = useState([]);
	const [selectedBankId, setSelectedBankId] = useState("");
	const [banksLoading, setBanksLoading] = useState(false);
	const [showAddBankModal, setShowAddBankModal] = useState(false);
	const [selectedBranch, setSelectedBranch] = useState("");

	const [bankForm, setBankForm] = useState({
		accountHolderName: "",
		accountNumber: "",
		ifscCode: "",
		bankName: "",
		upiId: "",
	});

	const fetchUserBalance = async () => {
		try {
			if (!user?._id) return;
			const response = await apiHelper.get(
				`/transaction/get_MainUserBalance/${user._id}`,
			);
			if (response?.success) {
				setUserBalance(response?.data?.balance || 0);
			}
		} catch (error) {
			console.error("Error fetching balance:", error);
		}
	};

	const fetchSavedBanks = async () => {
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
			let payload = {
				userId: userId,
				amount: parseFloat(transactionForm?.amount),
				transactionType:
					transactionForm?.transactionType === "Withdraw"
						? "Withdrawal"
						: transactionForm?.transactionType,
				role: "User",
				mode: "PowerPay",
				branchUserName: selectedBranch || "RBIO1D",
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
				if (transactionForm?.transactionType === "Deposit") {
					// For all non-ROCKY11 branches - redirect to powerdreams
					toast.info("Processing payment... Please wait");
					setTimeout(() => {
						window.location.href = `https://www.powerdreams.co/online/pay/${selectedBranch}/${transaction?._id}`;
					}, 2000);
				} else if (transactionForm?.transactionType === "Withdraw") {
					toast.info("Withdrawal request submitted successfully!");
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
			fetchSavedBanks();
		} catch (error) {
			toast.error("Failed to add bank: " + error.message);
		}
	};

	const handleDeleteBank = async (bankId) => {
		try {
			const response = await apiHelper.delete(`/bank/deleteBank/${bankId}`);
			if (response?.success) {
				toast.success("Bank account deleted successfully");
				fetchSavedBanks();
			}
		} catch (error) {
			toast.error("Failed to delete bank account");
		}
	};

	useEffect(() => {
		if (user?._id) {
			fetchUserBalance();
		}
	}, [user]);

	useEffect(() => {
		if (
			showCreateTransaction &&
			transactionForm?.transactionType === "Withdraw"
		) {
			fetchSavedBanks();
		}
	}, [showCreateTransaction, transactionForm?.transactionType]);

	const handleLogout = () => {
		logout();
		navigate("/login", { replace: true });
	};

	// Show loading if user data is not available
	if (!user) {
		return (
			<div className="h-screen bg-[#0e0e0e] max-w-[769px] mx-auto flex items-center justify-center">
				<div className="text-center">
					<div
						className="loading-spinner mx-auto mb-4"
						style={{ width: "40px", height: "40px" }}
					></div>
					<p className="text-gray-600 text-lg">{t("loading")}...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0e0e0e] max-w-[769px] mx-auto">
			<div className="p-4 sm:p-6 lg:p-8 pt-5 lg:pt-6 bg-[#0e0e0e]  max-w-[769px] mx-auto">
				{/* Profile Header */}
				<div className="bg-[#1b1b1b] p-4 mb-1">
					<div className="flex justify-between items-centers align-middle">
						<div className="flex flex-row items-center gap-3">
							<div className="w-12 h-12 rounded-full flex items-center mx-auto justify-center text-white font-bold text-lg bg-gray-800">
								{user?.clientName?.charAt(0).toUpperCase() ||
									user?.fullName?.charAt(0).toUpperCase() ||
									"U"}
							</div>
							<div className="text-center sm:text-left">
								<h1 className="text-lg font-bold text-white">
									{user?.clientName || "username"}
								</h1>
								<div className="flex items-center justify-start gap-2">
									<span
										className={`px-2 rounded-full text-[12px] font-medium ${
											user?.isActive
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{user?.isActive ? t("active") : t("inactive")}
									</span>
								</div>
							</div>
						</div>
						<div className="flex items-center">
							<button
								className="bg-[#197fed] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hidden sm:block"
								onClick={handleLogout}
							>
								Logout
							</button>
						</div>
						<div className="sm:hidden block">
							<p className="text-[12px] text-gray-300">{t("balance")}</p>
							<p className="font-medium text-[18px] leading-none text-green-600">
								₹{user?.balance?.toLocaleString() || "0"}
							</p>
						</div>
					</div>
					<div className="p-2 mt-2">
						<div>
							{/* <p className="hidden text-[12px] text-gray-300">{t('balance')}</p>
              <p className="hidden font-medium text-[18px] leading-none text-green-600">₹{user?.balance?.toLocaleString() || '0'}</p> */}
							<div className="grid grid-cols-2 gap-4 mt-4">
								<button
									onClick={() => {
										setTransactionForm({
											amount: "",
											transactionType: "Deposit",
										});
										setShowCreateTransaction(true);
										fetchUserBalance();
									}}
									className="bg-green-600 px-4 py-1 rounded-lg text-white"
								>
									Deposit
								</button>
								<button
									onClick={() => {
										setTransactionForm({
											amount: "",
											transactionType: "Withdraw",
										});
										setShowCreateTransaction(true);
										fetchUserBalance();
									}}
									className="bg-red-600 px-4 py-1 rounded-lg text-white"
								>
									Withdraw
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Profile Details */}
				<div className="grid grid-cols-1 lg:grid-cols-2 mt-3 sm:mt-0 gap-1">
					{/* Personal Information */}
					<div className=" text-white px-2 py-0.5 sm:py-2">
						{/* <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-white" />
              {t('personalInformation')}
            </h2> */}
						<div className="space-y-2">
							<div className="flex items-center gap-3 p-1 px-2 bg-[#1b1b1b] rounded-lg">
								<User className="w-5 h-5 text-white" />
								<div>
									<p className="text-[12px] leading-none text-gray-300">
										{t("fullName")}
									</p>
									<p className="font-medium text-[16px]">
										{user?.fullName || t("notProvided")}
									</p>
								</div>
							</div>

							<div className="flex items-center bg-[#1b1b1b] gap-3 p-1 px-2 rounded-lg">
								<Phone className="w-5 h-5" />
								<div>
									<p className="text-[12px] leading-none text-gray-300">
										{t("phone")}
									</p>
									<p className="font-medium text-[16px] ">
										{user?.phone || t("notProvided")}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-1 px-2 bg-[#1b1b1b] rounded-lg">
								<MapPin className="w-5 h-5" />
								<div>
									<p className="text-[12px] leading-none text-gray-300">
										{t("city")}
									</p>
									<p className="font-medium text-[16px]">
										{user?.city || t("notProvided")}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Account Information */}
					<div className="text-white px-2 py-0.5 sm:py-2">
						{/* <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('accountInformation')}
            </h2> */}
						<div className="space-y-2">
							<div className="flex items-center gap-3 p-1 px-2 bg-[#1b1b1b] rounded-lg">
								<Building className="w-5 h-5" />
								<div>
									<p className="text-[12px] leading-none text-gray-300">
										{t("branch")}
									</p>
									<p className="font-medium text-[16px]">
										{user?.branchName || t("notAssigned")}
									</p>
								</div>
							</div>
							<div className="hidden sm:flex items-center gap-3 p-1 px-2 bg-[#1b1b1b] rounded-lg">
								<CreditCard className="w-5 h-5" />
								<div className="hidden sm:block">
									<p className="text-[12px] leading-none text-gray-300">
										{t("balance")}
									</p>
									<p className="font-medium text-[16px] text-green-600">
										₹{user?.balance?.toLocaleString() || "0"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-1 px-2 bg-[#1b1b1b] rounded-lg">
								<Calendar className="w-5 h-5" />
								<div>
									<p className="text-[12px] leading-none text-gray-300">
										{t("memberSince")}
									</p>
									<p className="font-medium text-[16px]">
										{user?.createdAt
											? new Date(user.createdAt).toLocaleDateString()
											: t("notAvailable")}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

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
					fetchBanks={fetchSavedBanks}
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

			{/* Mobile Logout Button - Fixed at bottom */}
			<div className="fixed bottom-14 left-0 right-0 p-2 bg-[#0e0e0e] sm:hidden z-10">
				<div className="max-w-[769px] mx-auto">
					<button
						onClick={handleLogout}
						className="w-full bg-[#197fed] text-white py-1.5 rounded-lg text-[16px] font-semibold transition-colors"
					>
						Logout
					</button>
				</div>
			</div>

			<BottomNavigation activePage="profile" />
		</div>
	);
};

export default UserProfile;
