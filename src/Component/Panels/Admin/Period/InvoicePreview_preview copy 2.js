import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';

const InvoicePreview_preview = ({
  invoiceData,
  isEditing,
  editableNote,
  editableDescriptions,
  onNoteChange,
  onDescriptionChange,
  gstBreakdown,
  isSameState,
  onOrderModeChange
}) => {
  const [localOrderMode, setLocalOrderMode] = useState("PAKKA");

  useEffect(() => {
    if (invoiceData && invoiceData.order_mode) {
      const mode = invoiceData.order_mode.toUpperCase();
      setLocalOrderMode(mode === "KACHA" ? "KACHA" : "PAKKA");
    }
  }, [invoiceData]);

  // Get taxable amount PER UNIT from database
  const getTaxableAmountPerUnit = (item) => {
    if (item.taxable_amount !== undefined && item.taxable_amount !== null) {
      return parseFloat(item.taxable_amount) || 0;
    }
    return 0;
  };

  // Get total taxable amount (PER UNIT × QUANTITY)
  const getItemTotalTaxableAmount = (item) => {
    const taxablePerUnit = getTaxableAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return taxablePerUnit * quantity;
  };

  // Get total_amount from database (should already be multiplied by quantity)
  const getItemTotalAmount = (item) => {
    if (item.total_amount !== undefined && item.total_amount !== null) {
      return parseFloat(item.total_amount) || 0;
    }
    // Fallback: calculate from taxable amount and GST
    const taxableAmount = getItemTotalTaxableAmount(item);
    const gstAmount = getItemTotalGSTAmount(item);
    return taxableAmount + gstAmount;
  };

  // Get GST amount PER UNIT from database
  const getGSTAmountPerUnit = (item) => {
    if (item.tax_amount !== undefined && item.tax_amount !== null) {
      return parseFloat(item.tax_amount) || 0;
    }
    // Calculate GST from taxable amount and GST percentage
    if (item.gst && item.taxable_amount) {
      const gstPercentage = parseFloat(item.gst) || 0;
      const taxablePerUnit = getTaxableAmountPerUnit(item);
      return (taxablePerUnit * gstPercentage) / 100;
    }
    return 0;
  };

  // Get total GST amount (PER UNIT × QUANTITY)
  const getItemTotalGSTAmount = (item) => {
    if (localOrderMode === "KACHA") {
      return 0;
    }
    
    const gstPerUnit = getGSTAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return gstPerUnit * quantity;
  };

  // Get CGST amount PER UNIT from database
  const getCGSTAmountPerUnit = (item) => {
    if (item.cgst_amount !== undefined && item.cgst_amount !== null) {
      return parseFloat(item.cgst_amount) || 0;
    }
    // If CGST not in database, calculate half of total GST
    const gstPerUnit = getGSTAmountPerUnit(item);
    return gstPerUnit / 2;
  };

  // Get total CGST amount (PER UNIT × QUANTITY)
  const getItemTotalCGSTAmount = (item) => {
    const cgstPerUnit = getCGSTAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return cgstPerUnit * quantity;
  };

  const getSGSTAmountPerUnit = (item) => {
    if (item.sgst_amount !== undefined && item.sgst_amount !== null) {
      return parseFloat(item.sgst_amount) || 0;
    }
    const gstPerUnit = getGSTAmountPerUnit(item);
    return gstPerUnit / 2;
  };

  const getItemTotalSGSTAmount = (item) => {
    const sgstPerUnit = getSGSTAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return sgstPerUnit * quantity;
  };

  const calculateItemTotal = (item) => {
    if (localOrderMode === "KACHA") {
      // For KACHA, use total taxable amount
      return getItemTotalTaxableAmount(item);
    } else {
      // For PAKKA, calculate: taxable amount + GST
      const taxableAmount = getItemTotalTaxableAmount(item);
      const gstAmount = getItemTotalGSTAmount(item);
      return taxableAmount + gstAmount;
    }
  };

  const calculateAdjustedGSTBreakdown = () => {
    if (!invoiceData || !invoiceData.items) return {
      totalTaxableAmount: "0.00",
      totalCGST: "0.00",
      totalSGST: "0.00", 
      totalIGST: "0.00",
      totalGST: "0.00",
      totalItemsTotalAmount: "0.00",
      grandTotal: "0.00"
    };
    
    let totalTaxableAmount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalGST = 0;
    let totalItemsTotalAmount = 0;
    let grandTotal = 0;
    
    // Calculate from all items
    invoiceData.items.forEach(item => {
      const taxableAmount = getItemTotalTaxableAmount(item); // Already multiplied by quantity
      const itemTotalAmount = getItemTotalAmount(item); // Should be multiplied by quantity
      const itemTotal = calculateItemTotal(item); // Calculated correctly
      
      totalTaxableAmount += taxableAmount;
      totalItemsTotalAmount += itemTotalAmount;
      grandTotal += itemTotal; // This should be correct now
      
      if (localOrderMode === "PAKKA") {
        const cgstAmount = getItemTotalCGSTAmount(item);
        const sgstAmount = getItemTotalSGSTAmount(item);
        const gstAmount = getItemTotalGSTAmount(item);
        
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
        totalGST += gstAmount;
      }
    });
    
    return {
      totalTaxableAmount: totalTaxableAmount.toFixed(2),
      totalCGST: localOrderMode === "PAKKA" ? totalCGST.toFixed(2) : "0.00",
      totalSGST: localOrderMode === "PAKKA" ? totalSGST.toFixed(2) : "0.00",
      totalIGST: "0.00",
      totalGST: localOrderMode === "PAKKA" ? totalGST.toFixed(2) : "0.00",
      totalItemsTotalAmount: totalItemsTotalAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const adjustedGstBreakdown = calculateAdjustedGSTBreakdown();
  

  
const getAdjustedTotals = () => {
  if (!invoiceData || !invoiceData.items) return {
    taxableAmount: "0.00",
    totalGST: "0.00",
    grandTotal: "0.00",
    totalItemsAmount: "0.00",
    totalCGST: "0.00",
    totalSGST: "0.00"
  };
  
  let totalTaxableAmount = 0;
  let totalGSTAmount = 0;
  let totalGrandTotal = 0;
  let totalItemsAmount = 0;
  let totalCGSTAmount = 0;
  let totalSGSTAmount = 0;
  
  invoiceData.items.forEach(item => {
    const quantity = parseFloat(item.quantity) || 1;
    const taxablePerUnit = getTaxableAmountPerUnit(item);
    const gstPerUnit = getGSTAmountPerUnit(item);
    const cgstPerUnit = getCGSTAmountPerUnit(item);
    const sgstPerUnit = getSGSTAmountPerUnit(item);
    
    // Calculate totals by multiplying with quantity
    const itemTaxableAmount = taxablePerUnit * quantity;
    const itemGSTAmount = localOrderMode === "KACHA" ? 0 : gstPerUnit * quantity;
    const itemCGSTAmount = localOrderMode === "KACHA" ? 0 : cgstPerUnit * quantity;
    const itemSGSTAmount = localOrderMode === "KACHA" ? 0 : sgstPerUnit * quantity;
    const itemTotal = calculateItemTotal(item);
    const itemTotalAmount = getItemTotalAmount(item);
    
    totalTaxableAmount += itemTaxableAmount;
    totalGSTAmount += itemGSTAmount;
    totalCGSTAmount += itemCGSTAmount;
    totalSGSTAmount += itemSGSTAmount;
    totalItemsAmount += itemTotalAmount;
    totalGrandTotal += itemTotal;
  });
  
  return {
    taxableAmount: totalTaxableAmount.toFixed(2),
    totalGST: totalGSTAmount.toFixed(2),
    totalCGST: totalCGSTAmount.toFixed(2),
    totalSGST: totalSGSTAmount.toFixed(2),
    grandTotal: totalGrandTotal.toFixed(2),
    totalItemsAmount: totalItemsAmount.toFixed(2)
  };
};

const adjustedTotals = getAdjustedTotals();

  // Debug: Log the calculations
  useEffect(() => {
    if (invoiceData && invoiceData.items) {
      
      invoiceData.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          product: item.product,
          quantity: item.quantity,
          taxablePerUnit: getTaxableAmountPerUnit(item),
          totalTaxable: getItemTotalTaxableAmount(item),
          gstPerUnit: getGSTAmountPerUnit(item),
          totalGST: getItemTotalGSTAmount(item),
          itemTotal: calculateItemTotal(item)
        });
      });
    }
  }, [invoiceData, localOrderMode]);

  const handleOrderModeChange = (value) => {
    const normalizedValue = value.toUpperCase();
    setLocalOrderMode(normalizedValue);
    
    if (onOrderModeChange) {
      onOrderModeChange(normalizedValue);
    }
  };

  if (!invoiceData) return null;

             const formatIndianDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Get net price PER UNIT from database - ADD THIS FUNCTION
