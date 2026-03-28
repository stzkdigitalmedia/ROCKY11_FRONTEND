import { useNavigate } from 'react-router-dom';

function Success() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 text-sm mb-6">Your transaction has been completed successfully. Amount will be credited to your wallet shortly.</p>
                <button
                    onClick={() => navigate('/user-dashboard')}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default Success;
