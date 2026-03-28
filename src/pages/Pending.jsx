import { useNavigate } from 'react-router-dom';

function Pending() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h1>
                <p className="text-gray-500 text-sm mb-6">Your transaction is being processed. This may take a few minutes. You will be notified once it's confirmed.</p>
                <button
                    onClick={() => navigate('/user-dashboard')}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default Pending;
