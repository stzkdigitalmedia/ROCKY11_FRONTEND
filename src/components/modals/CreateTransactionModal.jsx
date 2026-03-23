import {
	X,
	Trash2,
	Eye,
	Upload,
	CheckCircle2,
	Building2,
	CreditCard,
	User2,
	Hash,
	QrCode,
	Copy,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { apiHelper } from "../../utils/apiHelper";
import { useToastContext } from "../../App";

const CreateTransactionModal = ({
	isOpen,
	onClose,
	transactionForm,
	onFormChange,
	onSubmit,
	isProcessing,
	userBalance,
	selectedBranch,
	onBranchChange,
	user,
	savedBanks,
	selectedBankId,
	onBankIdChange,
	banksLoading,
	onDeleteBank,
	onAddBankClick,
	fetchUserBalance,
	fetchBanks,
}) => {
	const { t } = useTranslation();
	const toast = useToastContext();

	// Fetch banks when modal opens for withdraw
	useEffect(() => {
		if (
			isOpen &&
			transactionForm?.transactionType === "Withdraw" &&
			fetchBanks
		) {
			fetchBanks();
		}
	}, [isOpen, transactionForm?.transactionType]);

	console.log("--------CreateTransactionModal-----");

	// Local state for UTR upload popup (shown when Deposit + ROCKY11)
	const [showUTRModal, setShowUTRModal] = useState(false);
	const [utrNo, setUtrNo] = useState("");
	const [screenshotFile, setScreenshotFile] = useState(null);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [uploadError, setUploadError] = useState(null);
	const [bankDetails, setBankDetails] = useState(null);
	const [loadingBankDetails, setLoadingBankDetails] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState("");

	// Fetch bank details when UTR modal opens
	const fetchBankDetails = async () => {
		setLoadingBankDetails(true);
		try {
			const data = await apiHelper.get(
				"/bank/getActiveBankDetails/69b010749295ebb2368e2747",
			);
			setBankDetails(data?.data || data);
		} catch (err) {
			console.error("Failed to fetch bank details", err);
		} finally {
			setLoadingBankDetails(false);
		}
	};

	// Generate QR code for UPI
	const generateQRCode = async (upiId, amount) => {
		try {
			const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
			const qrUrl = await QRCode.toDataURL(upiUrl);
			setQrCodeUrl(qrUrl);
		} catch (err) {
			console.error("QR generation failed:", err);
		}
	};

	// Generate QR when bank details and amount are available
	useEffect(() => {
		if (bankDetails?.upiId && transactionForm.amount) {
			generateQRCode(bankDetails.upiId, transactionForm.amount);
		}
	}, [bankDetails, transactionForm.amount]);

	// Auto-select branch if no ROCKY11 and only one active branch
	useEffect(() => {
		if (isOpen && !selectedBranch && user?.teirId?.branches) {
			const activeBranches = user.teirId.branches.filter(
				(branch) => branch.isActive,
			);
			// If no isManual (no ROCKY11 option) and only one active branch, auto-select it
			if (!user.teirId.isManual && activeBranches.length === 1) {
				onBranchChange(activeBranches[0].branchName);
			}
		}
	}, [isOpen, user, selectedBranch, onBranchChange]);

	// Copy to clipboard function
	const copyToClipboard = (text) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast.success("Copied to clipboard!");
			})
			.catch(() => {
				toast.error("Failed to copy");
			});
	};

	// Submit UTR + screenshot to manual transaction endpoint
	const handleUTRSubmit = async (e) => {
		e.preventDefault();
		setUploadError(null);

		if (!transactionForm.amount) {
			setUploadError("Please enter amount");
			return;
		}
		if (!utrNo || utrNo.trim() === "") {
			setUploadError("Please enter UTR number");
			return;
		}
		if (!screenshotFile) {
			setUploadError("Please attach screenshot file");
			return;
		}

		const formData = new FormData();
		formData.append("userId", user?._id || user?.id || "");
		formData.append("amount", transactionForm.amount);
		formData.append("transactionType", "Deposit");
		formData.append("role", "User");
		formData.append("mode", "ROCKY11");
		formData.append("branchUserName", "ROCKY11");
		formData.append("utrNo", utrNo);
		formData.append("userScreenShot", screenshotFile);

		setUploadLoading(true);

		try {
			const json = await apiHelper.postFormData(
				"/transaction/create_Manual_Transaction_For_MainUser",
				formData,
			);
			toast.success(json.message || "Transaction created successfully");
			setShowUTRModal(false);
			setUtrNo("");
			setScreenshotFile(null);
			fetchUserBalance && fetchUserBalance();
			onClose && onClose();
		} catch (err) {
			console.error("UTR upload failed", err);
			setUploadError(err.message || "Upload failed");
		} finally {
			setUploadLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const f = e.target.files && e.target.files[0];
		if (f) setScreenshotFile(f);
	};

	// Don't render if modal is closed
	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
				<div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl">
					{/* Modal Header */}
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-xl font-semibold text-gray-900">
								{t("requestTransaction")}
							</h2>
							<p className="text-gray-600 text-sm mt-1">{t("submitRequest")}</p>
							{/* Available Balance Display */}
							<div className="mt-2">
								<div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl shadow-sm">
									<span className="text-gray-700 font-medium text-sm">
										Available Balance:
									</span>
									<span
										className="text-lg font-bold"
										style={{ color: "#1477b0" }}
									>
										₹{userBalance}
									</span>
								</div>
							</div>
						</div>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Transaction Form */}
					<form onSubmit={onSubmit} className="space-y-4">
						{/* Amount Field */}
						<div className="form-group">
							<label className="form-label">Amount (Minimum ₹500)</label>
							<input
								type="number"
								placeholder="Enter amount (min 500)"
								value={transactionForm.amount}
								onChange={(e) =>
									onFormChange({ ...transactionForm, amount: e.target.value })
								}
								onWheel={(e) => e.target.blur()}
								className="gaming-input"
								required
								min={500}
								max={10000000}
							/>
						</div>

						{/* Payment Method Selection - Shown if user has branches configured */}
						{user?.teirId?.isManual && user.teirId.branches.length > 0 ? (
							<div className="form-group">
								<label className="form-label">Select Payment Method</label>
								{/* ROCKY11 Option */}
								<div className="space-y-2 mb-2">
									<div
										className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedBranch === "ROCKY11"
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300"
											}`}
										onClick={() => onBranchChange("ROCKY11")}
									>
										<div className="flex items-center gap-3">
											<input
												type="radio"
												name="branchSelection"
												value="ROCKY11"
												checked={selectedBranch === "ROCKY11"}
												onChange={() => onBranchChange("ROCKY11")}
												className="text-blue-600 focus:ring-blue-500"
											/>
											<span className="font-medium text-gray-900">
												ROCKYIO(MANUALLY)
											</span>
										</div>
									</div>
								</div>
								{/* Active Branches */}
								<div className="space-y-2">
									{user.teirId.branches
										.filter(branch => branch.isActive && !(branch.branchName === 'ALLINONE' && transactionForm?.transactionType === 'Deposit'))
										.map((branch, index) => (
											<div
												key={index}
												className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedBranch === branch.branchName
													? "border-blue-500 bg-blue-50"
													: "border-gray-200 hover:border-gray-300"
													}`}
												onClick={() => onBranchChange(branch.branchName)}
											>
												<div className="flex items-center gap-3">
													<input
														type="radio"
														name="branchSelection"
														value={branch.branchName}
														checked={selectedBranch === branch.branchName}
														onChange={() => onBranchChange(branch.branchName)}
														className="text-blue-600 focus:ring-blue-500"
													/>
													<span className="font-medium text-gray-900">{branch.branchName === 'ALLINONE' ? 'INSTANT PAYOUT (₹500-₹5000)' : branch.branchName}</span>
												</div>
											</div>
										))}
								</div>
							</div>
						) : (
							// Alternative payment method display
							user?.teirId?.branches &&
							user.teirId.branches.length > 0 && (
								<div className="form-group">
									<label className="form-label">Select Payment Method</label>
									<div className="space-y-2">
										{user.teirId.branches
											.filter(branch => branch.isActive && !(branch.branchName === 'ALLINONE' && transactionForm?.transactionType === 'Deposit'))
											.map((branch, index) => (
												<div
													key={index}
													className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedBranch === branch.branchName
														? "border-blue-500 bg-blue-50"
														: "border-gray-200 hover:border-gray-300"
														}`}
													onClick={() => onBranchChange(branch.branchName)}
												>
													<div className="flex items-center gap-3">
														<input
															type="radio"
															name="branchSelection"
															value={branch.branchName}
															checked={selectedBranch === branch.branchName}
															onChange={() => onBranchChange(branch.branchName)}
															className="text-blue-600 focus:ring-blue-500"
														/>
														<span className="font-medium text-gray-900">{branch.branchName === 'ALLINONE' ? 'INSTANT PAYOUT (₹500-₹5000)' : branch.branchName}</span>
													</div>
												</div>
											))}
									</div>
								</div>
							)
						)}

						{/* Bank Selection - Shown only for Withdrawal transactions */}
						{transactionForm?.transactionType === "Withdraw" && (
							<>
								{banksLoading ? (
									<div className="text-center py-4">
										<div
											className="loading-spinner mx-auto mb-2"
											style={{ width: "20px", height: "20px" }}
										></div>
										<p className="text-gray-600 text-sm">Loading banks...</p>
									</div>
								) : savedBanks.length > 0 ? (
									<div className="form-group">
										<label className="form-label">
											{t("selectBankAccount")}
										</label>
										<div className="space-y-3">
											{savedBanks.map((bank, index) => (
												<div
													key={bank.id || bank._id || index}
													className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedBankId === index.toString()
														? "border-green-500 bg-green-50"
														: "border-gray-200 hover:border-gray-300"
														}`}
													onClick={() => onBankIdChange(index.toString())}
												>
													<div className="flex items-center gap-3">
														<input
															type="radio"
															name="bankSelection"
															value={index}
															checked={selectedBankId === index.toString()}
															onChange={() => onBankIdChange(index.toString())}
															className="text-green-600 focus:ring-green-500"
														/>
														<div className="flex-1">
															<div className="font-medium text-gray-900">
																{bank.bankName || "Unknown Bank"}
															</div>
															<div className="text-sm text-gray-600">
																Holder Name:{" "}
																{bank.accHolderName || "Unknown Holder"}
															</div>
															<div className="text-sm text-gray-500">
																A/C: {bank.accNo || "N/A"}
															</div>
															<div className="text-sm text-gray-500">
																IFSC: {bank.ifscCode || "N/A"}
															</div>
															{bank.upiId && (
																<div className="text-sm text-gray-500">
																	UPI: {bank.upiId}
																</div>
															)}
														</div>
														{/* Delete Bank Button */}
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																onDeleteBank(bank.id || bank._id);
															}}
															className="text-red-500 hover:text-red-700 p-1"
															title="Delete Bank Account"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="text-center py-4 text-gray-500">
										<p className="text-sm">
											No bank accounts found. Add your first bank account.
										</p>
									</div>
								)}

								{/* Add Bank Button */}
								<button
									type="button"
									onClick={onAddBankClick}
									className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									{t("addBank")}
								</button>
							</>
						)}

						{/* Form Actions */}
						<div className="flex flex-col sm:flex-row gap-3 pt-4">
							{selectedBranch === "ROCKY11" &&
								transactionForm?.transactionType === "Deposit" ? (
								// Special Next button for ROCKY11 deposit
								<button
									type="button"
									onClick={() => {
										if (!transactionForm.amount) {
											toast.error("Please enter amount");
											return;
										}
										fetchBankDetails();
										setShowUTRModal(true);
									}}
									className="w-full sm:flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
								>
									Next
								</button>
							) : (
								// Standard submit button
								<button
									type="submit"
									disabled={isProcessing}
									className="w-full sm:flex-1 gaming-btn"
									onClick={(e) => {
										if (transactionForm?.transactionType === "Withdraw" && !selectedBankId) {
											e.preventDefault();
											toast.error("Please select your bank account");
											return;
										}
										if (selectedBranch === 'ALLINONE') {
											const amt = Number(transactionForm.amount);
											if (!amt || amt < 500 || amt > 5000) {
												e.preventDefault();
												toast.error('INSTANT PAYOUT sirf ₹500 - ₹5000 ke liye available hai. Kripya dusra payment method select karein.');
												return;
											}
										}

									}}
								>
									{isProcessing ? (
										<>{t("processing")}</>
									) : (
										<>{t("requestTransactionBtn")}</>
									)}
								</button>
							)}
							<button
								type="button"
								onClick={onClose}
								className="w-full sm:flex-1 btn-secondary"
							>
								{t("cancel")}
							</button>
						</div>
					</form>
				</div>
			</div>

			{showUTRModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[110]">
					<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-gray-900">
								Complete Payment
							</h3>
							<button
								onClick={() => setShowUTRModal(false)}
								className="text-gray-400 hover:text-gray-600 p-1"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Amount Display */}
						<div className="mb-4 p-2 bg-blue-50 rounded-lg border">
							<div className="flex justify-between items-center">
								<span className="text-gray-700 font-medium text-sm">
									Amount to Pay
								</span>
								<span className="text-lg font-bold text-blue-600">
									₹{transactionForm.amount}
								</span>
							</div>
						</div>

						{/* Bank Details */}
						{loadingBankDetails ? (
							<div className="mb-4 p-3 bg-gray-50 rounded-lg">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
									<p className="text-gray-600">Loading bank details...</p>
								</div>
							</div>
						) : bankDetails ? (
							<div className="mb-4">
								{/* QR Code Section */}
								{bankDetails.upiId && qrCodeUrl && (
									<div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
										<div className="text-center">
											<div className="flex items-center justify-center gap-2 mb-2">
												<QrCode className="w-4 h-4 text-green-600" />
												<h4 className="font-medium text-gray-900">
													Scan QR to Pay
												</h4>
											</div>
											<div className="bg-white p-2 rounded-lg inline-block">
												<img
													src={qrCodeUrl}
													alt="UPI QR Code"
													className="w-24 h-24"
												/>
											</div>
											<p className="text-xs text-gray-600 mt-1">
												Scan with any UPI app
											</p>
											<p className="text-xs text-gray-500 font-mono">
												{bankDetails.upiId}
											</p>
										</div>
									</div>
								)}

								{/* Bank Details */}
								<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
									<div className="p-2 border-b border-blue-200">
										<h4 className="font-semibold text-gray-900 flex items-center gap-2">
											<div className="p-1 bg-blue-100 rounded-lg">
												<Building2 className="w-4 h-4 text-blue-600" />
											</div>
											Bank Details
										</h4>
									</div>
									<div className="p-2 space-y-1">
										<div className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg">
											<span className="text-gray-600 font-medium text-xs">
												Bank Name
											</span>
											<div className="flex items-center gap-1">
												<span className="font-semibold text-gray-900 text-xs">
													{bankDetails.bankName || "N/A"}
												</span>
												<button
													onClick={() => copyToClipboard(bankDetails.bankName)}
													className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										<div className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg">
											<span className="text-gray-600 font-medium text-xs">
												Account Number
											</span>
											<div className="flex items-center gap-1">
												<span className="font-mono font-semibold text-gray-900 text-xs">
													{bankDetails.accNo || "N/A"}
												</span>
												<button
													onClick={() => copyToClipboard(bankDetails.accNo)}
													className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										<div className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg">
											<span className="text-gray-600 font-medium text-xs">
												Account Holder
											</span>
											<div className="flex items-center gap-1">
												<span className="font-semibold text-gray-900 text-xs">
													{bankDetails.accHolderName || "N/A"}
												</span>
												<button
													onClick={() =>
														copyToClipboard(bankDetails.accHolderName)
													}
													className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										<div className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg">
											<span className="text-gray-600 font-medium text-xs">
												IFSC Code
											</span>
											<div className="flex items-center gap-1">
												<span className="font-mono font-semibold text-gray-900 text-xs">
													{bankDetails.ifscCode || "N/A"}
												</span>
												<button
													onClick={() => copyToClipboard(bankDetails.ifscCode)}
													className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										{bankDetails.upiId && (
											<div className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg">
												<span className="text-gray-600 font-medium text-xs">
													UPI ID
												</span>
												<div className="flex items-center gap-1">
													<span className="font-mono font-semibold text-gray-900 text-xs">
														{bankDetails.upiId}
													</span>
													<button
														onClick={() => copyToClipboard(bankDetails.upiId)}
														className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
													>
														<Copy className="w-3 h-3" />
													</button>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						) : null}

						{/* Form */}
						<form onSubmit={handleUTRSubmit} className="space-y-3">
							{/* UTR Input */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									UTR / Transaction ID
								</label>
								<input
									type="text"
									value={utrNo}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, ""); // only numbers allow
										if (value.length <= 12) {
											setUtrNo(value);
										}
									}}
									placeholder="Enter 12-digit UTR number"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									maxLength={12}
									required
								/>
							</div>

							{/* File Upload */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Payment Screenshot
								</label>
								<div className="relative">
									<input
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="hidden"
										id="screenshot-upload"
										required
									/>
									<label
										htmlFor="screenshot-upload"
										className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
									>
										{screenshotFile ? (
											<div className="text-center">
												<CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
												<span className="text-xs text-gray-700">
													{screenshotFile.name}
												</span>
											</div>
										) : (
											<div className="text-center">
												<Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
												<span className="text-xs text-gray-600">
													Click to upload screenshot
												</span>
											</div>
										)}
									</label>
								</div>
							</div>

							{/* Error Message */}
							{uploadError && (
								<div className="p-2 bg-red-50 border border-red-200 rounded-lg">
									<p className="text-xs text-red-600">{uploadError}</p>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex gap-3 pt-3">
								<button
									type="submit"
									disabled={uploadLoading}
									className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
								>
									{uploadLoading ? "Uploading..." : "Submit Payment"}
								</button>
								<button
									type="button"
									onClick={() => setShowUTRModal(false)}
									className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium text-sm"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default CreateTransactionModal;
