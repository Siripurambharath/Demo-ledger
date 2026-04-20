import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table, Alert, Card, ProgressBar, Modal, Badge } from 'react-bootstrap';
import './InvoicePDFPreview.css';
import { FaPrint, FaFilePdf, FaEdit, FaSave, FaTimes, FaArrowLeft, FaRupeeSign, FaCalendar, FaReceipt, FaRegFileAlt, FaExclamationTriangle, FaCheckCircle, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
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
    invoiceNumber: '',
    transactionProofFile: null
  });
  const [isCreatingReceipt, setIsCreatingReceipt] = useState(false);
  const invoiceRef = useRef(null);

  // Add this function to handle navigation to edit form
  const handleEditInvoice = () => {
    if (invoiceData && invoiceData.voucherId) {
      // Navigate to the sales form with the voucher ID for editing
      navigate(`/sales/createinvoice/${invoiceData.voucherId}`);
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
        const transformedData = transformPaymentData(result.data);
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
    const salesEntry = apiData.sales;
    const receiptEntries = apiData.receipts || [];
    
    const totalAmount = parseFloat(salesEntry.TotalAmount) || 0;
    const totalPaid = receiptEntries.reduce((sum, receipt) => {
      return sum + parseFloat(receipt.paid_amount || 0);
    }, 0);
    
    const balanceDue = totalAmount - totalPaid;
    
    const invoiceDate = new Date(salesEntry.Date);
    const today = new Date();
    const overdueDays = Math.max(0, Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24)));
    
    const receipts = receiptEntries.map(receipt => ({
      receiptNumber: receipt.receipt_number,
      paidAmount: parseFloat(receipt.paid_amount || 0),
      paidDate: receipt.paid_date,
      status: receipt.status
    }));
    
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
        product_id: batch.product_id || ''
      };
    }) || [];

    const taxableAmount = parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
    const totalGST = parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
    const grandTotal = parseFloat(apiData.TotalAmount) || 0;

    return {
      voucherId: apiData.VoucherID,
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
      transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
      additionalCharge: "",
      additionalChargeAmount: "0.00",
      
      totalCGST: parseFloat(apiData.CGSTAmount) || 0,
      totalSGST: parseFloat(apiData.SGSTAmount) || 0,
      totalIGST: parseFloat(apiData.IGSTAmount) || 0,
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST"
    };
  };

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
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <span className="fw-bold">Status:</span>
            <Badge bg={
              summary.status === 'Paid' ? 'success' :
              summary.status === 'Partial' ? 'warning' : 'danger'
            }>
              {summary.status}
            </Badge>
          </div>

          <div className="payment-amounts mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">
                <FaRupeeSign className="me-1" />
                Invoiced:
              </span>
              <small className="text-muted ms-1">
                (On {new Date(invoice.invoiceDate).toLocaleDateString()})
              </small>
              <span className="fw-bold text-primary">
                ₹{invoice.totalAmount.toFixed(2)}
              </span>
            </div>

            {receipts.map((receipt, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center mb-2 ps-3 border-start border-success">
                <span className="text-success">
                  <FaCheckCircle className="me-1" />
                  Paid:
                </span>
                <small className="text-muted ms-1">
                  (On {new Date(receipt.paidDate).toLocaleDateString()}) – {receipt.receiptNumber}
                </small>
                <span className="fw-bold text-success">
                  ₹{receipt.paidAmount.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="d-flex justify-content-between align-items-center mb-2 pt-2 border-top">
              <span className="text-danger">
                <FaExclamationTriangle className="me-1" />
                Balance Due:
              </span>
              <span className="fw-bold text-danger">
                ₹{summary.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError(null);
      
      if (!currentData) {
        throw new Error('No invoice data available');
      }

      let pdf;
      let InvoicePDFDocument;
      
      try {
        const reactPdf = await import('@react-pdf/renderer');
        pdf = reactPdf.pdf;
        
        const pdfModule = await import('./InvoicePDFDocument');
        InvoicePDFDocument = pdfModule.default;
      } catch (importError) {
        console.error('Error importing PDF modules:', importError);
        throw new Error('Failed to load PDF generation libraries');
      }

      const gstBreakdown = calculateGSTBreakdown();
      const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

      console.log('Generating PDF for invoice:', currentData.invoiceNumber);

      let pdfDoc;
      try {
        pdfDoc = (
          <InvoicePDFDocument 
            invoiceData={currentData}
            invoiceNumber={currentData.invoiceNumber}
            gstBreakdown={gstBreakdown}
            isSameState={isSameState}
          />
        );
      } catch (componentError) {
        console.error('Error creating PDF component:', componentError);
        throw new Error('Failed to create PDF document structure');
      }

      let blob;
      try {
        blob = await pdf(pdfDoc).toBlob();
      } catch (pdfError) {
        console.error('Error generating PDF blob:', pdfError);
        throw new Error('Failed to generate PDF file');
      }
      
      const filename = `Invoice_${currentData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;

      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const storeResponse = await fetch(`${baseurl}/transactions/${id}/pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdfData: base64data,
            fileName: filename
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!storeResponse.ok) {
          const errorText = await storeResponse.text();
          throw new Error(`Server error: ${storeResponse.status} - ${errorText}`);
        }

        const storeResult = await storeResponse.json();
        
        if (storeResult.success) {
          console.log('PDF stored successfully in database');
          
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          
          setSuccess('PDF downloaded and stored successfully!');
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error(storeResult.message || 'Failed to store PDF');
        }
      } catch (storeError) {
        console.error('Error storing PDF:', storeError);
        
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        
        setSuccess('PDF downloaded successfully! (Not stored in database due to size limitations)');
        setTimeout(() => setSuccess(false), 3000);
      }

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
        batchDetails: editedData.items.map(item => ({
          product: item.product,
          product_id: item.product_id,
          description: item.description,
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
      formDataToSend.append('retailer_id', receiptFormData.retailerId);
      formDataToSend.append('retailer_name', receiptFormData.retailerBusinessName);
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
      formDataToSend.append('retailer_business_name', receiptFormData.retailerBusinessName);
      formDataToSend.append('from_invoice', 'true');
  
      if (receiptFormData.transactionProofFile) {
        formDataToSend.append('transaction_proof', receiptFormData.transactionProofFile);
      }
  
      console.log('Creating receipt from invoice with FormData...');

      const response = await fetch(`${baseurl}/api/receipts`, {
        method: 'POST',
        body: formDataToSend,
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Receipt created successfully:', result);
        handleCloseReceiptModal();
        alert('Receipt created successfully!');
        
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
                  <Button variant="info" className="me-2 text-white" onClick={handleOpenReceiptModal}>
                    <FaRegFileAlt className="me-1" /> Create Receipt
                  </Button>
                  <Button variant="warning" onClick={handleEditInvoice} className="me-2">
                    <FaEdit className="me-1" /> Edit Invoice
                  </Button>
                  <Button variant="success" onClick={handlePrint} className="me-2">
                    <FaPrint className="me-1" /> Print
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
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-primary mb-0">Items Details</h6>
                  {isEditMode && (
                    <Button variant="primary" size="sm" onClick={addNewItem}>
                      + Add Item
                    </Button>
                  )}
                </div>
                {isEditMode ? (
                  <Table bordered responsive size="sm" className="edit-control">
                    <thead className="table-dark">
                      <tr>
                        <th width="5%">#</th>
                        <th width="20%">Product</th>
                        <th width="20%">Description</th>
                        <th width="10%">Qty</th>
                        <th width="15%">Price</th>
                        <th width="10%">GST %</th>
                        <th width="15%">Amount (₹)</th>
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