import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import api from '../api/axios';
import CategoryIcon from '../components/CategoryIcon';
import Badge from '../components/Badge';
import ReturnModal from '../components/ReturnModal';

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [tab, setTab] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans');
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const activeLoans = loans.filter((l) => l.status === 'Active');
  const overdueLoans = loans.filter((l) => l.status === 'Overdue');
  const returnedLoans = loans.filter((l) => l.status === 'Returned');

  const displayedLoans =
    tab === 'Active'
      ? activeLoans
      : tab === 'Overdue'
      ? overdueLoans
      : returnedLoans;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '16px' }}>
        <div>
          <h2 className="header-greeting-title" style={{ fontSize: '24px' }}>Active Loans</h2>
          <p className="header-greeting-sub">Monitor borrowed items, deadlines, and return statuses.</p>
        </div>
      </div>

      {/* Tabs matching Screenshot 9: Active (3), Overdue (1), Returned */}
      <div className="filter-pills">
        <button
          className={`filter-pill ${tab === 'Active' ? 'active' : ''}`}
          onClick={() => setTab('Active')}
        >
          Active ({activeLoans.length})
        </button>
        <button
          className={`filter-pill ${tab === 'Overdue' ? 'active' : ''}`}
          onClick={() => setTab('Overdue')}
        >
          Overdue ({overdueLoans.length})
        </button>
        <button
          className={`filter-pill ${tab === 'Returned' ? 'active' : ''}`}
          onClick={() => setTab('Returned')}
        >
          Returned ({returnedLoans.length})
        </button>
      </div>

      {/* Loans Table */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Borrower</th>
                <th>Checkout Date</th>
                <th>{tab === 'Returned' ? 'Return Date' : 'Due Date'}</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8A99AD' }}>
                    Loading loans...
                  </td>
                </tr>
              ) : displayedLoans.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#8A99AD' }}>
                    No {tab.toLowerCase()} loans found.
                  </td>
                </tr>
              ) : (
                displayedLoans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <div className="table-item-cell">
                        <div className="table-item-icon">
                          <CategoryIcon category={loan.item?.category || 'General'} size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#001F44' }}>
                            {loan.item?.name || 'Item'}
                          </div>
                          {loan.checkoutNote && (
                            <div style={{ fontSize: '12px', color: '#8A99AD' }}>
                              Note: {loan.checkoutNote}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: '#001F44' }}>
                      {loan.borrowerName}
                      {loan.borrowerEmail && (
                        <div style={{ fontSize: '12px', color: '#8A99AD' }}>{loan.borrowerEmail}</div>
                      )}
                    </td>
                    <td style={{ color: '#586B84' }}>{formatDate(loan.checkoutDate)}</td>
                    <td style={{ color: '#586B84' }}>
                      {tab === 'Returned' ? formatDate(loan.returnedDate) : formatDate(loan.dueDate)}
                    </td>
                    <td>
                      <Badge status={loan.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {loan.status !== 'Returned' ? (
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="btn-primary btn-sm"
                          style={{ padding: '6px 14px' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Return</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8A99AD' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      <ReturnModal
        isOpen={!!selectedLoan}
        loan={selectedLoan}
        onClose={() => setSelectedLoan(null)}
        onReturned={() => fetchLoans()}
      />
    </div>
  );
};

export default LoansPage;
