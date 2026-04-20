import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ReceiptModal_preview = ({
  show,
  onHide,
  receiptFormData,
  onInputChange,
  onFileChange,
  onRemoveFile,
  onCreateReceipt,
  isCreatingReceipt
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Receipt from Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>  
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="company-info-recepits-table text-center">
              <label className="form-label-recepits-table">Navkar Exports</label>
              <p>NO.63/603 AND 64/604, NEAR JAIN TEMPLE</p>
              <p>1ST MAIN ROAD, T DASARAHALLI</p>
              <p>GST : 29AAAMPC7994B1ZE</p>
              <p>Email: akshay555.ak@gmail.com</p>
              <p>Phone: 09880990431</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Receipt Number</label>
              <input
                type="text"
                className="form-control"
                name="receiptNumber"
                value={receiptFormData.receiptNumber}
                onChange={onInputChange}
                placeholder="REC0001"
                readOnly
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Receipt Date</label>
              <input
                type="date"
                className="form-control"
                name="receiptDate"
                value={receiptFormData.receiptDate}
                onChange={onInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                name="paymentMethod"
                value={receiptFormData.paymentMethod}
                onChange={onInputChange}
              >
                <option>Direct Deposit</option>
                <option>Online Payment</option>
                <option>Credit/Debit Card</option>
                <option>Demand Draft</option>
                <option>Cheque</option>
                <option>Cash</option>
              </select>
            </div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Retailer *</label>
              <input
                type="text"
                className="form-control"
                value={receiptFormData.retailerBusinessName || 'Auto-filled from invoice'}
                readOnly
                disabled
              />
              <small className="text-muted">Auto-filled from invoice</small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Amount *</label>
              <div className="input-group custom-amount-receipts-table">
                <select
                  className="form-select currency-select-receipts-table"
                  name="currency"
                  value={receiptFormData.currency}
                  onChange={onInputChange}
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
                <input
                  type="number"
                  className="form-control amount-input-receipts-table"
                  name="amount"
                  value={receiptFormData.amount}
                  onChange={onInputChange}
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Note</label>
              <textarea
                className="form-control"
                rows="3"
                name="note"
                value={receiptFormData.note}
                onChange={onInputChange}
                placeholder="Additional notes..."
              ></textarea>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">For</label>
              <p className="mt-2">Authorised Signatory</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-control"
                name="bankName"
                value={receiptFormData.bankName}
                onChange={onInputChange}
                placeholder="Bank Name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Transaction Proof Document</label>
              <input 
                type="file" 
                className="form-control" 
                onChange={(e) => onFileChange(e)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <small className="text-muted">
                {receiptFormData.transactionProofFile ? receiptFormData.transactionProofFile.name : 'No file chosen'}
              </small>
              
              {receiptFormData.transactionProofFile && (
                <div className="mt-2">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success me-2">
                      <i className="bi bi-file-earmark-check"></i>
                    </span>
                    <span className="small">
                      {receiptFormData.transactionProofFile.name} 
                      ({Math.round(receiptFormData.transactionProofFile.size / 1024)} KB)
                    </span>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => onRemoveFile()}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Transaction Date</label>
              <input
                type="date"
                className="form-control"
                name="transactionDate"
                value={receiptFormData.transactionDate}
                onChange={onInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Reconciliation Option</label>
              <select
                className="form-select"
                name="reconciliationOption"
                value={receiptFormData.reconciliationOption}
                onChange={onInputChange}
              >
                <option>Do Not Reconcile</option>
                <option>Customer Reconcile</option>
              </select>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={onCreateReceipt}
          disabled={isCreatingReceipt}
        >
          {isCreatingReceipt ? 'Creating...' : 'Create Receipt'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceiptModal_preview;