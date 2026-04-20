import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './PurchaseInvoice.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate } from "react-router-dom";

const CreateProductInvoice = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [productSearchTerm, setProductSearchTerm] = useState("");
const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("PINV001");
  const [editingIndex, setEditingIndex] = useState(null); 
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [hasFetchedInvoiceNumber, setHasFetchedInvoiceNumber] = useState(false);
  const navigate = useNavigate();
  const [charges, setCharges] = useState([]);
  const [discountCharges, setDiscountCharges] = useState([]);
  const [productStock, setProductStock] = useState({});
  const [selectedStaffId, setSelectedStaffId] = useState("");
const [staffMembers, setStaffMembers] = useState([]);
const [isEditMode, setIsEditMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState(() => {
    const savedData = localStorage.getItem('draftPurchaseInvoice');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    return {
      invoiceNumber: "", // Changed from "PINV001" to empty string
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
        businessName: "",
        account_name:"",
        state: "",
        gstin: "",
          mobile_number: "",
      phone_number: ""
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
  },      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
    };
  });

  const [itemForm, setItemForm] = useState({
    product: "",
    product_id: null,
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
    batchDetails: null,
      hsn_code: "",
       unit_id: "",      // ← ADD THIS
  unit_name: ""     // ← ADD THIS  
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);


  // Check if states are same for GST calculation
  const isSameState = () => {
    const companyState = invoiceData.companyInfo.state;
    const supplierState = invoiceData.supplierInfo.state;

    if (!companyState || !supplierState) {
      return true;
    }

    return companyState.toLowerCase() === supplierState.toLowerCase();
  };

  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftPurchaseInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

  useEffect(() => {
    const taxType = isSameState() ? "CGST/SGST" : "IGST";
    setInvoiceData(prev => ({
      ...prev,
      taxType: taxType
    }));

    if (invoiceData.items.length > 0) {
      recalculateAllItems();
    }
  }, [invoiceData.supplierInfo.state, invoiceData.companyInfo.state]);

  const handlePreview = () => {
    if (!isPreviewReady) {
      window.alert("⚠️ Please submit the purchase invoice first to generate preview");
      return;
    }

    const previewData = {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber || nextInvoiceNumber
    };

    localStorage.setItem('previewPurchaseInvoice', JSON.stringify(previewData));

    navigate("/purchase/invoice-preview");
  };

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
  
  const totalAdditionalCharges = updatedCharges.reduce((sum, charge) => {
    const amount = charge.amount === '' ? 0 : (parseFloat(charge.amount) || 0);
    return sum + amount;
  }, 0);
  setInvoiceData(prev => ({
    ...prev,
    additionalChargeAmount: totalAdditionalCharges
  }));
};
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch products - Filter by Purchaseditems
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products for purchase invoice...');
        const res = await fetch(`${baseurl}/products`);
        if (res.ok) {
          const data = await res.json();
          console.log('All products fetched:', data);
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
          setError('Failed to load products');
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  // Fetch suppliers
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching suppliers for purchase invoice...');
        const res = await fetch(`${baseurl}/accounts`);
        if (res.ok) {
          const data = await res.json();
          console.log('All accounts fetched:', data);
          setAccounts(data);
        } else {
          console.error('Failed to fetch accounts');
          setError('Failed to load suppliers');
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
        setError('Failed to load suppliers');
      }
    };
    fetchAccounts();
  }, []);



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

const updateItem = () => {
  if (editingIndex === null) return;

  const calculatedItem = {
    ...calculateItemTotal(),
    batch: selectedBatch,
    batchDetails: selectedBatchDetails,
    product_id: itemForm.product_id,
     unit_id: itemForm.unit_id,     
    unit_name: itemForm.unit_name    
  };

  setInvoiceData(prev => ({
    ...prev,
    items: prev.items.map((item, index) => 
      index === editingIndex ? calculatedItem : item
    )
  }));

  // Reset form and editing state
  setItemForm({
    product: "",
    product_id: null,
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    total: 0,
    batch: "",
    batchDetails: null,
    hsn_code: ""  ,
      unit_id: "",      
    unit_name: ""    
  });
  setBatches([]);
  setSelectedBatch("");
  setSelectedBatchDetails(null);
  setEditingIndex(null);
    window.alert("✅ Item updated successfully!");
};

