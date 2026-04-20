import React from 'react';
import { FaFilePdf, FaDownload, FaEdit } from 'react-icons/fa';
import ItemsTable from './ItemsTable';

const OrderRow = ({
  order,
  activeTab,
  openRow,
  toggleRow,
  isSelectedForDispatch,
  toggleOrderForDispatch,
  selectedItems,
  setSelectedItems,
  handleItemSelect,
  handleSelectAll,
    handleEditItem,  // Add this
  navigate,  // Add this
  handleGenerateInvoice,
  handleApproveItem,
  handleRejectItem,
  openOrderModal,
  openItemModal,
  orderInvoices,
  loadingInvoices,
  fetchInvoicesForOrder,
  handleDownloadSpecificPDF,
  openDropdown,
  setOpenDropdown
}) => {
  const isOrderOpen = openRow === order.id;
  const orderSelectedItems = selectedItems[order.id] || [];
  const allItemsSelected = order.items && orderSelectedItems.length === order.items.length;

  return (
    <React.Fragment>
      <tr className="p-customer-row">
        <td>
          <input
            type="checkbox"
            checked={isSelectedForDispatch}
            onChange={() => toggleOrderForDispatch(order.id)}
            title={isSelectedForDispatch ? "Deselect for dispatch" : "Select for dispatch"}
          />
        </td>
        <td>
          <button className="p-toggle-btn" onClick={() => toggleRow(order.id)}>
            <span className={isOrderOpen ? "p-arrow-up" : "p-arrow-down"}></span>
          </button>
        </td>
        <td>{order.order_number}</td>
        <td>{order.customer_name}</td>
        <td>₹{(order.order_total ?? 0).toLocaleString()}</td>
        <td>₹{(order.discount_amount ?? 0).toLocaleString()}</td>
        <td>{order.assigned_staff || "N/A"}</td>
        <td>{order.order_status || "N/A"}</td>
        <td>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
        <td>
          <div className="p-action-buttons">
            <button
              className="p-eye-btn"
              onClick={() => openOrderModal(order.id)}
              title="View Order Details"
            >
              👁️
            </button>
          </div>
        </td>
        {activeTab === "completed" && (
          <td>
            <div className="p-invoice-dropdown">
              <div className="p-dropdown-toggle">
                <button
                  className={`p-btn p-btn-pdf ${orderInvoices[order.order_number]?.length > 0 ? 'p-btn-success' : 'p-btn-warning'}`}
                  disabled={loadingInvoices[order.order_number]}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!orderInvoices[order.order_number]) {
                      fetchInvoicesForOrder(order.order_number);
                    }
                    setOpenDropdown(openDropdown === order.order_number ? null : order.order_number);
                  }}
                  title={orderInvoices[order.order_number]?.length > 0
                    ? `Click to view ${orderInvoices[order.order_number].length} invoice(s)`
                    : "Generate PDF"}
                >
                  {loadingInvoices[order.order_number] ? (
                    <span className="p-download-spinner">Loading...</span>
                  ) : orderInvoices[order.order_number]?.length > 0 ? (
                    <>
                      <FaDownload className="p-icon" />
                      {orderInvoices[order.order_number].length} Invoice(s)
                      <span className="p-dropdown-arrow">▼</span>
                    </>
                  ) : (
                    <>
                      <FaFilePdf className="p-icon" />
                      Generate PDF
                    </>
                  )}
                </button>
                {openDropdown === order.order_number && orderInvoices[order.order_number]?.length > 0 && (
                  <div className="p-dropdown-menu">
                    <div className="p-dropdown-header">
                      <span>Available Invoices</span>
                      <button
                        className="p-close-dropdown"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(null);
                        }}
                        title="Close"
                      >
                        ×
                      </button>
                    </div>
                    {orderInvoices[order.order_number].map((pdf, index) => (
                      <div
                        key={index}
                        className="p-dropdown-item"
                        onClick={() => {
                          handleDownloadSpecificPDF(order.order_number, pdf);
                          setOpenDropdown(null);
                        }}
                      >
                        <FaFilePdf className="p-icon-sm" />
                        <span className="p-invoice-filename">
                          {pdf.fileName || `Invoice_${index + 1}.pdf`}
                        </span>
                        <FaDownload className="p-icon-sm p-download-icon" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        )}
      </tr>
      {isOrderOpen && (
        <tr className="p-invoices-row">
          <td colSpan={activeTab === "completed" ? 12 : 11}>
            <ItemsTable
              order={order}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              handleItemSelect={handleItemSelect}
              handleSelectAll={handleSelectAll}
               handleEditItem={handleEditItem}  // Add this
              navigate={navigate}  // Add this
              handleGenerateInvoice={handleGenerateInvoice}
              handleApproveItem={handleApproveItem}
              handleRejectItem={handleRejectItem}
              openItemModal={openItemModal}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default OrderRow;