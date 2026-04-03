import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminEvents, approveEvent, rejectEvent } from '../../store/slices/adminSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';

const ManageEvents = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewEvent, setViewEvent] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    dispatch(fetchAdminEvents({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handleApprove = async (id) => {
    try {
      await dispatch(approveEvent(id)).unwrap();
      toast.success('Event approved!');
      dispatch(fetchAdminEvents({ status: statusFilter }));
    } catch (err) { toast.error(err); }
  };

  const handleReject = async () => {
    try {
      await dispatch(rejectEvent({ id: rejectModal._id, reason: rejectReason })).unwrap();
      toast.success('Event rejected');
      setRejectModal(null);
      setRejectReason('');
      dispatch(fetchAdminEvents({ status: statusFilter }));
    } catch (err) { toast.error(err); }
  };

  return (
    <>
      <TopBar title="Manage Events" />
      <div className="page-content">
        <div className="filter-bar">
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="card">
          {loading ? <Loader /> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Event</th><th>Type</th><th>Department</th><th>Date</th>
                    <th>Organizer</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id}>
                      <td><strong>{ev.name}</strong></td>
                      <td>{ev.type}</td>
                      <td>{ev.department}</td>
                      <td>{formatDate(ev.startDate)}</td>
                      <td>{ev.createdBy?.name}</td>
                      <td><span className={`badge badge-${ev.status}`}>{ev.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-secondary" onClick={() => setViewEvent(ev)} title="View">
                            <FiEye size={14} />
                          </button>
                          {ev.status === 'pending' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleApprove(ev._id)} title="Approve">
                                <FiCheck size={14} />
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setRejectModal(ev)} title="Reject">
                                <FiX size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No events found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Event Modal */}
        <Modal isOpen={!!viewEvent} onClose={() => setViewEvent(null)} title="Event Details">
          {viewEvent && (
            <div>
              <div className="detail-grid">
                <div className="detail-item"><label>Name</label><p>{viewEvent.name}</p></div>
                <div className="detail-item"><label>Type</label><p>{viewEvent.type}</p></div>
                <div className="detail-item"><label>Department</label><p>{viewEvent.department}</p></div>
                <div className="detail-item"><label>Venue</label><p>{viewEvent.venue}</p></div>
                <div className="detail-item"><label>Start Date</label><p>{formatDate(viewEvent.startDate)}</p></div>
                <div className="detail-item"><label>End Date</label><p>{formatDate(viewEvent.endDate)}</p></div>
                <div className="detail-item"><label>Max Participants</label><p>{viewEvent.maxParticipants}</p></div>
                <div className="detail-item"><label>Registrations</label><p>{viewEvent.currentRegistrations}</p></div>
                <div className="detail-item"><label>Coordinator</label><p>{viewEvent.coordinator || '-'}</p></div>
                <div className="detail-item"><label>Deadline</label><p>{formatDate(viewEvent.registrationDeadline)}</p></div>
              </div>
              {viewEvent.description && <div style={{ marginTop: 12 }}><label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>DESCRIPTION</label><p>{viewEvent.description}</p></div>}
              {viewEvent.rules && <div style={{ marginTop: 12 }}><label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>RULES</label><p>{viewEvent.rules}</p></div>}
            </div>
          )}
        </Modal>

        {/* Reject Modal */}
        <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Event"
          footer={<><button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleReject}>Reject</button></>}>
          <div className="form-group">
            <label>Reason for rejection</label>
            <textarea className="form-control" value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason..." />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default ManageEvents;
