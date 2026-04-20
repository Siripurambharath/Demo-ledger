import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { BsPlus } from 'react-icons/bs';
import AddCompanyModal from './AddCompanyModal';
import AddCategoryModal from '../PurchasedItems/AddCategoryModal';
import AddUnitModal from './AddUnitsModal';
import axios from 'axios';
import { baseurl } from './../../../../BaseURL/BaseURL';
import AdminSidebar from './../../../../Shared/AdminSidebar/AdminSidebar';
import Header from './../../../../Shared/AdminSidebar/AdminHeader';
import { useNavigate, useParams } from 'react-router-dom';
import './salesitems.css';
import Barcode from 'react-barcode';
import { FaUpload, FaTrash } from 'react-icons/fa';

const SalesItemsPage = ({ groupType = 'Salescatalog', user }) => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [maintainBatch, setMaintainBatch] = useState(false);
  const [batches, setBatches] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [unitOptions, setUnitOptions] = useState([]);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const calculateBatchTotals = (batchesArray) => {
    let totalSellingPrice = 0;
    let totalPurchasePrice = 0;
    let totalMRP = 0;
    let totalOpeningStock = 0;
     let totalWeight = 0; 
    
    if (batchesArray && batchesArray.length > 0) {
      batchesArray.forEach(batch => {
        totalSellingPrice += (parseFloat(batch.sellingPrice) || 0);
        totalPurchasePrice += (parseFloat(batch.purchasePrice) || 0);
        totalMRP += (parseFloat(batch.mrp) || 0);
        totalOpeningStock += (parseFloat(batch.opening_stock) || 0);
         totalWeight += (parseFloat(batch.weight) || 0); 
      });
    }
    
    return {
      totalSellingPrice: totalSellingPrice.toFixed(2),
      totalPurchasePrice: totalPurchasePrice.toFixed(2),
      totalMRP: totalMRP.toFixed(2),
      totalOpeningStock: totalOpeningStock,
       totalWeight: totalWeight.toFixed(2) 
    };
  };

