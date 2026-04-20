import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseurl } from '../../../../../BaseURL/BaseURL';

function CreateFlashSale({ editingFlashSale, onBack, onSuccess }) {
  const [flashSaleData, setFlashSaleData] = useState({
    title: "",
    description: "",
    flashSaleType: "",
    products: [],
    validFrom: "",
    validUntil: "",
    startTime: "",
    endTime: "",
    image: null,
    discountValue: "",
    buyQuantity: 1,
    getQuantity: 1,
    expiryThreshold: 7,
    stockLimit: "",
    purchaseLimit: 1,
    termsConditions: ""
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);

  const flashSaleTypes = [
    { value: "bogo", label: "Buy One Get One", description: "Buy X get Y free" },
    { value: "expiry", label: "Near Expiry", description: "Discounts on expiring products" },
    { value: "clearance", label: "Clearance Sale", description: "Stock clearance discounts" },
    { value: "seasonal", label: "Seasonal Flash", description: "Seasonal product discounts" },
    { value: "hourly", label: "Hourly Deal", description: "Limited time hourly discounts" },
    { value: "limited_stock", label: "Limited Stock", description: "Limited quantity offers" }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log("🔄 Editing Flash Sale Effect Triggered");
    console.log("Editing Flash Sale:", editingFlashSale);
    console.log("Products loaded:", products.length);
    
    if (editingFlashSale && products.length > 0) {
      console.log("🚨 Setting up edit mode for flash sale ID:", editingFlashSale.id);
      console.log("Editing Flash Sale Data:", editingFlashSale);
      
      // Find the product from the editingFlashSale data
      let selectedProduct = null;
      
      if (editingFlashSale.product_id) {
        // Try to find the product by ID
        selectedProduct = products.find(product => 
          String(product.id) === String(editingFlashSale.product_id)
        );
        console.log("Found product by product_id:", selectedProduct);
      }
      
      // If no product found by product_id, check the products array
      if (!selectedProduct && editingFlashSale.products && editingFlashSale.products.length > 0) {
        const firstProduct = editingFlashSale.products[0];
        if (typeof firstProduct === 'object' && firstProduct.id) {
          selectedProduct = products.find(product => 
            String(product.id) === String(firstProduct.id)
          );
          console.log("Found product from products array:", selectedProduct);
        } else if (typeof firstProduct === 'string' || typeof firstProduct === 'number') {
          selectedProduct = products.find(product => 
            String(product.id) === String(firstProduct)
          );
          console.log("Found product from string/number ID:", selectedProduct);
        }
      }
const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const d = new Date(dateString);

  // Use LOCAL date values, not UTC
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


      // Set up the form data
      const newFormData = {
        title: editingFlashSale.title || "",
        description: editingFlashSale.description || "",
        flashSaleType: editingFlashSale.flashSaleType || editingFlashSale.offer_type || "",
        products: selectedProduct ? [selectedProduct] : [],
        validFrom: formatDateForInput(editingFlashSale.validFrom || editingFlashSale.valid_from),
        validUntil: formatDateForInput(editingFlashSale.validUntil || editingFlashSale.valid_until),
        startTime: editingFlashSale.startTime || editingFlashSale.start_time || "00:00",
        endTime: editingFlashSale.endTime || editingFlashSale.end_time || "23:59",
        image: null, // We'll handle image separately
        discountValue: editingFlashSale.discountValue || editingFlashSale.discount_percentage || "",
        buyQuantity: editingFlashSale.buyQuantity || editingFlashSale.buy_quantity || 1,
        getQuantity: editingFlashSale.getQuantity || editingFlashSale.get_quantity || 1,
        expiryThreshold: editingFlashSale.expiryThreshold || editingFlashSale.expiry_threshold || 7,
        stockLimit: editingFlashSale.stockLimit || "",
        purchaseLimit: editingFlashSale.purchaseLimit || editingFlashSale.purchase_limit || 1,
        termsConditions: editingFlashSale.termsConditions || editingFlashSale.terms_conditions || ""
      };

      console.log("Setting form data:", newFormData);
      setFlashSaleData(newFormData);
      
      // Handle image preview
      if (editingFlashSale.image) {
        const imageUrl = editingFlashSale.image.startsWith('http') 
          ? editingFlashSale.image 
          : `${baseurl}${editingFlashSale.image}`;
        setImagePreview(imageUrl);
        console.log("Image preview URL:", imageUrl);
      }
    }
  }, [editingFlashSale, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${baseurl}/get-sales-products`);

      const transformedProducts = response.data.map((product, index) => ({
        id: product.id,
        name: product.name,
        category: product.category || "Uncategorized",
        category_id: product.category_id || "",
        unit: product.unit || "",
        price: product.price || null,
        group_by: product.group_by || null,
        expiryDate: product.exp_date || null,
        key: `${product.id}-${index}`
      }));

      console.log("Fetched products:", transformedProducts);
      setProducts(transformedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlashSaleInputChange = (e) => {
    const { name, value, files, selectedOptions, type } = e.target;

    console.log(`Input change: ${name} =`, value);

    if (name === "image") {
      if (files && files.length > 0) {
        const file = files[0];
        setFlashSaleData(prev => ({ ...prev, image: file }));
        setRemoveImageFlag(false);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } 
    else if (name === "products") {
      console.log("Products select changed");
      console.log("Selected options:", Array.from(selectedOptions).map(o => o.value));
      
      const selectedIds = Array.from(selectedOptions, option => option.value);
      
      if (selectedIds.length === 0) {
        setFlashSaleData(prev => ({ ...prev, products: [] }));
      } else {
        const selectedProducts = products.filter(product => 
          selectedIds.includes(String(product.id))
        );
        
        console.log("Selected products objects:", selectedProducts);
        
        setFlashSaleData(prev => ({ 
          ...prev, 
          products: selectedProducts
        }));
      }
    } 
    else {
      setFlashSaleData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getNearExpiryProducts = () => {
    const threshold = parseInt(flashSaleData.expiryThreshold) || 7;
    const today = new Date();

    return products.filter(product => {
      if (!product.expiryDate) return false;
      const expiryDate = new Date(product.expiryDate);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= threshold && diffDays >= 0;
    });
  };

  const getFilteredProducts = () => {
    switch (flashSaleData.flashSaleType) {
      case 'expiry':
        return getNearExpiryProducts();
      case 'clearance':
        return products.filter(product =>
          product.group_by === 'Purchaseditems' ||
          (product.mrp - product.price) / product.mrp > 0.3
        );
      case 'seasonal':
        return products;
      default:
        return products;
    }
  };

  const renderProductOptions = () => {
    if (loading) return <option>Loading products...</option>;
    if (error) return <option>{error}</option>;

    const filteredProducts = getFilteredProducts();
    if (filteredProducts.length === 0) return <option>No products available for this offer type</option>;

    return filteredProducts.map((product) => {
      const expiryText = product.expiryDate
        ? ` | Exp: ${new Date(product.expiryDate).toLocaleDateString()}`
        : "";

      return (
        <option key={product.key} value={String(product.id)}>
          {product.name} - {product.category}
          {product.price && ` - Price: ₹${product.price}`}
          {product.unit && ` Stock(${product.unit})`}
          {expiryText}
        </option>
      );
    });
  };

  const handleFlashSaleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📤 Submitting Flash Sale Form");
      console.log("Flash Sale Data:", flashSaleData);
      console.log("Editing Mode:", editingFlashSale ? "Yes" : "No");

      if (flashSaleData.products.length === 0) {
        alert("Please select at least one product");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      
      // Basic Info
      formData.append("title", flashSaleData.title);
      formData.append("description", flashSaleData.description);
      formData.append("offer_type", flashSaleData.flashSaleType);
      formData.append("status", "active");
      
      // Pricing & Discount
      formData.append("discount_percentage", flashSaleData.discountValue || 0);
      formData.append("minimum_amount", 0);
      
      // Dates & Times
      formData.append("valid_from", flashSaleData.validFrom);
      formData.append("valid_until", flashSaleData.validUntil);
      formData.append("start_time", flashSaleData.startTime || "00:00");
      formData.append("end_time", flashSaleData.endTime || "23:59");
      
      // BOGO Fields
      formData.append("buy_quantity", flashSaleData.buyQuantity || 1);
      formData.append("get_quantity", flashSaleData.getQuantity || 1);
      
      // Limits
      formData.append("purchase_limit", flashSaleData.purchaseLimit || 1);
      formData.append("expiry_threshold", flashSaleData.expiryThreshold || 7);
      
      // Terms
      formData.append("terms_conditions", flashSaleData.termsConditions || "");
      
      // Product Info
      const firstProduct = flashSaleData.products[0];
      console.log("First product to submit:", firstProduct);
      
      formData.append("product_id", firstProduct?.id || "");
      formData.append("product_name", firstProduct?.name || "");
      formData.append("category_id", firstProduct?.category_id || "0");
      formData.append("category_name", firstProduct?.category || "");
      
      // Handle image
      if (editingFlashSale) {
        // For update
        if (removeImageFlag) {
          // User wants to remove existing image
          formData.append("removeImage", "true");
          console.log("🗑️ Removing existing image");
        } else if (flashSaleData.image instanceof File) {
          // User selected a new file
          formData.append("image", flashSaleData.image);
          console.log("📁 Adding new image file:", flashSaleData.image.name);
        }
      } else {
        // For create
        if (flashSaleData.image instanceof File) {
          formData.append("image", flashSaleData.image);
          console.log("📁 Adding image for new flash sale:", flashSaleData.image.name);
        }
      }

      // Debug: Log all form data
      console.log("📋 Form Data Contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const endpoint = editingFlashSale
        ? `${baseurl}/update-flashsale/${editingFlashSale.id}`
        : `${baseurl}/create-flashsale`;

      console.log(`🌐 Making ${editingFlashSale ? 'PUT' : 'POST'} request to:`, endpoint);

      const res = await axios({
        method: editingFlashSale ? 'put' : 'post',
        url: endpoint,
        data: formData,
        headers: { 
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("✅ Server Response:", res.data);
      
      if (res.data.success) {
        alert(editingFlashSale ? "🎉 Flash Sale Updated Successfully!" : "🎉 Flash Sale Created Successfully!");
        onSuccess();
      } else {
        alert(res.data.message || "Operation failed");
      }

    } catch (err) {
      console.error("❌ Submit Error:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 404) {
        alert(`Error 404: Endpoint not found. Please check if the server is running and the endpoint is correct.`);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Server error while saving flash sale. Please check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFlashSaleData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    setRemoveImageFlag(true);
  };

  const renderFlashSaleForm = () => {
    const nearExpiryProducts = getNearExpiryProducts();

    return (
      <form onSubmit={handleFlashSaleSubmit} className="offers-form">
    
        {/* Flash Sale Type */}
        <div className="offers-form-group">
          <label className="offers-form-label">Flash Sale Offer Type *</label>
          <div className="offers-flash-types-grid">
            {flashSaleTypes.map(type => (
              <div
                key={type.value}
                className={`offers-flash-type-card ${flashSaleData.flashSaleType === type.value ? 'offers-flash-type-active' : ''}`}
                onClick={() => setFlashSaleData(prev => ({ ...prev, flashSaleType: type.value }))}
              >
                <div className="offers-flash-type-icon">
                  {type.value === 'bogo' && '🎁'}
                  {type.value === 'expiry' && '⏰'}
                  {type.value === 'clearance' && '🏷️'}
                  {type.value === 'seasonal' && '🌞'}
                  {type.value === 'hourly' && '🕒'}
                  {type.value === 'limited_stock' && '📦'}
                </div>
                <div className="offers-flash-type-info">
                  <div className="offers-flash-type-title">{type.label}</div>
                  <div className="offers-flash-type-desc">{type.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="offers-form-group">
          <label className="offers-form-label">Flash Sale Title *</label>
          <input
            type="text"
            name="title"
            value={flashSaleData.title}
            onChange={handleFlashSaleInputChange}
            className="offers-form-input"
            required
            placeholder="e.g., Weekend BOGO Sale"
          />
        </div>

        <div className="offers-form-group">
          <label className="offers-form-label">Description *</label>
          <textarea
            name="description"
            value={flashSaleData.description}
            onChange={handleFlashSaleInputChange}
            className="offers-form-textarea"
            rows="2"
            required
            placeholder="Describe the flash sale..."
          />
        </div>

        {/* Products */}
        <div className="offers-form-group">
          <label className="offers-form-label">
            Select Products *
            {flashSaleData.flashSaleType === 'expiry' && nearExpiryProducts.length > 0 && (
              <span className="offers-suggestion-note">
                ({nearExpiryProducts.length} products expiring within {flashSaleData.expiryThreshold} days)
              </span>
            )}
            {!loading && products.length > 0 && flashSaleData.flashSaleType === 'expiry' && nearExpiryProducts.length === 0 && (
              <span className="offers-warning-note">
                (No products with expiry date found in system)
              </span>
            )}
          </label>
          <select
            name="products"
            multiple
            value={flashSaleData.products.map(p => String(p.id))}
            onChange={handleFlashSaleInputChange}
            className="offers-form-select offers-form-multiselect"
            required
            size="4"
            disabled={loading || products.length === 0}
          >
            <option value="" disabled>Select one or more products...</option>
            {renderProductOptions()}
          </select>
          
          <div className="offers-selected-count">
            <strong>{flashSaleData.products.length} product(s) selected</strong>
            {!loading && products.length > 0 && ` out of ${getFilteredProducts().length} available`}
            {flashSaleData.products.length > 0 && (
              <div style={{ fontSize: '12px', marginTop: '5px', color: '#495057' }}>
                Selected: {flashSaleData.products.map(p => p.name).join(', ')}
              </div>
            )}
          </div>
          
          {error && (
            <div className="offers-error-message">
              {error}
              <button type="button" onClick={fetchProducts} className="offers-retry-btn">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Flash Sale Specific Fields */}
        <div className="offers-form-row">
          {flashSaleData.flashSaleType === 'bogo' && (
            <>
              <div className="offers-form-group">
                <label className="offers-form-label">Buy Quantity *</label>
                <input
                  type="number"
                  name="buyQuantity"
                  value={flashSaleData.buyQuantity}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  required
                />
              </div>
              <div className="offers-form-group">
                <label className="offers-form-label">Get Quantity Free *</label>
                <input
                  type="number"
                  name="getQuantity"
                  value={flashSaleData.getQuantity}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  required
                />
              </div>
            </>
          )}

          {flashSaleData.flashSaleType === 'expiry' && (
            <>
              <div className="offers-form-group">
                <label className="offers-form-label">Discount Percentage *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={flashSaleData.discountValue}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  max="100"
                  required
                  placeholder="e.g., 30"
                />
              </div>
              <div className="offers-form-group">
                <label className="offers-form-label">Expiry Threshold (Days) *</label>
                <input
                  type="number"
                  name="expiryThreshold"
                  value={flashSaleData.expiryThreshold}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  max="365"
                  required
                />
              </div>
            </>
          )}

          {(flashSaleData.flashSaleType === 'clearance' || flashSaleData.flashSaleType === 'seasonal' || flashSaleData.flashSaleType === 'hourly') && (
            <div className="offers-form-group">
              <label className="offers-form-label">Discount Percentage *</label>
              <input
                type="number"
                name="discountValue"
                value={flashSaleData.discountValue}
                onChange={handleFlashSaleInputChange}
                className="offers-form-input"
                min="1"
                max="100"
                required
              />
            </div>
          )}

          {flashSaleData.flashSaleType === 'limited_stock' && (
            <>
              <div className="offers-form-group">
                <label className="offers-form-label">Discount Percentage *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={flashSaleData.discountValue}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div className="offers-form-group">
                <label className="offers-form-label">Stock Limit</label>
                <input
                  type="number"
                  name="stockLimit"
                  value={flashSaleData.stockLimit}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  placeholder="Leave empty for no limit"
                />
              </div>
            </>
          )}
        </div>

        {/* Date & Time */}
        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Start Date *</label>
            <input
              type="date"
              name="validFrom"
              value={flashSaleData.validFrom}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
          <div className="offers-form-group">
            <label className="offers-form-label">End Date *</label>
            <input
              type="date"
              name="validUntil"
              value={flashSaleData.validUntil}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
        </div>

        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={flashSaleData.startTime}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
          <div className="offers-form-group">
            <label className="offers-form-label">End Time *</label>
            <input
              type="time"
              name="endTime"
              value={flashSaleData.endTime}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
        </div>

        {/* Purchase Limit */}
        {/* <div className="offers-form-group">
          <label className="offers-form-label">Purchase Limit per Customer</label>
          <input
            type="number"
            name="purchaseLimit"
            value={flashSaleData.purchaseLimit}
            onChange={handleFlashSaleInputChange}
            className="offers-form-input"
            min="1"
            placeholder="Maximum quantity a customer can purchase"
          />
        </div> */}

        {/* Additional Fields */}
        <div className="offers-form-group">
          <label className="offers-form-label">Terms & Conditions</label>
          <textarea
            name="termsConditions"
            value={flashSaleData.termsConditions}
            onChange={handleFlashSaleInputChange}
            className="offers-form-textarea"
            rows="2"
            placeholder="Enter terms and conditions for this flash sale..."
          />
        </div>

        {/* Image Field */}
        <div className="offers-form-group">
          <label className="offers-form-label">Flash Sale Image</label>
          
          {/* Current Image Preview for Edit Mode */}
          {editingFlashSale && imagePreview && !removeImageFlag && (
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Current Image:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={imagePreview} 
                  alt="Current flash sale" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '150px', 
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}
          
          {/* New Image Upload */}
          <input
            type="file"
            name="image"
            onChange={handleFlashSaleInputChange}
            className="offers-form-file"
            accept="image/*"
          />
          
          {/* Show selected file name */}
          {flashSaleData.image instanceof File && (
            <div style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
              ✅ Selected: {flashSaleData.image.name}
            </div>
          )}
          
          {!imagePreview && !flashSaleData.image && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              No image selected
            </div>
          )}
        </div>

        <div className="offers-form-actions">
          <button 
            type="button" 
            onClick={onBack} 
            className="offers-btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="offers-btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {editingFlashSale ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingFlashSale ? 'Update Flash Sale' : 'Create Flash Sale'
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="offers-create-container">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#495057' }}>
          {editingFlashSale ? 'Edit Flash Sale' : 'Create New Flash Sale'}
        </h2>
        <p style={{ color: '#6c757d' }}>
          {editingFlashSale 
            ? 'Update your flash sale details below.' 
            : 'Fill in the details to create a new flash sale.'}
        </p>
      </div>
      
      {renderFlashSaleForm()}
    </div>
  );
}

export default CreateFlashSale;