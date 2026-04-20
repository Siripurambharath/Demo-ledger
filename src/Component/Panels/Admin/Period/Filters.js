import React from 'react';

const Filters = ({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedOrdersForDispatch,
  setSelectedOrdersForDispatch,
  handleGenerateDispatchReport
}) => {
  return (
    <div className="p-filters-section">
      <div className="p-filter-row">
        <div className="p-filter-group">
          <input
            type="text"
            className="p-form-control"
            placeholder="Search Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="p-filter-group">
          <input
            type="date"
            className="p-form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="p-filter-group">
          <input
            type="date"
            className="p-form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="p-filter-group">
          <button className="p-btn p-btn-primary" onClick={() => {}}>Search</button>
        </div>
        <div className="p-filter-group">
          <button
            className="p-btn p-btn-dispatch"
            onClick={handleGenerateDispatchReport}
            disabled={selectedOrdersForDispatch.length === 0}
          >
            {selectedOrdersForDispatch.length > 0
              ? `Dispatch Report (${selectedOrdersForDispatch.length})`
              : 'Select orders for dispatch'}
          </button>
        </div>
        {selectedOrdersForDispatch.length > 0 && (
          <div className="p-filter-group">
            <button
              className="p-btn p-btn-clear"
              onClick={() => setSelectedOrdersForDispatch([])}
              style={{ backgroundColor: '#f44336', color: 'white' }}
            >
              Clear Selected ({selectedOrdersForDispatch.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;