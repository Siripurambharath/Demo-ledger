  import React, { useState, useEffect } from 'react';
  import { Container, Row, Col, Button, Alert, Modal, Card } from 'react-bootstrap';
  import './Period_InvoicePDFPreview.css';
  import { FaFilePdf, FaEdit, FaArrowLeft, FaSave, FaQrcode ,FaPrint} from "react-icons/fa";
  import { useNavigate, useParams, useLocation } from "react-router-dom";
  import { baseurl } from "../../../BaseURL/BaseURL";
  import InvoicePreview_preview from './InvoicePreview_preview';
  import { QRCodeCanvas } from "qrcode.react";
  import axios from "axios";

import QRCodeGenerator from './QRCodeGenerator';
  const Period_InvoicePDFPreview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    
    // State management
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false); 
    const [editableNote, setEditableNote] = useState('');
    const [editableDescriptions, setEditableDescriptions] = useState({});
    const [fromPeriod, setFromPeriod] = useState(false);
    const [periodInvoiceData, setPeriodInvoiceData] = useState(null);
    const [editableOrderMode, setEditableOrderMode] = useState('');
    const [qrData, setQrData] = useState(''); // For QR code data

const transformPeriodDataToInvoiceFormat = (periodData) => {
  const accountDetails = periodData.fullAccountDetails || periodData.customerInfo?.account_details;
  const orderNumber = periodData.orderNumber || periodData.originalOrder?.order_number;
  const orderMode = periodData.order_mode || periodData.originalOrder?.order_mode || "Pakka";

  const TransactionType = orderMode.toUpperCase() === "PAKKA" ? "Sales" : "stock transfer";  

  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;
  let totalGrandTotal = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let totalDiscountAmount = 0;
  let totalCreditCharge = 0;
  
  const items = (periodData.selectedItems || []).map((item, index) => {
    const flashOffer = parseInt(item.flash_offer) || 0;
    const buyQuantity = parseInt(item.buy_quantity) || 0;
    const getQuantity = parseInt(item.get_quantity) || 0;
    const stockDeductionQuantity = flashOffer === 1 ? buyQuantity + getQuantity : parseFloat(item.quantity) || 1;    
    
    const itemTaxableAmount = parseFloat(item.taxable_amount) || 0;
    const itemTaxAmount = parseFloat(item.tax_amount) || 0;
    const itemTotal = parseFloat(item.item_total) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    
    const netPrice = parseFloat(item.net_price) || 0;
    const editedSalePrice = parseFloat(item.edited_sale_price) || 0;
    const salePrice = parseFloat(item.sale_price) || 0;
    
const price = netPrice;
    
    const discount = parseFloat(item.discount_percentage) || 0;
    const discountAmount = parseFloat(item.discount_amount) || 0;
    const creditCharge = parseFloat(item.credit_charge) || 0;
    
    const actualCGSTPercentage = parseFloat(item.cgst_percentage) || 0;
    const actualSGSTPercentage = parseFloat(item.sgst_percentage) || 0;
    const actualCGSTAmount = parseFloat(item.cgst_amount) || 0;
    const actualSGSTAmount = parseFloat(item.sgst_amount) || 0;
    
    totalTaxableAmount += itemTaxableAmount;
    totalTaxAmount += itemTaxAmount;
    totalGrandTotal += itemTotal;
    totalSGST += actualSGSTAmount;
    totalCGST += actualCGSTAmount;
    totalDiscountAmount += discountAmount;
    totalCreditCharge += creditCharge; 
    
    return {
      id: index + 1,
      product: item.item_name || `Item ${index + 1}`,
      product_id: item.product_id || '',
      quantity: quantity,
      price: price, 
      discount: discount,
      discount_amount: discountAmount,
      discount_amount_per_unit: parseFloat(item.discount_amount) || 0,
      gst: parseFloat(item.tax_percentage) || 0,
       hsn_code: item.hsn_code || "",  
      cgst: actualCGSTPercentage,
      sgst: actualSGSTPercentage,
      cgst_amount: actualCGSTAmount,
      sgst_amount: actualSGSTAmount,
      
      stock_deduction_quantity: stockDeductionQuantity, 
      flash_offer: flashOffer,
      buy_quantity: buyQuantity,
      get_quantity: getQuantity,
      original_quantity: parseFloat(item.quantity) || 1,
      igst: 0,
      cess: 0,
      total: itemTotal.toFixed(2),
      batch: '',
      batch_id: item.batch_id || '',
      assigned_staff: item.assigned_staff || periodData.assigned_staff || 'N/A',
      staff_incentive: item.staff_incentive || 0,
      taxable_amount: itemTaxableAmount, 
      tax_amount: itemTaxAmount,
      credit_charge: creditCharge, 
      
      net_price: netPrice,
      unit_id: item.unit_id || null,      // ← ADD THIS
    unit_name: item.unit_name || ''  ,   // ← ADD THIS
      original_sgst_percentage: item.sgst_percentage,
      original_sgst_amount: item.sgst_amount,
      original_cgst_percentage: item.cgst_percentage,
      original_cgst_amount: item.cgst_amount,
      edited_sale_price: editedSalePrice,
      sale_price: salePrice,
      
    };
  });
  
  const taxableAmount = parseFloat(periodData.selectedItemsTotal?.taxableAmount) || totalTaxableAmount;
  const taxAmount = parseFloat(periodData.selectedItemsTotal?.taxAmount) || totalTaxAmount;
  const grandTotal = parseFloat(periodData.selectedItemsTotal?.grandTotal) || totalGrandTotal;
  
  return {
    TransactionType: TransactionType,
    
    invoiceNumber: periodData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`,
    invoiceDate: periodData.invoiceDate || new Date().toISOString().split('T')[0],
    validityDate: periodData.validityDate || 
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    orderNumber: orderNumber,
    originalOrderNumber: orderNumber,
    order_mode: orderMode,
    
    companyInfo: periodData.companyInfo || {
     name: "SHREE SHASHWATRAJ AGRO PVT LTD",
  address: "Growth Center, Jasoiya, Aurangabad, Bihar, 824101",
  email: "spmathur56@gmail.com",
  phone: "9801049700",
  gstin: "10AAOCS1541B1ZZ",
  state: "Bihar",
  stateCode: "10"
    },
    
    supplierInfo: {
      name: accountDetails?.name || periodData.customerInfo?.name || periodData.originalOrder?.customer_name || 'Customer',
      businessName: accountDetails?.business_name || periodData.customerInfo?.businessName || periodData.originalOrder?.customer_name || 'Business',
      gstin: accountDetails?.gstin || periodData.customerInfo?.gstin || '',
      state: accountDetails?.billing_state || periodData.customerInfo?.state || '',
      id: periodData.customerInfo?.id || '',
      email: accountDetails?.email || '',
      phone: accountDetails?.phone_number || accountDetails?.mobile_number || '',
      pan: accountDetails?.pan || '',
      fullDetails: accountDetails
    },
    
    billingAddress: accountDetails ? {
      addressLine1: accountDetails.billing_address_line1 || "Address not specified",
      addressLine2: accountDetails.billing_address_line2 || "",
      city: accountDetails.billing_city || "City not specified",
      pincode: accountDetails.billing_pin_code || "000000",
      state: accountDetails.billing_state || "Karnataka",
      country: accountDetails.billing_country || "India",
      gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
      branch_name: accountDetails.billing_branch_name || ""
    } : periodData.billingAddress || {
      addressLine1: periodData.originalOrder?.billing_address || "Address not specified",
      addressLine2: "",
      city: periodData.originalOrder?.billing_city || "City not specified",
      pincode: periodData.originalOrder?.billing_pincode || "000000",
      state: periodData.originalOrder?.billing_state || "Karnataka"
    },
    
    shippingAddress: accountDetails ? {
      addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
      addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
      city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
      pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
      state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
      country: accountDetails.shipping_country || accountDetails.billing_country || "India",
      gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
      branch_name: accountDetails.shipping_branch_name || accountDetails.billing_branch_name || ""
    } : periodData.shippingAddress || periodData.billingAddress || {
      addressLine1: periodData.originalOrder?.shipping_address || "Address not specified",
      addressLine2: "",
      city: periodData.originalOrder?.shipping_city || "City not specified",
      pincode: periodData.originalOrder?.shipping_pincode || "000000",
      state: periodData.originalOrder?.shipping_state || "Karnataka"
    },
    
    items: items,
    
    flashOfferSummary: periodData.flashOfferSummary || {
      hasFlashOffer: items.some(item => item.flash_offer === 1),
      totalItemsWithFlashOffer: items.filter(item => item.flash_offer === 1).length
    },
    
    taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
    totalGST: (typeof taxAmount === 'number' ? taxAmount : parseFloat(taxAmount) || 0).toFixed(2),
    grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
    totalCess: "0.00",
    totalDiscountAmount: totalDiscountAmount.toFixed(2),
    totalCreditCharge: totalCreditCharge.toFixed(2),
    note: periodData.note || "",
    transportDetails: periodData.transportDetails || "Standard delivery",
    additionalCharge: "",
    additionalChargeAmount: "0.00",
    
    totalCGST: totalCGST.toFixed(2),
    totalSGST: totalSGST.toFixed(2),
    totalIGST: "0.00",
    taxType: "CGST/SGST",
    
    assigned_staff: periodData.assigned_staff || periodData.originalOrder?.assigned_staff || 'N/A',
    staffid: periodData.staff_id || periodData.staffid || periodData.originalOrder?.staff_id || null,
    staff_id: periodData.staff_id || periodData.staffid || periodData.originalOrder?.staff_id || null,
    staff_incentive: periodData.originalOrder?.staff_incentive || 0,
    
    accountDetails: accountDetails
  };
};
  useEffect(() => {
    if (invoiceData) {
      const mode = invoiceData.order_mode || "PAKKA";
      const normalizedMode = mode.toUpperCase() === "KACHA" || mode.toUpperCase() === "PAKKA" 
        ? mode.toUpperCase() 
        : "PAKKA";
      setEditableOrderMode(normalizedMode);
      
      if (invoiceData.grandTotal) {
        generateQRCodeData();
      }
    }
  }, [invoiceData]);

const handleOrderModeChange = (switchData) => {
  const { orderMode, updatedItems } = switchData;
  const normalizedValue = orderMode.toUpperCase();
  
  setEditableOrderMode(normalizedValue);
  
  if (updatedItems && updatedItems.length > 0 && invoiceData) {
    console.log("🔄 Received updated items with new product_ids:", updatedItems);
    
    setInvoiceData(prev => ({
      ...prev,
      order_mode: normalizedValue,
      items: updatedItems
    }));
    
    if (periodInvoiceData && periodInvoiceData.selectedItems) {
      const updatedSelectedItems = periodInvoiceData.selectedItems.map((item, index) => {
        const updatedItem = updatedItems.find(ui => 
          ui.product === item.item_name || 
          ui.product_id !== item.product_id
        );
        
        if (updatedItem && updatedItem.product_id !== item.product_id) {
          console.log(`🔄 Updating product_id for ${item.item_name}: ${item.product_id} → ${updatedItem.product_id}`);
          return {
            ...item,
            product_id: updatedItem.product_id, 
            product_type: normalizedValue
          };
        }
        return item;
      });
      
      setPeriodInvoiceData(prev => ({
        ...prev,
        selectedItems: updatedSelectedItems,
        order_mode: normalizedValue
      }));
    }
  } else {
    // Update only order mode
    if (invoiceData) {
      setInvoiceData(prev => ({
        ...prev,
        order_mode: normalizedValue
      }));
    }
  }
};

// 1. Add state near other useState declarations
const [transportDetails, setTransportDetails] = useState({
  transport: "",
  grNumber: "",
  vehicleNo: "",
  station: ""
});

// 2. Handler for transport changes
const handleTransportChange = (newTransport) => {
  setTransportDetails(newTransport);
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

    let totalTaxableAmount = 0;
    let totalTaxAmount = 0;
    let totalGrandTotal = 0;

    const items = batchDetails.map((batch, index) => {
      const quantity = parseFloat(batch.quantity) || 0;
      const price = parseFloat(batch.price) || 0;
      const discount = parseFloat(batch.discount) || 0;
      const gst = parseFloat(batch.gst) || 0;
      const cess = parseFloat(batch.cess) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const taxableAmount = subtotal - discountAmount;
      const gstAmount = taxableAmount * (gst / 100);
      const cessAmount = taxableAmount * (cess / 100);
      const total = taxableAmount + gstAmount + cessAmount;

      // Add to totals
      totalTaxableAmount += taxableAmount;
      totalTaxAmount += gstAmount;
      totalGrandTotal += total;

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
        order_mode: apiData.order_mode || "Pakka",
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
        product_id: batch.product_id || '',
        taxable_amount: taxableAmount 
      };
    }) || [];

    // Use calculated totals or fallback to API data
    const taxableAmount = totalTaxableAmount || parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
    const totalGST = totalTaxAmount || parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
    const grandTotal = totalGrandTotal || parseFloat(apiData.TotalAmount) || 0;

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
        product_id: '',
        taxable_amount: grandTotal
      }],
      
      taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
      totalGST: (typeof totalGST === 'number' ? totalGST : parseFloat(totalGST) || 0).toFixed(2),
      grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
      totalCess: "0.00",
      
      note: apiData.Notes || "",
transportDetails: {
  transport: apiData.transport_name || "",
  grNumber: apiData.gr_rr_number || "",
  vehicleNo: apiData.vehicle_number || "",
  station: apiData.station_name || ""
},      additionalCharge: "",
      additionalChargeAmount: "0.00",
      
      totalCGST: parseFloat(apiData.CGSTAmount) || 0,
      totalSGST: parseFloat(apiData.SGSTAmount) || 0,
      totalIGST: parseFloat(apiData.IGSTAmount) || 0,
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST"
    };
  };

    // Fetch transaction data
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
          
          // Initialize editable descriptions and note
          const descObj = {};
          transformedData.items.forEach((item, index) => {
            descObj[item.id || index] = item.description || '';
          });
          setEditableDescriptions(descObj);
          setEditableNote(transformedData.note || '');
          
        } else if (result.VoucherID) {
          const transformedData = transformApiDataToInvoiceFormat(result);
          setInvoiceData(transformedData);
          
          // Initialize editable descriptions and note
          const descObj = {};
          transformedData.items.forEach((item, index) => {
            descObj[item.id || index] = item.description || '';
          });
          setEditableDescriptions(descObj);
          setEditableNote(transformedData.note || '');
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
            setError(null);
          } catch (parseError) {
            console.error('Error parsing localStorage data:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    const calculateGSTBreakdown = () => {
      if (!invoiceData || !invoiceData.items) return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };
      
      const totalCGST = invoiceData.items.reduce((sum, item) => {
        // Use cgst_amount from database if available, otherwise use calculation
        const cgstAmount = parseFloat(item.cgst_amount) || 0;
        return sum + cgstAmount;
      }, 0);
      
      const totalSGST = invoiceData.items.reduce((sum, item) => {
        // Use sgst_amount from database if available, otherwise use calculation
        const sgstAmount = parseFloat(item.sgst_amount) || 0;
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


const handlePrint = async () => {
  try {
    setDownloading(true);
    setError(null);
    
    if (!invoiceData) {
      throw new Error('No invoice data available');
    }

    let pdf;
    let InvoicceprintOrder;
    let generateQRDataUrl;
    
    try {
      const reactPdf = await import('@react-pdf/renderer');
      pdf = reactPdf.pdf;
      
      const pdfModule = await import('./InvoicceprintOrder');
      InvoicceprintOrder = pdfModule.default;
      generateQRDataUrl = pdfModule.generateQRDataUrl;
    } catch (importError) {
      console.error('Error importing PDF modules:', importError);
      throw new Error('Failed to load PDF generation libraries');
    }

    const gstBreakdown = calculateGSTBreakdown();
    const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

    const orderMode = (editableOrderMode || invoiceData.order_mode || 'PAKKA').toUpperCase();
    let qrDataUrl = null;
    let qrAmount = 0;
    
    try {
      const qrResult = await generateQRDataUrl(invoiceData, orderMode);
      qrDataUrl = qrResult.dataUrl;
      qrAmount = qrResult.amount;
      console.log('✅ QR code generated for PDF, amount:', qrAmount);
    } catch (qrError) {
      console.warn('⚠️ QR generation failed, PDF will render without QR:', qrError.message);
    }

    // FIX: Create a copy of invoiceData with transport details
    const invoiceDataWithTransport = {
      ...invoiceData,
      transportDetails: transportDetails,
      transport_name: transportDetails.transport,
      gr_rr_number: transportDetails.grNumber,
      vehicle_number: transportDetails.vehicleNo,
      station_name: transportDetails.station
    };

    const pdfDoc = (
      <InvoicceprintOrder 
        invoiceData={invoiceDataWithTransport}  // Use enhanced data
        invoiceNumber={invoiceData.invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
        qrDataUrl={qrDataUrl}
        qrAmount={qrAmount}
      />
    );

    const blob = await pdf(pdfDoc).toBlob();
    
    const pdfUrl = URL.createObjectURL(blob);
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (!printWindow) {
      alert('Popup blocked. Downloading instead.');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

  } catch (error) {
    console.error('Error generating PDF for print:', error);
    setError('Failed to generate PDF for printing: ' + error.message);
    setTimeout(() => setError(null), 5000);
  } finally {
    setDownloading(false);
  }
};

const generateAndStorePDF = async (voucherId) => {
  try {
    if (!invoiceData) throw new Error('No invoice data available');

    let pdf;
    let InvoicePDFDocument;
    let generateQRDataUrl;
    
    try {
      const reactPdf = await import('@react-pdf/renderer');
      pdf = reactPdf.pdf;
      
      const pdfModule = await import('./InvoicceprintOrder');
      InvoicePDFDocument = pdfModule.default;
      generateQRDataUrl = pdfModule.generateQRDataUrl;
    } catch (importError) {
      throw new Error('Failed to load PDF generation libraries');
    }

    const gstBreakdown = calculateGSTBreakdown();
    const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

    // Pre-generate QR
    const orderMode = (editableOrderMode || invoiceData.order_mode || 'PAKKA').toUpperCase();
    let qrDataUrl = null;
    let qrAmount = 0;
    try {
      const qrResult = await generateQRDataUrl(invoiceData, orderMode);
      qrDataUrl = qrResult.dataUrl;
      qrAmount = qrResult.amount;
    } catch (qrError) {
      console.warn('QR generation failed for stored PDF:', qrError.message);
    }

    // FIX: Create a copy of invoiceData with transport details
    const invoiceDataWithTransport = {
      ...invoiceData,
      transportDetails: transportDetails,  // Add current transport details
      transport_name: transportDetails.transport,
      gr_rr_number: transportDetails.grNumber,
      vehicle_number: transportDetails.vehicleNo,
      station_name: transportDetails.station
    };

    const pdfDoc = (
      <InvoicePDFDocument
        invoiceData={invoiceDataWithTransport}  // Use the enhanced data
        invoiceNumber={invoiceData.invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
        qrDataUrl={qrDataUrl}
        qrAmount={qrAmount}
      />
    );

    const blob = await pdf(pdfDoc).toBlob();
    const filename = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;

    const base64data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const storeResponse = await fetch(`${baseurl}/transactions/${voucherId}/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfData: base64data, fileName: filename }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!storeResponse.ok) {
      const errorText = await storeResponse.text();
      throw new Error(`Server error: ${storeResponse.status} - ${errorText}`);
    }

    const storeResult = await storeResponse.json();
    if (storeResult.success) {
      console.log('✅ PDF with QR stored successfully for voucher:', voucherId);
      return storeResult;
    } else {
      throw new Error(storeResult.message || 'Failed to store PDF');
    }

  } catch (error) {
    console.error('Error in PDF generation and storage:', error);
    throw error;
  }
};
    const handleEdit = () => {
      setIsEditing(true);
      setEditableNote(invoiceData?.note || '');
      
      const descObj = {};
      invoiceData?.items.forEach((item, index) => {
        descObj[item.id || index] = item.description || '';
      });
      setEditableDescriptions(descObj);
    };

    // Handle note change
    const handleNoteChange = (value) => {
      setEditableNote(value);
    };

    // Handle description change
    const handleDescriptionChange = (itemId, value) => {
      setEditableDescriptions(prev => ({
        ...prev,
        [itemId]: value
      }));
    };

    // Handle save note and descriptions
    const handleSaveChanges = async () => {
      try {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        if (!invoiceData) {
          throw new Error('No invoice data available');
        }

        // Prepare updated items with descriptions
        const updatedItems = invoiceData.items.map((item, index) => ({
          ...item,
          description: editableDescriptions[item.id || index] || item.description || ''
        }));

        // Update local state
        const updatedInvoiceData = {
          ...invoiceData,
          note: editableNote,
          items: updatedItems,
          order_mode: editableOrderMode 
        };
        
        setInvoiceData(updatedInvoiceData);
        
        // Exit edit mode
        setIsEditing(false);
        
        setSuccessMessage('Changes saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
      } catch (error) {
        console.error('Error saving changes:', error);
        setErrorMessage('Failed to save changes: ' + error.message);
        setTimeout(() => setErrorMessage(null), 5000);
      } finally {
        setSaving(false);
      }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditableNote(invoiceData?.note || '');
      const descObj = {};
      invoiceData?.items.forEach((item, index) => {
        descObj[item.id || index] = item.description || '';
      });
      setEditableDescriptions(descObj);
    };

const handleGenerateInvoice = async () => {
  try {
    setGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');

    // ========== STEP 1: VALIDATE INVOICE DATA ==========
    if (!fromPeriod || !periodInvoiceData) {
      throw new Error('Invalid invoice data source. Please try again.');
    }

    const selectedItems = periodInvoiceData.selectedItems || [];
    if (selectedItems.length === 0) {
      throw new Error('No selected items found for invoice generation');
    }

    // ========== STEP 2: FETCH NEXT INVOICE NUMBER ==========
    let invoiceNumber = null;
    try {
      const invoiceNumberResponse = await fetch(`${baseurl}/next-invoice-number`);
      
      if (invoiceNumberResponse.ok) {
        const invoiceNumberData = await invoiceNumberResponse.json();
        invoiceNumber = invoiceNumberData.nextInvoiceNumber;
      } else {
        invoiceNumber = `INV${Date.now().toString().slice(-6)}`;
      }
    } catch (err) {
      console.error('Error fetching next invoice number:', err);
      invoiceNumber = `INV${Date.now().toString().slice(-6)}`;
    }

    // ========== STEP 3: GET ORDER MODE ==========
    const orderMode = editableOrderMode || 
                      periodInvoiceData?.order_mode || 
                      periodInvoiceData?.originalOrder?.order_mode || 
                      "PAKKA";
    const normalizedOrderMode = orderMode.toUpperCase();
    const TransactionType = normalizedOrderMode === "PAKKA" ? "Sales" : "stock transfer";

    // ========== STEP 4: GET CUSTOMER INFO ==========
    const accountDetails = periodInvoiceData.fullAccountDetails || 
                          periodInvoiceData.customerInfo?.account_details;
    
    if (!accountDetails && !periodInvoiceData.customerInfo) {
      throw new Error('Customer information is missing.');
    }

    // ========== STEP 5: GET ORDER NUMBER ==========
    const orderNumber = periodInvoiceData.orderNumber || periodInvoiceData.originalOrder?.order_number;

    // ========== STEP 6: GET STAFF INFORMATION ==========
    const assignedStaff = periodInvoiceData.assigned_staff || 
                         periodInvoiceData.originalOrder?.assigned_staff || 
                         'N/A';
    
    const staffId = periodInvoiceData.staff_id || 
                   periodInvoiceData.staffid || 
                   periodInvoiceData.originalOrder?.staff_id || 
                   null;
    
    const staffIncentive = periodInvoiceData.staff_incentive || 
                          periodInvoiceData.originalOrder?.staff_incentive || 
                          0;

    // ========== STEP 7: PERFORM STOCK CHECK ==========
    const itemsWithStockIssue = [];
    
    for (const item of selectedItems) {
      const flashOffer = parseInt(item.flash_offer) || 0;
      const buyQuantity = parseInt(item.buy_quantity) || 0;
      const getQuantity = parseInt(item.get_quantity) || 0;
      const stockCheckQuantity = flashOffer === 1 ? buyQuantity + getQuantity : parseFloat(item.quantity) || 0;
      
      if (item.product_id && stockCheckQuantity > 0) {
        try {
          const batchesRes = await axios.get(`${baseurl}/products/${item.product_id}/batches`);
          
          if (batchesRes.data && Array.isArray(batchesRes.data)) {
            const stock_quantity = batchesRes.data.reduce((total, batch) => {
              return total + (parseFloat(batch.quantity) || 0);
            }, 0);
            
            if (stockCheckQuantity > stock_quantity) {
              itemsWithStockIssue.push({ ...item, stock_quantity, shortage: stockCheckQuantity - stock_quantity });
            }
          }
        } catch (batchError) {
          console.error(`Error fetching batches:`, batchError);
        }
      }
    }
    
    if (itemsWithStockIssue.length > 0) {
      let windowsAlert = "⚠️ STOCK INSUFFICIENCY DETECTED!\n\n";
      itemsWithStockIssue.forEach((item, index) => {
        windowsAlert += `${index + 1}. ${item.item_name}\n`;
        windowsAlert += `   Ordered: ${item.required_total} | Available: ${item.stock_quantity}\n`;
        windowsAlert += `   Shortage: ${item.shortage} units\n\n`;
      });
      alert(windowsAlert);
      setGenerating(false);
      return;
    }

    // ========== STEP 8: CALCULATE CREDIT LIMIT VALUES ==========
    const parseCreditValue = (value) => {
      if (value === null || value === undefined || value === '') return 0;
      if (typeof value === 'string') {
        const trimmedValue = value.trim().toUpperCase();
        if (trimmedValue === 'NULL' || trimmedValue === '') return 0;
        const cleanValue = value.replace(/[^0-9.-]+/g, '');
        if (cleanValue === '') return 0;
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof value === 'number') return value;
      return 0;
    };
    
    const creditLimit = parseCreditValue(periodInvoiceData.customerInfo?.credit_limit);
    const unpaidAmount = parseCreditValue(periodInvoiceData.customerInfo?.unpaid_amount);

    // ========== STEP 9: CALCULATE ITEM TOTALS ==========
    let taxableAmount = 0;
    let totalGST = 0;
    let grandTotal = 0;
    let totalDiscount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    
    const itemsWithCalculations = selectedItems.map(item => {
      const flashOffer = parseInt(item.flash_offer) || 0;
      const buyQuantity = parseInt(item.buy_quantity) || 0;
      const getQuantity = parseInt(item.get_quantity) || 0;
      
      const quantity = flashOffer === 1 ? buyQuantity : (parseFloat(item.quantity) || 1);
      const stock_deduction_quantity = flashOffer === 1 ? buyQuantity + getQuantity : quantity;
      
      const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
      const taxAmountPerUnit = parseFloat(item.tax_amount) || 0;
      const cgstAmountPerUnit = parseFloat(item.cgst_amount) || 0;
      const sgstAmountPerUnit = parseFloat(item.sgst_amount) || 0;
      
      const netPrice = parseFloat(item.net_price) || 0;
      const price = netPrice;
      
      const discountAmountPerUnit = parseFloat(item.discount_amount) || 0;
      const creditChargePerUnit = parseFloat(item.credit_charge) || 0;
      
      const cgstPercentage = parseFloat(item.cgst_percentage) || 0;
      const sgstPercentage = parseFloat(item.sgst_percentage) || 0;
      const taxPercentage = parseFloat(item.tax_percentage) || 0;
      
      const itemTaxableAmount = taxablePerUnit * quantity;
      const itemTaxAmount = normalizedOrderMode === "KACHA" ? 0 : taxAmountPerUnit * quantity;
      const itemCGSTAmount = normalizedOrderMode === "KACHA" ? 0 : cgstAmountPerUnit * quantity;
      const itemSGSTAmount = normalizedOrderMode === "KACHA" ? 0 : sgstAmountPerUnit * quantity;
      const itemDiscountAmount = discountAmountPerUnit * quantity;
      const itemCreditCharge = creditChargePerUnit * quantity;
      const itemTotal = normalizedOrderMode === "KACHA" ? itemTaxableAmount : itemTaxableAmount + itemTaxAmount;
      
      taxableAmount += itemTaxableAmount;
      totalGST += itemTaxAmount;
      totalCGST += itemCGSTAmount;
      totalSGST += itemSGSTAmount;
      totalDiscount += itemDiscountAmount;
      grandTotal += itemTotal;
      
      return {
        originalItemId: item.id,
        product: item.item_name,
        product_id: item.product_id,
        product_type: normalizedOrderMode,
        description: editableDescriptions[item.id] || item.description || '',
        quantity: quantity,
        stock_deduction_quantity: stock_deduction_quantity,
        net_price: netPrice,
        price: price,
        edited_sale_price: parseFloat(item.edited_sale_price) || 0,
        sale_price: parseFloat(item.sale_price) || 0,
        unit_id: item.unit_id || null,
        unit_name: item.unit_name || "",
        discount_amount: itemDiscountAmount,
        credit_charge: itemCreditCharge,
        discount_amount_per_unit: discountAmountPerUnit,
        credit_charge_per_unit: creditChargePerUnit,
        discount: parseFloat(item.discount_percentage) || 0,
        gst: normalizedOrderMode === "KACHA" ? 0 : taxPercentage,
        cgst: normalizedOrderMode === "KACHA" ? 0 : cgstPercentage,
        sgst: normalizedOrderMode === "KACHA" ? 0 : sgstPercentage,
        igst: 0,
        cess: 0,
        total: itemTotal,
        taxable_amount: itemTaxableAmount,
        tax_amount: itemTaxAmount,
        cgst_amount: itemCGSTAmount,
        sgst_amount: itemSGSTAmount,
        batch: item.batch_id || '',
        batch_id: item.batch_id || '',
        item_total: itemTotal,
        hsn_code: item.hsn_code || "",
        flash_offer: flashOffer,
        buy_quantity: buyQuantity,
        get_quantity: getQuantity
      };
    });

    // ========== STEP 10: CREDIT LIMIT CHECK ==========
    if (creditLimit > 0) {
      const totalInvoiceAmount = grandTotal;
      const currentTotal = unpaidAmount;
      const newTotal = currentTotal + totalInvoiceAmount;
      
      if (newTotal > creditLimit) {
        const exceedAmount = newTotal - creditLimit;
        const customerName = accountDetails?.name || periodInvoiceData.customerInfo?.name || 'Customer';
        
        const alertMessage = 
          "⚠️ CREDIT LIMIT EXCEEDED!\n\n" +
          `Customer: ${customerName}\n` +
          `Credit Limit: ₹${creditLimit.toLocaleString('en-IN')}\n` +
          `Unpaid Amount: ₹${unpaidAmount.toLocaleString('en-IN')}\n` +
          `Invoice Amount: ₹${totalInvoiceAmount.toLocaleString('en-IN')}\n` +
          `New Total: ₹${newTotal.toLocaleString('en-IN')}\n` +
          `Exceeds by: ₹${exceedAmount.toLocaleString('en-IN')}\n\n` +
          "Credit limit exceeded! Proceed anyway?\n\n" +
          "OK = Continue with invoice\n" +
          "Cancel = Stop invoice generation";
        
        const proceed = window.confirm(alertMessage);
        
        if (!proceed) {
          setGenerating(false);
          setErrorMessage('Invoice generation cancelled due to credit limit exceedance.');
          setTimeout(() => setErrorMessage(null), 5000);
          return;
        }
      }
    }

    // ========== STEP 11: VALIDATE TRANSPORT DETAILS ==========
    const transportData = {
      transport: transportDetails.transport || '',
      grNumber: transportDetails.grNumber || '',
      vehicleNo: transportDetails.vehicleNo || '',
      station: transportDetails.station || ''
    };

    // ========== STEP 12: BUILD FINAL PAYLOAD ==========
    const selectedItemIds = periodInvoiceData.selectedItemIds || periodInvoiceData.selected_item_ids || [];
    const firstItemDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] || 
                                selectedItems[0]?.description || '';

    // ✅ ALL FIELDS EXCEPT STATUS - Build payload with all data first
    const payload = {
      // Core transaction info
      TransactionType: TransactionType,
      invoiceNumber: invoiceNumber,
      VchNo: invoiceNumber,
      
      // Order info
      orderNumber: orderNumber,
      order_number: orderNumber,
      order_mode: normalizedOrderMode,
      originalOrderNumber: orderNumber,
      originalOrderId: periodInvoiceData.originalOrderId,
      selectedItemIds: selectedItemIds,
      
      // Items and calculations
      items: itemsWithCalculations,
      taxableAmount: taxableAmount,
      totalGST: totalGST,
      totalCess: 0,
      grandTotal: grandTotal,
      totalDiscount: totalDiscount,
      totalCGST: totalCGST,
      totalSGST: totalSGST,
      BasicAmount: taxableAmount,
      TotalAmount: grandTotal,
      TaxAmount: totalGST,
      Subtotal: taxableAmount,
      CGSTAmount: totalCGST,
      SGSTAmount: totalSGST,
      
      // Flash offer summary
      flashOfferSummary: periodInvoiceData.flashOfferSummary || {
        hasFlashOffer: itemsWithCalculations.some(item => item.flash_offer === 1),
        totalItemsWithFlashOffer: itemsWithCalculations.filter(item => item.flash_offer === 1).length
      },
      
      // Notes and descriptions
      note: editableNote || periodInvoiceData.note || "",
      note_preview: (editableNote || periodInvoiceData.note || "").substring(0, 200),
      description_preview: firstItemDescription.substring(0, 200),
      
      // Customer info
      customerInfo: {
        name: accountDetails?.name || periodInvoiceData.customerInfo?.name,
        businessName: accountDetails?.business_name || periodInvoiceData.customerInfo?.businessName,
        gstin: accountDetails?.gstin || periodInvoiceData.customerInfo?.gstin,
        state: accountDetails?.billing_state || periodInvoiceData.customerInfo?.state,
        id: periodInvoiceData.customerInfo?.id,
        email: accountDetails?.email || '',
        phone: accountDetails?.mobile_number || '',
        pan: accountDetails?.pan || '',
        credit_limit: creditLimit,
        unpaid_amount: unpaidAmount,
        balance_amount: periodInvoiceData.customerInfo?.balance_amount || 0
      },
      
      // Addresses
      billingAddress: accountDetails ? {
        addressLine1: accountDetails.billing_address_line1,
        addressLine2: accountDetails.billing_address_line2 || '',
        city: accountDetails.billing_city,
        pincode: accountDetails.billing_pin_code,
        state: accountDetails.billing_state,
        country: accountDetails.billing_country,
        gstin: accountDetails.billing_gstin || accountDetails.gstin
      } : periodInvoiceData.billingAddress,
      
      shippingAddress: accountDetails ? {
        addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1,
        addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || '',
        city: accountDetails.shipping_city || accountDetails.billing_city,
        pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code,
        state: accountDetails.shipping_state || accountDetails.billing_state,
        country: accountDetails.shipping_country || accountDetails.billing_country,
        gstin: accountDetails.shipping_gstin || accountDetails.gstin
      } : periodInvoiceData.shippingAddress || periodInvoiceData.billingAddress,
      
      // Party info
      selectedSupplierId: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
      PartyID: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
      AccountID: periodInvoiceData.customerInfo?.id || periodInvoiceData.AccountID,
      PartyName: accountDetails?.name || periodInvoiceData.PartyName,
      AccountName: accountDetails?.business_name || periodInvoiceData.AccountName,
      
      // Staff info
      assigned_staff: assignedStaff,
      staffid: staffId,
      staff_id: staffId,
      staff_incentive: staffIncentive,
      
      // Transport details
      transportDetails: transportData,
      transport_name: transportData.transport,
      gr_rr_number: transportData.grNumber,
      vehicle_number: transportData.vehicleNo,
      station_name: transportData.station,
      
      // Tax system
      TaxSystem: normalizedOrderMode === "KACHA" ? "KACHA_NO_GST" : "GST",
      
      // Flags
      isPartialInvoice: true,
      source: 'period_component',
      
      // Credit info in main payload
      credit_limit: creditLimit,
      unpaid_amount: unpaidAmount,
      balance_amount: periodInvoiceData.customerInfo?.balance_amount || 0
    };

    // ========== STEP 13: ADD STATUS AS THE VERY LAST FIELD ==========
    // ✅ STATUS IS ADDED LAST - After all other fields
    const status = "Pending";  // Default status for new invoice
    
    const finalPayload = {
      ...payload,
      status: status,  // ← STATUS IS THE LAST FIELD
      hsn_code: itemsWithCalculations[0]?.hsn_code || "",
    };
    
    console.log('📦 Final Payload with Status as Last Field:', {
      ...finalPayload,
      // Verify status is the last field
      lastField: Object.keys(finalPayload)[Object.keys(finalPayload).length - 1]
    });

    // ========== STEP 14: SEND TO BACKEND ==========
    console.log('🚀 Sending invoice to backend with status as last field...');
    
    const response = await fetch(`${baseurl}/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalPayload),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || "Failed to generate invoice");
    }
    
    console.log('✅ Invoice created successfully with status:', status);

    // ========== STEP 15: GENERATE AND STORE PDF ==========
    if (result.voucherId) {
      try {
        const updatedInvoiceData = {
          ...invoiceData,
          voucherId: result.voucherId,
          TransactionType: TransactionType,
          status: status  // Include status in invoice data
        };
        
        await generateAndStorePDF(result.voucherId);
        
        setSuccessMessage(
          `✅ Invoice generated successfully!\n` +
          `Invoice Number: ${result.invoiceNumber || invoiceNumber}\n` +
          `Transaction Type: ${TransactionType}\n` +
          `Status: ${status}`
        );
      } catch (pdfError) {
        console.warn('⚠️ PDF storage failed:', pdfError.message);
        setSuccessMessage(
          `✅ Invoice created but PDF storage failed.\n` +
          `Invoice Number: ${result.invoiceNumber || invoiceNumber}\n` +
          `Status: ${status}`
        );
      }
      
      setInvoiceData(prev => ({
        ...prev,
        voucherId: result.voucherId,
        TransactionType: TransactionType,
        status: status
      }));
    } else {
      setSuccessMessage(
        `✅ Invoice generated successfully!\n` +
        `Invoice Number: ${result.invoiceNumber || invoiceNumber}\n` +
        `Status: ${status}`
      );
    }
    
    // Navigate after success
    setTimeout(() => {
      navigate('/period');
    }, 3000);
    
  } catch (error) {
    console.error("❌ Error generating invoice:", error);
    setErrorMessage(`Failed to generate invoice: ${error.message}`);
    
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  } finally {
    setGenerating(false);
  }
};


  const calculateGrandTotalForQR = () => {
    if (!invoiceData || !invoiceData.items) {
      console.log('❌ No invoice data or items for QR calculation');
      return 0;
    }
    
    const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();
    
    console.log('🔍 Calculating QR Grand Total:', {
      orderMode,
      itemCount: invoiceData.items.length
    });
    
    let grandTotal = 0;
    
    invoiceData.items.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 1;
      
      const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
      const totalTaxable = taxablePerUnit * quantity;
      
      const gstPerUnit = parseFloat(item.tax_amount) || 0;
      const totalGST = orderMode === "KACHA" ? 0 : gstPerUnit * quantity;
      
      const itemTotal = totalTaxable + totalGST;
      
      grandTotal += itemTotal;
      
      console.log(`💰 Item ${index + 1} Calculation:`, {
        product: item.product,
        quantity,
        taxablePerUnit,
        totalTaxable,
        gstPerUnit,
        totalGST,
        itemTotal,
        accumulatedTotal: grandTotal
      });
    });
    
    console.log('💰 FINAL QR Grand Total:', grandTotal);
    
    const invoiceGrandTotal = parseFloat(invoiceData.grandTotal) || 0;
    
    return Math.max(grandTotal, invoiceGrandTotal);
  };

  const generateQRCodeData = () => {
    if (!invoiceData) {
      console.log('❌ No invoice data available for QR code');
      return '';
    }
    
    try {
      const amount = calculateGrandTotalForQR();
      console.log('📊 QR Code Amount:', {
        amount,
        orderMode: editableOrderMode || invoiceData.order_mode,
        itemCount: invoiceData.items?.length || 0
      });
      
      // Ensure amount is properly formatted with 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);
      
      const upiId = 'shreeshashwatrajagroprivatelimited@sbi';
      
      const merchantName = invoiceData.companyInfo?.name?.replace(/[^a-zA-Z0-9 ]/g, '') || 'Business';
      
      const invoiceNumber = invoiceData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`;
      const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();
      
      const transactionNote = `Payment for Invoice ${invoiceNumber} (${orderMode} Order)`;
      
      const upiParams = new URLSearchParams({
        pa: upiId,
        pn: merchantName,
        am: formattedAmount,
        tn: transactionNote,
        cu: 'INR'
      });
      
      const upiUrl = `upi://pay?${upiParams.toString()}`;
      
      console.log('✅ Generated UPI URL for amount:', formattedAmount);
      
      // Update QR code data
      setQrData(upiUrl);
      
      return upiUrl;
      
    } catch (error) {
      console.error('❌ Error generating QR code data:', error);
      return '';
    }
  };
    // Handle delete invoice
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

  useEffect(() => {
    if (invoiceData && invoiceData.items) {
      const timer = setTimeout(() => {
        generateQRCodeData();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [invoiceData, editableOrderMode]);
    useEffect(() => {
      if (location.state && location.state.invoiceData) {
        console.log('📦 Received data from Period component:', location.state.invoiceData);
        
        const periodData = location.state.invoiceData;
        console.log('🔍 Credit Data Check in periodInvoiceData:', {
        customerInfo: periodData.customerInfo,
        fullAccountDetails: periodData.fullAccountDetails,
        hasCreditLimit: !!periodData.customerInfo?.credit_limit,
        hasUnpaidAmount: !!periodData.customerInfo?.unpaid_amount,
        hasBalanceAmount: !!periodData.customerInfo?.balance_amount,
        credit_limit_value: periodData.customerInfo?.credit_limit,
        unpaid_amount_value: periodData.customerInfo?.unpaid_amount,
        balance_amount_value: periodData.customerInfo?.balance_amount
      });
        setPeriodInvoiceData(periodData);
        setFromPeriod(true);
        setLoading(false);
        
        const transformedData = transformPeriodDataToInvoiceFormat(periodData);
        setInvoiceData(transformedData);
        
        const descObj = {};
        transformedData.items.forEach((item, index) => {
          descObj[item.id || index] = item.description || '';
        });
        setEditableDescriptions(descObj);
        setEditableNote(transformedData.note || '');
        
      } else {
        console.log('🔍 Loading from transaction ID:', id);
        fetchTransactionData(); 
      }
    }, [id, location]);

// const QRCodeGenerator = () => {
//   const grandTotal = calculateGrandTotalForQR();
//   const navigate = useNavigate();
  
//   useEffect(() => {
//     if (invoiceData && invoiceData.items && invoiceData.items.length > 0) {
//       console.log("🔄 Regenerating QR with updated total:", grandTotal);
//       generateQRCodeData();
//     }
//   }, [invoiceData, editableOrderMode, grandTotal]);
  
//   if (!invoiceData) return null;
  
//   const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();
  
//   const getCorrectGrandTotal = () => {
//     if (!invoiceData || !invoiceData.items) return 0;
    
//     let total = 0;
    
//     invoiceData.items.forEach(item => {
//       const quantity = parseFloat(item.quantity) || 1;
//       const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
//       const taxPerUnit = parseFloat(item.tax_amount) || 0;
      
//       const itemTaxable = taxablePerUnit * quantity;
//       const itemTax = orderMode === "KACHA" ? 0 : taxPerUnit * quantity;
//       const itemTotal = itemTaxable + itemTax;
      
//       total += itemTotal;
//     });
    
//     return total;
//   };
  
//   const correctGrandTotal = getCorrectGrandTotal();
  
//   const handleViewFullQR = () => {
//     // Save QR data to localStorage for the new page
//     localStorage.setItem('qrCodeData', qrData);
//     localStorage.setItem('invoiceDataForQR', JSON.stringify(invoiceData));
    
//     // Navigate to QR code page with state
//     navigate('/qr-code', {
//       state: {
//         qrData: qrData,
//         invoiceData: invoiceData,
//         grandTotal: correctGrandTotal,
//         orderMode: orderMode
//       }
//     });
//   };
  
//   return (
//     <Card className="shadow-sm border-0 mb-3">
//       <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
//         <h6 className="mb-0"><FaQrcode className="me-2" /> Scan to Pay</h6>
//         <Button 
//           variant="light" 
//           size="sm" 
//           onClick={handleViewFullQR}
//           className="no-print"
//         >
//           View Full Page
//         </Button>
//       </Card.Header>
//       <Card.Body>
//         <div className="text-center mb-3">
//           <div className="qr-code-box d-inline-block">
//             {qrData ? (
//               <QRCodeCanvas 
//                 value={qrData}
//                 size={150}
//                 level="H"
//                 includeMargin={true}
//               />
//             ) : (
//               <div className="p-3">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Generating QR...</span>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Amount Display */}
//           <div className="mt-3">
//             <h5 className="text-success fw-bold mb-1">₹{correctGrandTotal.toFixed(2)}</h5>
//             <span className={`badge ${orderMode === "KACHA" ? "bg-warning" : "bg-success"}`}>
//               {orderMode} ORDER
//             </span>
//           </div>
          
//           {/* Button to view full page */}
//           <Button 
//             variant="outline-primary" 
//             size="sm" 
//             onClick={handleViewFullQR}
//             className="mt-3 w-100 no-print"
//           >
//             Open QR Code in Full Page
//           </Button>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

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

    // Error state
    if (error && !invoiceData) {
      return (
        <div className="invoice-preview-page">
          <Container>
            <div className="text-center p-5">
              <Alert variant="danger">
                <h5>Error Loading Invoice</h5>
                <p>{error}</p>
                <div className="mt-3">
                  <Button variant="primary" onClick={() => window.location.reload()} className="me-2">
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

    const displayInvoiceNumber = invoiceData?.invoiceNumber || 'INV001';
    const gstBreakdown = calculateGSTBreakdown();
    const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

    return (
      <div className="invoice-preview-page">
        {/* Action Bar */}
        <div className="action-bar bg-white shadow-sm p-3 mb-3 sticky-top d-print-none no-print">
          <Container fluid>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Invoice Preview - {displayInvoiceNumber}</h4>
              <div>


                {fromPeriod && (
                  <Button 
                    variant="primary" 
                    onClick={handleGenerateInvoice} 
                    className="me-2"
                    disabled={generating}
                  >
                    {generating ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                )}
                
                {isEditing ? (
                  <>
                    <Button 
                      variant="success" 
                      onClick={handleSaveChanges} 
                      className="me-2"
                      disabled={saving}
                    >
                      {saving ? (
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


                    <Button 
                      variant="secondary" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="warning" 
                    onClick={handleEdit} 
                    className="me-2"
                  >
                    <FaEdit className="me-1" /> Edit Note & Descriptions
                  </Button>
                )}
                                  <Button 
  variant="success" 
  onClick={handlePrint} 
  className="me-2"
  disabled={downloading || !invoiceData}
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
      <FaPrint className="me-1" /> Prints
    </>
  )}
</Button>

                <Button variant="secondary" onClick={() => window.history.back()}>
                  <FaArrowLeft className="me-1" /> Go Back
                </Button>
              </div>
            </div>
          </Container>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="d-print-none no-print">
            <Container fluid>
              <Alert variant="success" className="mb-3">
                {success}
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
                <Button variant="outline-warning" size="sm" onClick={() => window.location.reload()} className="mt-2">
                  Retry API Connection
                </Button>
              </Alert>
            </Container>
          </div>
        )}

        {successMessage && (
          <div className="d-print-none no-print">
            <Container fluid>
              <Alert variant="success" className="mb-3">
                {successMessage}
              </Alert>
            </Container>
          </div>
        )}

        {errorMessage && (
          <div className="d-print-none no-print">
            <Container fluid>
              <Alert variant="danger" className="mb-3">
                {errorMessage}
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

        <Container fluid className="invoice-preview-container-order">
          <Row>
            <Col lg={8}>
              <InvoicePreview_preview
                invoiceData={invoiceData}
                isEditing={isEditing} 
                editableNote={editableNote}
                editableDescriptions={editableDescriptions}
                onNoteChange={handleNoteChange}
                onDescriptionChange={handleDescriptionChange}
                gstBreakdown={gstBreakdown}
                isSameState={isSameState}
                onOrderModeChange={handleOrderModeChange} 
                onTransportChange={handleTransportChange}   // ← ADD
  transportDetails={transportDetails}         // ← ADD
              />
            </Col>
            
            <Col lg={4}>
         <div className="sticky-top" style={{ top: '80px' }}>  
        <QRCodeGenerator 
          invoiceData={invoiceData}
          editableOrderMode={editableOrderMode}
          onQrDataGenerated={(qrUrl) => setQrData(qrUrl)}
        />
      </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  export default Period_InvoicePDFPreview;