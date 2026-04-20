import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { BsPlus } from 'react-icons/bs';
import AddCompanyModal from './AddCompanyModal';
import AddCategoryModal from '../PurchasedItems/AddCategoryModal';
import AddUnitModal from '../Sales_catalogue/AddUnitsModal';
import axios from 'axios';
import { baseurl } from './../../../../BaseURL/BaseURL';
import AdminSidebar from './../../../../Shared/AdminSidebar/AdminSidebar';
import Header from './../../../../Shared/AdminSidebar/AdminHeader';
import { useNavigate, useParams } from 'react-router-dom';
import './purchaseitem.css';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Barcode from 'react-barcode';

const AddProductPage = ({ groupType = 'Purchaseditems', user }) => {
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

  const calculateTaxAndNetPrice = (price, gstRate, inclusiveGst) => {
    if (!price || !gstRate) return { netPrice: price || '', taxAmount: 0 };

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
      const taxAmount = numericPrice * numericGstRate;
      const netPrice = numericPrice + taxAmount;
      return {
        netPrice: netPrice.toFixed(2),
        taxAmount: taxAmount.toFixed(2)
      };
    }
  };

  // Calculate total stock from batches
  const calculateTotalStockFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    return batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);
  };

  // Calculate total MRP from batches
 
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
      console.log('📦 Fetched product:', product);

      // Handle images
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

      await fetchBatches(id);

      setTimeout(() => {
        let finalPurchasePrice = product.purchase_price || 0;
        let finalPrice = product.price || 0; 
        let finalMRP = product.mrp || 0;

        if (product.maintain_batch && batches.length > 0) {
          const totalPurchasePrice = batches.reduce((sum, batch) => {
            return sum + (parseFloat(batch.purchasePrice) || 0);
          }, 0);

          const totalPrice = batches.reduce((sum, batch) => {
            return sum + (parseFloat(batch.sellingPrice) || 0);
          }, 0);

          const totalMRP = batches.reduce((sum, batch) => {
            return sum + (parseFloat(batch.mrp) || 0);
          }, 0);

          finalPurchasePrice = totalPurchasePrice > 0 ? totalPurchasePrice : product.purchase_price || 0;
          finalPrice = totalPrice > 0 ? totalPrice : product.price || 0;
          finalMRP = totalMRP > 0 ? totalMRP : product.mrp || 0;
        }

        console.log('💰 Calculated prices:', {
          purchase: finalPurchasePrice,
          price: finalPrice,
          mrp: finalMRP,
          hasBatches: batches.length,
          maintainBatch: product.maintain_batch
        });

        setFormData({
          group_by: product.group_by || groupType,
          goods_name: product.goods_name || product.name || '',
          category_id: product.category_id || '',
          company_id: product.company_id || '',
          purchase_price: finalPurchasePrice,
          price: finalPrice, 
          mrp: finalMRP,
          inclusive_gst: product.inclusive_gst || '',
          gst_rate: product.gst_rate || '',
          non_taxable: product.non_taxable || '',
          net_price: product.net_price || '',
          hsn_code: product.hsn_code || '',
          unit: product.unit,
          cess_rate: product.cess_rate || '',
          cess_amount: product.cess_amount || '',
          sku: product.sku || '',
          opening_stock: product.opening_stock || '',
          opening_stock_date: product.opening_stock_date ? product.opening_stock_date.split('T')[0] : new Date().toISOString().split('T')[0],
          min_stock_alert: product.min_stock_alert || '',
          max_stock_alert: product.max_stock_alert || '',
          description: product.description || '',
          maintain_batch: product.maintain_batch || false,
          can_be_sold: product.can_be_sold || false,
            product_type: product.product_type || '', 
        });

        setMaintainBatch(product.maintain_batch || false);
      }, 100);
    } catch (error) {
      console.error('Error fetching product:', error);
      showAlert('Error fetching product data', 'danger');
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
          min_sale_price: batch.cost_price || '',
          opening_stock: batch.opening_stock || '',
          sellingPrice: batch.selling_price || '',
          min_sale_price: batch.min_sale_price || '',
          purchasePrice: batch.purchase_price || '',
          mrp: batch.mrp || '',
          barcode: batch.barcode || '',
          isExisting: true
        }))
        : [];
      console.log('📦 Fetched batches:', mappedBatches);
      setBatches(mappedBatches);

      // Calculate totals from batches
      if (mappedBatches.length > 0) {
        const totalPurchasePrice = mappedBatches.reduce((sum, batch) => sum + (parseFloat(batch.purchasePrice) || 0), 0);
        const totalPrice = mappedBatches.reduce((sum, batch) => sum + (parseFloat(batch.sellingPrice) || 0), 0);
        const totalMRP = mappedBatches.reduce((sum, batch) => sum + (parseFloat(batch.mrp) || 0), 0);

        console.log('💰 Batch totals:', {
          purchase: totalPurchasePrice,
          price: totalPrice,
          mrp: totalMRP
        });

        // Update form data with batch totals
        setFormData(prev => ({
          ...prev,
          purchase_price: totalPurchasePrice > 0 ? totalPurchasePrice : prev.purchase_price,
          price: totalPrice > 0 ? totalPrice : prev.price,
          mrp: totalMRP > 0 ? totalMRP : prev.mrp
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
      batchNumber: '', // Empty for manual entry
      mfgDate: '',
      expDate: '',
      quantity: '', // Empty initially
      min_sale_price: '',
      sellingPrice: '', // Empty initially
      purchasePrice: '', // Empty initially
      mrp: '', // Empty initially
      barcode: newBarcode,
      isExisting: false
    };
  };

  // Add this validation function
  const validateBatchNumber = async (batchNumber, currentBatchId = null) => {
    if (!batchNumber) return true; // Skip validation if empty

    try {
      const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
        params: {
          batch_number: batchNumber,
          group_by: formData.group_by || 'Purchaseditems',
          product_id: productId || '' // Exclude current product for updates
        }
      });

      if (response.data.exists) {
        // Check if this is the same batch (during editing)
        if (currentBatchId) {
          const currentBatch = batches.find(b => b.id === currentBatchId);
          if (currentBatch && currentBatch.batchNumber === batchNumber) {
            return true; // It's the same batch, allow it
          }
        }
        return false; // Duplicate found
      }
      return true; // No duplicate
    } catch (error) {
      console.error('Error validating batch number:', error);
      return true; // Don't block if validation fails
    }
  };

  const handleBatchChange = async (index, e) => {
    const { name, value } = e.target;
    const updated = [...batches];
    updated[index][name] = value;

    // Validate batch number when it's changed
    if (name === 'batchNumber' && value) {
      const isValid = await validateBatchNumber(value, updated[index].id);
      if (!isValid) {
        window.alert(`Batch number "${value}" already exists in ${formData.group_by || 'Purchaseditems'}. Please select another batch number.`);
        // Revert the change
        updated[index][name] = batches[index][name];
      }
    }

    setBatches(updated);

    // Update main prices when batch prices change
    if (name === 'purchasePrice') {
      calculateAndUpdateMainPurchasePrice(updated);
    }

    if (name === 'sellingPrice') {
      calculateAndUpdateMainPrice(updated); // Changed from selling price to price
    }

    if (name === 'mrp') {
      calculateAndUpdateMainMRP(updated);
    }
  };

  const calculateAndUpdateMainPurchasePrice = (updatedBatches) => {
    // Calculate SUM of all batch purchase prices
    const totalPurchasePrice = updatedBatches.reduce((sum, batch) => {
      return sum + (parseFloat(batch.purchasePrice) || 0);
    }, 0);

    // Update the main form purchase_price field with total value
    if (totalPurchasePrice > 0) {
      setFormData(prev => ({
        ...prev,
        purchase_price: totalPurchasePrice.toFixed(2)
      }));
    }
  };

  const calculateAndUpdateMainPrice = (updatedBatches) => {
    // Calculate SUM of all batch selling prices (stored as price in products table)
    const totalPrice = updatedBatches.reduce((sum, batch) => {
      return sum + (parseFloat(batch.sellingPrice) || 0);
    }, 0);

    // Update the main form price field with total value
    if (totalPrice > 0) {
      setFormData(prev => ({
        ...prev,
        price: totalPrice.toFixed(2)
      }));
    }
  };

  const calculateAndUpdateMainMRP = (updatedBatches) => {
    // Calculate SUM of all batch MRPs
    const totalMRP = updatedBatches.reduce((sum, batch) => {
      return sum + (parseFloat(batch.mrp) || 0);
    }, 0);

    // Update the main form MRP field with total value
    if (totalMRP > 0) {
      setFormData(prev => ({
        ...prev,
        mrp: totalMRP.toFixed(2)
      }));
    }
  };

  // Add these functions after showAlert function

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

  const [formData, setFormData] = useState({
    group_by: groupType,
    goods_name: '',
    category_id: '',
    company_id: '',
    purchase_price: '',
    price: '', 
    mrp: '',
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
    description: '',
    maintain_batch: false,
    can_be_sold: false,
     product_type: '', 
  });
  
  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Update tax calculation based on "Can be Sold" checkbox
    if ((name === 'purchase_price' || name === 'price' || name === 'gst_rate' || name === 'inclusive_gst' || name === 'can_be_sold') &&
      (updatedFormData.gst_rate && (updatedFormData.purchase_price || updatedFormData.price))) {

      // Determine which price to use for tax calculation
      const priceToUse = updatedFormData.can_be_sold && updatedFormData.price
        ? updatedFormData.price
        : updatedFormData.purchase_price;

      if (priceToUse) {
        const { netPrice } = calculateTaxAndNetPrice(
          priceToUse,
          updatedFormData.gst_rate,
          updatedFormData.inclusive_gst
        );
        updatedFormData.net_price = netPrice;
      }
    }

    // Sync main prices to batches
    if (batches.length > 0) {
      const updatedBatches = batches.map(batch => ({
        ...batch,
        purchasePrice: name === 'purchase_price' ? value : batch.purchasePrice,
        sellingPrice: name === 'price' ? value : batch.sellingPrice, // Map price to sellingPrice in batches
        mrp: name === 'mrp' ? value : batch.mrp,
        quantity: name === 'opening_stock' ? value : batch.quantity
      }));
      setBatches(updatedBatches);
    }

    if (name === 'maintain_batch') {
      if (checked && batches.length === 0) {
        const defaultBatch = await createDefaultBatch();
        setBatches([defaultBatch]);
      } else if (!checked) {
        const defaultBatch = {
          id: `temp_${Date.now()}_${Math.random()}`,
          dbId: null,
          batchNumber: 'DEFAULT',
          mfgDate: '',
          expDate: '',
          quantity: updatedFormData.opening_stock || '',
          min_sale_price: '',
          sellingPrice: '', // Empty when switching off batch mode
          purchasePrice: '', // Empty when switching off batch mode
          mrp: '', // Empty when switching off batch mode
          barcode: '',
          isExisting: false
        };
        setBatches([defaultBatch]);
      }
      setMaintainBatch(checked);
    }

    // When "Can be Sold" is checked, ensure price is populated from purchase price if empty
    if (name === 'can_be_sold' && checked && !formData.price && formData.purchase_price) {
      updatedFormData.price = formData.purchase_price;

      // Recalculate tax with price
      if (updatedFormData.gst_rate) {
        const { netPrice } = calculateTaxAndNetPrice(
          updatedFormData.price,
          updatedFormData.gst_rate,
          updatedFormData.inclusive_gst
        );
        updatedFormData.net_price = netPrice;
      }
    }

    setFormData(updatedFormData);
  };

  // Add this function after handleChange
  const handleGstRateChange = (e) => {
    const { value } = e.target;
    const updatedFormData = { ...formData, gst_rate: value };

    // Determine which price to use for tax calculation
    const priceToUse = formData.can_be_sold && formData.price
      ? formData.price
      : formData.purchase_price;

    if (priceToUse && value) {
      const { netPrice } = calculateTaxAndNetPrice(
        priceToUse,
        value,
        formData.inclusive_gst
      );
      updatedFormData.net_price = netPrice;
    }

    setFormData(updatedFormData);
  };

  // Add this function after handleGstRateChange
  const handleGstTypeChange = (e) => {
    const { value } = e.target;
    const updatedFormData = { ...formData, inclusive_gst: value };

    // Determine which price to use for tax calculation
    const priceToUse = formData.can_be_sold && formData.price
      ? formData.price
      : formData.purchase_price;

    if (priceToUse && formData.gst_rate) {
      const { netPrice } = calculateTaxAndNetPrice(
        priceToUse,
        formData.gst_rate,
        value
      );
      updatedFormData.net_price = netPrice;
    }

    setFormData(updatedFormData);
  };

  const addNewBatch = async () => {
    try {
      console.log('➕ Starting to add new batch...');
      console.log('📊 Current batches count:', batches.length);
      console.log('📦 Current product ID:', productId);

      const newBatch = await createDefaultBatch();
      console.log('✅ New batch created:', {
        batchNumber: newBatch.batchNumber,
        id: newBatch.id
      });

      setBatches(prev => {
        const updated = [...prev, newBatch];
        console.log('📦 Batches after add:', updated.map(b => b.batchNumber));

        return updated;
      });

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

    // Recalculate main prices after removing batch
    calculateAndUpdateMainPurchasePrice(updated);
    calculateAndUpdateMainPrice(updated); // Changed from selling price to price
    calculateAndUpdateMainMRP(updated);
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.can_be_sold) {
      const price = parseFloat(formData.price);

      if (!price || price <= 0) {
        showAlert('Price is required when "Can be Sold" is checked', 'danger');
        setIsLoading(false);
        return;
      }

      // Also validate that price is not less than purchase price
      const purchasePrice = parseFloat(formData.purchase_price);
      if (price < purchasePrice) {
        showAlert('Price cannot be less than Purchase Price', 'danger');
        setIsLoading(false);
        return;
      }
    }

    // Calculate total stock for batch-managed products
    const calculateTotalStockFromBatches = () => {
      if (!batches || batches.length === 0) return 0;
      const total = batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);
      console.log('📊 Calculated total stock from batches:', total);
      return total;
    };

    if (maintainBatch) {
      // Check for required fields
      const invalidBatches = batches.filter(
        (batch) => !batch.batchNumber || !batch.quantity || !batch.purchasePrice || !batch.barcode
      );

      if (invalidBatches.length > 0) {
        showAlert(
          'Please fill all required fields in batch details (Batch Number, Quantity, Purchase Price, and Barcode)',
          'danger'
        );
        setIsLoading(false);
        return;
      }

      // Validate unique batch numbers within the same product
      const batchNumbers = batches.map(b => b.batchNumber);
      const uniqueBatchNumbers = new Set(batchNumbers);
      if (batchNumbers.length !== uniqueBatchNumbers.size) {
        showAlert('Batch numbers must be unique within this product. Please check your batch numbers.', 'danger');
        setIsLoading(false);
        return;
      }

      // Check if batch number already exists in the same group
      try {
        const batchCheckPromises = batches.map(async (batch) => {
          if (!batch.isExisting) {
            try {
              const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
                params: {
                  batch_number: batch.batchNumber,
                  group_by: formData.group_by || 'Purchaseditems',
                  product_id: productId || ''
                }
              });
              return response.data.exists;
            } catch (error) {
              console.error('Error checking batch number:', error);
              return false;
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
      // Calculate final opening stock
      let finalOpeningStock = parseFloat(formData.opening_stock) || 0;
      if (maintainBatch && batches.length > 0) {
        finalOpeningStock = calculateTotalStockFromBatches();
        console.log('🔄 Using batch-based opening stock:', finalOpeningStock);
      }

      // Calculate final purchase price from batches or form
      let finalPurchasePrice = parseFloat(formData.purchase_price) || 0;
      if (maintainBatch && batches.length > 0) {
        const totalPurchasePrice = batches.reduce((sum, batch) => {
          return sum + (parseFloat(batch.purchasePrice) || 0);
        }, 0);
        finalPurchasePrice = totalPurchasePrice || 0;
        console.log('🔄 Using batch-based purchase price (total):', finalPurchasePrice);
      }

      // Calculate final price and MRP
      let finalPrice = parseFloat(formData.price) || 0;
      let finalMRP = parseFloat(formData.mrp) || 0;

      if (maintainBatch && batches.length > 0) {
        // Get total price and MRP from batches
        const totalPrice = batches.reduce((sum, batch) => {
          return sum + (parseFloat(batch.sellingPrice) || 0);
        }, 0);

        const totalMRP = batches.reduce((sum, batch) => {
          return sum + (parseFloat(batch.mrp) || 0);
        }, 0);

        finalPrice = totalPrice;
        finalMRP = totalMRP;

        console.log('🔄 Using batch-based price (total):', finalPrice);
        console.log('🔄 Using batch-based MRP (total):', finalMRP);
      }

      // Generate barcodes
      let defaultBarcode = null;
      if (!maintainBatch) {
        defaultBarcode = await generateUniqueBarcode();
      }

      // Prepare batches for backend
      const batchesForBackend = await Promise.all(batches.map(async (batch) => {
        const batchData = {
          batch_number: maintainBatch ? batch.batchNumber : 'DEFAULT',
          mfg_date: maintainBatch ? (batch.mfgDate || null) : null,
          exp_date: maintainBatch ? (batch.expDate || null) : null,
          quantity: maintainBatch ? (parseFloat(batch.quantity) || 0) : finalOpeningStock,
          min_sale_price: parseFloat(batch.min_sale_price) || 0,
          selling_price: parseFloat(batch.sellingPrice) || finalPrice, // selling_price in batches table
          purchase_price: parseFloat(batch.purchasePrice) || finalPurchasePrice,
          mrp: parseFloat(batch.mrp) || finalMRP,
          barcode: maintainBatch ? batch.barcode : defaultBarcode || await generateUniqueBarcode(),
          group_by: formData.group_by || 'Purchaseditems',
          isExisting: batch.isExisting || false
        };

        // For non-batch items, use a default batch structure
        if (!maintainBatch) {
          batchData.batch_number = 'DEFAULT';
          batchData.quantity = finalOpeningStock;
          batchData.purchase_price = finalPurchasePrice;
          batchData.selling_price = finalPrice; // From main form price
          batchData.mrp = finalMRP; // From main form mrp
        }

        if (batch.isExisting && batch.dbId && !batch.dbId.toString().includes('temp_')) {
          batchData.id = batch.dbId;
        }

        console.log(`📦 Batch data - Selling Price: ${batchData.selling_price}, MRP: ${batchData.mrp}`);
        return batchData;
      }));

      // If no batches exist, create a default batch
      if (batchesForBackend.length === 0) {
        const barcode = defaultBarcode || await generateUniqueBarcode();
        batchesForBackend.push({
          batch_number: 'DEFAULT',
          mfg_date: null,
          exp_date: null,
          quantity: finalOpeningStock,
          cost_price: 0,
          selling_price: finalPrice,
          purchase_price: finalPurchasePrice,
          mrp: finalMRP,
          barcode: barcode,
          group_by: formData.group_by || 'Purchaseditems',
          isExisting: false
        });
      }

      const dataToSend = {
        ...formData,
        images: images,
        group_by: groupType,
        opening_stock: finalOpeningStock,
        purchase_price: finalPurchasePrice,
        price: finalPrice, 
        mrp: finalMRP,
        stock_in: finalOpeningStock,
        stock_out: 0,
        balance_stock: finalOpeningStock,
        batches: batchesForBackend,
        maintain_batch: maintainBatch,
         product_type: formData.product_type, 
      };

      delete dataToSend.selling_price;

      console.log('📤 Sending data to backend:', {
        maintain_batch: maintainBatch,
        product_purchase_price: dataToSend.purchase_price,
        product_price: dataToSend.price, 
        product_mrp: dataToSend.mrp,
        batch_count: batchesForBackend.length,
        selling_price_in_batches: batchesForBackend.map(b => b.selling_price),
        mrp_in_batches: batchesForBackend.map(b => b.mrp)
      });

      if (productId) {
        console.log(`🔄 Updating product ID: ${productId}`);

        const response = await axios.put(`${baseurl}/products/${productId}`, dataToSend, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Update response:', response.data);
        showAlert('Product updated successfully!', 'success');

        await fetchBatches(productId);
      } else {
        console.log('➕ Creating new product');
        const response = await axios.post(`${baseurl}/products`, dataToSend, {
          headers: { 'Content-Type': 'application/json' }
        });
        showAlert('New product added successfully!', 'success');
      }

      setTimeout(() => navigate('/purchased_items'), 1500);
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
    ? `Edit Product in Purchase Catalog`
    : `Add Product to Purchase Catalog`;

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
                        Purchase price is auto-calculated as total of all batch purchase prices
                      </Form.Text>
                    )}
                  </div>
                  <div className="col">
                    <Form.Label>
                     Sale Price {formData.can_be_sold && '*'}
                    </Form.Label>
                    <Form.Control
                      placeholder="Price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                      required={formData.can_be_sold}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Price is auto-calculated as total of all batch selling prices
                      </Form.Text>
                    )}
                    {formData.can_be_sold && !maintainBatch && (
                      <Form.Text className="text-warning">
                        Required for items that can be sold
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
                      value={formData.mrp}
                      onChange={handleChange}
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        MRP is auto-calculated as total of all batch MRPs
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
                      onChange={handleGstTypeChange}
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
                      onChange={handleGstRateChange}
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
                    <Form.Label>
                      {formData.can_be_sold ? 'Net Price (from Sale Price)' : 'Net Price (from Purchase)'}
                    </Form.Label>
                    <Form.Control
                      placeholder="Net Price | GST"
                      name="net_price"
                      type="number"
                      step="0.01"
                      value={formData.net_price}
                      onChange={handleChange}
                      readOnly
                    />
                    <Form.Text className="text-muted">
                      {formData.can_be_sold
                        ? 'Calculated from Sale Price'
                        : 'Calculated from Purchase Price'}
                    </Form.Text>
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
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>SKU</Form.Label>
                    <Form.Control
                      placeholder="SKU"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Conditionally show Opening Stock field */}
                  {!maintainBatch && (
                    <div className="col">
                      <Form.Label>Opening Stock *</Form.Label>
                      <Form.Control
                        placeholder="Opening Stock"
                        name="opening_stock"
                        type="number"
                        value={formData.opening_stock || (batches.length > 0 ? batches[0].opening_stock : '')}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  {/* Show calculated stock when batches exist */}
                  {maintainBatch && batches.length > 0 && (
                    <div className="col">
                      <Form.Label>Total Stock (from batches)</Form.Label>
                      <Form.Control
                        type="number"
                        value={calculateTotalStockFromBatches()}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Calculated from batch quantities
                      </Form.Text>
                    </div>
                  )}

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
                </div>

         <div className="row mb-3">
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
    <Form.Label>Product Type *</Form.Label>
    <Form.Select
      name="product_type"
      value={formData.product_type}
      onChange={handleChange}
      required
    >
      <option value="">Select Product Type</option>
      <option value="KACHA">KACHA</option>
      <option value="PAKKA">PAKKA</option>
    </Form.Select>
  </div>
  <div className="col d-flex align-items-center">
    <Form.Check
      type="checkbox"
      label="Can be Sold (Crt Sales Ctlg Entry)"
      name="can_be_sold"
      checked={formData.can_be_sold}
      onChange={handleChange}
      className="mt-4"
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

                {maintainBatch && (
                  <div className="border border-dark p-3 mb-3">
                    <h5>Batch Details</h5>

                

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
                              name="quantity"
                              value={batch.quantity}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                              placeholder="Enter quantity"
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
                            <Form.Label>Purchase Price*</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="purchasePrice"
                              value={batch.purchasePrice}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                              placeholder="Enter purchase price"
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Selling Price (Price)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="sellingPrice"
                              value={batch.sellingPrice}
                              onChange={(e) => handleBatchChange(index, e)}
                              placeholder={formData.price ? `Main: ${formData.price}` : 'Enter selling price'}
                            />
                          
                          </div>
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>M.R.P</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="mrp"
                              value={batch.mrp}
                              onChange={(e) => handleBatchChange(index, e)}
                              placeholder={formData.mrp ? `Main: ${formData.mrp}` : 'Enter MRP'}
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
                              placeholder="Enter cost price"
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
                 
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/purchased_items')}
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
                  setFormData((prev) => ({ ...prev, unit: newUnit.id }));
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

export default AddProductPage;