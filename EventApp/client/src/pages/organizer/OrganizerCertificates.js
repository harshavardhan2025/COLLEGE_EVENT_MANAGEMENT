import React, { useEffect, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { FiAward } from 'react-icons/fi';

const OrganizerCertificates = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/events/organizer/my-events');
        setEvents(data.filter(e => e.status === 'completed'));
      } catch (err) { console.error(err); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) { setCertificates([]); return; }
    const fetchCerts = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/events/${selectedEvent}/certificates`);
        setCertificates(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchCerts();
  }, [selectedEvent]);

  return (
    <>
      <TopBar title="Certificates" />
      <div className="page-content">
        <div className="filter-bar">
          <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            <option value="">Select completed event</option>
            {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>

        {loading ? <Loader /> : (
          certificates.length > 0 ? (
            <div className="events-grid">
              {certificates.map(c => (
                <div key={c._id} className="cert-card">
                  <FiAward size={32} color="#4f46e5" />
                  <h4>{c.user?.name}</h4>
                  <p>{c.event?.name}</p>
                  <span className={`badge badge-${c.type === 'winner' ? 'approved' : c.type === 'runner_up' ? 'registered' : 'completed'}`}>
                    {c.type.replace('_', ' ')}
                  </span>
                  <p className="cert-id" style={{ marginTop: 8 }}>{c.certificateId}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiAward size={48} />
              <h3>{selectedEvent ? 'No certificates generated' : 'Select an event'}</h3>
              <p>Choose a completed event to view certificates</p>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default OrganizerCertificates;