const calculateTaxAndNetPrice = (price, gstRate, inclusiveGst) => {
  if (!price || !gstRate) {
    return { netPrice: price || '', taxAmount: 0 };
  }

  const numericPrice = parseFloat(price);
  const numericGstRate = parseFloat(gstRate) / 100;

  if (inclusiveGst === 'Inclusive') {
    const taxAmount = (numericPrice * numericGstRate) / (1 + numericGstRate);
    const netPrice = numericPrice - taxAmount;
    return {
      netPrice: netPrice.toFixed(2),
      taxAmount: taxAmount.toFixed(2)
    };
  } else {
    return {
      netPrice: numericPrice.toFixed(2), 
      taxAmount: 0 
    };
  }
};


  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${baseurl}/units`);
      setUnitOptions(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
      showAlert('Error fetching units', 'danger');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
    fetchUnits();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setIsDataLoaded(true);
        return;
      }

      console.log('🔄 Loading product data for editing...');
      setIsLoading(true);

      try {
        console.log('🔄 Fetching product by ID:', productId);
        await fetchProductById(productId);
        console.log('✅ Form data set successfully');
        setIsDataLoaded(true);
      } catch (error) {
        console.error('❌ Error loading product data:', error);
        showAlert('Error loading product data', 'danger');
        setIsDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productId, groupType]);
const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${baseurl}/products/${id}`);
    const product = response.data;
    console.log('📦 Fetched product:', {
      name: product.goods_name,
      price: product.price,
      mrp: product.mrp,
      purchase_price: product.purchase_price,
      opening_stock: product.opening_stock,
      unit_id: product.unit_id,
      opening_stock_date: product.opening_stock_date // Add this for debugging
    });

    // Helper function to format date properly
    const formatDateForInput = (dateString) => {
      if (!dateString) return new Date().toISOString().split('T')[0];
      
      try {
        // Try parsing the date
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.log('⚠️ Invalid date, using current date');
          return new Date().toISOString().split('T')[0];
        }
        
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.log('⚠️ Error formatting date, using current date');
        return new Date().toISOString().split('T')[0];
      }
    };

    // Set initial form data
    setFormData({
      group_by: product.group_by || groupType,
      goods_name: product.goods_name || product.name || '',
      category_id: product.category_id || '',
      company_id: product.company_id || '',
      price: product.price || '',
      mrp: product.mrp || '',
      inclusive_gst: product.inclusive_gst || '',
      purchase_price: product.purchase_price || '',
      gst_rate: product.gst_rate || '',
      non_taxable: product.non_taxable || '',
      net_price: product.net_price || '',
      hsn_code: product.hsn_code || '',
      unit: product.unit || product.unit_id || '',
      cess_rate: product.cess_rate || '',
      cess_amount: product.cess_amount || '',
      sku: product.sku || '',
      opening_stock: product.opening_stock || '',
      opening_stock_date: formatDateForInput(product.opening_stock_date), // Use helper function
      min_stock_alert: product.min_stock_alert || '',
      max_stock_alert: product.max_stock_alert || '',
      min_sale_price: product.min_sale_price || '',
      description: product.description || '',
      maintain_batch: product.maintain_batch || false,
      product_type: product.product_type || '',
        weight: product.weight || '', // Add this line
    });

    // Log the formatted date
    console.log('📅 Date conversion:', {
      fromDb: product.opening_stock_date,
      formatted: formatDateForInput(product.opening_stock_date)
    });

    // Load images
    if (product.images) {
      try {
        const parsedImages = typeof product.images === 'string'
          ? JSON.parse(product.images)
          : product.images;
        setImages(Array.isArray(parsedImages) ? parsedImages : []);
      } catch (e) {
        setImages([]);
      }
    } else {
      setImages([]);
    }

    setMaintainBatch(product.maintain_batch || false);
    
    // Fetch batches - this will update the form with batch totals
    await fetchBatches(id);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    showAlert('Error fetching product data', 'danger');
  }
};

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter for image files
    const imageFiles = files.filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      showAlert('Please select valid image files (JPEG, PNG, GIF, WebP)', 'warning');
      return;
    }

    // Check total images won't exceed limit
    if (images.length + imageFiles.length > 10) {
      showAlert('Maximum 10 images allowed per product', 'warning');
      return;
    }

    setUploadingImages(true);

    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const endpoint = productId
        ? `${baseurl}/products/${productId}/upload-images`
        : `${baseurl}/products/temp/upload-images`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setImages(response.data.images);
        showAlert('Images uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showAlert(error.response?.data?.message || 'Failed to upload images', 'danger');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imagePath) => {
    if (!productId) {
      // If creating new product, just remove from local state
      setImages(images.filter(img => img !== imagePath));
      return;
    }

    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await axios.delete(`${baseurl}/products/${productId}/image`, {
          data: { imagePath }
        });

        if (response.data.success) {
          setImages(response.data.images);
          showAlert('Image deleted successfully!', 'success');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        showAlert('Failed to delete image', 'danger');
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseurl}/categories`);
      setCategoryOptions(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Error fetching categories', 'danger');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${baseurl}/companies`);
      setCompanyOptions(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      showAlert('Error fetching companies', 'danger');
    }
  };

  const fetchBatches = async (id = productId) => {
    if (!id) {
      setBatches([]);
      return;
    }

    try {
      const response = await axios.get(`${baseurl}/products/${id}/batches`);
      const mappedBatches = response.data?.length
        ? response.data.map(batch => ({
          id: batch.id,
          dbId: batch.id,
          batchNumber: batch.batch_number || '',
          mfgDate: batch.mfg_date?.split('T')[0] || '',
          expDate: batch.exp_date?.split('T')[0] || '',
          quantity: batch.quantity || '',
          min_sale_price: batch.min_sale_price || '',
          opening_stock: batch.opening_stock || '',
          sellingPrice: batch.selling_price || '',
          purchasePrice: batch.purchase_price || '',
          mrp: batch.mrp || '',
            weight: batch.weight || '', 
          barcode: batch.barcode || '',
          stock_in: batch.stock_in || 0,
          stock_out: batch.stock_out || 0,
          isExisting: true
        }))
        : [];
      
      console.log('📦 Fetched batches:', mappedBatches.map(b => ({
        batchNumber: b.batchNumber,
        opening_stock: b.opening_stock,
        sellingPrice: b.sellingPrice,
        mrp: b.mrp,
          weight: b.weight ,
        purchasePrice: b.purchasePrice
      })));
      
      setBatches(mappedBatches);
      
      // Update form totals from all batches
      if (mappedBatches.length > 0 && productId) {
        const totals = calculateBatchTotals(mappedBatches);
        setFormData(prev => ({
          ...prev,
          opening_stock: totals.totalOpeningStock,
          price: totals.totalSellingPrice,
          purchase_price: totals.totalPurchasePrice,
          mrp: totals.totalMRP,
            weight: totals.totalWeight 
        }));
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const generateUniqueBarcode = async () => {
    let isUnique = false;
    let newBarcode;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      attempts++;

      // Generate 6-digit number as string
      newBarcode = Math.floor(100000 + Math.random() * 900000).toString();

      try {
        const response = await axios.get(`${baseurl}/batches/check-barcode/${newBarcode}`);
        if (response.data.available) {
          isUnique = true;
          console.log('✅ Generated unique 6-digit barcode:', newBarcode);
        } else {
          console.log('🔄 Barcode exists, generating new one...');
        }
      } catch (error) {
        console.error('Error checking barcode:', error);
        // fallback if API fails
        isUnique = true;
      }
    }

    // Fallback if still not unique after max attempts
    if (!isUnique) {
      newBarcode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('⚠️ Using fallback 6-digit barcode:', newBarcode);
    }

    return newBarcode;
  };

const createDefaultBatch = async () => {
  const newBarcode = await generateUniqueBarcode();

  return {
    id: `temp_${Date.now()}_${Math.random()}`,
    dbId: null,
    batchNumber: '',
    mfgDate: '',
    expDate: '',
    quantity: '0', 
    min_sale_price: '',
    opening_stock: '0', 
    sellingPrice: '', 
    purchasePrice: '',
    mrp: '',  
    weight: '', 
    barcode: newBarcode,
    stock_in: 0,
    stock_out: 0,
    isExisting: false
  };
};


  const validateBatchNumber = async (batchNumber, currentBatchId = null) => {
    if (!batchNumber) return true; // Skip validation if empty

    try {
      const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
        params: {
          batch_number: batchNumber,
          group_by: formData.group_by || 'Salescatalog',
          product_id: productId || '' // Exclude current product for updates
        }
      });

      if (response.data.exists) {
        if (currentBatchId) {
          const currentBatch = batches.find(b => b.id === currentBatchId);
          if (currentBatch && currentBatch.batchNumber === batchNumber) {
            return true;
          }
        }
        return false; 
      }
      return true; 
    } catch (error) {
      console.error('Error validating batch number:', error);
      return true; 
    }
  };
