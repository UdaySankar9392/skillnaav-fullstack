import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Function to validate password
    const isValidPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/api/users/request-password-reset', { email });
            setMessage(response.data.message);
            setStep(2); // Move to step 2 after successfully sending OTP
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : 'Something went wrong');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Simulating OTP verification success
        try {
            // Here you could call an API to verify the OTP if needed.
            // For now we'll just simulate success.
            setMessage("OTP verified successfully! Now you can reset your password.");
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : 'Invalid OTP');
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
            const response = await axios.post('/api/users/verify-otp-reset-password', { email, otp, newPassword });
            setMessage(response.data.message); // Display success message after password update
            // Navigate to login after successful password reset
            // The login button will be shown below
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : 'Something went wrong');
        }
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <h1 className='text-xl font-bold mb-4'>{step === 1 ? "Forgot Password" : "Verify OTP"}</h1>
            {error && <div className='bg-red-200 text-red-600 p-3 mb-4 rounded'>{error}</div>}
            {message && <div className='bg-green-200 text-green-600 p-3 mb-4 rounded'>{message}</div>}
            
            {step === 1 ? (
                <form onSubmit={handleRequestOtp} className='flex flex-col space-y-4'>
                    <input 
                        type='email' 
                        placeholder='Enter your email' 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className='p-2 border border-gray rounded'
                    />
                    <button type='submit' className='bg-teal-500 text-white p-2 rounded'>Send OTP</button>
                </form>
            ) : (
                <>
                    <form onSubmit={handleVerifyOtp} className='flex flex-col space-y-4'>
                        <input 
                            type='text' 
                            placeholder='Enter your OTP' 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            required 
                            className='p-2 border border-gray rounded'
                        />
                        <button type='submit' className='bg-teal-500 text-white p-2 rounded'>Verify OTP</button>
                    </form>

                    {/* Show reset password form only after verifying OTP */}
                    {message.includes("OTP verified") && (
                        <form onSubmit={handleResetPassword} className='flex flex-col space-y-4 mt-4'>
                            <input 
                                type='password' 
                                placeholder='Enter new password' 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                className='p-2 border border-gray rounded'
                            />
                            <input 
                                type='password' 
                                placeholder='Confirm new password' 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                className='p-2 border border-gray rounded'
                            />
                            <button type='submit' className='bg-teal-500 text-white p-2 rounded'>Reset Password</button>
                        </form>
                    )}
                    
                    {/* Show Login button after successful password reset */}
                    {message.includes("successfully updated") && (
                        <div className="mt-4">
                            <p>Password has been successfully updated!</p>
                            <button
                                onClick={() => navigate('/user/login')} // Navigate to login page
                                className="bg-teal-500 text-white p-2 rounded mt-2"
                            >
                                Login
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ForgotPassword;