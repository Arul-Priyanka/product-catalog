import React from 'react';

const Filter = ({ types, onFilter }) => {
  return (
    <div className="filter">
      <select onChange={(e) => onFilter(e.target.value)}>
        <option value="All">All Types</option>
        {types.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  );
};

export default Filter;