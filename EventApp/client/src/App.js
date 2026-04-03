import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import './styles/global.css';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import CreateOrganizer from './pages/admin/CreateOrganizer';
import ManageDepartments from './pages/admin/ManageDepartments';
import Analytics from './pages/admin/Analytics';

// Organizer
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import MyEvents from './pages/organizer/MyEvents';
import EventDetail from './pages/organizer/EventDetail';
import OrganizerCertificates from './pages/organizer/OrganizerCertificates';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseEvents from './pages/student/BrowseEvents';
import StudentEventDetail from './pages/student/StudentEventDetail';
import MyRegistrations from './pages/student/MyRegistrations';
import StudentCertificates from './pages/student/StudentCertificates';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
          newestOnTop closeOnClick pauseOnHover theme="light" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="organizers" element={<CreateOrganizer />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Organizer Routes */}
          <Route path="/organizer" element={
            <ProtectedRoute roles={['organizer']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<OrganizerDashboard />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route path="event/:id" element={<EventDetail />} />
            <Route path="certificates" element={<OrganizerCertificates />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="events" element={<BrowseEvents />} />
            <Route path="event/:id" element={<StudentEventDetail />} />
            <Route path="my-registrations" element={<MyRegistrations />} />
            <Route path="certificates" element={<StudentCertificates />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