const handleBatchChange = async (index, e) => {
  const { name, value } = e.target;
  const updated = [...batches];
  
  updated[index][name] = value;

  if (name === 'opening_stock') {
    const openingStock = parseFloat(value) || 0;
    const stockIn = parseFloat(updated[index].stock_in) || 0;
    const stockOut = parseFloat(updated[index].stock_out) || 0;
    updated[index].quantity = (openingStock + stockIn - stockOut).toString();
    
    const totals = calculateBatchTotals(updated);
    setFormData(prev => ({
      ...prev,
      opening_stock: totals.totalOpeningStock
    }));
  }

  if (name === 'stock_in' || name === 'stock_out') {
    const openingStock = parseFloat(updated[index].opening_stock) || 0;
    const stockIn = parseFloat(updated[index].stock_in) || 0;
    const stockOut = parseFloat(updated[index].stock_out) || 0;
    updated[index].quantity = (openingStock + stockIn - stockOut).toString();
  }
  if (name === 'batchNumber' && value) {
    const isValid = await validateBatchNumber(value, updated[index].id);
    if (!isValid) {
      window.alert(`Batch number "${value}" already exists in ${formData.group_by || 'Salescatalog'}. Please select another batch number.`);
      updated[index][name] = batches[index][name];
      setBatches([...updated]); 
      return;
    }
  }

  setBatches(updated);

  if (name === 'sellingPrice' || name === 'purchasePrice' || name === 'mrp' || name === 'weight') {
    const totals = calculateBatchTotals(updated);
    setFormData(prev => ({
      ...prev,
      price: totals.totalSellingPrice,
      purchase_price: totals.totalPurchasePrice,
      mrp: totals.totalMRP,
      weight: totals.totalWeight 
    }));
  }
};

  const [formData, setFormData] = useState({
    group_by: groupType,
    goods_name: '',
    category_id: '',
    company_id: '',
    price: '',
    inclusive_gst: 'Inclusive',
    gst_rate: '',
    non_taxable: '',
    net_price: '',
    hsn_code: '',
    unit: 'UNT-UNITS',
    cess_rate: '',
    cess_amount: '',
    sku: '',
    opening_stock: '',
    opening_stock_date: new Date().toISOString().split('T')[0],
    min_stock_alert: '',
    max_stock_alert: '',
    min_sale_price: '',
    description: '',
    maintain_batch: false,
    purchase_price: '',
     product_type: '', 
      weight: '', // Add this line
  });

