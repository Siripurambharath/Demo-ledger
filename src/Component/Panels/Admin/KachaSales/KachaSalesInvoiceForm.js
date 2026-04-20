import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaSave, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate, useParams } from "react-router-dom";

const KachaSalesInvoiceForm = ({ user }) => {
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
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [charges, setCharges] = useState([]);

const [productSearchTerm, setProductSearchTerm] = useState("");
const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
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
    invoiceNumber: `SSA/000001/${currentFY}`, // Format: SSA/000001/25-26
    invoiceDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      name: "",
      business_name: "",
      state: "",
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
    grandTotal: 0,
     transportDetails: {
  transport: "",
   roundOff: "0.00",  
  grNumber: "",
  vehicleNo: "",
  station: ""
},    additionalCharge: "",
    additionalChargeAmount: 0,
    otherDetails: "Authorized Signatory",
    batchDetails: []
  };
});

  const [itemForm, setItemForm] = useState({
    TransactionType: "stock transfer",
    product: "",
    product_id: "",
    description: "",
    quantity: 0,
    price: 0,
    discount: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null,
         hsn_code: ""  ,
          unit_id: "",      // ← ADD THIS
  unit_name: ""     // ← ADD THIS

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

  // Fetch staff members from accounts
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const response = await fetch(`${baseurl}/accounts`);
        const data = await response.json();
        const staffs = data.filter(acc => acc.role === "staff" || acc.staffid);
        setStaffMembers(staffs);
        console.log("Staff members loaded:", staffs);
      } catch (err) {
        console.error("Failed to fetch staff members:", err);
      }
    };
    fetchStaffMembers();
  }, []);

const fetchInvoiceDataForEdit = async (voucherId) => {
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const apiData = result.data;
      const transformedData = transformApiDataToFormFormat(apiData);
      
      setInvoiceData(transformedData);
      setSelectedSupplierId(apiData.PartyID);
      setSelected(true);
      
      // Load charges
      if (apiData.additional_charges_type && apiData.additional_charges_amount) {
        setCharges([{
          type: apiData.additional_charges_type,
          amount: parseFloat(apiData.additional_charges_amount) || 0
        }]);
      } else {
        setCharges([]); // Reset if no charges
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

  // Transform API data to form format
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

    // Transform items for form display
    const items = batchDetails.map((batch, index) => {
      const quantity = parseFloat(batch.quantity) || 0;
      const price = parseFloat(batch.price) || 0;
      const discount = parseFloat(batch.discount) || 0;
      
      // Calculate item total
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const total = subtotal - discountAmount;


  
    
      return {
        product: batch.product || 'Product',
        product_id: batch.product_id || '',
        description: batch.description || '',
        quantity: quantity,
        price: price,
        discount: discount,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        batchDetails: batch.batchDetails || null,
            hsn_code: batch.hsn_code || '' ,
        unit_id: batch.unit_id || "", 
    unit_name: batch.unit_name || ""  ,
   

      };
    }) || [];


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
  business_name: apiData.business_name || apiData.AccountName || '',
        state: apiData.billing_state || apiData.BillingState || '',
        id: apiData.PartyID || null,
 gstin: apiData.gstin || '',   
     assigned_staff: apiData.assigned_staff || '',
   mobile_number: apiData.mobile_number || 
                     apiData.retailer_mobile || 
                     apiData.phone_number || 
                     apiData.retailer_phone || 
                     ''

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
      grandTotal: parseFloat(apiData.TotalAmount) || 0,
      transportDetails: transportDetails,

      additionalCharge: "",
      additionalChargeAmount: "0.00"
    };
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
}

const fetchNextInvoiceNumber = async (transactionType = "stock transfer") => {
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
        transactionType: transactionType
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

const generateFallbackInvoiceNumber = async (transactionType = "stock transfer") => {
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
    // For new invoice, fetch number for "stock transfer"
    fetchNextInvoiceNumber("stock transfer");
  }
}, [id]);

  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

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


const addChargeRow = () => {
  setCharges([...charges, { amount: '', type: "" }]);
};

const handleChargeChange = (index, field, value) => {
  const updatedCharges = [...charges];
  if (field === 'amount') {
    updatedCharges[index][field] = value === '' ? '' : parseFloat(value) || 0;
  } else {
    updatedCharges[index][field] = value;
  }
  setCharges(updatedCharges);
  
  // Recalculate total additional charges
  const totalAdditionalCharges = updatedCharges.reduce((sum, charge) => {
    const amount = charge.amount === '' ? 0 : (parseFloat(charge.amount) || 0);
    return sum + amount;
  }, 0);
  setInvoiceData(prev => ({
    ...prev,
    additionalChargeAmount: totalAdditionalCharges
  }));
};