const cancelEdit = () => {
  setItemForm({
    product: "",
    product_id: null,
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    total: 0,
    batch: "",
    batchDetails: null,
      hsn_code: ""  ,
       unit_id: "",      
    unit_name: ""   
  });
  setBatches([]);
  setSelectedBatch("");
  setSelectedBatchDetails(null);
  setEditingIndex(null);
};

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

  const calculatedItem = {
    ...calculateItemTotal(),
    batch: selectedBatch,
    batch_id: itemForm.batch_id,
    batchDetails: selectedBatchDetails,
    product_id: itemForm.product_id,
     unit_id: itemForm.unit_id,     
    unit_name: itemForm.unit_name    
  };

  setInvoiceData(prev => ({
    ...prev,
    items: [...prev.items, calculatedItem]
  }));

  // Reset form after adding item
  setItemForm({
    product: "",
    product_id: null,
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
    batchDetails: null,
    hsn_code: ""  ,
      unit_id: "",     
    unit_name: ""     
  });

  setBatches([]);
  setSelectedBatch("");
  setSelectedBatchDetails(null);

  window.alert(`✅ Item "${calculatedItem.product}" added successfully!`);
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

  // Calculate additional charges total
  const additionalChargeAmount = charges.reduce((sum, charge) => {
    const amount = charge.amount === '' ? 0 : (parseFloat(charge.amount) || 0);
    return sum + amount;
  }, 0);
  
// Calculate discount charges total
let discountChargesTotal = 0;
discountCharges.forEach(charge => {
  const amount = parseFloat(charge.amount) || 0;
  if (charge.calculationType === "percentage") {
    const baseAmount = taxableAmount + totalGST + totalCess + additionalChargeAmount;
    discountChargesTotal += baseAmount * (amount / 100);
  } else {
    discountChargesTotal += amount;
  }
});

const actualTotal = taxableAmount + totalGST + totalCess + additionalChargeAmount - discountChargesTotal;  
const roundedGrandTotal = Math.round(actualTotal);
const roundOff = roundedGrandTotal - actualTotal;

  setInvoiceData(prev => ({
    ...prev,
    taxableAmount: taxableAmount.toFixed(2),
    totalGST: totalGST.toFixed(2),
    totalCess: totalCess.toFixed(2),
    additionalChargeAmount: additionalChargeAmount,
    grandTotal: roundedGrandTotal,
    roundOff: roundOff.toFixed(2)  // ← ADD THIS LINE
  }));
};

