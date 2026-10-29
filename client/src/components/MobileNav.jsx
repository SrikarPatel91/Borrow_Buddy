import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, ArrowLeftRight, User } from 'lucide-react';

const MobileNav = () => {
  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/groups"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Users />
        <span>Groups</span>
      </NavLink>

      <NavLink
        to="/loans"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <ArrowLeftRight />
        <span>Loans</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <User />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
