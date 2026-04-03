import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../store/slices/eventSlice';
import TopBar from '../../components/layout/TopBar';
import { toast } from 'react-toastify';
import { EVENT_TYPES } from '../../utils/helpers';

const CreateEvent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.events);
  const [form, setForm] = useState({
    name: '', type: 'Technical', description: '', department: '', timeSlot: 'Morning',
    venue: '', coordinator: '', coordinatorPhone: '', rules: '',
    startDate: '', endDate: '', registrationDeadline: '', maxParticipants: 100,
  });
  const [poster, setPoster] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.venue || !form.department || !form.startDate || !form.endDate || !form.registrationDeadline) {
      toast.error('Please fill all required fields'); return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => { if (form[key]) formData.append(key, form[key]); });
    if (poster) formData.append('poster', poster);

    try {
      await dispatch(createEvent(formData)).unwrap();
      toast.success('Event created! Awaiting admin approval.');
      navigate('/organizer/my-events');
    } catch (err) { toast.error(err); }
  };

  return (
    <>
      <TopBar title="Create Event" />
      <div className="page-content">
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="card-header"><h2>New Event</h2></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Event name" />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select className="form-control" name="type" value={form.type} onChange={handleChange}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Event description" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <input className="form-control" name="department" value={form.department} onChange={handleChange} placeholder="Department" />
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <select className="form-control" name="timeSlot" value={form.timeSlot} onChange={handleChange}>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Venue *</label>
                <input className="form-control" name="venue" value={form.venue} onChange={handleChange} placeholder="Event venue" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Coordinator Name</label>
                  <input className="form-control" name="coordinator" value={form.coordinator} onChange={handleChange} placeholder="Coordinator" />
                </div>
                <div className="form-group">
                  <label>Coordinator Phone</label>
                  <input className="form-control" name="coordinatorPhone" value={form.coordinatorPhone} onChange={handleChange} placeholder="Phone" />
                </div>
              </div>

              <div className="form-group">
                <label>Rules</label>
                <textarea className="form-control" name="rules" value={form.rules} onChange={handleChange} placeholder="Event rules and guidelines" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="datetime-local" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="datetime-local" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Registration Deadline *</label>
                  <input type="datetime-local" className="form-control" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Max Participants</label>
                  <input type="number" className="form-control" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Event Poster</label>
                <input type="file" className="form-control" accept="image/*" onChange={(e) => setPoster(e.target.files[0])} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
