import { useState, useEffect } from "react";
import { Menu, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToastContext } from "../App";
import { apiHelper } from "../utils/apiHelper";
import { useTranslation } from "react-i18next";
import CreateTransactionModal from "./modals/CreateTransactionModal";

const Header = () => {
	const { user } = useAuth(true);
	const { t } = useTranslation();
	const [userAnnouncement, setUserAnnouncement] = useState('');
	const toast = useToastContext();
	const [showCreateTransaction, setShowCreateTransaction] = useState(false);
	const [transactionForm, setTransactionForm] = useState({
		amount: "",
		transactionType: "Deposit",
	});
	const [transactionProcessing, setTransactionProcessing] = useState(false);
	const [userBalance, setUserBalance] = useState(0);
	const [savedBanks, setSavedBanks] = useState([]);
	const [selectedBranch, setSelectedBranch] = useState("");

	const [selectedBankId, setSelectedBankId] = useState("");
	const [banksLoading, setBanksLoading] = useState(false);
	const [showAddBankModal, setShowAddBankModal] = useState(false);

	const fetchUserBalance = async () => {
		try {
			if (!user?._id) {
				return;
			}
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
			const response = await apiHelper.get("/user/getSavedBanks");
			if (response?.success) {
				setSavedBanks(response?.data || []);
			}
		} catch (error) {
			console.error("Error fetching banks:", error);
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
				branchUserName: selectedBranch,
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

	const handleDeleteBank = async (bankId) => {
		try {
			const response = await apiHelper.delete(`/user/deleteBank/${bankId}`);
			if (response?.success) {
				toast.success("Bank account deleted successfully");
				fetchSavedBanks();
			}
		} catch (error) {
			toast.error("Failed to delete bank account");
		}
	};

	useEffect(() => {
		apiHelper.get('/announcement/getAnnouncement')
			.then(res => setUserAnnouncement(res?.data?.userAnnouncement || res?.userAnnouncement || ''))
			.catch(() => { });
	}, []);

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

	return (
		<>
			<div className="max-w-[769px] mx-auto bg-[#0e0e0e]">
				<header className="max-w-[769px] mx-auto bg-[#3f3f3f] h-[56px] flex items-center px-3 shadow-md">
					{/* LEFT */}
					<div className="flex items-center gap-3">
						<Link to="/">
							<img
								src="/logoforlogin.png"
								alt="Logo"
								className="w-25 object-contain"
							/>
						</Link>
					</div>

					{/* RIGHT */}
					<div className="ml-auto flex items-center gap-2">
						<p className="text-[12px] text-white">
							{user?.balance.toLocaleString()} Bal
						</p>
						<button
							onClick={() => {
								setTransactionForm({ amount: "", transactionType: "Deposit" });
								setShowCreateTransaction(true);
								fetchUserBalance();
							}}
							className="bg-white text-black text-sm px-4 py-1.5 rounded-md transition"
						>
							Deposit
						</button>
					</div>
				</header>

				{/* Marquee */}
				<div className="mt-2 mx-[12px] sm:mx-5 overflow-hidden rounded-xl bg-[#1a1a2e] border border-[#1477b0]/30 py-0.5 flex items-center gap-2 px-3">
                    <span className="text-lg flex-shrink-0">📢</span>
                    <div className="overflow-hidden flex-1">
                        <marquee className="text-sm font-medium mt-1.5 text-white" onMouseOver={e => e.target.stop()} onMouseOut={e => e.target.start()}>
                            {userAnnouncement}
                        </marquee>
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
				// fetchBanks={fetchBanks}
				/>
			)}
		</>
	);
};

export default Header;
