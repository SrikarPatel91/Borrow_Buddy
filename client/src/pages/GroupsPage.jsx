import React, { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, UserPlus, Trash2, X, Archive } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CreateGroupModal from '../components/CreateGroupModal';
import CategoryIcon from '../components/CategoryIcon';
import Badge from '../components/Badge';

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedNewMembers, setSelectedNewMembers] = useState([]);

  const fetchGroups = async () => {
    try {
      setLoading(false);
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenGroupDetails = async (groupId) => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      if (res.data.success) {
        setSelectedGroup(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch group details:', err);
    }
  };

  const handleOpenAddMembers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        // Filter out users who are already in the group
        const existingMemberIds = selectedGroup.members.map((m) => m._id);
        const filtered = res.data.data.filter((u) => !existingMemberIds.includes(u._id));
        setAvailableUsers(filtered);
        setSelectedNewMembers([]);
        setIsAddMemberOpen(true);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleAddMembersSubmit = async (e) => {
    e.preventDefault();
    if (selectedNewMembers.length === 0) return;

    try {
      const res = await api.post(`/groups/${selectedGroup._id}/members`, {
        memberIds: selectedNewMembers,
      });
      if (res.data.success) {
        setIsAddMemberOpen(false);
        handleOpenGroupDetails(selectedGroup._id);
        fetchGroups();
      }
    } catch (err) {
      console.error('Failed to add members:', err);
    }
  };

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="header-greeting-title" style={{ fontSize: '24px' }}>My Groups</h2>
          <p className="header-greeting-sub">Collaborate and share items within your circles.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Create Group</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8A99AD' }}>Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users size={48} style={{ color: '#001F44', opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#001F44', marginBottom: '8px' }}>
            No groups created yet
          </h3>
          <p style={{ color: '#586B84', fontSize: '14px', marginBottom: '20px' }}>
            Create a group for your friends, college peers, or family to track shared items together!
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary" style={{ margin: '0 auto' }}>
            <Plus size={16} />
            <span>Create Your First Group</span>
          </button>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map((grp) => (
            <div
              key={grp._id}
              className="group-card-item"
              onClick={() => handleOpenGroupDetails(grp._id)}
            >
              <div className="group-card-left">
                <div className="group-avatar-icon">
                  <Users size={22} />
                </div>
                <div>
                  <div className="group-name">{grp.name}</div>
                  <div className="group-meta">
                    Members: {grp.members?.length || 0}
                    {grp.description && ` • ${grp.description}`}
                  </div>
                </div>
              </div>
              <ChevronRight size={20} color="#8A99AD" />
            </div>
          ))}
        </div>
      )}

      {/* Selected Group Detail Modal */}
      {selectedGroup && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedGroup.name}</h3>
                <p style={{ fontSize: '13px', color: '#586B84' }}>
                  {selectedGroup.description || 'Shared Group'}
                </p>
              </div>
              <button onClick={() => setSelectedGroup(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Members Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#001F44' }}>
                  Members ({selectedGroup.members?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={handleOpenAddMembers}
                  className="btn-secondary btn-sm"
                >
                  <UserPlus size={14} />
                  <span>Add Member</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px 0 16px' }}>
                {selectedGroup.members?.map((m) => (
                  <span
                    key={m._id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#FAF8F2',
                      border: '1px solid #E8E3D2',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      color: '#001F44',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#001F44',
                        color: '#FFF',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {m.name?.charAt(0).toUpperCase()}
                    </span>
                    {m.name}
                    {m._id === selectedGroup.creator?._id && (
                      <span style={{ fontSize: '10px', color: '#B45309', fontWeight: 600 }}> (Creator)</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Shared Items in this Group */}
              <div style={{ borderTop: '1px solid #E8E3D2', paddingTop: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#001F44' }}>
                  Shared Items ({selectedGroup.items?.length || 0})
                </span>

                {selectedGroup.items?.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#8A99AD', margin: '12px 0' }}>
                    No items associated with this group yet. Add items and select this group in the Add Item modal!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {selectedGroup.items.map((it) => (
                      <div
                        key={it._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: '#FAF8F2',
                          borderRadius: '8px',
                          border: '1px solid #E8E3D2',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CategoryIcon category={it.category} size={16} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#001F44' }}>
                              {it.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#586B84' }}>{it.category}</div>
                          </div>
                        </div>
                        <Badge status={it.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Add Members to {selectedGroup?.name}</h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMembersSubmit}>
              <div className="modal-body">
                {availableUsers.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#8A99AD', textAlign: 'center', padding: '16px' }}>
                    All registered users are already members of this group!
                  </p>
                ) : (
                  availableUsers.map((u) => {
                    const isSelected = selectedNewMembers.includes(u._id);
                    return (
                      <div
                        key={u._id}
                        onClick={() =>
                          setSelectedNewMembers((prev) =>
                            isSelected ? prev.filter((id) => id !== u._id) : [...prev, u._id]
                          )
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#EBF2FA' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#001F44' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#586B84' }}>{u.email}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedNewMembers.length === 0}
                  className="btn-primary"
                >
                  Add Selected ({selectedNewMembers.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onGroupCreated={() => fetchGroups()}
      />
    </div>
  );
};

export default GroupsPage;
