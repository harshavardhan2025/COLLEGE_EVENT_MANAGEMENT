import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  FiHome, FiCalendar, FiUsers, FiAward, FiLogOut, FiMenu, FiX,
  FiCheckSquare, FiPlusCircle, FiList, FiBarChart2, FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Manage Users' },
    { to: '/admin/events', icon: <FiCalendar />, label: 'Manage Events' },
    { to: '/admin/organizers', icon: <FiPlusCircle />, label: 'Create Organizer' },
    { to: '/admin/departments', icon: <FiSettings />, label: 'Departments' },
    { to: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  ];

  const organizerLinks = [
    { to: '/organizer', icon: <FiHome />, label: 'Dashboard' },
    { to: '/organizer/create-event', icon: <FiPlusCircle />, label: 'Create Event' },
    { to: '/organizer/my-events', icon: <FiList />, label: 'My Events' },
    { to: '/organizer/certificates', icon: <FiAward />, label: 'Certificates' },
  ];

  const studentLinks = [
    { to: '/student', icon: <FiHome />, label: 'Dashboard' },
    { to: '/student/events', icon: <FiCalendar />, label: 'Browse Events' },
    { to: '/student/my-registrations', icon: <FiCheckSquare />, label: 'My Registrations' },
    { to: '/student/certificates', icon: <FiAward />, label: 'Certificates' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'organizer' ? organizerLinks
    : studentLinks;

  return (
    <>
      <button className="menu-toggle" onClick={() => setOpen(!open)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 150 }}>
        {open ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FiCalendar size={24} />
          <h2>EventHub</h2>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === `/${user?.role}` || link.to === '/admin'}
              onClick={() => setOpen(false)}>
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          <button onClick={handleLogout}>
            <span className="nav-icon"><FiLogOut /></span>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
