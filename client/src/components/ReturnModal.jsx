import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import CategoryIcon from './CategoryIcon';

const ReturnModal = ({ isOpen, loan, onClose, onReturned }) => {
  const [returnDate, setReturnDate] = useState('');
  const [note, setNote] = useState('Item returned in good condition.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReturnDate(new Date().toISOString().split('T')[0]);
      setNote('Item returned in good condition.');
    }
  }, [isOpen]);

  if (!isOpen || !loan) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await api.post(`/loans/${loan._id}/return`, {
        returnDate,
        note: note.trim(),
      });

      if (res.data.success) {
        onReturned(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record return');
    } finally {
      setLoading(false);
    }
  };

  const itemName = loan.item?.name || 'Item';
  const itemCategory = loan.item?.category || 'General';

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Return Item</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: '#C5221F', fontSize: '13px' }}>{error}</div>}

            <div className="preview-item-card">
              <div className="table-item-icon">
                <CategoryIcon category={itemCategory} size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#001F44' }}>{itemName}</div>
                <div style={{ fontSize: '13px', color: '#586B84' }}>
                  {itemCategory} • Borrowed by {loan.borrowerName}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Return Date</label>
              <input
                type="date"
                className="form-input"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea
                placeholder="Item returned in good condition."
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
              {loading ? 'Confirming...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;