const handleChange = async (e) => {
  const { name, value, type, checked } = e.target;
  console.log(`🔄 Handling change: ${name} = ${type === 'checkbox' ? checked : value}`);

  const updatedFormData = {
    ...formData,
    [name]: type === 'checkbox' ? checked : value
  };

  if (name === 'price' || name === 'gst_rate' || name === 'inclusive_gst') {
    if (updatedFormData.inclusive_gst === 'Exclusive' && 
        updatedFormData.price && 
        updatedFormData.gst_rate) {
      const numericPrice = parseFloat(updatedFormData.price);
      const numericGstRate = parseFloat(updatedFormData.gst_rate) / 100;
      const taxAmount = (numericPrice * numericGstRate) / (1 + numericGstRate);
      const netPrice = numericPrice - taxAmount;
      updatedFormData.net_price = netPrice.toFixed(2);
    } else if (updatedFormData.inclusive_gst === 'Inclusive' && updatedFormData.price) {
      updatedFormData.net_price = parseFloat(updatedFormData.price).toFixed(2);
    } else {
      updatedFormData.net_price = updatedFormData.price || '';
    }
  }

  if (name === 'maintain_batch') {
    if (checked && batches.length === 0) {
      const defaultBatch = await createDefaultBatch();
      setBatches([defaultBatch]);
      
      const totals = calculateBatchTotals([defaultBatch]);
      setFormData(prev => ({
        ...prev,
        opening_stock: totals.totalOpeningStock,
        price: totals.totalSellingPrice,
        purchase_price: totals.totalPurchasePrice,
        mrp: totals.totalMRP,
        weight: totals.totalWeight, 
        maintain_batch: true
      }));
    } else if (!checked && batches.length > 0) {
      const totals = calculateBatchTotals(batches);
      updatedFormData.opening_stock = totals.totalOpeningStock;
      updatedFormData.price = totals.totalSellingPrice;
      updatedFormData.purchase_price = totals.totalPurchasePrice;
      updatedFormData.mrp = totals.totalMRP;
      updatedFormData.weight = totals.totalWeight; 
      setBatches([]);
    }
    setMaintainBatch(checked);
  }

  setFormData(updatedFormData);

  if (!maintainBatch && (name === 'price' || name === 'purchase_price' || name === 'mrp' || name === 'weight')) {
    const updatedBatches = batches.map(batch => ({
      ...batch,
      sellingPrice: updatedFormData.price || batch.sellingPrice,
      purchasePrice: updatedFormData.purchase_price || batch.purchasePrice,
      mrp: updatedFormData.mrp || batch.mrp,
      weight: updatedFormData.weight || batch.weight 
    }));
    setBatches(updatedBatches);
  }
};

 const addNewBatch = async () => {
  try {
    console.log('➕ Starting to add new batch...');
    console.log('📊 Current batches count:', batches.length);

    const newBarcode = await generateUniqueBarcode();

    const newBatch = {
      id: `temp_${Date.now()}_${Math.random()}`,
      dbId: null,
      batchNumber: '', 
      mfgDate: '',
      expDate: '',
      quantity: '0',
      min_sale_price: '',
      opening_stock: '0', 
      sellingPrice: '',
      purchasePrice: '',
      mrp: '', 
       weight: '', 
      barcode: newBarcode,
      stock_in: 0,
      stock_out: 0,
      isExisting: false
    };

    console.log('✅ New batch created with empty values:', {
      batchNumber: newBatch.batchNumber,
      opening_stock: newBatch.opening_stock,
      sellingPrice: newBatch.sellingPrice,
      purchasePrice: newBatch.purchasePrice,
      mrp: newBatch.mrp
    });

    const updatedBatches = [...batches, newBatch];
    setBatches(updatedBatches);

    const totals = calculateBatchTotals(updatedBatches);
    setFormData(prev => ({
      ...prev,
      opening_stock: totals.totalOpeningStock,
      price: totals.totalSellingPrice,
      purchase_price: totals.totalPurchasePrice,
      mrp: totals.totalMRP,
        weight: totals.totalWeight 
    }));

  } catch (error) {
    console.error('❌ Error adding new batch:', error);
    showAlert('Error adding new batch. Please try again.', 'danger');
  }
};


  const removeBatch = (id) => {
    if (batches.length <= 1 && maintainBatch) {
      showAlert('At least one batch is required when Maintain Batch is enabled.', 'warning');
      return;
    }

    const updated = batches.filter((b) => b.id !== id);
    setBatches(updated);

    // Recalculate totals after removing batch
    const totals = calculateBatchTotals(updated);
    setFormData(prev => ({
      ...prev,
      opening_stock: totals.totalOpeningStock,
      price: totals.totalSellingPrice,
      purchase_price: totals.totalPurchasePrice,
      mrp: totals.totalMRP,
        weight: totals.totalWeight
    }));
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  if (maintainBatch) {
    const invalidBatches = batches.filter(
      (batch) => !batch.batchNumber || !batch.opening_stock || !batch.sellingPrice || !batch.barcode
    );

    if (invalidBatches.length > 0) {
      showAlert(
        'Please fill all required fields in batch details (Batch Number, Opening Stock, Selling Price, and Barcode)',
        'danger'
      );
      setIsLoading(false);
      return;
    }

    // Check for duplicate batch numbers
    const batchNumbers = batches.map(b => b.batchNumber);
    const uniqueBatchNumbers = new Set(batchNumbers);
    if (batchNumbers.length !== uniqueBatchNumbers.size) {
      showAlert('Batch numbers must be unique within this product. Please check your batch numbers.', 'danger');
      setIsLoading(false);
      return;
    }

    // Validate batch numbers are unique across the system
    try {
      const batchCheckPromises = batches.map(async (batch) => {
        if (!batch.isExisting) {
          try {
            const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
              params: {
                batch_number: batch.batchNumber,
                group_by: formData.group_by || 'Salescatalog',
                product_id: productId || '' // Exclude current product for updates
              }
            });
            return response.data.exists;
          } catch (error) {
            console.error('Error checking batch number:', error);
            return false; // Don't block submission if check fails
          }
        }
        return false;
      });

      const batchCheckResults = await Promise.all(batchCheckPromises);
      const hasDuplicateBatches = batchCheckResults.some(exists => exists);

      if (hasDuplicateBatches) {
        showAlert('One or more batch numbers already exist in the same category. Please use unique batch numbers.', 'danger');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error during batch number validation:', error);
    }
  }

  try {
    // Calculate final totals from all batches
    const totals = calculateBatchTotals(batches);
    
    let finalOpeningStock = totals.totalOpeningStock;
    let finalPrice = parseFloat(totals.totalSellingPrice) || 0;
    let finalPurchasePrice = parseFloat(totals.totalPurchasePrice) || 0;
    let finalMRP = parseFloat(totals.totalMRP) || 0;
    let finalWeight = parseFloat(totals.totalWeight) || 0; // Get total weight

    // If not maintaining batches, use form values directly
    if (!maintainBatch) {
      finalOpeningStock = parseFloat(formData.opening_stock) || 0;
      finalPrice = parseFloat(formData.price) || 0;
      finalPurchasePrice = parseFloat(formData.purchase_price) || 0;
      finalMRP = parseFloat(formData.mrp) || 0;
      finalWeight = parseFloat(formData.weight) || 0; // Use form weight
    }

    console.log('📊 Final totals for submission:', {
      opening_stock: finalOpeningStock,
      price: finalPrice,
      purchase_price: finalPurchasePrice,
      mrp: finalMRP,
      weight: finalWeight, // Log weight
      maintain_batch: maintainBatch
    });

    // Prepare batches for backend
    const batchesForBackend = maintainBatch && batches.length > 0
      ? batches.map((batch) => {
          const batchData = {
            batch_number: batch.batchNumber,
            mfg_date: batch.mfgDate || null,
            exp_date: batch.expDate || null,
            quantity: parseFloat(batch.quantity) || 0,
            opening_stock: parseFloat(batch.opening_stock) || 0,
            stock_in: parseFloat(batch.stock_in) || 0,
            stock_out: parseFloat(batch.stock_out) || 0,
            min_sale_price: parseFloat(batch.min_sale_price) || 0,
            selling_price: parseFloat(batch.sellingPrice) || 0,
            purchase_price: parseFloat(batch.purchasePrice) || 0,
            mrp: parseFloat(batch.mrp) || 0,
            weight: batch.weight || null,
            barcode: batch.barcode,
            group_by: formData.group_by || 'Salescatalog',
            isExisting: batch.isExisting || false
          };

          if (batch.isExisting && batch.dbId && !batch.dbId.toString().includes('temp_')) {
            batchData.id = batch.dbId;
          }

          console.log(`📦 Batch data:`, {
            batch_number: batchData.batch_number,
            weight: batchData.weight,
            opening_stock: batchData.opening_stock,
            selling_price: batchData.selling_price,
            mrp: batchData.mrp,
            purchase_price: batchData.purchase_price
          });
          return batchData;
        })
      : [];

    // Prepare data for backend
    const dataToSend = {
      ...formData,
      images: images,
      group_by: groupType,
      price: finalPrice,
      purchase_price: finalPurchasePrice,
      mrp: finalMRP,
      opening_stock: finalOpeningStock,
      weight: finalWeight, // Use calculated weight
      batches: batchesForBackend
    };

    // Clean up any unwanted fields
    delete dataToSend.stock_in;
    delete dataToSend.stock_out;
    delete dataToSend.balance_stock;

    console.log('📤 Sending data to backend:', {
      price: dataToSend.price,
      purchase_price: dataToSend.purchase_price,
      mrp: dataToSend.mrp,
      opening_stock: dataToSend.opening_stock,
      weight: dataToSend.weight, // Log weight
      maintain_batch: dataToSend.maintain_batch,
      batch_count: batchesForBackend.length
    });

    // Determine endpoint and method
    const endpoint = productId
      ? `${baseurl}/products/${productId}`
      : `${baseurl}/products`;

    const method = productId ? 'put' : 'post';
    
    // Send request
    const response = await axios[method](endpoint, dataToSend, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Server response:', response.data);
    showAlert(productId ? 'Product updated successfully!' : 'New product added successfully!', 'success');

    // Redirect after success
    setTimeout(() => navigate('/sale_items'), 1500);
  } catch (error) {
    console.error('❌ Failed to add/update product:', error);
    console.error('❌ Error response:', error.response?.data);

    let errorMessage = error.response?.data?.message || error.message || 'Failed to add/update product';

    if (errorMessage.includes('batch number') && errorMessage.includes('already exists')) {
      errorMessage = 'Batch number already exists in this category. Please use a unique batch number.';
    }

    showAlert(errorMessage, 'danger');
  } finally {
    setIsLoading(false);
  }
};

  const pageTitle = productId
    ? `Edit Product in Sales Catalog`
    : `Add Product to Sales Catalog`;

  if (isLoading && !isDataLoaded) {
    return (
      <div className="dashboard-container">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
          <Header user={user} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
          <div className="content-wrapper">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading product data...</span>
              </Spinner>
              <span className="ms-3">Loading product data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate current totals for display
  const currentTotals = calculateBatchTotals(batches);

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Header user={user} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <div className="content-wrapper">
          {alert.show && (
            <Alert variant={alert.variant} className="m-3">
              {alert.message}
            </Alert>
          )}

          <div className="container-fluid mt-3 purchased-items-wrapper">
            <div className="container justify-content-center mt-4">
              <h3 className="mb-4 text-center">{pageTitle}</h3>

              <Form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>Product Name *</Form.Label>
                    <Form.Control
                      placeholder="Product Name"
                      name="goods_name"
                      value={formData.goods_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Category *</Form.Label>
                    <div className="d-flex">
                      <Form.Select
                        className="me-1"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowCategoryModal(true)}
                      >
                        <BsPlus />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>Company *</Form.Label>
                    <div className="d-flex">
                      <Form.Select
                        className="me-1"
                        name="company_id"
                        value={formData.company_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Company Name</option>
                        {companyOptions.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowCompanyModal(true)}
                      >
                        <BsPlus />
                      </Button>
                    </div>
                  </div>
                  <div className="col">
                    <Form.Label> Selling Price *</Form.Label>
                    <Form.Control
                      placeholder=" Selling Price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Price is sum of all batch selling prices
                      </Form.Text>
                    )}
                  </div>

                  <div className="col">
                    <Form.Label>Purchase Price *</Form.Label>
                    <Form.Control
                      placeholder="Purchase Price"
                      name="purchase_price"
                      type="number"
                      step="0.01"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      required
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Purchase price is sum of all batch purchase prices
                      </Form.Text>
                    )}
                  </div>
                  <div className="col">
                    <Form.Label>MRP</Form.Label>
                    <Form.Control
                      placeholder="Maximum Retail Price"
                      name="mrp"
                      type="number"
                      step="0.01"
                      value={formData.mrp || ''}
                      onChange={handleChange}
                      disabled={maintainBatch} 
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        MRP is sum of all batch MRP
                      </Form.Text>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                      <Form.Label>GST Type</Form.Label>
                      <Form.Select
                        name="inclusive_gst"
                        value={formData.inclusive_gst}
                        onChange={handleChange}
                      >
                        <option value="Inclusive">Inclusive of GST</option>
                        <option value="Exclusive">Exclusive of GST</option>
                      </Form.Select>
                                          </div>
                  <div className="col">
                    <Form.Label>GST Rate</Form.Label>
                    <Form.Select
                      name="gst_rate"
                      value={formData.gst_rate}
                      onChange={handleChange}
                    >
                      <option value="">Select GST Rate</option>
                      <option value="18">GST Rate 18%</option>
                      <option value="12">GST Rate 12%</option>
                      <option value="5">GST Rate 5%</option>
                      <option value="0">GST Rate 0%</option>
                    </Form.Select>
                  </div>
                  <div className="col">
                    <Form.Label>Non Taxable</Form.Label>
                    <Form.Control
                      placeholder="Non Taxable"
                      name="non_taxable"
                      type="text"
                      value={formData.non_taxable}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Net Price | GST</Form.Label>
                    <Form.Control
                      placeholder="Net Price | GST"
                      name="net_price"
                      type="number"
                      step="0.01"
                      value={formData.net_price}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>HSN Code</Form.Label>
                    <Form.Control
                      placeholder="HSN Code"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleChange}
                       required 
                    />
                  </div>
