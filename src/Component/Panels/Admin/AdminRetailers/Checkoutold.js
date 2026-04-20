// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import { baseurl } from "../../../BaseURL/BaseURL";
// import "./CheckOut.css";

// function Checkout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     retailerId,
//     customerName,
//     displayName,
//     discount,
//     cartItems: initialCartItems,
//     staffId: initialStaffId,
//     userRole,
//     totals: initialTotals,
//     creditBreakdown: initialCreditBreakdown
//   } = location.state || {};

//   console.log("DisplayName:", displayName);
//   console.log("customerName:", customerName)
// const [assignedStaffInfo, setAssignedStaffInfo] = useState({ id: null, name: null });
//   const [loading, setLoading] = useState(false);
//   const [orderPlaced, setOrderPlaced] = useState(false);
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [orderMode, setOrderMode] = useState('KACHA'); // Default to KACHA
//   const [cartItems, setCartItems] = useState(initialCartItems || []);
//   const [totals, setTotals] = useState(initialTotals || {});
//   const [creditBreakdown, setCreditBreakdown] = useState(initialCreditBreakdown || {});
//   const [retailerInfo, setRetailerInfo] = useState({});
//   const [isMobileView, setIsMobileView] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);

//   // Check for mobile view on resize
//   useEffect(() => {
//     const checkMobileView = () => {
//       setIsMobileView(window.innerWidth < 768);
//     };

//     checkMobileView();
//     window.addEventListener('resize', checkMobileView);

//     return () => window.removeEventListener('resize', checkMobileView);
//   }, []);

//   // Handle mobile toggle
//   const handleToggleMobile = () => {
//     setIsMobileOpen(!isMobileOpen);
//   };

//   // Get logged-in staff info from localStorage and fetch retailer info
//   useEffect(() => {
//     const getStaffInfo = () => {
//       const storedData = localStorage.getItem("user");
//       if (storedData) {
//         try {
//           const user = JSON.parse(storedData);
//           console.log("Logged in user:", user);
//         } catch (err) {
//           console.error("Error parsing user data:", err);
//         }
//       }
//     };
//     getStaffInfo();
//   }, []);

//   // Fetch retailer info
//   useEffect(() => {
//     if (!retailerId) return;

//     const fetchRetailerInfo = async () => {
//       try {
//         // Get staff ID from localStorage
//         const storedData = localStorage.getItem("user");
//         const user = storedData ? JSON.parse(storedData) : null;
//         const staffId = user?.id || null;

//         if (staffId) {
//           const response = await fetch(`${baseurl}/get-sales-retailers/${staffId}`);

//           if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }

//           const result = await response.json();

//           if (result.success && Array.isArray(result.data)) {
//             const retailer = result.data.find(r => r.id === parseInt(retailerId));
//             if (retailer) {
//               setRetailerInfo({
//                 name: retailer.name,
//                 business: retailer.business_name,
//                 location: retailer.shipping_city,
//                 discount: retailer.discount || 0,
//                 displayName: displayName || retailer.display_name || ""
//               });
//             }
//           }
//         } else {
//           // Fallback to state data
//           setRetailerInfo({
//             name: customerName,
//             discount: discount,
//             displayName: displayName || ""
//           });
//         }
//       } catch (err) {
//         console.error("Error fetching retailer info:", err);
//         // Fallback to state data
//         setRetailerInfo({
//           name: customerName,
//           discount: discount,
//           displayName: displayName || ""
//         });
//       }
//     };

//     fetchRetailerInfo();
//   }, [retailerId, customerName, displayName, discount]);

// useEffect(() => {
//   if (!retailerId) return;
  
//   const fetchAssignedStaffInfo = async () => {
//     try {
//       const response = await fetch(`${baseurl}/accounts/${retailerId}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       if (result) {
//         setAssignedStaffInfo({
//           id: result.staffid, // Note: lowercase 'staffid'
//           name: result.assigned_staff
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching assigned staff info:", err);
//       // Fallback to state data
//       setAssignedStaffInfo({
//         id: initialStaffId,
//         name: "Staff"
//       });
//     }
//   };
  
//   fetchAssignedStaffInfo();
// }, [retailerId, initialStaffId, baseurl]);

//   // Recalculate totals if cart items changed
//   useEffect(() => {
//     if (cartItems.length > 0) {
//       const recalculatedTotals = calculateTotals();
//       setTotals(recalculatedTotals);

//       const recalculatedCreditBreakdown = calculateCreditBreakdown();
//       setCreditBreakdown(recalculatedCreditBreakdown);
//     }
//   }, [cartItems, discount]);

//   // Calculate item breakdown (same as CartPage)
//   const calculateItemBreakdown = (item) => {
//     const product = item.productDetails || {};
//     const price = parseFloat(product.price) || parseFloat(item.price) || 0;
//     const gstRate = parseFloat(product.gst_rate) || parseFloat(item.gst_rate) || 0;
//     const isInclusiveGST = product.inclusive_gst === "Inclusive" || item.inclusive_gst === "Inclusive";
//     const quantity = parseInt(item.quantity) || 1;
//     const creditMultiplier = item.credit_percentage ? (1 + (parseFloat(item.credit_percentage) / 100)) : 1;
//     const creditPercentage = parseFloat(item.credit_percentage) || 0;
//     const userDiscountPercentage = parseFloat(discount) || 0;

//     // FOR INCLUSIVE GST
//     if (isInclusiveGST) {
//       // Step 1: Extract base amount from price (which includes GST)
//       const baseAmountPerUnit = price / (1 + (gstRate / 100));

