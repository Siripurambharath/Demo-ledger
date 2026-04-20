import React from 'react';

const OrderModal = ({ showModal, modalData, closeModals }) => {
  if (!showModal || !modalData) return null;

  return (
    <div className="p-modal-overlay" onClick={closeModals}>
      <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="p-modal-header">
          <h3>Order Details - {modalData.order_number}</h3>
          <button className="p-modal-close" onClick={closeModals}>×</button>
        </div>
        <div className="p-modal-body">
          <div className="p-three-column-grid">
            {/* Row 1 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Order Number:</span>
                <span className="p-detail-value">{modalData.order_number}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Customer Name:</span>
                <span className="p-detail-value">{modalData.customer_name}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Order Date:</span>
                <span className="p-detail-value">
                  {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>
            {/* Row 2 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Net Payable:</span>
                <span className="p-detail-value">₹{(modalData.net_payable ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Order Total:</span>
                <span className="p-detail-value">₹{(modalData.order_total ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Discount Amount:</span>
                <span className="p-detail-value">₹{(modalData.discount_amount ?? 0).toLocaleString()}</span>
              </div>
            </div>
            {/* Row 3 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Taxable Amount:</span>
                <span className="p-detail-value">₹{(modalData.taxable_amount ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Tax Amount:</span>
                <span className="p-detail-value">₹{(modalData.tax_amount ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Invoice Number:</span>
                <span className="p-detail-value">{modalData.invoice_number || "N/A"}</span>
              </div>
            </div>
            {/* Row 4 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Credit Period:</span>
                <span className="p-detail-value">{modalData.credit_period} days</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Estimated Delivery:</span>
                <span className="p-detail-value">
                  {modalData.estimated_delivery_date ? new Date(modalData.estimated_delivery_date).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Invoice Date:</span>
                <span className="p-detail-value">
                  {modalData.invoice_date ? new Date(modalData.invoice_date).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>
            {/* Row 5 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Customer ID:</span>
                <span className="p-detail-value">{modalData.customer_id}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Assigned Staff:</span>
                <span className="p-detail-value staff-highlight">
                  {modalData.assigned_staff || "N/A"}
                </span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Order Mode:</span>
                <span className="p-detail-value">{modalData.order_mode || 'N/A'}</span>
              </div>
            </div>
            {/* Row 6 */}
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Staff ID:</span>
                <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Staff Incentive:</span>
                <span className="p-detail-value incentive-highlight">
                  ₹{parseFloat(modalData.staff_incentive) || 0}
                </span>
              </div>
            </div>
            <div className="p-column">
              <div className="p-detail-row">
                <span className="p-detail-label">Last Updated:</span>
                <span className="p-detail-value">
                  {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;