import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      const route = user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/student';
      navigate(route);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    dispatch(login({ email, password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EventHub</h1>
        <p>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</label>
            <input type="email" className="form-control" placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label><FiLock style={{ marginRight: 6, verticalAlign: 'middle' }} />Password</label>
            <input type="password" className="form-control" placeholder="Enter password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <br />
          <span>Don't have an account? </span><Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