useEffect(() => {
  calculateTotals();
}, [invoiceData.items, charges, discountCharges]); // Add discountCharges

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDraft = async () => {
    localStorage.removeItem('draftPurchaseInvoice');

    const resetData = {
      invoiceNumber: "", // Changed to empty string
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
        businessName: "",
          business_name: "", // Add this
      account_name: "", // Add this
        state: "",
        gstin: "",
         accountId: "" // ✅ Add this if needed
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
    localStorage.setItem('draftPurchaseInvoice', JSON.stringify(resetData));

    setSelected(false);
    setSelectedSupplierId(null);
    setSelectedStaffId(""); // ← ADD THIS LINE
    setIsPreviewReady(false);
   window.alert("✅ Draft cleared successfully!");
  };



useEffect(() => {
  return () => {
    if (!isEditMode) {
      localStorage.removeItem('draftPurchaseInvoice'); // ✅ Correct key name
    }
  };
}, [isEditMode]);


useEffect(() => {
  const fetchStaffMembers = async () => {
    try {
      const response = await fetch(`${baseurl}/accounts`);
      const data = await response.json();
      const staffs = data.filter(acc => acc.role === "staff" || acc.staffid);
      setStaffMembers(staffs);
    } catch (err) {
      console.error("Failed to fetch staff members:", err);
    }
  };
  fetchStaffMembers();
}, []);



const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
     window.alert("⚠️ Please select a supplier");
    setLoading(false);
    return;
  }

    if (!invoiceData.invoiceNumber || invoiceData.invoiceNumber.trim() === "") {
    window.alert("⚠️ Please enter an Purchase invoice number"); 
    setLoading(false);
    return;
  }
  if (invoiceData.items.length === 0) {
        window.alert("⚠️ Please add at least one item to the invoice"); 
    setLoading(false);
    return;
  }

  try {
    const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
    console.log('Submitting purchase invoice with number:', finalInvoiceNumber);


    const sameState = isSameState();
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    if (sameState) {
      totalCGST = parseFloat(invoiceData.totalGST) / 2;
      totalSGST = parseFloat(invoiceData.totalGST) / 2;
      totalIGST = 0;
    } else {
      totalCGST = 0;
      totalSGST = 0;
      totalIGST = parseFloat(invoiceData.totalGST);
    }

    // Enhanced debugging for items
    console.log('🔍 Debugging Items Array Before Processing:');
    invoiceData.items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        product: item.product,
        product_id: item.product_id,
        batch: item.batch,
        batch_id: item.batch_id,
        has_product_id: !!item.product_id,
        has_batch_id: !!item.batch_id
      });
    });

    // Extract batch details from items with ALL data including discount and GST
    const batchDetails = invoiceData.items.map(item => ({
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
      total: parseFloat(item.total) || 0,
      batchDetails: item.batchDetails,
       hsn_code: item.hsn_code || "" ,
       
  unit_id: item.unit_id || "",      
  unit_name: item.unit_name || ""   
    }));

    console.log('📦 Processed Batch Details:');
    batchDetails.forEach((detail, index) => {
      console.log(`Batch Detail ${index + 1}:`, {
        product_id: detail.product_id,
        batch_id: detail.batch_id,
        product: detail.product,
        batch: detail.batch
      });
    });

    const firstItemProductId = invoiceData.items[0]?.product_id || null;
    const firstItemBatchId = invoiceData.items[0]?.batch_id || null;
    
    const missingProductIds = invoiceData.items.filter(item => !item.product_id);
    const missingBatchIds = invoiceData.items.filter(item => !item.batch_id);
    
    if (missingProductIds.length > 0) {
      console.warn('⚠️ Items missing product_id:', missingProductIds);
    }
    if (missingBatchIds.length > 0) {
      console.warn('⚠️ Items missing batch_id:', missingBatchIds);
    }
