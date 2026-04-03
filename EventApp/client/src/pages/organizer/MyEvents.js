import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyEvents, deleteEvent } from '../../store/slices/eventSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import EventCard from '../../components/common/EventCard';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';

const MyEvents = () => {
  const dispatch = useDispatch();
  const { myEvents, loading } = useSelector((state) => state.events);
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchMyEvents()); }, [dispatch]);

  const filtered = filter === 'all' ? myEvents : myEvents.filter(e => e.status === filter);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this event?')) return;
    try {
      await dispatch(deleteEvent(id)).unwrap();
      toast.success('Event deleted');
    } catch (err) { toast.error(err); }
  };

  return (
    <>
      <TopBar title="My Events" />
      <div className="page-content">
        <div className="tabs">
          {['all', 'pending', 'approved', 'rejected', 'completed'].map(s => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? myEvents.length : myEvents.filter(e => e.status === s).length})
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <div className="events-grid">
            {filtered.map(event => (
              <EventCard key={event._id} event={event} linkPrefix="/organizer/event"
                actions={
                  new Date(event.startDate) > new Date() && (
                    <button className="btn btn-sm btn-danger" onClick={(e) => handleDelete(e, event._id)}>
                      <FiTrash2 size={14} /> Delete
                    </button>
                  )
                } />
            ))}
            {filtered.length === 0 && (
              <div className="empty-state"><h3>No events found</h3></div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MyEvents;
