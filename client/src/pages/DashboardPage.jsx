import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowLeftRight, AlertTriangle, Users, Plus, Laptop, BookOpen, Clock, Calendar } from 'lucide-react';
import api from '../api/axios';
import CategoryIcon from '../components/CategoryIcon';
import AddItemModal from '../components/AddItemModal';
import CreateGroupModal from '../components/CreateGroupModal';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    activeLoans: 0,
    overdueLoans: 0,
    groups: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  return (
    <div>
      {/* 4 Stat Cards matching Screenshot 3 */}
      <div className="stats-grid">
        <div className="stat-card total-items">
          <div className="stat-card-header">
            <Archive size={16} color="#3B82F6" />
            <span>Total Items</span>
          </div>
          <div className="stat-card-value">{loading ? '...' : stats.totalItems}</div>
        </div>

        <div className="stat-card active-loans">
          <div className="stat-card-header">
            <ArrowLeftRight size={16} color="#10B981" />
            <span>Active Loans</span>
          </div>
          <div className="stat-card-value">{loading ? '...' : stats.activeLoans}</div>
        </div>

        <div className="stat-card overdue">
          <div className="stat-card-header">
            <AlertTriangle size={16} color="#EF4444" />
            <span>Overdue</span>
          </div>
          <div className="stat-card-value">{loading ? '...' : stats.overdueLoans}</div>
        </div>

        <div className="stat-card groups">
          <div className="stat-card-header">
            <Users size={16} color="#6366F1" />
            <span>Groups</span>
          </div>
          <div className="stat-card-value">{loading ? '...' : stats.groups}</div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setIsAddItemOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Add New Item</span>
        </button>
        <button onClick={() => setIsCreateGroupOpen(true)} className="btn-secondary">
          <Users size={16} />
          <span>Create Group</span>
        </button>
        <Link to="/inventory" className="btn-secondary">
          <Archive size={16} />
          <span>View Inventory</span>
        </Link>
        <Link to="/loans" className="btn-secondary">
          <ArrowLeftRight size={16} />
          <span>Manage Loans</span>
        </Link>
      </div>

      {/* Recent Activity Card */}
      <div className="content-card">
        <div className="card-header-flex">
          <h2 className="card-title">Recent Activity</h2>
          <Link to="/history" className="view-all-link">
            View All
          </Link>
        </div>

        {stats.recentActivities?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#8A99AD', fontSize: '14px' }}>
            No recent activity yet. Add an item or record a loan to get started!
          </div>
        ) : (
          <div className="activity-list">
            {stats.recentActivities.map((act) => (
              <div key={act._id} className="activity-item">
                <div className="activity-left">
                  <div className="activity-icon-box">
                    <CategoryIcon category={act.item?.category || 'General'} size={18} />
                  </div>
                  <div className="activity-details">
                    <span className="activity-title">{act.title}</span>
                    {act.subtitle && (
                      <span className="activity-subtitle">{act.subtitle}</span>
                    )}
                  </div>
                </div>
                <span className="activity-time-badge">{formatTimeAgo(act.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onItemAdded={() => fetchStats()}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={() => fetchStats()}
      />
    </div>
  );
};

export default DashboardPage;
