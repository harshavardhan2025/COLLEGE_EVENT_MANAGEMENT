import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { formatDateTime, isDeadlinePassed, isEventFull } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiUser, FiPhone } from 'react-icons/fi';

const StudentEventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, checkRes] = await Promise.all([
          API.get(`/events/${id}`),
          API.get(`/registrations/check/${id}`),
        ]);
        setEvent(evRes.data);
        setRegistered(checkRes.data.registered);
      } catch (err) { toast.error('Failed to load'); }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    setRegLoading(true);
    try {
      await API.post(`/registrations/${id}`);
      setRegistered(true);
      setEvent(prev => ({ ...prev, currentRegistrations: prev.currentRegistrations + 1 }));
      toast.success('Registered successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setRegLoading(false);
  };

  const handleUnregister = async () => {
    if (!window.confirm('Unregister from this event?')) return;
    setRegLoading(true);
    try {
      await API.delete(`/registrations/${id}`);
      setRegistered(false);
      setEvent(prev => ({ ...prev, currentRegistrations: Math.max(0, prev.currentRegistrations - 1) }));
      toast.success('Unregistered');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setRegLoading(false);
  };

  if (loading) return <><TopBar title="Event Details" /><Loader /></>;
  if (!event) return <><TopBar title="Event Details" /><div className="page-content"><p>Event not found</p></div></>;

  const deadlinePassed = isDeadlinePassed(event.registrationDeadline);
  const full = isEventFull(event.currentRegistrations, event.maxParticipants);
  const started = new Date(event.startDate) <= new Date();
  const canRegister = !registered && !deadlinePassed && !full && event.status === 'approved';
  const canUnregister = registered && !started;

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
            <div className="detail-grid">
              <div className="detail-item"><label>VENUE</label><p><FiMapPin size={14} style={{ marginRight: 4 }} />{event.venue}</p></div>
              <div className="detail-item"><label>COORDINATOR</label><p><FiUser size={14} style={{ marginRight: 4 }} />{event.coordinator || '-'}</p></div>
              <div className="detail-item"><label>START</label><p><FiCalendar size={14} style={{ marginRight: 4 }} />{formatDateTime(event.startDate)}</p></div>
              <div className="detail-item"><label>END</label><p>{formatDateTime(event.endDate)}</p></div>
              <div className="detail-item"><label>REGISTRATION DEADLINE</label><p><FiClock size={14} style={{ marginRight: 4 }} />{formatDateTime(event.registrationDeadline)}</p></div>
              <div className="detail-item"><label>SLOTS</label><p><FiUsers size={14} style={{ marginRight: 4 }} />{event.currentRegistrations}/{event.maxParticipants}</p></div>
              {event.coordinatorPhone && <div className="detail-item"><label>CONTACT</label><p><FiPhone size={14} style={{ marginRight: 4 }} />{event.coordinatorPhone}</p></div>}
            </div>

            {event.description && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>DESCRIPTION</label>
                <p style={{ marginTop: 4, lineHeight: 1.6 }}>{event.description}</p>
              </div>
            )}

            {event.rules && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>RULES</label>
                <p style={{ marginTop: 4, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{event.rules}</p>
              </div>
            )}

            {/* Registration Status */}
            <div style={{ padding: 20, background: registered ? '#d1fae5' : '#f1f5f9', borderRadius: 12, marginTop: 16 }}>
              {registered ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <strong style={{ color: '#065f46' }}>✓ You are registered for this event</strong>
                    <p style={{ fontSize: 13, color: '#064e3b', marginTop: 4 }}>Don't forget to attend!</p>
                  </div>
                  {canUnregister && (
                    <button className="btn btn-danger btn-sm" onClick={handleUnregister} disabled={regLoading}>
                      {regLoading ? 'Processing...' : 'Unregister'}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    {deadlinePassed && <strong style={{ color: '#991b1b' }}>Registration deadline has passed</strong>}
                    {full && !deadlinePassed && <strong style={{ color: '#991b1b' }}>Event is full</strong>}
                    {!deadlinePassed && !full && event.status !== 'approved' && <strong style={{ color: '#92400e' }}>Event not yet approved</strong>}
                    {canRegister && <strong>Register now to participate!</strong>}
                  </div>
                  {canRegister && (
                    <button className="btn btn-primary" onClick={handleRegister} disabled={regLoading}>
                      {regLoading ? 'Registering...' : 'Register for Event'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentEventDetail;
