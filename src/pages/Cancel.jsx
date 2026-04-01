import { useNavigate } from 'react-router-dom';

function Cancel() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                <p className="text-gray-500 text-sm mb-6">Your transaction was cancelled. No amount has been deducted. You can try again anytime.</p>
                <button
                    onClick={() => navigate('/user-dashboard')}
                    className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default Cancel;
