import React from 'react';

const Badge = ({ status }) => {
  const normStatus = (status || '').toLowerCase();
  
  let label = status;
  let statusClass = 'available';

  if (normStatus === 'available') {
    label = 'Available';
    statusClass = 'available';
  } else if (normStatus === 'borrowed') {
    label = 'Borrowed';
    statusClass = 'borrowed';
  } else if (normStatus === 'active') {
    label = 'Active';
    statusClass = 'active';
  } else if (normStatus === 'overdue') {
    label = 'Overdue';
    statusClass = 'overdue';
  } else if (normStatus === 'returned') {
    label = 'Returned';
    statusClass = 'returned';
  }

  return (
    <span className={`status-badge ${statusClass}`}>
      <span className="status-dot"></span>
      {label}
    </span>
  );
};

export default Badge;
