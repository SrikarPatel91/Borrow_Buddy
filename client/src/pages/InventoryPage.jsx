import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Archive, Trash2, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CategoryIcon from '../components/CategoryIcon';
import Badge from '../components/Badge';
import AddItemModal from '../components/AddItemModal';
import BorrowModal from '../components/BorrowModal';
import ReturnModal from '../components/ReturnModal';

const InventoryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [statusTab, setStatusTab] = useState('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBorrowItem, setSelectedBorrowItem] = useState(null);
  const [selectedReturnLoan, setSelectedReturnLoan] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All Categories') params.category = category;
      if (statusTab && statusTab !== 'All') params.status = statusTab;

      const res = await api.get('/items', { params });
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, category, statusTab]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await api.delete(`/items/${itemId}`);
      if (res.data.success) {
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  // Counts for pills
  const totalCount = items.length;
  const availableCount = items.filter((i) => i.status === 'Available').length;
  const borrowedCount = items.filter((i) => i.status === 'Borrowed').length;
  const overdueCount = items.filter((i) => i.status === 'Overdue').length;

  return (
    <div>
      <div className="card-header-flex" style={{ marginBottom: '16px' }}>
        <div>
          <h2 className="header-greeting-title" style={{ fontSize: '24px' }}>Inventory</h2>
          <p className="header-greeting-sub">Track and organize your personal and group inventory.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="action-bar">
        <div className="search-box-wrapper">
          <Search className="search-icon-inside" />
          <input
            type="text"
            placeholder="Search items..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select
            className="select-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Sports">Sports</option>
            <option value="Tools">Tools</option>
            <option value="Lab Equipment">Lab Equipment</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      {/* Filter Pills matching Screenshot 6: All (12), Available (9), Borrowed (2), Overdue (1) */}
      <div className="filter-pills">
        <button
          className={`filter-pill ${statusTab === 'All' ? 'active' : ''}`}
          onClick={() => setStatusTab('All')}
        >
          All ({totalCount})
        </button>
        <button
          className={`filter-pill ${statusTab === 'Available' ? 'active' : ''}`}
          onClick={() => setStatusTab('Available')}
        >
          Available ({availableCount})
        </button>
        <button
          className={`filter-pill ${statusTab === 'Borrowed' ? 'active' : ''}`}
          onClick={() => setStatusTab('Borrowed')}
        >
          Borrowed ({borrowedCount})
        </button>
        <button
          className={`filter-pill ${statusTab === 'Overdue' ? 'active' : ''}`}
          onClick={() => setStatusTab('Overdue')}
        >
          Overdue ({overdueCount})
        </button>
      </div>

      {/* Items Table */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#8A99AD' }}>
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: '#8A99AD' }}>
                    No items found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="table-item-cell">
                        <div className="table-item-icon">
                          <CategoryIcon category={item.category} size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#001F44' }}>{item.name}</div>
                          {item.description && (
                            <div style={{ fontSize: '12px', color: '#8A99AD' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#586B84' }}>{item.category}</td>
                    <td>
                      <Badge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        {item.status === 'Available' ? (
                          <button
                            onClick={() => setSelectedBorrowItem(item)}
                            className="btn-primary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            <ArrowLeftRight size={12} />
                            <span>Borrow</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (item.currentLoan) {
                                setSelectedReturnLoan({
                                  _id: item.currentLoan._id || item.currentLoan,
                                  item: item,
                                  borrowerName: item.currentLoan.borrowerName || 'Borrower',
                                });
                              }
                            }}
                            className="btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            <CheckCircle2 size={12} color="#137333" />
                            <span>Return</span>
                          </button>
                        )}

                        {item.owner?._id === user?._id && item.status === 'Available' && (
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            style={{ color: '#8A99AD', padding: '6px' }}
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onItemAdded={() => fetchItems()}
      />

      <BorrowModal
        isOpen={!!selectedBorrowItem}
        item={selectedBorrowItem}
        onClose={() => setSelectedBorrowItem(null)}
        onLoanRecorded={() => fetchItems()}
      />

      <ReturnModal
        isOpen={!!selectedReturnLoan}
        loan={selectedReturnLoan}
        onClose={() => setSelectedReturnLoan(null)}
        onReturned={() => fetchItems()}
      />
    </div>
  );
};

export default InventoryPage;
