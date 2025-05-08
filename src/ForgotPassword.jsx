import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setMessage('');
    setVerified(false);
    setOtpInput('');
    const res = await fetch('http://localhost:5000/api/send-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      setOtpSent(true);
      setMessage('OTP sent to your email');
    } else {
      setMessage(data.error);
    }
  };
  

  const handleVerifyOtp = async () => {
    const res = await fetch('http://localhost:5000/api/verify-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: otpInput })
    });
    const data = await res.json();
    if (res.ok) {
      setVerified(true);
      setMessage('OTP verified. Set new password');
    } else {
      setMessage(data.error);
    }
  };

  const handleResetPassword = async () => {
    // Password pattern: at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, and minimum 8 characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
  
    if (!passwordRegex.test(newPassword)) {
      setMessage('Password must have at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character, and minimum 8 characters.');
      return;
    }
  
    const res = await fetch('http://localhost:5000/api/reset-password-final', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/'), 1000); 
    } else {
      setMessage(data.error);
    }
  };
  
  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpInput('');
    setMessage('');
  };
  

  return (
<div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
        {message && <p className="mb-4 text-blue-600">{message}</p>}
        {!otpSent ? (
          <>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full p-2 border rounded" />
            <button onClick={handleSendOtp} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send OTP</button>
          </>
        ) : !verified ? (
<>
  <input type="text" placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="mb-4 w-full p-2 border rounded" />
  
  <button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Verify OTP</button>

  <div className="flex justify-between mt-4">
    <button
      onClick={handleSendOtp}
      className="text-sm text-blue-500 underline hover:text-blue-700"
    >
      Resend OTP
    </button>

    <button
      onClick={handleBackToEmail}
      className="text-sm text-red-500 underline hover:text-red-700"
    >
      Back
    </button>
  </div>
</>

        ) : (
          <>
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mb-4 w-full p-2 border rounded" />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mb-4 w-full p-2 border rounded" />
            <button onClick={handleResetPassword} className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Reset Password</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
