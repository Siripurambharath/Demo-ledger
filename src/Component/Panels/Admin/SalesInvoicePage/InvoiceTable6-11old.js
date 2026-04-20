import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import {baseurl} from "../../../BaseURL/BaseURL"
import './Invoices.css';

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
        originalData: invoice
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

  
const handleInvoiceNumberClick = async (invoice) => {
  console.log('Opening preview for invoice:', invoice);
  
  try {
    // Get the VoucherID from the correct location
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
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
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
    
    // Navigate with fallback ID or to generic preview
    const fallbackId = invoice.originalData?.VoucherID || 'fallback';
    navigate(`/sales/invoice-preview/${fallbackId}`);
  }
};
  // Enhanced function to handle invoice number click with proper GST calculations
  // const handleInvoiceNumberClick = async (invoice) => {
  //   console.log('Opening preview for invoice:', invoice);
    
  //   try {
  //     let invoiceDetails;
      
  //     try {
  //       invoiceDetails = await getInvoiceByNumber(invoice.number);
  //       console.log('Complete invoice details fetched by number:', invoiceDetails);
  //     } catch (fetchError) {
  //       console.warn('Failed to fetch by invoice number, trying by VoucherID:', fetchError);
        
  //       // Fallback: fetch by VoucherID
  //       const response = await fetch(`${baseurl}/transactions/${invoice.originalData.VoucherID}`);
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch invoice details');
  //       }
        
  //       const result = await response.json();
  //       invoiceDetails = result.success ? result.data : result;
  //     }

  //     console.log('Processing invoice details for preview:', invoiceDetails);

  //     let items = [];
  //     let batchDetails = [];
      
  //     try {
  //       if (invoiceDetails.batch_details && typeof invoiceDetails.batch_details === 'string') {
  //         batchDetails = JSON.parse(invoiceDetails.batch_details);
  //       } else if (Array.isArray(invoiceDetails.batch_details)) {
  //         batchDetails = invoiceDetails.batch_details;
  //       } else if (invoiceDetails.BatchDetails) {
  //         try {
  //           batchDetails = typeof invoiceDetails.BatchDetails === 'string' 
  //             ? JSON.parse(invoiceDetails.BatchDetails) 
  //             : invoiceDetails.BatchDetails;
  //         } catch (e) {
  //           console.warn('Failed to parse BatchDetails:', e);
  //         }
  //       }
        
  //       if (batchDetails && batchDetails.length > 0) {
  //         items = batchDetails.map((batch, index) => {
  //           const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
  //           const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
  //           const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
  //           const totalGSTPercentage = cgstPercentage + sgstPercentage + igstPercentage;
            
  //           const quantity = parseFloat(batch.quantity) || 1;
  //           const price = parseFloat(batch.price) || 0;
  //           const itemTotal = quantity * price;
  //           const gstAmount = itemTotal * (totalGSTPercentage / 100);
            
  //           return {
  //             id: index + 1,
  //             product: batch.product || batch.goods_name || 'Unknown Product',
  //             description: batch.description || '',
  //             quantity: quantity,
  //             price: price,
  //             discount: 0,
  //             gst: totalGSTPercentage,
  //             cgst: cgstPercentage,
  //             sgst: sgstPercentage,
  //             igst: igstPercentage,
  //             cess: 0,
  //             total: itemTotal + gstAmount,
  //             batch: batch.batch || batch.batch_number || '',
  //             batchDetails: batch.batchDetails || null
  //           };
  //         });
  //       } else {
  //         const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
  //         const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
  //         const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
  //         const totalGSTPercentage = cgstPercentage + sgstPercentage + igstPercentage;
          
  //         items = [{
  //           id: 1,
  //           product: 'Product',
  //           description: 'Description not available',
  //           quantity: 1,
  //           price: invoiceDetails.BasicAmount || invoiceDetails.TotalAmount || 0,
  //           discount: 0,
  //           gst: totalGSTPercentage,
  //           cgst: cgstPercentage,
  //           sgst: sgstPercentage,
  //           igst: igstPercentage,
  //           cess: 0,
  //           total: invoiceDetails.TotalAmount || 0,
  //           batch: '',
  //           batchDetails: null
  //         }];
  //       }
  //     } catch (parseError) {
  //       console.error('Error parsing batch details:', parseError);
  //       // Create a fallback item from the main invoice data with proper GST
  //       const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
  //       const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
  //       const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
  //       const totalGSTPercentage = cgstPercentage + sgstPercentage + igstPercentage;
        
  //       items = [{
  //         id: 1,
  //         product: 'Product',
  //         description: 'Description not available',
  //         quantity: 1,
  //         price: invoiceDetails.BasicAmount || invoiceDetails.TotalAmount || 0,
  //         discount: 0,
  //         gst: totalGSTPercentage,
  //         cgst: cgstPercentage,
  //         sgst: sgstPercentage,
  //         igst: igstPercentage,
  //         cess: 0,
  //         total: invoiceDetails.TotalAmount || 0,
  //         batch: '',
  //         batchDetails: null
  //       }];
  //     }

  //     // Calculate GST breakdown with proper percentages
  //     const totalCGST = parseFloat(invoiceDetails.CGSTAmount) || 0;
  //     const totalSGST = parseFloat(invoiceDetails.SGSTAmount) || 0;
  //     const totalIGST = parseFloat(invoiceDetails.IGSTAmount) || 0;
  //     const totalGST = totalCGST + totalSGST + totalIGST;
      
  //     const cgstPercentage = parseFloat(invoiceDetails.CGSTPercentage) || 0;
  //     const sgstPercentage = parseFloat(invoiceDetails.SGSTPercentage) || 0;
  //     const igstPercentage = parseFloat(invoiceDetails.IGSTPercentage) || 0;
      
  //     const taxableAmount = parseFloat(invoiceDetails.BasicAmount) || parseFloat(invoiceDetails.Subtotal) || 
  //                          parseFloat(invoiceDetails.ValueOfGoods) || 0;
  //     const grandTotal = parseFloat(invoiceDetails.TotalAmount) || 0;

  //     // Determine tax type based on percentages and amounts
  //     let taxType = "CGST/SGST";
  //     if (igstPercentage > 0 || totalIGST > 0) {
  //       taxType = "IGST";
  //     }

  //     console.log('GST Breakdown:', {
  //       cgstPercentage,
  //       sgstPercentage,
  //       igstPercentage,
  //       totalCGST,
  //       totalSGST,
  //       totalIGST,
  //       taxableAmount,
  //       grandTotal
  //     });

  //     // Prepare the data for preview in the same format as CreateInvoice
  //     const previewData = {
  //       invoiceNumber: invoiceDetails.InvoiceNumber || invoiceDetails.VchNo || invoice.number,
  //       invoiceDate: invoiceDetails.Date || invoice.created,
  //       validityDate: new Date(new Date(invoiceDetails.Date || invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  //       companyInfo: {
  //         name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
  //         address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
  //         email: "sumukhuri7@gmail.com",
  //         phone: "3456548878543",
  //         gstin: "ZAAABCD0508B1ZG",
  //         state: "Karnataka"
  //       },
  //       supplierInfo: {
  //         name: invoiceDetails.PartyName || 'N/A',
  //         businessName: invoiceDetails.AccountName || 'N/A',
  //         state: invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka',
  //         gstin: invoiceDetails.GSTIN || invoiceDetails.gstin || 'ZAAACDE1234F225'
  //       },
  //       billingAddress: {
  //         addressLine1: invoiceDetails.BillingAddress || invoiceDetails.billing_address_line1 || '12/A Church Street',
  //         addressLine2: invoiceDetails.billing_address_line2 || 'Near Main Square',
  //         city: invoiceDetails.BillingCity || invoiceDetails.billing_city || 'Bangalore',
  //         pincode: invoiceDetails.BillingPincode || invoiceDetails.billing_pin_code || '560001',
  //         state: invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka'
  //       },
  //       shippingAddress: {
  //         addressLine1: invoiceDetails.ShippingAddress || invoiceDetails.shipping_address_line1 || invoiceDetails.BillingAddress || invoiceDetails.billing_address_line1 || '12/A Church Street',
  //         addressLine2: invoiceDetails.shipping_address_line2 || invoiceDetails.billing_address_line2 || 'Near Main Square',
  //         city: invoiceDetails.ShippingCity || invoiceDetails.shipping_city || invoiceDetails.BillingCity || invoiceDetails.billing_city || 'Bangalore',
  //         pincode: invoiceDetails.ShippingPincode || invoiceDetails.shipping_pin_code || invoiceDetails.BillingPincode || invoiceDetails.billing_pin_code || '560001',
  //         state: invoiceDetails.ShippingState || invoiceDetails.shipping_state || invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka'
  //       },
  //       items: items,
  //       note: invoiceDetails.Notes || invoiceDetails.notes || 'Thank you for your business! We appreciate your timely payment.',
  //       taxableAmount: taxableAmount,
  //       totalGST: totalGST,
  //       totalCess: invoiceDetails.TotalCess || 0,
  //       grandTotal: grandTotal,
  //       transportDetails: invoiceDetails.TransportDetails || invoiceDetails.transport_details || 'Standard delivery. Contact us for tracking information.',
  //       additionalCharge: invoiceDetails.AdditionalCharge || '',
  //       additionalChargeAmount: invoiceDetails.AdditionalChargeAmount || 0,
  //       otherDetails: "Authorized Signatory",
  //       taxType: taxType,
  //       batchDetails: batchDetails,
  //       // GST Breakdown with percentages
  //       totalCGST: totalCGST,
  //       totalSGST: totalSGST,
  //       totalIGST: totalIGST,
  //       cgstPercentage: cgstPercentage,
  //       sgstPercentage: sgstPercentage,
  //       igstPercentage: igstPercentage,
  //       // Original data for reference
  //       originalInvoiceData: invoiceDetails
  //     };

  //     console.log('Preview data prepared with GST:', previewData);

  //     // Save to localStorage for the preview component
  //     localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
  //     // Navigate to preview page
  //     navigate("/sales/invoice-preview");
      
  //   } catch (error) {
  //     console.error('Error fetching invoice details:', error);
  //     // Enhanced fallback: Create basic preview data with proper GST calculations
  //     const fallbackPreviewData = {
  //       invoiceNumber: invoice.number,
  //       invoiceDate: invoice.created,
  //       validityDate: new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  //       companyInfo: {
  //         name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
  //         address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
  //         email: "sumukhuri7@gmail.com",
  //         phone: "3456548878543",
  //         gstin: "ZAAABCD0508B1ZG",
  //         state: "Karnataka"
  //       },
  //       supplierInfo: {
  //         name: invoice.originalData.PartyName || 'John A',
  //         businessName: invoice.originalData.AccountName || 'John Traders',
  //         state: 'Karnataka',
  //         gstin: 'ZAAACDE1234F225'
  //       },
  //       billingAddress: {
  //         addressLine1: '12/A Church Street',
  //         addressLine2: 'Near Main Square',
  //         city: 'Bangalore',
  //         pincode: '560001',
  //         state: 'Karnataka'
  //       },
  //       shippingAddress: {
  //         addressLine1: '12/A Church Street',
  //         addressLine2: 'Near Main Square',
  //         city: 'Bangalore',
  //         pincode: '560001',
  //         state: 'Karnataka'
  //       },
  //       items: [{
  //         id: 1,
  //         product: 'Product',
  //         description: '',
  //         quantity: 1,
  //         price: parseFloat(invoice.originalData.BasicAmount) || parseFloat(invoice.originalData.TotalAmount) || 0,
  //         discount: 0,
  //         gst: 18, // Default GST
  //         cgst: 9, // Default CGST
  //         sgst: 9, // Default SGST
  //         igst: 0,
  //         cess: 0,
  //         total: parseFloat(invoice.originalData.TotalAmount) || 0,
  //         batch: '',
  //         batchDetails: null
  //       }],
  //       note: 'Thank you for your business! We appreciate your timely payment.',
  //       taxableAmount: parseFloat(invoice.originalData.BasicAmount) || parseFloat(invoice.originalData.TotalAmount) || 0,
  //       totalGST: parseFloat(invoice.originalData.TaxAmount) || 0,
  //       totalCess: 0,
  //       grandTotal: parseFloat(invoice.originalData.TotalAmount) || 0,
  //       transportDetails: 'Standard delivery. Contact us for tracking information.',
  //       additionalCharge: '',
  //       additionalChargeAmount: 0,
  //       otherDetails: "Authorized Signatory",
  //       taxType: "CGST/SGST",
  //       batchDetails: [],
  //       totalCGST: parseFloat(invoice.originalData.CGSTAmount) || 0,
  //       totalSGST: parseFloat(invoice.originalData.SGSTAmount) || 0,
  //       totalIGST: parseFloat(invoice.originalData.IGSTAmount) || 0,
  //       cgstPercentage: parseFloat(invoice.originalData.CGSTPercentage) || 9,
  //       sgstPercentage: parseFloat(invoice.originalData.SGSTPercentage) || 9,
  //       igstPercentage: parseFloat(invoice.originalData.IGSTPercentage) || 0
  //     };

  //     localStorage.setItem('previewInvoice', JSON.stringify(fallbackPreviewData));
  //     navigate("/sales/invoice-preview");
  //   }
  // };

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