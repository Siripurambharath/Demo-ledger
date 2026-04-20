import React from 'react';

const ItemModal = ({ showModal, modalData, closeModals }) => {
  if (!showModal || !modalData) return null;

  return (
    <div className="p-modal-overlay" onClick={closeModals}>
      <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="p-modal-header">
          <h3>Item Details - {modalData.item_name}</h3>
          <button className="p-modal-close" onClick={closeModals}>×</button>
        </div>
        <div className="p-modal-body">
          <div className="p-two-column-wrapper">
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Item Name:</span>
                <span className="p-detail-value">{modalData?.item_name || "N/A"}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Order Number:</span>
                <span className="p-detail-value">{modalData?.order_number || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="p-three-column-grid">
            {/* Row 1 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Quantity:</span>
                <span className="p-detail-value">{modalData.quantity}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Final Amount:</span>
                <span className="p-detail-value">₹{modalData.final_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Item Total:</span>
                <span className="p-detail-value">₹{modalData.item_total.toLocaleString()}</span>
              </div>
            </div>
            {/* Row 2 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">MRP:</span>
                <span className="p-detail-value">₹{modalData.mrp.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Sale Price:</span>
                <span className="p-detail-value">₹{modalData.sale_price.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Edited Sale Price:</span>
                <span className="p-detail-value">₹{modalData.edited_sale_price.toLocaleString()}</span>
              </div>
            </div>
            {/* Row 3 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Customer Sale Price:</span>
                <span className="p-detail-value">₹{modalData.customer_sale_price.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Total Amount:</span>
                <span className="p-detail-value">₹{modalData.total_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Discount %:</span>
                <span className="p-detail-value">{modalData.discount_percentage}%</span>
              </div>
            </div>
            {/* Row 4 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Discount Amount:</span>
                <span className="p-detail-value">₹{modalData.discount_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Taxable Amount:</span>
                <span className="p-detail-value">₹{modalData.taxable_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Tax %:</span>
                <span className="p-detail-value">{modalData.tax_percentage}%</span>
              </div>
            </div>
            {/* Row 5 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Tax Amount:</span>
                <span className="p-detail-value">₹{modalData.tax_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">SGST %:</span>
                <span className="p-detail-value">{modalData.sgst_percentage}%</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">SGST Amount:</span>
                <span className="p-detail-value">₹{modalData.sgst_amount.toLocaleString()}</span>
              </div>
            </div>
            {/* Row 6 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">CGST %:</span>
                <span className="p-detail-value">{modalData.cgst_percentage}%</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">CGST Amount:</span>
                <span className="p-detail-value">₹{modalData.cgst_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Credit Period:</span>
                <span className="p-detail-value">{modalData.credit_period} days</span>
              </div>
            </div>
            {/* Row 7 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Credit Percentage:</span>
                <span className="p-detail-value">{modalData.credit_percentage}%</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Credit Charge:</span>
                <span className="p-detail-value">₹{modalData.credit_charge.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Discount Scheme:</span>
                <span className="p-detail-value">{modalData.discount_applied_scheme}</span>
              </div>
            </div>
            {/* Row 8 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Product ID:</span>
                <span className="p-detail-value">{modalData.product_id}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Staff ID:</span>
                <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Net Price:</span>
                <span className="p-detail-value">{modalData.net_price || "N/A"}</span>
              </div>
            </div>
            {/* Row 9 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Approval Status:</span>
                <span className="p-detail-value">
                  {modalData.needs_approval ? (
                    <span className={`p-approval-badge p-${modalData.approval_status}`}>
                      {modalData.approval_status === "approved" ? "Approved" :
                       modalData.approval_status === "rejected" ? "Rejected" : "Pending"}
                    </span>
                  ) : (
                    <span className="p-approval-badge p-not-required">Not Required</span>
                  )}
                </span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Weight:</span>
                <span className="p-detail-value">{modalData.weight || 0} g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;