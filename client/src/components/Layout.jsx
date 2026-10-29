import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const Layout = ({ customHeader }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        {!customHeader && <Header />}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
