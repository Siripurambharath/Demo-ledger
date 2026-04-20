import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Modal, Card } from 'react-bootstrap';
import './Period_InvoicePDFPreview.css';
import { FaFilePdf, FaEdit, FaArrowLeft, FaSave, FaQrcode } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";
import InvoicePreview_preview from './InvoicePreview_preview';
import { QRCodeCanvas } from "qrcode.react";

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

  // Removed receipt and payment related states

const transformPeriodDataToInvoiceFormat = (periodData) => {
  const accountDetails = periodData.fullAccountDetails || periodData.customerInfo?.account_details;
  const orderNumber = periodData.orderNumber || periodData.originalOrder?.order_number;
  const orderMode = periodData.order_mode || periodData.originalOrder?.order_mode || "Pakka";
  
  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;
  let totalGrandTotal = 0;
  
  const items = (periodData.selectedItems || []).map((item, index) => {
    const itemTaxableAmount = parseFloat(item.taxable_amount) || 0;
    const itemTaxAmount = parseFloat(item.tax_amount) || 0;
    const itemTotal = parseFloat(item.item_total) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount_percentage) || 0;
    const gst = parseFloat(item.tax_percentage) || 0;
    const cgst = parseFloat(item.cgst_percentage) || 0;
    const sgst = parseFloat(item.sgst_percentage) || 0;
    
    // Add to totals
    totalTaxableAmount += itemTaxableAmount;
    totalTaxAmount += itemTaxAmount;
    totalGrandTotal += itemTotal;
    
    return {
      id: index + 1,
      product: item.item_name || `Item ${index + 1}`,
      product_id: item.product_id || '',
      quantity: quantity,
      price: price,
      discount: discount,
      gst: gst,
      cgst: cgst,
      sgst: sgst,
      igst: 0,
      cess: 0,
      total: itemTotal.toFixed(2),
      batch: '',
      batch_id: item.batch_id || '',
      assigned_staff: item.assigned_staff || periodData.assigned_staff || 'N/A',
      staff_incentive: item.staff_incentive || 0,
      taxable_amount: itemTaxableAmount, 
      tax_amount: itemTaxAmount 
    };
  });
  
  const taxableAmount = parseFloat(periodData.selectedItemsTotal?.taxableAmount) || totalTaxableAmount;
  const taxAmount = parseFloat(periodData.selectedItemsTotal?.taxAmount) || totalTaxAmount;
  const grandTotal = parseFloat(periodData.selectedItemsTotal?.grandTotal) || totalGrandTotal;
  
  console.log("📊 IN TRANSFORM FUNCTION:");
  console.log("Calculated Taxable Amount (sum):", totalTaxableAmount);
  console.log("From selectedItemsTotal:", periodData.selectedItemsTotal?.taxableAmount);
  console.log("Final Taxable Amount to use:", taxableAmount);
  
  return {
    invoiceNumber: periodData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`,
    invoiceDate: periodData.invoiceDate || new Date().toISOString().split('T')[0],
    validityDate: periodData.validityDate || 
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    orderNumber: orderNumber,
    originalOrderNumber: orderNumber,
    order_mode: orderMode,
    
    companyInfo: periodData.companyInfo || {
      name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
      address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
      email: "sumukhusr7@gmail.com",
      phone: "3456549876543",
      gstin: "29AABCD0503B1ZG",
      state: "Karnataka"
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
    
    // Use calculated totals - ensure they are numbers before toFixed
    taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
    totalGST: (typeof taxAmount === 'number' ? taxAmount : parseFloat(taxAmount) || 0).toFixed(2),
    grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
    totalCess: "0.00",
    
    note: periodData.note || "",
    transportDetails: periodData.transportDetails || "Standard delivery",
    additionalCharge: "",
    additionalChargeAmount: "0.00",
    
    // Calculate GST totals from all items
    totalCGST: items.reduce((sum, item) => sum + (parseFloat(item.cgst) || 0), 0).toFixed(2),
    totalSGST: items.reduce((sum, item) => sum + (parseFloat(item.sgst) || 0), 0).toFixed(2),
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
    
    // Generate QR code data when invoice data is available
    if (invoiceData.grandTotal) {
      generateQRCodeData();
    }
  }
}, [invoiceData]);

// Generate QR code data
// Updated generateQRCodeData function
const generateQRCodeData = () => {
  if (!invoiceData) return '';
  
  const amount = calculateGrandTotalForQR(); // Use the correct amount based on order mode
  const upiId = 'bharathsiripuram98@okicici';
  const merchantName = invoiceData.companyInfo?.name || 'Business';
  const invoiceNumber = invoiceData.invoiceNumber || 'INV001';
  const orderMode = editableOrderMode || invoiceData.order_mode || "PAKKA";
  
  // Create UPI payment URL
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(`Payment for Invoice ${invoiceNumber} (${orderMode})`)}&cu=INR`;
  
  setQrData(upiUrl);
  
  return upiUrl;
};

const handleOrderModeChange = (value) => {
  const normalizedValue = value.toUpperCase();
  setEditableOrderMode(normalizedValue);
  
  // Update invoiceData
  if (invoiceData) {
    setInvoiceData(prev => ({
      ...prev,
      order_mode: normalizedValue
    }));
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
      product_id: '',
      taxable_amount: grandTotal
    }],
    
    taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
    totalGST: (typeof totalGST === 'number' ? totalGST : parseFloat(totalGST) || 0).toFixed(2),
    grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
    totalCess: "0.00",
    
    note: apiData.Notes || "",
    transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
    additionalCharge: "",
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
         order_mode: editableOrderMode // Add this
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
    
    const firstDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] || 
                            invoiceData?.items[0]?.description || '';

    // CRITICAL FIX: Get order_mode from local state, not from periodInvoiceData
    const orderMode = editableOrderMode || 
                      periodInvoiceData?.order_mode || 
                      periodInvoiceData?.originalOrder?.order_mode || 
                      "PAKKA";
    
    console.log("🎯 Order Mode for invoice generation:", orderMode);
    
    if (fromPeriod && periodInvoiceData) {
      const selectedItems = periodInvoiceData.selectedItems || [];
      const selectedItemIds = periodInvoiceData.selectedItemIds || periodInvoiceData.selected_item_ids || [];
      
      if (!selectedItems || selectedItems.length === 0) {
        throw new Error('No selected items found for invoice generation');
      }
      
      const accountDetails = periodInvoiceData.fullAccountDetails || 
                            periodInvoiceData.customerInfo?.account_details;
      
      const orderNumber = periodInvoiceData.orderNumber || periodInvoiceData.originalOrder?.order_number;
      
      // Get description from editableDescriptions or use first item description
      const firstItemDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] || 
                                  selectedItems[0]?.description || '';
      
      // Get assigned_staff from periodInvoiceData
      const assignedStaff = periodInvoiceData.assigned_staff || 
                           periodInvoiceData.originalOrder?.assigned_staff || 
                           'N/A';
      
      // Get staff_id/staffid from periodInvoiceData
      const staffId = periodInvoiceData.staff_id || 
                     periodInvoiceData.staffid || 
                     periodInvoiceData.originalOrder?.staff_id || 
                     null;
      
      // CRITICAL FIX: Get staff_incentive from periodInvoiceData
      const staffIncentive = periodInvoiceData.staff_incentive || 
                            periodInvoiceData.originalOrder?.staff_incentive || 
                            0;
      
      console.log("💰 Staff Incentive for invoice:", staffIncentive);
      
      // Calculate totals by SUMMING ALL ITEMS from database
      let taxableAmount = 0;
      let totalGST = 0;
      let grandTotal = 0;
      let totalDiscount = 0;
      
      // Loop through all items and sum their values from DB
      selectedItems.forEach(item => {
        // Get values from database (these already have proper calculations)
        const itemTaxableAmount = parseFloat(item.taxable_amount) || 0;
        const itemTaxAmount = parseFloat(item.tax_amount) || 0;
        const itemTotal = parseFloat(item.item_total) || 0;
        const itemDiscountAmount = parseFloat(item.discount_amount) || 0;
        
        if (orderMode.toUpperCase() === "KACHA") {
          // For KACHA mode, GST should be 0
          taxableAmount += itemTaxableAmount;
          totalGST += 0;
          grandTotal += itemTaxableAmount; // Only taxable amount
        } else {
          // For PAKKA mode, use original GST values from DB
          taxableAmount += itemTaxableAmount;
          totalGST += itemTaxAmount;
          grandTotal += itemTotal;
        }
        
        totalDiscount += itemDiscountAmount;
      });
      
      // Debug: Log the calculated totals
      console.log("📊 CALCULATED TOTALS FROM DATABASE:");
      console.log("Total Items:", selectedItems.length);
      console.log("Taxable Amount (sum of all items):", taxableAmount);
      console.log("Total GST (sum of all items):", totalGST);
      console.log("Grand Total (sum of all items):", grandTotal);
      console.log("Staff Incentive:", staffIncentive);
      
      // Show breakdown of each item
      selectedItems.forEach((item, index) => {
        console.log(`Item ${index + 1}: ${item.item_name}`);
        console.log(`  Taxable Amount: ${item.taxable_amount}`);
        console.log(`  Tax Amount: ${item.tax_amount}`);
        console.log(`  Item Total: ${item.item_total}`);
        console.log(`  Staff Incentive: ${item.staff_incentive || 'N/A'}`);
      });
      
      const payload = {
        ...periodInvoiceData,
        
        orderNumber: orderNumber,
        order_number: orderNumber,
        order_mode: orderMode.toUpperCase(), // Ensure uppercase
        
        // Include ALL items with their individual values
        items: selectedItems.map(item => ({
          originalItemId: item.id,
          product: item.item_name,
          product_id: item.product_id,
          description: editableDescriptions[item.id] || item.description || '',
          quantity: parseFloat(item.quantity) || 0,
          price: parseFloat(item.price) || 0,
          discount: parseFloat(item.discount_percentage) || 0,
          discount_amount: parseFloat(item.discount_amount) || 0,
          taxable_amount: parseFloat(item.taxable_amount) || 0, // Include taxable amount
          tax_amount: parseFloat(item.tax_amount) || 0, // Include tax amount
          // CRITICAL: Set GST to 0 for KACHA mode
          gst: orderMode.toUpperCase() === "KACHA" ? 0 : parseFloat(item.tax_percentage) || 0,
          cgst: orderMode.toUpperCase() === "KACHA" ? 0 : parseFloat(item.cgst_percentage) || 0,
          sgst: orderMode.toUpperCase() === "KACHA" ? 0 : parseFloat(item.sgst_percentage) || 0,
          igst: 0,
          cess: 0,
          total: orderMode.toUpperCase() === "KACHA" 
            ? parseFloat(item.taxable_amount) || 0  // Use taxable amount for KACHA
            : parseFloat(item.item_total) || 0,     // Use total with GST for PAKKA
          batch: '',
          batch_id: item.batch_id || '',
          item_total: parseFloat(item.item_total) || 0, // Keep original item total
          staff_incentive: item.staff_incentive || 0 // Add staff_incentive per item if available
        })),

        originalOrderNumber: orderNumber,
        originalOrderId: periodInvoiceData.originalOrderId,
        selectedItemIds: selectedItemIds,
        
        // Use our calculated totals that SUM ALL ITEMS
        taxableAmount: taxableAmount,
        totalGST: totalGST,
        totalCess: 0,
        grandTotal: grandTotal,
        totalDiscount: totalDiscount,
        
        // Also send individual sums for verification
        calculatedTotals: {
          totalTaxableAmount: taxableAmount,
          totalTaxAmount: totalGST,
          totalGrandTotal: grandTotal,
          totalDiscountAmount: totalDiscount,
          itemCount: selectedItems.length,
          staffIncentive: staffIncentive // Include staff incentive in calculated totals
        },
        
        // Add BasicAmount for voucher table
        BasicAmount: taxableAmount,
        
        note: editableNote || periodInvoiceData.note || "",
        note_preview: (editableNote || periodInvoiceData.note || "").substring(0, 200),
        
        // Use the correct description from editableDescriptions
        description_preview: firstItemDescription.substring(0, 200),
        
        customerInfo: {
          name: accountDetails?.name || periodInvoiceData.customerInfo?.name,
          businessName: accountDetails?.business_name || periodInvoiceData.customerInfo?.businessName,
          gstin: accountDetails?.gstin || periodInvoiceData.customerInfo?.gstin,
          state: accountDetails?.billing_state || periodInvoiceData.customerInfo?.state,
          id: periodInvoiceData.customerInfo?.id,
          email: accountDetails?.email || '',
          phone: accountDetails?.phone_number || accountDetails?.mobile_number || '',
          pan: accountDetails?.pan || ''
        },
        
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
        
        type: 'sales',
        selectedSupplierId: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
        PartyID: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
        AccountID: periodInvoiceData.customerInfo?.id || periodInvoiceData.AccountID,
        PartyName: accountDetails?.name || periodInvoiceData.PartyName,
        AccountName: accountDetails?.business_name || periodInvoiceData.AccountName,
        
        // ADD THESE FIELDS TO THE PAYLOAD
        assigned_staff: assignedStaff,
        staffid: staffId,
        staff_id: staffId,
        staff_incentive: staffIncentive, // CRITICAL: Add staff_incentive to payload
        
        isPartialInvoice: true,
        source: 'period_component',
        
        // Add TaxSystem field for backend
        TaxSystem: orderMode.toUpperCase() === "KACHA" ? "KACHA_NO_GST" : "GST",
        
        // Send explicit amount fields for voucher table
        TotalAmount: grandTotal,
        TaxAmount: totalGST,
        Subtotal: taxableAmount
      };

      console.log("📦 ORDER MODE in payload:", payload.order_mode);
      console.log("📦 STAFF INCENTIVE in payload:", payload.staff_incentive);
      console.log("📦 CALCULATED TOTALS in payload:", payload.calculatedTotals);
      console.log("📦 FULL INVOICE PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${baseurl}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate invoice");
      }

      setSuccessMessage(`Invoice generated successfully! Invoice Number: ${result.invoiceNumber || payload.invoiceNumber}`);
      
      setTimeout(() => {
        navigate('/period');
      }, 3000);

    } else {
      // Handle non-period invoice generation...
    }
  } catch (error) {
    console.error("Error generating invoice:", error);
    setErrorMessage(`Failed to generate invoice: ${error.message}`);

    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  } finally {
    setGenerating(false);
  }
};

  // Handle download PDF
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError(null);
      
      if (!invoiceData) {
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

      let pdfDoc;
      try {
        pdfDoc = (
          <InvoicePDFDocument 
            invoiceData={invoiceData}
            invoiceNumber={invoiceData.invoiceNumber}
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
      
      const filename = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;

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


  // Added this function to calculate KACHA/PAKKA grand total
const calculateGrandTotalForQR = () => {
  if (!invoiceData) return 0;
  
  const grandTotal = parseFloat(invoiceData.grandTotal) || 0;
  const orderMode = editableOrderMode || invoiceData.order_mode || "PAKKA";
  
  // If KACHA mode, calculate without GST
  if (orderMode.toUpperCase() === "KACHA") {
    // Calculate total taxable amount from all items
    let totalTaxableAmount = 0;
    if (invoiceData.items && invoiceData.items.length > 0) {
      totalTaxableAmount = invoiceData.items.reduce((sum, item) => {
        const taxableAmount = parseFloat(item.taxable_amount) || 
          (parseFloat(item.quantity) * parseFloat(item.price) * 
           (1 - (parseFloat(item.discount) / 100))) || 0;
        return sum + taxableAmount;
      }, 0);
    }
    return totalTaxableAmount;
  }
  
  return grandTotal; // For PAKKA mode, use full amount with GST
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

  // Use Effects
  useEffect(() => {
    if (location.state && location.state.invoiceData) {
      console.log('📦 Received data from Period component:', location.state.invoiceData);
      
      const periodData = location.state.invoiceData;
      setPeriodInvoiceData(periodData);
      setFromPeriod(true);
      setLoading(false);
      
      const transformedData = transformPeriodDataToInvoiceFormat(periodData);
      setInvoiceData(transformedData);
      
      // Initialize editable descriptions and note
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
// Updated QRCodeGenerator component
const QRCodeGenerator = () => {
  if (!invoiceData) return null;
  
  const grandTotal = calculateGrandTotalForQR(); // Get correct amount
  const orderMode = editableOrderMode || invoiceData.order_mode || "PAKKA";
  
  return (
    <Card className="shadow-sm border-0 mb-3">
      <Card.Header className="bg-primary text-white">
        <h6 className="mb-0"><FaQrcode className="me-2" /> Scan to Pay via UPI</h6>
      </Card.Header>
      <Card.Body className="text-center">
        <div className="qr-code-box mb-3">
          <QRCodeCanvas 
            value={qrData || generateQRCodeData()}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="payment-details">
          <div className="mb-2">
            <span className={`badge ${orderMode === "KACHA" ? "bg-warning" : "bg-success"}`}>
              {orderMode} ORDER
            </span>
          </div>
          <h5 className="text-success mb-2">
            ₹{grandTotal.toFixed(2)}
          </h5>
          
     
        </div>
      </Card.Body>
     
    </Card>
  );
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
                variant="danger" 
                onClick={handleDownloadPDF} 
                className="me-2"
                disabled={downloading || !invoiceData}
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

      {/* Main Content with QR Code on Right Side */}
      <Container fluid className="invoice-preview-container-order">
        <Row>
          {/* Left Column - Invoice Preview (8 columns) */}
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
            />
          </Col>
          
          <Col lg={4}>
            <div className="sticky-top" style={{ top: '80px' }}>
              <QRCodeGenerator />
              
             
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Period_InvoicePDFPreview;