import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);  // Track OTP verification status
    const navigate = useNavigate();

    const isValidPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/api/partners/request-password-reset', { email });
            setMessage(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            setMessage("OTP verified successfully! Now you can reset your password.");
            setOtpVerified(true);  // Set OTP verified to true
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!isValidPassword(newPassword)) {
            setError("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        try {
            const response = await axios.post('/api/partners/verify-otp-reset-password', { email, otp, newPassword });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    // Automatically close the modal if the password is updated successfully
    useEffect(() => {
        if (message.includes("successfully updated")) {
            setTimeout(() => {
                onClose();  // Close the modal after 2 seconds
            }, 2000);
        }
    }, [message, onClose]);

    // Reset the state when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            // Reset the form states
            setEmail('');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setStep(1);
            setMessage('');
            setError('');
            setOtpVerified(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold mb-4">{step === 1 ? "Forgot Password" : "Verify OTP"}</h1>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 font-bold"
                    >
                        &times; {/* This will render the close icon */}
                    </button>
                </div>
                {error && <div className="bg-red-200 text-red-600 p-3 mb-4 rounded">{error}</div>}
                {message && <div className="bg-green-200 text-green-600 p-3 mb-4 rounded">{message}</div>}

                {step === 1 && !otpVerified ? (  // Only show OTP form if OTP hasn't been verified
                    <form onSubmit={handleRequestOtp} className="flex flex-col space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="p-2 border border-gray-300 rounded"
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Send OTP</button>
                    </form>
                ) : (
                    <>
                        {step === 2 && !otpVerified ? (
                            <form onSubmit={handleVerifyOtp} className="flex flex-col space-y-4">
                                <input
                                    type="text"
                                    placeholder="Enter your OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="p-2 border border-gray-300 rounded"
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Verify OTP</button>
                            </form>
                        ) : (
                            otpVerified && (
                                <form onSubmit={handleResetPassword} className="flex flex-col space-y-4 mt-4">
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="p-2 border border-gray-300 rounded"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="p-2 border border-gray-300 rounded"
                                    />
                                    <button type="submit" className="bg-blue-600 text-white p-2 rounded">Reset Password</button>
                                </form>
                            )
                        )}
                    </>
                )}

                {message.includes("successfully updated") && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/partner/login')}
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
