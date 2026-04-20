import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL"
import './Invoices.css';
import { FaDownload, FaEye, FaFilePdf } from "react-icons/fa";

const InvoicesTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Invoices');

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

const fetchInvoices = async () => {
  try {
    setLoading(true);
    
    // Use the correct endpoint
    const response = await fetch(`${baseurl}/invoices-with-pdf`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch invoices');
    }
    
    const data = result.data;
    
    // Transform the data to match your table structure
    const transformedInvoices = data.map(invoice => ({
      id: invoice.VoucherID,
      customerName: invoice.PartyName || invoice.AccountName || 'N/A',
      number: invoice.InvoiceNumber || invoice.VchNo || `INV-${invoice.VoucherID}`,
      totalAmount: `₹ ${parseFloat(invoice.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      payment: getPaymentStatus(invoice),
      created: invoice.Date || 'N/A',
      originalData: invoice,
      hasPDF: !!invoice.pdf_data // Check if PDF exists using pdf_data column
    }));
    
    // Sort by invoice number to ensure latest invoices first
    transformedInvoices.sort((a, b) => {
      const numA = parseInt(a.number.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.number.replace(/\D/g, '')) || 0;
      return numB - numA;
    });
    
    setInvoices(transformedInvoices);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    setError(err.message);
    setLoading(false);
  }
};

  // Helper function to determine payment status
  const getPaymentStatus = (invoice) => {
    if (invoice.ChequeNo && invoice.ChequeNo !== 'NULL') {
      return 'Paid';
    }
    
    const invoiceDate = new Date(invoice.Date || invoice.EntryDate);
    const today = new Date();
    const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 30) {
      return 'Overdue';
    }
    
    return 'Pending';
  };

  // Function to download PDF
  // Function to download PDF
const handleDownloadPDF = async (invoiceNumber, invoiceData) => {
  try {
    console.log('Downloading PDF for invoice:', invoiceNumber);
    
    const response = await fetch(`${baseurl}/get-pdf/${invoiceNumber}`);
    
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    
    // Create blob from response
    const blob = await response.blob();
    
    // Check if blob is valid
    if (blob.size === 0) {
      throw new Error('PDF file is empty or not found');
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Use the original filename from the response headers or create one
    const contentDisposition = response.headers.get('content-disposition');
    let fileName = `Invoice_${invoiceNumber}.pdf`;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('PDF downloaded successfully:', fileName);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Failed to download PDF: ' + error.message);
  }
};

  // Function to check if PDF exists
  const checkPDFExists = async (invoiceNumber) => {
    try {
      const response = await fetch(`${baseurl}/pdf-info/${invoiceNumber}`);
      const result = await response.json();
      return result.success && result.data.hasPDF;
    } catch (error) {
      console.error('Error checking PDF:', error);
      return false;
    }
  };

 // Enhanced function to handle invoice number click with proper product display
// Enhanced function to handle invoice number click with proper product display
// Enhanced function to handle invoice number click with proper product display
const handleInvoiceNumberClick = async (invoice) => {
  console.log('Opening preview for invoice:', invoice);
  
  try {
    let invoiceDetails;
    
    // Use the new API endpoint to get invoice by invoice number
    try {
      const response = await fetch(`${baseurl}/invoice-by-number/${invoice.number}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch invoice details');
      }
      
      invoiceDetails = result.data;
      console.log('Complete invoice details fetched by number:', invoiceDetails);
      
    } catch (fetchError) {
      console.warn('Failed to fetch by invoice number, trying by VoucherID:', fetchError);
      
      // Fallback: fetch by VoucherID
      const response = await fetch(`${baseurl}/transactions/${invoice.originalData.VoucherID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const result = await response.json();
      invoiceDetails = result.success ? result.data : result;
    }

    console.log('Processing invoice details for preview:', invoiceDetails);

    // Parse batch details if they exist - ENHANCED PARSING
    let items = [];
    let batchDetails = [];
    
    try {
      // Enhanced batch details parsing
      if (invoiceDetails.batch_details) {
        if (typeof invoiceDetails.batch_details === 'string') {
          try {
            batchDetails = JSON.parse(invoiceDetails.batch_details);
          } catch (parseError) {
            console.warn('Failed to parse batch_details string, trying direct access:', parseError);
            // Try to extract from the string directly
            if (invoiceDetails.batch_details.includes('[')) {
              const startIndex = invoiceDetails.batch_details.indexOf('[');
              const endIndex = invoiceDetails.batch_details.lastIndexOf(']') + 1;
              const jsonStr = invoiceDetails.batch_details.substring(startIndex, endIndex);
              batchDetails = JSON.parse(jsonStr);
            }
          }
        } else if (Array.isArray(invoiceDetails.batch_details)) {
          batchDetails = invoiceDetails.batch_details;
        }
      }
      
      // Also check BatchDetails column (different case)
      if ((!batchDetails || batchDetails.length === 0) && invoiceDetails.BatchDetails) {
        try {
          batchDetails = typeof invoiceDetails.BatchDetails === 'string' 
            ? JSON.parse(invoiceDetails.BatchDetails) 
            : invoiceDetails.BatchDetails;
        } catch (e) {
          console.warn('Failed to parse BatchDetails:', e);
        }
      }

      console.log('Parsed batch details:', batchDetails);

      // Transform batch details into items format for the preview
      if (batchDetails && batchDetails.length > 0) {
        items = batchDetails.map((batch, index) => {
          // Extract product details from batch
          const productName = batch.product || batch.goods_name || batch.item_name || 'Unknown Product';
          const description = batch.description || '';
          const quantity = parseFloat(batch.quantity) || parseFloat(batch.qty) || 1;
          const price = parseFloat(batch.price) || parseFloat(batch.rate) || 0;
          const batchNumber = batch.batch || batch.batch_number || '';
          
          // Calculate GST from invoice data
          const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
          const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
          const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
          const totalGSTPercentage = cgstPercentage + sgstPercentage + igstPercentage;
          
          // Calculate amounts
          const itemTotal = quantity * price;
          const gstAmount = itemTotal * (totalGSTPercentage / 100);
          const itemGrandTotal = itemTotal + gstAmount;

          return {
            id: index + 1,
            product: productName,
            description: description,
            quantity: quantity,
            price: price,
            discount: batch.discount || 0,
            gst: totalGSTPercentage,
            cgst: cgstPercentage,
            sgst: sgstPercentage,
            igst: igstPercentage,
            cess: 0,
            total: itemGrandTotal,
            batch: batchNumber,
            batchDetails: batch
          };
        });
      } else {
        console.log('No batch details found, creating fallback items');
        // Create fallback items from main invoice data
        const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
        const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
        const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
        const totalGSTPercentage = cgstPercentage + sgstPercentage + igstPercentage;
        
        const taxableAmount = parseFloat(invoiceDetails.BasicAmount) || parseFloat(invoiceDetails.Subtotal) || 
                             parseFloat(invoiceDetails.ValueOfGoods) || 0;
        const totalAmount = parseFloat(invoiceDetails.TotalAmount) || 0;
        
        items = [{
          id: 1,
          product: 'Product',
          description: 'Description not available',
          quantity: 1,
          price: taxableAmount,
          discount: 0,
          gst: totalGSTPercentage,
          cgst: cgstPercentage,
          sgst: sgstPercentage,
          igst: igstPercentage,
          cess: 0,
          total: totalAmount,
          batch: '',
          batchDetails: null
        }];
      }
    } catch (parseError) {
      console.error('Error parsing batch details:', parseError);
      // Create a fallback item from the main invoice data
      const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
      const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
      const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
      const totalGSTPercentage = cgstPercentage + sgstPercentage + igstPercentage;
      
      const taxableAmount = parseFloat(invoiceDetails.BasicAmount) || parseFloat(invoiceDetails.TotalAmount) || 0;
      
      items = [{
        id: 1,
        product: 'Product',
        description: 'Description not available',
        quantity: 1,
        price: taxableAmount,
        discount: 0,
        gst: totalGSTPercentage,
        cgst: cgstPercentage,
        sgst: sgstPercentage,
        igst: igstPercentage,
        cess: 0,
        total: parseFloat(invoiceDetails.TotalAmount) || 0,
        batch: '',
        batchDetails: null
      }];
    }

    // Calculate GST breakdown with proper percentages
    const totalCGST = parseFloat(invoiceDetails.CGSTAmount) || 0;
    const totalSGST = parseFloat(invoiceDetails.SGSTAmount) || 0;
    const totalIGST = parseFloat(invoiceDetails.IGSTAmount) || 0;
    const totalGST = totalCGST + totalSGST + totalIGST;
    
    const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
    const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
    const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
    
    const taxableAmount = parseFloat(invoiceDetails.BasicAmount) || parseFloat(invoiceDetails.Subtotal) || 
                         parseFloat(invoiceDetails.ValueOfGoods) || 0;
    const grandTotal = parseFloat(invoiceDetails.TotalAmount) || 0;

    // Determine tax type based on percentages and amounts
    let taxType = "CGST/SGST";
    if (igstPercentage > 0 || totalIGST > 0) {
      taxType = "IGST";
    }

    console.log('Final items for preview:', items);

    // Prepare the data for preview
    const previewData = {
      invoiceNumber: invoiceDetails.InvoiceNumber || invoiceDetails.VchNo || invoice.number,
      invoiceDate: invoiceDetails.Date || invoice.created,
      validityDate: new Date(new Date(invoiceDetails.Date || invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: invoiceDetails.PartyName || invoiceDetails.display_name || 'N/A',
        businessName: invoiceDetails.AccountName || invoiceDetails.business_name || 'N/A',
        state: invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka',
        gstin: invoiceDetails.GSTIN || invoiceDetails.gstin || 'ZAAACDE1234F225'
      },
      billingAddress: {
        addressLine1: invoiceDetails.BillingAddress || invoiceDetails.billing_address_line1 || '12/A Church Street',
        addressLine2: invoiceDetails.billing_address_line2 || 'Near Main Square',
        city: invoiceDetails.BillingCity || invoiceDetails.billing_city || 'Bangalore',
        pincode: invoiceDetails.BillingPincode || invoiceDetails.billing_pin_code || '560001',
        state: invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka'
      },
      shippingAddress: {
        addressLine1: invoiceDetails.ShippingAddress || invoiceDetails.shipping_address_line1 || invoiceDetails.BillingAddress || invoiceDetails.billing_address_line1 || '12/A Church Street',
        addressLine2: invoiceDetails.shipping_address_line2 || invoiceDetails.billing_address_line2 || 'Near Main Square',
        city: invoiceDetails.ShippingCity || invoiceDetails.shipping_city || invoiceDetails.BillingCity || invoiceDetails.billing_city || 'Bangalore',
        pincode: invoiceDetails.ShippingPincode || invoiceDetails.shipping_pin_code || invoiceDetails.BillingPincode || invoiceDetails.billing_pin_code || '560001',
        state: invoiceDetails.ShippingState || invoiceDetails.shipping_state || invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka'
      },
      items: items, // This now contains proper product data
      note: invoiceDetails.Notes || invoiceDetails.notes || 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: taxableAmount,
      totalGST: totalGST,
      totalCess: invoiceDetails.TotalCess || 0,
      grandTotal: grandTotal,
      transportDetails: invoiceDetails.TransportDetails || invoiceDetails.transport_details || 'Standard delivery. Contact us for tracking information.',
      additionalCharge: invoiceDetails.AdditionalCharge || '',
      additionalChargeAmount: invoiceDetails.AdditionalChargeAmount || 0,
      otherDetails: "Authorized Signatory",
      taxType: taxType,
      batchDetails: batchDetails,
      // GST Breakdown with percentages
      totalCGST: totalCGST,
      totalSGST: totalSGST,
      totalIGST: totalIGST,
      cgstPercentage: cgstPercentage,
      sgstPercentage: sgstPercentage,
      igstPercentage: igstPercentage,
      // Original data for reference
      originalInvoiceData: invoiceDetails
    };

    console.log('Preview data prepared with items:', previewData.items);

    // Save to localStorage for the preview component
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    // Navigate to preview page
    navigate("/sales/invoice-preview");
    
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    // Enhanced fallback with better error handling
    const fallbackPreviewData = {
      invoiceNumber: invoice.number,
      invoiceDate: invoice.created,
      validityDate: new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: invoice.originalData.PartyName || 'John A',
        businessName: invoice.originalData.AccountName || 'John Traders',
        state: 'Karnataka',
        gstin: 'ZAAACDE1234F225'
      },
      items: [{
        id: 1,
        product: 'Product',
        description: 'No product details available',
        quantity: 1,
        price: parseFloat(invoice.originalData.BasicAmount) || parseFloat(invoice.originalData.TotalAmount) || 0,
        discount: 0,
        gst: 18,
        cgst: 9,
        sgst: 9,
        igst: 0,
        cess: 0,
        total: parseFloat(invoice.originalData.TotalAmount) || 0,
        batch: '',
        batchDetails: null
      }],
      note: 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: parseFloat(invoice.originalData.BasicAmount) || parseFloat(invoice.originalData.TotalAmount) || 0,
      totalGST: parseFloat(invoice.originalData.TaxAmount) || 0,
      totalCess: 0,
      grandTotal: parseFloat(invoice.originalData.TotalAmount) || 0,
      transportDetails: 'Standard delivery. Contact us for tracking information.',
      taxType: "CGST/SGST",
      totalCGST: parseFloat(invoice.originalData.CGSTAmount) || 0,
      totalSGST: parseFloat(invoice.originalData.SGSTAmount) || 0,
      totalIGST: parseFloat(invoice.originalData.IGSTAmount) || 0
    };

    localStorage.setItem('previewInvoice', JSON.stringify(fallbackPreviewData));
    navigate("/sales/invoice-preview");
  }
};


  // Function to get invoice by invoice number
  const getInvoiceByNumber = async (invoiceNumber) => {
    try {
      console.log('Fetching invoice by number:', invoiceNumber);
      
      // Get all transactions to find the one with matching invoice number
      const response = await fetch(`${baseurl}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const allTransactions = await response.json();
      
      // Find the transaction with matching invoice number
      const targetTransaction = allTransactions.find(transaction => 
        transaction.InvoiceNumber === invoiceNumber || 
        transaction.VchNo === invoiceNumber
      );
      
      if (!targetTransaction) {
        throw new Error(`Invoice with number ${invoiceNumber} not found`);
      }
      
      console.log('Found transaction by invoice number:', targetTransaction);
      
      // Now fetch the complete details using the VoucherID
      const detailResponse = await fetch(`${baseurl}/transactions/${targetTransaction.VoucherID}`);
      
      if (!detailResponse.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const invoiceDetails = await detailResponse.json();
      
      if (!invoiceDetails.success) {
        throw new Error('Failed to fetch invoice details');
      }
      
      return invoiceDetails.data;
      
    } catch (error) {
      console.error('Error fetching invoice by number:', error);
      throw error;
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'customerName', title: 'RETAILER NAME', style: { textAlign: 'left' } },
    { 
      key: 'number', 
      title: 'INVOICE NUMBER', 
      style: { textAlign: 'center' },
      render: (value, row) => (
        <button 
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleInvoiceNumberClick(row)}
          title="Click to view invoice preview"
        >
          {value}
        </button>
      )
    },
    { key: 'totalAmount', title: 'TOTAL AMOUNT', style: { textAlign: 'right' } },
    {
      key: 'payment',
      title: 'PAYMENT STATUS',
      style: { textAlign: 'center' },
      render: (value) => {
        if (typeof value !== 'string') return '';
        let badgeClass = '';
        if (value === 'Paid') badgeClass = 'status-badge status-paid';
        else if (value === 'Pending') badgeClass = 'status-badge status-pending';
        else if (value === 'Overdue') badgeClass = 'status-badge status-overdue';
        return <span className={badgeClass}>{value}</span>;
      }
    },
    {
      key: 'created',
      title: 'CREATED DATE',
      style: { textAlign: 'center' },
      render: (value, row) => {
        if (!row?.created) return "-"; // fallback if no date
        const date = new Date(row.created);
        return date.toLocaleDateString("en-GB", { 
          day: "2-digit", 
          month: "2-digit", 
          year: "numeric" 
        });
      }
    },
   {
  key: 'actions',
  title: 'ACTIONS',
  style: { textAlign: 'center' },
  render: (value, row) => (
    <div className="d-flex justify-content-center gap-2">
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => handleInvoiceNumberClick(row)}
        title="View Invoice"
      >
        <FaEye />
      </button>
      <button
        className="btn btn-sm btn-outline-success"
        onClick={() => handleDownloadPDF(row.number, row)}
        title="Download PDF"
        disabled={!row.hasPDF}
      >
        <FaDownload />
      </button>
      {!row.hasPDF && (
        <small className="text-muted" title="PDF not available">
          <FaFilePdf className="text-muted" />
        </small>
      )}
    </div>
  )
}
  ];

  const handleCreateClick = () => navigate("/sales/createinvoice");

  // Define tabs with their corresponding routes
  const tabs = [
    { name: 'Invoices', path: '/sales/invoices' },
    { name: 'Receipts', path: '/sales/receipts' },
    { name: 'Quotations', path: '/sales/quotations' },
    { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
    { name: 'CreditNote', path: '/sales/credit_note' },
    { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
    { name: 'Receivables', path: '/sales/receivables' }
  ];

  // Handle tab click - navigate to corresponding route
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Handle download functionality
  const handleDownload = async () => {
    try {
      console.log('Downloading invoices for:', month, year);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle date range download
  const handleDownloadRange = async () => {
    try {
      console.log('Downloading invoices for date range:', startDate, 'to', endDate);
    } catch (err) {
      console.error('Download range error:', err);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader 
            isCollapsed={isCollapsed} 
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isMobile={window.innerWidth <= 768}
          />
          <div className="admin-content-wrapper-sales">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader 
            isCollapsed={isCollapsed} 
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isMobile={window.innerWidth <= 768}
          />
          <div className="admin-content-wrapper-sales">
            <div className="alert alert-danger m-3" role="alert">
              Error loading invoices: {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchInvoices}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          isMobile={window.innerWidth <= 768}
        />

        <div className="admin-content-wrapper-sales">
          <div className="invoices-content-area">
           
            <div className="invoices-tabs-section">
              <div className="invoices-tabs-container">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`invoices-tab ${activeTab === tab.name ? 'invoices-tab--active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

          <div className="receipts-header-section">
            <div className="receipts-header-top">
              <div className="receipts-title-section">
                <h1 className="receipts-main-title">Sales Invoice Management</h1>
                <p className="receipts-subtitle">Create, manage and track all your sales invoices</p>
              </div>
            </div>
          </div>

            {/* ✅ Filters and Actions */}
            <div className="invoices-actions-section">
              <div className="quotation-container p-4">
                <h5 className="mb-3 fw-bold">View Invoice Details</h5>

                <div className="row align-items-end g-3 mb-4">
                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Month and Year Data:</label>
                    <div className="d-flex">
                      <select className="form-select me-2" value={month} onChange={(e) => setMonth(e.target.value)}>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        {['2025','2024','2023'].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4" onClick={handleDownload}>
                      <i className="bi bi-download me-1"></i> Download
                    </button>
                  </div>

                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Date Range:</label>
                    <div className="d-flex">
                      <input type="date" className="form-control me-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4" onClick={handleDownloadRange}>
                      <i className="bi bi-download me-1"></i> Download Range
                    </button>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-primary mt-4" onClick={handleCreateClick}>
                      <i className="bi bi-plus-circle me-1"></i> Create Invoice
                    </button>
                  </div>
                </div>

                {/* ✅ Table */}
                <ReusableTable
                  title="Sales Invoices"
                  data={invoices}
                  columns={columns}
                  initialEntriesPerPage={5}
                  searchPlaceholder="Search invoices by customer name or number..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesTable;