import React, { useState, useEffect ,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';
import './PurchaseInvoice.css';
  import Select from "react-select";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PurchaseInvoicePDF from '../PurchaseInvoicePage/PurchaseInvoicePDF'; 


const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFirstDayOfCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const getCurrentMonthYear = () => {
  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[today.getMonth()];
  const currentYear = today.getFullYear().toString();
  return { month: currentMonth, year: currentYear };
};
const KachaPurchaseInvoiceTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Purchase Invoice');
  const navigate = useNavigate();
  const [filteredPurchaseInvoices, setFilteredPurchaseInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [unitData, setUnitData] = useState({});
const [qrDataUrl, setQrDataUrl] = useState(null);
const [qrAmount, setQrAmount] = useState(null);
const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
const [month, setMonth] = useState(currentMonth);
const [year, setYear] = useState(currentYear);
const [startDate, setStartDate] = useState(getFirstDayOfCurrentMonth());
const [endDate, setEndDate] = useState(getCurrentDate());    const [deleting, setDeleting] = useState({});
    const [isDownloading, setIsDownloading] = useState(false);
const [isRangeDownloading, setIsRangeDownloading] = useState(false);
const pdfRef = useRef();
  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
  const y = 2025 + i;
  return { value: y, label: y };
});


  useEffect(() => {
    fetchPurchaseInvoices();
  }, []);
  // Apply table date filter to show filtered results in table
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
  
  const filtered = purchaseInvoices.filter(invoice => {
    if (!invoice.created) return false;
    const invoiceDate = new Date(invoice.created);
    return invoiceDate >= start && invoiceDate <= end;
  });
  
  setFilteredPurchaseInvoices(filtered);
  
  if (filtered.length === 0) {
    alert(`No Kacha purchase invoices found from ${startDate} to ${endDate}`);
  } else {
    alert(`Found ${filtered.length} Kacha purchase invoice(s) from ${startDate} to ${endDate}`);
  }
};

const resetTableFilter = () => {
  setFilteredPurchaseInvoices(purchaseInvoices);
  alert(`Showing all ${purchaseInvoices.length} Kacha purchase invoices`);
};

