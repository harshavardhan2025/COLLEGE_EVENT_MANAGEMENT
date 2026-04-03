import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '../../store/slices/adminSlice';
import TopBar from '../../components/layout/TopBar';
import Loader from '../../components/common/Loader';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import { FiUsers, FiCalendar, FiCheckCircle, FiUserCheck, FiTrendingUp, FiAward } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const Analytics = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  if (loading || !stats) return <><TopBar title="Analytics & Reports" /><Loader /></>;

  const attendanceRate = stats.totalRegistrations > 0
    ? ((stats.attendedCount || 0) / stats.totalRegistrations * 100).toFixed(1) : 0;

  // --- Chart Data ---

  // Pie: Department Participation
  const deptPieData = {
    labels: stats.deptParticipation?.map(d => d._id || 'Unknown') || [],
    datasets: [{
      data: stats.deptParticipation?.map(d => d.count) || [],
      backgroundColor: COLORS,
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  // Doughnut: Event Type Distribution
  const eventTypeDoughnut = {
    labels: stats.eventTypeDistribution?.map(d => d._id) || [],
    datasets: [{
      data: stats.eventTypeDistribution?.map(d => d.count) || [],
      backgroundColor: COLORS.slice().reverse(),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  // Doughnut: Event Status
  const statusColors = { approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444', completed: '#4f46e5', cancelled: '#94a3b8' };
  const eventStatusData = {
    labels: stats.eventStatusDistribution?.map(d => d._id?.charAt(0).toUpperCase() + d._id?.slice(1)) || [],
    datasets: [{
      data: stats.eventStatusDistribution?.map(d => d.count) || [],
      backgroundColor: stats.eventStatusDistribution?.map(d => statusColors[d._id] || '#94a3b8') || [],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  // Bar: Department-wise Event Count
  const deptEventBar = {
    labels: stats.deptEventCount?.map(d => d._id || 'Unknown') || [],
    datasets: [{
      label: 'Events',
      data: stats.deptEventCount?.map(d => d.count) || [],
      backgroundColor: COLORS.map(c => c + '99'),
      borderColor: COLORS,
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  // Line: Monthly Events + Registrations Trend
  const monthlyTrend = {
    labels: months,
    datasets: [
      {
        label: 'Events',
        data: months.map((_, i) => stats.monthlyEvents?.find(m => m._id === i + 1)?.count || 0),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4f46e5',
      },
      {
        label: 'Registrations',
        data: months.map((_, i) => stats.monthlyRegistrations?.find(m => m._id === i + 1)?.count || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
      },
    ],
  };

  // Pie: Registration Status
  const regStatusLabels = { registered: 'Registered', attended: 'Attended', absent: 'Absent', cancelled: 'Cancelled' };
  const regStatusColors = { registered: '#0ea5e9', attended: '#10b981', absent: '#ef4444', cancelled: '#94a3b8' };
  const regStatusData = {
    labels: stats.regStatusBreakdown?.map(d => regStatusLabels[d._id] || d._id) || [],
    datasets: [{
      data: stats.regStatusBreakdown?.map(d => d.count) || [],
      backgroundColor: stats.regStatusBreakdown?.map(d => regStatusColors[d._id] || '#94a3b8') || [],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
          }
        }
      }
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <>
      <TopBar title="Analytics & Reports" />
      <div className="page-content">

        {/* Summary Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 32 }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
            <div className="stat-info">
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Total Students</p>
              <h3 style={{ fontSize: 28, color: '#1e293b' }}>{stats.totalStudents}</h3>
            </div>
            <FiUsers size={28} color="#4f46e5" />
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
            <div className="stat-info">
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Total Events</p>
              <h3 style={{ fontSize: 28, color: '#1e293b' }}>{stats.totalEvents}</h3>
            </div>
            <FiCalendar size={28} color="#0ea5e9" />
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="stat-info">
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Registrations</p>
              <h3 style={{ fontSize: 28, color: '#1e293b' }}>{stats.totalRegistrations}</h3>
            </div>
            <FiCheckCircle size={28} color="#10b981" />
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="stat-info">
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Organizers</p>
              <h3 style={{ fontSize: 28, color: '#1e293b' }}>{stats.totalOrganizers}</h3>
            </div>
            <FiUserCheck size={28} color="#f59e0b" />
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="stat-info">
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Attendance Rate</p>
              <h3 style={{ fontSize: 28, color: '#1e293b' }}>{attendanceRate}%</h3>
            </div>
            <FiTrendingUp size={28} color="#8b5cf6" />
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="stat-info">
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Pending Approval</p>
              <h3 style={{ fontSize: 28, color: '#1e293b' }}>{stats.pendingEvents}</h3>
            </div>
            <FiAward size={28} color="#ef4444" />
          </div>
        </div>

        {/* Row 1: Pie Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
          <div className="chart-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Department-wise Student Participation</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Which departments have the most active students</p>
            <div style={{ height: 300 }}>
              {stats.deptParticipation?.length > 0
                ? <Pie data={deptPieData} options={pieOptions} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No participation data yet</div>}
            </div>
          </div>

          <div className="chart-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Event Category Distribution</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Breakdown of events by type</p>
            <div style={{ height: 300 }}>
              {stats.eventTypeDistribution?.length > 0
                ? <Doughnut data={eventTypeDoughnut} options={pieOptions} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No events yet</div>}
            </div>
          </div>

          <div className="chart-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Event Status Overview</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Current status of all events</p>
            <div style={{ height: 300 }}>
              {stats.eventStatusDistribution?.length > 0
                ? <Doughnut data={eventStatusData} options={pieOptions} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No events yet</div>}
            </div>
          </div>
        </div>

        {/* Row 2: Line chart (full width) */}
        <div className="chart-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Monthly Trends</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Events created and registrations received each month</p>
          <div style={{ height: 320 }}>
            <Line data={monthlyTrend} options={lineOptions} />
          </div>
        </div>

        {/* Row 3: Bar chart + Registration Status Pie + Top Events */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
          <div className="chart-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Events by Department</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Number of events organized per department</p>
            <div style={{ height: 300 }}>
              {stats.deptEventCount?.length > 0
                ? <Bar data={deptEventBar} options={barOptions} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No data</div>}
            </div>
          </div>

          <div className="chart-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Registration Status Breakdown</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Registered vs Attended vs Absent vs Cancelled</p>
            <div style={{ height: 300 }}>
              {stats.regStatusBreakdown?.length > 0
                ? <Pie data={regStatusData} options={pieOptions} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No registrations yet</div>}
            </div>
          </div>

          <div className="chart-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16, color: '#1e293b' }}>Top Events by Registrations</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Most popular events on the platform</p>
            {stats.topEvents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.topEvents.map((ev, i) => (
                  <div key={ev._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff',
                      background: COLORS[i % COLORS.length],
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{ev.type} &middot; {ev.department}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#4f46e5' }}>{ev.currentRegistrations}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>/ {ev.maxParticipants}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8' }}>No events yet</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Analytics;
