import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(5000);

    // Check if user is logged in and has a valid token
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!token || !userData.email) {
            navigate('/login');
            return;
        }

        // Check if token is expired
        if (userData.tokenExpiry && new Date(userData.tokenExpiry) < new Date()) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            navigate('/login');
            return;
        }

        // Check if payment is already completed
        if (userData.paymentCompleted) {
            // Redirect based on user role
            if (userData.role === 'mentor') {
                navigate('/mentor-dashboard');
            } else if (userData.role === 'mentee') {
                navigate('/mentee-dashboard');
            } else {
                navigate('/dashboard');
            }
            return;
        }
    }, [navigate]);

    // Handle error parameters from verification
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const error = searchParams.get('error');
        const reference = searchParams.get('reference');
        
        if (error) {
            switch (error) {
                case 'verification_failed':
                    setError('Payment verification failed. Please try again.');
                    break;
                case 'no_reference':
                    setError('No payment reference found. Please try again.');
                    break;
                case 'unauthorized':
                    setError('Your session has expired. Please login again.');
                    navigate('/login');
                    break;
                default:
                    setError('An error occurred during payment. Please try again.');
            }
        }

        // If we have a reference, verify the payment
        if (reference) {
            verifyPayment(reference);
        }
    }, [location, navigate]);

    // Handle payment verification
    const verifyPayment = async (reference) => {
        try {
            setLoading(true);
            setError('');
            setPaymentStatus('verifying');

            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reference })
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                navigate('/login');
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify payment');
            }

            if (data.paymentCompleted) {
                setPaymentStatus('success');
                // Update user data in localStorage
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                userData.paymentCompleted = true;
                localStorage.setItem('userData', JSON.stringify(userData));

                // Redirect based on role after 2 seconds
                setTimeout(() => {
                    if (userData.role === 'mentor') {
                        navigate('/mentor-dashboard');
                    } else if (userData.role === 'mentee') {
                        navigate('/mentee-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Failed to verify payment. Please try again.');
            setPaymentStatus('failed');
            console.error('Payment verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle coupon submission
    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/apply-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ couponCode })
            });

            const data = await response.json();
            
            if (response.ok) {
                setAppliedDiscount(data.discount);
                setFinalAmount(5000 * (1 - data.discount / 100));
                setCouponMessage(data.message);
                setTimeout(() => setShowCouponModal(false), 2000);
            } else {
                setCouponMessage(data.message || 'Failed to apply coupon');
            }
        } catch (err) {
            setCouponMessage('Error applying coupon');
            console.error('Coupon application error:', err);
        }
    };

    // Handle payment initialization
    const handlePayment = async () => {
        try {
            setLoading(true);
            setError('');
            setPaymentStatus('initializing');

            // Get token and user data from localStorage
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');

            console.log('Token:', token); // Debug log
            console.log('User Data:', userData); // Debug log

            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            if (!userData.email) {
                throw new Error('User email not found. Please login again.');
            }

            // Check if token is expired
            if (userData.tokenExpiry && new Date(userData.tokenExpiry) < new Date()) {
                console.log('Token expired, redirecting to login'); // Debug log
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                navigate('/login');
                return;
            }

            // Initialize payment with backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userData.email,
                    couponCode: couponCode || undefined
                })
            });

            console.log('Response status:', response.status); // Debug log

            if (response.status === 401) {
                console.log('Unauthorized, clearing token and redirecting'); // Debug log
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                navigate('/login');
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to initialize payment');
            }

            setPaymentStatus('redirecting');
            
            // Redirect to Paystack payment page
            window.location.href = data.authorizationUrl;
        } catch (err) {
            setError(err.message || 'Failed to initialize payment. Please try again.');
            setPaymentStatus('failed');
            console.error('Payment initialization error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show payment status message
    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'initializing':
                return 'Initializing payment...';
            case 'redirecting':
                return 'Redirecting to payment page...';
            case 'verifying':
                return 'Verifying payment...';
            case 'success':
                return 'Payment successful! Redirecting...';
            case 'failed':
                return 'Payment failed. Please try again.';
            default:
                return '';
        }
    };

    return (
        <section className='flex justify-center items-center h-full'>
            <div className="hidden lg:block h-full w-3/5">
                <img
                    src="/image/young-people-working-from-modern-place 1.png"
                    className="h-full w-full object-cover"
                    alt=""
                    loading="lazy"
                />
                <div onClick={() => navigate('/')} className="absolute top-4">
                    <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
                </div>
            </div>

            <div className='flex flex-col h-full w-11/12 lg:w-2/5 justify-center items-center'>
                <div onClick={() => navigate('/')} className="block lg:hidden bg-black py-2 px-2">
                    <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
                </div>

                <div className='w-[300px] lg:w-[400px]'>
                    <h1 className='text-3xl lg:text-[40px] font-medium'>Make Payment</h1>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {paymentStatus && (
                        <div className={`mt-4 p-3 rounded-lg ${
                            paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {getStatusMessage()}
                        </div>
                    )}

                    <div className='flex justify-between mt-8'>
                        <h1 className='text-slate-500'>Product Name</h1>
                        <p className='text-slate-800 font-semibold'>Mentorship</p>
                    </div>

                    <div className='flex justify-between mt-8'>
                        <h1 className='text-slate-500'>Price/Amount</h1>
                        <p className='text-slate-800 font-semibold'>
                            {appliedDiscount > 0 ? (
                                <>
                                    <del>₦5,000</del> ₦{finalAmount}
                                </>
                            ) : (
                                `₦5,000`
                            )}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCouponModal(true)}
                        className="mt-4 w-full h-10 lg:h-14 rounded-lg cursor-pointer text-customOrange border border-customOrange hover:bg-orange-50 transition-colors"
                    >
                        Have a Coupon Code?
                    </button>

                    <button
                        onClick={handlePayment}
                        disabled={loading || paymentStatus === 'redirecting' || paymentStatus === 'verifying'}
                        className={`mt-4 w-full h-10 lg:h-14 rounded-lg cursor-pointer text-white bg-customOrange hover:bg-orange-600 transition-colors ${
                            (loading || paymentStatus === 'redirecting' || paymentStatus === 'verifying') 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                    >
                        {loading ? 'Processing...' : 'Continue to Payment'}
                    </button>

                    {/* Coupon Modal */}
                    {showCouponModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
                                <h2 className="text-xl font-semibold mb-4">Enter Coupon Code</h2>
                                <form onSubmit={handleCouponSubmit}>
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                                        placeholder="Enter your coupon code"
                                    />
                                    {couponMessage && (
                                        <p className={`mb-4 ${couponMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                                            {couponMessage}
                                        </p>
                                    )}
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCouponModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-customOrange text-white rounded-lg hover:bg-orange-600"
                                        >
                                            Apply Coupon
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Payment;