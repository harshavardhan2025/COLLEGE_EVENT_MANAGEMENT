import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    department: '', session: '', rollNumber: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/student');
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 4) {
      toast.error('Password must be at least 4 characters'); return;
    }
    const { confirmPassword, ...data } = form;
    // Send department as both department and branch (they are the same)
    dispatch(register({ ...data, branch: data.department }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1>Create Account</h1>
        <p>Register as a student</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email address" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input type="text" className="form-control" name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="Roll number" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input type="text" className="form-control" name="department" value={form.department} onChange={handleChange} placeholder="e.g. CSE, ECE, ME" />
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input type="text" className="form-control" name="session" value={form.session} onChange={handleChange} placeholder="e.g. 2024-2025" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" className="form-control" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="auth-links">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