const getNetPricePerUnit = (item) => {
  if (item.net_price !== undefined && item.net_price !== null) {
    return parseFloat(item.net_price) || 0;
  }
  return 0;
};

  return (
    <div className="invoice-pdf-preview bg-white p-4 shadow-sm" id="invoice-pdf-content">
      {/* Header - unchanged */}
      <div className="invoice-header border-bottom pb-3 mb-3">
        <Row>
          <Col md={8}>
            <h2 className="company-name text-primary mb-1">{invoiceData.companyInfo.name}</h2>
            <p className="company-address text-muted mb-1">{invoiceData.companyInfo.address}</p>
            <p className="company-contact text-muted small mb-0">
              Email: {invoiceData.companyInfo.email} | 
              Phone: {invoiceData.companyInfo.phone} | 
              GSTIN: {invoiceData.companyInfo.gstin}
            </p>
          </Col>
          
          <Col md={4} className="text-end">
            <h3 className="invoice-title text-danger mb-2">TAX INVOICE</h3>
            <div className="invoice-meta bg-light p-2 rounded">
              <p className="mb-1"><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
  
<p className="mb-1"><strong>Invoice Date:</strong> {formatIndianDate(invoiceData.invoiceDate)}</p>
<p className="mb-0"><strong>Due Date:</strong> {formatIndianDate(invoiceData.validityDate)}</p>
            </div>
          </Col>
        </Row>
      </div>

      {/* Address Section - unchanged */}
      <div className="address-section mb-4">
        <Row>
          <Col md={6}>
            <div className="billing-address bg-light p-3 rounded">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="text-primary mb-0">Bill To:</h5>
              </div>
              
              <p className="mb-1"><strong>{invoiceData.supplierInfo.name}</strong></p>
              <p className="mb-1 text-muted">{invoiceData.supplierInfo.businessName}</p>
              <p className="mb-1"><small>GSTIN: {invoiceData.supplierInfo.gstin || 'N/A'}</small></p>
              <p className="mb-1"><small>State: {invoiceData.supplierInfo.state || 'N/A'}</small></p>
              <p className="mb-1"><small>Email: {invoiceData.supplierInfo.email || 'N/A'}</small></p>
            </div>
            
            {/* Order Mode Dropdown */}
            <div className="order-mode-section mt-3">
              <div className="order-mode-dropdown" style={{ width: "280px" }}>
                <Form.Group controlId="orderMode" className="mb-0">
                  <div className="d-flex align-items-center">
                    <Form.Label className="mb-0 me-2" style={{ minWidth: "100px" }}>
                      <strong>Order Type:</strong>
                    </Form.Label>
                    <Form.Select 
                      value={localOrderMode}
                      onChange={(e) => handleOrderModeChange(e.target.value)}
                      size="sm"
                      className="flex-grow-1"
                    >
                      <option value="PAKKA">PAKKA</option>
                      <option value="KACHA">KACHA</option>
                    </Form.Select>
                  </div>
                  <div className="mt-1">
                    <small className={localOrderMode === "KACHA" ? "text-danger" : "text-success"}>
                      {localOrderMode === "KACHA" ? "No GST applicable" : "GST applicable as per item rates"}
                    </small>
                  </div>
                </Form.Group>
              </div>
            </div>
          </Col>
          
          <Col md={6}>
            <div className="shipping-address bg-light p-3 rounded">
              <h5 className="text-primary mb-2">Ship To:</h5>
              <p className="mb-1">{invoiceData.shippingAddress.addressLine1 || 'N/A'}</p>
              <p className="mb-1">{invoiceData.shippingAddress.addressLine2 || ''}</p>
              <p className="mb-1">{invoiceData.shippingAddress.city || ''} - {invoiceData.shippingAddress.pincode || ''}</p>
              <p className="mb-0">{invoiceData.shippingAddress.state || ''}, {invoiceData.shippingAddress.country || 'India'}</p>
              {invoiceData.shippingAddress.gstin && (
                <p className="mb-0 mt-1"><small>Shipping GSTIN: {invoiceData.shippingAddress.gstin}</small></p>
              )}
            </div>
            
            {invoiceData.assigned_staff && invoiceData.assigned_staff !== 'N/A' && (
              <div className="assigned-staff-section mt-3 p-2 bg-light rounded flex-start">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Sales Person:</span>
                  <strong className="text-primary">{invoiceData.assigned_staff}</strong>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Items Table - Fixed calculations */}
   {/* Items Table - Fixed calculations */}
<div className="items-section mb-4">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <h6 className="text-primary mb-0">Items Details</h6>
  </div>
  <div className="table-responsive">
    <table className="items-table table table-bordered mb-0">
      <thead className="table-dark">
        <tr>
          <th className="text-center" style={{ width: '3%' }}>#</th>
          <th style={{ width: '12%' }}>Product</th>
          <th style={{ width: '15%' }}>Description</th>
          <th className="text-center" style={{ width: '4%' }}>Qty</th>
          <th className="text-end" style={{ width: '7%' }}>Price</th>
            <th className="text-end" style={{ width: '7%' }}>Discount Amt</th> 
          <th className="text-end" style={{ width: '7%' }}>Credit Charge</th>
          <th className="text-end" style={{ width: '7%' }}>Taxable Amount</th>
          <th className="text-center" style={{ width: '5%' }}>GST %</th>
          <th className="text-end" style={{ width: '7%' }}>GST Amt</th>
          <th className="text-end" style={{ width: '7%' }}>CGST Amt</th>
          <th className="text-end" style={{ width: '7%' }}>SGST Amt</th>
          <th className="text-end" style={{ width: '7%' }}>Item Total</th>
        </tr>
      </thead>
      <tbody>
        {invoiceData.items.map((item, index) => {
          const quantity = parseFloat(item.quantity) || 1;
          
          // Get PER UNIT values
          const taxablePerUnit = getTaxableAmountPerUnit(item);
          const totalAmountPerUnit = taxablePerUnit + (localOrderMode === "KACHA" ? 0 : getGSTAmountPerUnit(item));
          const gstPerUnit = localOrderMode === "KACHA" ? 0 : getGSTAmountPerUnit(item);
          const cgstPerUnit = localOrderMode === "KACHA" ? 0 : getCGSTAmountPerUnit(item);
          const sgstPerUnit = localOrderMode === "KACHA" ? 0 : getSGSTAmountPerUnit(item);
            const discountAmountPerUnit = parseFloat(item.discount_amount) || 0;
        const creditChargePerUnit = parseFloat(item.credit_charge) || 0;
          const totalTaxableAmount = taxablePerUnit * quantity;
          const totalAmount = totalAmountPerUnit * quantity;
          const totalGSTAmount = gstPerUnit * quantity;
          const totalCGSTAmount = cgstPerUnit * quantity;
          const totalSGSTAmount = sgstPerUnit * quantity;
            const totalDiscountAmount = discountAmountPerUnit * quantity;
        const totalCreditCharge = creditChargePerUnit * quantity;
          const itemTotal = calculateItemTotal(item);
          
          const gstPercentage = localOrderMode === "KACHA" ? 0 : (parseFloat(item.gst) || 0);
          const creditCharge = parseFloat(item.credit_charge) || 0;
          const salePrice = parseFloat(item.sale_price) || parseFloat(item.sales_price) || 0; // Get sale price
          const editedPrice = parseFloat(item.edited_sale_price) || parseFloat(item.price) || 0;
          
          return (
            <tr key={index}>
              <td className="text-center align-middle">{index + 1}</td>
              <td className="align-middle">
                <div className="fw-medium">{item.product}</div>
              </td>
              <td className="align-middle">
                {isEditing ? (
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={editableDescriptions[item.id || index] || item.description || ''}
                    onChange={(e) => onDescriptionChange(item.id || index, e.target.value)}
                    placeholder="Enter description..."
                    className="form-control-sm"
                  />
                ) : (
                  <div className="small text-muted">{item.description || 'No description'}</div>
                )}
              </td>
              <td className="text-center align-middle">
                {quantity}
              
              </td>
              
           
              
<td className="text-end align-middle">
  <div className="fw-medium">
    {(() => {
      const netPricePerUnit = getNetPricePerUnit(item);
      const editedPricePerUnit = editedPrice;
      
      // Calculate total price based on quantity
      const totalPrice = (localOrderMode === "PAKKA" && netPricePerUnit > 0) 
        ? (netPricePerUnit * quantity)
        : (editedPricePerUnit * quantity);
      
      if (localOrderMode === "PAKKA" && netPricePerUnit > 0) {
        return (
          <>
            <div className="text-primary">₹{totalPrice.toFixed(2)}</div>
           
          </>
        );
      } else {
        return (
          <>
            <div>₹{totalPrice.toFixed(2)}</div>
      
          </>
        );
      }
    })()}
  </div>
</td>
        {/* Discount Amount Column - NEW */}
            <td className="text-end align-middle">
              <div className="fw-medium text-warning">₹{totalDiscountAmount.toFixed(2)}</div>
             
            </td>
              
              {/* Credit Charge Column */}
              <td className="text-end align-middle">
                <div className="fw-medium">₹{creditCharge.toFixed(2)}</div>
             
              </td>
              
              {/* Taxable Amount Column */}
              <td className="text-end align-middle">
                <div className="fw-bold text-primary">₹{totalTaxableAmount.toFixed(2)}</div>
                <div className="text-muted small">
               
                </div>
              </td>
              
              <td className="text-center align-middle">
                <span className={`badge ${localOrderMode === "KACHA" ? "bg-secondary" : "bg-primary"}`}>
                  {localOrderMode === "KACHA" ? "0%" : `${gstPercentage}%`}
                </span>
              </td>
              
              {/* GST Amount Column */}
              <td className="text-end align-middle">
                <div className="fw-medium">
                  {localOrderMode === "KACHA" ? "₹0.00" : `₹${totalGSTAmount.toFixed(2)}`}
                </div>
                {localOrderMode === "PAKKA" && quantity > 1 && (
                  <div className="text-muted small">
                    
                  </div>
                )}
              </td>
              
              {/* CGST Column */}
              <td className="text-end align-middle">
                <div className="fw-medium">
                  {localOrderMode === "KACHA" ? "₹0.00" : `₹${totalCGSTAmount.toFixed(2)}`}
                </div>
                {localOrderMode === "PAKKA" && quantity > 1 && (
                  <div className="text-muted small">
                  
                  </div>
                )}
              </td>
              
              {/* SGST Column */}
              <td className="text-end align-middle">
                <div className="fw-medium">
                  {localOrderMode === "KACHA" ? "₹0.00" : `₹${totalSGSTAmount.toFixed(2)}`}
                </div>
                {localOrderMode === "PAKKA" && quantity > 1 && (
                  <div className="text-muted small">
                 
                  </div>
                )}
              </td>
              
              {/* Item Total Column */}
              <td className="text-end align-middle">
                <div className="fw-bold text-success">₹{itemTotal.toFixed(2)}</div>
                <div className="text-muted small">
                 
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="table-active">
   
        
        {/* Add Total GST Row */}
        <tr className='text-end'>
          <td colSpan={12} className="text-end fw-bold">
            Total GST:
          </td>
          <td className="text-end fw-bold text-success">
            ₹{adjustedGstBreakdown.totalGST}
          </td>
        
        </tr>
        
        {/* Add Grand Total Row */}
        <tr>
          <td colSpan={12} className="text-end fw-bold">
            Grand Total:
          </td>
          <td className="text-end fw-bold text-danger fs-5">
            ₹{adjustedTotals.grandTotal}
          </td>
      
        </tr>
      </tfoot>
    </table>
  </div>
</div>

      {/* Totals Section - unchanged */}
      <div className="totals-section mb-4">
        <Row>
          <Col md={7}>
            {/* Notes section remains the same */}
            <div className="notes-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-primary">Notes:</h6>
              </div>
              
              {isEditing ? (
                <div className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editableNote}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Enter note..."
                  />
                </div>
              ) : (
                <div className="bg-light p-3 rounded min-h-100" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
                  {invoiceData.note || 'No note added'}
                </div>
              )}
              
              <h6 className="text-primary mt-3">Transportation Details:</h6>
              <p className="bg-light p-2 rounded">
                {invoiceData.transportDetails}
              </p>
            </div>
          </Col>
          
          <Col md={5}>
            <div className="amount-breakdown bg-light p-3 rounded border">
              <h6 className="text-primary mb-1 border-bottom pb-2">Amount Summary</h6>
              
              <table className="amount-table w-100">
                <tbody>
            
                  
                  {/* 2. Discount (if any) */}
                  {/* <tr>
                    <td className="pb-1">
                      <span className="text-muted">Less: Discount:</span>
                    </td>
                    <td className="text-end pb-1">
                      <span className="text-muted">₹0.00</span>
                    </td>
                  </tr> */}
                  
                  {/* 3. Taxable Amount */}
                  <tr>
                    <td className="pb-2">
                      <strong>Taxable Amount:</strong>
                    </td>
                    <td className="text-end pb-2 pt-1">
                      <strong>₹{adjustedGstBreakdown.totalTaxableAmount}</strong>
                    </td>
                  </tr>
                  
                  {/* 4. GST Breakdown - only show for PAKKA */}
                  {localOrderMode === "PAKKA" && (
                    <>
                      {/* CGST */}
                      <tr>
                        <td className="pb-1">
                          <span className="text-muted">CGST:</span>
                        </td>
                        <td className="text-end pb-1">
                          <span className="text-muted">₹{adjustedGstBreakdown.totalCGST}</span>
                        </td>
                      </tr>
                      
                      {/* SGST */}
                      <tr>
                        <td className="pb-2">
                          <span className="text-muted">SGST:</span>
                        </td>
                        <td className="text-end pb-2">
                          <span className="text-muted">₹{adjustedGstBreakdown.totalSGST}</span>
                        </td>
                      </tr>
                      
                      {/* Total GST */}
                      <tr>
                        <td className="pb-2 pt-1">
                          <strong>Total GST:</strong>
                        </td>
                        <td className="text-end pb-2 pt-1">
                          <strong className="text-success">₹{adjustedGstBreakdown.totalGST}</strong>
                        </td>
                      </tr>
                    </>
                  )}
                  
                  {/* 5. Grand Total with clear separation */}
                  <tr className="border-top">
                    <td className="pt-3">
                      <strong className="fs-5">Grand Total:</strong>
                    </td>
                    <td className="text-end pt-3">
                      <strong className={`fs-5 ${localOrderMode === "KACHA" ? "text-primary" : "text-success"}`}>
                        ₹{adjustedTotals.grandTotal}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Footer - unchanged */}
      <div className="invoice-footer border-top pt-3">
        <Row>
          <Col md={6}>
            <div className="bank-details">
              <h6 className="text-primary">Bank Details:</h6>
              <div className="bg-light p-2 rounded">
                <p className="mb-1">Account Name: {invoiceData.companyInfo.name}</p>
                <p className="mb-1">Account Number: XXXX XXXX XXXX</p>
                <p className="mb-1">IFSC Code: XXXX0123456</p>
                <p className="mb-0">Bank Name: Sample Bank</p>
              </div>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <div className="signature-section">
              <p className="mb-2">For {invoiceData.companyInfo.name}</p>
              <div className="signature-space border-bottom mx-auto" style={{width: '200px', height: '40px'}}></div>
              <p className="mt-2">Authorized Signatory</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default InvoicePreview_preview;