const firstDiscount = discountCharges[0] || {};
    const payload = {
      ...invoiceData,
      invoiceNumber: finalInvoiceNumber,
      selectedSupplierId: selectedSupplierId,
      TransactionType: 'Purchase', 
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2),
      taxType: sameState ? "CGST/SGST" : "IGST",
      batchDetails: batchDetails,
      primaryProductId: firstItemProductId,
      primaryBatchId: firstItemBatchId,
      PartyID: selectedSupplierId,
     AccountID: selectedSupplierId,
      PartyName: invoiceData.supplierInfo.name,
      AccountName: invoiceData.supplierInfo.account_name,
      discount_charges: firstDiscount.calculationType || "amount",
  discount_charges_amount: discountCharges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),

       transportDetails: invoiceData.transportDetails ,
  additional_charges_type: charges.map(c => c.type).join(','), 
  additional_charges_amount: charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
       businessName: invoiceData.supplierInfo.businessName ,
      shippingAddress: invoiceData.shippingAddress?.addressLine1 || '',
      shippingState: invoiceData.shippingAddress?.state || '',
      shippingCity: invoiceData.shippingAddress?.city || '',
      shippingPincode: invoiceData.shippingAddress?.pincode || '',
      billingAddress: invoiceData.billingAddress?.addressLine1 || '',
      billingState: invoiceData.billingAddress?.state || '',
      billingCity: invoiceData.billingAddress?.city || '',
      billingPincode: invoiceData.billingAddress?.pincode || '',
      PaymentTerms: invoiceData.PaymentTerms || "Immediate",
      Freight: parseFloat(invoiceData.Freight) || 0,
      BillSundryAmount: parseFloat(invoiceData.BillSundryAmount) || 0,
      transportDetails: invoiceData.transportDetails || '',
      note: invoiceData.note || ''
    };

    // Remove unused fields
    delete payload.companyState;
    delete payload.supplierState;
    delete payload.items;

 
    
    // Final validation
    if (!payload.product_id || !payload.batch_id) {
      console.error('❌ CRITICAL: product_id or batch_id is still undefined in payload!');
      console.error('Payload structure:', JSON.stringify(payload, null, 2));
    } else {
      console.log('✅ SUCCESS: product_id and batch_id are properly set in payload!');
    }

    console.log('Submitting purchase invoice payload with invoice number:', payload.invoiceNumber);

    const response = await fetch(`${baseurl}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to submit purchase invoice');
    }

    // Clear localStorage and set success
    localStorage.removeItem('draftPurchaseInvoice');
   window.alert('✅ Purchase invoice submitted successfully!');
       setIsPreviewReady(true);

    // Also update invoiceData with the new number
    setInvoiceData(prev => ({
      ...prev,
    }));

    const newDraftData = {
      ...invoiceData,
      items: [],
      taxableAmount: 0,
      totalGST: 0,
      totalCess: 0,
      grandTotal: 0
    };
    localStorage.setItem('draftPurchaseInvoice', JSON.stringify(newDraftData));

    const previewData = {
      ...invoiceData,
      invoiceNumber: finalInvoiceNumber,
      voucherId: responseData.voucherId
    };
    localStorage.setItem('previewPurchaseInvoice', JSON.stringify(previewData));

    setTimeout(() => {
      navigate(`/purchase/invoice-preview/${responseData.voucherId}`);
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
    const gst = parseFloat(itemForm.gst) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const quantity = parseInt(itemForm.quantity) || 0;

    const priceAfterDiscount = price - (price * discount) / 100;
    const priceWithGst = priceAfterDiscount + (priceAfterDiscount * gst) / 100;
    return (priceWithGst * quantity).toFixed(2);
  };


 const addDiscountChargeRow = () => {
  setDiscountCharges([...discountCharges, { amount: '', calculationType: "amount" }]);
};

const handleDiscountChargeChange = (index, field, value) => {
  const updatedCharges = [...discountCharges];
  if (field === 'amount') {
    updatedCharges[index][field] = value === '' ? '' : parseFloat(value) || 0;
  } else {
    updatedCharges[index][field] = value;
  }
  setDiscountCharges(updatedCharges);
};

const removeDiscountChargeRow = (index) => {
  const updatedCharges = discountCharges.filter((_, i) => i !== index);
  setDiscountCharges(updatedCharges);
};
const editItem = async (index) => {
  const itemToEdit = invoiceData.items[index];
  
  // Set the form data
  setItemForm({
    ...itemToEdit,
    product: itemToEdit.product,
    product_id: itemToEdit.product_id,
    batch: itemToEdit.batch,
    batchDetails: itemToEdit.batchDetails,
     hsn_code: itemToEdit.hsn_code || "" ,
       unit_id: itemToEdit.unit_id || "",    
    unit_name: itemToEdit.unit_name || ""  
  });
  
  setSelectedBatch(itemToEdit.batch || "");
  setSelectedBatchDetails(itemToEdit.batchDetails || null);
  setEditingIndex(index);

  // Fetch batches for the product being edited
  if (itemToEdit.product_id) {
    try {
      const res = await fetch(`${baseurl}/products/${itemToEdit.product_id}/batches`);
      if (res.ok) {
        const batchData = await res.json();
        setBatches(batchData);
      } else {
        console.error("Failed to fetch batches for editing");
        setBatches([]);
      }
    } catch (err) {
      console.error("Failed to fetch batches for editing:", err);
      setBatches([]);
    }
  } else {
    setBatches([]);
  }
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
              <h3 className="text-primary">Create Purchase Invoice</h3>
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
            {invoiceData.supplierInfo.state && (
              <Alert variant={isSameState() ? "success" : "warning"} className="mb-3">
                <strong>Tax Type: </strong>
                {isSameState() ? (
                  <>CGST & SGST (Same State - {invoiceData.companyInfo.state})</>
                ) : (
                  <>IGST (Inter-State: {invoiceData.companyInfo.state} to {invoiceData.supplierInfo.state})</>
                )}
              </Alert>
            )}

            <div className="invoice-box p-3 bg-light rounded">
              <h5 className="section-title text-primary mb-3">Create Purchase Invoice</h5>

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
    value={invoiceData.invoiceNumber}
    onChange={handleInputChange}
    className="border-primary"
    placeholder="Enter purchase invoice number"
    required // ← Added required attribute
  />
  <Form.Label className="fw-bold">
    Purchase Invoice No <span className="text-danger">*</span> {/* ← Added asterisk */}
  </Form.Label>
  {/* ✅ NEW: Visual validation message */}
  {/* {!invoiceData.invoiceNumber && (
    <Form.Text className="text-danger">
      Invoice number is required
    </Form.Text>
  )} */}
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

              {/* Supplier Info Section */}
              <div className="bg-white rounded border">
                <Row className="mb-0">
             <Col md={4} className="border-end p-3">
  {!selected ? (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong className="text-primary">Supplier Info</strong>
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
            placeholder="Search supplier..."
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
              Select Supplier
            </div>

            {/* Scrollable supplier list */}
            <div>
              {accounts
                .filter(acc => {
                  const searchLower = searchTerm.toLowerCase();
                  const name = (acc.gstin?.trim() ? acc.display_name || acc.name : acc.name || acc.display_name)?.toLowerCase() || "";
                  const businessName = acc.business_name?.toLowerCase() || "";
                  const displayName = acc.display_name?.toLowerCase() || "";
                   const mobileNumber = (acc.mobile_number || acc.phone_number || "")?.toLowerCase() || "";
                  return (acc.role === "supplier" || 
                    (acc.role === "retailer" && acc.is_dual_account == 1)) &&
                    (name.includes(searchLower) || 
                     businessName.includes(searchLower) || 
                     displayName.includes(searchLower));
                })
                .map(acc => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setInputName(acc.business_name);
                      setSelectedSupplierId(acc.id);
                      setSelected(true);

                      const accountDiscount = parseFloat(acc.discount) || 0;
                      
                      setInvoiceData(prev => ({
                        ...prev,
                        supplierInfo: {
                          name: acc.gstin ? acc.display_name || acc.business_name : acc.name || acc.business_name,
                          businessName: acc.business_name,
                          account_name: acc.account_name,
                          state: acc.billing_state,
                          gstin: acc.gstin || "",
                          discount: accountDiscount,
                          accountId: acc.id,
                            mobile_number: acc.mobile_number || acc.phone_number || "",
                          phone_number: acc.phone_number || acc.mobile_number || ""
                        },
                        billingAddress: {
                          addressLine1: acc.billing_address_line1,
                          addressLine2: acc.billing_address_line2 || "",
                          city: acc.billing_city,
                          pincode: acc.billing_pin_code,
                          state: acc.billing_state
                        },
                        shippingAddress: {
                          addressLine1: acc.shipping_address_line1,
                          addressLine2: acc.shipping_address_line2 || "",
                          city: acc.shipping_city,
                          pincode: acc.shipping_pin_code,
                          state: acc.shipping_state
                        }
                      }));
                      
                      setItemForm(prev => ({
                        ...prev,
                        discount: accountDiscount
                      }));
                      
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
        <strong className="text-primary">Supplier Info</strong>
        
        {/* Both Buttons */}
        <div className="btn-group">
          {/* Edit Button */}
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

          {/* Change Supplier Button */}
          <Button
            variant="warning"
            size="sm"
            onClick={() => {
              setSelected(false);
              setSelectedSupplierId(null);
              setInputName("");
              setSearchTerm("");
              setIsDropdownOpen(true);
            }}
          >
            Change Supplier
          </Button>
        </div>
      </div>

      {/* Supplier Info Display */}
      <div className="bg-light p-2 rounded">
        {/* <div><strong>Name:</strong> {invoiceData.supplierInfo.name}</div> */}
        <div><strong>Business:</strong> {invoiceData.supplierInfo.businessName}</div>
          {(invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number) && (
          <div><strong>Mobile:</strong> {invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number}</div>
        )}
        <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin}</div>
        <div><strong>State:</strong> {invoiceData.supplierInfo.state}</div>
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

              {/* Item Section - Filter products by Purchaseditems */}
              <div className="item-section mb-3 mt-3 bg-white p-3 rounded">
                <h6 className="text-primary mb-3">Add Items</h6>
                <Row className="align-items-end">
              <Col md={2}>
  <div className="d-flex justify-content-between align-items-center mb-1">
    <Form.Label className="mb-0 fw-bold">Item</Form.Label>
    <button
      type="button"
      className="btn btn-link p-0 text-primary"
      style={{ textDecoration: "none", fontSize: "14px" }}
      onClick={() => navigate("/AddProductPage")}
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
            gst: 0,
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
        setItemForm(prev => ({
          ...prev,
          product: "",
          product_id: "",
          description: "",
          price: 0,
          gst: 0,
          batch: "",
          batch_id: ""
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
            .filter((p) => {
              const groupMatch = p.group_by === "Purchaseditems" || p.can_be_sold === true;
              const typeMatch = p.product_type === "PAKKA";
              const searchMatch = p.goods_name.toLowerCase().includes(productSearchTerm.toLowerCase());
              return groupMatch && typeMatch && searchMatch;
            })
            .map((p) => {
              const availableQty = productStock[p.id] || 0;
              const supplierAccount = accounts.find(acc => acc.id === selectedSupplierId);
              const supplierDiscount = parseFloat(supplierAccount?.discount) || 0;
               const productNetPrice = parseFloat(p.net_price) || 0;
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

  setItemForm((prev) => ({
    ...prev,
    product: p.goods_name,
    product_id: p.id,
    price: productNetPrice,
    gst: parseFloat(p.gst_rate?.replace("%", "") || 0),
    description: p.description || "",
    discount: supplierDiscount,
    batch: "",
    batch_id: "",
    hsn_code: p.hsn_code || "",
    unit_id: p.unit || null,    // ← ADD THIS
    unit_name: unitName          // ← ADD THIS
  }));

                    try {
                      const res = await fetch(`${baseurl}/products/${p.id}/batches`);
                      const batchData = await res.json();
                      setBatches(batchData);

                      const totalQty = batchData.reduce(
                        (sum, batch) => sum + Number(batch.quantity || 0),
                        0
                      );
                      setProductStock(prev => ({
                        ...prev,
                        [p.id]: totalQty
                      }));

                      if (p.maintain_batch === 0 && batchData.length > 0) {
                        const defaultBatch = batchData[0];
                        setSelectedBatch(defaultBatch.batch_number);
                        setSelectedBatchDetails(defaultBatch);
                        setItemForm(prev => ({
                          ...prev,
                          batch: defaultBatch.batch_number,
                          batch_id: defaultBatch.batch_number,
                         price: productNetPrice,  
                          discount: supplierDiscount
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
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
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
        
        // Get supplier discount again to preserve it
        const supplierAccount = accounts.find(acc => acc.id === selectedSupplierId);
        const supplierDiscount = parseFloat(supplierAccount?.discount) || 0;
 const selectedProduct = products.find(p => p.id === itemForm.product_id);
      const productNetPrice = selectedProduct ? parseFloat(selectedProduct.net_price) || 0 : 0;
        if (batch) {
          setItemForm(prev => ({
            ...prev,
            batch: batchNumber,
            batch_id: batch.batch_number,
              price: productNetPrice, 
            discount: supplierDiscount
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
{/* 
  <Form.Text className="text-muted small mt-1">
    Manual entry allowed • You can change the price
  </Form.Text> */}
</Col>

                <Col md={2}>
  <div className="d-flex justify-content-between align-items-center mb-1">
    <Form.Label className="fw-bold">Discount (%)</Form.Label>
    {invoiceData.retailerDiscount > 0 && (
      <small className="text-primary">Retailer: {invoiceData.retailerDiscount}%</small>
    )}
    {invoiceData.supplierDiscount > 0 && (
      <small className="text-primary">Supplier: {invoiceData.supplierDiscount}%</small>
    )}
  </div>
  <Form.Control
    name="discount"
    type="number"
    value={itemForm.discount}
    onChange={(e) => {
      const newDiscount = parseFloat(e.target.value) || 0;
      setItemForm(prev => ({
        ...prev,
        discount: newDiscount
      }));
    }}
    min="0"
    max="100"
    className="border-primary"
    placeholder={
      invoiceData.retailerDiscount > 0 
        ? `Default: ${invoiceData.retailerDiscount}%` 
        : invoiceData.supplierDiscount > 0
        ? `Default: ${invoiceData.supplierDiscount}%`
        : ""
    }
  />
</Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">GST (%)</Form.Label>
                    <Form.Control
                      name="gst"
                      type="number"
                      value={itemForm.gst}
                      readOnly
                      className="border-primary bg-light"
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

   <Col md={1} className="sales-invoice-add px-0">
  <div className="d-flex flex-column h-100 justify-content-end">
    {editingIndex !== null ? (
      <>
        <Button
          variant="success"
          onClick={updateItem}
          className="sales-invoice-add-btn mb-1"
          size="sm"
        >
          Update
        </Button>

        <Button
          variant="secondary"
          onClick={cancelEdit}
          className="sales-invoice-cancel-btn"
          size="sm"
        >
          <FaTimes />
        </Button>
      </>
    ) : (
      <Button
        variant="success"
        onClick={addItem}
        className="sales-invoice-add-btn"
        size="sm"
      >
        Add
      </Button>
    )}
  </div>
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
                        style={{width:'1150px', marginLeft:"10px"}}
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
                      <th>GST</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>CESS</th>
                      <th>TOTAL</th>
                      <th>BATCH</th>
                      <th>BATCH DETAILS</th>
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
                          <td className="text-end">₹{item.price}</td>
                          <td className="text-center">{item.discount}%</td>
                          <td className="text-center">{item.gst}%</td>
                          <td className="text-center">{item.cgst}%</td>
                          <td className="text-center">{item.sgst}%</td>
                          <td className="text-center">{item.igst}%</td>
                          <td className="text-center">{item.cess}</td>
                          <td className="text-end fw-bold">₹{item.total}</td>
                          <td>{item.batch}</td>
                          <td>
                            {item.batchDetails && (
                              <small>
                                MFG: {item.batchDetails.mfg_date || item.batchDetails.manufacturing_date}<br />
                                EXP: {item.batchDetails.exp_date || item.batchDetails.expiry_date}
                              </small>
                            )}
                          </td>
                   <td className="salesinvoice-edit">
                    <div className="d-flex flex-column gap-1 align-items-center">

  <Button 
variant="warning" 
    size="sm" 
    onClick={() => editItem(index)}
    className="me-1"
    disabled={editingIndex !== null} // Disable other edit buttons when one is being edited
  >
    <FaEdit />
  </Button>
  <Button variant="danger" size="sm" onClick={() => removeItem(index)}>
    <FaTrash />
  </Button>
  </div >
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
    
    {/* Discount Charges Section */}
<div className="mb-3">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <label className="fw-bold text-danger">Discount Charges (-)</label>
    <button type="button" className="btn btn-sm btn-danger" onClick={addDiscountChargeRow}>
      + Add Discount
    </button>
  </div>
  
  {discountCharges.map((charge, index) => (
    <div key={index} className="mb-2" style={{ display: 'flex', gap: '10px' }}>
      <div style={{ width: '60%' }}>
        <input
          type="number"
          value={charge.amount === 0 ? '' : charge.amount}
          className="form-control form-control-sm"
          onChange={(e) => handleDiscountChargeChange(index, 'amount', e.target.value)}
          placeholder="Amount or %"
        />
      </div>
      <div style={{ width: '35%' }}>
        <select
          value={charge.calculationType}
          className="form-select form-select-sm"
          onChange={(e) => handleDiscountChargeChange(index, 'calculationType', e.target.value)}
        >
          <option value="amount">Amount (₹)</option>
          <option value="percentage">Percentage (%)</option>
        </select>
      </div>
      <div style={{ width: '5%' }}>
        <button onClick={() => removeDiscountChargeRow(index)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  ))}
</div>
<Row>
  <Col md={7} className="d-flex flex-column align-items-start">
    <div className="mb-2 fw-bold">Taxable Amount:</div>
    <div className="mb-2 fw-bold">Total GST:</div>
    <div className="mb-2 fw-bold">Total Cess:</div>
    <div className="mb-2 fw-bold">Additional Charges:</div>
    <div className="mb-2 fw-bold text-danger">Discount Charges:</div>
    <div className="mb-2 fw-bold">Round Off:</div>
    <div className="mb-2 fw-bold text-success fs-5">Grand Total:</div>
  </Col>

  <Col md={5} className="d-flex flex-column align-items-end">
    <div className="mb-2">₹{invoiceData.taxableAmount}</div>
    <div className="mb-2">₹{invoiceData.totalGST}</div>
    <div className="mb-2">₹{invoiceData.totalCess}</div>
    <div className="mb-2">₹{invoiceData.additionalChargeAmount}</div>
    <div className="mb-2 text-danger">
      - ₹{discountCharges.reduce((sum, c) => {
        if (c.calculationType === "percentage") {
          const base = parseFloat(invoiceData.taxableAmount) + parseFloat(invoiceData.totalGST) + parseFloat(invoiceData.totalCess) + parseFloat(invoiceData.additionalChargeAmount);
          return sum + (base * (parseFloat(c.amount) / 100));
        }
        return sum + (parseFloat(c.amount) || 0);
      }, 0).toFixed(2)}
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
{/* Footer Section */}
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
  
  <Col md={6}>
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
                  {loading ? 'Submitting...' : 'Submit Purchase Invoice'}
                </Button>
                <Button
                  variant="info"
                  className="me-3 px-4"
                  onClick={handlePreview}
                  disabled={!isPreviewReady}
                >
                  {isPreviewReady ? 'View Invoice Preview' : 'Submit to Enable Preview'}
                </Button>
                <Button variant="danger" onClick={() => navigate("/purchase/purchase-invoice")}>
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

export default CreateProductInvoice;