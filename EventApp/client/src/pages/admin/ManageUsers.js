import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, updateUser, deleteUser } from '../../store/slices/adminSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { users, totalUsers, loading } = useSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    dispatch(fetchAdminUsers({ search, role: roleFilter }));
  }, [dispatch, search, roleFilter]);

  const handleToggleActive = async (user) => {
    try {
      await dispatch(updateUser({ id: user._id, userData: { isActive: !user.isActive } })).unwrap();
      toast.success(`User ${user.isActive ? 'disabled' : 'enabled'}`);
      dispatch(fetchAdminUsers({ search, role: roleFilter }));
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success('User deleted');
    } catch (err) {
      toast.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditForm({ name: user.name, email: user.email || '', department: user.department || '', role: user.role });
    setEditModal(user);
  };

  const handleSaveEdit = async () => {
    try {
      await dispatch(updateUser({ id: editModal._id, userData: editForm })).unwrap();
      toast.success('User updated');
      setEditModal(null);
      dispatch(fetchAdminUsers({ search, role: roleFilter }));
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <>
      <TopBar title="Manage Users" />
      <div className="page-content">
        <div className="filter-bar">
          <div className="search-input">
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search users..."
              style={{ paddingLeft: 36 }}
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
          <span style={{ color: '#64748b', fontSize: 13 }}>Total: {totalUsers}</span>
        </div>

        <div className="card">
          {loading ? <Loader /> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Role</th>
                    <th>Department</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '-'}</td>
                      <td><span className={`badge badge-${u.role === 'admin' ? 'completed' : u.role === 'organizer' ? 'approved' : 'registered'}`}>{u.role}</span></td>
                      <td>{u.department || '-'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(u)} title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button className="btn btn-sm btn-warning" onClick={() => handleToggleActive(u)} title={u.isActive ? 'Disable' : 'Enable'}>
                            {u.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                          </button>
                          {u.role !== 'admin' && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)} title="Delete">
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit User"
          footer={<><button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button></>}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input className="form-control" value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={editForm.role || ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default ManageUsers;
