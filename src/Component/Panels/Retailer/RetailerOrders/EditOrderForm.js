
import React, { useState, useEffect } from "react";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./EditOrderForm.css";

function EditOrderForm({ order, onUpdateOrder, onCancel }) {
  const [formData, setFormData] = useState({
    category: "",
    product: "",
    quantity: "",
    price: "",
    basePrice: "0",
    gstAmount: "0",
    totalPrice: "0",
    gstRate: "0",
    taxType: "exclusive", // exclusive, inclusive, or non-taxable
    status: "pending"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchLoading(true);
        setError("");
        
        const response = await fetch(`${baseurl}/api/categories`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
        }
        
        const categoriesData = await response.json();
        
        if (!Array.isArray(categoriesData)) {
          throw new Error('Invalid data format received from server');
        }
        
        setCategories(categoriesData);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(`Failed to load categories: ${error.message}`);
        setCategories([]);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize form with order data and fetch products
  useEffect(() => {
    if (order && categories.length > 0) {
      console.log('Initializing form with order:', order);
      
      // Find the category from order data
      const orderCategory = categories.find(cat => 
        cat.category_name === order.category || cat.id === order.category_id
      );
      
      const initialCategoryId = orderCategory ? orderCategory.id.toString() : "";
      setSelectedCategoryId(initialCategoryId);
      
      // Initialize form with existing order data including GST fields
      setFormData({
        category: initialCategoryId,
        product: order.product_id ? order.product_id.toString() : order.product,
        quantity: order.quantity?.toString() || "",
        price: order.price?.toString() || "",
        basePrice: order.basePrice?.toString() || "0",
        gstAmount: order.gst_amount?.toString() || "0",
        totalPrice: order.totalPrice?.toString() || "0",
        gstRate: order.gst_rate?.toString() || "0",
        taxType: order.tax_type || "exclusive",
        status: order.status || "pending"
      });

      // Fetch products for the initial category
      if (initialCategoryId) {
        fetchProductsByCategory(initialCategoryId, order.product_id);
      }
    }
  }, [order, categories]);

  // Fetch products when category changes
  const fetchProductsByCategory = async (categoryId, selectedProductId = null) => {
    if (!categoryId) {
      setProducts([]);
      return;
    }

    try {
      setProductsLoading(true);
      
      const response = await fetch(`${baseurl}/api/categories/${categoryId}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }
      
      const productsData = await response.json();
      
      if (!Array.isArray(productsData)) {
        throw new Error('Invalid products data format received from server');
      }
      
      setProducts(productsData);
      
      // If we have a selected product ID, ensure it's in the products list
      if (selectedProductId && !productsData.find(p => p.id.toString() === selectedProductId.toString())) {
        setProducts(prev => [
          ...prev,
          {
            id: selectedProductId,
            goods_name: order.product,
            price: order.price,
            unit: order.unit,
            inclusive_gst: order.taxType === "inclusive" ? 1 : 0,
            non_taxable: order.taxType === "non-taxable" ? 1 : 0,
            gst_rate: order.gst_rate || 0
          }
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const calculateGST = (quantity, price, gstRate, inclusiveGST, nonTaxable) => {
    const qty = parseFloat(quantity) || 0;
    const rate = parseFloat(gstRate) || 0;
    const unitPrice = parseFloat(price) || 0;
    
    if (nonTaxable) {
      const baseAmount = unitPrice * qty;
      return {
        basePrice: baseAmount.toFixed(2),
        gstAmount: "0.00",
        totalPrice: baseAmount.toFixed(2)
      };
    }
    
    if (inclusiveGST) {
      // Price includes GST
      const totalAmount = unitPrice * qty;
      const baseAmount = totalAmount / (1 + rate / 100);
      const gstAmount = totalAmount - baseAmount;
      
      return {
        basePrice: baseAmount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalPrice: totalAmount.toFixed(2)
      };
    } else {
      // Price excludes GST
      const baseAmount = unitPrice * qty;
      const gstAmount = baseAmount * (rate / 100);
      const totalAmount = baseAmount + gstAmount;
      
      return {
        basePrice: baseAmount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalPrice: totalAmount.toFixed(2)
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let newFormData = { ...prev, [name]: value };
      
      // Reset product and price when category changes
      if (name === "category") {
        setSelectedCategoryId(value);
        
        newFormData = {
          ...newFormData,
          product: "",
          price: "",
          basePrice: "0",
          gstAmount: "0",
          totalPrice: "0",
          gstRate: "0",
          taxType: "exclusive"
        };
        
        // Fetch products for the new category
        if (value) {
          fetchProductsByCategory(value);
        } else {
          setProducts([]);
        }
      }
      
      // Auto-fill price and GST details when product is selected
      if (name === "product") {
        const selectedProduct = products.find(prod => prod.id.toString() === value);
        if (selectedProduct) {
          const price = selectedProduct.price_display || selectedProduct.price;
          const gstRate = selectedProduct.gst_rate || "0";
          const inclusiveGST = selectedProduct.inclusive_gst === 1;
          const nonTaxable = selectedProduct.non_taxable === 1;
          
          let taxType = "exclusive";
          if (nonTaxable) {
            taxType = "non-taxable";
          } else if (inclusiveGST) {
            taxType = "inclusive";
          }
          
          const quantity = prev.quantity || "1";
          const calculations = calculateGST(quantity, price, gstRate, inclusiveGST, nonTaxable);
          
          newFormData = {
            ...newFormData,
            price: price || "",
            gstRate,
            taxType,
            ...calculations
          };
        } else {
          newFormData = {
            ...newFormData,
            price: "",
            gstRate: "0",
            taxType: "exclusive",
            basePrice: "0",
            gstAmount: "0",
            totalPrice: "0"
          };
        }
      }
      
      // Calculate GST when quantity or price changes
      if (name === "quantity" || name === "price") {
        const quantity = name === "quantity" ? value : prev.quantity;
        const price = name === "price" ? value : prev.price;
        const gstRate = prev.gstRate || "0";
        const taxType = prev.taxType || "exclusive";
        
        const inclusiveGST = taxType === "inclusive";
        const nonTaxable = taxType === "non-taxable";
        
        const calculations = calculateGST(quantity, price, gstRate, inclusiveGST, nonTaxable);
        
        newFormData = {
          ...newFormData,
          ...calculations
        };
      }
      
      return newFormData;
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Validate form data
    if (!formData.category || !formData.product || !formData.quantity || !formData.price) {
      throw new Error("Please fill in all required fields");
    }

    if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.price) <= 0) {
      throw new Error("Quantity and price must be greater than 0");
    }

    // Find the selected category and product
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
    const selectedProduct = products.find(prod => prod.id.toString() === formData.product);

    // Prepare update data with correct field names
    const updateData = {
      category: selectedCategory ? selectedCategory.category_name : formData.category,
      product: selectedProduct ? selectedProduct.goods_name : formData.product,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      totalPrice: parseFloat(formData.totalPrice),
      status: formData.status,
      // GST and ID fields
      basePrice: parseFloat(formData.basePrice),
      gstAmount: parseFloat(formData.gstAmount),
      gstRate: parseFloat(formData.gstRate),
      taxType: formData.taxType, // Make sure this matches backend
      category_id: selectedCategory ? selectedCategory.id : null,
      product_id: selectedProduct ? selectedProduct.id : null
    };

    console.log('Sending update request:', {
      url: `${baseurl}/api/orders/${order.id}`,
      data: updateData
    });

    const response = await fetch(`${baseurl}/api/orders/${order.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    // Handle response once
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || `HTTP ${response.status}: Failed to update order`);
    }

    console.log('Update successful:', data);
    
    // Call the parent callback with the updated order
    onUpdateOrder(data);
    alert('Order updated successfully!');

  } catch (error) {
    console.error('Error updating order:', error);
    setError(`Failed to update order: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const statusOptions = ["pending", "processing", "completed", "cancelled"];

  // Get the selected product details for display
  const selectedProduct = products.find(prod => prod.id.toString() === formData.product);
  const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);

  const getTaxTypeLabel = (taxType) => {
    switch (taxType) {
      case "inclusive": return "GST Inclusive";
      case "exclusive": return "GST Exclusive";
      case "non-taxable": return "Non-Taxable";
      default: return "GST Exclusive";
    }
  };

  return (
    <div className="edit-order-form-overlay">
      <div className="edit-order-form">
        <div className="form-header">
          <h2>Edit Order #{order?.id}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={loading || fetchLoading}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {fetchLoading && <div className="loading-text">Loading categories...</div>}
          </div>

          <div className="form-group">
            <label>Product *</label>
            <select
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              required
              disabled={!formData.category || loading || productsLoading}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.goods_name} 
                  {product.price_display && ` - $${product.price_display}`}
                  {product.balance_stock !== null && ` (Stock: ${product.balance_stock})`}
                  {product.inclusive_gst === 1 && ` [GST Inclusive]`}
                  {product.non_taxable === 1 && ` [Non-Taxable]`}
                </option>
              ))}
            </select>
            {productsLoading && <div className="loading-text">Loading products...</div>}
            {!productsLoading && formData.category && products.length === 0 && (
              <div className="loading-text">No products available for this category</div>
            )}
          </div>

          {selectedProduct && (
            <div className="product-info">
              <div className="info-item">
                <span>Current Price:</span>
                <span>${selectedProduct.price}</span>
              </div>
              {selectedProduct.balance_stock !== null && (
                <div className="info-item">
                  <span>Available Stock:</span>
                  <span>{selectedProduct.balance_stock} {selectedProduct.unit || 'pcs'}</span>
                </div>
              )}
              <div className="info-item">
                <span>Tax Type:</span>
                <span>
                  {selectedProduct.non_taxable === 1 ? 'Non-Taxable' : 
                   selectedProduct.inclusive_gst === 1 ? 'GST Inclusive' : 'GST Exclusive'}
                </span>
              </div>
              {selectedProduct.gst_rate > 0 && (
                <div className="info-item">
                  <span>GST Rate:</span>
                  <span>{selectedProduct.gst_rate}%</span>
                </div>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                placeholder="0"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Unit Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="price-breakdown">
            <div className="form-group">
              <label>Tax Type:</label>
              <input
                type="text"
                value={getTaxTypeLabel(formData.taxType)}
                disabled
                className="tax-type-input"
              />
            </div>

            <div className="form-group">
              <label>GST Rate:</label>
              <input
                type="text"
                value={`${formData.gstRate}%`}
                disabled
                className="gst-rate-input"
              />
            </div>

            <div className="form-group">
              <label>Base Amount:</label>
              <input
                type="text"
                value={`$${formData.basePrice}`}
                disabled
                className="base-price-input"
              />
            </div>

            <div className="form-group">
              <label>GST Amount:</label>
              <input
                type="text"
                value={`$${formData.gstAmount}`}
                disabled
                className="gst-amount-input"
              />
            </div>

            <div className="form-group">
              <label>Total Price:</label>
              <input
                type="text"
                value={`$${formData.totalPrice}`}
                disabled
                className="total-price-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="update-btn"
              disabled={loading || fetchLoading}
            >
              {loading ? "Updating..." : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditOrderForm;