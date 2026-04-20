import React, { useState, useEffect } from 'react';
import './ReusableTable.css';

const ReusableTable = ({
  title = 'Table',
  data = [],
  columns = [],
  initialEntriesPerPage = 5,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showEntriesSelector = true,
  showPagination = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(initialEntriesPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter(item => {
    return Object.keys(item).some(key => {
      if (typeof item[key] === 'string') {
        return item[key].toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  // Clear search term
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when search term or entries per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Generate pagination items with ellipsis
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5; // Maximum pages to show without ellipsis
    const ellipsis = <li key="ellipsis" className="rt-pagination__item rt-pagination__item--ellipsis">...</li>;

    // Always show first page
    items.push(
      <li 
        key={1} 
        className={`rt-pagination__item ${1 === currentPage ? 'rt-pagination__item--active' : ''}`}
      >
        <button 
          className="rt-pagination__link"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      </li>
    );

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than maxVisiblePages
      for (let i = 2; i <= totalPages; i++) {
        items.push(
          <li 
            key={i} 
            className={`rt-pagination__item ${i === currentPage ? 'rt-pagination__item--active' : ''}`}
          >
            <button 
              className="rt-pagination__link"
              onClick={() => handlePageChange(i)}
            >
              {i}
            </button>
          </li>
        );
      }
    } else {
      // Show ellipsis and current page with neighbors
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      if (leftBound > 2) {
        items.push(ellipsis);
      }

      for (let i = leftBound; i <= rightBound; i++) {
        items.push(
          <li 
            key={i} 
            className={`rt-pagination__item ${i === currentPage ? 'rt-pagination__item--active' : ''}`}
          >
            <button 
              className="rt-pagination__link"
              onClick={() => handlePageChange(i)}
            >
              {i}
            </button>
          </li>
        );
      }

      if (rightBound < totalPages - 1) {
        items.push(ellipsis);
      }

      // Always show last page
      items.push(
        <li 
          key={totalPages} 
          className={`rt-pagination__item ${totalPages === currentPage ? 'rt-pagination__item--active' : ''}`}
        >
          <button 
            className="rt-pagination__link"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return items;
  };

  return (
    <div className="rt-container">
      <div className="rt-header">
        {/* <h2 className="rt-title">{title}</h2> */}
        <div className="rt-controls">
          {showSearch && (
            <div className="rt-search">
              <i className="bi bi-search rt-search__icon"></i>
              <input
                type="text"
                className="rt-search__input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="rt-search__clear"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rt-table-container">
        <table className="rt-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="rt-table__header" style={column.style || {}}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, pageIndex) => {
                // Calculate the global index in the filtered data
                const globalIndex = startIndex + pageIndex;
                
                return (
                  <tr key={globalIndex} className="rt-table__row">
                    {columns.map((column) => (
                      <td key={column.key} className="rt-table__cell" style={column.style || {}}>
                        {column.render ? column.render(item[column.key], item, globalIndex) : item[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr className="rt-table__row">
                <td className="rt-table__cell" colSpan={columns.length}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="rt-footer">
          <div className="rt-pagination-info">
            Showing {Math.min(startIndex + 1, filteredData.length)} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>

          <nav aria-label="Table pagination">
            <ul className="rt-pagination">
              {showEntriesSelector && (
                <div className="rt-entries-select">
                  <label htmlFor="rt-entriesPerPage">Show</label>
                  <select
                    id="rt-entriesPerPage"
                    className="rt-select rt-select--sm"
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span>entries</span>
                </div>
              )}
              <li className={`rt-pagination__item ${currentPage === 1 ? 'rt-pagination__item--disabled' : ''}`}>
                <button 
                  className="rt-pagination__link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
              </li>
              
              {getPaginationItems()}
              
              <li className={`rt-pagination__item ${currentPage === totalPages ? 'rt-pagination__item--disabled' : ''}`}>
                <button 
                  className="rt-pagination__link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;