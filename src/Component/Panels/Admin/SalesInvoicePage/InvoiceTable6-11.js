import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL"
import './Invoices.css';
import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';

const InvoicesTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [deleting, setDeleting] = useState({});

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
      const response = await fetch(`${baseurl}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      
      // Filter transactions where TransactionType is 'Sales'
      const salesInvoices = data.filter(transaction => 
        transaction.TransactionType === 'Sales'
      );
      
      // Transform the data to match your table structure
      const transformedInvoices = salesInvoices.map(invoice => ({
        id: invoice.VoucherID,
        customerName: invoice.PartyName || 'N/A',
        number: invoice.InvoiceNumber || `INV-${invoice.VoucherID}`,
        totalAmount: `₹ ${parseFloat(invoice.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        payment: getPaymentStatus(invoice),
        created: invoice.Date || invoice.EntryDate?.split('T')[0] || 'N/A',
        originalData: invoice,
        hasPDF: !!invoice.pdf_data // Check if PDF exists
      }));
      
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

  // Handle PDF Download
  // Handle PDF Download
const handleDownloadPDF = async (invoice) => {
  const voucherId = invoice.originalData?.VoucherID || invoice.id;
  
  try {
    setDownloading(prev => ({ ...prev, [voucherId]: true }));
    
    // First, try to download the existing PDF
    const downloadResponse = await fetch(`${baseurl}/transactions/${voucherId}/download-pdf`);
    
    if (downloadResponse.ok) {
      // Get the PDF blob from response
      const pdfBlob = await downloadResponse.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = downloadResponse.headers.get('content-disposition');
      let filename = `Invoice_${invoice.number}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF downloaded successfully');
      
    } else if (downloadResponse.status === 404) {
      // PDF doesn't exist, generate it first
      console.log('PDF not found, generating new PDF...');
      
      const generateResponse = await fetch(`${baseurl}/transactions/${voucherId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (generateResponse.ok) {
        const result = await generateResponse.json();
        console.log('PDF generated successfully:', result);
        
        // After generation, try downloading again
        const retryDownload = await fetch(`${baseurl}/transactions/${voucherId}/download-pdf`);
        
        if (retryDownload.ok) {
          const pdfBlob = await retryDownload.blob();
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Invoice_${invoice.number}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log('PDF downloaded after generation');
        } else {
          throw new Error('Failed to download PDF after generation');
        }
      } else {
        throw new Error('Failed to generate PDF');
      }
    } else {
      throw new Error(`Failed to download PDF: ${downloadResponse.status}`);
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Error downloading PDF: ' + error.message);
  } finally {
    setDownloading(prev => ({ ...prev, [voucherId]: false }));
  }
};

  // Handle Delete Invoice
  const handleDeleteInvoice = async (invoice) => {
    const voucherId = invoice.originalData?.VoucherID || invoice.id;
    const invoiceNumber = invoice.number;
    
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone and will update stock values.`)) {
      return;
    }
    
    try {
      setDeleting(prev => ({ ...prev, [voucherId]: true }));
      
      const response = await fetch(`${baseurl}/transactions/${voucherId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      const result = await response.json();
      
      // Remove from local state
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      
      alert('Invoice deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice: ' + error.message);
    } finally {
      setDeleting(prev => ({ ...prev, [voucherId]: false }));
    }
  };

  const handleInvoiceNumberClick = async (invoice) => {
    console.log('Opening preview for invoice:', invoice);
    
    try {
      const voucherId = invoice.originalData?.VoucherID || invoice.VoucherID;
      
      if (!voucherId) {
        throw new Error('VoucherID not found in invoice data');
      }
      
      console.log('Fetching details for VoucherID:', voucherId);
      
      // Fetch complete invoice data including batch details
      const response = await fetch(`${baseurl}/transactions/${voucherId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const invoiceDetails = await response.json();
      console.log('Complete invoice details:', invoiceDetails);

      // Parse batch details if they exist
      let items = [];
      let batchDetails = [];
      
      try {
        if (invoiceDetails.data.batch_details) {
          batchDetails = Array.isArray(invoiceDetails.data.batch_details) 
            ? invoiceDetails.data.batch_details 
            : JSON.parse(invoiceDetails.data.batch_details || '[]');
          
          items = batchDetails.map((batch, index) => ({
            id: index + 1,
            product: batch.product || 'Product',
            description: batch.description || `Batch: ${batch.batch}`,
            quantity: parseFloat(batch.quantity) || 0,
            price: parseFloat(batch.price) || 0,
            discount: parseFloat(batch.discount) || 0,
            gst: parseFloat(batch.gst) || 0,
            total: (parseFloat(batch.quantity) * parseFloat(batch.price)).toFixed(2),
            batch: batch.batch || '',
            batchDetails: batch.batchDetails || null
          }));
        }
      } catch (error) {
        console.error('Error parsing batch details:', error);
      }

      // Calculate GST breakdown
      const totalCGST = parseFloat(invoiceDetails.data.CGSTAmount) || 0;
      const totalSGST = parseFloat(invoiceDetails.data.SGSTAmount) || 0;
      const totalIGST = parseFloat(invoiceDetails.data.IGSTAmount) || 0;
      const totalGST = totalCGST + totalSGST + totalIGST;
      const taxableAmount = parseFloat(invoiceDetails.data.BasicAmount) || parseFloat(invoiceDetails.data.Subtotal) || 0;
      const grandTotal = parseFloat(invoiceDetails.data.TotalAmount) || 0;

      // Prepare the data for preview
      const previewData = {
        invoiceNumber: invoiceDetails.data.InvoiceNumber || invoiceDetails.data.VchNo || invoice.number,
        invoiceDate: invoiceDetails.data.Date || invoice.created,
        validityDate: new Date(new Date(invoiceDetails.data.Date || invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        companyInfo: {
          name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
          address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
          email: "sumukhuri7@gmail.com",
          phone: "3456548878543",
          gstin: "ZAAABCD0508B1ZG",
          state: "Karnataka"
        },
        supplierInfo: {
          name: invoiceDetails.data.PartyName || 'N/A',
          businessName: invoiceDetails.data.AccountName || 'N/A',
          state: invoiceDetails.data.billing_state || invoiceDetails.data.BillingState || 'Karnataka',
          gstin: invoiceDetails.data.GSTIN || invoiceDetails.data.gstin || 'ZAAACDE1234F225'
        },
        billingAddress: {
          addressLine1: invoiceDetails.data.BillingAddress || invoiceDetails.data.billing_address_line1 || '12/A Church Street',
          addressLine2: invoiceDetails.data.billing_address_line2 || 'Near Main Square',
          city: invoiceDetails.data.BillingCity || invoiceDetails.data.billing_city || 'Bangalore',
          pincode: invoiceDetails.data.BillingPincode || invoiceDetails.data.billing_pin_code || '560001',
          state: invoiceDetails.data.BillingState || invoiceDetails.data.billing_state || 'Karnataka'
        },
        shippingAddress: {
          addressLine1: invoiceDetails.data.ShippingAddress || invoiceDetails.data.shipping_address_line1 || invoiceDetails.data.BillingAddress || invoiceDetails.data.billing_address_line1 || '12/A Church Street',
          addressLine2: invoiceDetails.data.shipping_address_line2 || invoiceDetails.data.billing_address_line2 || 'Near Main Square',
          city: invoiceDetails.data.ShippingCity || invoiceDetails.data.shipping_city || invoiceDetails.data.BillingCity || invoiceDetails.data.billing_city || 'Bangalore',
          pincode: invoiceDetails.data.ShippingPincode || invoiceDetails.data.shipping_pin_code || invoiceDetails.data.BillingPincode || invoiceDetails.data.billing_pin_code || '560001',
          state: invoiceDetails.data.ShippingState || invoiceDetails.data.shipping_state || invoiceDetails.data.BillingState || invoiceDetails.data.billing_state || 'Karnataka'
        },
        items: items,
        note: invoiceDetails.data.Notes || invoiceDetails.data.notes || 'Thank you for your business! We appreciate your timely payment.',
        taxableAmount: taxableAmount,
        totalGST: totalGST,
        totalCess: invoiceDetails.data.TotalCess || 0,
        grandTotal: grandTotal,
        transportDetails: invoiceDetails.data.TransportDetails || invoiceDetails.data.transport_details || 'Standard delivery. Contact us for tracking information.',
        additionalCharge: invoiceDetails.data.AdditionalCharge || '',
        additionalChargeAmount: invoiceDetails.data.AdditionalChargeAmount || 0,
        otherDetails: "Authorized Signatory",
        taxType: totalIGST > 0 ? "IGST" : "CGST/SGST",
        batchDetails: batchDetails,
        // GST Breakdown
        totalCGST: totalCGST,
        totalSGST: totalSGST,
        totalIGST: totalIGST,
        // Store the VoucherID for the preview page
        voucherId: voucherId
      };

      console.log('Preview data prepared:', previewData);

      // Save to localStorage for the preview component
      localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
      // Navigate to preview page WITH the ID
      navigate(`/sales/invoice-preview/${voucherId}`);
      
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      // Fallback: Create basic preview data with available information
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
          name: invoice.originalData?.PartyName || 'John A',
          businessName: invoice.originalData?.AccountName || 'John Traders',
          state: 'Karnataka',
          gstin: 'ZAAACDE1234F225'
        },
        billingAddress: {
          addressLine1: '12/A Church Street',
          addressLine2: 'Near Main Square',
          city: 'Bangalore',
          pincode: '560001',
          state: 'Karnataka'
        },
        shippingAddress: {
          addressLine1: '12/A Church Street',
          addressLine2: 'Near Main Square',
          city: 'Bangalore',
          pincode: '560001',
          state: 'Karnataka'
        },
        items: [{
          id: 1,
          product: 'Product',
          description: '',
          quantity: 1,
          price: parseFloat(invoice.originalData?.TotalAmount) || 0,
          discount: 0,
          gst: 18,
          cgst: 9,
          sgst: 9,
          igst: 0,
          cess: 0,
          total: parseFloat(invoice.originalData?.TotalAmount) || 0,
          batch: '',
          batchDetails: null
        }],
        note: 'Thank you for your business! We appreciate your timely payment.',
        taxableAmount: parseFloat(invoice.originalData?.BasicAmount) || parseFloat(invoice.originalData?.TotalAmount) || 0,
        totalGST: parseFloat(invoice.originalData?.TaxAmount) || 0,
        totalCess: 0,
        grandTotal: parseFloat(invoice.originalData?.TotalAmount) || 0,
        transportDetails: 'Standard delivery. Contact us for tracking information.',
        additionalCharge: '',
        additionalChargeAmount: 0,
        otherDetails: "Authorized Signatory",
        taxType: "CGST/SGST",
        batchDetails: [],
        totalCGST: parseFloat(invoice.originalData?.CGSTAmount) || 0,
        totalSGST: parseFloat(invoice.originalData?.SGSTAmount) || 0,
        totalIGST: parseFloat(invoice.originalData?.IGSTAmount) || 0,
        voucherId: invoice.originalData?.VoucherID || 'fallback'
      };

      localStorage.setItem('previewInvoice', JSON.stringify(fallbackPreviewData));
      
      // Navigate with fallback ID or to generic preview
      const fallbackId = invoice.originalData?.VoucherID || 'fallback';
      navigate(`/sales/invoice-preview/${fallbackId}`);
    }
  };

  // Table columns configuration with actions
 // Table columns configuration with actions
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
      if (!row?.created) return "-";
      const date = new Date(row.created);
      return date.toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric" 
      });
    }
  },
  {
    key: 'pdfStatus',
    title: 'PDF STATUS',
    style: { textAlign: 'center' },
    render: (value, row) => (
      <span className={`badge ${row.hasPDF ? 'bg-success' : 'bg-warning'}`}>
        {row.hasPDF ? 'Available' : 'Not Generated'}
      </span>
    )
  },
  {
    key: 'actions',
    title: 'ACTIONS',
    style: { textAlign: 'center' },
    render: (value, row) => (
      <div className="d-flex justify-content-center gap-2">
        {/* Download PDF Button */}
        <button
          className={`btn btn-sm ${row.hasPDF ? 'btn-success' : 'btn-outline-warning'}`}
          onClick={() => handleDownloadPDF(row)}
          disabled={downloading[row.id]}
          title={row.hasPDF ? 'Download PDF' : 'Generate and Download PDF'}
        >
          {downloading[row.id] ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : row.hasPDF ? (
            <>
              <FaDownload className="me-1" />
              {/* Download */}
            </>
          ) : (
            <>
              <FaFilePdf className="me-1" />
              Generate PDF
            </>
          )}
        </button>
        
        {/* Delete Button */}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDeleteInvoice(row)}
          disabled={deleting[row.id]}
          title="Delete Invoice"
        >
          {deleting[row.id] ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <FaTrash />
          )}
        </button>
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