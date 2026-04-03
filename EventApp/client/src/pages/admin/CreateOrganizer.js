import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrganizer } from '../../store/slices/adminSlice';
import TopBar from '../../components/layout/TopBar';
import { toast } from 'react-toastify';

const CreateOrganizer = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.admin);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', department: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.department) {
      toast.error('Fill all required fields'); return;
    }
    try {
      await dispatch(createOrganizer(form)).unwrap();
      toast.success('Organizer created successfully!');
      setForm({ name: '', email: '', phone: '', password: '', department: '' });
    } catch (err) { toast.error(err); }
  };

  return (
    <>
      <TopBar title="Create Organizer" />
      <div className="page-content">
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-header"><h2>New Organizer Account</h2></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email (used as login)" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password * (set by admin)</label>
                  <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} placeholder="Set initial password" />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input className="form-control" name="department" value={form.department} onChange={handleChange} placeholder="Department" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Organizer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateOrganizer;
