import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchAdminStats = createAsyncThunk('admin/stats', async (_, thunkAPI) => {
  try {
    const { data } = await API.get('/admin/stats');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/users', async (params, thunkAPI) => {
  try {
    const { data } = await API.get('/admin/users', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchAdminEvents = createAsyncThunk('admin/events', async (params, thunkAPI) => {
  try {
    const { data } = await API.get('/admin/events', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const createOrganizer = createAsyncThunk('admin/createOrg', async (orgData, thunkAPI) => {
  try {
    const { data } = await API.post('/admin/organizers', orgData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const approveEvent = createAsyncThunk('admin/approveEvent', async (id, thunkAPI) => {
  try {
    const { data } = await API.put(`/admin/events/${id}/approve`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const rejectEvent = createAsyncThunk('admin/rejectEvent', async ({ id, reason }, thunkAPI) => {
  try {
    const { data } = await API.put(`/admin/events/${id}/reject`, { reason });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const updateUser = createAsyncThunk('admin/updateUser', async ({ id, userData }, thunkAPI) => {
  try {
    const { data } = await API.put(`/admin/users/${id}`, userData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, thunkAPI) => {
  try {
    await API.delete(`/admin/users/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchDepartments = createAsyncThunk('admin/departments', async (_, thunkAPI) => {
  try {
    const { data } = await API.get('/admin/departments');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    events: [],
    departments: [],
    totalUsers: 0,
    totalEvents: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchAdminStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAdminUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false; state.users = action.payload.users; state.totalUsers = action.payload.total;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAdminEvents.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminEvents.fulfilled, (state, action) => {
        state.loading = false; state.events = action.payload.events; state.totalEvents = action.payload.total;
      })
      .addCase(fetchAdminEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createOrganizer.fulfilled, (state, action) => { state.users.unshift(action.payload); })
      .addCase(approveEvent.fulfilled, (state, action) => {
        const idx = state.events.findIndex(e => e._id === action.payload.event._id);
        if (idx !== -1) state.events[idx] = action.payload.event;
      })
      .addCase(rejectEvent.fulfilled, (state, action) => {
        const idx = state.events.findIndex(e => e._id === action.payload.event._id);
        if (idx !== -1) state.events[idx] = action.payload.event;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => { state.departments = action.payload; });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
