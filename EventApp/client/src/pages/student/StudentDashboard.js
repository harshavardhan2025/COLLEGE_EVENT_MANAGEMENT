import React, { useEffect, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import EventCard from '../../components/common/EventCard';
import API from '../../utils/api';
import { FiCalendar, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';

const StudentDashboard = () => {
  const [regs, setRegs] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, certRes] = await Promise.all([
          API.get('/registrations/my'),
          API.get('/registrations/certificates'),
        ]);
        setRegs(regRes.data);
        setCerts(certRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <><TopBar title="Student Dashboard" /><Loader /></>;

  const upcoming = regs.filter(r => r.event && new Date(r.event.startDate) > new Date() && r.status === 'registered');
  const completed = regs.filter(r => r.event && (r.event.status === 'completed' || new Date(r.event.endDate) < new Date()));
  const attended = regs.filter(r => r.status === 'attended');

  return (
    <>
      <TopBar title="Student Dashboard" />
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple"><FiCalendar /></div>
            <div className="stat-info"><h3>{regs.length}</h3><p>Registered Events</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FiClock /></div>
            <div className="stat-info"><h3>{upcoming.length}</h3><p>Upcoming</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiCheckCircle /></div>
            <div className="stat-info"><h3>{attended.length}</h3><p>Attended</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><FiAward /></div>
            <div className="stat-info"><h3>{certs.length}</h3><p>Certificates</p></div>
          </div>
        </div>

        {upcoming.length > 0 && (
          <>
            <h2 style={{ marginBottom: 16, fontSize: 18 }}>Upcoming Events</h2>
            <div className="events-grid" style={{ marginBottom: 32 }}>
              {upcoming.slice(0, 3).map(r => (
                <EventCard key={r._id} event={r.event} linkPrefix="/student/event" />
              ))}
            </div>
          </>
        )}

        {completed.length > 0 && (
          <>
            <h2 style={{ marginBottom: 16, fontSize: 18 }}>Completed Events</h2>
            <div className="events-grid">
              {completed.slice(0, 3).map(r => (
                <EventCard key={r._id} event={r.event} linkPrefix="/student/event" />
              ))}
            </div>
          </>
        )}

        {regs.length === 0 && (
          <div className="empty-state">
            <FiCalendar size={48} />
            <h3>No registrations yet</h3>
            <p>Browse events and register to get started</p>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
