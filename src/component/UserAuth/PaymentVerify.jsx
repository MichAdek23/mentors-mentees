import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

function PaymentVerify() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const searchParams = new URLSearchParams(location.search);
                const reference = searchParams.get('reference');
                const trxref = searchParams.get('trxref');

                // Use reference if available, otherwise use trxref
                const paymentReference = reference || trxref;

                if (!paymentReference) {
                    setError('No payment reference found');
                    setLoading(false);
                    return;
                }

                // Verify payment with backend
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ reference: paymentReference })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Payment verification failed');
                }

                setVerificationStatus('success');
                
                // Clear local storage data
                localStorage.removeItem('userData');
                localStorage.removeItem('token');

                // Redirect based on user role
                setTimeout(() => {
                    if (user?.role === 'mentor') {
                        navigate('/mentor-dashboard');
                    } else if (user?.role === 'mentee') {
                        navigate('/mentee-dashboard');
                    } else if (user?.role === 'admin') {
                        navigate('/mentor-dashboard');
                    } else {
                        navigate('/login');
                    }
                }, 2000);
            } catch (err) {
                setError(err.message || 'Payment verification failed');
                setVerificationStatus('error');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location, navigate, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customOrange mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">❌</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/payment')}
                        className="bg-customOrange text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Return to Payment
                    </button>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-green-500 text-xl mb-4">✓</div>
                    <p className="text-green-600 mb-4">Payment verified successfully!</p>
                    <p className="text-gray-600">Redirecting you to your dashboard...</p>
                </div>
            </div>
        );
    }

    return null;
}

export default PaymentVerify; 