const removeChargeRow = (index) => {
  const updatedCharges = charges.filter((_, i) => i !== index);
  setCharges(updatedCharges);
  
  // Recalculate total additional charges
  const totalAdditionalCharges = updatedCharges.reduce((sum, charge) => {
    const amount = charge.amount === '' ? 0 : (parseFloat(charge.amount) || 0);
    return sum + amount;
  }, 0);
  setInvoiceData(prev => ({
    ...prev,
    additionalChargeAmount: totalAdditionalCharges
  }));
};
  const calculateItemTotal = () => {
    const quantity = parseFloat(itemForm.quantity) || 0;
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    return {
      ...itemForm,
      total: total.toFixed(2),
      batchDetails: selectedBatchDetails,
       hsn_code: itemForm.hsn_code || ""  
    };
  };

  const recalculateAllItems = () => {
    const updatedItems = invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const total = subtotal - discountAmount;
      
      return {
        ...item,
        total: total.toFixed(2)
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
      // User clicked OK - proceed with adding item
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
        } else if (availableQuantity <= 0) {
          const confirmUpdate = window.confirm(
            `⚠️ WARNING: Batch "${selectedBatch}" has ZERO stock available.\n\n` +
            `You are trying to update quantity to ${quantity} units.\n\n` +
            `This will create a negative stock entry. Are you sure you want to continue?`
          );
          
          if (!confirmUpdate) {
            return;
          }
        }
      } else {
        // Changing to a different batch
        if (availableQuantity <= 0) {
          const confirmUpdate = window.confirm(
            `⚠️ WARNING: New batch "${selectedBatch}" has ZERO stock available.\n\n` +
            `You are trying to assign ${quantity} units to this batch.\n\n` +
            `This will create a negative stock entry. Are you sure you want to continue?`
          );
          
          if (!confirmUpdate) {
            return;
          }
        } else if (quantity > availableQuantity) {
          const confirmUpdate = window.confirm(
            `⚠️ WARNING: Insufficient stock in new batch!\n\n` +
            `New Batch: "${selectedBatch}"\n` +
            `Available stock: ${availableQuantity} units\n` +
            `Requested quantity: ${quantity} units\n\n` +
            `This will create a negative stock entry of ${quantity - availableQuantity} units.\n\n` +
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
         unit_id: itemForm.unit_id,     
      unit_name: itemForm.unit_name    

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
    } else if (selectedBatchDetails && parseFloat(selectedBatchDetails.quantity) < quantity) {
      window.alert(`⚠️ Item "${finalItem.product}" updated with insufficient stock! Negative stock created.`);
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
          unit_id: itemForm.unit_id,      // ← ADD THIS
    unit_name: itemForm.unit_name    // ← ADD THIS
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, finalItem]
    }));
    
    // Success message with stock warning if applicable
    if (selectedBatchDetails && parseFloat(selectedBatchDetails.quantity) <= 0) {
      window.alert(`⚠️ Item "${finalItem.product}" added with ZERO stock! Negative stock created.`);
    } else if (selectedBatchDetails && parseFloat(selectedBatchDetails.quantity) < quantity) {
      window.alert(`⚠️ Item "${finalItem.product}" added with insufficient stock! Negative stock created.`);
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
    price: 0,
    discount: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null,
         hsn_code: ""  ,
          unit_id: "",     
    unit_name: ""     

  });
  setBatches([]);
  setSelectedBatch("");
  setSelectedBatchDetails(null);
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
    discount: itemToEdit.discount, // Load the existing discount
    total: itemToEdit.total,
    batch: itemToEdit.batch,
    batch_id: itemToEdit.batch_id,
    batchDetails: itemToEdit.batchDetails,
          hsn_code: itemToEdit.hsn_code || "" ,
   unit_id: itemToEdit.unit_id || "",      // ← ADD THIS
    unit_name: itemToEdit.unit_name || ""   // ← ADD THIS 


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