<div className="col">
  <Form.Label>Unit *</Form.Label>
  <div className="d-flex">
    <Form.Select
      className="me-1"
      name="unit"
      value={formData.unit}
      onChange={handleChange}
      required
    >
      <option value="">Select Unit</option>
      {unitOptions.map((unit) => (
        <option key={unit.id} value={unit.id}> 
          {unit.name} 
        </option>
      ))}
    </Form.Select>
    <Button
      variant="outline-primary"
      size="sm"
      onClick={() => setShowUnitModal(true)}
    >
      <BsPlus />
    </Button>
  </div>
</div>


<div className="col">
  <Form.Label>Weight (in kg)</Form.Label>
  <Form.Control
    placeholder="Weight"
    name="weight"
    type="number"
    step="0.01"
    value={formData.weight}
    onChange={handleChange}
    disabled={maintainBatch}
    className={maintainBatch ? "bg-light" : ""}
  />
  {maintainBatch && (
    <Form.Text className="text-muted">
      Weight is sum of all batch weights
    </Form.Text>
  )}
</div>
                  <div className="col">
                    <Form.Label>CESS Rate %</Form.Label>
                    <Form.Control
                      placeholder="CESS Rate%"
                      name="cess_rate"
                      type="number"
                      step="0.01"
                      value={formData.cess_rate}
                      onChange={handleChange}
                    />
                  </div>
                
                </div>

                <div className="row mb-3">
                    <div className="col">
                    <Form.Label>CESS Amount</Form.Label>
                    <Form.Control
                      placeholder="CESS Amount"
                      name="cess_amount"
                      type="number"
                      step="0.01"
                      value={formData.cess_amount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <Form.Label>SKU</Form.Label>
                    <Form.Control
                      placeholder="SKU"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col">
                    <Form.Label>Opening Stock *</Form.Label>
                    <Form.Control
                      placeholder="Opening Stock"
                      name="opening_stock"
                      type="number"
                      value={formData.opening_stock}
                      onChange={handleChange}
                      required
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Sum of all batch opening stocks
                      </Form.Text>
                    )}
                  </div>

                 
                  <div className="col">
                    <Form.Label>Opening Stock Date</Form.Label>
                    <Form.Control
                      type="date"
                      placeholder="Opening Stock Date"
                      name="opening_stock_date"
                      value={formData.opening_stock_date}
                      onChange={handleChange}
                    />
                  </div>
                   
                </div>
