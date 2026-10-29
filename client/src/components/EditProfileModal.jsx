import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(
    user?.phone === '+91 98765 43210' ? '' : (user?.phone || '')
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);

      if (res.data.success) {
        updateUser(res.data.data);
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Edit Profile</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: '#C5221F', fontSize: '13px' }}>{error}</div>}
            {success && <div style={{ color: '#137333', fontSize: '13px' }}>{success}</div>}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Read Only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#FAF8F2' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                placeholder="**********"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{ borderTop: '1px solid #E8E3D2', paddingTop: '12px', marginTop: '6px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#001F44', marginBottom: '8px' }}>
                Change Password (Optional)
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
