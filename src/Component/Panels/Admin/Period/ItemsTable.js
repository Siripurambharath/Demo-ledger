import React from 'react';
import { FaCheck, FaTimes, FaEdit } from 'react-icons/fa';

const ItemsTable = ({
  order,
  selectedItems,
  setSelectedItems,
  handleItemSelect,
  handleSelectAll,
  handleGenerateInvoice,
   handleEditItem,  // Add this
  navigate,  // Add this
  handleApproveItem,
  handleRejectItem,
  openItemModal
}) => {
  const orderSelectedItems = selectedItems[order.id] || [];
  const allItemsSelected = order.items && orderSelectedItems.length === order.items.length;

    const onEditItem = (item) => {
    handleEditItem(order, item, navigate);
  };
  return (
    <div className="p-invoices-section">
      <div className="p-items-header">
        <h4>Order Items</h4>
        {orderSelectedItems.length > 0 && (
          <div className="p-bulk-buttons">
            <button
              className="p-generate-invoice-btn p-bulk-btn"
              onClick={() => handleGenerateInvoice(order)}
              title={`Generate invoice for ${orderSelectedItems.length} selected item(s)`}
            >
              Generate Invoice for {orderSelectedItems.length} Item(s)
            </button>
          </div>
        )}
      </div>
      {order.items && order.items.length > 0 ? (
        <table className="p-invoices-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={allItemsSelected}
                  onChange={() => handleSelectAll(order.id, order.items)}
                  className="p-item-checkbox"
                  disabled={(() => {
                    const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
                    return creditPeriods.length > 1;
                  })()}
                  title={(() => {
                    const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
                    if (creditPeriods.length > 1) {
                      return `Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days`;
                    }
                    return allItemsSelected ? "Deselect all items" : "Select all items";
                  })()}
                />
              </th>
              <th>Item Name</th>
              {(() => {
                const hasFlashOfferInOrder = order.items.some(item => item.flash_offer === 1);
                if (hasFlashOfferInOrder) {
                  return (
                    <>
                      <th>Qty</th>
                      <th>Get Free</th>
                    </>
                  );
                } else {
                  return (
                    <>
                      <th>Qty</th>
                      <th>Dst Amnt</th>
                      <th>Weight</th>
                    </>
                  );
                }
              })()}
              <th>Sale Price</th>
              <th>MSP</th>
              <th>Edited Price</th>
              <th>Credit Charge</th>
              <th>CP</th>
              <th>Inv No</th>
              <th>Approval Status</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const isItemSelected = orderSelectedItems.includes(item.id);
              const hasInvoiceGenerated = item.invoice_status === 1;
              const needsApproval = item.needs_approval;
              const approvalStatus = item.approval_status;
              const canEdit = item.can_edit;
              const hasFlashOffer = item.flash_offer === 1;
              const buyQuantity = item.buy_quantity || 0;
              const getQuantity = item.get_quantity || 0;

              return (
                <tr key={item.id}>
                  <td>
                    {hasInvoiceGenerated ? (
                      <span title="Invoice Already Generated">✅</span>
                    ) : (
                      (() => {
                        const currentSelectedIds = selectedItems[order.id] || [];
                        if (currentSelectedIds.length === 0) {
                          const canSelect = !needsApproval || approvalStatus === "approved";
                          return (
                            <input
                              type="checkbox"
                              checked={isItemSelected && canSelect}
                              onChange={(e) => {
                                if (!canSelect) {
                                  alert(`This item requires approval before it can be selected.`);
                                  return;
                                }
                                handleItemSelect(order.id, item.id, e.target.checked, item.credit_period);
                              }}
                              className="p-item-checkbox"
                              disabled={!canSelect}
                              title={!canSelect ? "Item requires approval before selection" : "Select for invoice generation"}
                            />
                          );
                        }
                        const firstSelectedId = currentSelectedIds[0];
                        const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
                        const selectedCreditPeriod = firstSelectedItem?.credit_period;
                        const isSelectable = selectedCreditPeriod === item.credit_period;
                        const canSelect = isSelectable && (!needsApproval || approvalStatus === "approved");
                        return (
                          <input
                            type="checkbox"
                            checked={isItemSelected && canSelect}
                            onChange={(e) => {
                              if (!canSelect) {
                                if (!isSelectable) {
                                  alert(`Items with different credit periods cannot be selected together.`);
                                } else {
                                  alert(`This item requires approval before selection.`);
                                }
                                return;
                              }
                              handleItemSelect(order.id, item.id, e.target.checked, item.credit_period);
                            }}
                            className="p-item-checkbox"
                            disabled={!canSelect}
                            title={!canSelect ? "Cannot select this item" : "Select for invoice generation"}
                          />
                        );
                      })()
                    )}
                  </td>
                  <td>{item.item_name}</td>
                  {hasFlashOffer ? (
                    <>
                      <td className="p-flash-column">
                        <div>
                          <span className="p-flash-buy" title="Quantity">{buyQuantity}</span>
                        </div>
                      </td>
                      <td className="p-flash-column">
                        <div className="p-flash-free" title="Get Free Quantity">
                          {getQuantity}
                          <span className="p-flash-badge"></span>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-regular-column">
                        <span title="Ordered Quantity">{item.quantity}</span>
                      </td>
                      <td className="p-regular-column">
                        ₹{item.discount_amount.toLocaleString()}
                      </td>
                      <td className="p-regular-column">
                        <span title="Weight">{item.weight || 0}</span>
                      </td>
                    </>
                  )}
                  <td>₹{item.sale_price.toLocaleString()}</td>
                  <td>₹{item.min_sale_price.toLocaleString()}</td>
                  <td>₹{item.edited_sale_price.toLocaleString()}</td>
                  <td>₹{item.credit_charge.toLocaleString()}</td>
                  <td>{item.credit_period}</td>
                  <td>{item.invoice_number || "N/A"}</td>
                  <td>
                    {needsApproval ? (
                      <div className="p-approval-status">
                        <span className={`p-approval-badge p-${approvalStatus}`}>
                          {approvalStatus === "approved" ? "Approved" :
                           approvalStatus === "rejected" ? "Rejected" : "Pending"}
                        </span>
                        {approvalStatus === "pending" && (
                          <div className="p-approval-buttons">
                            <button
                              className="p-btn p-btn-approve"
                              onClick={() => handleApproveItem(item.id, order.id)}
                              title="Approve this item"
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="p-btn p-btn-reject"
                              onClick={() => handleRejectItem(item.id, order.id)}
                              title="Reject this item"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="p-approval-badge p-not-required">
                        Not Required
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="p-action-buttons">
                      <button
                        className="p-eye-btn"
                        onClick={() => openItemModal(order.order_number, item.id)}
                        title="View Item Details"
                      >
                        👁️
                      </button>
                       {canEdit && (
                      <button
                        className="p-edit-btn"
                        onClick={() => onEditItem(item)}  // Use the wrapper function
                        title="Edit Item Price"
                      >
                        <FaEdit />
                      </button>
                    )}
                    </div>
                  </td>
                  <td>
                    {hasInvoiceGenerated ? (
                      <span className="p-invoice-generated-text">Invoice Generated</span>
                    ) : isItemSelected ? (
                      <span className="p-selected-text">Selected ✓</span>
                    ) : (() => {
                      const currentSelectedIds = selectedItems[order.id] || [];
                      if (currentSelectedIds.length > 0) {
                        const firstSelectedId = currentSelectedIds[0];
                        const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
                        if (firstSelectedItem && firstSelectedItem.credit_period !== item.credit_period) {
                          return (
                            <span className="p-different-period-text">
                              Different Period
                            </span>
                          );
                        }
                      }
                      if (needsApproval && approvalStatus !== "approved") {
                        return (
                          <span className="p-requires-approval-text">
                            Requires Approval
                          </span>
                        );
                      }
                      return (
                        <span className="p-select-prompt-text">
                          Available
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="p-no-items">
          <p>No items found for this order.</p>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;