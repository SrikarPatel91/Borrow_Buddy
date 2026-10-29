import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

const AddItemModal = ({ isOpen, onClose, onItemAdded }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [group, setGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/groups')
        .then((res) => {
          if (res.data.success) {
            setGroups(res.data.data);
            if (res.data.data.length > 0) {
              setGroup(res.data.data[0]._id);
            }
          }
        })
        .catch((err) => console.error('Error fetching groups:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/items', {
        name: name.trim(),
        category,
        description: description.trim(),
        group: group || null,
      });

      if (res.data.success) {
        setName('');
        setDescription('');
        onItemAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Add New Item</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: '#C5221F', fontSize: '13px' }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input
                type="text"
                placeholder="Enter item name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Sports">Sports</option>
                <option value="Tools">Tools</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                placeholder="Enter description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Group (Optional)</label>
              <select
                className="form-select"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="">Personal Item (No Group)</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <input
                type="text"
                className="form-input"
                value="Available"
                disabled
                style={{ backgroundColor: '#FAF8F2', color: '#137333', fontWeight: 600 }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
