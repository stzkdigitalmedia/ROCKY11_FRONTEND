import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { ArrowLeft, ExternalLink, Copy, X } from 'lucide-react';
import Header from '../components/Header';

const IDDetails = () => {
  const { subaccid } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();

  const [idDetails, setIdDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const fetchIDDetails = async () => {
    try {
      const response = await apiHelper.get(
        `/subAccount/getSubUserID_DetailById/${subaccid}`
      );
      setIdDetails(response?.data || response);
    } catch (error) {
      toast.error('Failed to fetch ID details');
    } finally {
      setLoading(false);
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
      await apiHelper.post('/balance/createBalanceLog', { userId: subAccountId });

      // Keep checking until CurrentBalance is available
      const checkBalance = async () => {
        const response = await apiHelper.get(`/balance/getBalanceLogBySubUserId/${subAccountId}`);
        const currentBalance = response?.data?.CurrentBalance;

        if (currentBalance === undefined) {
          setTimeout(checkBalance, 1000);
          return;
        }

        if (currentBalance >= 1) {
          toast.error('Please withdraw the balance first before deleting the account');
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
      toast.error('Failed to delete account: ' + error.message);
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (subaccid) fetchIDDetails();
  }, [subaccid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] p-4 max-w-[769px] mx-auto text-white">
        <div className="text-center py-20 text-gray-400">
          Loading ID details...
        </div>
      </div>
    );
  }

  if (!idDetails) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] p-4 max-w-[769px] mx-auto text-white">
        <div className="text-center py-20 text-gray-400">
          ID details not found
        </div>
      </div>
    );
  }

  return (<>
    <Header />
    <div className="min-h-screen bg-[#0e0e0e] p-4 max-w-[769px] mx-auto text-white">


      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-lg bg-[#1b1b1b]
          flex items-center justify-center hover:bg-[#2a2a2a]"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">ID Details</h1>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="rounded-xl bg-[#1b1b1b]
        shadow-[0_6px_30px_rgba(0,0,0,0.7)]
        overflow-hidden">

        {/* TOP SECTION */}
        <div className="p-5">
          <div className="flex justify-between items-start gap-4">

            {/* LEFT */}
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-lg bg-black flex items-center justify-center overflow-hidden">
                {idDetails.gameId?.image && (
                  <img
                    src={idDetails.gameId.image}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div>
                <h2 className="text-md font-semibold uppercase">
                  {idDetails.gameId?.name}
                </h2>
                <p className="text-sm text-[#0988dc] cursor-pointer"
                  onClick={() =>
                    window.open(idDetails.gameId?.gameUrl, '_blank')
                  }>
                    {idDetails.gameId?.gameUrl && idDetails.gameId?.gameUrl.length > 20
                            ? `${idDetails.gameId?.gameUrl.substring(0, 20)}...`
                            :idDetails.gameId?.gameUrl}
                  {/* {idDetails.gameId?.gameUrl} */}
                </p>
              </div>
            </div>

            {/* RIGHT ICONS */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() =>
                  window.open(idDetails.gameId?.gameUrl, '_blank')
                }
                className="hover:text-blue-400 cursor-pointer"
              >
                <ExternalLink size={20} />
              </button>
            </div>
          </div>

          {/* USERNAME */}
          <div className="flex justify-between items-center gap-3 mt-6">
            <div>
              <span className="text-gray-400 text-sm">Username:</span>
              <span className="text-sm">
                {idDetails.clientName}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(idDetails.clientName);
                toast.success('Username copied');
              }}
            >
              <Copy size={16} />
            </button>
          </div>

          {/* PASSWORD */}
          <div className="flex justify-between items-center gap-3 mt-3">
            <div>
              <span className="text-gray-400 text-sm">Password:</span>
              <span className="text-sm">
                {idDetails.password}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(idDetails.password);
                toast.success('Password copied');
              }}
            >
              <Copy size={16} />
            </button>
          </div>


        </div>

        {/* Delete Id */}
        {/* <div className='px-4 pb-4'>
          <button onClick={() => handleDeleteSubAccount(idDetails)} title="Delete Account" className='bg-red-600 hover:bg-red-600 px-2 py-1 w-full rounded-lg'>
            Delete My Id
          </button>
        </div> */}

        {/* FOOTER */}
        <div className="bg-[#2a2a2a] px-5 py-3 text-sm text-gray-300">
          ID Created on:{' '}
          {new Date(idDetails.createdAt).toLocaleString()}
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
          <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                <p className="text-gray-600 text-sm mt-1">ID: {accountToDelete?.clientName || 'N/A'}</p>
              </div>
              {!deleteLoading && (
                <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {deleteLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Deleting Account...</p>
                <p className="text-sm text-gray-600">Please wait while we process your request</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-700">Are you sure want to delete your ID?</p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full sm:flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default IDDetails;
