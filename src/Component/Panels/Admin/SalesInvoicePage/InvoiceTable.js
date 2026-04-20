import React, { useState, useEffect, useRef  } from 'react';
  import { useNavigate } from 'react-router-dom';
  import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
  import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
  import ReusableTable from '../../../Layouts/TableLayout/DataTable';
  import { baseurl } from "../../../BaseURL/BaseURL"
  import './Invoices.css';
  import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';
  import Select from "react-select";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoicesPDF from '../SalesInvoicePage/TablePdf/InvoicesPDF'; 
import { saveAs } from 'file-saver';


const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const getCurrentMonthYear = () => {
  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[today.getMonth()];
  const currentYear = today.getFullYear().toString();
  return { month: currentMonth, year: currentYear };
};



  const getFirstDayOfCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};
  const InvoicesTable = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState({});
    const [deleting, setDeleting] = useState({});
const [isDownloading, setIsDownloading] = useState(false);
const [unitData, setUnitData] = useState({});
const [qrDataUrl, setQrDataUrl] = useState(null);
const [qrAmount, setQrAmount] = useState(null);


const [isRangeDownloading, setIsRangeDownloading] = useState(false);
const pdfRef = useRef();
    const [activeTab, setActiveTab] = useState('Invoices');
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
const [month, setMonth] = useState(currentMonth);
const [year, setYear] = useState(currentYear);
const [startDate, setStartDate] = useState(getFirstDayOfCurrentMonth());
const [endDate, setEndDate] = useState(getCurrentDate());

  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
    const y = 2025 + i;
    return { value: y, label: y };
  });
    // Fetch invoices from API
    useEffect(() => {
      fetchInvoices();
    }, []);

  // Apply table date filter when filter button is clicked
  const applyTableDateFilter = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be after end date');
      return;
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const filtered = invoices.filter(invoice => {
      if (!invoice.created) return false;
      const invoiceDate = new Date(invoice.created);
      return invoiceDate >= start && invoiceDate <= end;
    });
    
    setFilteredInvoices(filtered);
    
    if (filtered.length === 0) {
      alert(`No invoices found from ${startDate} to ${endDate}`);
    } else {
      alert(`Found ${filtered.length} invoice(s) from ${startDate} to ${endDate}`);
    }
  };

  // Reset table filter to show all invoices
  const resetTableFilter = () => {
    setFilteredInvoices(invoices);
    alert(`Showing all ${invoices.length} invoices`);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      
      const filteredTransactions = data.filter(transaction => 
        transaction.TransactionType === 'Sales'
      );
      
      const transformedInvoices = filteredTransactions.map(invoice => ({
        id: invoice.VoucherID,
        transactionType: invoice.TransactionType,
        customerName: invoice.PartyName || 'N/A',
        number: invoice.InvoiceNumber || `INV-${invoice.VoucherID}`,
        totalAmount: `₹ ${parseFloat(invoice.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        status: invoice.status,
        created: invoice.Date || invoice.EntryDate?.split('T')[0] || 'N/A',
         document_type: invoice.document_type || "",
        originalData: invoice,
        hasPDF: !!invoice.pdf_data,
        orderNumber: invoice.order_number || 'No Order',
        hasOrder: !!invoice.order_number 
      }));
      
      setInvoices(transformedInvoices);
      setFilteredInvoices(transformedInvoices);
      setLoading(false);
      
      // Log summary
      const withOrder = filteredTransactions.filter(t => t.order_number).length;
      const withoutOrder = filteredTransactions.filter(t => !t.order_number).length;
      
      
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchPaymentDataForInvoices = async () => {
      if (invoices.length === 0) return;
      
      const updatedInvoices = [...invoices];
      
      for (let i = 0; i < updatedInvoices.length; i++) {
        const invoice = updatedInvoices[i];
        try {
          const response = await fetch(`${baseurl}/invoices/${invoice.number}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              updatedInvoices[i] = {
                ...invoice,
                originalData: {
                  ...invoice.originalData,
                  receipts: result.data.receipts || [],
                  creditnotes: result.data.creditnotes || []
                }
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching payment data for ${invoice.number}:`, error);
        }
      }
      
      setInvoices(updatedInvoices);
    };

    if (invoices.length > 0) {
      fetchPaymentDataForInvoices();
    }
  }, [invoices.length]); 

  const canDeleteInvoice = (invoice) => {
    const hasReceipts = invoice.originalData?.receipts?.length > 0;
    const hasCreditNotes = invoice.originalData?.creditnotes?.length > 0;
    return !(hasReceipts || hasCreditNotes);
  };


  // Filter invoices by date range
const filterInvoicesByDateRange = (invoices, start, end) => {
  if (!start || !end) return invoices;
  
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  
  return invoices.filter(invoice => {
    if (!invoice.created) return false;
    const invoiceDate = new Date(invoice.created);
    return invoiceDate >= startDate && invoiceDate <= endDate;
  });
};

// Filter invoices by month and year
const filterInvoicesByMonthYear = (invoices, month, year) => {
  if (!month || !year) return invoices;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.indexOf(month);
  
  return invoices.filter(invoice => {
    if (!invoice.created) return false;
    const invoiceDate = new Date(invoice.created);
    return invoiceDate.getMonth() === monthIndex && 
           invoiceDate.getFullYear() === parseInt(year);
  });
};

const generatePDF = async (filteredData, type = 'month') => {
  if (!filteredData || filteredData.length === 0) {
    alert('No invoices found for the selected period');
    return;
  }

  try {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    // Use ReactDOM to render the component
    const ReactDOM = require('react-dom');
    await new Promise((resolve) => {
      ReactDOM.render(
        <InvoicesPDF 
          ref={pdfRef}
          invoices={filteredData}
          startDate={type === 'range' ? startDate : null}
          endDate={type === 'range' ? endDate : null}
          month={type === 'month' ? month : null}
          year={type === 'month' ? year : null}
           title="Sales Invoices Report" 
        />,
        element,
        resolve
      );
    });

    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);

    // Generate filename
    let filename = 'invoices_report';
    if (type === 'range') {
      filename = `invoices_${startDate}_to_${endDate}.pdf`;
    } else {
      filename = `invoices_${month}_${year}.pdf`;
    }

    // Save PDF
    pdf.save(filename);

    // Cleanup
    ReactDOM.unmountComponentAtNode(element);
    document.body.removeChild(element);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
  }
};



const transformApiDataToInvoiceFormat = (apiData) => {
  console.log('Transforming API data for print:', apiData);

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
    const original_price = parseFloat(batch.original_price) || 0;
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
      hsn_code: batch.hsn_code || '',
      quantity: quantity,
      price: price,
      discount: discount,
      gst: gst,
      original_price: original_price,
       unit_id: batch.unit_id || null,  
    unit_name: batch.unit_name || '',  
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      cess: cess,
      total: total.toFixed(2),
      batch: batch.batch || '',
      batch_id: batch.batch_id || '',
      product_id: batch.product_id || '',
      assigned_staff: batch.assigned_staff || apiData.assigned_staff || 'N/A'
    };
  }) || [];

  const taxableAmount = parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
  const totalGST = parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
  const grandTotal = parseFloat(apiData.TotalAmount) || 0;
  const roundOff = parseFloat(apiData.round_off) || 0;
  const transportDetails = {
    transport: apiData.transport_name || apiData.transport || '',
    grNumber: apiData.gr_rr_number || apiData.grNumber || '',
    vehicleNo: apiData.vehicle_number || apiData.vehicleNo || '',
    station: apiData.station_name || apiData.station || ''
  };
  
  const assignedStaff = apiData.assigned_staff || apiData.AssignedStaff || apiData.staff_name || 'N/A';
  const staffId = apiData.staffid || apiData.staff_id || null;

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
      business_name: apiData.business_name || '',
      account_name: apiData.account_name || apiData.AccountName || 'Business',
      gstin: apiData.gstin || '',
      state: apiData.billing_state || apiData.BillingState || '',
      id: apiData.PartyID || null,
      staffid: staffId,
      assigned_staff: assignedStaff,
      mobile_number: apiData.retailer_mobile || apiData.mobile_number || apiData.customer_mobile || '',
      phone_number: apiData.phone_number || ''
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
      hsn_code: apiData.hsn_code || '',
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
      product_id: '',
      assigned_staff: assignedStaff
    }],
    taxableAmount: taxableAmount.toFixed(2),
    totalGST: totalGST.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    totalCess: "0.00",
      roundOff: roundOff.toFixed(2),
        document_type: apiData.document_type || "",
    note: apiData.Notes || "Thank you for your business!",
    transportDetails: transportDetails,
    additionalCharge: "",
     bb_bc: apiData.bb_bc || 'b2b', 
    additionalChargeAmount: "0.00",
    totalCGST: parseFloat(apiData.CGSTAmount) || 0,
    totalSGST: parseFloat(apiData.SGSTAmount) || 0,
    totalIGST: parseFloat(apiData.IGSTAmount) || 0,
    taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST",
    staffid: staffId,
    assigned_staff: assignedStaff
  };
};
const fetchUnitName = async (unitId) => {
  if (!unitId || unitId === 'null' || unitId === null) return;
  if (unitData[unitId]) return;
  
  try {
    const res = await fetch(`${baseurl}/units/${unitId}`);
    const data = await res.json();
    setUnitData(prev => ({ ...prev, [unitId]: data.name }));
  } catch (err) {
    console.error(err);
  }
};

// Add this function to generate QR code
const generateQRCodeDataUrl = (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const grandTotal = parseFloat(invoiceData.grandTotal) || 0;
      const upiId = "shreeshashwatrajagroprivatelimited@sbi";
      const payeeName = "SHREE SHASHWATRAJ AGRO PVT LTD";
      
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;
      
      const QRCode = require('qrcode');
      QRCode.toDataURL(upiString, { errorCorrectionLevel: 'H', margin: 1, width: 150 }, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve({ qrDataUrl: url, qrAmount: grandTotal });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const handlePrintInvoice = async (invoice) => {
  try {
    const voucherId = invoice.originalData?.VoucherID || invoice.id;
    
    if (!voucherId) {
      throw new Error('Voucher ID not found');
    }

    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice data');
    }
    
    const result = await response.json();
    const apiData = result.data || result;
    
    const transformedData = transformApiDataToInvoiceFormat(apiData);
    
    // Fetch unit data for all items
    if (transformedData.items && transformedData.items.length > 0) {
      for (const item of transformedData.items) {
        if (item.unit_id && item.unit_id !== 'null' && item.unit_id !== null) {
          await fetchUnitName(item.unit_id);
        }
      }
    }
    
    // Generate QR code
    let qrDataUrl = null;
    let qrAmount = null;
    try {
      const qrResult = await generateQRCodeDataUrl(transformedData);
      qrDataUrl = qrResult.qrDataUrl;
      qrAmount = qrResult.qrAmount;
    } catch (qrError) {
      console.error('QR generation error:', qrError);
    }
    
    // ✅ PASS bb_bc and document_type to PDF
    await generateAndPrintPDF(transformedData, invoice.number, unitData, qrDataUrl, qrAmount);
    
  } catch (error) {
    console.error('Error printing invoice:', error);
    alert('Failed to generate PDF: ' + error.message);
  }
};

// Update the generateAndPrintPDF function to accept and pass bb_bc
const generateAndPrintPDF = async (invoiceData, invoiceNumber, unitData, qrDataUrl, qrAmount) => {
  try {
    const reactPdf = await import('@react-pdf/renderer');
    const pdf = reactPdf.pdf;
    
    const SalesPdfDocument = (await import('../SalesInvoicePage/SalesPdfDocument')).default;
    
    // Calculate GST breakdown
    const calculateGSTBreakdown = () => {
      if (!invoiceData || !invoiceData.items) return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };

      const totalCGST = invoiceData.items.reduce((sum, item) => {
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

      const totalSGST = invoiceData.items.reduce((sum, item) => {
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

      const totalIGST = invoiceData.items.reduce((sum, item) => {
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

    const gstBreakdown = calculateGSTBreakdown();
    const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

    // ✅ Ensure invoiceData has bb_bc and document_type
    const pdfDoc = (
      <SalesPdfDocument
        invoiceData={{
          ...invoiceData,
          bb_bc: invoiceData.bb_bc || 'b2b',  // ✅ PASS bb_bc
          document_type: invoiceData.document_type || '',  // ✅ PASS document_type
        }}
        invoiceNumber={invoiceData.invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
        unitData={unitData}
        qrDataUrl={qrDataUrl}
        qrAmount={qrAmount || parseFloat(invoiceData.grandTotal)}
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
      a.download = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }

    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};
  const handleDeleteInvoice = async (invoice) => {
    const hasReceipts = invoice.originalData?.receipts?.length > 0;
    const hasCreditNotes = invoice.originalData?.creditnotes?.length > 0;
    
    if (hasReceipts || hasCreditNotes) {
      alert('Cannot delete: Invoice has receipts/credit notes');
      return;
    }
    
    const voucherId = invoice.originalData?.VoucherID || invoice.id;
    
    if (!window.confirm(`Delete invoice ${invoice.number}?`)) return;
    
    try {
      setDeleting(prev => ({ ...prev, [voucherId]: true }));
      
      const response = await fetch(`${baseurl}/transactions/${voucherId}`, { method: 'DELETE' });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      alert('Invoice deleted!');
      
    } catch (error) {
      alert('Error: ' + error.message);
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
            name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        gstin: "10AAOCS1541B1ZZ",
        state: "Bihar"
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
          totalCGST: totalCGST,
          totalSGST: totalSGST,
          totalIGST: totalIGST,
          voucherId: voucherId
        };

        console.log('Preview data prepared:', previewData);

        localStorage.setItem('previewInvoice', JSON.stringify(previewData));
        
        navigate(`/sales/invoice-preview/${voucherId}`);
        
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        const fallbackPreviewData = {
          invoiceNumber: invoice.number,
          invoiceDate: invoice.created,
          validityDate: new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          companyInfo: {
                  name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        gstin: "10AAOCS1541B1ZZ",
        state: "Bihar"
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
        
        const fallbackId = invoice.originalData?.VoucherID || 'fallback';
        navigate(`/sales/invoice-preview/${fallbackId}`);
      }
    };

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
    key: 'status',
    title: 'PAYMENT STATUS',
    style: { textAlign: 'center' },
    render: (value) => value || 'Pending'
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
    key: 'actions',
    title: 'ACTION',
    style: { textAlign: 'center' },
    render: (value, row) => {
      const canDelete = canDeleteInvoice(row);
      
      return (
        <div className="d-flex justify-content-center gap-2">
      <button
  className="btn btn-sm btn-success"
  onClick={() => handlePrintInvoice(row)}
  title="Print Invoice"
>
  <FaFilePdf className="me-1" /> 
</button>
          
        
          <button
            className={`btn btn-sm ${canDelete ? 'btn-outline-danger' : 'btn-secondary'}`}
            onClick={() => {
              if (!canDelete) {
                alert('Cannot delete: Invoice has receipts/credit notes');
                return;
              }
              handleDeleteInvoice(row);
            }}
            disabled={deleting[row.id] || !canDelete}
            title={canDelete ? 'Delete' : 'Has receipts/credit notes'}
          >
            {deleting[row.id] ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <FaTrash />
            )}
          </button>
        </div>
      );
    }
  }
];

    const handleCreateClick = () => navigate("/sales/createinvoice");

    // Define tabs with their corresponding routes
    const tabs = [
      { name: 'Invoices', path: '/sales/invoices' },
      { name: 'Receipts', path: '/sales/receipts' },
      // { name: 'Quotations', path: '/sales/quotations' },
      // { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
      { name: 'CreditNote', path: '/sales/credit_note' },
      // { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
      // { name: 'Receivables', path: '/sales/receivables' }
    ];

    // Handle tab click - navigate to corresponding route
    const handleTabClick = (tab) => {
      setActiveTab(tab.name);
      navigate(tab.path);
    };
const handleDownload = async () => {
  try {
    setIsDownloading(true);
    
    // Filter invoices by selected month and year
    const filteredInvoices = filterInvoicesByMonthYear(invoices, month, year);
    
    if (filteredInvoices.length === 0) {
      alert(`⚠️ No invoices found for ${month} ${year}`);
      setIsDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredInvoices.length} invoices for:`, month, year);
    
    // Generate PDF
    await generatePDF(filteredInvoices, 'month');
    
    // Success alert
    alert(`✅ Successfully downloaded ${filteredInvoices.length} invoice(s) for ${month} ${year}`);
    
  } catch (err) {
    console.error('Download error:', err);
    alert(`❌ Error downloading invoices: ${err.message}`);
  } finally {
    setIsDownloading(false);
  }
};


const handleDownloadRange = async () => {
  try {
    if (!startDate || !endDate) {
      alert('⚠️ Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('⚠️ Start date cannot be after end date');
      return;
    }

    setIsRangeDownloading(true);
    
    // Filter invoices by date range
    const filteredInvoices = filterInvoicesByDateRange(invoices, startDate, endDate);
    
    if (filteredInvoices.length === 0) {
      alert(`⚠️ No invoices found from ${startDate} to ${endDate}`);
      setIsRangeDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredInvoices.length} invoices for date range:`, startDate, 'to', endDate);
    
    // Generate PDF
    await generatePDF(filteredInvoices, 'range');
    
    // Format dates for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    // Success alert
    alert(`✅ Successfully downloaded ${filteredInvoices.length} invoice(s) from ${formatDate(startDate)} to ${formatDate(endDate)}`);
    
  } catch (err) {
    console.error('Download range error:', err);
    alert(`❌ Error downloading invoices: ${err.message}`);
  } finally {
    setIsRangeDownloading(false);
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

          <Select
            options={yearOptions}
            value={{ value: year, label: year }}
            onChange={(selected) => setYear(selected.value)}
            maxMenuHeight={150}
            styles={{
              control: (provided) => ({
                ...provided,
                width: '100px',
                minWidth: '100px',
              }),
              menu: (provided) => ({
                ...provided,
                width: '100px',
                minWidth: '100px',
              }),
              option: (provided) => ({
                ...provided,
                whiteSpace: 'nowrap',
                padding: '8px 12px',
              })
            }}
          />
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

    {/* Filter and Reset Buttons using existing date pickers */}
    <div className="row mb-4">
      <div className="col-12">
        <div className="d-flex gap-2 align-items-center">
          <button 
            className="btn btn-outline-primary" 
            onClick={applyTableDateFilter}
          >
            <i className="bi bi-funnel me-1"></i> Add Filter
          </button>
          <button 
            className="btn btn-outline-secondary" 
            onClick={resetTableFilter}
          >
            <i className="bi bi-arrow-repeat me-1"></i> Clear Date
          </button>
      
        </div>
      </div>
    </div>

    {/* Table */}
    <ReusableTable
      title="Sales Invoices"
      data={filteredInvoices}
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