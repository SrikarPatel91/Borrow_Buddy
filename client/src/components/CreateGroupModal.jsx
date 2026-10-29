import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import api from '../api/axios';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/auth/users')
        .then((res) => {
          if (res.data.success) {
            setAvailableUsers(res.data.data);
          }
        })
        .catch((err) => console.error('Failed to fetch users:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/groups', {
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedUserIds,
      });

      if (res.data.success) {
        setName('');
        setDescription('');
        setSelectedUserIds([]);
        onGroupCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Create New Group</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: '#C5221F', fontSize: '13px' }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input
                type="text"
                placeholder="Enter group name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Books, Chargers, Sports Equipment"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Add Members</label>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: 12, top: 12, color: '#8A99AD' }}
                />
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid #E8E3D2',
                  borderRadius: '10px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '12px', fontSize: '13px', color: '#8A99AD', textAlign: 'center' }}>
                    No members found
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleUser(u._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#EBF2FA' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div click
                            style={{ cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#001F44' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#586B84' }}>{u.email}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