const cancelEdit = () => {
  setEditingItemIndex(null);
  setItemForm({
    product: "",
    product_id: "",
    description: "",
    quantity: 1,
    price: 0,
    discount: 0, // Reset discount
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null,
    unit_id: "",      
    unit_name: ""     
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
  
  const additionalChargeAmount = charges.reduce((sum, charge) => {
    const amount = charge.amount === '' ? 0 : (parseFloat(charge.amount) || 0);
    return sum + amount;
  }, 0);
  
  const actualTotal = taxableAmount + additionalChargeAmount;
  const roundedGrandTotal = Math.round(actualTotal);
  const roundOff = roundedGrandTotal - actualTotal;
  
  setInvoiceData(prev => ({
    ...prev,
    taxableAmount: taxableAmount.toFixed(2),
    additionalChargeAmount: additionalChargeAmount,
    grandTotal: roundedGrandTotal,
    roundOff: roundOff.toFixed(2)  // ← ADD THIS LINE
  }));
};

useEffect(() => {
  calculateTotals();
}, [invoiceData.items, charges]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const clearDraft = () => {
  localStorage.removeItem('draftInvoice');
  
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
  
  const resetData = {
    // invoiceNumber: `SSA/000001/${currentFY}`, // Format: SSA/000001/25-26
    invoiceDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      name: "",
      business_name: "",
      state: "",
      discount: 0
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
    grandTotal: 0,
      transportDetails: {
  transport: "",
  grNumber: "",
  vehicleNo: "",
  station: ""
},    additionalCharge: "",
    additionalChargeAmount: 0,
    otherDetails: "Authorized Signatory",
    batchDetails: []
  };
  
  setInvoiceData(resetData);
  localStorage.setItem('draftInvoice', JSON.stringify(resetData));
  
  setSelected(false);
  setSelectedSupplierId(null);
  setSelectedStaffId("");
  setIsPreviewReady(false);
  
  // Reset itemForm discount
  setItemForm(prev => ({
    ...prev,
    discount: 0
  }));
  
  window.alert("✅ Draft cleared successfully!");
};



useEffect(() => {
  return () => {
    if (!isEditMode) {
      localStorage.removeItem('draftInvoice');
    }
  };
}, [isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
     window.alert("⚠️ Please select a supplier/customer");
      setLoading(false);
      return;
    }

    if (invoiceData.items.length === 0) {
        window.alert("⚠️ Please add at least one item to the invoice");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
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

      // Extract batch details from items
      const batchDetails = invoiceData.items.map(item => ({
        product: item.product,
        product_id: item.product_id,
        description: item.description,
        batch: item.batch,
        batch_id: item.batch_id,
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        total: parseFloat(item.total) || 0,
        batchDetails: item.batchDetails,
         hsn_code: item.hsn_code || "" ,
           unit_id: item.unit_id || "",    
  unit_name: item.unit_name || ""  
      }));

      const firstItemProductId = invoiceData.items[0]?.product_id || null;
      const firstItemBatchId = invoiceData.items[0]?.batch_id || null;

      // Find staff name from selected staff ID
      const selectedStaff = staffMembers.find(staff => staff.staffid == selectedStaffId);
      const staffName = selectedStaff?.name || selectedStaff?.assigned_staff || "";
 const mobileNumber = invoiceData.supplierInfo.mobile_number || 
                         invoiceData.supplierInfo.phone_number || 
                         '';
      const payload = {
        ...invoiceData,
        TransactionType: "stock transfer",
        invoiceNumber: finalInvoiceNumber,
        selectedSupplierId: selectedSupplierId,
     staffid: selectedStaffId, 
  assigned_staff: staffName, 
        type: 'stock transfer',
        batchDetails: batchDetails,
        product_id: firstItemProductId,
        batch_id: firstItemBatchId,
        primaryProductId: firstItemProductId,
        primaryBatchId: firstItemBatchId,
        PartyID: selectedSupplierId,
        AccountID: invoiceData.supplierInfo.accountId,
        PartyName: invoiceData.supplierInfo.name,
       business_name : invoiceData.supplierInfo.business_name,
       acccount_name:invoiceData.supplierInfo.account_name,
        staff_incentive: invoiceData.supplierInfo.staff_incentive || 0 ,
         gstin: invoiceData.supplierInfo.gstin || "" ,
           mobile_number: mobileNumber,
            transportDetails: invoiceData.transportDetails ,
              additional_charges_type: charges.map(c => c.type).join(','),
  additional_charges_amount: charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)

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
        console.log('🆕 Creating new stock transfer transaction');
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
        throw new Error(responseData.error || 'Failed to submit transaction');
      }
      
      localStorage.removeItem('draftInvoice');
 window.alert(isEditMode ? '✅ Transaction updated successfully!' : '✅ Stock transfer completed successfully!');
       setIsPreviewReady(true);

      // Store preview data with voucher ID
      const previewData = {
        ...invoiceData,
        invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
        voucherId: responseData.voucherId || editingVoucherId,
        product_id: responseData.product_id || firstItemProductId,
        batch_id: responseData.batch_id || firstItemBatchId,
        staffid: responseData.staffid || selectedStaffId,
        assigned_staff: responseData.assigned_staff || staffName,
         mobile_number: mobileNumber
      };
      localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
      // Navigate to preview page with voucher ID
      setTimeout(() => {
        navigate(`/kachainvoicepdf/${responseData.voucherId || editingVoucherId}`);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const quantity = parseInt(itemForm.quantity) || 0;

    const priceAfterDiscount = price - (price * discount) / 100;
    return (priceAfterDiscount * quantity).toFixed(2);
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
              </Row>

              {/* Retailer Info Section */}
           {/* Retailer Info Section */}
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
                  {accounts
                    .filter(acc => {
                      const searchLower = searchTerm.toLowerCase();
                      const name = (acc.gstin?.trim() ? acc.display_name || acc.name : acc.name || acc.display_name)?.toLowerCase() || "";
                      const businessName = acc.business_name?.toLowerCase() || "";
                      const displayName = acc.display_name?.toLowerCase() || "";
                       const mobileNumber = (acc.mobile_number || acc.phone_number || "")?.toLowerCase() || "";
                      return (acc.role === "retailer" ||
                        (acc.role === "supplier" && acc.is_dual_account == 1) ||
                        (acc.role === "staff" && acc.is_dual_account == 1) ||
                        acc.group?.trim().toLowerCase() === "sundry debtors") &&
                        (name.includes(searchLower) || 
                         businessName.includes(searchLower) || 
                          displayName.includes(searchLower) ||
                         mobileNumber.includes(searchLower));
                    })
                    .map(acc => (
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
                                gstin: supplier.gstin || '',
                                accountId: supplier.id,
                                staffid: staffId,
                                business_name: supplier.business_name,
                                account_name: supplier.account_name,
                                assigned_staff: supplier.assigned_staff || null,
                                discount: retailerDiscount,
                                staff_incentive: supplier.staff_incentive || 0,
                                mobile_number: supplier.mobile_number || supplier.phone_number || '' 
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
                    ))}
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
            <strong className="text-primary">Retailer Info</strong>
            
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
                }}
              >
                Change Retailer
              </Button>
            </div>
          </div>

          {/* Customer Info Display */}
          <div className="bg-light p-2 rounded">
            <div><strong>Name:</strong> {invoiceData.supplierInfo.name}</div>
            {/* <div><strong>Business:</strong> {invoiceData.supplierInfo.business_name}</div> */}
            {(invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number) && (
              <div><strong>Mobile:</strong> {invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number}</div>
            )}
            <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin || "Not Available"}</div>
            <div><strong>State:</strong> {invoiceData.supplierInfo.state}</div>
            {selectedStaffId && (
              <div><strong>Assigned Staff:</strong> {
                staffMembers.find(s => s.staffid == selectedStaffId)?.name ||
                staffMembers.find(s => s.staffid == selectedStaffId)?.assigned_staff ||
                invoiceData.supplierInfo.assigned_staff ||
                "Not Assigned"
              }</div>
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
              <div className="item-section mb-3 mt-3 bg-white p-3 rounded">
                <h6 className="text-primary mb-3">
                  {editingItemIndex !== null ? `Edit Item (${editingItemIndex + 1})` : 'Add Items'}
                </h6>
                <Row className="align-items-end">
              <Col md={3}>
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
      value={
        itemForm.product
          ? itemForm.product
          : productSearchTerm
      }
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
            discount: prev.discount || 0,
            batch: "",
            batch_id: "",
            hsn_code: ""
          }));
          setBatches([]);
          setSelectedBatch("");
          setSelectedBatchDetails(null);
        }
      }}
      onClick={() => {
        setIsProductDropdownOpen(true);
        setProductSearchTerm("");
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
            batch: "",
            batch_id: "",
            hsn_code: ""
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
          Select Product
        </div>

        {/* Product List */}
        <div>
          {products
            .filter(p =>
              (p.group_by === "Salescatalog" || p.can_be_sold === 1 || p.can_be_sold === true) &&
              p.product_type === "KACHA" &&
              p.goods_name.toLowerCase().includes(productSearchTerm.toLowerCase())
            )
            .map(p => {
              const availableQty = productStock[p.id] || 0;
              const isSelected = itemForm.product_id === p.id;
              const retailerDiscount = parseFloat(invoiceData.supplierInfo?.discount || 0);

              const productNetPrice = parseFloat(p.net_price) || 0;
;

              return (
                <div
                  key={p.id}
                onClick={async () => {
  // Fetch unit name if unit ID exists
  let unitName = "";
  if (p.unit) {
    try {
      const unitResponse = await fetch(`${baseurl}/units/${p.unit}`);
      if (unitResponse.ok) {
        const unitData = await unitResponse.json();
        unitName = unitData.name || "";
      }
    } catch (err) {
      console.error("Failed to fetch unit:", err);
    }
  }
  
  setItemForm(prev => ({
    ...prev,
    product: p.goods_name,
    product_id: p.id,
    price: productNetPrice,  
    description: p.description || "",
    discount: retailerDiscount,
    quantity: prev.quantity || 0,
    batch: "",
    batch_id: "",
    hsn_code: p.hsn_code || "",
    unit_id: p.unit || null,   
    unit_name: unitName  // ✅ Now unitName is defined
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
        price: productNetPrice,  
        discount: retailerDiscount
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
                    backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
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
                    Qty: {availableQty}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
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
        const selectedProduct = products.find(p => p.id === itemForm.product_id);
      const productNetPrice = selectedProduct ? parseFloat(selectedProduct.net_price) || 0 : 0;
        if (batch) {
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

                  <Col md={1}>
                    <Form.Label className="fw-bold">Qty</Form.Label>
                    <Form.Control
                      name="quantity"
                      type="number"
                      value={itemForm.quantity}
                      onChange={handleItemChange}
                      min="1"
                      className="border-primary"
                    />
                  </Col>

              <Col md={2}>
  <Form.Label className="fw-bold text-primary">
    Price (₹)
  </Form.Label>

  <Form.Control
    name="price"
    type="number"
    step="1"
    min="0"
    value={itemForm.price || ""}
    onChange={handleItemChange}
    placeholder="Enter price manually"
    className="border-primary shadow-sm"
    style={{
      height: "42px"
    }}
  />

  {/* <Form.Text className="text-muted small mt-1">
    Manual entry • You can edit the price freely
  </Form.Text> */}
</Col>

                  <Col md={2}>
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

                  <Col md={2}>
                    <Form.Label className="fw-bold">Total Price (₹)</Form.Label>
                    <Form.Control
                      type="text"
                      value={calculateTotalPrice()}
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>
                  <Col md={1}>
                    <Button 
                      variant={editingItemIndex !== null ? "warning" : "success"} 
                      onClick={addItem} 
                      className="w-100 me-1"
                    >
                      {editingItemIndex !== null ? <FaSave /> : "Add"}
                    </Button>
                    {editingItemIndex !== null && (
                      <Button 
                        variant="secondary" 
                        onClick={cancelEdit} 
                        className="w-100 mt-1"
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <Form.Control
                      name="description"
                      value={itemForm.description}
                      onChange={handleItemChange}
                      placeholder="Product description"
                      readOnly
                      className="border-primary bg-light"
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
                      <th>Units</th>
                      <th>PRICE</th>
                      <th>DISCOUNT</th>
                      <th>TOTAL</th>
                      <th>BATCH</th>
                      <th>BATCH DETAILS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted py-3">
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
           </td>                          <td className="text-end">₹{item.price}</td>
                          <td className="text-center">{item.discount}%</td>
                          <td className="text-end fw-bold">₹{item.total}</td>
                          <td>{item.batch}</td>
                          <td>
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
                          </td>
                          <td className="text-center">
                            <Button 
                              variant="warning" 
                              size="sm" 
                              onClick={() => editItem(index)}
                              className="me-1"
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => removeItem(index)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
{/* Totals and Notes Section */}
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
    
    {/* Additional Charges Section */}
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
  className=""
  onClick={() => removeChargeRow(index)}
  style={{ 
    padding: '0',
    fontSize: '18px',
    lineHeight: '2',
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
    
    <Row>
  <Col md={7} className="d-flex flex-column align-items-start">
    <div className="mb-2 fw-bold">Taxable Amount:</div>
    <div className="mb-2 fw-bold">Additional Charges:</div>
    <div className="mb-2 fw-bold">Round Off:</div>
    <div className="mb-2 fw-bold text-success fs-5">Grand Total:</div>
  </Col>

  <Col md={5} className="d-flex flex-column align-items-end">
    <div className="mb-2">₹{invoiceData.taxableAmount}</div>
    <div className="mb-2">
      ₹{charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0).toFixed(2)}
    </div>
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

          {/* Footer Section - Transportation Details LEFT, Other Details RIGHT */}
          <Row className="mb-3 bg-white p-3 rounded">
            {/* LEFT SIDE - Transportation Details with 4 fields */}
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

export default KachaSalesInvoiceForm;