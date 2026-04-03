import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiUsers as FiUsersIcon, FiUser, FiPhone, FiFileText, FiList, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

const EventCard = ({ event, actions, linkPrefix }) => {
  const navigate = useNavigate();
  const [showDesc, setShowDesc] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const fillPercent = event.maxParticipants ? (event.currentRegistrations / event.maxParticipants) * 100 : 0;
  const fillClass = fillPercent >= 100 ? 'full' : fillPercent >= 80 ? 'almost-full' : '';

  const handleClick = () => {
    if (linkPrefix) navigate(`${linkPrefix}/${event._id}`);
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <div className="event-card" onClick={handleClick} style={{ cursor: linkPrefix ? 'pointer' : 'default' }}>
      <div className="event-card-poster">
        {event.poster ? (
          <img src={`http://localhost:5000${event.poster}`} alt={event.name} />
        ) : (
          <FiCalendar />
        )}
        <span className="event-card-type">{event.type}</span>
      </div>
      <div className="event-card-body">
        <h3>{event.name}</h3>
        <div className="event-card-meta">
          <span><FiMapPin size={14} /> {event.venue}</span>
          <span><FiClock size={14} /> {formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          <span><FiUsersIcon size={14} /> {event.department}</span>
        </div>

        {/* Coordinator Info */}
        <div style={{ marginTop: 8, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155' }}>
            <FiUser size={14} style={{ color: '#6366f1' }} />
            <strong style={{ marginRight: 4 }}>Coordinator:</strong>
            <span>{event.coordinator || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', marginTop: 4 }}>
            <FiPhone size={14} style={{ color: '#6366f1' }} />
            <strong style={{ marginRight: 4 }}>Phone:</strong>
            <span>{event.coordinatorPhone || 'N/A'}</span>
          </div>
        </div>

        {/* Description & Rules Toggle Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }} onClick={stopProp}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 10px', fontSize: 12, fontWeight: 600,
              background: showDesc ? '#6366f1' : '#eef2ff', color: showDesc ? '#fff' : '#4f46e5',
              border: '1px solid ' + (showDesc ? '#6366f1' : '#c7d2fe'), borderRadius: 6, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            <FiFileText size={13} /> Description {showDesc ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowRules(!showRules); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 10px', fontSize: 12, fontWeight: 600,
              background: showRules ? '#6366f1' : '#eef2ff', color: showRules ? '#fff' : '#4f46e5',
              border: '1px solid ' + (showRules ? '#6366f1' : '#c7d2fe'), borderRadius: 6, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            <FiList size={13} /> Rules {showRules ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          </button>
        </div>

        {/* Description Panel */}
        {showDesc && (
          <div onClick={stopProp} style={{
            marginTop: 8, padding: '10px 12px', background: '#f0fdf4', borderRadius: 8,
            border: '1px solid #bbf7d0', fontSize: 13, color: '#166534', lineHeight: 1.6, whiteSpace: 'pre-line'
          }}>
            {event.description || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No description provided</span>}
          </div>
        )}

        {/* Rules Panel */}
        {showRules && (
          <div onClick={stopProp} style={{
            marginTop: 8, padding: '10px 12px', background: '#fefce8', borderRadius: 8,
            border: '1px solid #fde68a', fontSize: 13, color: '#854d0e', lineHeight: 1.6, whiteSpace: 'pre-line'
          }}>
            {event.rules || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No rules specified</span>}
          </div>
        )}

        <div className="slots-info">
          <span>{event.currentRegistrations}/{event.maxParticipants} slots filled</span>
          <div className="slots-bar">
            <div className={`slots-bar-fill ${fillClass}`} style={{ width: `${Math.min(fillPercent, 100)}%` }} />
          </div>
        </div>
        {actions && <div className="event-card-footer" style={{ marginTop: 12 }}>{actions}</div>}
      </div>
    </div>
  );
};

export default EventCard;
