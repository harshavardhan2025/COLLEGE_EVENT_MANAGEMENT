import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const user = JSON.parse(localStorage.getItem('user'));

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const { data } = await API.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const { data } = await API.post('/auth/register', userData);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, thunkAPI) => {
  try {
    const { data } = await API.post('/auth/forgot-password', { email });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (resetData, thunkAPI) => {
  try {
    const { data } = await API.post('/auth/reset-password', resetData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('user');
      state.user = null;
      state.error = null;
    },
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => { state.loading = false; state.message = action.payload.message; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state, action) => { state.loading = false; state.message = action.payload.message; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
