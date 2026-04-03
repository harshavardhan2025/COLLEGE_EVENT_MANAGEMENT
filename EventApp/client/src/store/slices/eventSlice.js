import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchEvents = createAsyncThunk('events/fetchAll', async (params, thunkAPI) => {
  try {
    const { data } = await API.get('/events', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchMyEvents = createAsyncThunk('events/fetchMine', async (_, thunkAPI) => {
  try {
    const { data } = await API.get('/events/organizer/my-events');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchEventById = createAsyncThunk('events/fetchOne', async (id, thunkAPI) => {
  try {
    const { data } = await API.get(`/events/${id}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const createEvent = createAsyncThunk('events/create', async (formData, thunkAPI) => {
  try {
    const { data } = await API.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (id, thunkAPI) => {
  try {
    await API.delete(`/events/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const completeEvent = createAsyncThunk('events/complete', async (id, thunkAPI) => {
  try {
    const { data } = await API.put(`/events/${id}/complete`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    myEvents: [],
    currentEvent: null,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearEventError: (state) => { state.error = null; },
    clearCurrentEvent: (state) => { state.currentEvent = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.loading = true; })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false; state.events = action.payload.events; state.total = action.payload.total;
      })
      .addCase(fetchEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyEvents.pending, (state) => { state.loading = true; })
      .addCase(fetchMyEvents.fulfilled, (state, action) => { state.loading = false; state.myEvents = action.payload; })
      .addCase(fetchMyEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchEventById.pending, (state) => { state.loading = true; })
      .addCase(fetchEventById.fulfilled, (state, action) => { state.loading = false; state.currentEvent = action.payload; })
      .addCase(fetchEventById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createEvent.pending, (state) => { state.loading = true; })
      .addCase(createEvent.fulfilled, (state, action) => { state.loading = false; state.myEvents.unshift(action.payload); })
      .addCase(createEvent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.myEvents = state.myEvents.filter(e => e._id !== action.payload);
      })
      .addCase(completeEvent.fulfilled, (state, action) => {
        const idx = state.myEvents.findIndex(e => e._id === action.payload.event._id);
        if (idx !== -1) state.myEvents[idx] = action.payload.event;
      });
  },
});

export const { clearEventError, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
