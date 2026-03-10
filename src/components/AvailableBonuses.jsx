import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';

const AvailableBonuses = ({ userId, subAccounts = [], onBalanceUpdate }) => {
  const { bonousBanar } = useAuth();
  const [bonuses, setBonuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [verifyResponse, setVerifyResponse] = useState(null);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [apiFetched, setApiFetched] = useState(false);
  const toast = useToastContext();

  useEffect(() => {
    if (userId) {
      fetchBonuses();
    }
  }, [userId]);

  const fetchBonuses = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get(`/bonus/get_Available_Bonuses_ForUser/user/${userId}`);
      if (response?.availableBonuses && response.availableBonuses.length > 0) {
        setBonuses(response.availableBonuses);
      } else {
        setBonuses([]);
      }
    } catch (error) {
      console.error('Failed to fetch bonuses:', error);
      setBonuses([]);
    } finally {
      setLoading(false);
      setApiFetched(true);
    }
  };

  const fetchSubUserBalance = async (subAccountId) => {
    try {
      const response = await apiHelper.get(`/balance/getBalanceLogBySubUserId/${subAccountId}`);
      const logData = response?.data || response || [];
      const latestLog = Array.isArray(logData) ? logData[0] : logData;

      if (latestLog?.status === 'Accept') {
        return latestLog?.CurrentBalance || 0;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchSubUserBalance(subAccountId);
      }
    } catch (error) {
      console.error('Failed to fetch sub-user balance:', error);
      return 0;
    }
  };

  const handleClaimBonusAmount = async () => {
    setClaimingBonus(true);
    try {
      const assignmentId = selectedBonus?.assignmentId || verifyResponse?.data?._id;
      const res = await apiHelper.post('/bonus/claim_Bonus_ByUser', {
        assignmentId: assignmentId,
        user_bonous_status: ''
      });
      toast.success(res?.data?.message || 'Bonus claimed successfully!');
      setSelectedBonus(null);
      setVerifyResponse(null);
      setTotalBalance(0);
      fetchBonuses();
      if (onBalanceUpdate) onBalanceUpdate();
    } catch (error) {
      toast.error(error?.message || 'Failed to claim bonus');
    } finally {
      setClaimingBonus(false);
    }
  };

  const handleClaimBonus = async () => {
    setClaiming(true);
    setBalanceLoading(true);
    try {
      await Promise.all(
        subAccounts.map(account =>
          apiHelper.post('/balance/createBalanceLog', { userId: account.id || account._id })
        )
      );

      const balances = await Promise.all(
        subAccounts.map(account => fetchSubUserBalance(account.id || account._id))
      );

      const total = balances?.reduce((sum, balance) => sum + Number(balance || 0), 0);
      setTotalBalance(total);

      const verifyRes = await apiHelper.post('/bonus/verify_and_Assign_LossBack_Bonus', {
        userId: userId,
        current_game_balance: String(total)
      });

      setVerifyResponse(verifyRes);

    } catch (error) {
      toast.error(error?.message || 'Failed to fetch balances');
    } finally {
      setBalanceLoading(false);
      setClaiming(false);
    }
  };


  if (!apiFetched) {
    return null;
  }

  const displayBonuses = bonuses?.length > 0 ? bonuses : (bonousBanar?.isEligible_for_Bonus ? [bonousBanar?.bonous] : []);

  if (displayBonuses.length === 0 || !displayBonuses[0]?.bonusImage) {
    return null;
  }

  return (
    <>
      <div className="mb-3 overflow-x-auto">
        <div className="flex gap-3 px-4">
          <img
            key={displayBonuses[0].assignmentId}
            src={displayBonuses[0].bonusImage}
            alt={displayBonuses[0].bonusName || 'Bonus'}
            // onClick={() => setSelectedBonus(displayBonuses[0])}
            className="w-full h-auto rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
      </div>

      {selectedBonus && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Bonus Details</h3>
              <button onClick={() => { setSelectedBonus(null); setTotalBalance(0); setBalanceLoading(false); setClaiming(false); setVerifyResponse(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={selectedBonus?.bonusImage} alt="Bonus" className="w-full rounded-lg mb-4" />
            <p className="mb-4">
              Expire At:{" "}
              {selectedBonus?.expiryDate
                ? new Date(selectedBonus.expiryDate).toLocaleString("en-IN")
                : selectedBonus?.endDate
                  ? new Date(selectedBonus.endDate).toLocaleString("en-IN")
                  : "N/A"}
            </p>
            {balanceLoading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto mb-2" style={{ width: '24px', height: '24px' }}></div>
                <p className="text-gray-600 text-sm">Calculating total bonus...</p>
              </div>
            ) : verifyResponse ? (
              <div className="text-center py-4">
                <p className="text-green-600 text-lg font-semibold mb-2">{verifyResponse?.message || 'Bonus verified successfully'}</p>
                {verifyResponse?.data?.bonusAmount && (
                  <p className="text-gray-900 text-2xl font-bold mb-4">₹{Number(verifyResponse.data.bonusAmount).toFixed(2)}</p>
                )}
                {verifyResponse?.data?.isEligible && (
                  <>
                    <p className="text-orange-600 text-sm mb-4">Don't close this popup without claiming bonus</p>
                    <button
                      onClick={handleClaimBonusAmount}
                      disabled={claimingBonus}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all"
                    >
                      {claimingBonus ? 'Claiming...' : 'Claim Your Bonus'}
                    </button>
                  </>
                )}
              </div>
            ) : selectedBonus?.assignmentId ? (
              <div className="text-center py-4">
                <button
                  onClick={handleClaimBonusAmount}
                  disabled={claimingBonus}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all"
                >
                  {claimingBonus ? 'Claiming...' : 'Claim Your Bonus'}
                </button>
              </div>
            ) : totalBalance > 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-700 text-lg font-semibold">Total Balance: ₹{Number(totalBalance).toFixed(2)}</p>
              </div>
            ) : (
              <button
                onClick={handleClaimBonus}
                disabled={claiming}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
              >
                {claiming ? 'Loading...' : 'Calculate your bonus'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableBonuses;
