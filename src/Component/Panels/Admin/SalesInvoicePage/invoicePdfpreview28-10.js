import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table, Alert, Card, ProgressBar, Modal, Badge } from 'react-bootstrap';
import './InvoicePDFPreview.css';
import { FaPrint, FaFilePdf, FaEdit, FaSave, FaTimes, FaArrowLeft, FaRupeeSign, FaCalendar, FaReceipt, FaRegFileAlt, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from 'html2pdf.js';
import { baseurl } from "../../../BaseURL/BaseURL";

const InvoicePDFPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptFormData, setReceiptFormData] = useState({
    receiptNumber: '',
    retailerId: '',
    amount: '',
    currency: 'INR',
    paymentMethod: 'Direct Deposit',
    receiptDate: new Date().toISOString().split('T')[0],
    note: '',
    bankName: '',
    transactionDate: '',
    reconciliationOption: 'Do Not Reconcile',
    retailerMobile: '',
    retailerEmail: '',
    retailerGstin: '',
    retailerBusinessName: '',
    invoiceNumber: ''
  });
  const [isCreatingReceipt, setIsCreatingReceipt] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchTransactionData();
  }, [id]);

  useEffect(() => {
    if (invoiceData && invoiceData.invoiceNumber) {
      fetchPaymentData(invoiceData.invoiceNumber);
    }
  }, [invoiceData]);

  const fetchPaymentData = async (invoiceNumber) => {
  try {
    setPaymentLoading(true);
    setPaymentError(null);
    
    console.log('Fetching payment data for invoice:', invoiceNumber);
    const response = await fetch(`${baseurl}/invoices/${invoiceNumber}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Payment API result:", result);
    
    if (result.success && result.data) {
      // Transform the API data to match the expected format
      const transformedData = transformPaymentData(result.data);
      setPaymentData(transformedData);
    } else {
      throw new Error(result.message || 'No payment data received');
    }
  } catch (error) {
    console.error('Error fetching payment data:', error);
    setPaymentError(error.message);
    // Create fallback payment data from invoice data
    if (invoiceData) {
      const fallbackPaymentData = {
        invoice: {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          totalAmount: parseFloat(invoiceData.grandTotal) || 0,
          overdueDays: 0
        },
        receipts: [],
        summary: {
          totalPaid: 0,
          balanceDue: parseFloat(invoiceData.grandTotal) || 0,
          status: 'Pending'
        }
      };
      setPaymentData(fallbackPaymentData);
    }
  } finally {
    setPaymentLoading(false);
  }
};

// Add this transformation function
const transformPaymentData = (apiData) => {
  const salesEntry = apiData.sales;
  const receiptEntries = apiData.receipts || [];
  
  // Calculate totals
  const totalAmount = parseFloat(salesEntry.TotalAmount) || 0;
  const totalPaid = receiptEntries.reduce((sum, receipt) => {
    return sum + parseFloat(receipt.paid_amount || 0);
  }, 0);
  
  const balanceDue = totalAmount - totalPaid;
  
  // Calculate overdue days
  const invoiceDate = new Date(salesEntry.Date);
  const today = new Date();
  const overdueDays = Math.max(0, Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24)));
  
  // Transform receipts
  const receipts = receiptEntries.map(receipt => ({
    receiptNumber: receipt.receipt_number,
    paidAmount: parseFloat(receipt.paid_amount || 0),
    paidDate: receipt.paid_date,
    status: receipt.status
  }));
  
  // Determine overall status
  let status = 'Pending';
  if (balanceDue === 0) {
    status = 'Paid';
  } else if (totalPaid > 0) {
    status = 'Partial';
  }
  
  return {
    invoice: {
      invoiceNumber: salesEntry.InvoiceNumber,
      invoiceDate: salesEntry.Date,
      totalAmount: totalAmount,
      overdueDays: overdueDays
    },
    receipts: receipts,
    summary: {
      totalPaid: totalPaid,
      balanceDue: balanceDue,
      status: status
    }
  };
};

  const fetchNextReceiptNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/api/next-receipt-number`);
      if (response.ok) {
        const data = await response.json();
        setReceiptFormData(prev => ({
          ...prev,
          receiptNumber: data.nextReceiptNumber
        }));
      } else {
        await generateFallbackReceiptNumber();
      }
    } catch (err) {
      console.error('Error fetching next receipt number:', err);
      await generateFallbackReceiptNumber();
    }
  };

  const generateFallbackReceiptNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/api/last-receipt`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastReceiptNumber) {
          const lastNumber = data.lastReceiptNumber;
          const numberMatch = lastNumber.match(/REC(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1], 10) + 1;
            const fallbackReceiptNumber = `REC${nextNum.toString().padStart(3, '0')}`;
            setReceiptFormData(prev => ({
              ...prev,
              receiptNumber: fallbackReceiptNumber
            }));
            return;
          }
        }
      }
      setReceiptFormData(prev => ({
        ...prev,
        receiptNumber: 'REC001'
      }));
    } catch (err) {
      setReceiptFormData(prev => ({
        ...prev,
        receiptNumber: 'REC001'
      }));
    }
  };

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching transaction data for ID:', id);
      const apiUrl = `${baseurl}/transactions/${id}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiData = result.data;
        const transformedData = transformApiDataToInvoiceFormat(apiData);
        setInvoiceData(transformedData);
        setEditedData(transformedData);
      } else if (result.VoucherID) {
        const transformedData = transformApiDataToInvoiceFormat(result);
        setInvoiceData(transformedData);
        setEditedData(transformedData);
      } else {
        throw new Error(result.message || 'No valid data received from API');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError(`API Error: ${error.message}`);
      
      const savedData = localStorage.getItem('previewInvoice');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setInvoiceData(data);
          setEditedData(data);
          setError(null);
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const transformApiDataToInvoiceFormat = (apiData) => {
    console.log('Transforming API data:', apiData);
    
    let batchDetails = [];
    try {
      if (apiData.batch_details && typeof apiData.batch_details === 'string') {
        batchDetails = JSON.parse(apiData.batch_details);
      } else if (Array.isArray(apiData.batch_details)) {
        batchDetails = apiData.batch_details;
      } else if (apiData.BatchDetails && typeof apiData.BatchDetails === 'string') {
        batchDetails = JSON.parse(apiData.BatchDetails);
      }
    } catch (error) {
      console.error('Error parsing batch details:', error);
    }

    const items = batchDetails.map((batch, index) => ({
      id: index + 1,
      product: batch.product || 'Product',
      description: `Batch: ${batch.batch}`,
      quantity: parseFloat(batch.quantity) || 0,
      price: parseFloat(batch.price) || 0,
      discount: 0,
      gst: parseFloat(apiData.IGSTPercentage) || 0,
      cgst: parseFloat(apiData.CGSTPercentage) || 0,
      sgst: parseFloat(apiData.SGSTPercentage) || 0,
      igst: parseFloat(apiData.IGSTPercentage) || 0,
      total: (parseFloat(batch.quantity) * parseFloat(batch.price)).toFixed(2)
    })) || [];

    const taxableAmount = parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
    const totalGST = parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
    const grandTotal = parseFloat(apiData.TotalAmount) || 0;

    return {
      invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      
      supplierInfo: {
        name: apiData.PartyName || 'Customer',
        businessName: apiData.AccountName || 'Business',
        gstin: apiData.gstin || '',
        state: apiData.billing_state || apiData.BillingState || '',
        id: apiData.PartyID || null
      },
      
      billingAddress: {
        addressLine1: apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.billing_address_line2 || '',
        city: apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.billing_state || apiData.BillingState || ''
      },
      
      shippingAddress: {
        addressLine1: apiData.shipping_address_line1 || apiData.ShippingAddress || apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.shipping_address_line2 || apiData.billing_address_line2 || '',
        city: apiData.shipping_city || apiData.ShippingCity || apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.shipping_pin_code || apiData.ShippingPincode || apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.shipping_state || apiData.ShippingState || apiData.billing_state || apiData.BillingState || ''
      },
      
      items: items.length > 0 ? items : [{
        id: 1,
        product: 'Product',
        description: 'No batch details available',
        quantity: 1,
        price: grandTotal,
        discount: 0,
        gst: parseFloat(apiData.IGSTPercentage) || 0,
        cgst: parseFloat(apiData.CGSTPercentage) || 0,
        sgst: parseFloat(apiData.SGSTPercentage) || 0,
        igst: parseFloat(apiData.IGSTPercentage) || 0,
        total: grandTotal.toFixed(2)
      }],
      
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      totalCess: "0.00",
      
      note: "Thank you for your business!",
      transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
      additionalCharge: "",
      additionalChargeAmount: "0.00",
      
      totalCGST: parseFloat(apiData.CGSTAmount) || 0,
      totalSGST: parseFloat(apiData.SGSTAmount) || 0,
      totalIGST: parseFloat(apiData.IGSTAmount) || 0,
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST"
    };
  };

  // Payment Status Component
// Payment Status Component
const PaymentStatus = () => {
  if (paymentLoading) {
    return (
      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaReceipt className="me-2" />
            Payment Status
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading payment status...
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!paymentData) {
    return (
      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaReceipt className="me-2" />
            Payment Status
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted">
            <FaExclamationTriangle className="mb-2" />
            <p>No payment data available</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const { invoice, receipts, summary } = paymentData;
  const progressPercentage = invoice.totalAmount > 0 ? (summary.totalPaid / invoice.totalAmount) * 100 : 0;

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaReceipt className="me-2" />
          Payment Status
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Status Badge */}
        <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
          <span className="fw-bold">Status:</span>
          <Badge bg={
            summary.status === 'Paid' ? 'success' :
            summary.status === 'Partial' ? 'warning' : 'danger'
          }>
            {summary.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        {/* <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small>Payment Progress</small>
            <small>{progressPercentage.toFixed(1)}%</small>
          </div>
          <ProgressBar 
            variant={
              summary.status === 'Paid' ? 'success' :
              summary.status === 'Partial' ? 'warning' : 'danger'
            }
            now={progressPercentage}
          />
        </div> */}

        {/* Amount Summary */}
        <div className="payment-amounts mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              <FaRupeeSign className="me-1" />
              Invoiced:
            </span>
            <span className="fw-bold text-primary">
              ₹{invoice.totalAmount.toFixed(2)}
              <small className="text-muted ms-1">
                (On {new Date(invoice.invoiceDate).toLocaleDateString()})
              </small>
            </span>
          </div>

          {/* Receipt-wise Payments */}
          {receipts.map((receipt, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-2 ps-3 border-start border-success">
              <span className="text-success">
                <FaCheckCircle className="me-1" />
                Paid:
              </span>
              <span className="fw-bold text-success">
                ₹{receipt.paidAmount.toFixed(2)}
                <small className="text-muted ms-1">
                  (On {new Date(receipt.paidDate).toLocaleDateString()}) – {receipt.receiptNumber}
                </small>
              </span>
            </div>
          ))}

          {/* Balance Due */}
          <div className="d-flex justify-content-between align-items-center mb-2 pt-2 border-top">
            <span className="text-danger">
              <FaExclamationTriangle className="me-1" />
              Balance Due:
            </span>
            <span className="fw-bold text-danger">
              ₹{summary.balanceDue.toFixed(2)}
              {summary.balanceDue > 0 && invoice.overdueDays > 0 && (
                <small className="text-danger ms-1">
                  (Overdue {invoice.overdueDays} day{invoice.overdueDays !== 1 ? 's' : ''})
                </small>
              )}
            </span>
          </div>
        </div>

        {/* Create Receipt Button */}
        {/* {summary.balanceDue > 0 && (
          <Button 
            variant="success" 
            size="sm" 
            className="w-100"
            onClick={handleOpenReceiptModal}
          >
            <FaRegFileAlt className="me-1" />
            Create Receipt
          </Button>
        )} */}
      </Card.Body>
    </Card>
  );
};

  // Rest of the component remains the same (handlePrint, handleDownloadPDF, etc.)
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      alert("Invoice content not found. Please try again.");
      return;
    }

    try {
      setDownloading(true);
      
      const element = invoiceRef.current;
      const filename = `Invoice_${displayInvoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      const clone = element.cloneNode(true);
      
      const nonPrintableElements = clone.querySelectorAll(
        '.d-print-none, .btn, .alert, .action-bar, .tax-indicator, .no-print, .edit-control, .payment-sidebar'
      );
      nonPrintableElements.forEach(el => el.remove());
      
      const hiddenElements = clone.querySelectorAll('[style*="display: none"], .d-none');
      hiddenElements.forEach(el => {
        el.style.display = 'block';
      });

      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      await html2pdf().set(opt).from(clone).save();
      setDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      handlePrintFallback();
    }
  };

  const handlePrintFallback = () => {
    window.print();
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      setInvoiceData(editedData);
      localStorage.setItem('previewInvoice', JSON.stringify(editedData));
    }
    setIsEditMode(!isEditMode);
  };

  const handleCancelEdit = () => {
    setEditedData(invoiceData);
    setIsEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    const item = newItems[index];
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const gst = parseFloat(item.gst) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const total = amountAfterDiscount + gstAmount;
    
    newItems[index].total = total.toFixed(2);
    
    setEditedData(prev => ({
      ...prev,
      items: newItems
    }));
    
    recalculateTotals(newItems);
  };

  const recalculateTotals = (items) => {
    const taxableAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      return sum + (subtotal - discountAmount);
    }, 0);
    
    const totalGST = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      
      return sum + gstAmount;
    }, 0);
    
    const additionalChargeAmount = parseFloat(editedData.additionalChargeAmount) || 0;
    const grandTotal = taxableAmount + totalGST + additionalChargeAmount;
    
    setEditedData(prev => ({
      ...prev,
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }));
  };

  const calculateGSTBreakdown = () => {
    if (!currentData || !currentData.items) return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };
    
    const totalCGST = currentData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const cgstRate = parseFloat(item.cgst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const cgstAmount = amountAfterDiscount * (cgstRate / 100);
      
      return sum + cgstAmount;
    }, 0);
    
    const totalSGST = currentData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const sgstRate = parseFloat(item.sgst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const sgstAmount = amountAfterDiscount * (sgstRate / 100);
      
      return sum + sgstAmount;
    }, 0);
    
    const totalIGST = currentData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const igstRate = parseFloat(item.igst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const igstAmount = amountAfterDiscount * (igstRate / 100);
      
      return sum + igstAmount;
    }, 0);
    
    return {
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2)
    };
  };

  const handleOpenReceiptModal = () => {
    if (!invoiceData) return;
    
    const balanceDue = paymentData ? paymentData.summary.balanceDue : parseFloat(invoiceData.grandTotal);
    
    setReceiptFormData(prev => ({
      ...prev,
      retailerBusinessName: invoiceData.supplierInfo.businessName,
      retailerId: invoiceData.supplierInfo.id || '',
      amount: balanceDue,
      invoiceNumber: invoiceData.invoiceNumber
    }));
    
    fetchNextReceiptNumber();
    setShowReceiptModal(true);
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setIsCreatingReceipt(false);
  };

  const handleReceiptInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateReceiptFromInvoice = async () => {
    if (!receiptFormData.amount || parseFloat(receiptFormData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setIsCreatingReceipt(true);

      const receiptPayload = {
        receipt_number: receiptFormData.receiptNumber,
        retailer_id: receiptFormData.retailerId,
        retailer_name: receiptFormData.retailerBusinessName,
        amount: parseFloat(receiptFormData.amount),
        currency: receiptFormData.currency,
        payment_method: receiptFormData.paymentMethod,
        receipt_date: receiptFormData.receiptDate,
        note: receiptFormData.note,
        bank_name: receiptFormData.bankName,
        transaction_date: receiptFormData.transactionDate || null,
        reconciliation_option: receiptFormData.reconciliationOption,
        invoice_number: receiptFormData.invoiceNumber,
        retailer_mobile: receiptFormData.retailerMobile,
        retailer_email: receiptFormData.retailerEmail,
        retailer_gstin: receiptFormData.retailerGstin,
        retailer_business_name: receiptFormData.retailerBusinessName,
        from_invoice: true
      };

      console.log('Creating receipt from invoice:', receiptPayload);

      const response = await fetch(`${baseurl}/api/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Receipt created successfully:', result);
        handleCloseReceiptModal();
        alert('Receipt created successfully!');
        
        // Refresh payment data
        if (invoiceData && invoiceData.invoiceNumber) {
          fetchPaymentData(invoiceData.invoiceNumber);
        }
        
        if (result.id) {
          navigate(`/receipts_view/${result.id}`);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to create receipt:', errorText);
        let errorMessage = 'Failed to create receipt. ';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += errorData.error || 'Please try again.';
        } catch {
          errorMessage += 'Please try again.';
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error creating receipt:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsCreatingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="invoice-preview-page">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  if (error && !invoiceData) {
    return (
      <div className="invoice-preview-page">
        <Container>
          <div className="text-center p-5">
            <Alert variant="danger">
              <h5>Error Loading Invoice</h5>
              <p>{error}</p>
              <div className="mt-3">
                <Button variant="primary" onClick={fetchTransactionData} className="me-2">
                  Try Again
                </Button>
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  const currentData = isEditMode ? editedData : invoiceData;
  const gstBreakdown = calculateGSTBreakdown();
  const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;
  const displayInvoiceNumber = currentData.invoiceNumber || 'INV001';

  return (
    <div className="invoice-preview-page">
      {/* Action Bar */}
      <div className="action-bar bg-white shadow-sm p-3 mb-3 sticky-top d-print-none no-print">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Invoice Preview - {displayInvoiceNumber}</h4>
            <div>
              {!isEditMode ? (
                <>
                 <Button
                                    variant="info"
                                    className="me-2 text-white"
                                    onClick={handleOpenReceiptModal}
                                  >
                                    <FaRegFileAlt className="me-1" /> Create Receipt
                                  </Button>
                  <Button variant="warning" onClick={handleEditToggle} className="me-2">
                    <FaEdit className="me-1" /> Edit Invoice
                  </Button>
                  <Button variant="success" onClick={handlePrint} className="me-2">
                    <FaPrint className="me-1" /> Print
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDownloadPDF} 
                    className="me-2"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="me-1" /> Download PDF
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={() => window.history.back()}>
                    <FaArrowLeft className="me-1" /> Go Back
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="success" onClick={handleEditToggle} className="me-2">
                    <FaSave className="me-1" /> Save Changes
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    <FaTimes className="me-1" /> Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Error Alert */}
      {error && invoiceData && (
        <div className="d-print-none no-print">
          <Container fluid>
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>Using Local Data</Alert.Heading>
              <p className="mb-0">{error}</p>
              <Button variant="outline-warning" size="sm" onClick={fetchTransactionData} className="mt-2">
                Retry API Connection
              </Button>
            </Alert>
          </Container>
        </div>
      )}

      
      <Modal show={showReceiptModal} onHide={handleCloseReceiptModal} size="lg">
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
                  onChange={handleReceiptInputChange}
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
                  onChange={handleReceiptInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  name="paymentMethod"
                  value={receiptFormData.paymentMethod}
                  onChange={handleReceiptInputChange}
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
                    onChange={handleReceiptInputChange}
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
                    onChange={handleReceiptInputChange}
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
                  onChange={handleReceiptInputChange}
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
                  onChange={handleReceiptInputChange}
                  placeholder="Bank Name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Transaction Proof Document</label>
                <input type="file" className="form-control" />
                <small className="text-muted">No file chosen</small>
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
                  onChange={handleReceiptInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Reconciliation Option</label>
                <select
                  className="form-select"
                  name="reconciliationOption"
                  value={receiptFormData.reconciliationOption}
                  onChange={handleReceiptInputChange}
                >
                  <option>Do Not Reconcile</option>
                  <option>Customer Reconcile</option>
                </select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReceiptModal}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateReceiptFromInvoice}
            disabled={isCreatingReceipt}
          >
            {isCreatingReceipt ? 'Creating...' : 'Create Receipt'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Content */}
      <Container fluid className="invoice-preview-container">
        <Row>
          {/* Invoice Content */}
          <Col lg={8}>
            <div 
              className="invoice-pdf-preview bg-white p-4 shadow-sm" 
              id="invoice-pdf-content"
              ref={invoiceRef}
            >
              {/* Header */}
              <div className="invoice-header border-bottom pb-3 mb-3">
                <Row>
                  <Col md={8}>
                    {isEditMode ? (
                      <div className="edit-control">
                        <Form.Control 
                          className="mb-2 fw-bold fs-4"
                          value={currentData.companyInfo.name}
                          onChange={(e) => handleNestedChange('companyInfo', 'name', e.target.value)}
                        />
                        <Form.Control 
                          className="mb-2"
                          value={currentData.companyInfo.address}
                          onChange={(e) => handleNestedChange('companyInfo', 'address', e.target.value)}
                        />
                        <Form.Control 
                          className="mb-1"
                          placeholder="Email"
                          value={currentData.companyInfo.email}
                          onChange={(e) => handleNestedChange('companyInfo', 'email', e.target.value)}
                        />
                        <Form.Control 
                          className="mb-1"
                          placeholder="Phone"
                          value={currentData.companyInfo.phone}
                          onChange={(e) => handleNestedChange('companyInfo', 'phone', e.target.value)}
                        />
                        <Form.Control 
                          placeholder="GSTIN"
                          value={currentData.companyInfo.gstin}
                          onChange={(e) => handleNestedChange('companyInfo', 'gstin', e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="company-name text-primary mb-1">{currentData.companyInfo.name}</h2>
                        <p className="company-address text-muted mb-1">{currentData.companyInfo.address}</p>
                        <p className="company-contact text-muted small mb-0">
                          Email: {currentData.companyInfo.email} | 
                          Phone: {currentData.companyInfo.phone} | 
                          GSTIN: {currentData.companyInfo.gstin}
                        </p>
                      </>
                    )}
                  </Col>
                  <Col md={4} className="text-end">
                    <h3 className="invoice-title text-danger mb-2">TAX INVOICE</h3>
                    <div className="invoice-meta bg-light p-2 rounded">
                      {isEditMode ? (
                        <div className="edit-control">
                          <div className="mb-1">
                            <strong>Invoice No:</strong>
                            <Form.Control 
                              size="sm"
                              value={displayInvoiceNumber}
                              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                            />
                          </div>
                          <div className="mb-1">
                            <strong>Invoice Date:</strong>
                            <Form.Control 
                              type="date"
                              size="sm"
                              value={currentData.invoiceDate}
                              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                            />
                          </div>
                          <div className="mb-0">
                            <strong>Due Date:</strong>
                            <Form.Control 
                              type="date"
                              size="sm"
                              value={currentData.validityDate}
                              onChange={(e) => handleInputChange('validityDate', e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mb-1"><strong>Invoice No:</strong> {displayInvoiceNumber}</p>
                          <p className="mb-1"><strong>Invoice Date:</strong> {new Date(currentData.invoiceDate).toLocaleDateString()}</p>
                          <p className="mb-0"><strong>Due Date:</strong> {new Date(currentData.validityDate).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Customer and Address Details */}
              <div className="address-section mb-4">
                <Row>
                  <Col md={6}>
                    <div className="billing-address bg-light p-3 rounded">
                      <h5 className="text-primary mb-2">Bill To:</h5>
                      {isEditMode ? (
                        <div className="edit-control">
                          <Form.Control 
                            className="mb-2"
                            value={currentData.supplierInfo.name}
                            onChange={(e) => handleNestedChange('supplierInfo', 'name', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            value={currentData.supplierInfo.businessName}
                            onChange={(e) => handleNestedChange('supplierInfo', 'businessName', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="GSTIN"
                            value={currentData.supplierInfo.gstin || ''}
                            onChange={(e) => handleNestedChange('supplierInfo', 'gstin', e.target.value)}
                          />
                          <Form.Control 
                            placeholder="State"
                            value={currentData.supplierInfo.state || ''}
                            onChange={(e) => handleNestedChange('supplierInfo', 'state', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="mb-1"><strong>{currentData.supplierInfo.name}</strong></p>
                          <p className="mb-1 text-muted">{currentData.supplierInfo.businessName}</p>
                          <p className="mb-1"><small>GSTIN: {currentData.supplierInfo.gstin || 'N/A'}</small></p>
                          <p className="mb-0"><small>State: {currentData.supplierInfo.state || 'N/A'}</small></p>
                        </>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="shipping-address bg-light p-3 rounded">
                      <h5 className="text-primary mb-2">Ship To:</h5>
                      {isEditMode ? (
                        <div className="edit-control">
                          <Form.Control 
                            className="mb-2"
                            placeholder="Address Line 1"
                            value={currentData.shippingAddress.addressLine1 || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'addressLine1', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="Address Line 2"
                            value={currentData.shippingAddress.addressLine2 || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'addressLine2', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="City"
                            value={currentData.shippingAddress.city || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'city', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="Pincode"
                            value={currentData.shippingAddress.pincode || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'pincode', e.target.value)}
                          />
                          <Form.Control 
                            placeholder="State"
                            value={currentData.shippingAddress.state || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'state', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="mb-1">{currentData.shippingAddress.addressLine1 || 'N/A'}</p>
                          <p className="mb-1">{currentData.shippingAddress.addressLine2 || ''}</p>
                          <p className="mb-1">{currentData.shippingAddress.city || ''} - {currentData.shippingAddress.pincode || ''}</p>
                          <p className="mb-0">{currentData.shippingAddress.state || ''}</p>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Items Table */}
              <div className="items-section mb-4">
                <h6 className="text-primary mb-2">Items Details</h6>
                {isEditMode ? (
                  <Table bordered responsive size="sm" className="edit-control">
                    <thead className="table-dark">
                      <tr>
                        <th width="5%">#</th>
                        <th width="25%">Product</th>
                        <th width="20%">Description</th>
                        <th width="10%">Qty</th>
                        <th width="15%">Price</th>
                        <th width="10%">GST %</th>
                        <th width="15%">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <Form.Control 
                              size="sm"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              size="sm"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.gst}
                              onChange={(e) => handleItemChange(index, 'gst', e.target.value)}
                            />
                          </td>
                          <td className="text-end">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <table className="items-table table table-bordered table-sm">
                    <thead className="table-dark">
                      <tr>
                        <th width="5%">#</th>
                        <th width="25%">Product</th>
                        <th width="25%">Description</th>
                        <th width="10%">Qty</th>
                        <th width="15%">Price</th>
                        <th width="10%">GST %</th>
                        <th width="10%">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.product}</td>
                          <td>{item.description}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">₹{parseFloat(item.price).toFixed(2)}</td>
                          <td className="text-center">{item.gst}%</td>
                          <td className="text-end fw-bold">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Totals Section */}
              <div className="totals-section mb-4">
                <Row>
                  <Col md={7}>
                    <div className="notes-section">
                      <h6 className="text-primary">Notes:</h6>
                      {isEditMode ? (
                        <Form.Control 
                          as="textarea"
                          rows={3}
                          value={currentData.note || ''}
                          onChange={(e) => handleInputChange('note', e.target.value)}
                          className="edit-control"
                        />
                      ) : (
                        <p className="bg-light p-2 rounded min-h-100">
                          {currentData.note}
                        </p>
                      )}
                      
                      <h6 className="text-primary mt-3">Transportation Details:</h6>
                      {isEditMode ? (
                        <Form.Control 
                          as="textarea"
                          rows={2}
                          value={currentData.transportDetails || ''}
                          onChange={(e) => handleInputChange('transportDetails', e.target.value)}
                          className="edit-control"
                        />
                      ) : (
                        <p className="bg-light p-2 rounded">
                          {currentData.transportDetails}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col md={5}>
                    <div className="amount-breakdown bg-light p-3 rounded">
                      <h6 className="text-primary mb-3">Amount Summary</h6>
                      <table className="amount-table w-100">
                        <tbody>
                          <tr>
                            <td className="pb-2">Taxable Amount:</td>
                            <td className="text-end pb-2">₹{currentData.taxableAmount}</td>
                          </tr>
                          
                          {isSameState ? (
                            <>
                              <tr>
                                <td className="pb-2">CGST:</td>
                                <td className="text-end pb-2">₹{gstBreakdown.totalCGST}</td>
                              </tr>
                              <tr>
                                <td className="pb-2">SGST:</td>
                                <td className="text-end pb-2">₹{gstBreakdown.totalSGST}</td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td className="pb-2">IGST:</td>
                              <td className="text-end pb-2">₹{gstBreakdown.totalIGST}</td>
                            </tr>
                          )}
                          
                          <tr>
                            <td className="pb-2">Total GST:</td>
                            <td className="text-end pb-2">₹{currentData.totalGST}</td>
                          </tr>
                          
                          <tr className="grand-total border-top pt-2">
                            <td><strong>Grand Total:</strong></td>
                            <td className="text-end"><strong className="text-success">₹{currentData.grandTotal}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Footer */}
              <div className="invoice-footer border-top pt-3">
                <Row>
                  <Col md={6}>
                    <div className="bank-details">
                      <h6 className="text-primary">Bank Details:</h6>
                      <div className="bg-light p-2 rounded">
                        <p className="mb-1">Account Name: {currentData.companyInfo.name}</p>
                        <p className="mb-1">Account Number: XXXX XXXX XXXX</p>
                        <p className="mb-1">IFSC Code: XXXX0123456</p>
                        <p className="mb-0">Bank Name: Sample Bank</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <div className="signature-section">
                      <p className="mb-2">For {currentData.companyInfo.name}</p>
                      <div className="signature-space border-bottom mx-auto" style={{width: '200px', height: '40px'}}></div>
                      <p className="mt-2">Authorized Signatory</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>

          {/* Payment Sidebar */}
          <Col lg={4} className="d-print-none no-print">
            <PaymentStatus />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InvoicePDFPreview;