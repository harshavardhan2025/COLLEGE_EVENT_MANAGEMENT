export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const isDeadlinePassed = (deadline) => new Date(deadline) < new Date();
export const isEventStarted = (startDate) => new Date(startDate) <= new Date();
export const isEventFull = (current, max) => current >= max;

export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    completed: '#6366f1',
    cancelled: '#6b7280',
    registered: '#3b82f6',
    attended: '#10b981',
    absent: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

export const EVENT_TYPES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];
