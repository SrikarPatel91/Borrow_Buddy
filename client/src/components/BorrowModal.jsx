import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../api/axios';
import CategoryIcon from './CategoryIcon';

const BorrowModal = ({ isOpen, item, onClose, onLoanRecorded }) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Default due date to 5 days from now
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 5);
      setDueDate(defaultDue.toISOString().split('T')[0]);

      // Fetch users list
      api.get('/auth/users')
        .then((res) => {
          if (res.data.success) {
            setUsers(res.data.data);
            if (res.data.data.length > 0) {
              setBorrowerId(res.data.data[0]._id);
              setBorrowerName(res.data.data[0].name);
            }
          }
        })
        .catch((err) => console.error('Failed to fetch users:', err));
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleBorrowerSelect = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setBorrowerId('');
      setBorrowerName('');
    } else {
      const selected = users.find((u) => u._id === val);
      if (selected) {
        setBorrowerId(selected._id);
        setBorrowerName(selected.name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!borrowerName.trim()) {
      setError('Please provide or select a borrower name');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/loans/borrow', {
        itemId: item._id,
        borrowerId: borrowerId || null,
        borrowerName: borrowerName.trim(),
        dueDate,
        note: note.trim(),
      });

      if (res.data.success) {
        onLoanRecorded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Borrow Item</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: '#C5221F', fontSize: '13px' }}>{error}</div>}

            {/* Item Preview Card */}
            <div className="preview-item-card">
              <div className="table-item-icon">
                <CategoryIcon category={item.category} size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#001F44' }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: '#586B84' }}>
                  {item.category} • <span style={{ color: '#137333', fontWeight: 600 }}>Available</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Borrower</label>
              <select
                className="form-select"
                value={borrowerId || (borrowerName ? 'custom' : '')}
                onChange={handleBorrowerSelect}
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
                <option value="custom">Other / Type borrower name...</option>
              </select>
            </div>

            {(!borrowerId || borrowerId === 'custom') && (
              <div className="form-group">
                <label className="form-label">Borrower Name</label>
                <input
                  type="text"
                  placeholder="Enter borrower name"
                  className="form-input"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea
                placeholder="Reason for borrowing..."
                className="form-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Recording...' : 'Record Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowModal;
