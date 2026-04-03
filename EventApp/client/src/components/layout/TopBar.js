import React from 'react';
import { useSelector } from 'react-redux';
import { FiUser } from 'react-icons/fi';

const TopBar = ({ title }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="top-bar">
      <h1>{title}</h1>
      <div className="top-bar-right">
        <div className="user-badge">
          <FiUser />
          <span>{user?.name}</span>
          <span className="role">({user?.role})</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