const fetchPurchaseInvoices = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/transactions`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch purchase invoices: ${response.status}`);
    }
    
    const data = await response.json();
    
    const purchaseInvoicesData = data.filter(transaction => 
      transaction.TransactionType === 'stock inward'
    );
    
    console.log('Raw purchase data:', purchaseInvoicesData);
    
    const transformedInvoices = purchaseInvoicesData.map(invoice => ({
      id: invoice.VoucherID,
      supplier: invoice.PartyName || invoice.AccountName || 'N/A',
      pinvoice: invoice.InvoiceNumber || `PUR-${invoice.VchNo || invoice.VoucherID}`,
      totalAmount: `₹ ${parseFloat(invoice.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      status: invoice.status,
      created: formatDate(invoice.Date || invoice.EntryDate),
      originalData: invoice // Keep original data for reference
    }));
    
    setPurchaseInvoices(transformedInvoices);
    setFilteredPurchaseInvoices(transformedInvoices);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching purchase invoices:', err);
    setError(err.message);
    setLoading(false);
  }
};

const handleInvoiceNumberClick = async (invoice) => {
  console.log('Opening preview for invoice:', invoice);
  
  try {
    // Get the VoucherID from the correct location
    const voucherId = invoice.originalData?.VoucherID || invoice.VoucherID;
    
    if (!voucherId) {
      throw new Error('VoucherID not found in invoice data');
    }
    
    console.log('Fetching details for VoucherID:', voucherId);
    
    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice details');
    }
    
    const invoiceDetails = await response.json();
    console.log('Complete invoice details:', invoiceDetails);

    // Parse batch details if they exist
    let items = [];
    let batchDetails = [];
    
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

    // Calculate GST breakdown
    const totalCGST = parseFloat(invoiceDetails.CGSTAmount) || 0;
    const totalSGST = parseFloat(invoiceDetails.SGSTAmount) || 0;
    const totalIGST = parseFloat(invoiceDetails.IGSTAmount) || 0;
    const totalGST = totalCGST + totalSGST + totalIGST;
    const taxableAmount = parseFloat(invoiceDetails.BasicAmount) || parseFloat(invoiceDetails.Subtotal) || 0;
    const grandTotal = parseFloat(invoiceDetails.TotalAmount) || 0;

    // Prepare the data for preview in the same format as CreateInvoice
    const previewData = {
      invoiceNumber: invoiceDetails.InvoiceNumber || invoiceDetails.VchNo || invoice.number,
      invoiceDate: invoiceDetails.Date || invoice.created,
      validityDate: new Date(new Date(invoiceDetails.Date || invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
              name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
      address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
      email: "spmathur56@gmail.com",
      phone: "9801049700",
      gstin: "10AAOCS1541B1ZZ",
      state: "Bihar"
      },
      supplierInfo: {
        name: invoiceDetails.PartyName || 'N/A',
        businessName: invoiceDetails.AccountName || 'N/A',
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
      items: items,
      note: invoiceDetails.Notes || invoiceDetails.notes || 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: taxableAmount,
      totalGST: totalGST,
      totalCess: invoiceDetails.TotalCess || 0,
      grandTotal: grandTotal,
      transportDetails: invoiceDetails.TransportDetails || invoiceDetails.transport_details || 'Standard delivery. Contact us for tracking information.',
      additionalCharge: invoiceDetails.AdditionalCharge || '',
      additionalChargeAmount: invoiceDetails.AdditionalChargeAmount || 0,
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

    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    navigate(`/kachapurchasepdf/${voucherId}`);
    
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
        product: 'Oppo',
        description: '',
        quantity: 2,
        price: 47200.00,
        discount: 0,
        gst: 18,
        cgst: 9,
        sgst: 9,
        igst: 0,
        cess: 0,
        total: 111392.00,
        batch: '',
        batchDetails: null
      }],
      note: 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: 94400.00,
      totalGST: 16992.00,
      totalCess: 0,
      grandTotal: 111392.00,
      transportDetails: 'Standard delivery. Contact us for tracking information.',
      additionalCharge: '',
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: [],
      totalCGST: 8496.00,
      totalSGST: 8496.00,
      totalIGST: 0,
      voucherId: invoice.originalData?.VoucherID || 'fallback'
    };

    localStorage.setItem('previewInvoice', JSON.stringify(fallbackPreviewData));
    
    const fallbackId = invoice.originalData?.VoucherID || 'fallback';
    navigate(`/purchase/invoice-preview/${fallbackId}`);
  }
};



const fetchUnitName = async (unitId) => {
  if (!unitId || unitId === 'null' || unitId === null) return;
  if (unitData[unitId]) return;
  
  try {
    const res = await fetch(`${baseurl}/units/${unitId}`);
    const data = await res.json();
    setUnitData(prev => ({ ...prev, [unitId]: data.name }));
  } catch (err) {
    console.error('Error fetching unit:', err);
  }
};

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
const canDeleteKachaPurchaseInvoice = (invoice) => {
  const hasVouchers = invoice.originalData?.purchasevoucher?.length > 0;
  const hasDebitNotes = invoice.originalData?.debitNotes?.length > 0;
  return !(hasVouchers || hasDebitNotes);
};

// Add this after fetchPurchaseInvoices() and before handleDeleteInvoice
useEffect(() => {
  const fetchPaymentDataForInvoices = async () => {
    if (purchaseInvoices.length === 0) return;
    
    const updatedInvoices = [...purchaseInvoices];
    
    for (let i = 0; i < updatedInvoices.length; i++) {
      const invoice = updatedInvoices[i];
      const invoiceNumber = invoice.pinvoice || invoice.originalData?.InvoiceNumber;
      
      if (!invoiceNumber) continue;
      
      try {
        console.log(`Fetching payment data for stock inward: ${invoiceNumber}`);
        const response = await fetch(`${baseurl}/invoices/${invoiceNumber}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const purchasevoucher = result.data.purchasevoucher || [];
            const allEntries = result.data.allEntries || [];
            
            const debitNotes = allEntries.filter(entry => 
              entry.TransactionType === 'DebitNote'
            );
            
            updatedInvoices[i] = {
              ...invoice,
              originalData: {
                ...invoice.originalData,
                purchasevoucher: purchasevoucher,
                debitNotes: debitNotes
              }
            };
            
            console.log(`Stock inward ${invoiceNumber} has:`, {
              vouchers: purchasevoucher.length,
              debitNotes: debitNotes.length
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching payment data for ${invoiceNumber}:`, error);
      }
    }
    
    setPurchaseInvoices(updatedInvoices);
  };

  if (purchaseInvoices.length > 0) {
    fetchPaymentDataForInvoices();
  }
}, [purchaseInvoices.length]);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; 
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};


  const calculatePurchaseStats = () => {
    const totalInvoices = purchaseInvoices.reduce((sum, invoice) => {
      const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
      return sum + amount;
    }, 0);

    const paidInvoices = purchaseInvoices.filter(inv => inv.payment === 'Paid')
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
        return sum + amount;
      }, 0);

    const pendingInvoices = purchaseInvoices.filter(inv => inv.payment === 'Pending')
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
        return sum + amount;
      }, 0);

    const overdueInvoices = purchaseInvoices.filter(inv => inv.payment === 'Overdue')
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
        return sum + amount;
      }, 0);

    return [
      { 
        label: "Total Purchase Invoices", 
        value: `₹ ${totalInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "+18%", 
        type: "total" 
      },
      { 
        label: "Paid Invoices", 
        value: `₹ ${paidInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "+15%", 
        type: "paid" 
      },
      { 
        label: "Pending Invoices", 
        value: `₹ ${pendingInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "+8%", 
        type: "pending" 
      },
      { 
        label: "Overdue Payments", 
        value: `₹ ${overdueInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "-5%", 
        type: "overdue" 
      }
    ];
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

// Generate PDF using the PurchaseInvoicePDF component
const generatePDF = async (filteredData, type = 'month') => {
  if (!filteredData || filteredData.length === 0) {
    alert('No Kacha purchase invoices found for the selected period');
    return;
  }

  try {
    // Create a temporary div to render the PDF component
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    // Use ReactDOM to render the component
    const ReactDOM = require('react-dom');
    await new Promise((resolve) => {
      ReactDOM.render(
        <PurchaseInvoicePDF 
          ref={pdfRef}
          invoices={filteredData}
          startDate={type === 'range' ? startDate : null}
          endDate={type === 'range' ? endDate : null}
          month={type === 'month' ? month : null}
          year={type === 'month' ? year : null}
          title="Kacha Purchase Invoices Report" 
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
    let filename = 'kacha_purchase_invoices_report';
    if (type === 'range') {
      filename = `kacha_purchase_invoices_${startDate}_to_${endDate}.pdf`;
    } else {
      filename = `kacha_purchase_invoices_${month}_${year}.pdf`;
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
const handlePrintInvoice = async (invoice) => {
  try {
    const voucherId = invoice.originalData?.VoucherID || invoice.id;
    
    if (!voucherId) {
      throw new Error('Voucher ID not found');
    }

    console.log('Fetching stock inward invoice for print:', voucherId);

    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice data');
    }
    
    const result = await response.json();
    const apiData = result.data || result;
    
    const transformedData = transformKachaPurchaseDataToInvoiceFormat(apiData);
    
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
    
    await generateAndPrintKachaPurchasePDF(transformedData, invoice.pinvoice, unitData, qrDataUrl, qrAmount);
    
  } catch (error) {
    console.error('Error printing stock inward invoice:', error);
    alert('Failed to generate PDF: ' + error.message);
  }
};

// Add the transformation function for Kacha Purchase/Stock Inward data
const transformKachaPurchaseDataToInvoiceFormat = (apiData) => {
  console.log('Transforming Kacha Purchase API data:', apiData);

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
         unit_id: batch.unit_id || null, 
    unit_name: batch.unit_name || '',  
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
    const roundOff = parseFloat(apiData.round_off) || 0;

  const transportDetails = {
    transport: apiData.transport_name || apiData.transport || '',
    grNumber: apiData.gr_rr_number || apiData.grNumber || '',
    vehicleNo: apiData.vehicle_number || apiData.vehicleNo || '',
    station: apiData.station_name || apiData.station || ''
  };
  
  const mobileNumber = apiData.mobile_number || 
                       apiData.retailer_mobile || 
                       apiData.phone_number || 
                       apiData.supplier_mobile || 
                       '';

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
      name: apiData.PartyName || 'Supplier',
      businessName: apiData.business_name || 'Business',
      business_name: apiData.business_name || apiData.businessName || '',
      account_name: apiData.account_name || apiData.AccountName || '',
      gstin: apiData.gstin || '',
      state: apiData.billing_state || apiData.BillingState || '',
      id: apiData.PartyID || null,
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
      product_id: ''
    }],
    
    taxableAmount: taxableAmount.toFixed(2),
    totalGST: totalGST.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    totalCess: "0.00",
          roundOff: roundOff.toFixed(2),

    note: apiData.Notes || "Thank you for your business!",
    transportDetails: transportDetails,
    additionalCharge: "",
    additionalChargeAmount: "0.00",
    
    totalCGST: parseFloat(apiData.CGSTAmount) || 0,
    totalSGST: parseFloat(apiData.SGSTAmount) || 0,
    totalIGST: parseFloat(apiData.IGSTAmount) || 0,
    taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST",
    mobile_number: mobileNumber
  };
};

const generateAndPrintKachaPurchasePDF = async (invoiceData, invoiceNumber, unitData, qrDataUrl, qrAmount) => {
  try {
    const reactPdf = await import('@react-pdf/renderer');
    const pdf = reactPdf.pdf;
    
    const SalesPdfDocument = (await import('../SalesInvoicePage/SalesPdfDocument')).default;
    
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

    const pdfDoc = (
      <SalesPdfDocument 
        invoiceData={invoiceData}
        invoiceNumber={invoiceData.invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
        unitData={unitData}      // ← ADD THIS
        qrDataUrl={qrDataUrl}    // ← ADD THIS
        qrAmount={qrAmount}      // ← ADD THIS
      />
    );

    const blob = await pdf(pdfDoc).toBlob();
    
    const pdfUrl = URL.createObjectURL(blob);
    
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (!printWindow) {
      alert('Popup blocked. Please allow popups to print.');
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Kacha_Purchase_Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
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
    // Handle Delete Invoice
const handleDeleteInvoice = async (invoice) => {
  // Check if invoice has purchase vouchers or debit notes
  const hasVouchers = invoice.originalData?.purchasevoucher?.length > 0;
  const hasDebitNotes = invoice.originalData?.debitNotes?.length > 0;
  
  if (hasVouchers || hasDebitNotes) {
    alert('Cannot delete: This stock inward has vouchers/debit notes');
    return;
  }
  
  const voucherId = invoice.originalData?.VoucherID || invoice.id;
  const invoiceNumber = invoice.pinvoice || invoice.originalData?.InvoiceNumber;
  
  if (!window.confirm(`Delete stock inward ${invoiceNumber}?`)) return;
  
  try {
    setDeleting(prev => ({ ...prev, [voucherId]: true }));
    
    const response = await fetch(`${baseurl}/transactions/${voucherId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionType: 'stock inward',
        invoiceNumber: invoiceNumber
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete');
    }
    
    setPurchaseInvoices(prev => prev.filter(inv => {
      const invVoucherId = inv.originalData?.VoucherID || inv.id;
      return invVoucherId !== voucherId;
    }));
    
    alert('Stock inward deleted successfully!');
    
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    setDeleting(prev => ({ ...prev, [voucherId]: false }));
  }
};

  const purchaseInvoiceStats = calculatePurchaseStats();

  const tabs = [
    { name: ' Kacha Purchase Invoice', path: '/kachapurchaseinvoicetable' },
    // { name: 'Purchase Order', path: '/purchase/purchase-order' },
    { name: 'Voucher', path: '/kachaPurchasevoucher' },
    { name: 'Debit Note', path: '/kachadebitnotetable' },
    // { name: 'Payables', path: '/purchase/payables' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

const columns = [
  {
    key: 'supplier',
    title: 'SUPPLIER',
    style: { textAlign: 'left' }
  },
  {
    key: 'pinvoice',
    title: 'PURCHASE INVOICE',
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
  {
    key: 'totalAmount',
    title: 'TOTAL AMOUNT',
    style: { textAlign: 'center' }
  },
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
    title: 'ACTIONS',
    style: { textAlign: 'center' },
    render: (value, row) => {
      const canDelete = canDeleteKachaPurchaseInvoice(row);
      
      return (
        <div className="d-flex justify-content-center gap-2">
          {/* ✅ PRINT BUTTON - Green Success Color */}
          <button
            className="btn btn-sm btn-success"
            onClick={() => handlePrintInvoice(row)}
            title="Print Invoice"
          >
            <FaFilePdf className="me-1" /> 
          </button>
          
          {/* Delete Button - Disabled if has vouchers/debit notes */}
          <button
            className={`btn btn-sm ${canDelete ? 'btn-outline-danger' : 'btn-secondary'}`}
            onClick={() => {
              if (!canDelete) {
                alert('Cannot delete: This stock inward has vouchers/debit notes');
                return;
              }
              handleDeleteInvoice(row);
            }}
            disabled={deleting[row.id] || !canDelete}
            title={canDelete ? 'Delete' : 'Has vouchers/debit notes'}
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

  const handleCreateClick = () => {
    navigate("/kachapurchaseinvoice");
  };


const handleDownloadMonth = async () => {
  try {
    setIsDownloading(true);
    
    // Filter invoices by selected month and year
    const filteredInvoices = filterInvoicesByMonthYear(purchaseInvoices, month, year);
    
    if (filteredInvoices.length === 0) {
      alert(`⚠️ No Kacha purchase invoices found for ${month} ${year}`);
      setIsDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredInvoices.length} Kacha purchase invoices for:`, month, year);
    
    // Generate PDF
    await generatePDF(filteredInvoices, 'month');
    
    // ✅ SUCCESS ALERT
    alert(`✅ Successfully downloaded ${filteredInvoices.length} Kacha purchase invoice(s) for ${month} ${year}`);
    
  } catch (err) {
    console.error('Download error:', err);
    // ❌ ERROR ALERT
    alert(`❌ Error downloading Kacha purchase invoices: ${err.message}`);
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
    
    const filteredInvoices = filterInvoicesByDateRange(purchaseInvoices, startDate, endDate);
    
    if (filteredInvoices.length === 0) {
      alert(`⚠️ No Kacha purchase invoices found from ${startDate} to ${endDate}`);
      setIsRangeDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredInvoices.length} Kacha purchase invoices for date range:`, startDate, 'to', endDate);
    
    // Generate PDF
    await generatePDF(filteredInvoices, 'range');
    
    // Format dates for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    // ✅ SUCCESS ALERT
    alert(`✅ Successfully downloaded ${filteredInvoices.length} Kacha purchase invoice(s) from ${formatDate(startDate)} to ${formatDate(endDate)}`);
    
  } catch (err) {
    console.error('Download range error:', err);
    // ❌ ERROR ALERT
    alert(`❌ Error downloading Kacha purchase invoices: ${err.message}`);
  } finally {
    setIsRangeDownloading(false);
  }
};

  // Loading state
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
          <div className="admin-content-wrapper">
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

  // Error state
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
          <div className="admin-content-wrapper">
            <div className="alert alert-danger m-3" role="alert">
              Error loading purchase invoices: {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchPurchaseInvoices}
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
        
        <div className="admin-content-wrapper">
          <div className="purchase-invoice-content-area">
            {/* ✅ Purchase Navigation Tabs Section */}
            <div className="purchase-invoice-tabs-section">
              <div className="purchase-invoice-tabs-container">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`purchase-invoice-tab ${activeTab === tab.name ? 'purchase-invoice-tab--active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="purchase-invoice-header-section">
              <div className="purchase-invoice-header-top">
                <div className="purchase-invoice-title-section">
                  <h1 className="purchase-invoice-main-title">Purchase Invoice Management</h1>
                  <p className="purchase-invoice-subtitle">Create, manage and track all your purchase invoices</p>
                </div>
              </div>
            </div>

            {/* Purchase Invoice Stats */}
            {/* <div className="purchase-invoice-stats-grid">
              {purchaseInvoiceStats.map((stat, index) => (
                <div key={index} className={`purchase-invoice-stat-card purchase-invoice-stat-card--${stat.type}`}>
                  <h3 className="purchase-invoice-stat-label">{stat.label}</h3>
                  <div className="purchase-invoice-stat-value">{stat.value}</div>
                  <div className={`purchase-invoice-stat-change ${stat.change.startsWith("+") ? "purchase-invoice-stat-change--positive" : "purchase-invoice-stat-change--negative"}`}>
                    {stat.change} from last month
                  </div>
                </div>
              ))}
            </div> */}

            {/* Filters and Actions Section */}
            <div className="purchase-invoice-actions-section">
              <div className="quotation-container p-3">
                <h5 className="mb-3 fw-bold">View Purchase Invoice Details</h5>

                {/* Filters Section */}
                <div className="row align-items-end g-3 mb-3">
                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Month and Year Data:</label>
                    <div className="d-flex">
                      <select className="form-select me-2" value={month} onChange={(e) => setMonth(e.target.value)}>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => 
                          <option key={m}>{m}</option>
                        )}
                      </select>
                                                                <Select
  options={yearOptions}
  value={{ value: year, label: year }}
  onChange={(selected) => setYear(selected.value)}
  maxMenuHeight={150}
  styles={{
    control: (provided) => ({
      ...provided,
      width: '100px',  // Adjust width as needed
      minWidth: '100px',
    }),
    menu: (provided) => ({
      ...provided,
      width: '100px',  // Same width as control
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
                   <button 
  className="btn btn-success mt-4" 
  onClick={handleDownloadMonth}
  disabled={isDownloading}
>
  {isDownloading ? (
    <div className="spinner-border spinner-border-sm" role="status"></div>
  ) : (
    <i className="bi bi-download me-1"></i>
  )} Download
</button>

                  </div>

                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Date Range:</label>
                    <div className="d-flex">
                      <input 
                        type="date" 
                        className="form-control me-2" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                      />
                      <input 
                        type="date" 
                        className="form-control" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="col-md-auto">
                   <button 
  className="btn btn-success mt-4" 
  onClick={handleDownloadRange}
  disabled={isRangeDownloading}
>
  {isRangeDownloading ? (
    <div className="spinner-border spinner-border-sm" role="status"></div>
  ) : (
    <i className="bi bi-download me-1"></i>
  )} Download Range
</button>
                  </div>

                  <div className="col-md-auto">
                    <button 
                      className="btn btn-info text-white mt-4"
                      onClick={handleCreateClick}
                    >
                      Create Purchase Invoice
                    </button>
                  </div>
                </div>

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
                {/* Table Section */}
                <ReusableTable
                  title="Purchase Invoices"
                   data={filteredPurchaseInvoices}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search purchase invoices by supplier or invoice number..."
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

export default KachaPurchaseInvoiceTable;