import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '../../store/slices/adminSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (loading || !stats) return <><TopBar title="Admin Dashboard" /><Loader /></>;

  const deptData = {
    labels: stats.deptParticipation?.map(d => d._id || 'Unknown') || [],
    datasets: [{
      data: stats.deptParticipation?.map(d => d.count) || [],
      backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    }],
  };

  const eventTypeData = {
    labels: stats.eventTypeDistribution?.map(d => d._id) || [],
    datasets: [{
      label: 'Events',
      data: stats.eventTypeDistribution?.map(d => d.count) || [],
      backgroundColor: '#4f46e5',
      borderRadius: 6,
    }],
  };

  return (
    <>
      <TopBar title="Admin Dashboard" />
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple"><FiUsers /></div>
            <div className="stat-info"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FiUserCheck /></div>
            <div className="stat-info"><h3>{stats.totalStudents}</h3><p>Students</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiCalendar /></div>
            <div className="stat-info"><h3>{stats.totalEvents}</h3><p>Total Events</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><FiClock /></div>
            <div className="stat-info"><h3>{stats.pendingEvents}</h3><p>Pending Approval</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiCheckCircle /></div>
            <div className="stat-info"><h3>{stats.approvedEvents}</h3><p>Approved Events</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><FiTrendingUp /></div>
            <div className="stat-info"><h3>{stats.totalRegistrations}</h3><p>Total Registrations</p></div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Department Participation</h3>
            {stats.deptParticipation?.length > 0 ? (
              <Doughnut data={deptData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            ) : <p style={{ color: '#64748b' }}>No data yet</p>}
          </div>
          <div className="chart-card">
            <h3>Events by Type</h3>
            {stats.eventTypeDistribution?.length > 0 ? (
              <Bar data={eventTypeData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            ) : <p style={{ color: '#64748b' }}>No data yet</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
