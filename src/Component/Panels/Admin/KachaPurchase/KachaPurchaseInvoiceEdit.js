import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './PurchaseInvoiceEdit.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaSave, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate, useParams } from "react-router-dom";

const KachaPurchaseInvoiceEdit = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
    const [discountCharges, setDiscountCharges] = useState([]);
  
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [productSearchTerm, setProductSearchTerm] = useState("");
const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const { id } = useParams();
  const [productStock, setProductStock] = useState({});
const [charges, setCharges] = useState([]);
  const [invoiceData, setInvoiceData] = useState(() => {
    const savedData = localStorage.getItem('draftInvoice');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    return {
      invoiceNumber: "INV001",
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
        discount: 0,
         gstin: "" ,
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
      grandTotal: 0,
       roundOff: "0.00",  
      transportDetails: {
  transport: "",
  grNumber: "",
  vehicleNo: "",
  station: ""
},      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      batchDetails: []
    };
  });

  const [itemForm, setItemForm] = useState({
    product: "",
    product_id: "",
    description: "",
    quantity: 1,
      hsn_code: "", 
    price: 0,
    discount: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null,
     unit_id: "",     
  unit_name: ""     
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
const fetchInvoiceDataForEdit = async (voucherId) => {
  try {
    setLoading(true);
    console.log('Fetching invoice data for editing:', voucherId);
    
    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice data');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const apiData = result.data;
      const transformedData = transformApiDataToFormFormat(apiData);
      
      setInvoiceData(transformedData);
      setSelectedSupplierId(apiData.PartyID);
      setSelected(true);
      
      // ✅ LOAD CHARGES FROM API
      if (apiData.additional_charges_type && apiData.additional_charges_amount) {
        setCharges([{
          type: apiData.additional_charges_type,
          amount: parseFloat(apiData.additional_charges_amount) || 0
        }]);
      } else {
        setCharges([]);
      }
      
if (apiData.discount_charges_amount && parseFloat(apiData.discount_charges_amount) > 0) {
  setDiscountCharges([{
    calculationType: apiData.discount_charges || "amount",
    amount: parseFloat(apiData.discount_charges_amount) || 0
  }]);
} else {
  setDiscountCharges([]);
}
      const supplierAccount = accounts.find(acc => acc.id === apiData.PartyID);
      if (supplierAccount) {
        setInputName(supplierAccount.business_name);
      }
      
      window.alert('✅ Invoice loaded for editing successfully!');
    } else {
      throw new Error('No valid data received');
    }
  } catch (err) {
    console.error('Error fetching invoice for edit:', err);
    setError('Failed to load invoice for editing: ' + err.message);
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
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const total = subtotal - discountAmount;

      return {
        product: batch.product || 'Product',
        product_id: batch.product_id || '',
        description: batch.description || '',
         hsn_code: batch.hsn_code || '',  
        quantity: quantity,
        price: price,
        discount: discount,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        batchDetails: batch.batchDetails || null,
         unit_id: batch.unit_id || "",     
    unit_name: batch.unit_name || ""   
      };
    }) || [];

      const mobileNumber = apiData.mobile_number || 
                       apiData.retailer_mobile || 
                       apiData.phone_number || 
                       apiData.supplier_mobile || 
                       '';


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
        businessName: apiData.AccountName || 'Business',
        state: apiData.billing_state || apiData.BillingState || '',
        discount: parseFloat(apiData.supplierDiscount) || 0,
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
      
      items: items,
      note: apiData.Notes || "Thank you for your business!",
      taxableAmount: parseFloat(apiData.BasicAmount) || 0,
      grandTotal: parseFloat(apiData.TotalAmount) || 0,
                transportDetails: transportDetails,

      additionalCharge: "",
      additionalChargeAmount: "0.00"
    };
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
  const fetchNextInvoiceNumber = async () => {
    try {
      console.log('Fetching next invoice number...');
      const response = await fetch(`${baseurl}/next-invoice-number`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received next invoice number:', data.nextInvoiceNumber);
        setNextInvoiceNumber(data.nextInvoiceNumber);
        
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: data.nextInvoiceNumber
        }));
        
        setHasFetchedInvoiceNumber(true);
        
        const currentDraft = localStorage.getItem('draftInvoice');
        if (currentDraft) {
          const draftData = JSON.parse(currentDraft);
          draftData.invoiceNumber = data.nextInvoiceNumber;
          localStorage.setItem('draftInvoice', JSON.stringify(draftData));
        }
      } else {
        console.error('Failed to fetch next invoice number');
        generateFallbackInvoiceNumber();
      }
    } catch (err) {
      console.error('Error fetching next invoice number:', err);
      generateFallbackInvoiceNumber();
    }
  };

  const generateFallbackInvoiceNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/last-invoice`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastInvoiceNumber) {
          const lastNumber = data.lastInvoiceNumber;
          const numberMatch = lastNumber.match(/INV(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1]) + 1;
            const fallbackInvoiceNumber = `INV${nextNum.toString().padStart(3, '0')}`;
            setNextInvoiceNumber(fallbackInvoiceNumber);
            setInvoiceData(prev => ({
              ...prev,
              invoiceNumber: fallbackInvoiceNumber
            }));
            setHasFetchedInvoiceNumber(true);
            return;
          }
        }
      }
      
      const currentDraft = localStorage.getItem('draftInvoice');
      if (currentDraft) {
        const draftData = JSON.parse(currentDraft);
        if (draftData.invoiceNumber && draftData.invoiceNumber !== 'INV001') {
          setNextInvoiceNumber(draftData.invoiceNumber);
          setHasFetchedInvoiceNumber(true);
          return;
        }
      }
      
      setNextInvoiceNumber('INV001');
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: 'INV001'
      }));
      setHasFetchedInvoiceNumber(true);
      
    } catch (err) {
      console.error('Error in fallback invoice number generation:', err);
      setNextInvoiceNumber('INV001');
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: 'INV001'
      }));
      setHasFetchedInvoiceNumber(true);
    }
  };

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
      batchDetails: selectedBatchDetails
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

  // Check quantity if batch is selected
  if (selectedBatchDetails) {
    const availableQuantity = parseFloat(selectedBatchDetails.quantity) || 0;
    const quantity = parseFloat(itemForm.quantity) || 0;
    
    if (availableQuantity <= 0) {
      window.alert(`⚠️ Cannot add item - Selected batch "${selectedBatch}" has zero stock available.`);
      return;
    }
    
    if (quantity > availableQuantity) {
      window.alert(
        `⚠️ Insufficient stock - Only ${availableQuantity} units available in this batch.`
      );
      return;
    }
  }

  const calculatedItem = {
    ...calculateItemTotal(),
    batch: selectedBatch,
    batch_id: itemForm.batch_id,
    product_id: itemForm.product_id,
    batchDetails: selectedBatchDetails,
    discount: itemForm.discount ,
     unit_id: itemForm.unit_id,    
    unit_name: itemForm.unit_name   
  };

  if (editingItemIndex !== null) {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, index) => 
        index === editingItemIndex ? calculatedItem : item
      )
    }));
    setEditingItemIndex(null);
    window.alert("✅ Item updated successfully!");
  } else {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, calculatedItem]
    }));
    window.alert("✅ Item added successfully!");
  }

  // Reset form but keep supplier discount
  setItemForm({
    product: "",
    product_id: "",
    description: "",
     hsn_code: "",
    quantity: 1,
    price: 0,
    discount: parseFloat(invoiceData.supplierInfo?.discount) || 0, // Keep supplier discount
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

  const editItem = (index) => {
  const itemToEdit = invoiceData.items[index];
    const selectedProduct = products.find(p => p.id === itemToEdit.product_id);
  const productNetPrice = selectedProduct ? parseFloat(selectedProduct.net_price) || 0 : itemToEdit.price;

  setItemForm({
    product: itemToEdit.product,
    product_id: itemToEdit.product_id,
    description: itemToEdit.description,
     hsn_code: itemToEdit.hsn_code || '', 
    quantity: itemToEdit.quantity,
     price: productNetPrice,  
    discount: itemToEdit.discount,
    total: itemToEdit.total,
    batch: itemToEdit.batch,
    batch_id: itemToEdit.batch_id,
    batchDetails: itemToEdit.batchDetails,
     unit_id: itemToEdit.unit_id || "",     
    unit_name: itemToEdit.unit_name || ""  
  });
  
  setSelectedBatch(itemToEdit.batch);
  setSelectedBatchDetails(itemToEdit.batchDetails);
  setEditingItemIndex(index);
  
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
         // Calculate total quantity from all batches
    const totalQty = batchData.reduce(
      (sum, batch) => sum + Number(batch.quantity || 0),
      0
    );
    
    // Store in productStock state
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
     hsn_code: "",
    quantity: 1,
    price: 0,
    discount: parseFloat(invoiceData.supplierInfo?.discount) || 0, // Reset to supplier discount
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
    return sum + (charge.amount === '' ? 0 : parseFloat(charge.amount) || 0);
  }, 0);

  let discountChargesTotal = 0;
  discountCharges.forEach(charge => {
    const amount = parseFloat(charge.amount) || 0;
    if (charge.calculationType === "percentage") {
      discountChargesTotal += (taxableAmount + additionalChargeAmount) * (amount / 100);
    } else {
      discountChargesTotal += amount;
    }
  });

  const actualTotal = taxableAmount + additionalChargeAmount - discountChargesTotal;
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
}, [invoiceData.items, charges, discountCharges]);

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
      invoiceNumber: nextInvoiceNumber,
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
},  
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
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
      return;
    }

    if (invoiceData.items.length === 0) {
      window.alert("⚠️ Please add at least one item to the invoice");
      setLoading(false);
      return;
    }

    try {
      const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
      console.log('Submitting invoice with number:', finalInvoiceNumber);

         const mobileNumber = invoiceData.supplierInfo.mobile_number || 
                         invoiceData.supplierInfo.phone_number || 
                         '';
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

      const batchDetails = invoiceData.items.map(item => ({
        product: item.product,
        product_id: item.product_id,
        description: item.description,
        batch: item.batch,
        hsn_code: item.hsn_code || '',
        batch_id: item.batch_id,
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        total: parseFloat(item.total) || 0,
        batchDetails: item.batchDetails,
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
      
      console.log('📦 Product and Batch IDs Summary:');
      console.log('First item product_id:', firstItemProductId);
      console.log('First item batch_id:', firstItemBatchId);
      console.log('All items product_ids:', invoiceData.items.map(item => item.product_id));
      console.log('All items batch_ids:', invoiceData.items.map(item => item.batch_id));

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
        invoiceType: "KACHA",
        isGstInvoice: false,
        batchDetails: batchDetails,
        product_id: 123,
        batch_id: "bth0001",
        primaryProductId: firstItemProductId,
        primaryBatchId: firstItemBatchId,
        supplierDiscount: invoiceData.supplierInfo.discount || 0,
           mobile_number: mobileNumber,
             additional_charges_type: charges.map(c => c.type).join(','),
  additional_charges_amount: charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
  discount_charges: firstDiscount.calculationType || "",
discount_charges_amount: discountCharges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),

      };

      delete payload.companyState;
      delete payload.supplierState;
      delete payload.items;

   
      
      if (!payload.product_id || !payload.batch_id) {
        console.error('❌ CRITICAL: product_id or batch_id is still undefined in payload!');
        console.error('Payload structure:', JSON.stringify(payload, null, 2));
      } else {
        console.log('✅ SUCCESS: product_id and batch_id are properly set in payload!');
      }

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
        console.log('🆕 Creating new invoice');
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
      console.log('Response voucherId:', responseData.voucherId);
      console.log('Response product_id:', responseData.product_id);
      console.log('Response batch_id:', responseData.batch_id);
      
      localStorage.removeItem('draftInvoice');
      window.alert(isEditMode ? '✅ Invoice updated successfully!' : '✅ Invoice submitted successfully!');
      setIsPreviewReady(true);

      const previewData = {
        ...invoiceData,
        invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
        voucherId: responseData.voucherId || editingVoucherId,
        product_id: responseData.product_id || firstItemProductId,
        batch_id: responseData.batch_id || firstItemBatchId
      };
      localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
      setTimeout(() => {
        navigate(`/kachapurchasepdf/${responseData.voucherId || editingVoucherId}`);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setError(err.message);
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
            
            {/* Invoice Type Indicator */}
            <Alert variant="info" className="mb-3">
              <strong>Invoice Type: </strong>KACHA (Non-GST Invoice)
            </Alert>
            
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
                    displayName.includes(searchLower) ||
                     mobileNumber.includes(searchLower));
                })
                .map(acc => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setInputName(acc.business_name);
                      setSelectedSupplierId(acc.id);
                      setSelected(true);
                      
                      const supplierDiscount = parseFloat(acc.discount) || 0;
                      
                      setInvoiceData(prev => ({
                        ...prev,
                        supplierInfo: {
                          name: acc.gstin ? acc.display_name || acc.business_name : acc.name || acc.business_name,
                          businessName: acc.business_name,
                          state: acc.billing_state,
                          discount: supplierDiscount,
                          gstin: acc.gstin || "",
                          accountId: acc.id,
                          account_name: acc.account_name,
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
                        discount: supplierDiscount
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
        <div><strong>Name:</strong> {invoiceData.supplierInfo.name}</div>
        <div><strong>Business:</strong> {invoiceData.supplierInfo.businessName}</div>
         {(invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number) && (
          <div><strong>Mobile:</strong> {invoiceData.supplierInfo.mobile_number || invoiceData.supplierInfo.phone_number}</div>
        )}
        <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin || "Not Available"}</div>
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

              {/* Item Section */}
              <div className="item-section mb-3 mt-3 bg-white p-3 rounded">
                <h6 className="text-primary mb-3">
                  {editingItemIndex !== null ? `Edit Item (${editingItemIndex + 1})` : 'Add Items'}
                </h6>
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
            discount: parseFloat(invoiceData.supplierInfo?.discount) || 0,
            batch: "",
            batch_id: ""
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
            discount: parseFloat(invoiceData.supplierInfo?.discount) || 0,
            batch: "",
            batch_id: ""
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
              const groupMatch = p.group_by === "Purchaseditems";
              const typeMatch = p.product_type === "KACHA";
              const searchMatch = p.goods_name.toLowerCase().includes(productSearchTerm.toLowerCase());
              return groupMatch && typeMatch && searchMatch;
            })
            .map((p) => {
              const availableQty = productStock[p.id] || 0;
              const supplierDiscount = parseFloat(invoiceData.supplierInfo?.discount) || 0;
              
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
    price: p.net_price || 0,
    description: p.description || "",
    hsn_code: p.hsn_code || '',
    discount: supplierDiscount,
    batch: "",
    batch_id: "",
    unit_id: p.unit || null,    // ← ADD THIS
    unit_name: unitName          // ← ADD THIS
  }));

  try {
    const res = await fetch(`${baseurl}/products/${p.id}/batches`);
    const batchData = await res.json();
    setBatches(batchData);
    setSelectedBatch("");
    setSelectedBatchDetails(null);

    const totalQty = batchData.reduce(
      (sum, batch) => sum + Number(batch.quantity || 0),
      0
    );
    setProductStock(prev => ({
      ...prev,
      [p.id]: totalQty
    }));
  } catch (err) {
    console.error("Failed to fetch batches:", err);
    setBatches([]);
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
  {batches.length > 0 && (
    <Form.Select
      className="mt-2 border-primary"
      name="batch"
      value={selectedBatch}
      onChange={(e) => {
        const batchNumber = e.target.value;
        setSelectedBatch(batchNumber);
        const batch = batches.find(b => b.batch_number === batchNumber);
        setSelectedBatchDetails(batch || null);

        if (batch) {
          setItemForm(prev => ({
            ...prev,
            batch: batchNumber,
            batch_id: batch.batch_number,
            price: batch.selling_price
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
    step="1"  // Changed from 0.01 to 1
    min="0"
    value={itemForm.price || ""}
    onChange={handleItemChange}
    placeholder="Enter price manually"
    className="border-primary shadow-sm"
    style={{ 
      height: "42px"
    }}
  />
</Col>

          <Col md={2}>
  <div className="d-flex justify-content-between align-items-center mb-1">
    <Form.Label className="fw-bold">Discount (%)</Form.Label>
    {invoiceData.supplierInfo?.discount > 0 && (
      <small className="text-primary">Supplier: {invoiceData.supplierInfo.discount}%</small>
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
      invoiceData.supplierInfo?.discount > 0 
        ? `Default: ${invoiceData.supplierInfo.discount}%` 
        : "Enter discount"
    }
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
</td>
                          <td className="text-end">₹{item.price}</td>
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
 
   {/* Additional Charges */}
   <div className="mb-3">
     <div className="d-flex justify-content-between align-items-center mb-2">
       <label className="fw-bold">Additional Charges</label>
       <button type="button" className="btn btn-sm btn-primary" onClick={addChargeRow}>
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
         <div style={{ width: '1%' }}>
           <button type="button" onClick={() => removeChargeRow(index)}
             style={{ padding: '0', fontSize: '18px', lineHeight: '2', background: 'none', border: 'none', color: 'black', cursor: 'pointer' }}>
             ✕
           </button>
         </div>
       </div>
     ))}
     {charges.length === 0 && <div className="text-muted small mb-2">No additional charges added</div>}
   </div>
 
   {/* Discount Charges */}
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
           <button onClick={() => removeDiscountChargeRow(index)}
             style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>✕</button>
         </div>
       </div>
     ))}
   </div>
 
  {/* Totals */}
<Row>
  <Col md={6} className="d-flex flex-column align-items-start">
    <div className="mb-2 fw-bold">Taxable Amount</div>
    <div className="mb-2 fw-bold">Additional Charges</div>
    <div className="mb-2 fw-bold text-danger">Discount Charges</div>
    <div className="mb-2 fw-bold text-success">Grand Total</div>
  </Col>
  <Col md={6} className="d-flex flex-column align-items-end">
    <div className="mb-2">₹{invoiceData.taxableAmount}</div>
    <div className="mb-2">₹{charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0).toFixed(2)}</div>
    <div className="mb-2 text-danger">
      - ₹{discountCharges.reduce((sum, c) => {
        if (c.calculationType === "percentage") {
          const base = parseFloat(invoiceData.taxableAmount) + parseFloat(invoiceData.additionalChargeAmount || 0);
          return sum + (base * (parseFloat(c.amount) / 100));
        }
        return sum + (parseFloat(c.amount) || 0);
      }, 0).toFixed(2)}
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
                <Button variant="danger" onClick={() => navigate("/kachapurchasepdf")}>
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

export default KachaPurchaseInvoiceEdit;