<div className="row mb-3">
      <div className="col">
                    <Form.Label>Min Stock Alert</Form.Label>
                    <Form.Control
                      placeholder="Min Stock Alert"
                      name="min_stock_alert"
                      type="number"
                      value={formData.min_stock_alert}
                      onChange={handleChange}
                    />
                  </div>
  <div className="col">
    <Form.Label>Max Stock Alert</Form.Label>
    <Form.Control
      placeholder="Max Stock Alert"
      name="max_stock_alert"
      type="number"
      value={formData.max_stock_alert}
      onChange={handleChange}
    />
  </div>
  <div className="col">
    <Form.Label>Minimum Sale Price</Form.Label>
    <Form.Control
      placeholder="Minimum Sale Price"
      name="min_sale_price"
      type="number"
      step="0.01"
      value={formData.min_sale_price}
      onChange={handleChange}
    />
  </div>
   <div className="col d-flex align-items-center">
    <Form.Check
      type="checkbox"
      label="Maintain Batch"
      name="maintain_batch"
      checked={formData.maintain_batch}
      onChange={handleChange}
      className="mt-4"
    />
  </div>
 
</div>

<div className="row mb-3">
<div className="col-md-3">
    <Form.Label>Product Type *</Form.Label>
    <Form.Select
      name="product_type"
      value={formData.product_type}
      onChange={handleChange}
      required
      disabled={productId ? true : false} // Add this line
    >
      <option value="">Select Product Type</option>
      <option value="KACHA">KACHA</option>
      <option value="PAKKA">PAKKA</option>
    </Form.Select>
   
  </div>




 
  </div>

                <Form.Group className="mt-3 mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Image Upload Section */}
                <div className="border border-dark p-3 mb-3">
                  <h5>Product Images</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Images (Max 10, 5MB each)</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploadingImages || images.length >= 10}
                      />
                      <Button
                        variant="outline-secondary"
                        className="ms-2"
                        onClick={() => document.querySelector('input[type="file"]').click()}
                        disabled={uploadingImages || images.length >= 10}
                      >
                        <FaUpload /> Browse
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Supported formats: JPEG, PNG, GIF, WebP
                    </Form.Text>
                    {uploadingImages && (
                      <div className="mt-2">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Uploading images...
                      </div>
                    )}
                  </Form.Group>

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="row">
                      {images.map((image, index) => (
                        <div key={index} className="col-md-3 col-sm-4 col-6 mb-3">
                          <div className="card h-100">
                            <div className="card-img-top position-relative" style={{ height: '150px', overflow: 'hidden' }}>
                              <img
                                src={image.startsWith('/') ? `${baseurl}${image}` : image}
                                alt={`Product ${index + 1}`}
                                className="img-fluid h-100 w-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150x150?text=Image+Error';
                                }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1"
                                onClick={() => handleDeleteImage(image)}
                                title="Delete image"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                            <div className="card-body p-2 text-center">
                              <small className="text-muted">Image {index + 1}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length === 0 && !uploadingImages && (
                    <div className="text-center py-4 border rounded">
                      <FaUpload size={48} className="text-muted mb-3" />
                      <p className="text-muted">No images uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Batch Details Section */}
                {maintainBatch && (
                  <div className="border border-dark p-3 mb-3">
                    <h5>Batch Details (Total: {batches.length} batches)</h5>
                    {batches.map((batch, index) => (
                      <div key={batch.id} className="mb-3 border p-2">
                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>Batch No.*</Form.Label>
                            <Form.Control
                              placeholder="Enter Batch Number"
                              name="batchNumber"
                              value={batch.batchNumber}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                            <Form.Text className="text-muted">
                              Enter unique batch number
                            </Form.Text>
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Opening Stock*</Form.Label>
                            <Form.Control
                              type="number"
                              name="opening_stock"
                              value={batch.opening_stock}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                           
                          </div>
                                <div className="col-md-4">
                            <Form.Label>Mfg. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="mfgDate"
                              value={batch.mfgDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                    
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>Exp. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="expDate"
                              value={batch.expDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>

                           <div className="col-md-4">
            <Form.Label>Weight (in kg)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="weight"
              value={batch.weight || ''}
              onChange={(e) => handleBatchChange(index, e)}
              placeholder="Enter weight"
            />
          </div>
                      <div className="col-md-4">
  <Form.Label>Sale Price*</Form.Label>
  <Form.Control
    type="number"
    step="0.01"
    name="sellingPrice"
    value={batch.sellingPrice}
    onChange={(e) => handleBatchChange(index, e)}
    required
    placeholder="Enter sale price"
  />
</div>

                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
  <Form.Label>Purchase Price</Form.Label>
  <Form.Control
    type="number"
    step="0.01"
    name="purchasePrice"
    value={batch.purchasePrice}
    onChange={(e) => handleBatchChange(index, e)}
    placeholder="Enter purchase price"
  />
</div>
                      <div className="col-md-4">
  <Form.Label>M.R.P</Form.Label>
  <Form.Control
    type="number"
    step="0.01"
    name="mrp"
    value={batch.mrp}
    onChange={(e) => handleBatchChange(index, e)}
    placeholder="Enter MRP"
  />
</div>
                          <div className="col-md-4">
                            <Form.Label>Min Sale Price</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="min_sale_price"
                              value={batch.min_sale_price}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Barcode *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Barcode"
                              value={batch.barcode}
                              readOnly
                              required
                            />
                            {batch.barcode && (
                              <div className="mt-1 text-center">
                                <Barcode value={batch.barcode} format="CODE128" height={25} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col text-end">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeBatch(batch.id)}
                              disabled={batches.length <= 1}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="primary" onClick={addNewBatch} className="mb-2">
                      Add Batch
                    </Button>
                    <div className="mt-2 text-muted">
                      <small>* Main form prices are calculated as sum of all batch prices</small>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/sale_items')}
                    className="me-2"
                    disabled={isLoading}
                  >
                    Close
                  </Button>
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        {productId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      productId ? 'Update Product' : 'Add Product'
                    )}
                  </Button>
                </div>
              </Form>

              <AddCompanyModal
                show={showCompanyModal}
                onClose={() => setShowCompanyModal(false)}
                onSave={(newCompany) => {
                  fetchCompanies();
                  setFormData((prev) => ({
                    ...prev,
                    company_id: newCompany.id
                  }));
                  setShowCompanyModal(false);
                }}
              />
              <AddCategoryModal
                show={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSave={(newCategory) => {
                  fetchCategories();
                  setFormData((prev) => ({
                    ...prev,
                    category_id: newCategory.id
                  }));
                  setShowCategoryModal(false);
                }}
              />

              <AddUnitModal
  show={showUnitModal}
  onClose={() => setShowUnitModal(false)}
  onSave={(newUnit) => {
    fetchUnits();
    setFormData(prev => ({ ...prev, unit: newUnit.id })); // Store ID instead of name
    setShowUnitModal(false);
  }}
/>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesItemsPage;