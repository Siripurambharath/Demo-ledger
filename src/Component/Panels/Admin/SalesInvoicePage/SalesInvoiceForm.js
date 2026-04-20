import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaSave, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate, useParams } from "react-router-dom";

const CreateInvoice = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("INV001");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [hasFetchedInvoiceNumber, setHasFetchedInvoiceNumber] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isPriceEditing, setIsPriceEditing] = useState(false);
const [tempPrice, setTempPrice] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [productSearchTerm, setProductSearchTerm] = useState("");
const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); 
  const DocumentType = (gstRate) => {
  const rate = parseFloat(gstRate);
  if (rate === 0) return 'Bill of Supply';
  if (rate > 0) return 'Tax Invoice';
  return '';
};
  const [customerType, setCustomerType] = useState('b2b');
const [charges, setCharges] = useState([]);
const [productStock, setProductStock] = useState({});
const [invoiceData, setInvoiceData] = useState(() => {
  const savedData = localStorage.getItem('draftInvoice');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    return parsedData;
  }
  
  const getFinancialYearShort = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) {
      return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
    }
  };
const currentFY = getFinancialYearShort();
    return {
       invoiceNumber: `SSA/000001/${currentFY}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    companyInfo: {
  name: "iiiQBets",
  address: "MG Road, Bengaluru, Karnataka, 560001",
  email: "demo@gmail.com",
  phone: "9801049700",
  gstin: "29ABCDE1234F1Z5",
  state: "Karnataka",
  stateCode: "29"
},
      supplierInfo: {
        name: "",
        business_name: "",
        state: "",
        gstin: ""
      },
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      items: [],
      note: "",
      taxableAmount: 0,
      totalGST: 0,
      totalCess: 0,
       roundOff: "0.00",
      grandTotal: 0,
      transportDetails: {
  transport: "",
  grNumber: "",
  vehicleNo: "",
  station: ""
},
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
    };
  });

  const [itemForm, setItemForm] = useState({
    product: "",
    product_id: "",
    description: "",
    quantity: 0,
    price: 0,
     original_price: 0,  // ← ADD THIS LINE
    discount: 0,
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null,
     hsn_code: ""  ,
      inclusive_gst: ""  ,
       document_type: ""  ,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setEditingVoucherId(id);
      fetchInvoiceDataForEdit(id);
    } else {
      fetchNextInvoiceNumber();
    }
  }, [id]);

const fetchInvoiceDataForEdit = async (voucherId) => {
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const apiData = result.data;
      const transformedData = transformApiDataToFormFormat(apiData);
      
      // document_type is now derived from GST rate via DocumentType() — no API fetch needed
      setInvoiceData(transformedData);
      setSelectedSupplierId(apiData.PartyID);
      setSelected(true);
      
      if (apiData.additional_charges_type && apiData.additional_charges_amount) {
        setCharges([{
          type: apiData.additional_charges_type,
          amount: parseFloat(apiData.additional_charges_amount) || 0
        }]);
      }
      
      const supplierAccount = accounts.find(acc => acc.id === apiData.PartyID);
      if (supplierAccount) setInputName(supplierAccount.business_name);
      if (apiData.staffid) setSelectedStaffId(apiData.staffid);
      
      alert('✅ Invoice loaded for editing!');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to load invoice');
  } finally {
    setLoading(false);
  }
};

const transformApiDataToFormFormat = (apiData) => {
    console.log('Transforming API data for form:', apiData);
    
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
      
      // Calculate item total
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cessAmount = amountAfterDiscount * (cess / 100);
      const total = amountAfterDiscount + gstAmount + cessAmount;

      return {
        product: batch.product || 'Product',
        product_id: batch.product_id || '',
        description: batch.description || '',
        quantity: quantity,
        price: price,
         original_price: original_price,
        discount: discount,
        gst: gst,
        cgst: parseFloat(batch.cgst) || 0,
        sgst: parseFloat(batch.sgst) || 0,
        igst: parseFloat(batch.igst) || 0,
        cess: cess,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        batchDetails: batch.batchDetails || null,
        assigned_staff: batch.assigned_staff || apiData.assigned_staff || apiData.AssignedStaff || 'N/A',
         hsn_code: batch.hsn_code || ''  ,
          inclusive_gst: batch.inclusive_gst || "" ,
           unit_id: batch.unit_id || "", 
    unit_name: batch.unit_name || "" ,
  document_type: DocumentType(batch.gst),
      };
    }) || [];

    // Find the account details to get business_name
    const account = accounts.find(acc => acc.id === apiData.PartyID);
    
   let transportDetails = {
      transport: apiData.transport_name || "",
      grNumber: apiData.gr_rr_number || "",
      vehicleNo: apiData.vehicle_number || "",
      station: apiData.station_name || ""
    };
    
 
    
    return {
      voucherId: apiData.VoucherID,
      invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
    companyInfo: {
  name: "iiiQBets",
  address: "MG Road, Bengaluru, Karnataka, 560001",
  email: "demo@gmail.com",
  phone: "9801049700",
  gstin: "29ABCDE1234F1Z5",
  state: "Karnataka",
  stateCode: "29"
},
      
      supplierInfo: {
        name: apiData.PartyName || 'Customer',
 business_name: account?.business_name || apiData.business_name || 'Business',
  account_name: account?.account_name || apiData.account_name || 'Busines',
          gstin: apiData.gstin || '',
        state: apiData.billing_state || apiData.BillingState || '',
        id: apiData.PartyID || null,
        staffid: apiData.staffid || apiData.staff_id || null,
        assigned_staff: apiData.assigned_staff || apiData.AssignedStaff || account?.assigned_staff || 'N/A',
          mobile_number: apiData.retailer_mobile || 
                 apiData.mobile_number || 
               
             
                 account?.phone_number || 
                 '',
  phone_number: apiData.phone_number || account?.phone_number || ''
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
      
      items: items,
      note: apiData.Notes || "Thank you for your business!",
      taxableAmount: parseFloat(apiData.BasicAmount) || 0,
      totalGST: parseFloat(apiData.TaxAmount) || 0,
      grandTotal: parseFloat(apiData.TotalAmount) || 0,
      totalCess: "0.00",
      transportDetails: transportDetails,
      additionalCharge: "",
      additionalChargeAmount: "0.00",
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST",
      
      staffid: apiData.staffid || apiData.staff_id || null,
      assigned_staff: apiData.assigned_staff || apiData.AssignedStaff || 'N/A'
    };
  };

useEffect(() => {
  return () => {
    if (!isEditMode) {
      localStorage.removeItem('draftInvoice');
    }
  };
}, [isEditMode]); 
// Update the fetchNextInvoiceNumber function
const fetchNextInvoiceNumber = async (transactionType = "Sales") => {
  try {
    console.log('Fetching next invoice number for:', transactionType);
    // Add transactionType as query parameter
    const response = await fetch(`${baseurl}/next-invoice-number?transactionType=${encodeURIComponent(transactionType)}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Received next invoice number:', data.nextInvoiceNumber);
      setNextInvoiceNumber(data.nextInvoiceNumber);
      
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: data.nextInvoiceNumber,
        transactionType: transactionType  // Store transaction type in state
      }));
      
      setHasFetchedInvoiceNumber(true);
      
      const currentDraft = localStorage.getItem('draftInvoice');
      if (currentDraft) {
        const draftData = JSON.parse(currentDraft);
        draftData.invoiceNumber = data.nextInvoiceNumber;
        draftData.transactionType = transactionType;
        localStorage.setItem('draftInvoice', JSON.stringify(draftData));
      }
    } else {
      console.error('Failed to fetch next invoice number');
      generateFallbackInvoiceNumber(transactionType);
    }
  } catch (err) {
    console.error('Error fetching next invoice number:', err);
    generateFallbackInvoiceNumber(transactionType);
  }
};

// Update generateFallbackInvoiceNumber
const generateFallbackInvoiceNumber = async (transactionType = "Sales") => {
  try {
    const getFinancialYearShort = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      if (month >= 3) {
        return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
      } else {
        return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
      }
    };
    
    const currentFY = getFinancialYearShort();
    const prefix = `SSA/`;
    const suffix = `/${currentFY}`;
    
    // Pass transactionType to API
    const response = await fetch(`${baseurl}/last-invoice?transactionType=${encodeURIComponent(transactionType)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.lastInvoiceNumber) {
        const lastNumber = data.lastInvoiceNumber;
        const numberMatch = lastNumber.match(/SSA\/(\d+)\/\d{2}-\d{2}/);
        if (numberMatch) {
          const nextNum = parseInt(numberMatch[1]) + 1;
          const fallbackInvoiceNumber = `${prefix}${nextNum.toString().padStart(6, '0')}${suffix}`;
          setNextInvoiceNumber(fallbackInvoiceNumber);
          setInvoiceData(prev => ({
            ...prev,
            invoiceNumber: fallbackInvoiceNumber,
            transactionType: transactionType
          }));
          setHasFetchedInvoiceNumber(true);
          return;
        }
      }
    }
    
    // Default fallback
    const defaultNumber = `${prefix}000001${suffix}`;
    setNextInvoiceNumber(defaultNumber);
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: defaultNumber,
      transactionType: transactionType
    }));
    setHasFetchedInvoiceNumber(true);
    
  } catch (err) {
    console.error('Error in fallback invoice number generation:', err);
    const getFinancialYearShort = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      if (month >= 3) {
        return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
      } else {
        return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
      }
    };
    const defaultNumber = `SSA/000001/${getFinancialYearShort()}`;
    setNextInvoiceNumber(defaultNumber);
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: defaultNumber,
      transactionType: transactionType
    }));
    setHasFetchedInvoiceNumber(true);
  }
};

useEffect(() => {
  if (id) {
    setIsEditMode(true);
    setEditingVoucherId(id);
    fetchInvoiceDataForEdit(id);
  } else {
    const defaultTransactionType = "Sales"; 
    fetchNextInvoiceNumber(defaultTransactionType);
  }
}, [id]);

const getCurrentFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (month >= 3) {
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } 
};

const formatInvoiceNumber = (number) => {
  const fy = getCurrentFinancialYear();
  return `SSA/${number.toString().padStart(6, '0')}/${fy}`;
};
  const isSameState = () => {
    const companyState = invoiceData.companyInfo.state;
    const billingState = invoiceData.billingAddress?.state;
    const shippingState = invoiceData.shippingAddress?.state;
    
    const supplierState = billingState || shippingState;
    
    if (!companyState || !supplierState) {
      return true; 
    }
    
    return companyState.toLowerCase() === supplierState.toLowerCase();
  };

  // Save to localStorage whenever invoiceData changes
  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

  // Update tax type when supplier info changes
  useEffect(() => {
    const taxType = isSameState() ? "CGST/SGST" : "IGST";
    setInvoiceData(prev => ({
      ...prev,
      taxType: taxType
    }));
    
    if (invoiceData.items.length > 0) {
      recalculateAllItems();
    }
  }, [invoiceData.supplierInfo.state, invoiceData.billingAddress.state, invoiceData.shippingAddress.state]);

  // Open PDF preview - ONLY after form is submitted
  const handlePreview = () => {
    if (!isPreviewReady) {
         window.alert("⚠️ Please submit the invoice first to generate preview");
      return;
    }

    const previewData = {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber || nextInvoiceNumber
    };
    
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    if (isEditMode && editingVoucherId) {
      navigate(`/sales/invoice-preview/${editingVoucherId}`);
    } else {
      navigate("/sales/invoice-preview");
    }
  };


  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseurl}/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
  
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${baseurl}/accounts`);
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const calculateItemTotal = () => {
    const quantity = parseFloat(itemForm.quantity) || 0;
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const gst = parseFloat(itemForm.gst) || 0;
    const cess = parseFloat(itemForm.cess) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const cessAmount = amountAfterDiscount * (cess / 100);
    const total = amountAfterDiscount + gstAmount + cessAmount;
    
    const sameState = isSameState();
    let cgst, sgst, igst;
    
    if (sameState) {
 
      cgst = gst / 2;   
      sgst = gst / 2; 
      igst = 0;       
    } else {
    
      cgst = 0;         
      sgst = 0;      
      igst = gst;      
    }

    
    return {
      ...itemForm,
      total: total.toFixed(2),
      cgst: cgst.toFixed(2),  
      sgst: sgst.toFixed(2),  
      igst: igst.toFixed(2), 
      cess: cess,
      batchDetails: selectedBatchDetails,
      hsn_code: itemForm.hsn_code || ""  
    };
  };

  const recalculateAllItems = () => {
    const sameState = isSameState();
    const updatedItems = invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      const cess = parseFloat(item.cess) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cessAmount = amountAfterDiscount * (cess / 100);
      const total = amountAfterDiscount + gstAmount + cessAmount;
      
      let cgst, sgst, igst;
      
      if (sameState) {
        cgst = gst / 2;   
        sgst = gst / 2;    
        igst = 0;       
      } else {
        cgst = 0;         
        sgst = 0;         
        igst = gst;      
      }
      
      return {
        ...item,
        total: total.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2)
      };
    });
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
const addItem = () => {
  if (!itemForm.product) {
    window.alert("⚠️ Please select a product");
    return;
  }
  const quantity = parseFloat(itemForm.quantity) || 0;
  if (quantity <= 0) {
    window.alert("⚠️ Cannot add item - Quantity is zero. Please enter a quantity greater than 0.");
    return;
  }

  if (selectedBatchDetails) {
    const availableQuantity = parseFloat(selectedBatchDetails.quantity) || 0;
    
    if (availableQuantity <= 0) {
      // Show confirmation dialog for zero stock
      const confirmAdd = window.confirm(
        `⚠️ WARNING: Selected batch "${selectedBatch}" has ZERO stock available.\n\n` +
        `You are trying to add ${quantity} units.\n\n` +
        `This will create a negative stock entry. Are you sure you want to continue?`
      );
      
      if (!confirmAdd) {
        return; // User clicked Cancel - don't add item
      }
      // User clicked OK - proceed with adding item
    } else if (quantity > availableQuantity) {
      // Show warning for insufficient stock
      const confirmAdd = window.confirm(
        `⚠️ WARNING: Insufficient stock!\n\n` +
        `Batch: "${selectedBatch}"\n` +
        `Available stock: ${availableQuantity} units\n` +
        `Requested quantity: ${quantity} units\n\n` +
        `This will create a negative stock entry of ${quantity - availableQuantity} units.\n\n` +
        `Are you sure you want to continue?`
      );
      
      if (!confirmAdd) {
        return; // User clicked Cancel - don't add item
      }
    }
  }

  if (editingItemIndex !== null) {
    // Check if editing an existing item
    const existingItem = invoiceData.items[editingItemIndex];
    
    if (selectedBatchDetails) {
      const availableQuantity = parseFloat(selectedBatchDetails.quantity) || 0;
      
      if (existingItem.batch_id === selectedBatchDetails.batch_number) {
        if (quantity > availableQuantity && availableQuantity > 0) {
          const confirmUpdate = window.confirm(
            `⚠️ WARNING: Insufficient stock!\n\n` +
            `Batch: "${selectedBatch}"\n` +
            `Available stock: ${availableQuantity} units\n` +
            `Updated quantity: ${quantity} units\n\n` +
            `This will increase negative stock by ${quantity - availableQuantity} units.\n\n` +
            `Are you sure you want to update?`
          );
          
          if (!confirmUpdate) {
            return;
          }
        }
      } else {
        // Changing to a different batch
        if (quantity > availableQuantity && availableQuantity > 0) {
          const confirmUpdate = window.confirm(
            `⚠️ WARNING: Insufficient stock in new batch!\n\n` +
            `New Batch: "${selectedBatch}"\n` +
            `Available stock: ${availableQuantity} units\n` +
            `Requested quantity: ${quantity} units\n\n` +
            `This will create a negative stock entry.\n\n` +
            `Are you sure you want to continue?`
          );
          
          if (!confirmUpdate) {
            return;
          }
        }
      }
    }

    const calculatedItem = calculateItemTotal();
    const finalItem = {
      ...calculatedItem,
      batch: selectedBatch,
      batch_id: itemForm.batch_id,
      product_id: itemForm.product_id,
      batchDetails: selectedBatchDetails,
        original_price: itemForm.original_price ,
        inclusive_gst: itemForm.inclusive_gst  ,
         unit_id: itemForm.unit_id,     
      unit_name: itemForm.unit_name ,
        document_type: DocumentType(itemForm.gst), 
    };

    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, index) => 
        index === editingItemIndex ? finalItem : item
      )
    }));
    setEditingItemIndex(null);
    
    // Success message with stock warning if applicable
    if (selectedBatchDetails && parseFloat(selectedBatchDetails.quantity) <= 0) {
      window.alert(`⚠️ Item "${finalItem.product}" updated with ZERO stock! Negative stock created.`);
    } else {
      window.alert(`✅ Item "${finalItem.product}" updated successfully!`);
    }
  } else {
    // Add new item
    const calculatedItem = calculateItemTotal();
    const finalItem = {
      ...calculatedItem,
      batch: selectedBatch,
      batch_id: itemForm.batch_id,
      product_id: itemForm.product_id,
      batchDetails: selectedBatchDetails,
       inclusive_gst: itemForm.inclusive_gst  ,
        original_price: itemForm.original_price ,
          unit_id: itemForm.unit_id,      
      unit_name: itemForm.unit_name  ,
          document_type: DocumentType(itemForm.gst),
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, finalItem]
    }));
    
    // Success message with stock warning if applicable
    if (selectedBatchDetails && parseFloat(selectedBatchDetails.quantity) <= 0) {
      window.alert(`⚠️ Item "${finalItem.product}" added with ZERO stock! Negative stock created.`);
    } else {
      window.alert(`✅ Item "${finalItem.product}" added successfully!`);
    }
  }

  // Reset form
  setItemForm({
    product: "",
    product_id: "",
    description: "",
    quantity: 0,
      original_price: 0,  
    price: 0,
    discount: 0,
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null,
     hsn_code: ""  ,
     inclusive_gst: "" 
  });
  setBatches([]);
  setSelectedBatch("");
  setSelectedBatchDetails(null);
};

const fetchUnitName = async (unitId) => {
  if (!unitId) return "";
  try {
    const response = await fetch(`${baseurl}/units/${unitId}`);
    if (response.ok) {
      const unitData = await response.json();
      return unitData.name || "";
    }
  } catch (err) {
    console.error("Failed to fetch unit:", err);
  }
  return "";
};

  const editItem = (index) => {
    const itemToEdit = invoiceData.items[index];
    
  const selectedProduct = products.find(p => p.id === itemToEdit.product_id);
  const productNetPrice = selectedProduct ? parseFloat(selectedProduct.net_price) || 0 : itemToEdit.price;
  
  setItemForm({
      product: itemToEdit.product,
      product_id: itemToEdit.product_id,
      description: itemToEdit.description,
      quantity: itemToEdit.quantity,
      price: productNetPrice,
      discount: itemToEdit.discount,
      gst: itemToEdit.gst,
      cgst: itemToEdit.cgst,
      sgst: itemToEdit.sgst,
      igst: itemToEdit.igst,
      cess: itemToEdit.cess,
      total: itemToEdit.total,
      batch: itemToEdit.batch,
      batch_id: itemToEdit.batch_id,
      batchDetails: itemToEdit.batchDetails,
      hsn_code: itemToEdit.hsn_code || "" ,
        inclusive_gst: itemToEdit.inclusive_gst || ""  ,
           original_price: itemToEdit.original_price || "",
            unit_id: itemToEdit.unit_id || "",
    unit_name: itemToEdit.unit_name || "" ,
     document_type: itemToEdit.document_type || "" 
    });
    
    setSelectedBatch(itemToEdit.batch);
    setSelectedBatchDetails(itemToEdit.batchDetails);
    setEditingItemIndex(index);
    
    // Fetch batches for the product
    if (itemToEdit.product_id) {
      fetchBatchesForProduct(itemToEdit.product_id);
    }
  };

  useEffect(() => {
  if (products.length > 0) {
    products.forEach((p) => {
      fetchBatchesForProduct(p.id);
    });
  }
}, [products]);
  const fetchBatchesForProduct = async (productId) => {
    try {
      const res = await fetch(`${baseurl}/products/${productId}/batches`);
      const batchData = await res.json();
      setBatches(batchData);
         const totalQty = batchData.reduce(
      (sum, batch) => sum + Number(batch.quantity || 0),
      0
    );
   setProductStock(prev => ({
      ...prev,
      [productId]: totalQty
    }));

    } catch (err) {
      console.error("Failed to fetch batches:", err);
      setBatches([]);
    }
  };



const addChargeRow = () => {
  setCharges([...charges, { amount: 0, type: "" }]);
};

const handleChargeChange = (index, field, value) => {
  const updatedCharges = [...charges];
  updatedCharges[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
  setCharges(updatedCharges);
  
  // Recalculate total additional charges
  const totalAdditionalCharges = updatedCharges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
  setInvoiceData(prev => ({
    ...prev,
    additionalChargeAmount: totalAdditionalCharges
  }));
};

const removeChargeRow = (index) => {
  const updatedCharges = charges.filter((_, i) => i !== index);
  setCharges(updatedCharges);
  
  // Recalculate total additional charges
  const totalAdditionalCharges = updatedCharges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
  setInvoiceData(prev => ({
    ...prev,
    additionalChargeAmount: totalAdditionalCharges
  }));
};
  const cancelEdit = () => {
    setEditingItemIndex(null);
    setItemForm({
      product: "",
      product_id: "",
      description: "",
      quantity: 0,
      price: 0,
      discount: 0,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      total: 0,
      batch: "",
      batch_id: "",
      batchDetails: null
    });
    setBatches([]);
    setSelectedBatch("");
    setSelectedBatchDetails(null);
  };

  const removeItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
const calculateTotals = () => {
  const taxableAmount = invoiceData.items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    return sum + (subtotal - discountAmount);
  }, 0);
  
  const totalGST = invoiceData.items.reduce((sum, item) => {
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
  
  const totalCess = invoiceData.items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const cess = parseFloat(item.cess) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const cessAmount = amountAfterDiscount * (cess / 100);
    
    return sum + cessAmount;
  }, 0);
  
  const additionalChargeAmount = charges.reduce((sum, charge) => {
    return sum + (parseFloat(charge.amount) || 0);
  }, 0);
  
  const actualTotal = taxableAmount + totalGST + totalCess + additionalChargeAmount;
  
  const roundedGrandTotal = Math.round(actualTotal);
  
  const roundOff = roundedGrandTotal - actualTotal;
  
  setInvoiceData(prev => ({
    ...prev,
    taxableAmount: taxableAmount.toFixed(2),
    totalGST: totalGST.toFixed(2),
    totalCess: totalCess.toFixed(2),
    additionalChargeAmount: additionalChargeAmount,
    grandTotal: roundedGrandTotal,
    roundOff: roundOff.toFixed(2)  
  }));
};

useEffect(() => {
  calculateTotals();
}, [invoiceData.items, invoiceData.additionalChargeAmount, charges]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDraft = () => {
    localStorage.removeItem('draftInvoice');
    
    const resetData = {
      // invoiceNumber: formatInvoiceNumber(1), // SSA/000001/26-27
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  companyInfo: {
  name: "iiiQBets",
  address: "MG Road, Bengaluru, Karnataka, 560001",
  email: "demo@gmail.com",
  phone: "9801049700",
  gstin: "29ABCDE1234F1Z5",
  state: "Karnataka",
  stateCode: "29"
},
      supplierInfo: {
        name: "",
        businessName: "",
        state: "",
        gstin: ""
      },
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      items: [],
      note: "",
      taxableAmount: 0,
      totalGST: 0,
      totalCess: 0,
      grandTotal: 0,
      transportDetails: {
  transport: "",
  grNumber: "",
  vehicleNo: "",
  station: ""
},
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
    };
    
    setInvoiceData(resetData);
    localStorage.setItem('draftInvoice', JSON.stringify(resetData));
    
    setSelected(false);
    setSelectedSupplierId(null);
    setIsPreviewReady(false);
  window.alert("✅ Draft cleared successfully!");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);
  
  if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
    window.alert("⚠️ Please select a supplier/customer");
    setLoading(false);
    setTimeout(() => setError(null), 3000);
    return;
  }

  if (invoiceData.items.length === 0) {
    window.alert("⚠️ Please add at least one item to the invoice");
    setLoading(false);
    setTimeout(() => setError(null), 3000);
    return;
  }

  try {
    // ✅ FIRST: Get the next invoice number from API
    let finalInvoiceNumber = invoiceData.invoiceNumber;
    
    if (!isEditMode) {
      console.log('📞 Fetching next invoice number from API...');
      const invoiceNumberResponse = await fetch(`${baseurl}/next-invoice-number`);
      
      if (invoiceNumberResponse.ok) {
        const invoiceNumberData = await invoiceNumberResponse.json();
        finalInvoiceNumber = invoiceNumberData.nextInvoiceNumber;
        console.log('✅ Received next invoice number:', finalInvoiceNumber);
        
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: finalInvoiceNumber
        }));
      } else {
        console.error('Failed to fetch next invoice number, using existing:', finalInvoiceNumber);
      }
    }
    console.log('Submitting invoice with number:', finalInvoiceNumber);

    // Get staff information
    const staffAccount = accounts.find(acc => acc.staffid == selectedStaffId);
    const staffName = staffAccount?.assigned_staff || 
                     invoiceData.supplierInfo.assigned_staff || 
                     accounts.find(acc => acc.id == selectedSupplierId)?.assigned_staff ||
                     'N/A';

    const sameState = isSameState();
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalIGSTAmount = 0;
    
    let totalCGSTPercentage = 0;
    let totalSGSTPercentage = 0;
    let totalIGSTPercentage = 0;

    invoiceData.items.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      
      if (sameState) {
        totalCGSTAmount += gstAmount / 2;
        totalSGSTAmount += gstAmount / 2;
        totalCGSTPercentage = gst / 2; 
        totalSGSTPercentage = gst / 2; 
        totalIGSTPercentage = 0;      
      } else {
        totalIGSTAmount += gstAmount;
        totalIGSTPercentage = gst;
      }
    });

 const taxableAmount = invoiceData.items.reduce((sum, item) => {
  const quantity = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.price) || 0;
  const discount = parseFloat(item.discount) || 0;
  const subtotal = quantity * price;
  const discountAmount = subtotal * (discount / 100);
  return sum + (subtotal - discountAmount);
}, 0);

const totalGST = invoiceData.items.reduce((sum, item) => {
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

const totalCess = invoiceData.items.reduce((sum, item) => {
  const quantity = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.price) || 0;
  const discount = parseFloat(item.discount) || 0;
  const cess = parseFloat(item.cess) || 0;
  const subtotal = quantity * price;
  const discountAmount = subtotal * (discount / 100);
  const amountAfterDiscount = subtotal - discountAmount;
  const cessAmount = amountAfterDiscount * (cess / 100);
  return sum + cessAmount;
}, 0);

const additionalChargeAmount = charges.reduce((sum, charge) => {
  return sum + (parseFloat(charge.amount) || 0);
}, 0);

const actualTotal = taxableAmount + totalGST + totalCess + additionalChargeAmount;
const roundedGrandTotal = Math.round(actualTotal);
const roundOff = roundedGrandTotal - actualTotal; 

    const batchDetails = invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      
      return {
        product: item.product,
        product_id: item.product_id,
        description: item.description,
        batch: item.batch,
        batch_id: item.batch_id,
        quantity: quantity,
        unit_id: item.unit_id, 
        price: price,
        original_price: parseFloat(item.original_price) || 0,  
        discount: discount,
        gst: parseFloat(item.gst) || 0,          
        cgst: parseFloat(item.cgst) || 0,        
        sgst: parseFloat(item.sgst) || 0,       
        igst: parseFloat(item.igst) || 0,       
        cess: parseFloat(item.cess) || 0,
        total: parseFloat(item.total) || 0,
        batchDetails: item.batchDetails,
        assigned_staff: staffName,
        hsn_code: item.hsn_code || "",
        inclusive_gst: item.inclusive_gst || "",
         document_type: DocumentType(item.gst),  
      };
    });

    const firstItemProductId = invoiceData.items[0]?.product_id || null;
    const firstItemBatchId = invoiceData.items[0]?.batch_id || null;
    const mobileNumber = invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number || '';

const uniqueDocTypes = [...new Set(
  invoiceData.items.map(item => DocumentType(item.gst))
)];

let voucherDocumentType = null;

if (uniqueDocTypes.length === 1) {
  voucherDocumentType = uniqueDocTypes[0];
} else if (uniqueDocTypes.length >= 2) {
  voucherDocumentType = "Bill of Supply cum Tax Invoice";
}


// const sameState = isSameState();
const taxTypeValue = sameState ? 'local' : 'interstate'; 
const customerTypeValue = customerType || 'b2b'; 
    const payload = {
      ...invoiceData,
      invoiceNumber: finalInvoiceNumber,
      selectedSupplierId: selectedSupplierId,
      staffid: selectedStaffId,
      assigned_staff: staffName,
      staffName: staffName,
      type: 'sales',
      TransactionType: "Sales", 
      CGSTAmount: totalCGSTAmount.toFixed(2),   
      SGSTAmount: totalSGSTAmount.toFixed(2),    
      IGSTAmount: totalIGSTAmount.toFixed(2),   
      additional_charges_type: charges.map(c => c.type).join(','),
      additional_charges_amount: additionalChargeAmount,
      document_type:voucherDocumentType,
      CGSTPercentage: totalCGSTPercentage.toFixed(2),
      SGSTPercentage: totalSGSTPercentage.toFixed(2), 
      IGSTPercentage: totalIGSTPercentage.toFixed(2), 
      taxType: sameState ? "CGST/SGST" : "IGST",
      batchDetails: batchDetails,  
        bb_bc: customerTypeValue,     
  L_I: taxTypeValue,  
      product_id: 123,
      batch_id: "bth0001",
      primaryProductId: firstItemProductId,
      primaryBatchId: firstItemBatchId,
      PartyID: selectedSupplierId,
      AccountID: invoiceData.supplierInfo.accountId,
      account_name: invoiceData.supplierInfo.account_name || 
                    accounts.find(acc => acc.id === selectedSupplierId)?.account_name || 
                    invoiceData.supplierInfo.name,
      business_name: invoiceData.supplierInfo.business_name || 
                     accounts.find(acc => acc.id === selectedSupplierId)?.business_name || 
                     invoiceData.supplierInfo.name, 
      mobile_number: mobileNumber,
      transportDetails: invoiceData.transportDetails,
      gstin: customerType === 'b2c' ? null : invoiceData.supplierInfo.gstin,
    
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      totalCess: totalCess.toFixed(2),
      grandTotal: roundedGrandTotal,
      round_off: roundOff.toFixed(2),
    };     

    // Remove unused fields
    delete payload.companyState;
    delete payload.supplierState;
    delete payload.items;
    
    let response;
    if (isEditMode && editingVoucherId) {
      console.log('🔄 Updating existing invoice with ID:', editingVoucherId);
      response = await fetch(`${baseurl}/transactions/${editingVoucherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    } else {
      console.log('🆕 Creating new invoice with staffid:', selectedStaffId);
      response = await fetch(`${baseurl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to submit invoice');
    }
    
    console.log('✅ Server Response:', responseData);
    
    localStorage.removeItem('draftInvoice');
    window.alert(isEditMode ? '✅ Invoice updated successfully!' : '✅ Invoice submitted successfully!');
    setIsPreviewReady(true);

    // Store preview data
    const previewData = {
      ...invoiceData,
      invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
      voucherId: responseData.voucherId || editingVoucherId,
      product_id: responseData.product_id || firstItemProductId,
      batch_id: responseData.batch_id || firstItemBatchId,
      staffid: responseData.staffid || selectedStaffId,
      assigned_staff: responseData.assigned_staff || staffName,
      staffName: responseData.staffName || staffName,
      mobile_number: invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number,
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: roundedGrandTotal,
        bb_bc: customerTypeValue,
  L_I: taxTypeValue,
      roundOff: roundOff.toFixed(2),
      supplierInfo: {
        ...invoiceData.supplierInfo,
        staffid: responseData.staffid || selectedStaffId,
        assigned_staff: responseData.assigned_staff || staffName
      }
    };
    
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    setTimeout(() => {
      navigate(`/sales/invoice-preview/${responseData.voucherId || editingVoucherId}`);
    }, 2000);
    
  } catch (err) {
    console.error('❌ Error in handleSubmit:', err);
    setError(err.message);
    setTimeout(() => setError(null), 5000);
  } finally {
    setLoading(false);
  }
};

  const filteredAccounts = accounts.filter(acc => {
  const searchLower = searchTerm.toLowerCase();
  const name = (acc.gstin?.trim() ? acc.display_name || acc.name : acc.name || acc.display_name)?.toLowerCase() || "";
  const businessName = acc.business_name?.toLowerCase() || "";
  const displayName = acc.display_name?.toLowerCase() || "";
  
  return (acc.role === "retailer" ||
    (acc.role === "supplier" && acc.is_dual_account == 1) ||
    (acc.role === "staff" && acc.is_dual_account == 1) ||
    acc.group?.trim().toLowerCase() === "sundry debtors") &&
    (name.includes(searchLower) || 
     businessName.includes(searchLower) || 
     displayName.includes(searchLower));
});
  const calculateTotalPrice = () => {
    const price = parseFloat(itemForm.price) || 0;
    const gst = parseFloat(itemForm.gst) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const quantity = parseInt(itemForm.quantity) || 0;

    const priceAfterDiscount = price - (price * discount) / 100;
    const priceWithGst = priceAfterDiscount + (priceAfterDiscount * gst) / 100;
    return (priceWithGst * quantity).toFixed(2);
  };

  const handleInclPriceChange = (e) => {
  const inclPrice = parseFloat(e.target.value) || 0;
  const gst = parseFloat(itemForm.gst) || 0;
  const exclPrice = gst > 0 ? inclPrice / (1 + gst / 100) : inclPrice;
  setItemForm(prev => ({
    ...prev,
    original_price: inclPrice,
    price: parseFloat(exclPrice.toFixed(2))
  }));
};

const handleExclPriceChange = (e) => {
  const exclPrice = parseFloat(e.target.value) || 0;
  const gst = parseFloat(itemForm.gst) || 0;
  const inclPrice = exclPrice * (1 + gst / 100);
  setItemForm(prev => ({
    ...prev,
    price: exclPrice,
    original_price: parseFloat(inclPrice.toFixed(2))
  }));
};
  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      <div className={`admin-main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={window.innerWidth <= 768}
        />
        
        <div className="admin-content-wrapper">
          <Container fluid className="invoice-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="text-primary">
                {isEditMode ? `Edit Invoice - ${invoiceData.invoiceNumber}` : 'Create Invoice'}
              </h3>
              <div>
                <Button 
                  variant="info" 
                  size="sm" 
                  onClick={handlePreview}
                  className="me-2"
                  disabled={!isPreviewReady}
                >
                  <FaEye className="me-1" /> {isPreviewReady ? "View Invoice Preview" : "Submit to Enable Preview"}
                </Button>
                <Button variant="warning" size="sm" onClick={clearDraft}>
                  Clear Draft
                </Button>
              </div>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            {/* Tax Type Indicator */}
            {invoiceData.billingAddress?.state && (
              <Alert variant={isSameState() ? "success" : "warning"} className="mb-3">
                <strong>Tax Type: </strong>
                {isSameState() ? (
                  <>CGST & SGST (Same State - Company: {invoiceData.companyInfo.state}, Customer: {invoiceData.billingAddress?.state})</>
                ) : (
                  <>IGST (Inter-State: Company: {invoiceData.companyInfo.state} → Customer: {invoiceData.billingAddress?.state})</>
                )}
              </Alert>
            )}
            
            <div className="invoice-box p-3 bg-light rounded">
              <h5 className="section-title text-primary mb-3">
                {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
              </h5>

              {/* Company Info Section */}
              <Row className="mb-3 company-info bg-white p-3 rounded">
            <Col md={8}>
  <div>
    <strong className="text-primary">{invoiceData.companyInfo.name}</strong><br />
    {invoiceData.companyInfo.address}<br />
    Email: {invoiceData.companyInfo.email} | Phone: {invoiceData.companyInfo.phone}<br />
    GSTIN/UIN: {invoiceData.companyInfo.gstin}<br />
    State Name : {invoiceData.companyInfo.state || "Bihar"}, Code : {invoiceData.companyInfo.stateCode || "10"}
  </div>
</Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                 <Form.Control 
  name="invoiceNumber" 
  value={invoiceData.invoiceNumber || nextInvoiceNumber} 
  onChange={handleInputChange}
  className="border-primary"
  disabled   
  readOnly={isEditMode}
/>
<Form.Label className="fw-bold">Invoice No</Form.Label>
{!hasFetchedInvoiceNumber && !isEditMode && (
  <small className="text-muted">Loading invoice number...</small>
)}
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control 
                      type="date" 
                      name="invoiceDate"
                      value={invoiceData.invoiceDate} 
                      onChange={handleInputChange}
                      className="border-primary"
                    />
                    <Form.Label className="fw-bold">Invoice Date</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Control 
                      type="date" 
                      name="validityDate"
                      value={invoiceData.validityDate} 
                      onChange={handleInputChange}
                      className="border-primary"
                    />
                    <Form.Label className="fw-bold">Validity Date</Form.Label>
                  </Form.Group>
                </Col>
                   {/* B2B / B2C Checkboxes */}
          
              </Row>
<div className="d-flex gap-3 mb-3">
  <Form.Check
    type="checkbox"
    id="b2b-checkbox"
    label="B2B"
    checked={customerType === 'b2b'}
    onChange={(e) => {
      if (e.target.checked) {
        setCustomerType('b2b');
        // Restore GSTIN when switching back to B2B
        if (selectedSupplierId) {
          const supplier = accounts.find(acc => acc.id === selectedSupplierId);
          if (supplier) {
            setInvoiceData(prev => ({
              ...prev,
              supplierInfo: {
                ...prev.supplierInfo,
                gstin: supplier.gstin || ''
              }
            }));
          }
        }
      } else if (customerType === 'b2b') {
        setCustomerType('b2c');
        // Set GSTIN to null for B2C
        setInvoiceData(prev => ({
          ...prev,
          supplierInfo: {
            ...prev.supplierInfo,
            gstin: null
          }
        }));
      }
    }}
  />
  <Form.Check
    type="checkbox"
    id="b2c-checkbox"
    label="B2C"
    checked={customerType === 'b2c'}
    onChange={(e) => {
      if (e.target.checked) {
        setCustomerType('b2c');
        // Set GSTIN to null for B2C
        setInvoiceData(prev => ({
          ...prev,
          supplierInfo: {
            ...prev.supplierInfo,
            gstin: null
          }
        }));
      } else if (customerType === 'b2c') {
        setCustomerType('b2b');
        // Restore GSTIN when switching back to B2B
        if (selectedSupplierId) {
          const supplier = accounts.find(acc => acc.id === selectedSupplierId);
          if (supplier) {
            setInvoiceData(prev => ({
              ...prev,
              supplierInfo: {
                ...prev.supplierInfo,
                gstin: supplier.gstin || ''
              }
            }));
          }
        }
      }
    }}
  />
</div>
<div className="bg-white rounded border">
 <Row className="mb-0">
    <Col md={4} className="border-end p-3">
      {!selected ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="text-primary">Retailer Info</strong>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/retailers/add")}
            >
              New
            </Button>
          </div>
          
          {/* Searchable Dropdown */}
          <div className="position-relative">
            <div className="mb-2">
              <input
                type="text"
                className="form-control border-primary"
                placeholder="Search retailer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={() => setIsDropdownOpen(true)}
              />
            </div>
            
            {isDropdownOpen && (
              <div
                className="position-absolute w-100"
                style={{
                  top: '100%',
                  left: 0,
                  zIndex: 9999,
                  backgroundColor: '#fff',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {/* Header */}
                <div style={{ 
                  padding: '8px 16px', 
                  borderBottom: '1px solid #dee2e6', 
                  color: '#0d6efd', 
                  fontWeight: 600,
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#fff',
                  zIndex: 1
                }}>
                  Select Retailer
                </div>

                {/* Scrollable retailer list */}
                <div>
                  {filteredAccounts.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#6c757d' }}>
                      No retailers found
                    </div>
                  ) : (
                    filteredAccounts.map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          const selectedId = acc.id;
                          
                          if (selectedId === "") {
                            setInputName("");
                            setSelected(false);
                            setSelectedSupplierId(null);
                            setSelectedStaffId("");
                            setItemForm(prev => ({ ...prev, discount: 0 }));
                            setIsDropdownOpen(false);
                            setSearchTerm("");
                            setCustomerType('b2b');
                            return;
                          }
                          
                          const supplier = accounts.find(acc => acc.id == selectedId);
                          
                          if (supplier) {
                            setSelectedSupplierId(supplier.id);
                            setInputName(supplier.business_name);
                            setSelected(true);
                            
                            const staffId = supplier.staffid || null;
                            setSelectedStaffId(staffId);
                            
                            const retailerDiscount = parseFloat(supplier.discount) || 0;
                            
                            setInvoiceData(prev => ({
                              ...prev,
                              supplierInfo: {
                                name: supplier.gstin ? supplier.display_name : supplier.name,
                                state: supplier.billing_state,
                                gstin: supplier.gstin,
                                accountId: supplier.id,
                                staffid: staffId,
                                business_name: supplier.business_name,
                                account_name: supplier.account_name,
                                assigned_staff: supplier.assigned_staff || null,
                                discount: retailerDiscount,
                                mobile_number: supplier.mobile_number || '',
                                phone_number: supplier.phone_number || '',
                              },
                              billingAddress: {
                                addressLine1: supplier.billing_address_line1,
                                addressLine2: supplier.billing_address_line2 || "",
                                city: supplier.billing_city,
                                pincode: supplier.billing_pin_code,
                                state: supplier.billing_state
                              },
                              shippingAddress: {
                                addressLine1: supplier.shipping_address_line1 || supplier.billing_address_line1,
                                addressLine2: supplier.shipping_address_line2 || supplier.billing_address_line2 || "",
                                city: supplier.shipping_city || supplier.billing_city,
                                pincode: supplier.shipping_pin_code || supplier.billing_pin_code,
                                state: supplier.shipping_state || supplier.billing_state
                              }
                            }));
                            
                            setItemForm(prev => ({
                              ...prev,
                              discount: retailerDiscount
                            }));
                          }
                          
                          setIsDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          borderLeft: '3px solid transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 400, fontSize: '13px' }}>
                            {acc.gstin?.trim() ? acc.display_name || acc.name : acc.name || acc.display_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6c757d' }}>
                            {acc.business_name}
                          </div>
                           <div style={{ fontSize: '10px', color: '#0d6efd' }}>
                         {acc.mobile_number || acc.phone_number || 'No mobile'}
                      </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer: close button */}
                <div style={{ 
                  padding: '8px 16px', 
                  borderTop: '1px solid #dee2e6',
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: '#fff'
                }}>
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="text-primary">Customer Info</strong>

         

            {/* Edit + Change Retailer Buttons */}
            <div className="btn-group">
              <Button
                variant="info"
                size="sm"
                onClick={() => {
                  if (selectedSupplierId) {
                    navigate(`/retailers/edit/${selectedSupplierId}`);
                  }
                }}
              >
                <FaEdit /> Edit
              </Button>

              <Button
                variant="warning"
                size="sm"
                onClick={() => {
                  setSelected(false);
                  setSelectedSupplierId(null);
                  setSelectedStaffId("");
                  setInputName("");
                  setSearchTerm("");
                  setIsDropdownOpen(true);
                  setCustomerType('b2b');
                }}
              >
                Change Retailer
              </Button>
            </div>
          </div>

          <div className="bg-light p-2 rounded">
            {customerType === 'b2c' ? (
              <div><strong>Customer Name:</strong> {invoiceData.supplierInfo.name}</div>
            ) : (
              <div><strong>Business:</strong> {invoiceData.supplierInfo.business_name || invoiceData.supplierInfo.businessName}</div>
            )}
            
            {(invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number) && (
              <div><strong>Mobile:</strong> {invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number}</div>
            )}
            
             {customerType === 'b2b' && (
    <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin || 'N/A'}</div>
  )}
            <div><strong>State:</strong> {invoiceData.supplierInfo.state}</div>
            
            {invoiceData.supplierInfo.staffid && invoiceData.supplierInfo.staffid !== null && (
              <div>
                <strong>Assigned Staff:</strong> {
                  accounts.find(acc => acc.staffid == invoiceData.supplierInfo.staffid)?.assigned_staff ||
                  invoiceData.supplierInfo.assigned_staff ||
                  "Not Assigned"
                }
              </div>
            )}
          </div>
        </>
      )}
    </Col>

    <Col md={4} className="border-end p-3">
      <strong className="text-primary">Billing Address</strong>
      <div className="bg-light p-2 rounded mt-1">
        <div><strong>Address:</strong> {invoiceData.billingAddress?.addressLine1}</div>
        <div><strong>City:</strong> {invoiceData.billingAddress?.city}</div>
        <div><strong>Pincode:</strong> {invoiceData.billingAddress?.pincode}</div>
        <div><strong>State:</strong> {invoiceData.billingAddress?.state}</div>
      </div>
    </Col>

    <Col md={4} className="p-3">
      <strong className="text-primary">Shipping Address</strong>
      <div className="bg-light p-2 rounded mt-1">
        <div><strong>Address:</strong> {invoiceData.shippingAddress?.addressLine1}</div>
        <div><strong>City:</strong> {invoiceData.shippingAddress?.city}</div>
        <div><strong>Pincode:</strong> {invoiceData.shippingAddress?.pincode}</div>
        <div><strong>State:</strong> {invoiceData.shippingAddress?.state}</div>
      </div>
    </Col>
  </Row>
</div>
{/* Item Section */}
<div className="item-section mb-3 mt-3 bg-white p-2 rounded">
  <h6 className="text-primary mb-3">
    {editingItemIndex !== null ? `Edit Item (${editingItemIndex + 1})` : 'Add Items'}
  </h6>
  <Row className="align-items-end">
    {/* Column 1: Item (Product) */}
    <Col md={2}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Label className="mb-0 fw-bold">Item</Form.Label>
        <button
          type="button"
          className="btn btn-link p-0 text-primary"
          style={{ textDecoration: "none", fontSize: "14px" }}
          onClick={() => navigate("/salesitemspage")}
        >
          + New Item
        </button>
      </div>

      {/* Searchable Product Dropdown */}
      <div className="position-relative">
        <input
          type="text"
          className="form-control border-primary"
          placeholder="Search product..."
          value={itemForm.product ? itemForm.product : productSearchTerm}
          onChange={(e) => {
            setProductSearchTerm(e.target.value);
            setIsProductDropdownOpen(true);
            if (!e.target.value) {
              setItemForm(prev => ({
                ...prev,
                product: "",
                product_id: "",
                description: "",
                price: 0,
                gst: 0,
                batch: "",
                batch_id: "",
                hsn_code: "",
                inclusive_gst: ""
              }));
              setBatches([]);
              setSelectedBatch("");
              setSelectedBatchDetails(null);
            }
          }}
          onClick={() => {
            setIsProductDropdownOpen(true);
            setProductSearchTerm("");
            setItemForm(prev => ({
              ...prev,
              product: "",
              product_id: "",
              description: "",
              price: 0,
              gst: 0,
              batch: "",
              batch_id: "",
              hsn_code: "",
              inclusive_gst: ""
            }));
            setBatches([]);
            setSelectedBatch("");
            setSelectedBatchDetails(null);
          }}
          readOnly={!!itemForm.product}
          style={{ cursor: itemForm.product ? "pointer" : "text" }}
          title={
            itemForm.product_id ? (() => {
              const selectedProduct = products.find(p => p.id === itemForm.product_id);
              const availableQty = productStock[itemForm.product_id] || 0;
              if (selectedProduct) {
                return `${selectedProduct.goods_name} - Qty: ${availableQty}`;
              }
              return "";
            })() : "Select a product"
          }
        />

        {/* Clear/Change button when product is selected */}
        {itemForm.product && (
          <button
            type="button"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6c757d",
              fontSize: "16px",
              lineHeight: 1,
              padding: "0"
            }}
            onClick={() => {
              setProductSearchTerm("");
              setItemForm(prev => ({
                ...prev,
                product: "",
                product_id: "",
                description: "",
                price: 0,
                gst: 0,
                batch: "",
                batch_id: "",
                hsn_code: "",
                inclusive_gst: ""
              }));
              setBatches([]);
              setSelectedBatch("");
              setSelectedBatchDetails(null);
              setIsProductDropdownOpen(true);
            }}
          >
            ✕
          </button>
        )}

        {/* Product Dropdown */}
        {isProductDropdownOpen && !itemForm.product && (
          <div
            className="position-absolute w-100"
            style={{
              top: '100%',
              left: 0,
              zIndex: 9999,
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: '300px',
              overflowY: 'auto',
              minWidth: '100%'
            }}
          >
            <div style={{
              padding: '8px 16px',
              borderBottom: '1px solid #dee2e6',
              color: '#0d6efd',
              fontWeight: 600,
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1
            }}>
              Select Product
            </div>

            <div>
              {products
                .filter(p =>
                  (p.group_by === "Salescatalog" || p.can_be_sold === 1 || p.can_be_sold === true) &&
                  p.product_type === "PAKKA" &&
                  p.goods_name.toLowerCase().includes(productSearchTerm.toLowerCase())
                )
                .map(p => {
                  const availableQty = productStock[p.id] || 0;
                  const isSelected = itemForm.product_id === p.id;
                  const productNetPrice = parseFloat(p.net_price) || 0;
                  const inclusiveGst = p.inclusive_gst || "";
                  const productOriginalPrice = parseFloat(p.price) || 0;  // ← GET ORIGINAL PRICE

                  return (
                    <div
                      key={p.id}
                      onClick={async () => {
                        const retailerDiscount = parseFloat(
                          accounts.find(acc => acc.id === selectedSupplierId)?.discount || 0
                        ) || 0;


                          let unitName = "";
  if (p.unit) {
    unitName = await fetchUnitName(p.unit); 
  }
                        setItemForm(prev => ({
                          ...prev,
                          product: p.goods_name,
                          product_id: p.id,
                          price: productNetPrice,
                          original_price: productOriginalPrice,  // ← SET ORIGINAL PRICE
                          gst: parseFloat(p.gst_rate?.replace("%", "") || 0),
                          description: p.description || "",
                          discount: retailerDiscount,
                          quantity: prev.quantity || 0,
                          batch: "",
                          batch_id: "",
                          hsn_code: p.hsn_code || "",
                          inclusive_gst: inclusiveGst  ,
                           unit_id: p.unit || null,      
    unit_name: unitName   ,
                        }));

                        try {
                          const res = await fetch(`${baseurl}/products/${p.id}/batches`);
                          const batchData = await res.json();
                          setBatches(batchData);

                          if (p.maintain_batch === 0 && batchData.length > 0) {
                            const defaultBatch = batchData[0];
                            setSelectedBatch(defaultBatch.batch_number);
                            setSelectedBatchDetails(defaultBatch);
                            setItemForm(prev => ({
                              ...prev,
                              batch: defaultBatch.batch_number,
                              batch_id: defaultBatch.batch_number,
                              price: productNetPrice
                            }));
                          } else {
                            setSelectedBatch("");
                            setSelectedBatchDetails(null);
                          }
                        } catch (err) {
                          console.error("Failed to fetch batches:", err);
                          setBatches([]);
                          setSelectedBatch("");
                          setSelectedBatchDetails(null);
                        }

                        setIsProductDropdownOpen(false);
                        setProductSearchTerm("");
                      }}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        borderLeft: '3px solid transparent',
                        transition: 'background-color 0.2s',
                        backgroundColor: isSelected ? '#4cbe1bc7' : 'transparent',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = isSelected ? '#bbdef5' : '#f8f9fa';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : 'transparent';
                      }}
                      title={`${p.goods_name} - Qty: ${availableQty}`}
                    >
                      <div style={{ fontWeight: 400, fontSize: '13px' }}>{p.goods_name}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Qty: {availableQty} | {inclusiveGst}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid #dee2e6',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff'
            }}>
              <button
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={() => {
                  setIsProductDropdownOpen(false);
                  setProductSearchTerm("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Dropdown */}
      {batches.length > 0 && itemForm.maintain_batch !== 0 && (
        <Form.Select
          className="mt-2 border-primary"
          name="batch"
          value={selectedBatch}
          onChange={(e) => {
            const batchNumber = e.target.value;
            setSelectedBatch(batchNumber);
            const batch = batches.find(b => b.batch_number === batchNumber);
            setSelectedBatchDetails(batch || null);
            const currentDiscount = itemForm.discount || 0;
            
            if (batch) {
              const selectedProduct = products.find(p => p.id === itemForm.product_id);
              const productNetPrice = selectedProduct ? parseFloat(selectedProduct.net_price) || 0 : 0;
              
              setItemForm(prev => ({
                ...prev,
                batch: batchNumber,
                batch_id: batch.batch_number,
                price: productNetPrice,
                discount: currentDiscount
              }));
            } else {
              setItemForm(prev => ({
                ...prev,
                batch: "",
                batch_id: ""
              }));
            }
          }}
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.batch_number}>
              {batch.batch_number} (Qty: {batch.quantity})
            </option>
          ))}
        </Form.Select>
      )}
    </Col>

    {/* Column 2: QTY */}
    <Col md={1}>
      <Form.Label className="fw-bold">Qty</Form.Label>
      <Form.Control
        name="quantity"
        type="number"
        value={itemForm.quantity}
        onChange={handleItemChange}
        className="border-primary"
      />
    </Col>

<Col md={2}>
  <Form.Label className="fw-bold text-primary">Price Type</Form.Label>
  <Form.Control
    type="text"
    value={
      !itemForm.inclusive_gst
        ? ""
        : itemForm.inclusive_gst === "Inclusive"
        ? "Inclusive"
        : itemForm.inclusive_gst === "Exclusive"
        ? "Exclusive"
        : ""
    }
    readOnly
    className="border-primary bg-light"
    placeholder=" product type"
  />
</Col>
{/* Product Price Inclusive */}
<Col md={2}>
  <Form.Label className="fw-bold text-primary"> Price (Incl)</Form.Label>
  <Form.Control
    type="number"
    step="0.01"
    value={itemForm.original_price || ""}
    onChange={handleInclPriceChange}
    className="border-primary"
    placeholder="Enter incl. price"
  />
</Col>

{/* Price Exclusive */}
<Col md={2}>
  <Form.Label className="fw-bold text-primary">Price (Excl)</Form.Label>
  <Form.Control
    name="price"
    type="number"
    step="0.01"
    value={itemForm.price || ""}
    onChange={handleExclPriceChange}
    placeholder="Enter excl. price"
    className="border-primary shadow-sm"
  />
</Col>


    {/* Column 5: DISCOUNT (%) */}
    <Col md={1}>
      <Form.Label className="fw-bold">Discount (%)</Form.Label>
      <Form.Control
        name="discount"
        type="number"
        value={itemForm.discount}
        onChange={handleItemChange}
        min="0"
        max="100"
        className="border-primary"
      />
    </Col>

    {/* Column 6: GST (%) */}
    <Col md={1}>
      <Form.Label className="fw-bold">GST (%)</Form.Label>
      <Form.Control
        name="gst"
        type="number"
        value={itemForm.gst}
        readOnly
        className="border-primary bg-light"
      />
    </Col>

    {/* Column 7: TOTAL PRICE */}
    <Col md={2}>
      <Form.Label className="fw-bold">Total Price (₹)</Form.Label>
      <Form.Control
        type="text"
        value={calculateTotalPrice()}
        readOnly
        className="border-primary bg-light"
      />
    </Col>

    {/* Column 8: ACTION BUTTONS */}
    <Col md={1} className="sales-invoice-add px-0">
      <div className="d-flex flex-column h-100 justify-content-end">
        <Button 
          variant={editingItemIndex !== null ? "warning" : "success"} 
          onClick={addItem} 
          className="sales-invoice-add-btn mb-1"
          size="sm"
        >
          {editingItemIndex !== null ? <FaSave /> : "Add"}
        </Button>

        {editingItemIndex !== null && (
          <Button 
            variant="secondary" 
            onClick={cancelEdit} 
            className="sales-invoice-cancel-btn"
            size="sm"
          >
            <FaTimes />
          </Button>
        )}
      </div>
    </Col>
  </Row>

  <Row className="mt-3">
    <Col>
      <Form.Control
        name="description"
        value={itemForm.description}
        onChange={handleItemChange}
        placeholder="Product description"
        readOnly
        className="border-primary bg-light"
        style={{ width: '1150px', marginLeft: "10px" }}
      />
    </Col>
  </Row>
</div>
              {/* Items Table */}
              <div className="bg-white p-3 rounded">
                <h6 className="text-primary mb-3">Items List</h6>
                <Table bordered responsive size="sm" className="mb-3">
                  <thead className="table-dark">
                    <tr>
                      <th>PRODUCT</th>
                      <th>DESCRIPTION</th>
                      <th>QTY</th>
                       <th>PRICE TYPE</th> 
                       <th>PRICE (Incl)</th>  
                      <th>PRICE (Excl)</th>
        
       
                      <th>DISCOUNT</th>
                      <th>GST</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>CESS</th>
                      <th>TOTAL</th>
                      <th>BATCH</th>
                      {/* <th>BATCH DETAILS</th> */}
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center text-muted py-3">
                          No items added. Please add items using the form above.
                        </td>
                      </tr>
                    ) : (
                      invoiceData.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product}</td>
                          <td>{item.description}</td>
     <td className="text-center">
  {item.unit_name 
    ? `${item.quantity} ${item.unit_name}`
    : item.quantity}
</td>
                            <td className="text-center">{item.inclusive_gst || '-'}</td> 
                    <td className="text-end">₹{parseFloat(item.original_price).toFixed(2)}</td>  
          
                          <td className="text-end">₹{item.price}</td>
                          <td className="text-center">{item.discount}%</td>
                          <td className="text-center">{item.gst}%</td>
                          <td className="text-center">{item.cgst}%</td>
                          <td className="text-center">{item.sgst}%</td>
                          <td className="text-center">{item.igst}%</td>
                          <td className="text-center">{item.cess}</td>
                          <td className="text-end fw-bold">₹{item.total}</td>
                          <td>{item.batch}</td>
                          {/* <td>
                            {item.batchDetails && (
                             <small>
  MFG: {item.batchDetails.mfg_date 
    ? new Date(item.batchDetails.mfg_date).toLocaleDateString('en-GB') 
    : item.batchDetails.manufacturing_date 
      ? new Date(item.batchDetails.manufacturing_date).toLocaleDateString('en-GB') 
      : ''}<br/>

  EXP: {item.batchDetails.exp_date 
    ? new Date(item.batchDetails.exp_date).toLocaleDateString('en-GB') 
    : item.batchDetails.expiry_date 
      ? new Date(item.batchDetails.expiry_date).toLocaleDateString('en-GB') 
      : ''}
</small>

                            )}
                          </td> */}
<td className="salesinvoice-edit">
  <div className="d-flex flex-column gap-1 align-items-center">
    <Button 
      variant="warning" 
      size="sm" 
      onClick={() => editItem(index)}
      className="w-100"
    >
      <FaEdit />
    </Button>
    <Button 
      variant="danger" 
      size="sm" 
      onClick={() => removeItem(index)}
      className="w-100"
    >
      <FaTrash />
    </Button>
  </div>
</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

<Row className="mb-3 p-3 bg-white rounded border">
  <Col md={7}>
    <Form.Group controlId="invoiceNote">
      <Form.Label className="fw-bold text-primary">Notes</Form.Label>
      <Form.Control
        as="textarea"
        rows={5}
        name="note"
        value={invoiceData.note}
        onChange={handleInputChange}
        placeholder="Enter your note here..."
        className="border-primary"
      />
    </Form.Group>
  </Col>

  <Col md={5}>
    <h6 className="text-primary mb-3">Amount Summary</h6>
    
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="fw-bold">Additional Charges</label>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={addChargeRow}
        >
          + Add Charge
        </button>
      </div>
      
      {charges.map((charge, index) => (
        <div key={index} className="mb-2" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ width: '60%' }}>
            <input
              type="number"
              value={charge.amount === 0 ? '' : charge.amount}
              className="form-control form-control-sm"
              onChange={(e) => handleChargeChange(index, 'amount', e.target.value)}
              placeholder="Amount"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div style={{ width: '35%' }}>
            <select
              value={charge.type}
              className="form-select form-select-sm"
              onChange={(e) => handleChargeChange(index, 'type', e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="">Select Type</option>
              <option value="Insurance Charge">Insurance Charge</option>
              <option value="Loading Charge">Loading Charge</option>
              <option value="Packing Charge">Packing Charge</option>
              <option value="Other Taxes">Other Taxes</option>
              <option value="Other Charges">Other Charges</option>
              <option value="Reimbursements">Reimbursements</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <div style={{ width: '5%' }}>
            <button
              type="button"
              onClick={() => removeChargeRow(index)}
              style={{ 
                padding: '0',
                fontSize: '18px',
                lineHeight: '1',
                background: 'none',
                border: 'none',
                color: 'black',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      {charges.length === 0 && (
        <div className="text-muted small mb-2">No additional charges added</div>
      )}
    </div>
    
    {/* Totals with Round Off Column - UPDATED LAYOUT */}
    <Row>
      <Col md={7} className="d-flex flex-column align-items-start">
        <div className="mb-2 fw-bold">Amount:</div>
        <div className="mb-2 fw-bold">IGST:</div>
        <div className="mb-2 fw-bold">Total GST:</div>
        <div className="mb-2 fw-bold">Additional Charges:</div>
        <div className="mb-2 fw-bold">Round Off:</div>
        <div className="mb-2 fw-bold text-success fs-5">Grand Total:</div>
      </Col>

      <Col md={5} className="d-flex flex-column align-items-end">
        <div className="mb-2">₹{invoiceData.taxableAmount}</div>
        <div className="mb-2">₹{invoiceData.totalGST}</div>
        <div className="mb-2">₹{invoiceData.totalGST}</div>
        <div className="mb-2">₹{parseFloat(invoiceData.additionalChargeAmount || 0).toFixed(2)}</div>
        <div className="mb-2 text-danger">
          ₹{invoiceData.roundOff && parseFloat(invoiceData.roundOff) < 0 ? 
            invoiceData.roundOff : 
            `+${invoiceData.roundOff || '0.00'}`}
        </div>
        <div className="fw-bold text-success fs-5">₹{invoiceData.grandTotal}</div>
      </Col>
    </Row>

  
  </Col>
</Row>
<Row className="mb-3 bg-white p-3 rounded">
  <Col md={6}>
    <h6 className="text-primary mb-3">Transportation Details</h6>
    <Row>
      <Col md={6} className="mb-2">
        <Form.Label className="fw-bold" style={{ fontSize: '12px' }}>Transport</Form.Label>
        <Form.Control
          type="text"
          name="transport"
          placeholder="Enter transport name"
          size="sm"
          value={invoiceData.transportDetails?.transport || ""}
          onChange={(e) => {
            const newTransport = {
              ...invoiceData.transportDetails,
              transport: e.target.value
            };
            setInvoiceData(prev => ({
              ...prev,
              transportDetails: newTransport
            }));
          }}
          className="border-primary"
          style={{ fontSize: '13px', height: '32px' }}
        />
      </Col>
      
      <Col md={6} className="mb-2">
        <Form.Label className="fw-bold" style={{ fontSize: '12px' }}>GR/RR No.</Form.Label>
        <Form.Control
          type="text"
          name="grNumber"
          placeholder="Enter GR/RR number"
          size="sm"
          value={invoiceData.transportDetails?.grNumber || ""}
          onChange={(e) => {
            const newTransport = {
              ...invoiceData.transportDetails,
              grNumber: e.target.value
            };
            setInvoiceData(prev => ({
              ...prev,
              transportDetails: newTransport
            }));
          }}
          className="border-primary"
          style={{ fontSize: '13px', height: '32px' }}
        />
      </Col>
      
      <Col md={6} className="mb-2">
        <Form.Label className="fw-bold" style={{ fontSize: '12px' }}>Vehicle No.</Form.Label>
        <Form.Control
          type="text"
          name="vehicleNo"
          placeholder="Enter vehicle number"
          size="sm"
          value={invoiceData.transportDetails?.vehicleNo || ""}
          onChange={(e) => {
            const newTransport = {
              ...invoiceData.transportDetails,
              vehicleNo: e.target.value
            };
            setInvoiceData(prev => ({
              ...prev,
              transportDetails: newTransport
            }));
          }}
          className="border-primary"
          style={{ fontSize: '13px', height: '32px' }}
        />
      </Col>
      
      <Col md={6} className="mb-2">
        <Form.Label className="fw-bold" style={{ fontSize: '12px' }}>Station</Form.Label>
        <Form.Control
          type="text"
          name="station"
          placeholder="Enter station name"
          size="sm"
          value={invoiceData.transportDetails?.station || ""}
          onChange={(e) => {
            const newTransport = {
              ...invoiceData.transportDetails,
              station: e.target.value
            };
            setInvoiceData(prev => ({
              ...prev,
              transportDetails: newTransport
            }));
          }}
          className="border-primary"
          style={{ fontSize: '13px', height: '32px' }}
        />
      </Col>
    </Row>
  </Col>
  
  {/* RIGHT SIDE - Other Details (Original - DO NOT CHANGE) */}
  <Col md={6} >
    <h6 className="text-primary">Other Details</h6>
    <div className="bg-light p-2 rounded">
      <p className="mb-1">For</p>
      <p className="mb-1 fw-bold">{invoiceData.companyInfo.name}</p>
      <p className="mb-0 text-muted">{invoiceData.otherDetails}</p>
    </div>
  </Col>
</Row>

              {/* Action Buttons */}
              <div className="text-center bg-white p-3 rounded">
                <Button 
                  variant="primary" 
                  className="me-3 px-4"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Invoice' : 'Submit Invoice')}
                </Button>
                <Button 
                  variant="info" 
                  className="me-3 px-4"
                  onClick={handlePreview}
                  disabled={!isPreviewReady}
                >
                  {isPreviewReady ? 'View Invoice Preview' : 'Submit to Enable Preview'}
                </Button>
                <Button variant="danger" onClick={() => navigate("/sales/invoices")}>
                  Cancel
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;