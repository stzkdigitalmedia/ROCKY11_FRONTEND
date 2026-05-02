import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Copy, Share2, ChevronLeft, Users, TrendingUp, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../App';
import { apiHelper } from '../utils/apiHelper';
import BottomNavigation from '../components/BottomNavigation';

const ReferEarn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [referredUsers, setReferredUsers] = useState([]);
  const [referredPage, setReferredPage] = useState(1);
  const [referredTotalPages, setReferredTotalPages] = useState(1);
  const [referredLoading, setReferredLoading] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchReferralLink = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/user/my-referral-link');
      setReferralData(response?.data || response);
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch referral link');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferredUsers = async (page = 1) => {
    if (!user?._id) return;
    setReferredLoading(true);
    try {
      const response = await apiHelper.get(`/referralEarning/referred-users/${user._id}?page=${page}&limit=10`);
      setReferredUsers(response?.data?.referredUsers || []);
      setReferredTotalPages(response?.data?.pagination?.totalPages || 1);
      setReferredPage(page);
      if (page === 1) setTotalEarnings(response?.data?.totalEarnings || 0);
      if (page === 1) setTotalRecords(response?.data?.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch referred users');
    } finally {
      setReferredLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralLink();
    fetchReferredUsers(1);
  }, [user?._id]);

  const referralLink = referralData?.referralLink || null;
  const referralCriteria = referralData?.referralCriteria?.days || [];

  return (
    <div className="min-h-screen max-w-[769px] mx-auto pb-24 bg-[#0e0e0e]">

      {/* Header */}
      <div className="px-4 pt-5 pb-6 relative" style={{ background: 'url(/bghero.svg)', backgroundSize: '400px' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-white p-1">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Refer & Earn</h1>
            <p className="text-blue-200 text-xs">Invite friends and earn bonus</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-[#1b1b1b] border border-white/10">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(20,119,176,0.3)' }}>
              <Users className="w-4 h-4 text-[#1477b0]" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-medium">Referred Users</p>
              <p className="text-white text-base font-bold">{totalRecords}</p>
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-[#1b1b1b] border border-white/10">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(20,119,176,0.3)' }}>
              <TrendingUp className="w-4 h-4 text-[#1477b0]" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-medium">Total Earnings</p>
              <p className="text-white text-base font-bold">₹{totalEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '36px', height: '36px' }}></div>
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : referralData ? (
          <>
            {/* Referral Link Box */}
            <div className="rounded-2xl overflow-hidden bg-[#1b1b1b] border border-white/10">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <Share2 className="w-4 h-4 text-[#1477b0]" />
                <p className="text-white font-semibold text-sm">Your Referral Link</p>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-[#2a2a2a] border border-white/10">
                  <p className="text-xs text-gray-300 break-all flex-1 font-medium">{referralLink || 'No link available'}</p>
                  {referralLink && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied!'); }}
                      className="flex-shrink-0 text-white p-2 rounded-xl transition-colors"
                      style={{ background: 'linear-gradient(135deg, #1477b0, #264e69)' }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl bg-[#1b1b1b] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-[#1477b0]" />
                <p className="text-sm font-bold text-white uppercase tracking-wide">How it works</p>
              </div>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Share your referral link with friends' },
                  { step: '2', text: 'Friend registers & makes a deposit' },
                  { step: '3', text: 'You earn bonus based on criteria below' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1477b0, #264e69)' }}>{step}</span>
                    <p className="text-sm text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Criteria Table */}
            {referralCriteria.length > 0 && (
              <div className="rounded-2xl overflow-hidden bg-[#1b1b1b] border border-white/10">
                <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
                  <span className="text-base">🏆</span>
                  <p className="text-white font-bold text-sm">Earning Criteria</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">Day</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">Max Bonus</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">You Earn</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralCriteria.map((day, i) => (
                      <tr key={i} className="border-t border-white/5" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td className="px-4 py-3 font-semibold text-[#1477b0]">Day {day.dayNumber}</td>
                        <td className="px-4 py-3 font-bold text-green-400">₹{day.maxAmount}</td>
                        <td className="px-4 py-3 font-bold text-orange-400">{day.percentage}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${day.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                            {day.isActive ? '✓ Active' : '✗ Off'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Referred Users */}
            <div className="rounded-2xl overflow-hidden bg-[#1b1b1b] border border-white/10">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <Users className="w-4 h-4 text-[#1477b0]" />
                <p className="text-white font-bold text-sm">Referred Users</p>
              </div>
              {referredLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto" style={{ width: '24px', height: '24px' }}></div>
                </div>
              ) : referredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-500 text-sm">No referred users yet</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">#</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">Name</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-[#1477b0]">Joined</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-[#1477b0]">Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referredUsers.map((u, i) => (
                        <tr key={u._id || i} className="border-t border-white/5" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td className="px-4 py-3 text-gray-500 font-medium">{(referredPage - 1) * 10 + i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1477b0, #264e69)' }}>
                                {(u.clientName || u.fullName || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-200">{u.clientName || u.fullName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-400">₹{u.totalEarningsToReferrer || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {referredTotalPages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-white/10">
                      <button
                        onClick={() => fetchReferredUsers(referredPage - 1)}
                        disabled={referredPage === 1}
                        className="px-4 py-1.5 text-xs rounded-lg border border-white/20 text-gray-300 disabled:opacity-40"
                      >Prev</button>
                      <span className="text-xs text-gray-500">Page {referredPage} of {referredTotalPages}</span>
                      <button
                        onClick={() => fetchReferredUsers(referredPage + 1)}
                        disabled={referredPage === referredTotalPages}
                        className="px-4 py-1.5 text-xs text-white rounded-lg disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #1477b0, #264e69)' }}
                      >Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No referral data available</p>
          </div>
        )}
      </div>

      <BottomNavigation activePage="refer" />
    </div>
  );
};

export default ReferEarn;
