
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table, Alert, Card, ProgressBar, Modal, Badge } from 'react-bootstrap';
import './InvoicePDFPreview.css';
import { FaPrint, FaFilePdf, FaEdit, FaSave, FaTimes, FaArrowLeft, FaRupeeSign, FaCalendar, FaReceipt, FaRegFileAlt, FaExclamationTriangle, FaCheckCircle, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";
import QRCodeGenerator_normal from '../SalesInvoicePage/QRCodeGenerator_normal';

const KachaPurchaseInvoicePDFPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [unitData, setUnitData] = useState({});
const [loadingUnits, setLoadingUnits] = useState(false);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
const [qrAmount, setQrAmount] = useState(null);
const [showAllPayments, setShowAllPayments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptFormData, setReceiptFormData] = useState({
    receiptNumber: '',
    retailerId: '',
    amount: '',
    currency: 'INR',
    paymentMethod: 'Cash',
    receiptDate: new Date().toISOString().split('T')[0],
    note: '',
    bankName: '',
    transactionDate: '',
    reconciliationOption: 'Do Not Reconcile',
    retailerMobile: '',
    retailerEmail: '',
    retailerGstin: '',
    retailerName: '',
    invoiceNumber: '',
    transactionProofFile: null,
      product_id: '', 
  batch_id: '' ,
   TransactionType: 'purchase voucher' ,
     data_type: 'stock inward' ,
     account_name: '',
  business_name: '',

  });
  const [isCreatingReceipt, setIsCreatingReceipt] = useState(false);
  const invoiceRef = useRef(null);

  const isInvoiceEditable = (paymentData) => {
  // For Stock Inward - check if there are any purchase vouchers or debit notes
  const hasVouchers = paymentData?.purchasevoucher?.length > 0;
  const hasDebitNotes = paymentData?.debitNotes?.length > 0;
  return !(hasVouchers || hasDebitNotes);
};

  const handleEditInvoice = () => {
      if (!isInvoiceEditable(paymentData)) {
    alert('Cannot edit invoice: This invoice has purchase vouchers/debit notes');
    return;
  }
    if (invoiceData && invoiceData.voucherId) {
      navigate(`/kachapurchaseedit/${invoiceData.voucherId}`);
    } else {
      setError('Cannot edit invoice: Voucher ID not found');
      setTimeout(() => setError(null), 3000);
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }
      
      setReceiptFormData(prev => ({
        ...prev,
        transactionProofFile: file
      }));
    }
  };

