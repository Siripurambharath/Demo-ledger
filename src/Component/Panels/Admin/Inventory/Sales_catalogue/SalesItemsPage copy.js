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

const SalesItemsPage = ({ groupType = 'Salescatalog', user }) => {
  const navigate = useNavigate();
  const { productId } = useParams();

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

  // Tax calculation function
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

    setFormData({
      group_by: product.group_by || groupType,
      goods_name: product.goods_name || product.name || '',
      category_id: product.category_id || '',
      company_id: product.company_id || '',
      price: product.price || '',
      inclusive_gst: product.inclusive_gst || '',
      gst_rate: product.gst_rate || '',
      non_taxable: product.non_taxable || '',
      net_price: product.net_price || '',
      hsn_code: product.hsn_code || '',
      unit: product.unit || 'UNT-UNITS',
      cess_rate: product.cess_rate || '',
      cess_amount: product.cess_amount || '',
      sku: product.sku || '',
      opening_stock: product.opening_stock || (product.batches && product.batches[0] ? product.batches[0].opening_stock : ''),
      opening_stock_date: product.opening_stock_date ? product.opening_stock_date.split('T')[0] : new Date().toISOString().split('T')[0],
      min_stock_alert: product.min_stock_alert || '',
      max_stock_alert: product.max_stock_alert || '',
      description: product.description || '',
      maintain_batch: product.maintain_batch || false
    });

    setMaintainBatch(product.maintain_batch || false);
    await fetchBatches(id);
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
          costPrice: batch.cost_price || '',
            opening_stock: batch.opening_stock || '', // ADD THIS LINE
          sellingPrice: batch.selling_price || '', // CHANGED: Empty instead of formData.price
          purchasePrice: batch.purchase_price || '',
          mrp: batch.mrp || '',
          barcode: batch.barcode || '',
          isExisting: true
        }))
      : [];
    console.log('📦 Fetched batches:', mappedBatches);
    setBatches(mappedBatches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    setBatches([]);
  }
};

  const generateUniqueBarcode = async () => {
    let isUnique = false;
    let newBarcode;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      const timestamp = Date.now();
      const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      newBarcode = `B${timestamp}${randomPart}`;
      
      try {
        const response = await axios.get(`${baseurl}/batches/check-barcode/${newBarcode}`);
        if (response.data.available) {
          isUnique = true;
          console.log('✅ Generated unique barcode:', newBarcode);
        } else {
          console.log('🔄 Barcode exists, generating new one...');
        }
      } catch (error) {
        console.error('Error checking barcode:', error);
        isUnique = true;
      }
    }

    if (!isUnique) {
      newBarcode = `B${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      console.log('⚠️ Using fallback barcode:', newBarcode);
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
    quantity: formData.opening_stock || '',
    costPrice: '',
    sellingPrice: '', // CHANGED: Empty instead of formData.price
    purchasePrice: '',
    mrp: '',
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
        group_by: formData.group_by || 'Salescatalog',
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
      window.alert(`Batch number "${value}" already exists in ${formData.group_by || 'Salescatalog'}. Please select another batch number.`);
      // Revert the change
      updated[index][name] = batches[index][name];
    }
  }
  
  setBatches(updated);
  
  // NEW: Calculate and update main price field when sellingPrice changes
  if (name === 'sellingPrice') {
    calculateAndUpdateMainPrice(updated);
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
    description: '',
    maintain_batch: false
  });

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`🔄 Handling change: ${name} = ${type === 'checkbox' ? checked : value}`);

    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    if ((name === 'price' || name === 'gst_rate' || name === 'inclusive_gst') &&
        updatedFormData.price && updatedFormData.gst_rate) {
      const { netPrice } = calculateTaxAndNetPrice(
        updatedFormData.price,
        updatedFormData.gst_rate,
        updatedFormData.inclusive_gst
      );
      updatedFormData.net_price = netPrice;
    }

    if (name === 'price' && batches.length > 0) {
      const updatedBatches = batches.map(batch => ({
        ...batch,
        sellingPrice: value || batch.sellingPrice
      }));
      setBatches(updatedBatches);
    }

    if (name === 'maintain_batch') {
      if (checked && batches.length === 0) {
        const defaultBatch = await createDefaultBatch();
        setBatches([defaultBatch]);
      } else if (!checked) {
        setBatches([]);
      }
      setMaintainBatch(checked);
    }

    setFormData(updatedFormData);
  };

const calculateAndUpdateMainPrice = (updatedBatches) => {
  // Calculate TOTAL selling price from all batches (SUM instead of average)
  const totalSellingPrice = updatedBatches.reduce((sum, batch) => {
    const sellingPrice = parseFloat(batch.sellingPrice) || 0;
    return sum + sellingPrice;
  }, 0);
  
  // Update the main form price field with TOTAL
  setFormData(prev => ({
    ...prev,
    price: totalSellingPrice.toFixed(2)
  }));
};

const addNewBatch = async () => {
  try {
    console.log('➕ Starting to add new batch...');
    console.log('📊 Current batches count:', batches.length);
    console.log('📦 Current product ID:', productId);
    console.log('🏷️ Current batch numbers:', batches.map(b => b.batchNumber));
    
    const newBatch = await createDefaultBatch();
    console.log('✅ New batch created:', {
      batchNumber: newBatch.batchNumber,
      id: newBatch.id
    });
    
    setBatches(prev => {
      const updated = [...prev, newBatch];
      console.log('📦 Batches after add:', updated.map(b => b.batchNumber));
      
      // Calculate main price after adding new batch
      calculateAndUpdateMainPrice(updated);
      
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
  
  // Calculate main price after removing batch
  calculateAndUpdateMainPrice(updated);
};

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  // Calculate total stock for batch-managed products
  const calculateTotalStockFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    const total = batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);
    console.log('📊 Calculated total stock from batches:', total);
    return total;
  };

  // Validate batches if maintainBatch is enabled
  if (maintainBatch) {
    // Check for required fields
    const invalidBatches = batches.filter(
      (batch) => !batch.batchNumber || !batch.quantity || !batch.sellingPrice || !batch.barcode
    );

    if (invalidBatches.length > 0) {
      showAlert(
        'Please fill all required fields in batch details (Batch Number, Quantity, Selling Price, and Barcode)',
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

    // NEW VALIDATION: Check if batch number already exists in the same group
    try {
      const batchCheckPromises = batches.map(async (batch) => {
        // Only check for new batches (not existing ones being updated)
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
    // Calculate final opening stock
    let finalOpeningStock = parseFloat(formData.opening_stock) || 0;
    if (maintainBatch && batches.length > 0) {
      finalOpeningStock = calculateTotalStockFromBatches();
      console.log('🔄 Using batch-based opening stock:', finalOpeningStock);
    }

    // Prepare batches for backend
    const batchesForBackend = maintainBatch
      ? batches.map((batch) => {
          const batchData = {
            batch_number: batch.batchNumber,
            mfg_date: batch.mfgDate || null,
            exp_date: batch.expDate || null,
            quantity: parseFloat(batch.quantity) || 0,
            cost_price: parseFloat(batch.costPrice) || 0,
            selling_price: parseFloat(batch.sellingPrice) || 0,
            purchase_price: parseFloat(batch.purchasePrice) || 0,
            mrp: parseFloat(batch.mrp) || 0,
            // batch_price: parseFloat(batch.batchPrice) || 0,
            barcode: batch.barcode,
            group_by: formData.group_by || 'Salescatalog',
            isExisting: batch.isExisting || false
          };

          if (batch.isExisting && batch.dbId && !batch.dbId.toString().includes('temp_')) {
            batchData.id = batch.dbId;
          }

          console.log(`📦 Batch data - ID: ${batch.id}, isExisting: ${batch.isExisting}, sending ID: ${batchData.id}`);
          return batchData;
        })
      : [];

    // Prepare data for backend with proper stock initialization
    const dataToSend = {
      ...formData,
      group_by: groupType,
      opening_stock: finalOpeningStock,
      // Ensure proper stock initialization based on batch management
      stock_in: maintainBatch ? finalOpeningStock : finalOpeningStock,
      stock_out: 0,
      balance_stock: finalOpeningStock,
      batches: batchesForBackend
    };

    console.log('📤 Sending data to backend:', {
      opening_stock: dataToSend.opening_stock,
      stock_in: dataToSend.stock_in,
      stock_out: dataToSend.stock_out,
      balance_stock: dataToSend.balance_stock,
      maintain_batch: dataToSend.maintain_batch,
      batch_count: batchesForBackend.length,
      batch_numbers: batchesForBackend.map(b => b.batch_number)
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

    setTimeout(() => navigate('/sale_items'), 1500);
  } catch (error) {
    console.error('❌ Failed to add/update product:', error);
    console.error('❌ Error response:', error.response?.data);
    
    // Handle specific batch number duplicate error from backend
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
    <Form.Label>Price *</Form.Label>
    <Form.Control
      placeholder="Price"
      name="price"
      type="number"
      step="0.01"
      value={formData.price}
      onChange={handleChange}
      required
      disabled={maintainBatch}
      className={maintainBatch ? "bg-light" : ""} 
    />
    {/* NEW: Help text when disabled */}
    {maintainBatch && (
      <Form.Text className="text-muted">
        Price is auto-calculated from batch selling prices
      </Form.Text>
    )}
  </div>
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
                </div>

                <div className="row mb-3">
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
                  <div className="col">
                    <Form.Label>HSN Code</Form.Label>
                    <Form.Control
                      placeholder="HSN Code"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
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
                          <option key={unit.id} value={unit.name}>
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
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Exp. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="expDate"
                              value={batch.expDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>Mfg. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="mfgDate"
                              value={batch.mfgDate}
                              onChange={(e) => handleBatchChange(index, e)}
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
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Purchase Price</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="purchasePrice"
                              value={batch.purchasePrice}
                              onChange={(e) => handleBatchChange(index, e)}
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
                            />
                          </div>
                          {/* <div className="col-md-4">
                            <Form.Label>Batch Price</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="batchPrice"
                              value={batch.batchPrice}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div> */}
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
                      <small>* Batch numbers are auto-generated and unique across all products</small>
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
                  setFormData((prev) => ({ ...prev, unit: newUnit.name }));
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