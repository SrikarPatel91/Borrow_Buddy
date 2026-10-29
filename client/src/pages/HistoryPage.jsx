import React, { useState, useEffect } from 'react';
import { Clock, Filter, Calendar } from 'lucide-react';
import api from '../api/axios';
import CategoryIcon from '../components/CategoryIcon';
import Badge from '../components/Badge';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/history', {
        params: { timeframe },
      });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load borrowing history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [timeframe]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="header-greeting-title" style={{ fontSize: '24px' }}>Borrowing History</h2>
          <p className="header-greeting-sub">Historical record of all shared, borrowed, and returned items.</p>
        </div>

        {/* Filter dropdown matching Screenshot 11: Last 30 days */}
        <div>
          <select
            className="select-filter"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Borrower</th>
                <th>Checkout</th>
                <th>Return</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8A99AD' }}>
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#8A99AD' }}>
                    No history records found for the selected timeframe.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div className="table-item-cell">
                        <div className="table-item-icon">
                          <CategoryIcon category={record.item?.category || 'General'} size={18} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#001F44' }}>
                          {record.item?.name || 'Item'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#586B84' }}>{record.item?.category || 'General'}</td>
                    <td style={{ fontWeight: 500, color: '#001F44' }}>{record.borrowerName}</td>
                    <td style={{ color: '#586B84' }}>{formatDate(record.checkoutDate)}</td>
                    <td style={{ color: '#586B84' }}>
                      {record.returnedDate ? formatDate(record.returnedDate) : '-'}
                    </td>
                    <td>
                      <Badge status={record.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