useEffect(() => {
  if (!id) {
    console.error("❌ No ID found in URL");
    return;
  }
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
      
      if ( result.data) {
        const transformedData = transformPaymentData(result.data);
        console.log("data",transformedData)
        setPaymentData(transformedData);
      } else {
        throw new Error(result.message || 'No payment data received');
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setPaymentError(error.message);
      if (invoiceData) {
        const fallbackPaymentData = {
          invoice: {
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceDate: invoiceData.invoiceDate,
            totalAmount: parseFloat(invoiceData.grandTotal) || 0,
            overdueDays: 0
          },
          receipts: [],
          purchasevoucher:[],
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

const transformPaymentData = (apiData) => {
  console.log("🔍 Raw Payment API:", apiData);

  const purchase = apiData.purchases?.[0] || {};

  const totalAmount = invoiceData 
    ? parseFloat(invoiceData.grandTotal) || 0 
    : Number(purchase.TotalAmount || purchase.grandTotal || 0);
  

  const allEntries = apiData.allEntries || [];

  const debitNotes = allEntries.filter(entry => 
    entry.TransactionType === 'DebitNote'
  );
  
  const purchasevoucherEntries = apiData.purchasevoucher || [];

  let totalPaid = purchasevoucherEntries.reduce((sum, v) => {
    return sum + Number(v.paid_amount || 0);
  }, 0);

  totalPaid += debitNotes.reduce((sum, d) => {
    return sum + Number(d.TotalAmount || d.paid_amount || 0);
  }, 0);

  const balanceDue = totalAmount - totalPaid;
  const invoiceDate = purchase.Date || purchase.invoiceDate;
  const overdueDays = invoiceDate
    ? Math.floor((new Date() - new Date(invoiceDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const purchasevoucher = purchasevoucherEntries.map(v => ({
    receiptNumber: v.VchNo || v.receipt_number || `VCH${v.VoucherID}`,
    paidAmount: Number(v.paid_amount || 0),
    totalAmount: Number(v.TotalAmount || 0),
    paidDate: v.Date || v.paid_date,
    status: v.status || 'Paid',
    voucherId: v.VoucherID,
    type: 'Purchase Voucher'
  }));

  const debitNotesList = debitNotes.map(d => ({
    receiptNumber: d.VchNo || `DEBIT${d.VoucherID}`,
    paidAmount: Number(d.TotalAmount || d.paid_amount || 0),
    totalAmount: Number(d.TotalAmount || 0),
    paidDate: d.Date || d.paid_date,
    status: d.status || 'Debit',
    voucherId: d.VoucherID,
    type: 'Debit Note'
  }));

  const allPaymentEntries = [...purchasevoucher, ...debitNotesList];

  let status = 'Pending';
  if (balanceDue <= 0) status = 'Paid';
  else if (totalPaid > 0) status = 'Partial';

  return {
    invoice: {
      invoiceNumber: purchase.InvoiceNumber || purchase.invoiceNumber || invoiceData?.invoiceNumber || 'N/A',
      invoiceDate: invoiceDate || invoiceData?.invoiceDate || new Date().toISOString().split('T')[0],
      totalAmount: totalAmount,
      grandTotal: totalAmount, 
      overdueDays: overdueDays
    },
    purchasevoucher: purchasevoucher,
    debitNotes: debitNotesList,
    allPayments: allPaymentEntries,
    summary: {
      totalPaid,
      balanceDue,
      status,
      invoiceGrandTotal: totalAmount 
    }
  };
};

const fetchUnitName = async (unitId) => {
  if (!unitId || unitId === 'null' || unitId === null) return;
  if (unitData[unitId]) return; // Already fetched
  
  try {
    const res = await fetch(`${baseurl}/units/${unitId}`);
    const data = await res.json();
    setUnitData(prev => ({ ...prev, [unitId]: data.name }));
  } catch (err) {
    console.error("Failed to fetch unit:", err);
  }
};
useEffect(() => {
  if (invoiceData?.items && invoiceData.items.length > 0) {
    invoiceData.items.forEach(item => {
      if (item.unit_id && item.unit_id !== 'null' && item.unit_id !== null) {
        fetchUnitName(item.unit_id);
      }
    });
  }
}, [invoiceData]);

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
        }
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

  const items = batchDetails.map((batch, index) => {
    const quantity = parseFloat(batch.quantity) || 0;
    const price = parseFloat(batch.price) || 0;
    const discount = parseFloat(batch.discount) || 0;
    const gst = parseFloat(batch.gst) || 0;
    const cess = parseFloat(batch.cess) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const cessAmount = amountAfterDiscount * (cess / 100);
    const total = amountAfterDiscount + gstAmount + cessAmount;

    const isSameState = parseFloat(apiData.IGSTAmount) === 0;
    let cgst, sgst, igst;
    
    if (isSameState) {
      cgst = gst / 2;
      sgst = gst / 2;
      igst = 0;
    } else {
      cgst = 0;
      sgst = 0;
      igst = gst;
    }

    return {
      id: index + 1,
      product: batch.product || 'Product',
      description: batch.description || `Batch: ${batch.batch}`,
      hsn_code: batch.hsn_code || apiData.hsn_code || '',
      quantity: quantity,
      price: price,
      discount: discount,
      gst: gst,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      cess: cess,
      total: total.toFixed(2),
      batch: batch.batch || '',
      batch_id: batch.batch_id || '',
      product_id: batch.product_id || '',
       unit_id: batch.unit_id || null,     
    unit_name: batch.unit_name || ''    
    };
  }) || [];

  const taxableAmount = parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
  const totalGST = parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
  const grandTotal = parseFloat(apiData.TotalAmount) || 0;
          const roundOff = parseFloat(apiData.round_off) || 0;

 const transportDetails = {
    transport: apiData.transport_name || apiData.transport || '',
    grNumber: apiData.gr_rr_number || apiData.grNumber || '',
    vehicleNo: apiData.vehicle_number || apiData.vehicleNo ||  '',
    station: apiData.station_name || apiData.station || ''
  };
  // Get mobile number from multiple possible sources
  const mobileNumber = apiData.mobile_number || 
                       apiData.retailer_mobile || 
                       apiData.phone_number || 
                       apiData.supplier_mobile || 
                       '';

  console.log('Mobile number found:', mobileNumber);

  return {
    voucherId: apiData.VoucherID,
    invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
    invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    
    companyInfo: {
      name: "SHREE SHASHWATRAJ AGRO PVT LTD",
      address: "Growth Center, Jasoiya, Aurangabad, Bihar, 824101",
      email: "spmathur56@gmail.com",
      phone: "9801049700",
      gstin: "10AAOCS1541B1ZZ",
      state: "Bihar",
      stateCode: "10"
    },
    
    supplierInfo: {
      name: apiData.PartyName || 'Customer',
      businessName: apiData.business_name || 'Business',
      business_name: apiData.business_name || apiData.businessName || '',
      account_name: apiData.account_name || apiData.AccountName || '',
      gstin: apiData.gstin || '',
      state: apiData.billing_state || apiData.BillingState || '',
      id: apiData.PartyID || null,
      // ✅ Add mobile number with fallbacks
      mobile_number: mobileNumber,
      phone_number: apiData.phone_number || mobileNumber
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
      cess: 0,
      total: grandTotal.toFixed(2),
      batch: '',
      batch_id: '',
      product_id: ''
    }],
    
    taxableAmount: taxableAmount.toFixed(2),
    totalGST: totalGST.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    totalCess: "0.00",
    
    note: apiData.Notes || "Thank you for your business!",
              transportDetails: transportDetails,
 discount_charges: apiData.discount_charges || null,
  discount_charges_amount: parseFloat(apiData.discount_charges_amount) || 0,
  additionalCharge: apiData.additional_charges_type || "",
  additionalChargeAmount: apiData.additional_charges_amount || "0.00",    
     roundOff: roundOff.toFixed(2),

    totalCGST: parseFloat(apiData.CGSTAmount) || 0,
    totalSGST: parseFloat(apiData.SGSTAmount) || 0,
    totalIGST: parseFloat(apiData.IGSTAmount) || 0,
    taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST",
    mobile_number: mobileNumber
  };
};

const PaymentStatus = () => {
  const [showAllPayments, setShowAllPayments] = useState(false);

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

  const { invoice, summary, allPayments } = paymentData;

  const formatIndianDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const totalAmount = invoice?.totalAmount || 0;
  const balanceDue = summary?.balanceDue || 0;

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaReceipt className="me-2" />
          Payment Status
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-1 p-2 bg-light rounded">
          <span className="fw-bold">Status:</span>
          <Badge bg={
            summary?.status === 'Paid' ? 'success' :
            summary?.status === 'Partial' ? 'warning' : 'danger'
          }>
            {summary?.status || 'Pending'}
          </Badge>
        </div>

        <div className="payment-amounts mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              <FaRupeeSign className="me-1" />
              Invoice:
            </span>
            <small className="text-muted ms-1">
              (On {formatIndianDate(invoice?.invoiceDate)})
            </small>
            <span className="fw-bold text-primary">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Header with counter */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              <FaReceipt className="me-1" />
              Recent (Last {Math.min(3, (allPayments || []).length)} of {(allPayments || []).length})
            </small>
            {(allPayments || []).length > 3 && (
              <small 
                className="text-primary fw-bold" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setShowAllPayments(!showAllPayments)}
              >
                {showAllPayments ? 'Show Less' : 'View All'}
              </small>
            )}
          </div>

          {/* Scrollable Payments Section */}
          <div className="payments-scrollable" style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            paddingRight: '5px'
          }}>
            {(allPayments || []).length > 0 ? (
              (showAllPayments ? allPayments : [...(allPayments || [])].slice(-3))
                .reverse()
                .map((payment, index) => (
                  <div
                    key={`payment-${payment.voucherId || index}`}
                    className={`d-flex justify-content-between align-items-center mb-2 ps-3 border-start ${
                      payment.type === 'Debit Note' ? 'border-warning' : 'border-success'
                    }`}
                  >
                    <span className={payment.type === 'Debit Note' ? 'text-warning' : 'text-success'}>
                      {payment.type === 'Debit Note' ? (
                        <FaExclamationTriangle className="me-1" />
                      ) : (
                        <FaCheckCircle className="me-1" />
                      )}
                      {payment.type === 'Debit Note' ? 'Debit Note:' : 'Purchase Voucher:'}
                    </span>
                    <small className="text-muted ms-1">
                      (On {formatIndianDate(payment.paidDate)}) – {payment.receiptNumber}
                    </small>
                    <span className={`fw-bold ${payment.type === 'Debit Note' ? 'text-warning' : 'text-success'}`}>
                      ₹{(payment.paidAmount || 0).toFixed(2)}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-center text-muted py-2">
                <small>No payment entries found</small>
              </div>
            )}
          </div>

          {/* Balance Due */}
          <div className="d-flex justify-content-between align-items-center mb-2 pt-2 border-top mt-2">
            <span className="text-danger">
              <FaExclamationTriangle className="me-1" />
              Balance Due:
            </span>
            <span className="fw-bold text-danger">
              ₹{balanceDue.toFixed(2)}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const handleQrDataGenerated = (qrUrl) => {
  console.log('QR Data generated:', qrUrl);
  
  if (qrUrl) {
    const QRCode = require('qrcode');
    QRCode.toDataURL(qrUrl, { errorCorrectionLevel: 'H', margin: 1, width: 150 }, (err, url) => {
      if (!err) {
        setQrDataUrl(url);
        const amountMatch = qrUrl.match(/am=([^&]+)/);
        if (amountMatch) {
          setQrAmount(parseFloat(amountMatch[1]));
        }
      } else {
        console.error('QR generation error:', err);
      }
    });
  }
};

const handlePrint = async () => {
  try {
    setDownloading(true);
    setError(null);
    
    if (!currentData) {
      throw new Error('No invoice data available');
    }

    let pdf;
    let SalesPdfDocument;
    
    try {
      const reactPdf = await import('@react-pdf/renderer');
      pdf = reactPdf.pdf;
      
      const pdfModule = await import('../SalesInvoicePage/SalesPdfDocument');
      SalesPdfDocument = pdfModule.default;
    } catch (importError) {
      console.error('Error importing PDF modules:', importError);
      throw new Error('Failed to load PDF generation libraries');
    }

    const gstBreakdown = calculateGSTBreakdown();
    const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

    // Include QR data in PDF
    const finalQrDataUrl = qrDataUrl;
    const finalQrAmount = qrAmount || parseFloat(currentData.grandTotal);

    const pdfDoc = (
      <SalesPdfDocument 
        invoiceData={currentData}
        invoiceNumber={currentData.invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
        qrDataUrl={finalQrDataUrl}
        qrAmount={finalQrAmount}
         unitData={unitData}  // ← ADD THIS
      />
    );

    const blob = await pdf(pdfDoc).toBlob();
    const pdfUrl = URL.createObjectURL(blob);
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (!printWindow) {
      alert('Popup blocked. Please allow popups or use download option.');
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Invoice_${currentData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);

  } catch (error) {
    console.error('Error generating PDF for print:', error);
    setError('Failed to generate PDF for printing: ' + error.message);
    setTimeout(() => setError(null), 5000);
  } finally {
    setDownloading(false);
  }
};

const handleDownloadPDF = async () => {
  try {
    setDownloading(true);
    setError(null);
    
    if (!currentData) {
      throw new Error('No invoice data available');
    }

    let pdf;
    let SalesPdfDocument;
    
    try {
      const reactPdf = await import('@react-pdf/renderer');
      pdf = reactPdf.pdf;
      
      const pdfModule = await import('../SalesInvoicePage/SalesPdfDocument');
      SalesPdfDocument = pdfModule.default;
    } catch (importError) {
      console.error('Error importing PDF modules:', importError);
      throw new Error('Failed to load PDF generation libraries');
    }

    const gstBreakdown = calculateGSTBreakdown();
    const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

    // Include QR data in PDF
    const finalQrDataUrl = qrDataUrl;
    const finalQrAmount = qrAmount || parseFloat(currentData.grandTotal);

    const pdfDoc = (
      <SalesPdfDocument 
        invoiceData={currentData}
        invoiceNumber={currentData.invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
        qrDataUrl={finalQrDataUrl}
        qrAmount={finalQrAmount}
         unitData={unitData}  // ← ADD THIS
      />
    );

    const blob = await pdf(pdfDoc).toBlob();
    const filename = `Invoice_${currentData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    
    setSuccess('PDF downloaded successfully!');
    setTimeout(() => setSuccess(false), 3000);

  } catch (error) {
    console.error('Error generating PDF:', error);
    setError('Failed to generate PDF: ' + error.message);
    setTimeout(() => setError(null), 5000);
  } finally {
    setDownloading(false);
  }
};

  // Replace the existing handleEditToggle with handleEditInvoice
  const handleEditToggle = () => {
    handleEditInvoice(); // Now this will navigate to the form for editing
  };

  const handleCancelEdit = () => {
    setEditedData(invoiceData);
    setIsEditMode(false);
  };

  const handleSaveChanges = async () => {
    if (!editedData) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      const optimizedPayload = {
        voucherId: editedData.voucherId,
        invoiceNumber: editedData.invoiceNumber,
        invoiceDate: editedData.invoiceDate,
        supplierInfo: editedData.supplierInfo,
        taxableAmount: editedData.taxableAmount,
        totalGST: editedData.totalGST,
        grandTotal: editedData.grandTotal,
                  additional_charges_type: editedData.additionalCharge || '',
      additional_charges_amount: parseFloat(editedData.additionalChargeAmount) || 0,
  discount_charges: editedData.discount_charges,
  discount_charges_amount: parseFloat(editedData.discount_charges_amount) || 0,
        batchDetails: editedData.items.map(item => ({
          product: item.product,
          product_id: item.product_id,
          description: item.description,
            hsn_code: item.hsn_code || '',
          batch: item.batch,
          
          batch_id: item.batch_id,
          quantity: parseFloat(item.quantity) || 0,
          price: parseFloat(item.price) || 0,
          discount: parseFloat(item.discount) || 0,
          gst: parseFloat(item.gst) || 0,
          cgst: parseFloat(item.cgst) || 0,
          sgst: parseFloat(item.sgst) || 0,
          igst: parseFloat(item.igst) || 0,
          cess: parseFloat(item.cess) || 0,
          total: parseFloat(item.total) || 0
        }))
      };

      console.log('Saving updated invoice with batch details:', optimizedPayload);

      const response = await fetch(`${baseurl}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizedPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update invoice');
      }
      
      const result = await response.json();
      
      setInvoiceData(editedData);
      setIsEditMode(false);
      setUpdateSuccess('Invoice updated successfully! Stock has been adjusted accordingly.');
      
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
      console.log('Invoice updated successfully:', result);
      
    } catch (error) {
      console.error('Error updating invoice:', error);
      setError('Failed to update invoice: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceData || !invoiceData.voucherId) return;
    
    try {
      setDeleting(true);
      setError(null);
      
      const response = await fetch(`${baseurl}/transactions/${invoiceData.voucherId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      const result = await response.json();
      
      setShowDeleteModal(false);
      alert('Invoice deleted successfully!');
      
      navigate('/sales/invoices');
      
      console.log('Invoice deleted successfully:', result);
      
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice: ' + error.message);
    } finally {
      setDeleting(false);
    }
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

  const addNewItem = () => {
    const newItem = {
      id: editedData.items.length + 1,
      product: 'New Product',
      description: 'Product description',
        hsn_code: '', 

      quantity: 1,
      price: 0,
      discount: 0,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      batch: '',
      batch_id: '',
      product_id: ''
    };
    
    setEditedData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    const newItems = editedData.items.filter((_, i) => i !== index);
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
  
  // ✅ Get discount from editedData
  const discountAmount = parseFloat(editedData?.discount_charges_amount) || 0;
  const additionalChargeAmount = parseFloat(editedData?.additionalChargeAmount) || 0;
  
  // ✅ Apply discount BEFORE adding GST and additional charges
  const afterDiscount = taxableAmount - discountAmount;
  const grandTotal = afterDiscount + totalGST + additionalChargeAmount;
  
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
  console.log("🟦 handleOpenReceiptModal TRIGGERED");

  if (!invoiceData) {
    console.log("❌ No invoiceData found");
    return;
  }

  const balanceDue = paymentData 
    ? paymentData.summary.balanceDue 
    : parseFloat(invoiceData.grandTotal);

  console.log("✅ balanceDue:", balanceDue);

  const firstItem = invoiceData.items[0];
  console.log("✅ firstItem:", firstItem);

   const account_name = invoiceData.supplierInfo.account_name || invoiceData.supplierInfo.name || '';
  const business_name = invoiceData.supplierInfo.business_name || invoiceData.supplierInfo.businessName || '';

  const updatedForm = {
    retailerName: invoiceData.supplierInfo.name, 
    retailerId: invoiceData.supplierInfo.id || '',
    amount: balanceDue,
    invoiceNumber: invoiceData.invoiceNumber,
    product_id: firstItem?.product_id || '',
    batch_id: firstItem?.batch_id || '',
     account_name: account_name,
    business_name: business_name,
     TransactionType: 'purchase voucher'
  };

  console.log("✅ Updated Receipt Form Data:", updatedForm);

  setReceiptFormData(prev => ({
    ...prev,
    ...updatedForm
  }));

  console.log("📌 Fetching next receipt number...");
  fetchNextReceiptNumber();

  console.log("📌 Opening Receipt Modal");
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

  const handleRemoveFile = () => {
    setReceiptFormData(prev => ({
      ...prev,
      transactionProofFile: null
    }));
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleCreateReceiptFromInvoice = async () => {
    if (!receiptFormData.amount || parseFloat(receiptFormData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
  
    try {
      setIsCreatingReceipt(true);
  
      const formDataToSend = new FormData();
  
      formDataToSend.append('receipt_number', receiptFormData.receiptNumber);
formDataToSend.append('TransactionType', receiptFormData.TransactionType)
      formDataToSend.append('retailer_id', receiptFormData.retailerId);
      formDataToSend.append('retailer_name', receiptFormData.retailerName);
      formDataToSend.append('amount', receiptFormData.amount);
      formDataToSend.append('currency', receiptFormData.currency);
      formDataToSend.append('payment_method', receiptFormData.paymentMethod);
      formDataToSend.append('receipt_date', receiptFormData.receiptDate);
      formDataToSend.append('note', receiptFormData.note);
      formDataToSend.append('bank_name', receiptFormData.bankName);
      formDataToSend.append('transaction_date', receiptFormData.transactionDate || '');
      formDataToSend.append('reconciliation_option', receiptFormData.reconciliationOption);
    formDataToSend.append('invoice_number', receiptFormData.invoiceNumber);
    formDataToSend.append('retailer_mobile', receiptFormData.retailerMobile);
    formDataToSend.append('retailer_email', receiptFormData.retailerEmail);
    formDataToSend.append('retailer_gstin', receiptFormData.retailerGstin);
    
    formDataToSend.append('account_name', receiptFormData.account_name );
    formDataToSend.append('business_name', receiptFormData.business_name);
    formDataToSend.append('product_id', receiptFormData.product_id || '');
    formDataToSend.append('batch_id', receiptFormData.batch_id || '');
            formDataToSend.append('data_type', 'stock inward');

    formDataToSend.append('retailer_business_name', receiptFormData.retailerName);
    formDataToSend.append('from_invoice', 'true');

    if (receiptFormData.transactionProofFile) {
      formDataToSend.append('transaction_proof', receiptFormData.transactionProofFile);
    }


    const response = await fetch(`${baseurl}/api/receipts`, {
      method: 'POST',
      body: formDataToSend,
    });
      if (response.ok) {
        const result = await response.json();
        console.log('Voucher created successfully:', result);
        handleCloseReceiptModal();
        alert('Voucher created successfully!');
        
        if (invoiceData && invoiceData.invoiceNumber) {
          fetchPaymentData(invoiceData.invoiceNumber);
        }
        
        if (result.id) {
          navigate(`/voucher_view/${result.id}`);
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
                  <Button variant="info" className="me-2 text-white" onClick={handleOpenReceiptModal}>
                    <FaRegFileAlt className="me-1" /> Create Voucher
                  </Button>
                 {paymentData && !isInvoiceEditable(paymentData) ? (
  <Button variant="warning" className="me-2" disabled title="Cannot edit - invoice has purchase vouchers/debit notes">
    <FaEdit className="me-1" /> Edit Invoice
  </Button>
) : (
  <Button variant="warning" onClick={handleEditInvoice} className="me-2">
    <FaEdit className="me-1" /> Edit Invoice
  </Button>
)}
                  <Button 
                                    variant="success" 
                                    onClick={handlePrint} 
                                    className="me-2"
                                    disabled={downloading || !currentData}
                                  >
                                    {downloading ? (
                                      <>
                                        <div className="spinner-border spinner-border-sm me-1" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Preparing Print...
                                      </>
                                    ) : (
                                      <>
                                        <FaPrint className="me-1" /> Print
                                      </>
                                    )}
                                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDownloadPDF} 
                    className="me-2"
                    disabled={downloading || !currentData}
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
                  <Button variant="success" onClick={handleSaveChanges} className="me-2" disabled={updating}>
                    {updating ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-1" /> Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit} className="me-2">
                    <FaTimes className="me-1" /> Cancel
                  </Button>
                  <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Success/Error Alerts */}
      {updateSuccess && (
        <div className="d-print-none no-print">
          <Container fluid>
            <Alert variant="success" className="mb-3">
              {updateSuccess}
            </Alert>
          </Container>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete invoice <strong>{displayInvoiceNumber}</strong>?</p>
          <p className="text-danger">This action cannot be undone and will also update the stock values.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteInvoice} disabled={deleting}>
            {deleting ? (
              <>
                <div className="spinner-border spinner-border-sm me-1" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Deleting...
              </>
            ) : (
              'Delete Invoice'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Receipt Modal */}
      <Modal show={showReceiptModal} onHide={handleCloseReceiptModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Voucher from Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>  
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="company-info-recepits-table text-center">
                <label className="form-label-recepits-table">SHREE SHASHWATRAJ AGRO PVT LTD</label>
  <p>Growth Center, Jasoiya, Aurangabad</p>
  <p>Bihar, 824101</p>
  <p>GST : 10AAOCS1541B1ZZ</p>
  <p>Email: spmathur56@gmail.com</p>
  <p>Phone: 9801049700</p>
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
                <label className="form-label">Supplier *</label>
                <input
                  type="text"
                  className="form-control"
                  value={receiptFormData.retailerName || 'Auto-filled from invoice'}
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
                <input 
                  type="file" 
                  className="form-control" 
                  onChange={(e) => handleFileChange(e)}
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
                        onClick={() => handleRemoveFile()}
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
            {isCreatingReceipt ? 'Creating...' : 'Create voucher'}
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
    <p className="company-contact text-muted small mb-1">
      Email: {currentData.companyInfo.email} | Phone: {currentData.companyInfo.phone}
    </p>
    <p className="text-muted small mb-0">
      GSTIN/UIN: {currentData.companyInfo.gstin}
    </p>
    <p className="text-muted small mb-0">
      State Name : {currentData.companyInfo.state || "Bihar"}, Code : {currentData.companyInfo.stateCode || "10"}
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
<p className="mb-1">
  <strong>Invoice Date:</strong>{" "}
  {new Date(currentData.invoiceDate).toLocaleDateString("en-GB")}
</p>
<p className="mb-0">
  <strong>Due Date:</strong>{" "}
  {new Date(currentData.validityDate).toLocaleDateString("en-GB")}
</p>
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
                          {/* <Form.Control 
                            className="mb-2"
                            value={currentData.supplierInfo.businessName}
                            onChange={(e) => handleNestedChange('supplierInfo', 'businessName', e.target.value)}
                          /> */}
                             <Form.Control 
          className="mb-2"
          placeholder="Mobile Number"
          value={currentData.supplierInfo.mobile_number || ''}
          onChange={(e) => handleNestedChange('supplierInfo', 'mobile_number', e.target.value)}
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
                          {/* <p className="mb-1 text-muted">{currentData.supplierInfo.businessName}</p> */}
                           {(currentData.supplierInfo.mobile_number || currentData.supplierInfo.phone_number) && (
          <p className="mb-1">
            <small> Mobile: {currentData.supplierInfo.mobile_number || currentData.supplierInfo.phone_number}</small>
          </p>
        )}
                          <p className="mb-1"><small>GSTIN: {currentData.supplierInfo.gstin || 'N/A'}</small></p>
                          <p className="mb-0"><small>State: {currentData.supplierInfo.state || 'N/A'}</small></p>
                        </>
                      )}
                    </div>
                  </Col>
                  {/* <Col md={6}>
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
                  </Col> */}

                          <Col md={6}>
                                                                          <h6 className="text-primary">Transportation Details:</h6>
                                                      
                                                                  <div className="bg-light p-3 rounded">
                                                                    <div className="transport-field">
                                                                      <strong>Vehicle No.:</strong>
                                                                      <p className="mb-0 text-muted">
                                                                        {currentData.transportDetails?.vehicleNo || '-'}
                                                                      </p>
                                                                    </div>
                                                                    </div>
                                                                  </Col>
                </Row>
              </div>

              {/* Items Table */}
              <div className="items-section mb-4">
                {/* <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-primary mb-0">Items Details</h6>
                  {isEditMode && (
                    <Button variant="primary" size="sm" onClick={addNewItem}>
                      + Add Item
                    </Button>
                  )}
                </div> */}
                {isEditMode ? (
                  <Table bordered responsive size="sm" className="edit-control">
                    <thead className="table-dark">
                      <tr>
                        <th width="5%">#</th>
                        <th width="20%">Product</th>
                         {/* <th width="20%">Description</th> */}
                          <th width="20%">HSN Code</th>
                        <th width="10%">Qty</th>
                        <th width="15%">Price</th>
                        <th width="10%">GST %</th>
                        <th width="15%"> Amount (₹)</th>
                        <th width="5%">Action</th>
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
                          {/* <td>
                            <Form.Control 
                              size="sm"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </td> */}
                             <td>
                                                                    <Form.Control 
                                                                      size="sm"
                                                                      value={item.hsn_code || ''}
                                                                      onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                                                                      placeholder="HSN Code"
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
                          <td className="text-center">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
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
                        {/* <th width="25%">Description</th> */}
                        <th width="20%">HSN Code</th>
                        <th width="10%">Units</th>
                        <th width="15%">Price</th>
                       
                                                <th width="8%">Discount %</th>
 <th width="10%">GST %</th>
                        <th width="10%"> Taxable Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{item.product}</td>
                          {/* <td>{item.description}</td> */}
                          <td className="text-center">{item.hsn_code}</td>

                         <td className="text-center">
  {item.quantity} {unitData[item.unit_id] || item.unit_name || ''}
</td>
                          <td className="text-end">₹{parseFloat(item.price).toFixed(2)}</td>
                       
                                                    <td className="text-center">
          {parseFloat(item.discount || 0).toFixed(1)}%
        </td>
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
      {/* <div className="notes-section">
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
      </div> */}
      
      {/* ✅ ADD TRANSPORT DETAILS HERE */}
      {/* <div className="transport-details-section mt-3">
        <h6 className="text-primary">Transportation Details:</h6>
        <div className="bg-light p-3 rounded">
          <Row className="mb-2">
            <Col md={6}>
              <div className="transport-field">
                <strong>Transport:</strong>
                <p className="mb-0 text-muted">
                  {currentData.transportDetails?.transport || '-'}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="transport-field">
                <strong>GR/RR No.:</strong>
                <p className="mb-0 text-muted">
                  {currentData.transportDetails?.grNumber || '-'}
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className="transport-field">
                <strong>Vehicle No.:</strong>
                <p className="mb-0 text-muted">
                  {currentData.transportDetails?.vehicleNo || '-'}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="transport-field">
                <strong>Station:</strong>
                <p className="mb-0 text-muted">
                  {currentData.transportDetails?.station || '-'}
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div> */}
    </Col>
    <Col md={5}>
      <div className="amount-breakdown bg-light p-3 rounded">
        <h6 className="text-primary mb-3">Amount Summary</h6>
        <table className="amount-table w-100">
          <tbody>
            <tr>
              <td className="pb-2">Amount:</td>
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
        {currentData.additionalCharge && parseFloat(currentData.additionalChargeAmount) > 0 && (
          <tr>
            <td className="pb-2">{currentData.additionalCharge}:</td>
            <td className="text-end pb-2">
              ₹{parseFloat(currentData.additionalChargeAmount).toFixed(2)}
            </td>
          </tr>
        )}

           {/* Discount Row - make sure it's shown as deduction */}
{currentData.discount_charges && parseFloat(currentData.discount_charges_amount) > 0 && (
  <tr className="text-danger">
    <td className="pb-2">
      Discount ({currentData.discount_charges === 'percentage' ? '%' : '₹'}):
    </td>
    <td className="text-end pb-2">
      - ₹{parseFloat(currentData.discount_charges_amount).toFixed(2)}
    </td>
  </tr>
)}
   
         {/* ✅ ADD ROUND OFF ROW */}
      {currentData.roundOff && parseFloat(currentData.roundOff) !== 0 && (
        <tr>
          <td className="pb-2">Round Off:</td>
          <td className="text-end pb-2">
            <span className={parseFloat(currentData.roundOff) < 0 ? "text-danger" : "text-success"}>
              {parseFloat(currentData.roundOff) < 0 ? currentData.roundOff : `+${currentData.roundOff}`}
            </span>
          </td>
        </tr>
      )}         <tr className="grand-total border-top pt-2">
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
                  {/* <Col md={6}>
  <div className="bank-details">
    
    <h6 className="text-primary mb-1" style={{ fontSize: '15px' }}>
      Bank Details:
    </h6>
    
    <div className="bg-light p-2 rounded" style={{ fontSize: '11px', lineHeight: '1.2' }}>
      
      <p className="mb-1" style={{ fontSize: '12px', }}  >
        Account Name: SHREE SHASHWATRAJ AGRO PVT LTD
      </p>
      
      <p className="mb-1" style={{ fontSize: '12px', }}>
        Bank Name: STATE BANK OF INDIA
      </p>
      
      <p className="mb-1" style={{ fontSize: '12px', }}>
        Branch: SME AURANGABAD
      </p>
      
      <p className="mb-1" style={{ fontSize: '12px', }}>
        Account Number: 44773710377
      </p>
      
      <p className="mb-0" style={{ fontSize: '12px', }}>
        IFSC Code: SBIN0063699
      </p>
      
    </div>
  </div>
                  </Col> */}
                             <Col md={12} className="text-end">
                 <div className="signature-section">
                   <p className="mb-2">For {currentData.companyInfo.name}</p>
                   <div className="signature-space border-bottom" style={{width: '200px', height: '40px', marginLeft: 'auto'}}></div>
                   <p className="mt-2">Authorized Signatory</p>
                 </div>
               </Col>
                </Row>
              </div>
            </div>
          </Col>

<Col lg={4} className="d-print-none no-print">
  <PaymentStatus />
  {invoiceData && (
    <div className="mt-3">
      <QRCodeGenerator_normal 
        invoiceData={invoiceData}
        onQrDataGenerated={handleQrDataGenerated}
      />
    </div>
  )}
</Col>
        </Row>
      </Container>
    </div>
  );
};

export default KachaPurchaseInvoicePDFPreview;