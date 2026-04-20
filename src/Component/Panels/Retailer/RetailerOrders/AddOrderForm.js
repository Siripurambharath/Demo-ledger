
import React, { useState, useEffect } from "react";
import "./AddOrderForm.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function AddOrderForm({ onAddOrder, onCancel }) {
  const [formData, setFormData] = useState({
    category: "",
    product: "",
    quantity: "",
    price: "",
    basePrice: "0",
    gstAmount: "0",
    totalPrice: "0",
    gstRate: "0",
    taxType: "exclusive" // exclusive, inclusive, or non-taxable
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Fetch categories from API (keep this same as before)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchLoading(true);
        setError("");
        
        console.log('Fetching categories from:', `${baseurl}/api/categories`);
        const response = await fetch(`${baseurl}/api/categories`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const categoriesData = await response.json();
        console.log('Categories data received:', categoriesData);
        
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

  // Fetch products when category changes (keep this same as before)
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!selectedCategoryId) {
        setProducts([]);
        return;
      }

      try {
        setProductsLoading(true);
        setError("");
        
        console.log('Fetching products for category ID:', selectedCategoryId);
        const response = await fetch(`${baseurl}/api/categories/${selectedCategoryId}/products`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const productsData = await response.json();
        console.log('Products data received:', productsData);
        
        if (!Array.isArray(productsData)) {
          throw new Error('Invalid products data format received from server');
        }
        
        setProducts(productsData);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(`Failed to load products: ${error.message}`);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [selectedCategoryId]);

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
        const selectedCategory = categories.find(cat => cat.id.toString() === value);
        setSelectedCategoryId(selectedCategory ? selectedCategory.id : "");
        
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
        setProducts([]);
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

  // Update your saveOrderToDatabase function to include GST details
  const saveOrderToDatabase = async (orderData) => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('User not found in localStorage. Please log in again.');
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      if (!userId) {
        throw new Error('Invalid user ID');
      }

      const orderWithUserId = {
        ...orderData,
        user_id: userId,
        status: 'pending',
        base_price: parseFloat(orderData.basePrice),
        gst_amount: parseFloat(orderData.gstAmount),
        gst_rate: parseFloat(orderData.gstRate),
        tax_type: orderData.taxType
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${baseurl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderWithUserId),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        }
        
        throw new Error(errorMessage);
      }

      const savedOrder = await response.json();
      return savedOrder;

    } catch (error) {
      console.error('Error saving order:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server is not responding');
      } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error - cannot connect to server. Check your connection and CORS settings.');
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.category || !formData.product || !formData.quantity || !formData.price) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const selectedProduct = products.find(prod => prod.id.toString() === formData.product);
      const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);

     const newOrder = {
  category: selectedCategory ? selectedCategory.category_name : formData.category,
  category_id: formData.category,  // This is the category ID
  product: selectedProduct ? selectedProduct.goods_name : formData.product,
  product_id: selectedProduct ? selectedProduct.id : null,  // This is the product ID
  quantity: parseInt(formData.quantity),
  price: parseFloat(formData.price),
  basePrice: parseFloat(formData.basePrice),
  gstAmount: parseFloat(formData.gstAmount),
  totalPrice: parseFloat(formData.totalPrice),
  gstRate: parseFloat(formData.gstRate),
  taxType: formData.taxType,
  date: new Date().toISOString().split('T')[0],
  unit: selectedProduct ? selectedProduct.unit : null,
  group_by: selectedProduct ? selectedProduct.group_by : 'salescatalog'
};

      const savedOrder = await saveOrderToDatabase(newOrder);
      onAddOrder(savedOrder);
      
      // Reset form
      setFormData({
        category: "",
        product: "",
        quantity: "",
        price: "",
        basePrice: "0",
        gstAmount: "0",
        totalPrice: "0",
        gstRate: "0",
        taxType: "exclusive"
      });
      setSelectedCategoryId("");
      setProducts([]);
      setError("");

    } catch (error) {
      console.error('Submit error:', error);
      setError(`Error saving order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      category: "",
      product: "",
      quantity: "",
      price: "",
      basePrice: "0",
      gstAmount: "0",
      totalPrice: "0",
      gstRate: "0",
      taxType: "exclusive"
    });
    setSelectedCategoryId("");
    setProducts([]);
    setError("");
    onCancel();
  };

  const getTaxTypeLabel = (taxType) => {
    switch (taxType) {
      case "inclusive": return "GST Inclusive";
      case "exclusive": return "GST Exclusive";
      case "non-taxable": return "Non-Taxable";
      default: return "GST Exclusive";
    }
  };

  return (
    <div className="form-overlay">
      <div className="order-form-container">
        <h2>Add New Order</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>Category:</label>
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
            {!fetchLoading && categories.length === 0 && !error && (
              <div className="loading-text">No categories available</div>
            )}
          </div>

          <div className="form-group">
            <label>Product:</label>
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
                  {product.price_display && ` - ₹${product.price_display}`}
                  {product.balance_stock !== null && ` (Stock: ${product.balance_stock} ${product.unit || 'pcs'})`}
                  {product.inclusive_gst === 1 && ` [GST Inclusive]`}
                  {product.non_taxable === 1 && ` [Non-Taxable]`}
                </option>
              ))}
            </select>
            {productsLoading && <div className="loading-text">Loading products...</div>}
            {!productsLoading && formData.category && products.length === 0 && !error && (
              <div className="loading-text">No products available for this category</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Unit Price (₹):</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
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
                value={`₹${formData.basePrice}`}
                disabled
                className="base-price-input"
              />
            </div>

            <div className="form-group">
              <label>GST Amount:</label>
              <input
                type="text"
                value={`₹${formData.gstAmount}`}
                disabled
                className="gst-amount-input"
              />
            </div>

            <div className="form-group">
              <label>Total Price:</label>
              <input
                type="text"
                value={`₹${formData.totalPrice}`}
                disabled
                className="total-price-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || fetchLoading}
            >
              {loading ? 'Saving...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddOrderForm;