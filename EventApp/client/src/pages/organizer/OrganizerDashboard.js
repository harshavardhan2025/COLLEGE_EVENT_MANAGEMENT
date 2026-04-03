import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyEvents } from '../../store/slices/eventSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import EventCard from '../../components/common/EventCard';
import { FiCalendar, FiCheckCircle, FiClock, FiList } from 'react-icons/fi';

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const { myEvents, loading } = useSelector((state) => state.events);

  useEffect(() => { dispatch(fetchMyEvents()); }, [dispatch]);

  const pending = myEvents.filter(e => e.status === 'pending').length;
  const approved = myEvents.filter(e => e.status === 'approved').length;
  const totalRegs = myEvents.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0);

  if (loading) return <><TopBar title="Organizer Dashboard" /><Loader /></>;

  return (
    <>
      <TopBar title="Organizer Dashboard" />
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple"><FiCalendar /></div>
            <div className="stat-info"><h3>{myEvents.length}</h3><p>Total Events</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><FiClock /></div>
            <div className="stat-info"><h3>{pending}</h3><p>Pending</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiCheckCircle /></div>
            <div className="stat-info"><h3>{approved}</h3><p>Approved</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FiList /></div>
            <div className="stat-info"><h3>{totalRegs}</h3><p>Total Registrations</p></div>
          </div>
        </div>

        <h2 style={{ marginBottom: 16, fontSize: 18 }}>Recent Events</h2>
        <div className="events-grid">
          {myEvents.slice(0, 6).map(event => (
            <EventCard key={event._id} event={event} linkPrefix="/organizer/event" />
          ))}
          {myEvents.length === 0 && (
            <div className="empty-state">
              <div className="icon"><FiCalendar /></div>
              <h3>No events yet</h3>
              <p>Create your first event to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrganizerDashboard;
