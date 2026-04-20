import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./CheckOut.css";
import axios from "axios";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    retailerId,
    customerName,
    displayName,
    discount,
    cartItems: initialCartItems,
    staffId: initialStaffId,
    userRole,
    totals: initialTotals,
    orderTotals: initialOrderTotals,
    userDiscountPercentage,
    creditPeriods,
    isEditMode = false,
    editOrderNumber,
    editItemId,
    originalItemData,
    calculationParams = {}
  } = location.state || {};

  const discountPercentage = discount || userDiscountPercentage || 0;

  console.log("Checkout Mode:", isEditMode ? "Edit Mode" : "New Order");
  console.log("Edit Order Number:", editOrderNumber);
  console.log("Edit Item ID:", editItemId);
  console.log("Original Item Data:", originalItemData);
  console.log("Calculation Params:", calculationParams);

  const [assignedStaffInfo, setAssignedStaffInfo] = useState({ id: null, name: null });
  const [retailerDetails, setRetailerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderMode, setOrderMode] = useState(isEditMode ? 'KACHA' : 'KACHA');
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  
  // Safe initialization of orderTotals with defaults
  const [orderTotals, setOrderTotals] = useState(() => {
    if (initialOrderTotals && typeof initialOrderTotals === 'object') {
      return {
        subtotal: initialOrderTotals.subtotal || 0,
        totalTax: initialOrderTotals.totalTax || 0,
        totalDiscount: initialOrderTotals.totalDiscount || 0,
        totalTaxableAmount: initialOrderTotals.totalTaxableAmount || 0,
        totalCreditCharges: initialOrderTotals.totalCreditCharges || 0,
        finalTotal: initialOrderTotals.finalTotal || 0,
        itemCount: initialOrderTotals.itemCount || 0,
        userDiscount: initialOrderTotals.userDiscount || discountPercentage
      };
    }
    
    if (initialTotals && typeof initialTotals === 'object') {
      return {
        subtotal: initialTotals.subtotal || 0,
        totalTax: initialTotals.totalTax || 0,
        totalDiscount: initialTotals.totalDiscount || 0,
        totalTaxableAmount: initialTotals.totalTaxableAmount || 0,
        totalCreditCharges: initialTotals.totalCreditCharges || 0,
        finalTotal: initialTotals.finalTotal || 0,
        itemCount: initialTotals.itemCount || 0,
        userDiscount: initialTotals.userDiscount || discountPercentage
      };
    }
    
    return {
      subtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      totalTaxableAmount: 0,
      totalCreditCharges: 0,
      finalTotal: 0,
      itemCount: cartItems.length || 0,
      userDiscount: discountPercentage
    };
  });
  
  const [retailerInfo, setRetailerInfo] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [editedPrice, setEditedPrice] = useState(() => {
    if (initialCartItems && initialCartItems.length > 0) {
      return initialCartItems[0].edited_sale_price || initialCartItems[0].sale_price || 0;
    }
    return 0;
  });

  // Helper function to safely format numbers
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return numValue.toLocaleString('en-IN');
  };

    // ✅ Clear all cart items for a retailer after order is placed
  const clearCartAfterOrder = async (retailerIdToClear) => {
    try {
      const cartResponse = await fetch(`${baseurl}/api/cart/customer-cart/${retailerIdToClear}`);
      if (!cartResponse.ok) return;
      const items = await cartResponse.json();
      if (!Array.isArray(items) || items.length === 0) return;

      await Promise.all(
        items.map(item =>
          fetch(`${baseurl}/api/cart/remove-cart-item/${item.id}`, { method: "DELETE" })
        )
      );
      console.log("Cart cleared successfully for retailer:", retailerIdToClear);
    } catch (err) {
      console.error("Error clearing cart after order:", err);
    }
  };

  // NEW: Function to recalculate all values based on edited price
  const recalculateAllValues = (newPrice) => {
    if (!cartItems.length) return { updatedCartItems: cartItems, updatedOrderTotals: orderTotals };

    const item = cartItems[0];
    const discountPercentage = calculationParams.discountPercentage || item.discount_percentage || 0;
    const gstPercentage = calculationParams.gstPercentage || item.tax_percentage || 18;
    const creditPercentage = calculationParams.creditPercentage || item.credit_percentage || 2;
    const quantity = calculationParams.quantity || item.quantity || 1;
    const creditPeriod = item.credit_period || 0;

    console.log("Recalculating with:", {
      newPrice,
      discountPercentage,
      gstPercentage,
      creditPercentage,
      quantity,
      creditPeriod
    });

    // 1. Edited price is the taxable amount (base price)
    const taxableAmount = parseFloat(newPrice) || 0;
    
    // 2. Calculate discount on taxable amount
    const discountAmount = taxableAmount * (discountPercentage / 100);
    
    // 3. Price after discount (for reference, not used in final calculation)
    const priceAfterDiscount = taxableAmount - discountAmount;
    
    // 4. Calculate GST on taxable amount (not on discounted amount)
    const taxAmount = taxableAmount * (gstPercentage / 100);
    
    // 5. Split GST into SGST and CGST (equal split)
    const sgstPercentage = gstPercentage / 2;
    const cgstPercentage = gstPercentage / 2;
    const sgstAmount = taxAmount / 2;
    const cgstAmount = taxAmount / 2;
    
    // 6. Calculate credit charge on taxable amount
    let creditCharge = 0;
    if (creditPeriod > 0) {
      creditCharge = (taxableAmount * creditPercentage * creditPeriod) / (30 * 100);
    }
    
    // 7. Calculate final amount: taxable amount + GST + credit charge
    const finalAmount = taxableAmount + taxAmount + creditCharge;
    
    // 8. Customer sale price is the final amount per unit
    const customerSalePrice = finalAmount;
    
    // 9. Calculate totals for all quantities
    const itemTotal = finalAmount * quantity;
    const totalDiscount = discountAmount * quantity;
    const totalTax = taxAmount * quantity;
    const totalTaxableAmount = taxableAmount * quantity;
    const totalCreditCharges = creditCharge * quantity;
    const finalTotal = itemTotal;

    console.log("Calculation results:", {
      taxableAmount,
      discountAmount,
      taxAmount,
      creditCharge,
      finalAmount,
      customerSalePrice,
      itemTotal
    });

    // Update cart item with recalculated values
    const updatedCartItems = cartItems.map(item => ({
      ...item,
      edited_sale_price: taxableAmount, // This is the edited price (taxable amount)
      customer_sale_price: customerSalePrice,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      tax_amount: taxAmount,
      sgst_percentage: sgstPercentage,
      sgst_amount: sgstAmount,
      cgst_percentage: cgstPercentage,
      cgst_amount: cgstAmount,
      credit_charge: creditCharge,
      final_amount: finalAmount,
      item_total: finalAmount,
      total_amount: finalAmount * quantity,
      
      breakdown: {
        perUnit: {
          mrp: item.mrp || 0,
          sale_price: item.sale_price || 0,
          edited_sale_price: taxableAmount,
          credit_charge: creditCharge,
          credit_percentage: creditPercentage,
          customer_sale_price: customerSalePrice,
          discount_percentage: discountPercentage,
          discount_amount: discountAmount,
          taxable_amount: taxableAmount,
          tax_percentage: gstPercentage,
          tax_amount: taxAmount,
          sgst_percentage: sgstPercentage,
          sgst_amount: sgstAmount,
          cgst_percentage: cgstPercentage,
          cgst_amount: cgstAmount,
          final_amount: finalAmount,
          item_total: finalAmount
        }
      }
    }));

    // Update order totals
    const updatedOrderTotals = {
      subtotal: itemTotal || 0,
      totalTax: totalTax || 0,
      totalDiscount: totalDiscount || 0,
      totalTaxableAmount: totalTaxableAmount || 0,
      totalCreditCharges: totalCreditCharges || 0,
      finalTotal: finalTotal || 0,
      itemCount: quantity || 1,
      userDiscount: discountPercentage || 0
    };

    console.log("Recalculated values:", {
      updatedCartItems,
      updatedOrderTotals
    });

    return { updatedCartItems, updatedOrderTotals };
  };

  // Handle price change
  const handlePriceChange = (newPrice) => {
    setEditedPrice(newPrice);
    
    if (cartItems.length > 0) {
      const { updatedCartItems, updatedOrderTotals } = recalculateAllValues(newPrice);
      setCartItems(updatedCartItems);
      setOrderTotals(updatedOrderTotals);
    }
  };

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  useEffect(() => {
    const getStaffInfo = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        try {
          const user = JSON.parse(storedData);
          console.log("Logged in user:", user);
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    };
    getStaffInfo();
  }, []);

  useEffect(() => {
    const fetchRetailerDetails = async () => {
      if (!retailerId) return;

      try {
        const res = await fetch(`${baseurl}/accounts/${retailerId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Retailer Details:", data);
          setRetailerDetails(data);
        } else {
          console.warn("Failed to fetch retailer details");
        }
      } catch (err) {
        console.error("Error fetching retailer:", err);
      }
    };

    fetchRetailerDetails();
  }, [retailerId]);

  useEffect(() => {
    if (!retailerId) return;

    const fetchRetailerInfo = async () => {
      try {
        const storedData = localStorage.getItem("user");
        const user = storedData ? JSON.parse(storedData) : null;
        const staffId = user?.id || null;

        if (staffId) {
          const response = await fetch(`${baseurl}/get-sales-retailers/${staffId}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success && Array.isArray(result.data)) {
            const retailer = result.data.find(r => r.id === parseInt(retailerId));
            if (retailer) {
              setRetailerInfo({
                name: retailer.name,
                business: retailer.business_name,
                location: retailer.shipping_city,
                discount: retailer.discount || 0,
                displayName: displayName || retailer.display_name || ""
              });
            }
          }
        } else {
          setRetailerInfo({
            name: customerName,
            discount: discount,
            displayName: displayName || ""
          });
        }
      } catch (err) {
        console.error("Error fetching retailer info:", err);
        setRetailerInfo({
          name: customerName,
          discount: discount,
          displayName: displayName || ""
        });
      }
    };

    fetchRetailerInfo();
  }, [retailerId, customerName, displayName, discount]);

  useEffect(() => {
    if (!retailerId) return;

    const fetchAssignedStaffInfo = async () => {
      try {
        const response = await fetch(`${baseurl}/accounts/${retailerId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result) {
          setAssignedStaffInfo({
            id: result.staffid,
            name: result.assigned_staff
          });
        }
      } catch (err) {
        console.error("Error fetching assigned staff info:", err);
        setAssignedStaffInfo({
          id: initialStaffId,
          name: "Staff"
        });
      }
    };

    fetchAssignedStaffInfo();
  }, [retailerId, initialStaffId, baseurl]);

  // NEW: Function to update item price with all calculations
  const handleUpdateItemPrice = async () => {
    if (cartItems.length === 0 || !editItemId || !editOrderNumber) {
      alert("No item to update or missing edit information");
      return;
    }

    const cartItem = cartItems[0];
    const newEditedPrice = parseFloat(editedPrice) || 0;
    const minSalePrice = cartItem.min_sale_price || 0;

    // Validate that edited price is at least minimum sale price
    if (newEditedPrice < minSalePrice) {
      alert(`Edited price (₹${newEditedPrice}) cannot be less than minimum sale price (₹${minSalePrice})`);
      return;
    }

    setIsUpdatingItem(true);

    try {
      // Prepare all updated values for the API call
      const updatedItemData = {
        edited_sale_price: cartItem.edited_sale_price || 0,
        customer_sale_price: cartItem.customer_sale_price || 0,
        discount_amount: cartItem.discount_amount || 0,
        taxable_amount: cartItem.taxable_amount || 0,
        tax_amount: cartItem.tax_amount || 0,
        sgst_percentage: cartItem.sgst_percentage || 0,
        sgst_amount: cartItem.sgst_amount || 0,
        cgst_percentage: cartItem.cgst_percentage || 0,
        cgst_amount: cartItem.cgst_amount || 0,
        credit_charge: cartItem.credit_charge || 0,
        final_amount: cartItem.final_amount || 0,
        item_total: cartItem.final_amount || 0, // per unit
        total_amount: (cartItem.final_amount || 0) * (cartItem.quantity || 1) // total for all quantities
      };

      console.log("Updating item with complete data:", {
        itemId: editItemId,
        orderNumber: editOrderNumber,
        updatedItemData
      });

      // Call API to update item with all fields
      const response = await axios.put(
        `${baseurl}/orders/items/${editItemId}/update-price`,
        {
          order_number: editOrderNumber,
          ...updatedItemData
        }
      );

      if (response.data.success) {
        alert("Item price updated successfully with all calculations!");
        
        // Show success message
        setOrderDetails({
          orderNumber: editOrderNumber,
          customerName: customerName || retailerDetails?.name || "Customer",
          itemName: cartItem.item_name,
          newPrice: cartItem.edited_sale_price,
          discount: cartItem.discount_amount,
          tax: cartItem.tax_amount,
          creditCharge: cartItem.credit_charge,
          finalAmount: cartItem.final_amount
        });
        
        setOrderPlaced(true);
        
        // Navigate back to period page after delay
        setTimeout(() => {
          navigate('/period');
        }, 2000);
      } else {
        throw new Error(response.data.error || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item price:", error);
      alert(`Failed to update item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUpdatingItem(false);
    }
  };

  // NEW: Handle place order for edit mode
  const handlePlaceOrderForEdit = async () => {
    return handleUpdateItemPrice();
  };

  // Original place order function (for new orders)
  const handlePlaceOrderForNew = async () => {
    if (!retailerId || !cartItems || cartItems.length === 0) {
      alert("Missing required information");
      return;
    }

    const storedData = localStorage.getItem("user");
    let loggedInUser = null;
    let actualStaffId = initialStaffId;
    let staffName = null;
    let assignedStaff = null;
    let staffIdFromStorage = null;

    if (storedData) {
      try {
        loggedInUser = JSON.parse(storedData);
        console.log("Logged in user data:", loggedInUser);

        staffName = loggedInUser.name || "Staff Member";
        staffIdFromStorage = loggedInUser.id;
        assignedStaff = loggedInUser.assigned_staff || loggedInUser.supervisor_name || staffName;

        if (!actualStaffId && staffIdFromStorage) {
          actualStaffId = staffIdFromStorage;
          console.log("Using staff ID from localStorage:", actualStaffId);
        }

      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    if (!actualStaffId) {
      alert("Staff ID is required. Please log in again.");
      return;
    }

    setLoading(true);

    let staffIncentive = 0;
    let assignedStaffName = "Unknown Staff";
    let staffEmail = null;

    try {
      const staffRes = await fetch(`${baseurl}/accounts/${actualStaffId}`);
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        console.log("Fetched Staff Data:", staffData);

        staffIncentive = staffData.incentive_percent || 0;
        assignedStaffName = staffData.name || "Unknown Staff";
        staffEmail = staffData.email || null;
      } else {
        console.warn("Failed to fetch staff details from backend");
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
    }

    const orderNumber = `ORD${Date.now()}`;
    const totalCreditCharges = cartItems.reduce((sum, item) => {
      const breakdown = item.breakdown?.perUnit || {};
      return sum + ((breakdown.credit_charge || 0) * (item.quantity || 1));
    }, 0);

    const orderData = {
      order: {
        order_number: orderNumber,
        customer_id: retailerId,
        customer_name: customerName || retailerDetails?.name || "Customer",
        order_total: orderTotals.totalCustomerSalePrice || orderTotals.subtotal || 0,
        discount_amount: orderTotals.totalDiscount || 0,
        taxable_amount: orderTotals.totalTaxableAmount || 0,
        tax_amount: orderTotals.totalTax || 0,
        net_payable: orderTotals.finalTotal || 0,
        credit_period: totalCreditCharges,
        estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        order_placed_by: actualStaffId,
        order_mode: orderMode,
        approval_status: "Approved",
        ordered_by: staffName,
        order_status: "Pending",
        staffid: actualStaffId,
        assigned_staff: assignedStaffName,
        staff_incentive: staffIncentive.toString(),
        staff_email: staffEmail,
        retailer_email: retailerDetails?.email || ""
      },
      orderItems: cartItems.map(item => {
        const breakdown = item.breakdown?.perUnit || {};
        const product = item.product_details || {};
        const quantity = item.quantity || 1;
        const creditCharge = breakdown.credit_charge || 0;
        const finalAmount = breakdown.final_amount || 0;

        return {
          order_number: orderNumber,
          item_name: item.item_name || product.name || `Product ${item.product_id}`,
          product_id: item.product_id,
          quantity: quantity,
          mrp: breakdown.mrp || 0,
          sale_price: breakdown.sale_price || 0,
          edited_sale_price: breakdown.edited_sale_price || 0,
           net_price: item.net_price || 0, // Add net_price from item
      weight: item.weight || null, // Add weight from item
          credit_charge: creditCharge,
          credit_period: item.credit_period || 0,
          credit_percentage: (breakdown.credit_percentage || 0).toString(),
          customer_sale_price: breakdown.customer_sale_price || 0,
          discount_percentage: (breakdown.discount_percentage || 0).toString(),
          discount_amount: breakdown.discount_amount || 0,
          item_total: breakdown.item_total || 0,
          taxable_amount: breakdown.taxable_amount || 0,
          tax_percentage: (breakdown.tax_percentage || 0).toString(),
          tax_amount: breakdown.tax_amount || 0,
          sgst_percentage: (breakdown.sgst_percentage || 0).toString(),
          sgst_amount: breakdown.sgst_amount || 0,
          cgst_percentage: (breakdown.cgst_percentage || 0).toString(),
          cgst_amount: breakdown.cgst_amount || 0,
          final_amount: finalAmount,
          total_amount: finalAmount * quantity,
          discount_applied_scheme: breakdown.discount_percentage > 0 ? 'user_discount' : 'none'
        };
      })
    };

    console.log("Sending order data:", JSON.stringify(orderData, null, 2));

    try {
      const response = await fetch(`${baseurl}/orders/create-complete-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log("Order response:", result);

      if (response.ok && result.success) {
         await clearCartAfterOrder(retailerId);
        setOrderDetails({
          orderNumber: result.order_number || orderData.order.order_number,
          orderId: result.order_id,
          amount: orderData.order.net_payable,
          customerName: customerName || retailerDetails?.name || "Customer",
          staffId: actualStaffId,
          staffName: staffName,
          date: new Date().toLocaleDateString(),
          orderMode: orderMode,
          breakdown: orderTotals
        });

        setOrderPlaced(true);

        setTimeout(() => {
          const successMessage = `
          ✅ Order Placed Successfully!
          
          Order Number: ${result.order_number || orderData.order.order_number}
          Customer: ${customerName || retailerDetails?.name || "Customer"}
          Total Amount: ₹${orderData.order.net_payable.toFixed(2)}
          Order Mode: ${orderMode}
          
          Thank you for your order!
        `;
          alert(successMessage);

          setTimeout(() => {
            navigate('/period');
          }, 2000);
        }, 500);

      } else {
        throw new Error(result.error || result.details || result.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Main place order function
  const handlePlaceOrder = () => {
    if (isEditMode) {
      handlePlaceOrderForEdit();
    } else {
      handlePlaceOrderForNew();
    }
  };

  const handleBackToCart = () => {
    if (isEditMode) {
      navigate('/period');
    } else {
      navigate("/retailers/cart", {
        state: {
          retailerId,
          customerName: retailerInfo.name,
          displayName: retailerInfo.displayName,
          discount,
          cartItems,
          staffId: initialStaffId,
          userRole,
          orderTotals,
          userDiscountPercentage: discountPercentage
        }
      });
    }
  };

  const handleBackToRetailers = () => {
    navigate("/retailers");
  };

  if (!retailerId) {
    return (
      <div className="checkout-page-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleMobile}
          />
          <div className="checkout-page-main-content">
            <div className="checkout-page">
              <div className="error-container">
                <h2>Checkout Not Found</h2>
                <p>Please select a retailer to proceed to checkout.</p>
                <button onClick={handleBackToRetailers} className="back-retailers-btn">
                  Back to Retailers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced && orderDetails) {
    const successContent = (
      <div className="checkout-page">
        <div className="order-success-container">
          <div className="success-icon">✅</div>
          <h2>{isEditMode ? "Item Updated Successfully!" : "Order Placed Successfully!"}</h2>

          <div className="order-details-card">
            <h3>{isEditMode ? "Update Details" : "Order Details"}</h3>
            {isEditMode ? (
              <>
                <div className="order-detail-row">
                  <span>Order Number:</span>
                  <strong>{editOrderNumber}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Item:</span>
                  <strong>{orderDetails.itemName}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Base Price (Taxable Amount):</span>
                  <strong>₹{formatCurrency(orderDetails.newPrice)}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Discount:</span>
                  <span>-₹{formatCurrency(orderDetails.discount)}</span>
                </div>
                <div className="order-detail-row">
                  <span>Tax (GST):</span>
                  <span>+₹{formatCurrency(orderDetails.tax)}</span>
                </div>
                {(orderDetails.creditCharge || 0) > 0 && (
                  <div className="order-detail-row">
                    <span>Credit Charge:</span>
                    <span>+₹{formatCurrency(orderDetails.creditCharge)}</span>
                  </div>
                )}
                <div className="order-detail-row total">
                  <span>Final Amount per unit:</span>
                  <strong className="total-amount">
                    ₹{formatCurrency(orderDetails.finalAmount)}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div className="order-detail-row">
                  <span>Order Number:</span>
                  <strong>{orderDetails.orderNumber}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Order Mode:</span>
                  <strong className={`order-mode-badge ${orderDetails.orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
                    {orderDetails.orderMode}
                  </strong>
                </div>
                <div className="order-detail-row">
                  <span>Customer:</span>
                  <span>{orderDetails.customerName}</span>
                </div>
                <div className="order-detail-row">
                  <span>Placed by Staff ID:</span>
                  <strong>{orderDetails.staffId}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Date:</span>
                  <span>{orderDetails.date}</span>
                </div>
                <div className="order-detail-row">
                  <span>Total Amount:</span>
                  <strong className="total-amount">
                    ₹{formatCurrency(orderDetails.amount)}
                  </strong>
                </div>
              </>
            )}
          </div>

          <div className="order-actions">
            <button onClick={() => navigate('/period')} className="new-order-btn">
              Back to Period
            </button>
          </div>
        </div>
      </div>
    );

    if (isMobileView) {
      return successContent;
    } else {
      return (
        <div className="checkout-page-wrapper">
          <AdminSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            onToggleMobile={isMobileOpen}
          />
          <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
            <AdminHeader
              isCollapsed={isCollapsed}
              onToggleSidebar={handleToggleMobile}
            />
            <div className="checkout-page-main-content">
              {successContent}
            </div>
          </div>
        </div>
      );
    }
  }

  const mainContent = (
    <div className="checkout-page">
      {!isMobileView && (
        <div className="checkout-desktop-header">
          <div className="desktop-header-content">
            <div className="desktop-header-left">
              <button
                className="desktop-back-btn"
                onClick={handleBackToCart}
              >
                ← {isEditMode ? "Back to Period" : "Back to Cart"}
              </button>
              <div className="desktop-header-text">
                <h1>
                  {isEditMode ? "Edit Item Price" : "Checkout"}
                  {retailerInfo.displayName && <span className="display-name-header"> for {retailerInfo.displayName}</span>}
                </h1>
                {retailerInfo.name && (
                  <div className="desktop-customer-info">
                    <div className="customer-details">
                      <p className="customer-name">Customer: <strong>{retailerInfo.name}</strong></p>
                      {retailerInfo.displayName && (
                        <p className="customer-display-name">Display Name: <strong>{retailerInfo.displayName}</strong></p>
                      )}
                      {retailerInfo.business && (
                        <p className="customer-business">Business: {retailerInfo.business}</p>
                      )}
                      {retailerInfo.location && (
                        <p className="customer-location">Location: {retailerInfo.location}</p>
                      )}
                      {retailerInfo.discount > 0 && (
                        <p className="customer-discount">Discount: {retailerInfo.discount}%</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="desktop-header-right">
              <div className="desktop-summary-box">
                <div className="summary-header">
                  <h3>{isEditMode ? "Edit Summary" : "Order Summary"}</h3>
                </div>

                {cartItems.length === 0 ? (
                  <div className="empty-summary">
                    <p>No items</p>
                  </div>
                ) : (
                  <>
                    <div className="summary-items-preview">
                      {cartItems.slice(0, 3).map((item, index) => {
                        const breakdown = item.breakdown?.perUnit || {};
                        return (
                          <div key={index} className="preview-item">
                            <span className="preview-name">{item.item_name || `Product ${item.product_id}`}</span>
                            <span className="preview-qty">x{item.quantity || 1}</span>
                            <span className="preview-price">
                              ₹{formatCurrency(breakdown.final_amount || 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="summary-totals">
                      <div className="summary-row">
                        <span>Items:</span>
                        <span className="count">{orderTotals.itemCount || cartItems.length}</span>
                      </div>
                      {(orderTotals.totalCreditCharges || 0) > 0 && (
                        <div className="summary-row credit">
                          <span>Credit Charges:</span>
                          <span>+₹{formatCurrency(orderTotals.totalCreditCharges)}</span>
                        </div>
                      )}
                      {(orderTotals.totalDiscount || 0) > 0 && (
                        <div className="summary-row discount-row">
                          <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
                          <span>-₹{formatCurrency(orderTotals.totalDiscount)}</span>
                        </div>
                      )}
                      <div className="summary-row total-row">
                        <span>Total:</span>
                        <span className="final-total">₹{formatCurrency(orderTotals.finalTotal)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobileView && (
        <div className="checkout-mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-header-main">
              <button
                className="mobile-back-btn"
                onClick={handleBackToCart}
              >
                ← {isEditMode ? "Back" : "Back to Cart"}
              </button>
              <div className="mobile-header-text">
                <h1>{isEditMode ? "Edit Item" : "Checkout"}</h1>
                {retailerInfo.name && (
                  <div className="mobile-customer-info">
                    <div className="customer-info">
                      Customer: <strong>{retailerInfo.name}</strong>
                      {retailerInfo.displayName && (
                        <span className="display-name-badge"> ({retailerInfo.displayName})</span>
                      )}
                      {discount > 0 && (
                        <span className="discount-badge"> - {discount}% Discount</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-main-content">
        {isEditMode && cartItems.length > 0 && (
          <div className="edit-item-section">
            <h3>Edit Item Price</h3>
            <div className="edit-item-details">
              <div className="edit-item-row">
                <span className="edit-label">Item Name:</span>
                <span className="edit-value">{cartItems[0].item_name || 'N/A'}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Current Sale Price:</span>
                <span className="edit-value">₹{formatCurrency(cartItems[0].sale_price)}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Minimum Sale Price:</span>
                <span className="edit-value warning">₹{formatCurrency(cartItems[0].min_sale_price)}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Quantity:</span>
                <span className="edit-value">{cartItems[0].quantity || 1}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Credit Period:</span>
                <span className="edit-value">{cartItems[0].credit_period || 0} days</span>
              </div>
              
              <div className="edit-price-input">
                <label htmlFor="editedPrice">Enter New Base Price (must be ≥ ₹{formatCurrency(cartItems[0].min_sale_price)}):</label>
                <input
                  type="number"
                  id="editedPrice"
                  min={cartItems[0].min_sale_price || 0}
                  step="0.01"
                  value={editedPrice}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value) || 0;
                    handlePriceChange(newPrice);
                  }}
                  className="price-input"
                />
                {editedPrice < (cartItems[0].min_sale_price || 0) && (
                  <p className="error-message">
                    Price must be at least ₹{formatCurrency(cartItems[0].min_sale_price)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isEditMode && (
          <div className="order-mode-section">
            <h3>Order Mode</h3>
            <div className="order-mode-buttons">
              <button
                className={`order-mode-btn ${orderMode === 'KACHA' ? 'active' : ''}`}
                onClick={() => setOrderMode('KACHA')}
              >
                KACHA
              </button>
              <button
                className={`order-mode-btn ${orderMode === 'PAKKA' ? 'active' : ''}`}
                onClick={() => setOrderMode('PAKKA')}
              >
                PAKKA
              </button>
            </div>
            <p className="order-mode-note">
              {orderMode === 'KACHA'
                ? 'KACHA: Temporary order, invoice will be generated later'
                : 'PAKKA: Complete order with immediate invoice'}
            </p>
          </div>
        )}

        <div className="order-summary-section">
          <h2>{isEditMode ? "Price Update Summary" : "Order Summary"} ({orderTotals.itemCount || cartItems.length} items)</h2>
          
          <div className="summary-row">
            <span>Base Price (Taxable Amount):</span>
            <span>₹{formatCurrency(editedPrice)}</span>
          </div>

          {(orderTotals.totalDiscount || 0) > 0 && (
            <div className="summary-row discount">
              <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
              <span>-₹{formatCurrency(orderTotals.totalDiscount)}</span>
            </div>
          )}

          {(orderTotals.totalCreditCharges || 0) > 0 && (
            <div className="summary-row credit">
              <span>Credit Charges:</span>
              <span>+₹{formatCurrency(orderTotals.totalCreditCharges)}</span>
            </div>
          )}

          {(orderTotals.totalTax || 0) > 0 && (
            <>
              <div className="summary-row">
                <span>Taxable Amount:</span>
                <span>₹{formatCurrency(orderTotals.totalTaxableAmount)}</span>
              </div>

              <div className="summary-row tax">
                <span>Total GST ({cartItems[0]?.tax_percentage || 18}%):</span>
                <span>+₹{formatCurrency(orderTotals.totalTax)}</span>
              </div>
            </>
          )}

          <div className="summary-row total">
            <span>Final Total:</span>
            <strong>₹{formatCurrency(orderTotals.finalTotal)}</strong>
          </div>

          {!isEditMode && (
            <div className="summary-row mode-display">
              <span>Order Mode:</span>
              <span className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
                {orderMode} {orderMode === 'PAKKA' ? '✓' : '⏳'}
              </span>
            </div>
          )}

          {(orderTotals.totalDiscount || 0) > 0 && (
            <div className="savings-note">
              🎉 Customer saved ₹{formatCurrency(orderTotals.totalDiscount)} with {orderTotals.userDiscount || discountPercentage}% discount!
            </div>
          )}
        </div>

        <div className="place-order-section">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || isUpdatingItem || !cartItems || cartItems.length === 0 || 
              (isEditMode && editedPrice < (cartItems[0]?.min_sale_price || 0))}
            className={`place-order-btn ${loading || isUpdatingItem ? 'loading' : ''} ${isEditMode ? 'edit-btn' : ''}`}
          >
            {isUpdatingItem ? "Updating..." : 
             loading ? "Processing..." : 
             isEditMode ? `Update Price - ₹${formatCurrency(orderTotals.finalTotal)}` : 
             `Place ${orderMode} Order - ₹${formatCurrency(orderTotals.finalTotal)}`}
          </button>
          
          {isEditMode && editedPrice < (cartItems[0]?.min_sale_price || 0) && (
            <p className="validation-error">
              Cannot update: Price is below minimum sale price (₹{formatCurrency(cartItems[0]?.min_sale_price)})
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobileView) {
    return mainContent;
  } else {
    return (
      <div className="checkout-page-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleMobile}
          />
          <div className="checkout-page-main-content">
            {mainContent}
          </div>
        </div>
      </div>
    );
  }
}

export default Checkout;