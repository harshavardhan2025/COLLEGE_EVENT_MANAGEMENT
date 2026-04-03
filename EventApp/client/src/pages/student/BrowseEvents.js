import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../../store/slices/eventSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import EventCard from '../../components/common/EventCard';
import { EVENT_TYPES } from '../../utils/helpers';
import { FiSearch, FiFilter } from 'react-icons/fi';

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'IT', 'MBA', 'EEE', 'Civil'];

const BrowseEvents = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    dispatch(fetchEvents({ search, type, department }));
  }, [dispatch, search, type, department]);

  return (
    <>
      <TopBar title="Browse Events" />
      <div className="page-content">
        <div className="filter-bar">
          <div className="search-input">
            <FiSearch className="search-icon" />
            <input className="form-control" placeholder="Search events..."
              style={{ paddingLeft: 36 }}
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Categories</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Category Quick Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <FiFilter size={16} style={{ color: '#64748b' }} />
          {EVENT_TYPES.map(t => (
            <button key={t}
              className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setType(type === t ? '' : t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Department Quick Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <FiFilter size={16} style={{ color: '#64748b' }} />
          {DEPARTMENTS.map(d => (
            <button key={d}
              className={`btn ${department === d ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setDepartment(department === d ? '' : d)}>
              {d}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <div className="events-grid">
            {events.map(event => (
              <EventCard key={event._id} event={event} linkPrefix="/student/event" />
            ))}
            {events.length === 0 && (
              <div className="empty-state">
                <h3>No events found</h3>
                <p>Try different search, category, or department</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BrowseEvents;