//       // Step 2: Apply credit charge per unit
//       const priceAfterCreditPerUnit = baseAmountPerUnit * creditMultiplier;
//       const creditChargePerUnit = priceAfterCreditPerUnit - baseAmountPerUnit;

//       // Step 3: Calculate total for quantity
//       const totalBaseAmount = baseAmountPerUnit * quantity;
//       const totalCreditCharges = creditChargePerUnit * quantity;
//       const totalAmountAfterCredit = totalBaseAmount + totalCreditCharges;

//       // Step 4: Apply user discount
//       let discountAmount = 0;
//       if (userDiscountPercentage > 0) {
//         discountAmount = (totalAmountAfterCredit * userDiscountPercentage) / 100;
//       }

//       // Step 5: Calculate taxable amount
//       const taxableAmount = totalAmountAfterCredit - discountAmount;

//       // Step 6: Calculate tax amount on taxable amount
//       const taxAmount = (taxableAmount * gstRate) / 100;

//       // Step 7: Final total
//       const finalPayableAmount = taxableAmount + taxAmount;

//       return {
//         basePrice: price,
//         gstRate,
//         isInclusiveGST: true,
//         quantity,
//         creditMultiplier,
//         creditPercentage,
//         userDiscountPercentage,

//         totalBaseAmount,
//         totalCreditCharges,
//         discountAmount,
//         taxableAmount,
//         taxAmount,
//         finalPayableAmount
//       };
//     }

//     // FOR EXCLUSIVE GST
//     else {
//       const baseAmountPerUnit = price;
//       const priceAfterCreditPerUnit = baseAmountPerUnit * creditMultiplier;
//       const creditChargePerUnit = priceAfterCreditPerUnit - baseAmountPerUnit;

//       const totalBaseAmount = baseAmountPerUnit * quantity;
//       const totalCreditCharges = creditChargePerUnit * quantity;
//       const totalAmountAfterCredit = totalBaseAmount + totalCreditCharges;

//       let discountAmount = 0;
//       if (userDiscountPercentage > 0) {
//         discountAmount = (totalAmountAfterCredit * userDiscountPercentage) / 100;
//       }

//       const taxableAmount = totalAmountAfterCredit - discountAmount;
//       const taxAmount = (taxableAmount * gstRate) / 100;
//       const finalPayableAmount = taxableAmount + taxAmount;

//       return {
//         basePrice: price,
//         gstRate,
//         isInclusiveGST: false,
//         quantity,
//         creditMultiplier,
//         creditPercentage,
//         userDiscountPercentage,

//         totalBaseAmount,
//         totalCreditCharges,
//         discountAmount,
//         taxableAmount,
//         taxAmount,
//         finalPayableAmount
//       };
//     }
//   };

//   // Calculate credit breakdown for the entire cart
//   const calculateCreditBreakdown = () => {
//     let subtotal = 0;
//     let totalCreditCharges = 0;
//     let totalDiscount = 0;
//     let totalTax = 0;
//     let finalTotal = 0;

//     cartItems.forEach(item => {
//       const breakdown = calculateItemBreakdown(item);
//       subtotal += breakdown.totalBaseAmount;
//       totalCreditCharges += breakdown.totalCreditCharges;
//       totalDiscount += breakdown.discountAmount;
//       totalTax += breakdown.taxAmount;
//       finalTotal += breakdown.finalPayableAmount;
//     });

//     return {
//       subtotal,
//       totalCreditCharges,
//       totalDiscount,
//       totalTax,
//       userDiscount: parseFloat(discount) || 0,
//       finalTotal
//     };
//   };

//   // Calculate totals if not passed
//   const calculateTotals = () => {
//     if (initialTotals) return initialTotals;

//     const breakdown = calculateCreditBreakdown();

//     return {
//       subtotal: breakdown.subtotal,
//       creditCharges: breakdown.totalCreditCharges,
//       discountAmount: breakdown.totalDiscount,
//       finalTotal: breakdown.finalTotal,
//       itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0)
//     };
//   };

//   // Calculate average credit period
//   const calculateAverageCreditPeriod = () => {
//     const totalPeriod = cartItems.reduce((sum, item) =>
//       sum + (parseInt(item.credit_period) || 0), 0);
//     return cartItems.length > 0 ? Math.round(totalPeriod / cartItems.length) : 0;
//   };

//   // Enhanced place order function with all calculations
// // Enhanced place order function with all calculations
// // Enhanced place order function with all calculations
// const handlePlaceOrder = async () => {
//   if (!retailerId || !cartItems || cartItems.length === 0) {
//     alert("Missing required information");
//     return;
//   }

//   // Get staff info from localStorage
//   const storedData = localStorage.getItem("user");
//   let loggedInUser = null;
//   let actualStaffId = initialStaffId;
//   let staffName = null;
//   let adminEmail = null; // Current logged-in admin's email
//   let assignedStaff = null;
//   let staffIdFromStorage = null;

//   if (storedData) {
//     try {
//       loggedInUser = JSON.parse(storedData);
//       console.log("Logged in user data:", loggedInUser);

//       // Extract user information
//       staffName = loggedInUser.name || loggedInUser.username || loggedInUser.full_name || "Staff Member";
//       staffIdFromStorage = loggedInUser.id || loggedInUser.user_id || loggedInUser.staff_id;
//       adminEmail = loggedInUser.email || ""; // Get current logged-in admin's email
//       assignedStaff = loggedInUser.assigned_staff || loggedInUser.supervisor_name || staffName;

//       // Use staff ID from localStorage if not provided in state
//       if (!actualStaffId && staffIdFromStorage) {
//         actualStaffId = staffIdFromStorage;
//         console.log("Using staff ID from localStorage:", actualStaffId);
//       }

//       console.log("Staff Name:", staffName);
//       console.log("Admin Email (Current User):", adminEmail);
//       console.log("Assigned Staff:", assignedStaff);

//     } catch (err) {
//       console.error("Error parsing user data:", err);
//     }
//   }

//   if (!actualStaffId) {
//     alert("Staff ID is required. Please log in again.");
//     return;
//   }

//   // If staff name is still null, provide a default
//   if (!staffName) {
//     staffName = `Staff ${actualStaffId}`;
//   }

//   if (!assignedStaff) {
//     assignedStaff = staffName;
//   }

//   setLoading(true);

//   // ---------------------------------------------------------
//   // 1. Fetch Retailer Details to get retailer email
//   // ---------------------------------------------------------
//   let retailerEmail = "";
//   let assignedStaffEmail = "";
//   let assignedStaffName = "";
//   let staffIncentive = 0;

//   try {
//     // Fetch retailer details to get email
//     const retailerRes = await fetch(`${baseurl}/accounts/${retailerId}`);
//     if (retailerRes.ok) {
//       const retailerData = await retailerRes.json();
//       retailerEmail = retailerData.email || "";
//       console.log("Retailer Email:", retailerEmail);
      
//       // Get assigned staff ID from retailer data
//       const assignedStaffId = retailerData.staffid;
      
//       if (assignedStaffId) {
//         // Fetch assigned staff details to get their email
//         const assignedStaffRes = await fetch(`${baseurl}/accounts/${assignedStaffId}`);
//         if (assignedStaffRes.ok) {
//           const assignedStaffData = await assignedStaffRes.json();
//           assignedStaffEmail = assignedStaffData.email || "";
//           assignedStaffName = assignedStaffData.name || assignedStaffData.assigned_staff || "Staff";
//           staffIncentive = assignedStaffData.incentive_percent || 0;
//           console.log("Assigned Staff Email:", assignedStaffEmail);
//           console.log("Assigned Staff Name:", assignedStaffName);
//         } else {
//           console.warn("Failed to fetch assigned staff details");
//         }
//       }
//     } else {
//       console.warn("Failed to fetch retailer details");
//     }
//   } catch (error) {
//     console.error("Error fetching details:", error);
//   }

//   // Generate order number
//   const orderNumber = `ORD${Date.now()}`;
//   const averageCreditPeriod = calculateAverageCreditPeriod();
//   const breakdown = calculateCreditBreakdown();

//   // Prepare order data - IMPORTANT: Include email fields for backend
//   const orderData = {
//     order: {
//       order_number: orderNumber,
//       customer_id: retailerId,
//       customer_name: retailerInfo.displayName || displayName || retailerInfo.name || "Walk-in Customer",
//       customer_display_name: retailerInfo.displayName || displayName || "",
//       order_total: breakdown.subtotal + breakdown.totalCreditCharges,
//       discount_amount: breakdown.totalDiscount,
//       taxable_amount: breakdown.subtotal + breakdown.totalCreditCharges - breakdown.totalDiscount,
//       tax_amount: breakdown.totalTax,
//       net_payable: breakdown.finalTotal,
//       credit_period: averageCreditPeriod,
//       estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
//       order_placed_by: retailerId,
//       assigned_staff: assignedStaffInfo?.name || staffName,
//       staffid: assignedStaffInfo?.id,
//       order_mode: orderMode,
//       ordered_by: staffName,
//       invoice_number: null,
//       invoice_date: null,
//       invoice_status: 0,
//       order_status: "Pending",
      
//       // CRITICAL: ADD THESE EMAIL FIELDS FOR BACKEND EMAIL SENDING
//       retailer_email: retailerEmail,        // Retailer's email from accounts table
//       staff_email: assignedStaffEmail,      // Assigned staff's email from accounts table
//       admin_email: adminEmail               // Current logged-in admin's email from localStorage
//     },
//     orderItems: cartItems.map(item => {
//       const itemBreakdown = calculateItemBreakdown(item);
//       const product = item.productDetails || {};
//       const gstRate = parseFloat(product.gst_rate) || 0;

//       // Split GST 50/50 for SGST and CGST
//       const sgstPercentage = gstRate / 2;
//       const cgstPercentage = gstRate / 2;
//       const sgstAmount = itemBreakdown.taxAmount / 2;
//       const cgstAmount = itemBreakdown.taxAmount / 2;

//       const mrp = parseFloat(item.mrp) || itemBreakdown.basePrice;
//       const salePrice = parseFloat(item.sale_price) || itemBreakdown.basePrice;
//       const priceAfterCredit = itemBreakdown.basePrice * itemBreakdown.creditMultiplier;

//       return {
//         order_number: orderNumber,
//         item_name: item.item_name || product.name || `Product ${item.product_id}`,
//         product_id: item.product_id,
//         mrp: mrp,
//         sale_price: salePrice,
//         price: priceAfterCredit,
//         quantity: item.quantity || 1,
//         total_amount: itemBreakdown.totalBaseAmount + itemBreakdown.totalCreditCharges,
//         discount_percentage: discount,
//         discount_amount: itemBreakdown.discountAmount,
//         taxable_amount: itemBreakdown.taxableAmount,
//         tax_percentage: gstRate,
//         tax_amount: itemBreakdown.taxAmount,
//         item_total: itemBreakdown.finalPayableAmount,
//         credit_period: item.credit_period || 0,
//         credit_percentage: item.credit_percentage || 0,
//         sgst_percentage: sgstPercentage,
//         sgst_amount: sgstAmount,
//         cgst_percentage: cgstPercentage,
//         cgst_amount: cgstAmount,
//         discount_applied_scheme: discount > 0 ? 'user_discount' : null
//       };
//     })
//   };

//   console.log("Sending order data with all email addresses:");
//   console.log("- Retailer Email:", retailerEmail);
//   console.log("- Assigned Staff Email:", assignedStaffEmail);
//   console.log("- Admin Email (Current User):", adminEmail);

//   try {
//     const response = await fetch(`${baseurl}/orders/create-complete-order`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(orderData),
//     });

//     const result = await response.json();
//     console.log("Order response:", result);

//     if (response.ok && result.success) {
//       setOrderDetails({
//         orderNumber: result.order_number || orderData.order.order_number,
//         orderId: result.order_id,
//         amount: breakdown.finalTotal,
//         customerName: retailerInfo.name || customerName || "Walk-in Customer",
//         customerDisplayName: retailerInfo.displayName || displayName || "",
//         staffId: actualStaffId,
//         staffName: staffName,
//         date: new Date().toLocaleDateString(),
//         orderMode: orderMode,
//         breakdown: breakdown
//       });
//       setOrderPlaced(true);
//       navigate('/period');
//     } else {
//       throw new Error(result.error || result.details || result.message || "Failed to place order");
//     }
//   } catch (error) {
//     console.error("Error placing order:", error);
//     alert(`Order failed: ${error.message}`);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleBackToCart = () => {
//     navigate("/retailers/cart", {
//       state: {
//         retailerId,
//         customerName: retailerInfo.name,
//         displayName: retailerInfo.displayName,
//         discount,
//         cartItems,
//         staffId: initialStaffId,
//         userRole,
//         totals,
//         creditBreakdown
//       }
//     });
//   };

//   const handleBackToRetailers = () => {
//     navigate("/retailers");
//   };

