import React, { useState, useEffect } from "react";

function CreateRegularOffer({ editingOffer, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    discountPercentage: "",
    minimumAmount: "0",
    validFrom: "",
    validUntil: "",
    description: "",
    image: null,
    category: "",
    productName: "",
    productId: "",
    offerType: "global"
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const API_BASE = "http://localhost:5000/api";
  const API_BASE_CAT = "http://localhost:5000";

  // Function to convert date to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_CAT}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('📋 Categories loaded:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch(`${API_BASE_CAT}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('📦 Products loaded:', data);
      
      // Fetch discount information for each product from offers table
      const productsWithDiscounts = await Promise.all(
        data.map(async (product) => {
          try {
            // Fetch active offers for this product
            const offersResponse = await fetch(`${API_BASE}/offers/product/${product.id}`);
            if (offersResponse.ok) {
              const offers = await offersResponse.json();
              
              // Find active product-specific offer
              const activeProductOffer = offers.find(offer => 
                offer.product_id == product.id && 
                offer.status === 'active' &&
                new Date(offer.valid_until) >= new Date()
              );
              
              if (activeProductOffer) {
                return {
                  ...product,
                  current_discount_from_history: activeProductOffer.discount_percentage,
                  current_offer_id: activeProductOffer.id
                };
              }
            }
            
            // If no product-specific offer, check if product has discount column value
            return {
              ...product,
              current_discount_from_history: product.discount || null,
              current_offer_id: null
            };
            
          } catch (error) {
            console.error(`Error fetching offers for product ${product.id}:`, error);
            return {
              ...product,
              current_discount_from_history: product.discount || null,
              current_offer_id: null
            };
          }
        })
      );
      
      setProducts(productsWithDiscounts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Function to fetch discount for a specific product
  const fetchProductDiscount = async (productId) => {
    try {
      console.log('🔍 Fetching discount for product:', productId);
      
      // First, check for active offers
      const offersResponse = await fetch(`${API_BASE}/offers/product/${productId}`);
      if (offersResponse.ok) {
        const offers = await offersResponse.json();
        console.log('🎯 Offers for product:', offers);
        
        // Find active product-specific offer
        const activeProductOffer = offers.find(offer => 
          offer.product_id == productId && 
          offer.status === 'active' &&
          new Date(offer.valid_until) >= new Date()
        );
        
        if (activeProductOffer) {
          console.log('✅ Found active offer discount:', activeProductOffer.discount_percentage);
          return activeProductOffer.discount_percentage;
        }
      }
      
      // If no active offer, check product's discount column
      const productResponse = await fetch(`${API_BASE_CAT}/products/${productId}`);
      if (productResponse.ok) {
        const product = await productResponse.json();
        console.log('📊 Product discount from column:', product.discount);
        return product.discount || '';
      }
      
      return '';
    } catch (error) {
      console.error('Error fetching product discount:', error);
      return '';
    }
  };

  const createOffer = async (offerData) => {
    const formDataToSend = new FormData();
    
    formDataToSend.append('title', offerData.title);
    formDataToSend.append('description', offerData.description);
    formDataToSend.append('discountPercentage', offerData.discountPercentage);
    formDataToSend.append('minimumAmount', offerData.minimumAmount);
    formDataToSend.append('validFrom', offerData.validFrom);
    formDataToSend.append('validUntil', offerData.validUntil);
    formDataToSend.append('offerType', offerData.offerType);
    
    if (offerData.category) {
      formDataToSend.append('category', offerData.category);
      
      // Find and append category name
      const selectedCategory = categories.find(cat => cat.id == offerData.category);
      if (selectedCategory) {
        formDataToSend.append('categoryName', selectedCategory.category_name);
      }
    }
    
    if (offerData.productName) {
      formDataToSend.append('productName', offerData.productName);
    }
    
    if (offerData.productId) {
      formDataToSend.append('productId', offerData.productId);
    }
    
    if (offerData.image) {
      formDataToSend.append('image', offerData.image);
    }

    console.log('📤 Sending offer data with offerType:', offerData.offerType);

    try {
      const response = await fetch(`${API_BASE}/offers`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  };

  const updateOffer = async (id, offerData, shouldRemoveImage = false) => {
    const formDataToSend = new FormData();
    
    formDataToSend.append('title', offerData.title);
    formDataToSend.append('description', offerData.description);
    formDataToSend.append('discountPercentage', offerData.discountPercentage);
    formDataToSend.append('minimumAmount', offerData.minimumAmount);
    formDataToSend.append('validFrom', offerData.validFrom);
    formDataToSend.append('validUntil', offerData.validUntil);
    formDataToSend.append('offerType', offerData.offerType);
    formDataToSend.append('status', offerData.status);
    
    if (shouldRemoveImage) {
      formDataToSend.append('removeImage', 'true');
    }
    
    if (offerData.category) {
      formDataToSend.append('category', offerData.category);
      
      // Find and append category name
      const selectedCategory = categories.find(cat => cat.id == offerData.category);
      if (selectedCategory) {
        formDataToSend.append('categoryName', selectedCategory.category_name);
      }
    }
    
    if (offerData.productName) {
      formDataToSend.append('productName', offerData.productName);
    }
    
    if (offerData.productId) {
      formDataToSend.append('productId', offerData.productId);
    }
    
    if (offerData.image) {
      formDataToSend.append('image', offerData.image);
    }

    console.log('📤 Updating offer data with offerType:', offerData.offerType);

    try {
      const response = await fetch(`${API_BASE}/offers/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (editingOffer) {
      const formattedValidFrom = formatDateForInput(editingOffer.valid_from);
      const formattedValidUntil = formatDateForInput(editingOffer.valid_until);
      
      console.log('Editing offer:', editingOffer);
      console.log('Formatted dates:', {
        validFrom: formattedValidFrom,
        validUntil: formattedValidUntil
      });

      setFormData({
        title: editingOffer.title,
        discountPercentage: editingOffer.discount_percentage,
        minimumAmount: editingOffer.minimum_amount?.toString() || "0",
        validFrom: formattedValidFrom,
        validUntil: formattedValidUntil,
        description: editingOffer.description,
        image: null,
        category: editingOffer.category_id || "",
        productName: editingOffer.product_name || "",
        productId: editingOffer.product_id || "",
        offerType: editingOffer.offer_type
      });

      setRemoveExistingImage(false);

      if (editingOffer.offer_type === 'category' && editingOffer.category_id) {
        fetchCategories();
      } else if (editingOffer.offer_type === 'product' && editingOffer.product_id) {
        fetchProducts();
      }
    }
  }, [editingOffer]);

  useEffect(() => {
    if (formData.offerType === 'category' && categories.length === 0) {
      fetchCategories();
    } else if (formData.offerType === 'product' && products.length === 0) {
      fetchProducts();
    }
  }, [formData.offerType]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData(prev => ({ ...prev, image: files[0] }));
      if (files[0]) {
        setRemoveExistingImage(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOfferTypeChange = (type) => {
    setFormData(prev => ({ 
      ...prev, 
      offerType: type,
      category: "",
      productName: "",
      productId: "",
      discountPercentage: "" // Reset discount when changing type
    }));

    if (type === 'category' && categories.length === 0) {
      fetchCategories();
    } else if (type === 'product' && products.length === 0) {
      fetchProducts();
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    console.log('🎯 Category changed to:', selectedCategoryId);
    
    setFormData(prev => ({ 
      ...prev, 
      category: selectedCategoryId,
      productName: "",
      productId: ""
    }));
    
    if (selectedCategoryId) {
      const selectedCategory = categories.find(cat => cat.id == selectedCategoryId);
      if (selectedCategory && selectedCategory.current_discount_from_history) {
        setFormData(prev => ({ 
          ...prev, 
          discountPercentage: selectedCategory.current_discount_from_history.toString()
        }));
      }
    }
  };

  const handleProductChange = async (e) => {
    const selectedProductId = e.target.value;
    console.log('🎯 Product changed to:', selectedProductId);
    
    if (selectedProductId) {
      const selectedProduct = products.find(product => product.id == selectedProductId);
      if (selectedProduct) {
        setFormData(prev => ({ 
          ...prev, 
          productName: selectedProduct.goods_name,
          productId: selectedProduct.id,
          category: ""
        }));
        
        // Fetch and set discount percentage for the selected product
        const discount = await fetchProductDiscount(selectedProductId);
        console.log('💰 Setting discount percentage:', discount);
        
        setFormData(prev => ({ 
          ...prev, 
          discountPercentage: discount.toString()
        }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        productName: "",
        productId: "",
        discountPercentage: ""
      }));
    }
  };

  // Function to handle image removal
  const handleRemoveImage = () => {
    setRemoveExistingImage(!removeExistingImage);
    setFormData(prev => ({ ...prev, image: null }));
    
    const fileInput = document.querySelector('input[name="image"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const offerData = {
      ...formData,
      discountPercentage: parseFloat(formData.discountPercentage),
      minimumAmount: parseFloat(formData.minimumAmount) || 0,
      status: "active"
    };

    console.log('📤 Submitting offer data:', offerData);

    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, offerData, removeExistingImage);
      } else {
        await createOffer(offerData);
      }
      onSuccess();
    } catch (error) {
      alert('Error saving offer. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="offers-create-container">
      <form onSubmit={handleSubmit} className="offers-form">
        {/* Offer Type Selection */}
        <div className="offers-form-group">
          <label className="offers-form-label">Offer Type *</label>
          <div className="offers-type-selector">
            <button
              type="button"
              className={`offers-type-btn ${formData.offerType === 'global' ? 'offers-type-active' : ''}`}
              onClick={() => handleOfferTypeChange('global')}
            >
              Global Offer (All Products)
            </button>
            <button
              type="button"
              className={`offers-type-btn ${formData.offerType === 'category' ? 'offers-type-active' : ''}`}
              onClick={() => handleOfferTypeChange('category')}
            >
              Category Specific
            </button>
            <button
              type="button"
              className={`offers-type-btn ${formData.offerType === 'product' ? 'offers-type-active' : ''}`}
              onClick={() => handleOfferTypeChange('product')}
            >
              Product Specific
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="offers-form-group">
          <label className="offers-form-label">Offer Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="offers-form-input"
            required
            placeholder="Enter offer title"
          />
        </div>

        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Discount Percentage *</label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
              max="100"
              step="0.01"
              required
              placeholder="e.g., 15.5"
            />
            {formData.offerType === 'product' && formData.productId && formData.discountPercentage && (
              <div className="offers-discount-info">
                <small>
                  💡 Discount fetched from product: {formData.discountPercentage}%
                  {formData.discountPercentage === '0' || formData.discountPercentage === '0.00' ? 
                    ' (No active discount)' : ' (Current discount)'
                  }
                </small>
              </div>
            )}
          </div>
          
          <div className="offers-form-group">
            <label className="offers-form-label">Minimum Amount (₹)</label>
            <input
              type="number"
              name="minimumAmount"
              value={formData.minimumAmount}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
              step="0.01"
              placeholder="Default: 0"
            />
          </div>
        </div>

        {/* Category Specific Fields */}
        {formData.offerType === 'category' && (
          <div className="offers-form-group">
            <label className="offers-form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="offers-form-select"
              required
              disabled={categoriesLoading}
            >
              <option value="">Select Category</option>
              {categoriesLoading ? (
                <option value="" disabled>Loading categories...</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name} 
                    {cat.current_discount_from_history ? 
                      ` (Current Discount: ${cat.current_discount_from_history}%)` : 
                      ' (No active discount)'
                    }
                  </option>
                ))
              )}
            </select>
            {categoriesLoading && (
              <div className="offers-loading-small">Loading categories...</div>
            )}
          </div>
        )}

        {/* Product Specific Fields */}
        {formData.offerType === 'product' && (
          <div className="offers-form-group">
            <label className="offers-form-label">Product *</label>
            <select
              name="product"
              value={formData.productId}
              onChange={handleProductChange}
              className="offers-form-select"
              required
              disabled={productsLoading}
            >
              <option value="">Select Product</option>
              {productsLoading ? (
                <option value="" disabled>Loading products...</option>
              ) : (
                products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.goods_name} (ID: {product.id})
                    {/* {product.current_discount_from_history ? 
                      ` - Current Discount: ${product.current_discount_from_history}%` : 
                      ' - No discount'
                    } */}
                  </option>
                ))
              )}
            </select>
            {productsLoading && (
              <div className="offers-loading-small">Loading products...</div>
            )}
            {formData.productId && (
              <div className="offers-selected-info">
                <small>Selected Product: {formData.productName}</small>
              </div>
            )}
          </div>
        )}

        {/* Validity Period */}
        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Valid From *</label>
            <input
              type="date"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleInputChange}
              className="offers-form-input"
              required
            />
          </div>
          
          <div className="offers-form-group">
            <label className="offers-form-label">Valid Until *</label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleInputChange}
              className="offers-form-input"
              required
            />
          </div>
        </div>

        {/* Additional Fields */}
        <div className="offers-form-group">
          <label className="offers-form-label">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="offers-form-textarea"
            rows="3"
            required
            placeholder="Describe the offer details..."
          />
        </div>

        <div className="offers-form-group">
          <label className="offers-form-label">Offer Image</label>
          <input
            type="file"
            name="image"
            onChange={handleInputChange}
            className="offers-form-file"
            accept="image/*"
          />
          
          {editingOffer && editingOffer.image_url && !removeExistingImage && (
            <div className="offers-current-image">
              <p>Current Image:</p>
              <img 
                src={`http://localhost:5000${editingOffer.image_url}`} 
                alt="Current offer" 
                className="offers-image-preview"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="offers-btn-remove-image"
              >
                ✕ Remove Current Image
              </button>
            </div>
          )}
          
          {editingOffer && removeExistingImage && (
            <div className="offers-image-removed">
              <p>🗑️ Current image will be removed when you update the offer.</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="offers-btn-undo-remove"
              >
                ↶ Undo Remove
              </button>
            </div>
          )}
        </div>

        <div className="offers-form-actions">
          <button type="button" onClick={onBack} className="offers-btn-cancel">
            Cancel
          </button>
          <button type="submit" className="offers-btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRegularOffer;