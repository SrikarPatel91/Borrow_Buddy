import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Archive, ArrowLeftRight, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="9" r="4" />
              <circle cx="16" cy="14" r="3.5" />
              <path d="M4 19c0-2.8 2.2-5 5-5h2" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="sidebar-brand-title">BorrowBuddy</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Users />
            <span>My Groups</span>
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Archive />
            <span>Inventory</span>
          </NavLink>

          <NavLink
            to="/loans"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ArrowLeftRight />
            <span>Loans</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Clock />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <User />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
