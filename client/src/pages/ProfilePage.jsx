import React, { useState, useEffect } from 'react';
import { Mail, Phone, Users, Calendar, Edit3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import EditProfileModal from '../components/EditProfileModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    api.get('/groups')
      .then((res) => {
        if (res.data.success) {
          setGroups(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load user groups:', err));
  }, []);

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return 'October 2026';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="header-greeting-title" style={{ fontSize: '24px' }}>Profile</h2>
          <p className="header-greeting-sub">Manage your account information and preferences.</p>
        </div>
      </div>

      {/* Main Profile Card matching Screenshot 12 */}
      <div className="content-card" style={{ maxWidth: '800px' }}>
        {/* User Hero Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #E8E3D2',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#001F44',
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initial}
          </div>

          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#001F44', marginBottom: '4px' }}>
              {user?.name || 'User'}
            </h3>
            <div style={{ fontSize: '14px', color: '#586B84', marginBottom: '4px' }}>
              {user?.email}
            </div>
            <div style={{ fontSize: '13px', color: '#8A99AD' }}>
              Member since: {formatMemberSince(user?.createdAt)}
            </div>
          </div>
        </div>

        {/* Detailed Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#001F44',
              }}
            >
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8A99AD', fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#001F44' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#001F44',
              }}
            >
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8A99AD', fontWeight: 600 }}>Phone</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#001F44' }}>
                {(!user?.phone || user.phone === '+91 98765 43210') ? '**********' : user.phone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#001F44',
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8A99AD', fontWeight: 600 }}>Group(s)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {groups.length === 0 ? (
                  <span style={{ fontSize: '13px', color: '#8A99AD' }}>No groups joined yet</span>
                ) : (
                  groups.map((g) => (
                    <span
                      key={g._id}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#FAF8F2',
                        border: '1px solid #E8E3D2',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#001F44',
                      }}
                    >
                      {g.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ borderTop: '1px solid #E8E3D2', paddingTop: '20px' }}>
          <button onClick={() => setIsEditOpen(true)} className="btn-primary">
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

export default ProfilePage;
