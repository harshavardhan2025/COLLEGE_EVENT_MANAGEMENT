import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments } from '../../store/slices/adminSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const ManageDepartments = () => {
  const dispatch = useDispatch();
  const { departments, loading } = useSelector((state) => state.admin);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', branches: '' });

  useEffect(() => { dispatch(fetchDepartments()); }, [dispatch]);

  const handleSubmit = async () => {
    try {
      const data = { ...form, branches: form.branches.split(',').map(b => b.trim()).filter(Boolean) };
      if (editId) {
        await API.put(`/admin/departments/${editId}`, data);
        toast.success('Department updated');
      } else {
        await API.post('/admin/departments', data);
        toast.success('Department created');
      }
      setModal(false); setEditId(null); setForm({ name: '', code: '', branches: '' });
      dispatch(fetchDepartments());
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (dept) => {
    setEditId(dept._id);
    setForm({ name: dept.name, code: dept.code, branches: dept.branches?.join(', ') || '' });
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await API.delete(`/admin/departments/${id}`);
      toast.success('Deleted');
      dispatch(fetchDepartments());
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <>
      <TopBar title="Departments" />
      <div className="page-content">
        <div className="section-header">
          <h2>Departments</h2>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ name: '', code: '', branches: '' }); setModal(true); }}>
            <FiPlus /> Add Department
          </button>
        </div>

        <div className="card">
          {loading ? <Loader /> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Name</th><th>Code</th><th>Branches</th><th>Actions</th></tr></thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d._id}>
                      <td>{d.name}</td><td>{d.code}</td>
                      <td>{d.branches?.join(', ')}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(d)}><FiEdit2 size={14} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d._id)}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Department' : 'New Department'}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
          <div className="form-group"><label>Name *</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Code *</label>
            <input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
          <div className="form-group"><label>Branches (comma-separated)</label>
            <input className="form-control" value={form.branches} onChange={e => setForm({ ...form, branches: e.target.value })} placeholder="CSE, AI/ML, Data Science" /></div>
        </Modal>
      </div>
    </>
  );
};

export default ManageDepartments;
