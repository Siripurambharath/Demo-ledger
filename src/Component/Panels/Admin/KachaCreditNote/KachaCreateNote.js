import React from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import ItemsTable from "./ItemsTable";
import CustomerInfo from "./CustomerInfo";
import useCreditNoteLogic from "./useCreditNoteLogic";
import "./Createnote.css";

const KachaCreateNote = () => {
  const {
    // Layout
    isCollapsed,
    setIsCollapsed,

    // Error
    error,

    // Header fields
    creditNoteNumber,
    noteDate,
    setNoteDate,
    selectedInvoice,
    setSelectedInvoice,

    // Invoice list
    invoiceList,
    loadingInvoices,

    // Customer
    loadingCustomer,
    customerData,

    // Items
    items,
    products,
    productBatches,

    // Edit states
    editingIndex,
    editedProduct,
    editedBatch,
    editedQuantity,

    // Totals
    totals,

    // Actions
    handleEditClick,
    handleCancelEdit,
    handleQuantityChange,
    handleProductChange,
    handleBatchChange,
    handleUpdateItem,
    handleDeleteItem,
    handleCreateCreditNote,
  } = useCreditNoteLogic();

  return (
    <div className="credit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`credit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="container my-4">

          {/* ERROR WARNING */}
          {error && (
            <div className="alert alert-warning alert-dismissible fade show">
              <strong>Warning:</strong> {error}
            </div>
          )}

          {/* MAIN BLOCK */}
          <div className="border bg-white p-3" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>

            {/* INVOICE HEADER */}
            <div className="row g-0 align-items-start">

              {/* LEFT */}
         <div className="col-lg-8 col-md-7 border-end p-3">
  <strong className="d-block mb-2">Navkar Exports</strong>
  <div className="company-details" style={{ fontSize: '13px' }}>
    <div className="mb-1">
      <strong>Name:</strong> SHREE SHASHWAT RAJ AGRO PVT.LTD.
    </div>
    <div className="mb-1">
      <strong>Address:</strong> NO.PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD,
      BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113
    </div>
    <div className="mb-1">
      <strong>Email:</strong> spmathur56@gmail.com
    </div>
    <div className="mb-1">
      <strong>Phone:</strong> 9801049700
    </div>
    <div className="mb-1">
      <strong>GSTIN:</strong> 10AAOCS1541B1ZZ
    </div>
  </div>
</div>
              {/* RIGHT */}
              <div className="col-lg-4 col-md-5 p-3">
                <label className="form-label small">Credit Note No</label>
                <input
                  className="form-control form-control-sm"
                  value={creditNoteNumber}
                  readOnly
                />

                <label className="form-label small mt-2">Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                />

                <label className="form-label small mt-2">Invoice</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                >
                  <option value="">
                    {loadingInvoices ? "Loading..." : "Select Invoice"}
                  </option>

                  {invoiceList.map((inv) => (
                    <option key={inv.VoucherID} value={inv.InvoiceNumber}>
                      {inv.InvoiceNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CUSTOMER INFO */}
            <CustomerInfo
              customerData={customerData}
              loadingCustomer={loadingCustomer}
            />

            {/* ITEMS TABLE */}
            <ItemsTable
              items={items}
              products={products}
              productBatches={productBatches}
              editingIndex={editingIndex}
              editedProduct={editedProduct}
              editedBatch={editedBatch}
              editedQuantity={editedQuantity}
              handleEditClick={handleEditClick}
              handleCancelEdit={handleCancelEdit}
              handleQuantityChange={handleQuantityChange}
              handleProductChange={handleProductChange}
              handleBatchChange={handleBatchChange}
              handleUpdateItem={handleUpdateItem}
              handleDeleteItem={handleDeleteItem}
            />

            {/* TOTALS */}
            <div className="row mt-3">
              <div className="col-md-8">
                <textarea className="form-control" rows="4" placeholder="Note" />
              </div>

              <div className="col-md-4 border p-2">
                <div className="d-flex justify-content-between">
                  <span>Taxable Amount</span>
                  <span>₹{totals.taxableAmount}</span>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Total IGST</span>
                  <span>₹{totals.totalIGST}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                  <span>Grand Total</span>
                  <span>₹{totals.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-success"
                onClick={handleCreateCreditNote}
                disabled={!selectedInvoice || items.length === 0}
              >
                + Create Credit Note
              </button>
            </div>
          </div>

          {/* CREDIT NOTES TABLE */}
          <ReusableTable title="Credit Notes" />

        </div>
      </div>
    </div>
  );
};

export default KachaCreateNote;