//   if (!retailerId) {
//     return (
//       <div className="checkout-page-wrapper">
//         <AdminSidebar
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//           onToggleMobile={isMobileOpen}
//         />
//         <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <AdminHeader
//             isCollapsed={isCollapsed}
//             onToggleSidebar={handleToggleMobile}
//           />
//           <div className="checkout-page-main-content">
//             <div className="checkout-page">
//               <div className="error-container">
//                 <h2>Checkout Not Found</h2>
//                 <p>Please select a retailer to proceed to checkout.</p>
//                 <button onClick={handleBackToRetailers} className="back-retailers-btn">
//                   Back to Retailers
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (orderPlaced && orderDetails) {
//     // Success content
//     const successContent = (
//       <div className="checkout-page">
//         <div className="order-success-container">
//           <div className="success-icon">✅</div>
//           <h2>Order Placed Successfully!</h2>

//           <div className="order-details-card">
//             <h3>Order Details</h3>
//             <div className="order-detail-row">
//               <span>Order Number:</span>
//               <strong>{orderDetails.orderNumber}</strong>
//             </div>
//             <div className="order-detail-row">
//               <span>Order Mode:</span>
//               <strong className={`order-mode-badge ${orderDetails.orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
//                 {orderDetails.orderMode}
//               </strong>
//             </div>
//             <div className="order-detail-row">
//               <span>Customer:</span>
//               <span>{orderDetails.customerName}</span>
//             </div>
//             {orderDetails.customerDisplayName && (
//               <div className="order-detail-row">
//                 <span>Display Name:</span>
//                 <span className="display-name-highlight">{orderDetails.customerDisplayName}</span>
//               </div>
//             )}
//             <div className="order-detail-row">
//               <span>Placed by Staff ID:</span>
//               <strong>{orderDetails.staffId}</strong>
//             </div>
//             <div className="order-detail-row">
//               <span>Date:</span>
//               <span>{orderDetails.date}</span>
//             </div>
//             <div className="order-detail-row">
//               <span>Total Amount:</span>
//               <strong className="total-amount">
//                 ₹{orderDetails.amount.toLocaleString()}
//               </strong>
//             </div>
//           </div>

//           {/* Order Summary Breakdown */}
//           <div className="breakdown-card">
//             <h4>Payment Breakdown</h4>
//             <div className="breakdown-row">
//               <span>Subtotal:</span>
//               <span>₹{orderDetails.breakdown.subtotal.toLocaleString()}</span>
//             </div>
//             {orderDetails.breakdown.totalCreditCharges > 0 && (
//               <div className="breakdown-row credit">
//                 <span>Credit Charges:</span>
//                 <span>+₹{orderDetails.breakdown.totalCreditCharges.toLocaleString()}</span>
//               </div>
//             )}
//             {orderDetails.breakdown.totalDiscount > 0 && (
//               <div className="breakdown-row discount">
//                 <span>Discount ({orderDetails.breakdown.userDiscount}%):</span>
//                 <span>-₹{orderDetails.breakdown.totalDiscount.toLocaleString()}</span>
//               </div>
//             )}
//             {orderDetails.breakdown.totalTax > 0 && (
//               <div className="breakdown-row tax">
//                 <span>GST:</span>
//                 <span>+₹{orderDetails.breakdown.totalTax.toLocaleString()}</span>
//               </div>
//             )}
//             <div className="breakdown-row total">
//               <span>Final Total:</span>
//               <strong>₹{orderDetails.breakdown.finalTotal.toLocaleString()}</strong>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="order-actions">
//             <button onClick={handleBackToRetailers} className="new-order-btn">
//               Back to Retailers
//             </button>
//           </div>
//         </div>
//       </div>
//     );

//     // Return with layout for desktop, without layout for mobile
//     if (isMobileView) {
//       return successContent;
//     } else {
//       return (
//         <div className="checkout-page-wrapper">
//           <AdminSidebar
//             isCollapsed={isCollapsed}
//             setIsCollapsed={setIsCollapsed}
//             onToggleMobile={isMobileOpen}
//           />
//           <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
//             <AdminHeader
//               isCollapsed={isCollapsed}
//               onToggleSidebar={handleToggleMobile}
//             />
//             <div className="checkout-page-main-content">
//               {successContent}
//             </div>
//           </div>
//         </div>
//       );
//     }
//   }

//   // Main checkout content
//   const mainContent = (
//     <div className="checkout-page">
//       {/* Desktop Header */}
//       {!isMobileView && (
//         <div className="checkout-desktop-header">
//           <div className="desktop-header-content">
//             <div className="desktop-header-left">
//               <button
//                 className="desktop-back-btn"
//                 onClick={handleBackToRetailers}
//               >
//                 ← Back to Retailers
//               </button>
//               <div className="desktop-header-text">
//                 <h1>
//                   Checkout
//                   {retailerInfo.displayName && <span className="display-name-header"> for {retailerInfo.displayName}</span>}
//                 </h1>
//                 {retailerInfo.name && (
//                   <div className="desktop-customer-info">
//                     <div className="customer-details">
//                       <p className="customer-name">Customer: <strong>{retailerInfo.name}</strong></p>
//                       {retailerInfo.displayName && (
//                         <p className="customer-display-name">Display Name: <strong>{retailerInfo.displayName}</strong></p>
//                       )}
//                       {retailerInfo.business && (
//                         <p className="customer-business">Business: {retailerInfo.business}</p>
//                       )}
//                       {retailerInfo.location && (
//                         <p className="customer-location">Location: {retailerInfo.location}</p>
//                       )}
//                       {retailerInfo.discount > 0 && (
//                         <p className="customer-discount">Discount: {retailerInfo.discount}%</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="desktop-header-right">
//               <div className="desktop-summary-box">
//                 <div className="summary-header">
//                   <h3>Order Summary</h3>
//                   <Link
//                     to="/cart"
//                     state={{
//                       retailerId,
//                       customerName: retailerInfo.name,
//                       displayName: retailerInfo.displayName,
//                       discount
//                     }}
//                     className="desktop-cart-link"
//                   >
//                     Edit Cart
//                   </Link>
//                 </div>

//                 {cartItems.length === 0 ? (
//                   <div className="empty-summary">
//                     <p>No items in cart</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="summary-items-preview">
//                       {cartItems.slice(0, 3).map((item, index) => {
//                         const product = item.productDetails || {};
//                         const breakdown = calculateItemBreakdown(item);
//                         return (
//                           <div key={index} className="preview-item">
//                             <span className="preview-name">{product.name || `Product ${item.product_id}`}</span>
//                             <span className="preview-qty">x{item.quantity || 1}</span>
//                             <span className="preview-price">
//                               ₹{breakdown.finalPayableAmount.toLocaleString('en-IN')}
//                             </span>
//                           </div>
//                         );
//                       })}
//                       {cartItems.length > 3 && (
//                         <div className="more-items-preview">
//                           +{cartItems.length - 3} more items
//                         </div>
//                       )}
//                     </div>

//                     <div className="summary-totals">
//                       <div className="summary-row">
//                         <span>Items:</span>
//                         <span className="count">{cartItems.length}</span>
//                       </div>
//                       <div className="summary-row">
//                         <span>Subtotal:</span>
//                         <span>₹{creditBreakdown.subtotal?.toLocaleString('en-IN') || '0'}</span>
//                       </div>
//                       {creditBreakdown.totalDiscount > 0 && (
//                         <div className="summary-row discount-row">
//                           <span>Discount ({discount}%):</span>
//                           <span>-₹{creditBreakdown.totalDiscount.toLocaleString('en-IN')}</span>
//                         </div>
//                       )}
//                       <div className="summary-row total-row">
//                         <span>Total:</span>
//                         <span className="final-total">₹{creditBreakdown.finalTotal?.toLocaleString('en-IN') || totals?.finalTotal?.toLocaleString('en-IN') || '0'}</span>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Header */}
//       {isMobileView && (
//         <div className="checkout-mobile-header">
//           <div className="mobile-header-content">
//             <div className="mobile-header-main">
//               <button
//                 className="mobile-back-btn"
//                 onClick={handleBackToCart}
//               >
//                 ← Back to Cart
//               </button>
//               <div className="mobile-header-text">
//                 <h1>Checkout</h1>
//                 {retailerInfo.name && (
//                   <div className="mobile-customer-info">
//                     <div className="customer-info">
//                       Customer: <strong>{retailerInfo.name}</strong>
//                       {retailerInfo.displayName && (
//                         <span className="display-name-badge"> ({retailerInfo.displayName})</span>
//                       )}
//                       {discount > 0 && (
//                         <span className="discount-badge"> - {discount}% Discount</span>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content Area */}
//       <div className="checkout-main-content">
//         {/* Order Mode Selection */}
//         <div className="order-mode-section">
//           <h3>Order Mode</h3>
//           <div className="order-mode-buttons">
//             <button
//               className={`order-mode-btn ${orderMode === 'KACHA' ? 'active' : ''}`}
//               onClick={() => setOrderMode('KACHA')}
//             >
//               KACHA
//             </button>
//             <button
//               className={`order-mode-btn ${orderMode === 'PAKKA' ? 'active' : ''}`}
//               onClick={() => setOrderMode('PAKKA')}
//             >
//               PAKKA
//             </button>
//           </div>
//           <p className="order-mode-note">
//             {orderMode === 'KACHA'
//               ? 'KACHA: Temporary order, invoice will be generated later'
//               : 'PAKKA: Complete order with immediate invoice'}
//           </p>
//         </div>

//         {/* Order Summary */}
//         <div className="order-summary-section">
//           <h2>Order Summary</h2>

//           <div className="summary-item">
//             <span>Subtotal ({cartItems.length} items):</span>
//             <span>₹{creditBreakdown.subtotal?.toLocaleString() || '0'}</span>
//           </div>

//           {creditBreakdown.totalCreditCharges > 0 && (
//             <div className="summary-item credit">
//               <span>Credit Charges:</span>
//               <span>+₹{creditBreakdown.totalCreditCharges?.toLocaleString() || '0'}</span>
//             </div>
//           )}

//           {discount > 0 && (
//             <div className="summary-item discount">
//               <span>Discount ({discount}%):</span>
//               <span>-₹{creditBreakdown.totalDiscount?.toLocaleString() || '0'}</span>
//             </div>
//           )}

//           {creditBreakdown.totalTax > 0 && (
//             <div className="summary-item tax">
//               <span>GST:</span>
//               <span>+₹{creditBreakdown.totalTax?.toLocaleString() || '0'}</span>
//             </div>
//           )}

//           <div className="summary-item total">
//             <span>Final Total:</span>
//             <strong>₹{creditBreakdown.finalTotal?.toLocaleString() || totals?.finalTotal?.toLocaleString() || '0'}</strong>
//           </div>

//           {discount > 0 && creditBreakdown.totalDiscount > 0 && (
//             <div className="savings-note">
//               🎉 Customer saved ₹{creditBreakdown.totalDiscount.toLocaleString()} with {discount}% discount!
//             </div>
//           )}
//         </div>

//         {/* Items List with Calculation Details */}
//         <div className="checkout-items">
//           <h3>Items ({cartItems?.length || 0})</h3>
//           <div className="items-list">
//             {cartItems?.map((item, index) => {
//               const breakdown = calculateItemBreakdown(item);
//               const product = item.productDetails || {};

//               return (
//                 <div key={index} className="checkout-item">
//                   <div className="item-info">
//                     <h4>{item.item_name || product.name || `Product ${item.product_id}`}</h4>
//                     <div className="item-details">
//                       <span>Qty: {item.quantity}</span>
//                       <span>× ₹{breakdown.basePrice.toLocaleString()}</span>
//                       {product.unit && <span className="unit">/{product.unit}</span>}
//                     </div>
//                     <div className="item-gst-info">
//                       <span className={`gst-badge ${breakdown.isInclusiveGST ? 'inclusive' : 'exclusive'}`}>
//                         {breakdown.isInclusiveGST ? 'Incl. GST' : 'Excl. GST'} {breakdown.gstRate}%
//                       </span>
//                     </div>
//                     {item.credit_period > 0 && (
//                       <p className="credit-info">
//                         Credit: {item.credit_period} days (+{item.credit_percentage}%)
//                       </p>
//                     )}

//                     {/* Item Calculation Breakdown */}
//                     <div className="item-breakdown">
//                       <div className="breakdown-row">
//                         <span>Base:</span>
//                         <span>₹{breakdown.totalBaseAmount.toLocaleString()}</span>
//                       </div>
//                       {breakdown.totalCreditCharges > 0 && (
//                         <div className="breakdown-row credit">
//                           <span>Credit Charge:</span>
//                           <span>+₹{breakdown.totalCreditCharges.toLocaleString()}</span>
//                         </div>
//                       )}
//                       {breakdown.discountAmount > 0 && (
//                         <div className="breakdown-row discount">
//                           <span>Discount:</span>
//                           <span>-₹{breakdown.discountAmount.toLocaleString()}</span>
//                         </div>
//                       )}
//                       {breakdown.taxAmount > 0 && (
//                         <div className="breakdown-row tax">
//                           <span>GST:</span>
//                           <span>+₹{breakdown.taxAmount.toLocaleString()}</span>
//                         </div>
//                       )}
//                       <div className="breakdown-row item-total">
//                         <span>Item Total:</span>
//                         <strong>₹{breakdown.finalPayableAmount.toLocaleString()}</strong>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Staff Info */}
//         <div className="staff-info-section">
//           <h3>Order Placed By</h3>
//           {/* Get staff info from localStorage */}
//           {(() => {
//             const storedData = localStorage.getItem("user");
//             let staffInfo = null;
//             if (storedData) {
//               try {
//                 staffInfo = JSON.parse(storedData);
//               } catch (err) {
//                 console.error("Error parsing user data:", err);
//               }
//             }

//             return (
//               <>
//                 <p>Staff ID: <strong>{staffInfo?.id || initialStaffId || "Loading..."}</strong></p>
//                 <p>Name: <strong>{staffInfo?.name || staffInfo?.username || staffInfo?.full_name || "Staff Member"}</strong></p>
//                 <p className="order-mode-display">
//                   Order Mode: <strong className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
//                     {orderMode}
//                   </strong>
//                 </p>
//               </>
//             );
//           })()}
//         </div>

//         {/* Place Order Button */}
//         <div className="place-order-section">
//           <button
//             onClick={handlePlaceOrder}
//             disabled={loading || !cartItems || cartItems.length === 0}
//             className={`place-order-btn ${loading ? 'loading' : ''}`}
//           >
//             {loading ? "Processing..." : `Place ${orderMode} Order - ₹${creditBreakdown.finalTotal?.toLocaleString() || totals?.finalTotal?.toLocaleString() || '0'}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // Return with layout for desktop, without layout for mobile
//   if (isMobileView) {
//     return mainContent;
//   } else {
//     return (
//       <div className="checkout-page-wrapper">
//         <AdminSidebar
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//           onToggleMobile={isMobileOpen}
//         />
//         <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <AdminHeader
//             isCollapsed={isCollapsed}
//             onToggleSidebar={handleToggleMobile}
//           />
//           <div className="checkout-page-main-content">
//             {mainContent}
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default Checkout;


import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./CheckOut.css";

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
    creditPeriods
  } = location.state || {};

  const discountPercentage = discount || userDiscountPercentage || 0;

  console.log("DisplayName:", displayName);
  console.log("customerName:", customerName);

  const [assignedStaffInfo, setAssignedStaffInfo] = useState({ id: null, name: null });
  const [retailerDetails, setRetailerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderMode, setOrderMode] = useState('KACHA'); // Default to KACHA
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [orderTotals, setOrderTotals] = useState(initialOrderTotals || initialTotals || {});
  const [retailerInfo, setRetailerInfo] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // Check for mobile view on resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Get logged-in staff info from localStorage and fetch retailer info
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

  // Fetch retailer details from accounts endpoint - ADDED FROM REFERENCE CODE
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

  // Fetch retailer info
  useEffect(() => {
    if (!retailerId) return;

    const fetchRetailerInfo = async () => {
      try {
        // Get staff ID from localStorage
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
          // Fallback to state data
          setRetailerInfo({
            name: customerName,
            discount: discount,
            displayName: displayName || ""
          });
        }
      } catch (err) {
        console.error("Error fetching retailer info:", err);
        // Fallback to state data
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
            id: result.staffid, // Note: lowercase 'staffid'
            name: result.assigned_staff
          });
        }
      } catch (err) {
        console.error("Error fetching assigned staff info:", err);
        // Fallback to state data
        setAssignedStaffInfo({
          id: initialStaffId,
          name: "Staff"
        });
      }
    };

    fetchAssignedStaffInfo();
  }, [retailerId, initialStaffId, baseurl]);

  // Enhanced place order function with all calculations - UPDATED TO MATCH REFERENCE CODE
  const handlePlaceOrder = async () => {
    if (!retailerId || !cartItems || cartItems.length === 0) {
      alert("Missing required information");
      return;
    }

    // Get staff info from localStorage
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

        // Extract user information
        staffName = loggedInUser.name || "Staff Member";
        staffIdFromStorage = loggedInUser.id;
        assignedStaff = loggedInUser.assigned_staff || loggedInUser.supervisor_name || staffName;

        // Use staff ID from localStorage if not provided in state
        if (!actualStaffId && staffIdFromStorage) {
          actualStaffId = staffIdFromStorage;
          console.log("Using staff ID from localStorage:", actualStaffId);
        }

        console.log("Staff Name:", staffName);
        console.log("Assigned Staff:", assignedStaff);

      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    if (!actualStaffId) {
      alert("Staff ID is required. Please log in again.");
      return;
    }

    setLoading(true);

    // ---------------------------------------------------------
    // 1. Fetch Staff Details From Backend (accounts/:id) - FROM REFERENCE CODE
    // ---------------------------------------------------------
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

    // Generate order number
    const orderNumber = `ORD${Date.now()}`;

    // Calculate total credit charges from all items - FROM REFERENCE CODE
    const totalCreditCharges = cartItems.reduce((sum, item) => {
      const breakdown = item.breakdown?.perUnit || {};
      return sum + ((breakdown.credit_charge || 0) * (item.quantity || 1));
    }, 0);

    // Prepare order data using the breakdown from cart - UPDATED TO MATCH REFERENCE CODE
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
        credit_period: totalCreditCharges, // This should be the total credit charges amount - FROM REFERENCE CODE
        estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        order_placed_by: actualStaffId,
        order_mode: orderMode,
        approval_status: "Pending",
        ordered_by: staffName,
        order_status: "Pending",
        staffid: actualStaffId,
        assigned_staff: assignedStaffName,
        staff_incentive: staffIncentive.toString(), // Convert to string - FROM REFERENCE CODE
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

          // Use the pre-calculated breakdown values from cart - FROM REFERENCE CODE
          mrp: breakdown.mrp || 0,
          sale_price: breakdown.sale_price || 0,
          edited_sale_price: breakdown.edited_sale_price || 0,
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

        // Set order placed to show popup
        setOrderPlaced(true);

        // Show success popup
        setTimeout(() => {
          // You can use your preferred popup method
          // Option 1: Using a custom popup component
          if (typeof setShowSuccessPopup === 'function') {
            setShowSuccessPopup(true);
          }

          // Option 2: Using alert with better formatting
          const successMessage = `
          ✅ Order Placed Successfully!
          
          Order Number: ${result.order_number || orderData.order.order_number}
          Customer: ${customerName || retailerDetails?.name || "Customer"}
          Total Amount: ₹${orderData.order.net_payable.toFixed(2)}
          Order Mode: ${orderMode}
          
          Thank you for your order!
        `;
          alert(successMessage);

          // Option 3: Navigate after popup
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

  const handleBackToCart = () => {
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
    // Success content
    const successContent = (
      <div className="checkout-page">
        <div className="order-success-container">
          <div className="success-icon">✅</div>
          <h2>Order Placed Successfully!</h2>

          <div className="order-details-card">
            <h3>Order Details</h3>
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
                ₹{orderDetails.amount.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Order Summary Breakdown - UPDATED */}
          <div className="breakdown-card">
            <h4>Payment Breakdown</h4>
            {orderTotals.totalCreditCharges > 0 && (
              <div className="breakdown-row credit">
                <span>Credit Charges:</span>
                <span>+₹{orderTotals.totalCreditCharges.toLocaleString()}</span>
              </div>
            )}
            {orderTotals.totalDiscount > 0 && (
              <div className="breakdown-row discount">
                <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
                <span>-₹{orderTotals.totalDiscount.toLocaleString()}</span>
              </div>
            )}
            {orderTotals.totalTax > 0 && (
              <>
                <div className="breakdown-row">
                  <span>Total Taxable Amount:</span>
                  <span>₹{orderTotals.totalTaxableAmount.toLocaleString()}</span>
                </div>
                <div className="breakdown-row tax">
                  <span>Total GST:</span>
                  <span>+₹{orderTotals.totalTax.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="breakdown-row total">
              <span>Final Total:</span>
              <strong>₹{orderTotals.finalTotal.toLocaleString()}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-actions">
            <button onClick={handleBackToRetailers} className="new-order-btn">
              Back to Retailers
            </button>
          </div>
        </div>
      </div>
    );

    // Return with layout for desktop, without layout for mobile
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

  // Main checkout content
  const mainContent = (
    <div className="checkout-page">
      {/* Desktop Header */}
      {!isMobileView && (
        <div className="checkout-desktop-header">
          <div className="desktop-header-content">
            <div className="desktop-header-left">
              <button
                className="desktop-back-btn"
                onClick={handleBackToRetailers}
              >
                ← Back to Retailers
              </button>
              <div className="desktop-header-text">
                <h1>
                  Checkout
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
                  <h3>Order Summary</h3>
                  <Link
                    to="/cart"
                    state={{
                      retailerId,
                      customerName: retailerInfo.name,
                      displayName: retailerInfo.displayName,
                      discount
                    }}
                    className="desktop-cart-link"
                  >
                    Edit Cart
                  </Link>
                </div>

                {cartItems.length === 0 ? (
                  <div className="empty-summary">
                    <p>No items in cart</p>
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
                              ₹{(breakdown.final_amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                      {cartItems.length > 3 && (
                        <div className="more-items-preview">
                          +{cartItems.length - 3} more items
                        </div>
                      )}
                    </div>

                    <div className="summary-totals">
                      <div className="summary-row">
                        <span>Items:</span>
                        <span className="count">{orderTotals.itemCount || cartItems.length}</span>
                      </div>
                      {orderTotals.totalCreditCharges > 0 && (
                        <div className="summary-row credit">
                          <span>Credit Charges:</span>
                          <span>+₹{orderTotals.totalCreditCharges?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                      )}
                      {orderTotals.totalDiscount > 0 && (
                        <div className="summary-row discount-row">
                          <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
                          <span>-₹{orderTotals.totalDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="summary-row total-row">
                        <span>Total:</span>
                        <span className="final-total">₹{orderTotals.finalTotal?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {isMobileView && (
        <div className="checkout-mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-header-main">
              <button
                className="mobile-back-btn"
                onClick={handleBackToCart}
              >
                ← Back to Cart
              </button>
              <div className="mobile-header-text">
                <h1>Checkout</h1>
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

      {/* Main Content Area */}
      <div className="checkout-main-content">
        {/* Order Mode Selection */}
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

        {/* Order Summary - UPDATED TO MATCH REFERENCE CODE */}
        <div className="order-summary-section">
          <h2>Order Summary ({orderTotals.itemCount || cartItems.length} items)</h2>

          {orderTotals.totalCreditCharges > 0 && (
            <div className="summary-row credit">
              <span>Credit Charges:</span>
              <span>+₹{orderTotals.totalCreditCharges?.toLocaleString() || '0'}</span>
            </div>
          )}

          {orderTotals.totalDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
              <span>-₹{orderTotals.totalDiscount?.toLocaleString() || '0'}</span>
            </div>
          )}

          {orderTotals.totalTax > 0 && (
            <>
              <div className="summary-row">
                <span>Taxable Amount:</span>
                <span>₹{orderTotals.totalTaxableAmount?.toLocaleString() || '0'}</span>
              </div>

              <div className="summary-row tax">
                <span>Total GST:</span>
                <span>+₹{orderTotals.totalTax?.toLocaleString() || '0'}</span>
              </div>
            </>
          )}

          <div className="summary-row total">
            <span>Final Total:</span>
            <strong>₹{orderTotals.finalTotal?.toLocaleString() || '0'}</strong>
          </div>

          {/* Order Mode Display - ADDED FROM REFERENCE CODE */}
          <div className="summary-row mode-display">
            <span>Order Mode:</span>
            <span className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
              {orderMode} {orderMode === 'PAKKA' ? '✓' : '⏳'}
            </span>
          </div>

          {orderTotals.totalDiscount > 0 && (
            <div className="savings-note">
              🎉 Customer saved ₹{orderTotals.totalDiscount?.toLocaleString() || '0'} with {orderTotals.userDiscount || discountPercentage}% discount!
            </div>
          )}
        </div>

        {/* Place Order Button */}
        <div className="place-order-section">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !cartItems || cartItems.length === 0}
            className={`place-order-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? "Processing..." : `Place ${orderMode} Order - ₹${orderTotals.finalTotal?.toLocaleString() || '0'}`}
          </button>
        </div>
      </div>
    </div>
  );

  // Return with layout for desktop, without layout for mobile
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