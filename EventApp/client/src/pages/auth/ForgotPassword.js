import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, resetPassword, clearError, clearMessage } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      if (step === 1) setStep(2);
      if (step === 2) setStep(3);
    }
  }, [error, message, dispatch, step]);

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter email address'); return; }
    dispatch(forgotPassword(email));
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (!otp || !newPassword) { toast.error('Fill all fields'); return; }
    dispatch(resetPassword({ email, otp, newPassword }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset Password</h1>
        {step === 1 && (
          <>
            <p>Enter your email address to receive OTP</p>
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}
        {step === 2 && (
          <>
            <p>Enter the OTP and new password</p>
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label>OTP</label>
                <input type="text" className="form-control" value={otp}
                  onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
        {step === 3 && (
          <>
            <p style={{ color: '#10b981', fontWeight: 600 }}>Password reset successful!</p>
          </>
        )}
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
