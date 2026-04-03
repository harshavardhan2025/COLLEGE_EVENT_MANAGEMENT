import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import API from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { FiDownload, FiCheckCircle, FiAward, FiUsers, FiCalendar, FiMapPin } from 'react-icons/fi';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [certModal, setCertModal] = useState(false);
  const [certSelections, setCertSelections] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regRes] = await Promise.all([
          API.get(`/events/${id}`),
          API.get(`/events/${id}/registrations`),
        ]);
        setEvent(evRes.data);
        setRegistrations(regRes.data);
      } catch (err) { toast.error('Failed to load event'); }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAttendance = async (regId, status) => {
    try {
      await API.put(`/events/${id}/attendance`, {
        registrations: [{ registrationId: regId, status }],
      });
      setRegistrations(prev => prev.map(r => r._id === regId ? { ...r, status } : r));
      toast.success(`Marked as ${status}`);
    } catch (err) { toast.error('Failed'); }
  };

  const handleMarkAllAttended = async () => {
    try {
      const regs = registrations.filter(r => r.status === 'registered').map(r => ({
        registrationId: r._id, status: 'attended',
      }));
      if (regs.length === 0) { toast.info('No pending registrations'); return; }
      await API.put(`/events/${id}/attendance`, { registrations: regs });
      setRegistrations(prev => prev.map(r => r.status === 'registered' ? { ...r, status: 'attended' } : r));
      toast.success('All marked as attended');
    } catch (err) { toast.error('Failed'); }
  };

  const handleExport = async () => {
    try {
      const res = await API.get(`/events/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url;
      a.download = `${event?.name || 'event'}_registrations.xlsx`;
      a.click();
      toast.success('Excel exported');
    } catch (err) { toast.error('Export failed'); }
  };

  const handleCompleteEvent = async () => {
    try {
      await API.put(`/events/${id}/complete`);
      setEvent(prev => ({ ...prev, status: 'completed' }));
      toast.success('Event marked as completed');
    } catch (err) { toast.error('Failed'); }
  };

  const handleGenerateCertificates = async () => {
    const certs = Object.entries(certSelections)
      .filter(([, type]) => type)
      .map(([userId, type]) => ({ userId, type }));
    if (certs.length === 0) { toast.error('Select certificate types'); return; }
    try {
      await API.post(`/events/${id}/certificates`, { certificates: certs });
      toast.success('Certificates generated!');
      setCertModal(false);
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <><TopBar title="Event Details" /><Loader /></>;
  if (!event) return <><TopBar title="Event Details" /><div className="page-content"><p>Event not found</p></div></>;

  const attended = registrations.filter(r => r.status === 'attended').length;

  return (
    <>
      <TopBar title={event.name} />
      <div className="page-content">
        <div className="event-detail">
          <div className="event-detail-header">
            {event.poster && <img src={`http://localhost:5000${event.poster}`} alt={event.name} />}
            <div className="overlay"></div>
            <div className="content">
              <span className={`badge badge-${event.status}`} style={{ marginBottom: 8 }}>{event.status}</span>
              <h1>{event.name}</h1>
              <p style={{ opacity: 0.9 }}>{event.type} | {event.department}</p>
            </div>
          </div>

          <div className="event-detail-body">
            <div className="tabs">
              {['details', 'registrations', 'attendance'].map(t => (
                <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === 'details' && (
              <>
                <div className="detail-grid">
                  <div className="detail-item"><label>VENUE</label><p><FiMapPin size={14} style={{ marginRight: 4 }} />{event.venue}</p></div>
                  <div className="detail-item"><label>COORDINATOR</label><p>{event.coordinator || '-'} {event.coordinatorPhone && `(${event.coordinatorPhone})`}</p></div>
                  <div className="detail-item"><label>START DATE</label><p><FiCalendar size={14} style={{ marginRight: 4 }} />{formatDateTime(event.startDate)}</p></div>
                  <div className="detail-item"><label>END DATE</label><p>{formatDateTime(event.endDate)}</p></div>
                  <div className="detail-item"><label>DEADLINE</label><p>{formatDateTime(event.registrationDeadline)}</p></div>
                  <div className="detail-item"><label>PARTICIPANTS</label><p><FiUsers size={14} style={{ marginRight: 4 }} />{event.currentRegistrations}/{event.maxParticipants}</p></div>
                </div>
                {event.description && <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>DESCRIPTION</label><p style={{ marginTop: 4 }}>{event.description}</p></div>}
                {event.rules && <div><label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>RULES</label><p style={{ marginTop: 4 }}>{event.rules}</p></div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  {event.status === 'approved' && (
                    <button className="btn btn-success" onClick={handleCompleteEvent}><FiCheckCircle /> Mark Completed</button>
                  )}
                  <button className="btn btn-primary" onClick={() => setCertModal(true)}><FiAward /> Generate Certificates</button>
                </div>
              </>
            )}

            {tab === 'registrations' && (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleExport}><FiDownload /> Export Excel</button>
                  <span style={{ color: '#64748b', fontSize: 13, alignSelf: 'center' }}>
                    {registrations.length} registered | {attended} attended
                  </span>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>S.No</th><th>Name</th><th>Phone</th><th>Department</th><th>Roll No</th><th>Status</th></tr></thead>
                    <tbody>
                      {registrations.map((r, i) => (
                        <tr key={r._id}>
                          <td>{i + 1}</td>
                          <td>{r.user?.name}</td>
                          <td>{r.user?.phone}</td>
                          <td>{r.user?.department}</td>
                          <td>{r.user?.rollNumber || '-'}</td>
                          <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === 'attendance' && (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button className="btn btn-success btn-sm" onClick={handleMarkAllAttended}>
                    <FiCheckCircle /> Mark All Present
                  </button>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Phone</th><th>Roll No</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {registrations.map(r => (
                        <tr key={r._id}>
                          <td>{r.user?.name}</td>
                          <td>{r.user?.phone}</td>
                          <td>{r.user?.rollNumber || '-'}</td>
                          <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-success" onClick={() => handleAttendance(r._id, 'attended')}
                                disabled={r.status === 'attended'}>Present</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleAttendance(r._id, 'absent')}
                                disabled={r.status === 'absent'}>Absent</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Certificate Modal */}
        <Modal isOpen={certModal} onClose={() => setCertModal(false)} title="Generate Certificates"
          footer={<><button className="btn btn-secondary" onClick={() => setCertModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleGenerateCertificates}>Generate</button></>}>
          <p style={{ marginBottom: 16, fontSize: 13, color: '#64748b' }}>
            Select certificate type for each participant:
          </p>
          <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table>
              <thead><tr><th>Name</th><th>Status</th><th>Certificate Type</th></tr></thead>
              <tbody>
                {registrations.filter(r => r.status === 'attended').map(r => (
                  <tr key={r._id}>
                    <td>{r.user?.name}</td>
                    <td><span className="badge badge-attended">attended</span></td>
                    <td>
                      <select className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                        value={certSelections[r.user?._id] || ''}
                        onChange={(e) => setCertSelections({ ...certSelections, [r.user?._id]: e.target.value })}>
                        <option value="">None</option>
                        <option value="participation">Participation</option>
                        <option value="winner">Winner</option>
                        <option value="runner_up">Runner Up</option>
                        <option value="special">Special</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default EventDetail;
