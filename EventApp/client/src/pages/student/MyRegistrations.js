import React, { useEffect, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import EventCard from '../../components/common/EventCard';
import API from '../../utils/api';
import { FiCalendar } from 'react-icons/fi';

const MyRegistrations = () => {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        const { data } = await API.get('/registrations/my');
        setRegs(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchRegs();
  }, []);

  const now = new Date();
  const filtered = tab === 'all' ? regs
    : tab === 'upcoming' ? regs.filter(r => r.event && new Date(r.event.startDate) > now)
    : tab === 'completed' ? regs.filter(r => r.event && (r.event.status === 'completed' || new Date(r.event.endDate) < now))
    : tab === 'attended' ? regs.filter(r => r.status === 'attended')
    : regs;

  if (loading) return <><TopBar title="My Registrations" /><Loader /></>;

  return (
    <>
      <TopBar title="My Registrations" />
      <div className="page-content">
        <div className="tabs">
          {['all', 'upcoming', 'completed', 'attended'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="events-grid">
          {filtered.map(r => r.event && (
            <EventCard key={r._id} event={r.event} linkPrefix="/student/event"
              actions={
                <span className={`badge badge-${r.status}`}>{r.status}</span>
              } />
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <FiCalendar size={48} />
              <h3>No registrations found</h3>
              <p>Browse events and register to participate</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyRegistrations;
