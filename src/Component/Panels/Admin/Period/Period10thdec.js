// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";
// // import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
// // import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
// // import './Period.css';
// // import { baseurl } from "../../../BaseURL/BaseURL";
// // import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';


// // const Period = () => {
// //   const [openRow, setOpenRow] = useState(null);
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [search, setSearch] = useState("");
// //   const [downloading, setDownloading] = useState({});
// //   const [orderInvoices, setOrderInvoices] = useState({}); // Store invoices per order
// //   const [loadingInvoices, setLoadingInvoices] = useState({});
// //   const [startDate, setStartDate] = useState("");
// //   const [endDate, setEndDate] = useState("");
// //   const navigate = useNavigate();
// //   const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
// //   const [showOrderModal, setShowOrderModal] = useState(false);
// //   const [showItemModal, setShowItemModal] = useState(false);
// //   const [modalData, setModalData] = useState(null);

// //   const [selectedItems, setSelectedItems] = useState({});
// //   const [generatingInvoice, setGeneratingInvoice] = useState(false);
// //   const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

// //   useEffect(() => {
// //     fetchOrders();
// //     fetchNextInvoiceNumber();
// //   }, []);

// //   useEffect(() => {
// //     if (orders.length > 0) {
// //       orders.forEach(order => {
// //         fetchInvoicesForOrder(order.order_number);
// //       });
// //     }
// //   }, [orders]);


// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (openDropdown && !event.target.closest('.p-invoice-dropdown')) {
// //         setOpenDropdown(null);
// //       }
// //     };

// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => {
// //       document.removeEventListener('mousedown', handleClickOutside);
// //     };
// //   }, [openDropdown]);

// //   const fetchNextInvoiceNumber = async () => {
// //     try {
// //       console.log('Fetching next invoice number...');
// //       const response = await fetch(`${baseurl}/next-invoice-number`);

// //       if (response.ok) {
// //         const data = await response.json();
// //         console.log('Received next invoice number:', data.nextInvoiceNumber);
// //         setNextInvoiceNumber(data.nextInvoiceNumber);
// //       } else {
// //         console.error('Failed to fetch next invoice number');
// //         generateFallbackInvoiceNumber();
// //       }
// //     } catch (err) {
// //       console.error('Error fetching next invoice number:', err);
// //       generateFallbackInvoiceNumber();
// //     }
// //   };

// //   const generateFallbackInvoiceNumber = async () => {
// //     try {
// //       const response = await fetch(`${baseurl}/last-invoice`);
// //       if (response.ok) {
// //         const data = await response.json();
// //         if (data.lastInvoiceNumber) {
// //           const lastNumber = data.lastInvoiceNumber;
// //           const numberMatch = lastNumber.match(/INV(\d+)/);
// //           if (numberMatch) {
// //             const nextNum = parseInt(numberMatch[1]) + 1;
// //             const fallbackInvoiceNumber = `INV${nextNum.toString().padStart(3, '0')}`;
// //             setNextInvoiceNumber(fallbackInvoiceNumber);
// //             return;
// //           }
// //         }
// //       }
// //       setNextInvoiceNumber('INV001');
// //     } catch (err) {
// //       console.error('Error in fallback invoice number generation:', err);
// //       setNextInvoiceNumber('INV001');
// //     }
// //   };

// //   const fetchInvoicesForOrder = async (orderNumber) => {
// //     try {
// //       setLoadingInvoices(prev => ({ ...prev, [orderNumber]: true }));

// //       const response = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

// //       if (response.ok) {
// //         const data = await response.json();
// //         console.log(`Fetched invoices for ${orderNumber}:`, data.pdfs);

// //         setOrderInvoices(prev => ({
// //           ...prev,
// //           [orderNumber]: data.pdfs || []
// //         }));
// //       } else {
// //         console.error(`Failed to fetch invoices for ${orderNumber}:`, response.status);
// //         setOrderInvoices(prev => ({
// //           ...prev,
// //           [orderNumber]: []
// //         }));
// //       }
// //     } catch (error) {
// //       console.error(`Error fetching invoices for ${orderNumber}:`, error);
// //       setOrderInvoices(prev => ({
// //         ...prev,
// //         [orderNumber]: []
// //       }));
// //     } finally {
// //       setLoadingInvoices(prev => ({ ...prev, [orderNumber]: false }));
// //     }
// //   };

// //   const handleDownloadSpecificPDF = async (orderNumber, pdfData) => {
// //     try {
// //       // Decode base64 PDF data
// //       const binaryString = window.atob(pdfData.data);
// //       const bytes = new Uint8Array(binaryString.length);

// //       for (let i = 0; i < binaryString.length; i++) {
// //         bytes[i] = binaryString.charCodeAt(i);
// //       }

// //       const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

// //       // Create download link
// //       const url = window.URL.createObjectURL(pdfBlob);
// //       const link = document.createElement('a');
// //       link.href = url;
// //       link.download = pdfData.fileName || `Invoice_${orderNumber}.pdf`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       window.URL.revokeObjectURL(url);

// //       console.log(`Downloaded PDF: ${pdfData.fileName}`);
// //     } catch (error) {
// //       console.error('Error downloading PDF:', error);
// //       alert('Error downloading PDF: ' + error.message);
// //     }
// //   };

// //   const handleDownloadPDF = async (invoice) => {
// //     const orderNumber = invoice.order_number || invoice.originalData?.order_number;

// //     if (!orderNumber) {
// //       alert('Order number not found for this invoice');
// //       return;
// //     }

// //     try {
// //       setDownloading(prev => ({ ...prev, [orderNumber]: true }));

// //       // First, try to download the existing PDF using order_number
// //       const downloadResponse = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

// //       if (downloadResponse.ok) {
// //         const pdfBlob = await downloadResponse.blob();

// //         // Create download link
// //         const url = window.URL.createObjectURL(pdfBlob);
// //         const link = document.createElement('a');
// //         link.href = url;

// //         // Get filename from response headers or use default
// //         const contentDisposition = downloadResponse.headers.get('content-disposition');
// //         let filename = `Invoice_${invoice.number || orderNumber}.pdf`;

// //         if (contentDisposition) {
// //           const filenameMatch = contentDisposition.match(/filename="(.+)"/);
// //           if (filenameMatch) {
// //             filename = filenameMatch[1];
// //           }
// //         }

// //         link.download = filename;
// //         document.body.appendChild(link);
// //         link.click();
// //         document.body.removeChild(link);
// //         window.URL.revokeObjectURL(url);

// //         console.log('PDF downloaded successfully');

// //       } else if (downloadResponse.status === 404) {
// //         // PDF doesn't exist, generate it first
// //         console.log('PDF not found, generating new PDF...');

// //         // Note: You'll also need to update the generate-pdf endpoint to accept order_number
// //         const generateResponse = await fetch(`${baseurl}/transactions/generate-pdf`, {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify({ order_number: orderNumber })
// //         });

// //         if (generateResponse.ok) {
// //           const result = await generateResponse.json();
// //           console.log('PDF generated successfully:', result);

// //           // After generation, try downloading again
// //           const retryDownload = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

// //           if (retryDownload.ok) {
// //             const pdfBlob = await retryDownload.blob();
// //             const url = window.URL.createObjectURL(pdfBlob);
// //             const link = document.createElement('a');
// //             link.href = url;

// //             // Get filename for the retry download as well
// //             const retryContentDisposition = retryDownload.headers.get('content-disposition');
// //             let retryFilename = `Invoice_${invoice.number || orderNumber}.pdf`;

// //             if (retryContentDisposition) {
// //               const filenameMatch = retryContentDisposition.match(/filename="(.+)"/);
// //               if (filenameMatch) {
// //                 retryFilename = filenameMatch[1];
// //               }
// //             }

// //             link.download = retryFilename;
// //             document.body.appendChild(link);
// //             link.click();
// //             document.body.removeChild(link);
// //             window.URL.revokeObjectURL(url);

// //             console.log('PDF downloaded after generation');
// //           } else {
// //             throw new Error('Failed to download PDF after generation');
// //           }
// //         } else {
// //           throw new Error('Failed to generate PDF');
// //         }
// //       } else {
// //         throw new Error(`Failed to download PDF: ${downloadResponse.status}`);
// //       }
// //     } catch (error) {
// //       console.error('Error downloading PDF:', error);
// //       alert('Error downloading PDF: ' + error.message);
// //     } finally {
// //       setDownloading(prev => ({ ...prev, [orderNumber]: false }));
// //     }
// //   };



// // const fetchOrders = async () => {
// //   try {
// //     setLoading(true);
// //     const response = await axios.get(`${baseurl}/orders/all-orders`);
// //     const ordersData = response.data;
// //     console.log("Raw API ordersData:", ordersData);
    
// //     // Filter orders based on approval_status and order_status
// //     const filteredOrdersData = ordersData.filter(order => {
// //       const approvalStatus = order.approval_status?.toString().toLowerCase();
// //       const orderStatus = order.order_status?.toString().toLowerCase();
      
// //       // Condition 1: approval_status should be "approved" (case insensitive)
// //       const isApproved = approvalStatus === "approved";
      
// //       // Condition 2: order_status should NOT be "cancelled" (case insensitive)
// //       const isNotCancelled = orderStatus !== "cancelled";
      
// //       return isApproved && isNotCancelled;
// //     });
    
// //     console.log(`Filtered orders: ${filteredOrdersData.length} out of ${ordersData.length}`);
    
// //     if (filteredOrdersData.length > 0) {
// //       console.log("Available fields in first filtered order:", Object.keys(filteredOrdersData[0]));
// //       console.log("First order staff_incentive from orders table:", filteredOrdersData[0].staff_incentive);
// //     }

// //     const ordersWithItems = await Promise.all(
// //       filteredOrdersData.map(async (order) => {
// //         try {
// //           // Fetch order items
// //           const itemsRes = await axios.get(`${baseurl}/orders/details/${order.order_number}`);
// //           const itemsData = itemsRes.data.items || [];
// //           const orderMode = order.order_mode || "Pakka";

// //           // Get staff_incentive from ORDERS TABLE (not calculating from items)
// //           const staffIncentive = parseFloat(order.staff_incentive) || 0;
// //           console.log(`Order ${order.order_number}: staff_incentive from orders table = ${staffIncentive}`);

// //           // Fetch account details by customer ID
// //           let accountDetails = null;
// //           try {
// //             const accountRes = await axios.get(`${baseurl}/accounts/${order.customer_id}`);
// //             console.log(`Account response for customer ${order.customer_id}:`, accountRes.data);
// //             accountDetails = accountRes.data;
// //           } catch (accountErr) {
// //             console.warn(`Could not fetch account details for customer ID ${order.customer_id}:`, accountErr.message);
// //             accountDetails = null;
// //           }

// //           const items = await Promise.all(
// //             itemsData.map(async (item) => {
// //               let min_sale_price = 0;

// //               // Fetch min_sale_price from products table
// //               try {
// //                 const productRes = await axios.get(`${baseurl}/products/${item.product_id}`);
// //                 min_sale_price = productRes.data.min_sale_price || 0;
// //               } catch (productErr) {
// //                 console.warn(`Could not fetch product details for product ID ${item.product_id}:`, productErr.message);
// //                 min_sale_price = 0;
// //               }

// //               return {
// //                 id: item.id,
// //                 order_number: item.order_number,
// //                 item_name: item.item_name ?? "N/A",
// //                 product_id: item.product_id,
// //                 mrp: item.mrp ?? 0,
// //                 sale_price: item.sale_price ?? 0,
// //                 min_sale_price: min_sale_price,
// //                 price: item.price ?? 0,
// //                 quantity: item.quantity ?? 0,
// //                 total_amount: item.total_amount ?? 0,
// //                 discount_percentage: item.discount_percentage ?? 0,
// //                 discount_amount: item.discount_amount ?? 0,
// //                 taxable_amount: item.taxable_amount ?? 0,
// //                 tax_percentage: item.tax_percentage ?? 0,
// //                 tax_amount: item.tax_amount ?? 0,
// //                 item_total: item.item_total ?? 0,
// //                 credit_period: item.credit_period ?? 0,
// //                 invoice_number: item.invoice_number ?? 0,
// //                 invoice_status: item.invoice_status ?? 0,
// //                 staff_id: item.staff_id ?? order.staff_id ?? 0,
// //                 assigned_staff: item.assigned_staff ?? order.assigned_staff ?? null,
// //                 // Do NOT calculate staff_incentive from items
// //                 // Use the value from orders table instead
// //                 staff_incentive: item.staff_incentive ?? 0, // Keep item level incentive if needed separately
// //                 invoice_date: item.invoce_date ?? 0,
// //                 credit_percentage: item.credit_percentage ?? 0,
// //                 sgst_percentage: item.sgst_percentage ?? 0,
// //                 sgst_amount: item.sgst_amount ?? 0,
// //                 cgst_percentage: item.cgst_percentage ?? 0,
// //                 cgst_amount: item.cgst_amount ?? 0,
// //                 discount_applied_scheme: item.discount_applied_scheme ?? "N/A"
// //               };
// //             })
// //           );

// //           console.log(`Order ${order.order_number}:`, {
// //             order_status: order.order_status,
// //             invoice_status: order.invoice_status,
// //             invoice_number: order.invoice_number,
// //             assigned_staff: order.assigned_staff,
// //             staff_id: order.staff_id,
// //             staff_incentive_from_orders: staffIncentive // Log the value
// //           });

// //           const assignedStaff = order.assigned_staff || "N/A";
// //           const staffId = order.staff_id || "N/A";
// //           const orderStatus = order.order_status || "N/A";

// //           // Use staff_incentive from ORDERS TABLE directly
// //           const totalStaffIncentive = staffIncentive;

// //           return {
// //             ...order,
// //             items: items,
// //             assigned_staff: assignedStaff,
// //             staff_id: staffId,
// //             order_status: orderStatus,
// //             staff_incentive: totalStaffIncentive, // This is from orders table
// //             account_details: accountDetails,
// //             order_mode: orderMode
// //           };
// //         } catch (error) {
// //           console.error(`Error processing order ${order.order_number}:`, error);
// //           return {
// //             ...order,
// //             items: [],
// //             assigned_staff: order.assigned_staff || "N/A",
// //             staff_id: order.staff_id || "N/A",
// //             order_status: order.order_status || "N/A",
// //             staff_incentive: parseFloat(order.staff_incentive) || 0, // Keep from orders table
// //             account_details: null,
// //             order_mode: order.order_mode || "Pakka"
// //           };
// //         }
// //       })
// //     );

// //     setOrders(ordersWithItems);
// //     setLoading(false);
// //   } catch (err) {
// //     console.error(err);
// //     setLoading(false);
// //   }
// // };


// //   const toggleRow = (id) => {
// //     setOpenRow(openRow === id ? null : id);
// //   };



// //   // Updated handleItemSelect function with auto-selection for same credit period
// //   const handleItemSelect = (orderId, itemId, isSelected, itemCreditPeriod) => {
// //     setSelectedItems(prev => {
// //       const newSelected = { ...prev };
// //       const currentSelectedIds = newSelected[orderId] || [];
// //       const order = orders.find(o => o.id === orderId);

// //       if (!order || !order.items) return prev;

// //       if (isSelected) {
// //         // Auto-select all eligible items with the same credit period
// //         if (currentSelectedIds.length === 0) {
// //           // No items selected yet - select all eligible with this credit period
// //           const eligibleItems = order.items.filter(item =>
// //             item.credit_period === itemCreditPeriod &&
// //             item.invoice_status !== 1
// //           );
// //           newSelected[orderId] = eligibleItems.map(item => item.id);
// //         } else {
// //           // Some items already selected - check if credit period matches
// //           const firstSelectedItemId = currentSelectedIds[0];
// //           const firstSelectedItem = order.items.find(item => item.id === firstSelectedItemId);

// //           if (firstSelectedItem && firstSelectedItem.credit_period === itemCreditPeriod) {
// //             // Same credit period - add all remaining eligible items with this credit period
// //             const eligibleItems = order.items.filter(item =>
// //               item.credit_period === itemCreditPeriod &&
// //               item.invoice_status !== 1 &&
// //               !currentSelectedIds.includes(item.id)
// //             );
// //             newSelected[orderId] = [...currentSelectedIds, ...eligibleItems.map(item => item.id)];
// //           } else {
// //             // Different credit period - alert and don't select
// //             alert(`Cannot select items with different credit periods. Selected items have ${firstSelectedItem?.credit_period} days, this item has ${itemCreditPeriod} days.`);
// //             return prev;
// //           }
// //         }
// //       } else {
// //         // Deselecting - remove only this specific item
// //         if (currentSelectedIds.includes(itemId)) {
// //           newSelected[orderId] = currentSelectedIds.filter(id => id !== itemId);
// //           if (newSelected[orderId].length === 0) {
// //             delete newSelected[orderId];
// //           }
// //         }
// //       }
// //       return newSelected;
// //     });
// //   };

// //   // Select all items in an order with credit period validation
// //   const handleSelectAll = (orderId, items) => {
// //     const currentSelectedIds = selectedItems[orderId] || [];
// //     const isAllSelected = currentSelectedIds.length === items.length;

// //     if (isAllSelected) {
// //       // Deselect all
// //       setSelectedItems(prev => {
// //         const newSelected = { ...prev };
// //         delete newSelected[orderId];
// //         return newSelected;
// //       });
// //     } else {
// //       // Check if all items have the same credit period
// //       const creditPeriods = [...new Set(items.map(item => item.credit_period))];
// //       if (creditPeriods.length > 1) {
// //         alert(`Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days. Please select items with the same credit period.`);
// //         return;
// //       }

// //       // Select all (all have same credit period)
// //       setSelectedItems(prev => ({
// //         ...prev,
// //         [orderId]: items.map(item => item.id)
// //       }));
// //     }
// //   };

// //   // Open Order Modal with existing data
// //   const openOrderModal = (orderId) => {
// //     const orderData = orders.find(order => order.id === orderId);
// //     if (orderData) {
// //       setModalData(orderData);
// //       setShowOrderModal(true);
// //     }
// //   };

// //   // Open Item Modal with existing data
// //   const openItemModal = (orderNumber, itemId) => {
// //     const order = orders.find(order => order.order_number === orderNumber);
// //     if (order && order.items) {
// //       const itemData = order.items.find(item => item.id === itemId);
// //       if (itemData) {
// //         setModalData(itemData);
// //         setShowItemModal(true);
// //       }
// //     }
// //   };

// //   // Close modals
// //   const closeModals = () => {
// //     setShowOrderModal(false);
// //     setShowItemModal(false);
// //     setModalData(null);
// //   };

// //   // In Period.js, update ONLY the handleGenerateInvoice function:
// // const handleGenerateInvoice = (order) => {
// //   try {
// //     setGeneratingInvoice(true);

// //     const orderSelectedItems = selectedItems[order.id] || [];
// //     if (orderSelectedItems.length === 0) {
// //       alert("Please select at least one item to generate invoice!");
// //       setGeneratingInvoice(false);
// //       return;
// //     }

// //     const selectedItemsData = order.items.filter(item =>
// //       orderSelectedItems.includes(item.id)
// //     );

// //     const itemsWithInvoice = selectedItemsData.filter(item => item.invoice_status === 1);
// //     if (itemsWithInvoice.length > 0) {
// //       alert(`Some selected items already have invoices generated: ${itemsWithInvoice.map(i => i.item_name).join(', ')}`);
// //       setGeneratingInvoice(false);
// //       return;
// //     }

// //     let invoiceNumber = nextInvoiceNumber;
// //     if (!invoiceNumber) {
// //       invoiceNumber = `INV${order.order_number.replace('ORD', '')}`;
// //     }

// //     const accountDetails = order.account_details;
// //     const staffId = selectedItemsData[0]?.staff_id || order.staff_id || 0;
    
// //     // Get staff_incentive from ORDERS TABLE (not calculating from items)
// //     const staffIncentive = order.staff_incentive || 0;
// //     console.log("Staff Incentive from orders table:", staffIncentive);

// //     const invoiceData = {
// //       orderNumber: order.order_number,
// //       invoiceNumber: invoiceNumber,
// //       invoiceDate: new Date().toISOString().split('T')[0],
// //       validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

// //       originalOrder: {
// //         ...order,
// //         items: undefined
// //       },

// //       // Pass only selected items WITH SGST/CGST DATA
// //       selectedItems: selectedItemsData.map(item => ({
// //         ...item,
// //         // Ensure SGST/CGST data is explicitly included
// //         sgst_percentage: item.sgst_percentage || 0,
// //         sgst_amount: item.sgst_amount || 0,
// //         cgst_percentage: item.cgst_percentage || 0,
// //         cgst_amount: item.cgst_amount || 0
// //       })),
// //       selectedItemIds: orderSelectedItems,

// //       selectedItemsTotal: {
// //         taxableAmount: selectedItemsData.reduce((sum, item) => sum + (item.taxable_amount || 0), 0),
// //         taxAmount: selectedItemsData.reduce((sum, item) => sum + (item.tax_amount || 0), 0),
// //         discountAmount: selectedItemsData.reduce((sum, item) => sum + (item.discount_amount || 0), 0),
// //         grandTotal: selectedItemsData.reduce((sum, item) => sum + (item.item_total || 0), 0)
// //       },

// //       companyInfo: {
// //         name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
// //         address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
// //         email: "sumukhusr7@gmail.com",
// //         phone: "3456549876543",
// //         gstin: "29AABCD0503B1ZG",
// //         state: "Karnataka"
// //       },

// //       customerInfo: {
// //         name: accountDetails?.name || order.customer_name,
// //         businessName: accountDetails?.business_name || order.customer_name,
// //         state: accountDetails?.billing_state || order.billing_state || "Karnataka",
// //         gstin: accountDetails?.gstin || order.gstin || "29AABCD0503B1ZG",
// //         id: order.customer_id,
// //         account_details: accountDetails
// //       },

// //       billingAddress: accountDetails ? {
// //         addressLine1: accountDetails.billing_address_line1 || "Address not specified",
// //         addressLine2: accountDetails.billing_address_line2 || "",
// //         city: accountDetails.billing_city || "City not specified",
// //         pincode: accountDetails.billing_pin_code || "000000",
// //         state: accountDetails.billing_state || "Karnataka",
// //         gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
// //         country: accountDetails.billing_country || "India"
// //       } : {
// //         addressLine1: order.billing_address || "Address not specified",
// //         addressLine2: "",
// //         city: order.billing_city || "City not specified",
// //         pincode: order.billing_pincode || "000000",
// //         state: order.billing_state || "Karnataka"
// //       },

// //       shippingAddress: accountDetails ? {
// //         addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
// //         addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
// //         city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
// //         pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
// //         state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
// //         gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
// //         country: accountDetails.shipping_country || "India"
// //       } : {
// //         addressLine1: order.shipping_address || order.billing_address || "Address not specified",
// //         addressLine2: "",
// //         city: order.shipping_city || order.billing_city || "City not specified",
// //         pincode: order.shipping_pincode || order.billing_pincode || "000000",
// //         state: order.shipping_state || order.billing_state || "Karnataka"
// //       },

// //       note: "Thank you for your business!",
// //       transportDetails: "Standard delivery",
// //       otherDetails: "Authorized Signatory",
// //       taxType: "CGST/SGST",

// //       type: 'sales',
// //       selectedSupplierId: order.customer_id,
// //       PartyID: order.customer_id,
// //       AccountID: order.customer_id,
// //       PartyName: order.customer_name,
// //       AccountName: order.customer_name,

// //       isSingleItemInvoice: orderSelectedItems.length === 1,
// //       selectedItemId: orderSelectedItems.length === 1 ? orderSelectedItems[0] : null,
// //       originalOrderId: order.id,
// //       isMultiSelect: orderSelectedItems.length > 1,

// //       staff_id: staffId,
// //       staff_incentive: staffIncentive, // Use from orders table
// //       order_mode: order.order_mode || "Pakka",
// //       fullAccountDetails: accountDetails
// //     };

// //     console.log("📋 Invoice data with staff_incentive:", staffIncentive);

// //     navigate(`/periodinvoicepreviewpdf/${order.id}`, {
// //       state: {
// //         invoiceData,
// //         selectedItemIds: orderSelectedItems
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Error preparing invoice:", error);
// //     alert("Failed to prepare invoice data. Please try again.");
// //     setGeneratingInvoice(false);
// //   }
// // };

// //   // Filter orders by search and date
// //   const filteredOrders = orders.filter(order => {
// //     const customerMatch = order.customer_name.toLowerCase().includes(search.toLowerCase());
// //     let startMatch = true;
// //     let endMatch = true;

// //     if (startDate) startMatch = new Date(order.created_at) >= new Date(startDate);
// //     if (endDate) endMatch = new Date(order.created_at) <= new Date(endDate);

// //     return customerMatch && startMatch && endMatch;
// //   });

// //   if (loading) return <div className="p-admin-layout">Loading orders...</div>;

// //   return (
// //     <div className="p-admin-layout">
// //       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
// //       <div className={`p-admin-main ${isCollapsed ? 'p-sidebar-collapsed' : ''}`}>
// //         <AdminHeader isCollapsed={isCollapsed} />

// //         <div className="p-period-page">
// //           {/* Filters Section */}
// //           <div className="p-filters-section">
// //             <div className="p-filter-row">
// //               <div className="p-filter-group">
// //                 <input
// //                   type="text"
// //                   className="p-form-control"
// //                   placeholder="Search Customer Name..."
// //                   value={search}
// //                   onChange={(e) => setSearch(e.target.value)}
// //                 />
// //               </div>
// //               <div className="p-filter-group">
// //                 <input
// //                   type="date"
// //                   className="p-form-control"
// //                   value={startDate}
// //                   onChange={(e) => setStartDate(e.target.value)}
// //                 />
// //               </div>
// //               <div className="p-filter-group">
// //                 <input
// //                   type="date"
// //                   className="p-form-control"
// //                   value={endDate}
// //                   onChange={(e) => setEndDate(e.target.value)}
// //                 />
// //               </div>
// //               <div className="p-filter-group">
// //                 <button className="p-btn p-btn-primary" onClick={() => { }}>Search</button>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="p-table-container">
// //             <table className="p-customers-table">
// //               <thead>
// //                 <tr>
// //                   <th></th>
// //                   <th>Order Number</th>
// //                   <th>Customer Name</th>
// //                   <th>Order Total</th>
// //                   <th>Discount Amount</th>
// //                   <th>Assigned Staff</th>
// //                   <th>Order Status</th>
// //                   <th>Created At</th>
// //                   <th>Action</th>
// //                   <th>Download Invoice</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {filteredOrders.map((order) => {
// //                   const isOrderOpen = openRow === order.id;
// //                   const orderSelectedItems = selectedItems[order.id] || [];
// //                   const allItemsSelected = order.items &&
// //                     orderSelectedItems.length === order.items.length;

// //                   return (
// //                     <React.Fragment key={order.id}>
// //                       <tr className="p-customer-row">
// //                         <td>
// //                           <button className="p-toggle-btn" onClick={() => toggleRow(order.id)}>
// //                             <span className={isOrderOpen ? "p-arrow-up" : "p-arrow-down"}></span>
// //                           </button>
// //                         </td>
// //                         <td>{order.order_number}</td>
// //                         <td>{order.customer_name}</td>
// //                         <td>₹{(order.order_total ?? 0).toLocaleString()}</td>
// //                         <td>₹{(order.discount_amount ?? 0).toLocaleString()}</td>
// //                         <td>{order.assigned_staff || "N/A"}</td>
// //                         <td>{order.order_status || "N/A"}</td>
// //                         <td>
// //                           {new Date(order.created_at).toLocaleDateString('en-GB')}
// //                         </td>
// //                         <td>
// //                           <div className="p-action-buttons">
// //                             <button
// //                               className="p-eye-btn"
// //                               onClick={() => openOrderModal(order.id)}
// //                               title="View Order Details"
// //                             >
// //                               👁️
// //                             </button>
// //                           </div>
// //                         </td>
// //                         <td>
// //                           <div className="p-invoice-dropdown">
// //                             <div className="p-dropdown-toggle">
// //                               <button
// //                                 className={`p-btn p-btn-pdf ${orderInvoices[order.order_number]?.length > 0 ? 'p-btn-success' : 'p-btn-warning'}`}
// //                                 disabled={loadingInvoices[order.order_number]}
// //                                 onClick={(e) => {
// //                                   e.stopPropagation();
// //                                   if (!orderInvoices[order.order_number]) {
// //                                     fetchInvoicesForOrder(order.order_number);
// //                                   }
// //                                   // Toggle dropdown
// //                                   setOpenDropdown(openDropdown === order.order_number ? null : order.order_number);
// //                                 }}
// //                                 title={orderInvoices[order.order_number]?.length > 0
// //                                   ? `Click to view ${orderInvoices[order.order_number].length} invoice(s)`
// //                                   : "Generate PDF"}
// //                               >
// //                                 {loadingInvoices[order.order_number] ? (
// //                                   <span className="p-download-spinner">Loading...</span>
// //                                 ) : orderInvoices[order.order_number]?.length > 0 ? (
// //                                   <>
// //                                     <FaDownload className="p-icon" />
// //                                     {orderInvoices[order.order_number].length} Invoice(s)
// //                                     <span className="p-dropdown-arrow">▼</span>
// //                                   </>
// //                                 ) : (
// //                                   <>
// //                                     <FaFilePdf className="p-icon" />
// //                                     Generate PDF
// //                                   </>
// //                                 )}
// //                               </button>

// //                               {/* Dropdown Menu - Only shown when this dropdown is open */}
// //                               {openDropdown === order.order_number && orderInvoices[order.order_number]?.length > 0 && (
// //                                 <div className="p-dropdown-menu">
// //                                   <div className="p-dropdown-header">
// //                                     <span>Available Invoices</span>
// //                                     <button
// //                                       className="p-close-dropdown"
// //                                       onClick={(e) => {
// //                                         e.stopPropagation();
// //                                         setOpenDropdown(null);
// //                                       }}
// //                                       title="Close"
// //                                     >
// //                                       ×
// //                                     </button>
// //                                   </div>
// //                                   {orderInvoices[order.order_number].map((pdf, index) => (
// //                                     <div
// //                                       key={index}
// //                                       className="p-dropdown-item"
// //                                       onClick={() => {
// //                                         handleDownloadSpecificPDF(order.order_number, pdf);
// //                                         setOpenDropdown(null); // Close dropdown after download
// //                                       }}
// //                                     >
// //                                       <FaFilePdf className="p-icon-sm" />
// //                                       <span className="p-invoice-filename">
// //                                         {pdf.fileName || `Invoice_${index + 1}.pdf`}
// //                                       </span>
// //                                       <FaDownload className="p-icon-sm p-download-icon" />
// //                                     </div>
// //                                   ))}
// //                                 </div>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </td>
// //                       </tr>

// //                       {isOrderOpen && (
// //                         <tr className="p-invoices-row">
// //                           <td colSpan={10}>
// //                             <div className="p-invoices-section">
// //                               <div className="p-items-header">
// //                                 <h4>Order Items</h4>
// //                                 {orderSelectedItems.length > 0 && (
// //                                   <button
// //                                     className="p-generate-invoice-btn p-bulk-btn"
// //                                     onClick={() => handleGenerateInvoice(order)}
// //                                     disabled={generatingInvoice}
// //                                     title={`Generate invoice for ${orderSelectedItems.length} selected item(s)`}
// //                                   >
// //                                     {generatingInvoice ? "Preparing..." : `Generate Invoice for ${orderSelectedItems.length} Item(s)`}
// //                                   </button>
// //                                 )}
// //                               </div>
// //                               <table className="p-invoices-table">
// //                                 <thead>
// //                                   <tr>
// //                                     <th style={{ width: '50px' }}>
// //                                       <input
// //                                         type="checkbox"
// //                                         checked={allItemsSelected}
// //                                         onChange={() => handleSelectAll(order.id, order.items)}
// //                                         className="p-item-checkbox"
// //                                         disabled={(() => {
// //                                           const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
// //                                           return creditPeriods.length > 1;
// //                                         })()}
// //                                         title={(() => {
// //                                           const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
// //                                           if (creditPeriods.length > 1) {
// //                                             return `Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days`;
// //                                           }
// //                                           return allItemsSelected ? "Deselect all items" : "Select all items";
// //                                         })()}
// //                                       />
// //                                     </th>
// //                                     <th>Item Name</th>
// //                                     <th>Quantity</th>
// //                                     <th>Sale Price</th>
// //                                     <th>Min Sale Price</th> 
// //                                     <th>Price</th>
// //                                     <th>Discount Amount</th>
// //                                     <th>Credit Period</th>
// //                                     <th>Invoice Number</th>
// //                                     <th>Action</th>
// //                                     <th>Status</th>
// //                                   </tr>
// //                                 </thead>
// //                                 <tbody>
// //                                   {order.items.map((item) => {
// //                                     const isItemSelected = orderSelectedItems.includes(item.id);
// //                                     const hasInvoiceGenerated = item.invoice_status === 1;

// //                                     return (
// //                                       <tr key={item.id}>
// //                                         <td>
// //                                           {hasInvoiceGenerated ? (
// //                                             <span title="Invoice Already Generated">✅</span>
// //                                           ) : (
// //                                             (() => {
// //                                               const currentSelectedIds = selectedItems[order.id] || [];

// //                                               if (currentSelectedIds.length === 0) {
// //                                                 return (
// //                                                   <input
// //                                                     type="checkbox"
// //                                                     checked={isItemSelected}
// //                                                     onChange={(e) =>
// //                                                       handleItemSelect(order.id, item.id, e.target.checked, item.credit_period)
// //                                                     }
// //                                                     className="p-item-checkbox"
// //                                                     title="Select for invoice generation"
// //                                                   />
// //                                                 );
// //                                               }

// //                                               const firstSelectedId = currentSelectedIds[0];
// //                                               const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
// //                                               const selectedCreditPeriod = firstSelectedItem?.credit_period;

// //                                               const isSelectable = selectedCreditPeriod === item.credit_period;

// //                                               return (
// //                                                 <input
// //                                                   type="checkbox"
// //                                                   checked={isItemSelected}
// //                                                   onChange={(e) =>
// //                                                     handleItemSelect(order.id, item.id, e.target.checked, item.credit_period)
// //                                                   }
// //                                                   className="p-item-checkbox"
// //                                                   disabled={!isSelectable}
// //                                                   title={!isSelectable ?
// //                                                     `Items with different credit periods cannot be selected together. Selected items have ${selectedCreditPeriod} days, this item has ${item.credit_period} days.` :
// //                                                     "Select for invoice generation"}
// //                                                 />
// //                                               );
// //                                             })()
// //                                           )}
// //                                         </td>
// //                                         <td>{item.item_name}</td>
// //                                         <td>{item.quantity}</td>
// //                                         <td>₹{item.sale_price.toLocaleString()}</td>
// //                                         <td>₹{item.min_sale_price.toLocaleString()}</td> {/* Add this line */}
// //                                         <td>₹{item.price.toLocaleString()}</td>
// //                                         <td>₹{item.discount_amount.toLocaleString()}</td>
// //                                         <td>{item.credit_period}</td>
// //                                         <td>{item.invoice_number || "N/A"}</td>
// //                                         <td>
// //                                           <button
// //                                             className="p-eye-btn"
// //                                             onClick={() => openItemModal(order.order_number, item.id)}
// //                                             title="View Item Details"
// //                                           >
// //                                             👁️
// //                                           </button>
// //                                         </td>
// //                                         <td>
// //                                           {hasInvoiceGenerated ? (
// //                                             <span className="p-invoice-generated-text" title="Invoice Already Generated">
// //                                               Invoice Generated
// //                                             </span>
// //                                           ) : isItemSelected ? (
// //                                             <span className="p-selected-text" title="Selected for invoice">
// //                                               Selected ✓
// //                                             </span>
// //                                           ) : (() => {
// //                                             const currentSelectedIds = selectedItems[order.id] || [];
// //                                             if (currentSelectedIds.length > 0) {
// //                                               const firstSelectedId = currentSelectedIds[0];
// //                                               const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
// //                                               if (firstSelectedItem && firstSelectedItem.credit_period !== item.credit_period) {
// //                                                 return (
// //                                                   <span className="p-different-period-text"
// //                                                     title={`Different credit period (${item.credit_period} days vs selected ${firstSelectedItem.credit_period} days)`}>
// //                                                     Different Period
// //                                                   </span>
// //                                                 );
// //                                               }
// //                                             }
// //                                             return (
// //                                               <span className="p-select-prompt-text" title="Select this item to generate invoice">
// //                                                 Available
// //                                               </span>
// //                                             );
// //                                           })()}
// //                                         </td>
// //                                       </tr>
// //                                     );
// //                                   })}
// //                                 </tbody>
// //                               </table>
// //                             </div>
// //                           </td>
// //                         </tr>
// //                       )}
// //                     </React.Fragment>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Order Details Modal */}
// //       {showOrderModal && modalData && (
// //         <div className="p-modal-overlay" onClick={closeModals}>
// //           <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
// //             <div className="p-modal-header">
// //               <h3>Order Details - {modalData.order_number}</h3>
// //               <button className="p-modal-close" onClick={closeModals}>×</button>
// //             </div>
// //             <div className="p-modal-body">
// //               <div className="p-three-column-grid">
// //                 <div className="p-column">
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Order Number:</span>
// //                     <span className="p-detail-value">{modalData.order_number}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Customer Name:</span>
// //                     <span className="p-detail-value">{modalData.customer_name}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Customer ID:</span>
// //                     <span className="p-detail-value">{modalData.customer_id}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Staff ID:</span> {/* New Field */}
// //                     <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Order Total:</span>
// //                     <span className="p-detail-value">₹{(modalData.order_total ?? 0).toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Discount Amount:</span>
// //                     <span className="p-detail-value">₹{(modalData.discount_amount ?? 0).toLocaleString()}</span>
// //                   </div>
// //                 </div>
// //                 <div className="p-column">
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Taxable Amount:</span>
// //                     <span className="p-detail-value">₹{(modalData.taxable_amount ?? 0).toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Tax Amount:</span>
// //                     <span className="p-detail-value">₹{(modalData.tax_amount ?? 0).toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Net Payable:</span>
// //                     <span className="p-detail-value">₹{(modalData.net_payable ?? 0).toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Credit Period:</span>
// //                     <span className="p-detail-value">{modalData.credit_period} days</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Estimated Delivery:</span>
// //                     <span className="p-detail-value">
// //                       {modalData.estimated_delivery_date ? new Date(modalData.estimated_delivery_date).toLocaleDateString('en-GB') : 'N/A'}
// //                     </span>
// //                   </div>
// //                 </div>
// //                 <div className="p-column">
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Invoice Number:</span>
// //                     <span className="p-detail-value">{modalData.invoice_number}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Invoice Date:</span>
// //                     <span className="p-detail-value">
// //                       {modalData.invoice_date ? new Date(modalData.invoice_date).toLocaleDateString('en-GB') : 'N/A'}
// //                     </span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Order Date:</span>
// //                     <span className="p-detail-value">
// //                       {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString('en-GB') : 'N/A'}
// //                     </span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Last Updated:</span>
// //                     <span className="p-detail-value">
// //                       {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString('en-GB') : 'N/A'}
// //                     </span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Order Mode:</span>
// //                     <span className="p-detail-value">{modalData.order_mode || 'N/A'}</span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="p-staff-info-section">
// //                 <div className="p-three-column-grid">
// //                   <div className="p-column">
// //                     <div className="p-detail-row">
// //                       <span className="p-detail-label">Assigned Staff:</span>
// //                       <span className="p-detail-value staff-highlight">
// //                         {modalData.assigned_staff || "N/A"}
// //                       </span>
// //                     </div>
// //                   </div>
// //                   <div className="p-column">
// //                     <div className="p-detail-row">
// //                       <span className="p-detail-label">Staff ID:</span>
// //                       <span className="p-detail-value">
// //                         {modalData.staff_id || "N/A"}
// //                       </span>
// //                     </div>
// //                   </div>
// //                   <div className="p-column">
// //                     <div className="p-detail-row">
// //                       <span className="p-detail-label">Staff Incentive:</span>
// //                       <span className="p-detail-value incentive-highlight">
// //                         ₹{parseFloat(modalData.staff_incentive) || 0}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {showItemModal && modalData && (
// //         <div className="p-modal-overlay" onClick={closeModals}>
// //           <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
// //             <div className="p-modal-header">
// //               <h3>Item Details - {modalData.item_name}</h3>
// //               <button className="p-modal-close" onClick={closeModals}>×</button>
// //             </div>
// //             <div className="p-modal-body">
// //               <div className="p-three-column-grid">
// //                 <div className="p-column">
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Item Name:</span>
// //                     <span className="p-detail-value">{modalData.item_name}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Staff ID:</span> {/* New Field */}
// //                     <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Product ID:</span>
// //                     <span className="p-detail-value">{modalData.product_id}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Order Number:</span>
// //                     <span className="p-detail-value">{modalData.order_number}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">MRP:</span>
// //                     <span className="p-detail-value">₹{modalData.mrp.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Sale Price:</span>
// //                     <span className="p-detail-value">₹{modalData.sale_price.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Invoice Number:</span>
// //                     <span className="p-detail-value">{modalData.invoice_number || "N/A"}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Min Sale Price:</span>
// //                     <span className="p-detail-value">₹{modalData.min_sale_price?.toLocaleString() || '0'}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Price:</span>
// //                     <span className="p-detail-value">₹{modalData.price.toLocaleString()}</span>
// //                   </div>
// //                 </div>
// //                 <div className="p-column">
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Total Amount:</span>
// //                     <span className="p-detail-value">₹{modalData.total_amount.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Discount %:</span>
// //                     <span className="p-detail-value">{modalData.discount_percentage}%</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Discount Amount:</span>
// //                     <span className="p-detail-value">₹{modalData.discount_amount.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Taxable Amount:</span>
// //                     <span className="p-detail-value">₹{modalData.taxable_amount.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Tax %:</span>
// //                     <span className="p-detail-value">{modalData.tax_percentage}%</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Tax Amount:</span>
// //                     <span className="p-detail-value">₹{modalData.tax_amount.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Item Total:</span>
// //                     <span className="p-detail-value">₹{modalData.item_total.toLocaleString()}</span>
// //                   </div>
// //                 </div>
// //                 <div className="p-column">
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Credit Period:</span>
// //                     <span className="p-detail-value">{modalData.credit_period} days</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Credit Percentage:</span>
// //                     <span className="p-detail-value">{modalData.credit_percentage}%</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">SGST %:</span>
// //                     <span className="p-detail-value">{modalData.sgst_percentage}%</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">SGST Amount:</span>
// //                     <span className="p-detail-value">₹{modalData.sgst_amount.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">CGST %:</span>
// //                     <span className="p-detail-value">{modalData.cgst_percentage}%</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">CGST Amount:</span>
// //                     <span className="p-detail-value">₹{modalData.cgst_amount.toLocaleString()}</span>
// //                   </div>
// //                   <div className="p-detail-row">
// //                     <span className="p-detail-label">Discount Scheme:</span>
// //                     <span className="p-detail-value">{modalData.discount_applied_scheme}</span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Period;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
// import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
// import './Period.css';
// import { baseurl } from "../../../BaseURL/BaseURL";
// import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';


// const Period = () => {
//   const [openRow, setOpenRow] = useState(null);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [downloading, setDownloading] = useState({});
//   const [orderInvoices, setOrderInvoices] = useState({}); // Store invoices per order
//   const [loadingInvoices, setLoadingInvoices] = useState({});
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const navigate = useNavigate();
//   const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [showItemModal, setShowItemModal] = useState(false);
//   const [modalData, setModalData] = useState(null);

//   const [selectedItems, setSelectedItems] = useState({});
//   const [generatingInvoice, setGeneratingInvoice] = useState(false);
//   const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

//   useEffect(() => {
//     fetchOrders();
//     fetchNextInvoiceNumber();
//   }, []);

//   useEffect(() => {
//     if (orders.length > 0) {
//       orders.forEach(order => {
//         fetchInvoicesForOrder(order.order_number);
//       });
//     }
//   }, [orders]);


//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (openDropdown && !event.target.closest('.p-invoice-dropdown')) {
//         setOpenDropdown(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [openDropdown]);

//   const fetchNextInvoiceNumber = async () => {
//     try {
//       console.log('Fetching next invoice number...');
//       const response = await fetch(`${baseurl}/next-invoice-number`);

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Received next invoice number:', data.nextInvoiceNumber);
//         setNextInvoiceNumber(data.nextInvoiceNumber);
//       } else {
//         console.error('Failed to fetch next invoice number');
//         generateFallbackInvoiceNumber();
//       }
//     } catch (err) {
//       console.error('Error fetching next invoice number:', err);
//       generateFallbackInvoiceNumber();
//     }
//   };

//   const generateFallbackInvoiceNumber = async () => {
//     try {
//       const response = await fetch(`${baseurl}/last-invoice`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.lastInvoiceNumber) {
//           const lastNumber = data.lastInvoiceNumber;
//           const numberMatch = lastNumber.match(/INV(\d+)/);
//           if (numberMatch) {
//             const nextNum = parseInt(numberMatch[1]) + 1;
//             const fallbackInvoiceNumber = `INV${nextNum.toString().padStart(3, '0')}`;
//             setNextInvoiceNumber(fallbackInvoiceNumber);
//             return;
//           }
//         }
//       }
//       setNextInvoiceNumber('INV001');
//     } catch (err) {
//       console.error('Error in fallback invoice number generation:', err);
//       setNextInvoiceNumber('INV001');
//     }
//   };

//   const fetchInvoicesForOrder = async (orderNumber) => {
//     try {
//       setLoadingInvoices(prev => ({ ...prev, [orderNumber]: true }));

//       const response = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

//       if (response.ok) {
//         const data = await response.json();
//         console.log(`Fetched invoices for ${orderNumber}:`, data.pdfs);

//         setOrderInvoices(prev => ({
//           ...prev,
//           [orderNumber]: data.pdfs || []
//         }));
//       } else {
//         console.error(`Failed to fetch invoices for ${orderNumber}:`, response.status);
//         setOrderInvoices(prev => ({
//           ...prev,
//           [orderNumber]: []
//         }));
//       }
//     } catch (error) {
//       console.error(`Error fetching invoices for ${orderNumber}:`, error);
//       setOrderInvoices(prev => ({
//         ...prev,
//         [orderNumber]: []
//       }));
//     } finally {
//       setLoadingInvoices(prev => ({ ...prev, [orderNumber]: false }));
//     }
//   };

//   const handleDownloadSpecificPDF = async (orderNumber, pdfData) => {
//     try {
//       // Decode base64 PDF data
//       const binaryString = window.atob(pdfData.data);
//       const bytes = new Uint8Array(binaryString.length);

//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

//       // Create download link
//       const url = window.URL.createObjectURL(pdfBlob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = pdfData.fileName || `Invoice_${orderNumber}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);

//       console.log(`Downloaded PDF: ${pdfData.fileName}`);
//     } catch (error) {
//       console.error('Error downloading PDF:', error);
//       alert('Error downloading PDF: ' + error.message);
//     }
//   };

//   const handleDownloadPDF = async (invoice) => {
//     const orderNumber = invoice.order_number || invoice.originalData?.order_number;

//     if (!orderNumber) {
//       alert('Order number not found for this invoice');
//       return;
//     }

//     try {
//       setDownloading(prev => ({ ...prev, [orderNumber]: true }));

//       // First, try to download the existing PDF using order_number
//       const downloadResponse = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

//       if (downloadResponse.ok) {
//         const pdfBlob = await downloadResponse.blob();

//         // Create download link
//         const url = window.URL.createObjectURL(pdfBlob);
//         const link = document.createElement('a');
//         link.href = url;

//         // Get filename from response headers or use default
//         const contentDisposition = downloadResponse.headers.get('content-disposition');
//         let filename = `Invoice_${invoice.number || orderNumber}.pdf`;

//         if (contentDisposition) {
//           const filenameMatch = contentDisposition.match(/filename="(.+)"/);
//           if (filenameMatch) {
//             filename = filenameMatch[1];
//           }
//         }

//         link.download = filename;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);

//         console.log('PDF downloaded successfully');

//       } else if (downloadResponse.status === 404) {
//         // PDF doesn't exist, generate it first
//         console.log('PDF not found, generating new PDF...');

//         // Note: You'll also need to update the generate-pdf endpoint to accept order_number
//         const generateResponse = await fetch(`${baseurl}/transactions/generate-pdf`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ order_number: orderNumber })
//         });

//         if (generateResponse.ok) {
//           const result = await generateResponse.json();
//           console.log('PDF generated successfully:', result);

//           // After generation, try downloading again
//           const retryDownload = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

//           if (retryDownload.ok) {
//             const pdfBlob = await retryDownload.blob();
//             const url = window.URL.createObjectURL(pdfBlob);
//             const link = document.createElement('a');
//             link.href = url;

//             // Get filename for the retry download as well
//             const retryContentDisposition = retryDownload.headers.get('content-disposition');
//             let retryFilename = `Invoice_${invoice.number || orderNumber}.pdf`;

//             if (retryContentDisposition) {
//               const filenameMatch = retryContentDisposition.match(/filename="(.+)"/);
//               if (filenameMatch) {
//                 retryFilename = filenameMatch[1];
//               }
//             }

//             link.download = retryFilename;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);

//             console.log('PDF downloaded after generation');
//           } else {
//             throw new Error('Failed to download PDF after generation');
//           }
//         } else {
//           throw new Error('Failed to generate PDF');
//         }
//       } else {
//         throw new Error(`Failed to download PDF: ${downloadResponse.status}`);
//       }
//     } catch (error) {
//       console.error('Error downloading PDF:', error);
//       alert('Error downloading PDF: ' + error.message);
//     } finally {
//       setDownloading(prev => ({ ...prev, [orderNumber]: false }));
//     }
//   };



// const fetchOrders = async () => {
//   try {
//     setLoading(true);
//     const response = await axios.get(`${baseurl}/orders/all-orders`);
//     const ordersData = response.data;
//     console.log("Raw API ordersData:", ordersData);
    
//     // Filter orders based on approval_status and order_status
//     const filteredOrdersData = ordersData.filter(order => {
//       const approvalStatus = order.approval_status?.toString().toLowerCase();
//       const orderStatus = order.order_status?.toString().toLowerCase();
      
//       // Condition 1: approval_status should be "approved" (case insensitive)
//       const isApproved = approvalStatus === "approved";
      
//       // Condition 2: order_status should NOT be "cancelled" (case insensitive)
//       const isNotCancelled = orderStatus !== "cancelled";
      
//       return isApproved && isNotCancelled;
//     });
    
//     console.log(`Filtered orders: ${filteredOrdersData.length} out of ${ordersData.length}`);
    
//     if (filteredOrdersData.length > 0) {
//       console.log("Available fields in first filtered order:", Object.keys(filteredOrdersData[0]));
//       console.log("First order staff_incentive from orders table:", filteredOrdersData[0].staff_incentive);
//     }

//     const ordersWithItems = await Promise.all(
//       filteredOrdersData.map(async (order) => {
//         try {
//           // Fetch order items
//           const itemsRes = await axios.get(`${baseurl}/orders/details/${order.order_number}`);
//           const itemsData = itemsRes.data.items || [];
//           const orderMode = order.order_mode || "Pakka";

//           // Get staff_incentive from ORDERS TABLE (not calculating from items)
//           const staffIncentive = parseFloat(order.staff_incentive) || 0;
//           console.log(`Order ${order.order_number}: staff_incentive from orders table = ${staffIncentive}`);

//           // Fetch account details by customer ID
//           let accountDetails = null;
//           try {
//             const accountRes = await axios.get(`${baseurl}/accounts/${order.customer_id}`);
//             console.log(`Account response for customer ${order.customer_id}:`, accountRes.data);
//             accountDetails = accountRes.data;
//           } catch (accountErr) {
//             console.warn(`Could not fetch account details for customer ID ${order.customer_id}:`, accountErr.message);
//             accountDetails = null;
//           }

//           const items = await Promise.all(
//             itemsData.map(async (item) => {
//               let min_sale_price = 0;

//               // Fetch min_sale_price from products table
//               try {
//                 const productRes = await axios.get(`${baseurl}/products/${item.product_id}`);
//                 min_sale_price = productRes.data.min_sale_price || 0;
//               } catch (productErr) {
//                 console.warn(`Could not fetch product details for product ID ${item.product_id}:`, productErr.message);
//                 min_sale_price = 0;
//               }

//               return {
//                 id: item.id,
//                 order_number: item.order_number,
//                 item_name: item.item_name ?? "N/A",
//                 product_id: item.product_id,
//                 mrp: item.mrp ?? 0,
//                 sale_price: item.sale_price ?? 0,
//                 min_sale_price: min_sale_price,
//                 price: item.price ?? 0,
//                 quantity: item.quantity ?? 0,
//                 total_amount: item.total_amount ?? 0,
//                 discount_percentage: item.discount_percentage ?? 0,
//                 discount_amount: item.discount_amount ?? 0,
//                 taxable_amount: item.taxable_amount ?? 0,
//                 tax_percentage: item.tax_percentage ?? 0,
//                 tax_amount: item.tax_amount ?? 0,
//                 item_total: item.item_total ?? 0,
//                 credit_period: item.credit_period ?? 0,
//                 invoice_number: item.invoice_number ?? 0,
//                 invoice_status: item.invoice_status ?? 0,
//                 staff_id: item.staff_id ?? order.staff_id ?? 0,
//                 assigned_staff: item.assigned_staff ?? order.assigned_staff ?? null,
//                 // Do NOT calculate staff_incentive from items
//                 // Use the value from orders table instead
//                 staff_incentive: item.staff_incentive ?? 0, // Keep item level incentive if needed separately
//                 invoice_date: item.invoce_date ?? 0,
//                 credit_percentage: item.credit_percentage ?? 0,
//                 sgst_percentage: item.sgst_percentage ?? 0,
//                 sgst_amount: item.sgst_amount ?? 0,
//                 cgst_percentage: item.cgst_percentage ?? 0,
//                 cgst_amount: item.cgst_amount ?? 0,
//                 discount_applied_scheme: item.discount_applied_scheme ?? "N/A"
//               };
//             })
//           );

//           console.log(`Order ${order.order_number}:`, {
//             order_status: order.order_status,
//             invoice_status: order.invoice_status,
//             invoice_number: order.invoice_number,
//             assigned_staff: order.assigned_staff,
//             staff_id: order.staff_id,
//             staff_incentive_from_orders: staffIncentive // Log the value
//           });

//           const assignedStaff = order.assigned_staff || "N/A";
//           const staffId = order.staff_id || "N/A";
//           const orderStatus = order.order_status || "N/A";

//           // Use staff_incentive from ORDERS TABLE directly
//           const totalStaffIncentive = staffIncentive;

//           return {
//             ...order,
//             items: items,
//             assigned_staff: assignedStaff,
//             staff_id: staffId,
//             order_status: orderStatus,
//             staff_incentive: totalStaffIncentive, // This is from orders table
//             account_details: accountDetails,
//             order_mode: orderMode
//           };
//         } catch (error) {
//           console.error(`Error processing order ${order.order_number}:`, error);
//           return {
//             ...order,
//             items: [],
//             assigned_staff: order.assigned_staff || "N/A",
//             staff_id: order.staff_id || "N/A",
//             order_status: order.order_status || "N/A",
//             staff_incentive: parseFloat(order.staff_incentive) || 0, // Keep from orders table
//             account_details: null,
//             order_mode: order.order_mode || "Pakka"
//           };
//         }
//       })
//     );

//     setOrders(ordersWithItems);
//     setLoading(false);
//   } catch (err) {
//     console.error(err);
//     setLoading(false);
//   }
// };


//   const toggleRow = (id) => {
//     setOpenRow(openRow === id ? null : id);
//   };



//   // Updated handleItemSelect function with auto-selection for same credit period
//   const handleItemSelect = (orderId, itemId, isSelected, itemCreditPeriod) => {
//     setSelectedItems(prev => {
//       const newSelected = { ...prev };
//       const currentSelectedIds = newSelected[orderId] || [];
//       const order = orders.find(o => o.id === orderId);

//       if (!order || !order.items) return prev;

//       if (isSelected) {
//         // Auto-select all eligible items with the same credit period
//         if (currentSelectedIds.length === 0) {
//           // No items selected yet - select all eligible with this credit period
//           const eligibleItems = order.items.filter(item =>
//             item.credit_period === itemCreditPeriod &&
//             item.invoice_status !== 1
//           );
//           newSelected[orderId] = eligibleItems.map(item => item.id);
//         } else {
//           // Some items already selected - check if credit period matches
//           const firstSelectedItemId = currentSelectedIds[0];
//           const firstSelectedItem = order.items.find(item => item.id === firstSelectedItemId);

//           if (firstSelectedItem && firstSelectedItem.credit_period === itemCreditPeriod) {
//             // Same credit period - add all remaining eligible items with this credit period
//             const eligibleItems = order.items.filter(item =>
//               item.credit_period === itemCreditPeriod &&
//               item.invoice_status !== 1 &&
//               !currentSelectedIds.includes(item.id)
//             );
//             newSelected[orderId] = [...currentSelectedIds, ...eligibleItems.map(item => item.id)];
//           } else {
//             // Different credit period - alert and don't select
//             alert(`Cannot select items with different credit periods. Selected items have ${firstSelectedItem?.credit_period} days, this item has ${itemCreditPeriod} days.`);
//             return prev;
//           }
//         }
//       } else {
//         // Deselecting - remove only this specific item
//         if (currentSelectedIds.includes(itemId)) {
//           newSelected[orderId] = currentSelectedIds.filter(id => id !== itemId);
//           if (newSelected[orderId].length === 0) {
//             delete newSelected[orderId];
//           }
//         }
//       }
//       return newSelected;
//     });
//   };

//   // Select all items in an order with credit period validation
//   const handleSelectAll = (orderId, items) => {
//     const currentSelectedIds = selectedItems[orderId] || [];
//     const isAllSelected = currentSelectedIds.length === items.length;

//     if (isAllSelected) {
//       // Deselect all
//       setSelectedItems(prev => {
//         const newSelected = { ...prev };
//         delete newSelected[orderId];
//         return newSelected;
//       });
//     } else {
//       // Check if all items have the same credit period
//       const creditPeriods = [...new Set(items.map(item => item.credit_period))];
//       if (creditPeriods.length > 1) {
//         alert(`Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days. Please select items with the same credit period.`);
//         return;
//       }

//       // Select all (all have same credit period)
//       setSelectedItems(prev => ({
//         ...prev,
//         [orderId]: items.map(item => item.id)
//       }));
//     }
//   };

//   // Open Order Modal with existing data
//   const openOrderModal = (orderId) => {
//     const orderData = orders.find(order => order.id === orderId);
//     if (orderData) {
//       setModalData(orderData);
//       setShowOrderModal(true);
//     }
//   };

//   // Open Item Modal with existing data
//   const openItemModal = (orderNumber, itemId) => {
//     const order = orders.find(order => order.order_number === orderNumber);
//     if (order && order.items) {
//       const itemData = order.items.find(item => item.id === itemId);
//       if (itemData) {
//         setModalData(itemData);
//         setShowItemModal(true);
//       }
//     }
//   };

//   // Close modals
//   const closeModals = () => {
//     setShowOrderModal(false);
//     setShowItemModal(false);
//     setModalData(null);
//   };

//   // In Period.js, update ONLY the handleGenerateInvoice function:
// const handleGenerateInvoice = (order) => {
//   try {
//     setGeneratingInvoice(true);

//     const orderSelectedItems = selectedItems[order.id] || [];
//     if (orderSelectedItems.length === 0) {
//       alert("Please select at least one item to generate invoice!");
//       setGeneratingInvoice(false);
//       return;
//     }

//     const selectedItemsData = order.items.filter(item =>
//       orderSelectedItems.includes(item.id)
//     );

//     const itemsWithInvoice = selectedItemsData.filter(item => item.invoice_status === 1);
//     if (itemsWithInvoice.length > 0) {
//       alert(`Some selected items already have invoices generated: ${itemsWithInvoice.map(i => i.item_name).join(', ')}`);
//       setGeneratingInvoice(false);
//       return;
//     }

//     let invoiceNumber = nextInvoiceNumber;
//     if (!invoiceNumber) {
//       invoiceNumber = `INV${order.order_number.replace('ORD', '')}`;
//     }

//     const accountDetails = order.account_details;
//     const staffId = selectedItemsData[0]?.staff_id || order.staff_id || 0;
    
//     // Get staff_incentive from ORDERS TABLE (not calculating from items)
//     const staffIncentive = order.staff_incentive || 0;
//     console.log("Staff Incentive from orders table:", staffIncentive);

//     const invoiceData = {
//       orderNumber: order.order_number,
//       invoiceNumber: invoiceNumber,
//       invoiceDate: new Date().toISOString().split('T')[0],
//       validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

//       originalOrder: {
//         ...order,
//         items: undefined
//       },

//       // Pass only selected items WITH SGST/CGST DATA
//       selectedItems: selectedItemsData.map(item => ({
//         ...item,
//         // Ensure SGST/CGST data is explicitly included
//         sgst_percentage: item.sgst_percentage || 0,
//         sgst_amount: item.sgst_amount || 0,
//         cgst_percentage: item.cgst_percentage || 0,
//         cgst_amount: item.cgst_amount || 0
//       })),
//       selectedItemIds: orderSelectedItems,

//       selectedItemsTotal: {
//         taxableAmount: selectedItemsData.reduce((sum, item) => sum + (item.taxable_amount || 0), 0),
//         taxAmount: selectedItemsData.reduce((sum, item) => sum + (item.tax_amount || 0), 0),
//         discountAmount: selectedItemsData.reduce((sum, item) => sum + (item.discount_amount || 0), 0),
//         grandTotal: selectedItemsData.reduce((sum, item) => sum + (item.item_total || 0), 0)
//       },

//       companyInfo: {
//         name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
//         address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
//         email: "sumukhusr7@gmail.com",
//         phone: "3456549876543",
//         gstin: "29AABCD0503B1ZG",
//         state: "Karnataka"
//       },

//       customerInfo: {
//         name: accountDetails?.name || order.customer_name,
//         businessName: accountDetails?.business_name || order.customer_name,
//         state: accountDetails?.billing_state || order.billing_state || "Karnataka",
//         gstin: accountDetails?.gstin || order.gstin || "29AABCD0503B1ZG",
//         id: order.customer_id,
//         account_details: accountDetails
//       },

//       billingAddress: accountDetails ? {
//         addressLine1: accountDetails.billing_address_line1 || "Address not specified",
//         addressLine2: accountDetails.billing_address_line2 || "",
//         city: accountDetails.billing_city || "City not specified",
//         pincode: accountDetails.billing_pin_code || "000000",
//         state: accountDetails.billing_state || "Karnataka",
//         gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
//         country: accountDetails.billing_country || "India"
//       } : {
//         addressLine1: order.billing_address || "Address not specified",
//         addressLine2: "",
//         city: order.billing_city || "City not specified",
//         pincode: order.billing_pincode || "000000",
//         state: order.billing_state || "Karnataka"
//       },

//       shippingAddress: accountDetails ? {
//         addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
//         addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
//         city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
//         pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
//         state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
//         gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
//         country: accountDetails.shipping_country || "India"
//       } : {
//         addressLine1: order.shipping_address || order.billing_address || "Address not specified",
//         addressLine2: "",
//         city: order.shipping_city || order.billing_city || "City not specified",
//         pincode: order.shipping_pincode || order.billing_pincode || "000000",
//         state: order.shipping_state || order.billing_state || "Karnataka"
//       },

//       note: "Thank you for your business!",
//       transportDetails: "Standard delivery",
//       otherDetails: "Authorized Signatory",
//       taxType: "CGST/SGST",

//       type: 'sales',
//       selectedSupplierId: order.customer_id,
//       PartyID: order.customer_id,
//       AccountID: order.customer_id,
//       PartyName: order.customer_name,
//       AccountName: order.customer_name,

//       isSingleItemInvoice: orderSelectedItems.length === 1,
//       selectedItemId: orderSelectedItems.length === 1 ? orderSelectedItems[0] : null,
//       originalOrderId: order.id,
//       isMultiSelect: orderSelectedItems.length > 1,

//       staff_id: staffId,
//       staff_incentive: staffIncentive, // Use from orders table
//       order_mode: order.order_mode || "Pakka",
//       fullAccountDetails: accountDetails
//     };

//     console.log("📋 Invoice data with staff_incentive:", staffIncentive);

//     navigate(`/periodinvoicepreviewpdf/${order.id}`, {
//       state: {
//         invoiceData,
//         selectedItemIds: orderSelectedItems
//       }
//     });

//   } catch (error) {
//     console.error("Error preparing invoice:", error);
//     alert("Failed to prepare invoice data. Please try again.");
//     setGeneratingInvoice(false);
//   }
// };

//   // Filter orders by search and date
//   const filteredOrders = orders.filter(order => {
//     const customerMatch = order.customer_name.toLowerCase().includes(search.toLowerCase());
//     let startMatch = true;
//     let endMatch = true;

//     if (startDate) startMatch = new Date(order.created_at) >= new Date(startDate);
//     if (endDate) endMatch = new Date(order.created_at) <= new Date(endDate);

//     return customerMatch && startMatch && endMatch;
//   });

//   if (loading) return <div className="p-admin-layout">Loading orders...</div>;

//   return (
//     <div className="p-admin-layout">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`p-admin-main ${isCollapsed ? 'p-sidebar-collapsed' : ''}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="p-period-page">
//           {/* Filters Section */}
//           <div className="p-filters-section">
//             <div className="p-filter-row">
//               <div className="p-filter-group">
//                 <input
//                   type="text"
//                   className="p-form-control"
//                   placeholder="Search Customer Name..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//               </div>
//               <div className="p-filter-group">
//                 <input
//                   type="date"
//                   className="p-form-control"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                 />
//               </div>
//               <div className="p-filter-group">
//                 <input
//                   type="date"
//                   className="p-form-control"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                 />
//               </div>
//               <div className="p-filter-group">
//                 <button className="p-btn p-btn-primary" onClick={() => { }}>Search</button>
//               </div>
//             </div>
//           </div>

//           <div className="p-table-container">
//             <table className="p-customers-table">
//               <thead>
//                 <tr>
//                   <th></th>
//                   <th>Order Number</th>
//                   <th>Customer Name</th>
//                   <th>Order Total</th>
//                   <th>Discount Amount</th>
//                   <th>Assigned Staff</th>
//                   <th>Order Status</th>
//                   <th>Created At</th>
//                   <th>Action</th>
//                   <th>Download Invoice</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredOrders.map((order) => {
//                   const isOrderOpen = openRow === order.id;
//                   const orderSelectedItems = selectedItems[order.id] || [];
//                   const allItemsSelected = order.items &&
//                     orderSelectedItems.length === order.items.length;

//                   return (
//                     <React.Fragment key={order.id}>
//                       <tr className="p-customer-row">
//                         <td>
//                           <button className="p-toggle-btn" onClick={() => toggleRow(order.id)}>
//                             <span className={isOrderOpen ? "p-arrow-up" : "p-arrow-down"}></span>
//                           </button>
//                         </td>
//                         <td>{order.order_number}</td>
//                         <td>{order.customer_name}</td>
//                         <td>₹{(order.order_total ?? 0).toLocaleString()}</td>
//                         <td>₹{(order.discount_amount ?? 0).toLocaleString()}</td>
//                         <td>{order.assigned_staff || "N/A"}</td>
//                         <td>{order.order_status || "N/A"}</td>
//                         <td>
//                           {new Date(order.created_at).toLocaleDateString('en-GB')}
//                         </td>
//                         <td>
//                           <div className="p-action-buttons">
//                             <button
//                               className="p-eye-btn"
//                               onClick={() => openOrderModal(order.id)}
//                               title="View Order Details"
//                             >
//                               👁️
//                             </button>
//                           </div>
//                         </td>
//                         <td>
//                           <div className="p-invoice-dropdown">
//                             <div className="p-dropdown-toggle">
//                               <button
//                                 className={`p-btn p-btn-pdf ${orderInvoices[order.order_number]?.length > 0 ? 'p-btn-success' : 'p-btn-warning'}`}
//                                 disabled={loadingInvoices[order.order_number]}
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   if (!orderInvoices[order.order_number]) {
//                                     fetchInvoicesForOrder(order.order_number);
//                                   }
//                                   // Toggle dropdown
//                                   setOpenDropdown(openDropdown === order.order_number ? null : order.order_number);
//                                 }}
//                                 title={orderInvoices[order.order_number]?.length > 0
//                                   ? `Click to view ${orderInvoices[order.order_number].length} invoice(s)`
//                                   : "Generate PDF"}
//                               >
//                                 {loadingInvoices[order.order_number] ? (
//                                   <span className="p-download-spinner">Loading...</span>
//                                 ) : orderInvoices[order.order_number]?.length > 0 ? (
//                                   <>
//                                     <FaDownload className="p-icon" />
//                                     {orderInvoices[order.order_number].length} Invoice(s)
//                                     <span className="p-dropdown-arrow">▼</span>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <FaFilePdf className="p-icon" />
//                                     Generate PDF
//                                   </>
//                                 )}
//                               </button>

//                               {/* Dropdown Menu - Only shown when this dropdown is open */}
//                               {openDropdown === order.order_number && orderInvoices[order.order_number]?.length > 0 && (
//                                 <div className="p-dropdown-menu">
//                                   <div className="p-dropdown-header">
//                                     <span>Available Invoices</span>
//                                     <button
//                                       className="p-close-dropdown"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         setOpenDropdown(null);
//                                       }}
//                                       title="Close"
//                                     >
//                                       ×
//                                     </button>
//                                   </div>
//                                   {orderInvoices[order.order_number].map((pdf, index) => (
//                                     <div
//                                       key={index}
//                                       className="p-dropdown-item"
//                                       onClick={() => {
//                                         handleDownloadSpecificPDF(order.order_number, pdf);
//                                         setOpenDropdown(null); // Close dropdown after download
//                                       }}
//                                     >
//                                       <FaFilePdf className="p-icon-sm" />
//                                       <span className="p-invoice-filename">
//                                         {pdf.fileName || `Invoice_${index + 1}.pdf`}
//                                       </span>
//                                       <FaDownload className="p-icon-sm p-download-icon" />
//                                     </div>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                       </tr>

//                       {isOrderOpen && (
//                         <tr className="p-invoices-row">
//                           <td colSpan={10}>
//                             <div className="p-invoices-section">
//                               <div className="p-items-header">
//                                 <h4>Order Items</h4>
//                                 {orderSelectedItems.length > 0 && (
//                                   <button
//                                     className="p-generate-invoice-btn p-bulk-btn"
//                                     onClick={() => handleGenerateInvoice(order)}
//                                     disabled={generatingInvoice}
//                                     title={`Generate invoice for ${orderSelectedItems.length} selected item(s)`}
//                                   >
//                                     {generatingInvoice ? "Preparing..." : `Generate Invoice for ${orderSelectedItems.length} Item(s)`}
//                                   </button>
//                                 )}
//                               </div>
//                               <table className="p-invoices-table">
//                                 <thead>
//                                   <tr>
//                                     <th style={{ width: '50px' }}>
//                                       <input
//                                         type="checkbox"
//                                         checked={allItemsSelected}
//                                         onChange={() => handleSelectAll(order.id, order.items)}
//                                         className="p-item-checkbox"
//                                         disabled={(() => {
//                                           const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
//                                           return creditPeriods.length > 1;
//                                         })()}
//                                         title={(() => {
//                                           const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
//                                           if (creditPeriods.length > 1) {
//                                             return `Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days`;
//                                           }
//                                           return allItemsSelected ? "Deselect all items" : "Select all items";
//                                         })()}
//                                       />
//                                     </th>
//                                     <th>Item Name</th>
//                                     <th>Quantity</th>
//                                     <th>Sale Price</th>
//                                     <th>Min Sale Price</th> 
//                                     <th>Price</th>
//                                     <th>Discount Amount</th>
//                                     <th>Credit Period</th>
//                                     <th>Invoice Number</th>
//                                     <th>Action</th>
//                                     <th>Status</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {order.items.map((item) => {
//                                     const isItemSelected = orderSelectedItems.includes(item.id);
//                                     const hasInvoiceGenerated = item.invoice_status === 1;

//                                     return (
//                                       <tr key={item.id}>
//                                         <td>
//                                           {hasInvoiceGenerated ? (
//                                             <span title="Invoice Already Generated">✅</span>
//                                           ) : (
//                                             (() => {
//                                               const currentSelectedIds = selectedItems[order.id] || [];

//                                               if (currentSelectedIds.length === 0) {
//                                                 return (
//                                                   <input
//                                                     type="checkbox"
//                                                     checked={isItemSelected}
//                                                     onChange={(e) =>
//                                                       handleItemSelect(order.id, item.id, e.target.checked, item.credit_period)
//                                                     }
//                                                     className="p-item-checkbox"
//                                                     title="Select for invoice generation"
//                                                   />
//                                                 );
//                                               }

//                                               const firstSelectedId = currentSelectedIds[0];
//                                               const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
//                                               const selectedCreditPeriod = firstSelectedItem?.credit_period;

//                                               const isSelectable = selectedCreditPeriod === item.credit_period;

//                                               return (
//                                                 <input
//                                                   type="checkbox"
//                                                   checked={isItemSelected}
//                                                   onChange={(e) =>
//                                                     handleItemSelect(order.id, item.id, e.target.checked, item.credit_period)
//                                                   }
//                                                   className="p-item-checkbox"
//                                                   disabled={!isSelectable}
//                                                   title={!isSelectable ?
//                                                     `Items with different credit periods cannot be selected together. Selected items have ${selectedCreditPeriod} days, this item has ${item.credit_period} days.` :
//                                                     "Select for invoice generation"}
//                                                 />
//                                               );
//                                             })()
//                                           )}
//                                         </td>
//                                         <td>{item.item_name}</td>
//                                         <td>{item.quantity}</td>
//                                         <td>₹{item.sale_price.toLocaleString()}</td>
//                                         <td>₹{item.min_sale_price.toLocaleString()}</td> {/* Add this line */}
//                                         <td>₹{item.price.toLocaleString()}</td>
//                                         <td>₹{item.discount_amount.toLocaleString()}</td>
//                                         <td>{item.credit_period}</td>
//                                         <td>{item.invoice_number || "N/A"}</td>
//                                         <td>
//                                           <button
//                                             className="p-eye-btn"
//                                             onClick={() => openItemModal(order.order_number, item.id)}
//                                             title="View Item Details"
//                                           >
//                                             👁️
//                                           </button>
//                                         </td>
//                                         <td>
//                                           {hasInvoiceGenerated ? (
//                                             <span className="p-invoice-generated-text" title="Invoice Already Generated">
//                                               Invoice Generated
//                                             </span>
//                                           ) : isItemSelected ? (
//                                             <span className="p-selected-text" title="Selected for invoice">
//                                               Selected ✓
//                                             </span>
//                                           ) : (() => {
//                                             const currentSelectedIds = selectedItems[order.id] || [];
//                                             if (currentSelectedIds.length > 0) {
//                                               const firstSelectedId = currentSelectedIds[0];
//                                               const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
//                                               if (firstSelectedItem && firstSelectedItem.credit_period !== item.credit_period) {
//                                                 return (
//                                                   <span className="p-different-period-text"
//                                                     title={`Different credit period (${item.credit_period} days vs selected ${firstSelectedItem.credit_period} days)`}>
//                                                     Different Period
//                                                   </span>
//                                                 );
//                                               }
//                                             }
//                                             return (
//                                               <span className="p-select-prompt-text" title="Select this item to generate invoice">
//                                                 Available
//                                               </span>
//                                             );
//                                           })()}
//                                         </td>
//                                       </tr>
//                                     );
//                                   })}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Order Details Modal */}
//       {showOrderModal && modalData && (
//         <div className="p-modal-overlay" onClick={closeModals}>
//           <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="p-modal-header">
//               <h3>Order Details - {modalData.order_number}</h3>
//               <button className="p-modal-close" onClick={closeModals}>×</button>
//             </div>
//             <div className="p-modal-body">
//               <div className="p-three-column-grid">
//                 <div className="p-column">
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Order Number:</span>
//                     <span className="p-detail-value">{modalData.order_number}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Customer Name:</span>
//                     <span className="p-detail-value">{modalData.customer_name}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Customer ID:</span>
//                     <span className="p-detail-value">{modalData.customer_id}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Staff ID:</span> {/* New Field */}
//                     <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Order Total:</span>
//                     <span className="p-detail-value">₹{(modalData.order_total ?? 0).toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Discount Amount:</span>
//                     <span className="p-detail-value">₹{(modalData.discount_amount ?? 0).toLocaleString()}</span>
//                   </div>
//                 </div>
//                 <div className="p-column">
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Taxable Amount:</span>
//                     <span className="p-detail-value">₹{(modalData.taxable_amount ?? 0).toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Tax Amount:</span>
//                     <span className="p-detail-value">₹{(modalData.tax_amount ?? 0).toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Net Payable:</span>
//                     <span className="p-detail-value">₹{(modalData.net_payable ?? 0).toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Credit Period:</span>
//                     <span className="p-detail-value">{modalData.credit_period} days</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Estimated Delivery:</span>
//                     <span className="p-detail-value">
//                       {modalData.estimated_delivery_date ? new Date(modalData.estimated_delivery_date).toLocaleDateString('en-GB') : 'N/A'}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-column">
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Invoice Number:</span>
//                     <span className="p-detail-value">{modalData.invoice_number}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Invoice Date:</span>
//                     <span className="p-detail-value">
//                       {modalData.invoice_date ? new Date(modalData.invoice_date).toLocaleDateString('en-GB') : 'N/A'}
//                     </span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Order Date:</span>
//                     <span className="p-detail-value">
//                       {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString('en-GB') : 'N/A'}
//                     </span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Last Updated:</span>
//                     <span className="p-detail-value">
//                       {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString('en-GB') : 'N/A'}
//                     </span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Order Mode:</span>
//                     <span className="p-detail-value">{modalData.order_mode || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-staff-info-section">
//                 <div className="p-three-column-grid">
//                   <div className="p-column">
//                     <div className="p-detail-row">
//                       <span className="p-detail-label">Assigned Staff:</span>
//                       <span className="p-detail-value staff-highlight">
//                         {modalData.assigned_staff || "N/A"}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="p-column">
//                     <div className="p-detail-row">
//                       <span className="p-detail-label">Staff ID:</span>
//                       <span className="p-detail-value">
//                         {modalData.staff_id || "N/A"}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="p-column">
//                     <div className="p-detail-row">
//                       <span className="p-detail-label">Staff Incentive:</span>
//                       <span className="p-detail-value incentive-highlight">
//                         ₹{parseFloat(modalData.staff_incentive) || 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showItemModal && modalData && (
//         <div className="p-modal-overlay" onClick={closeModals}>
//           <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="p-modal-header">
//               <h3>Item Details - {modalData.item_name}</h3>
//               <button className="p-modal-close" onClick={closeModals}>×</button>
//             </div>
//             <div className="p-modal-body">
//               <div className="p-three-column-grid">
//                 <div className="p-column">
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Item Name:</span>
//                     <span className="p-detail-value">{modalData.item_name}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Staff ID:</span> {/* New Field */}
//                     <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Product ID:</span>
//                     <span className="p-detail-value">{modalData.product_id}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Order Number:</span>
//                     <span className="p-detail-value">{modalData.order_number}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">MRP:</span>
//                     <span className="p-detail-value">₹{modalData.mrp.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Sale Price:</span>
//                     <span className="p-detail-value">₹{modalData.sale_price.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Invoice Number:</span>
//                     <span className="p-detail-value">{modalData.invoice_number || "N/A"}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Min Sale Price:</span>
//                     <span className="p-detail-value">₹{modalData.min_sale_price?.toLocaleString() || '0'}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Price:</span>
//                     <span className="p-detail-value">₹{modalData.price.toLocaleString()}</span>
//                   </div>
//                 </div>
//                 <div className="p-column">
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Total Amount:</span>
//                     <span className="p-detail-value">₹{modalData.total_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Discount %:</span>
//                     <span className="p-detail-value">{modalData.discount_percentage}%</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Discount Amount:</span>
//                     <span className="p-detail-value">₹{modalData.discount_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Taxable Amount:</span>
//                     <span className="p-detail-value">₹{modalData.taxable_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Tax %:</span>
//                     <span className="p-detail-value">{modalData.tax_percentage}%</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Tax Amount:</span>
//                     <span className="p-detail-value">₹{modalData.tax_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Item Total:</span>
//                     <span className="p-detail-value">₹{modalData.item_total.toLocaleString()}</span>
//                   </div>
//                 </div>
//                 <div className="p-column">
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Credit Period:</span>
//                     <span className="p-detail-value">{modalData.credit_period} days</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Credit Percentage:</span>
//                     <span className="p-detail-value">{modalData.credit_percentage}%</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">SGST %:</span>
//                     <span className="p-detail-value">{modalData.sgst_percentage}%</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">SGST Amount:</span>
//                     <span className="p-detail-value">₹{modalData.sgst_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">CGST %:</span>
//                     <span className="p-detail-value">{modalData.cgst_percentage}%</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">CGST Amount:</span>
//                     <span className="p-detail-value">₹{modalData.cgst_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="p-detail-row">
//                     <span className="p-detail-label">Discount Scheme:</span>
//                     <span className="p-detail-value">{modalData.discount_applied_scheme}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Period;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import './Period.css';
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaFilePdf, FaTrash, FaDownload, FaCheck, FaTimes } from 'react-icons/fa';

const Period = () => {
  const [openRow, setOpenRow] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState({});
  const [orderInvoices, setOrderInvoices] = useState({}); 
  const [loadingInvoices, setLoadingInvoices] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");
  const [itemApprovalStatus, setItemApprovalStatus] = useState({}); 

  useEffect(() => {
    fetchOrders();
    fetchNextInvoiceNumber();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      orders.forEach(order => {
        fetchInvoicesForOrder(order.order_number);
      });
    }
  }, [orders]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.p-invoice-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const fetchNextInvoiceNumber = async () => {
    try {
      console.log('Fetching next invoice number...');
      const response = await fetch(`${baseurl}/next-invoice-number`);

      if (response.ok) {
        const data = await response.json();
        console.log('Received next invoice number:', data.nextInvoiceNumber);
        setNextInvoiceNumber(data.nextInvoiceNumber);
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
            return;
          }
        }
      }
      setNextInvoiceNumber('INV001');
    } catch (err) {
      console.error('Error in fallback invoice number generation:', err);
      setNextInvoiceNumber('INV001');
    }
  };

  const fetchInvoicesForOrder = async (orderNumber) => {
    try {
      setLoadingInvoices(prev => ({ ...prev, [orderNumber]: true }));

      const response = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched invoices for ${orderNumber}:`, data.pdfs);

        setOrderInvoices(prev => ({
          ...prev,
          [orderNumber]: data.pdfs || []
        }));
      } else {
        console.error(`Failed to fetch invoices for ${orderNumber}:`, response.status);
        setOrderInvoices(prev => ({
          ...prev,
          [orderNumber]: []
        }));
      }
    } catch (error) {
      console.error(`Error fetching invoices for ${orderNumber}:`, error);
      setOrderInvoices(prev => ({
        ...prev,
        [orderNumber]: []
      }));
    } finally {
      setLoadingInvoices(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

  const handleDownloadSpecificPDF = async (orderNumber, pdfData) => {
    try {
      // Decode base64 PDF data
      const binaryString = window.atob(pdfData.data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfData.fileName || `Invoice_${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Downloaded PDF: ${pdfData.fileName}`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + error.message);
    }
  };

  const handleDownloadPDF = async (invoice) => {
    const orderNumber = invoice.order_number || invoice.originalData?.order_number;

    if (!orderNumber) {
      alert('Order number not found for this invoice');
      return;
    }

    try {
      setDownloading(prev => ({ ...prev, [orderNumber]: true }));

      // First, try to download the existing PDF using order_number
      const downloadResponse = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

      if (downloadResponse.ok) {
        const pdfBlob = await downloadResponse.blob();

        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;

        // Get filename from response headers or use default
        const contentDisposition = downloadResponse.headers.get('content-disposition');
        let filename = `Invoice_${invoice.number || orderNumber}.pdf`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('PDF downloaded successfully');

      } else if (downloadResponse.status === 404) {
        // PDF doesn't exist, generate it first
        console.log('PDF not found, generating new PDF...');

        // Note: You'll also need to update the generate-pdf endpoint to accept order_number
        const generateResponse = await fetch(`${baseurl}/transactions/generate-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_number: orderNumber })
        });

        if (generateResponse.ok) {
          const result = await generateResponse.json();
          console.log('PDF generated successfully:', result);

          // After generation, try downloading again
          const retryDownload = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);

          if (retryDownload.ok) {
            const pdfBlob = await retryDownload.blob();
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;

            // Get filename for the retry download as well
            const retryContentDisposition = retryDownload.headers.get('content-disposition');
            let retryFilename = `Invoice_${invoice.number || orderNumber}.pdf`;

            if (retryContentDisposition) {
              const filenameMatch = retryContentDisposition.match(/filename="(.+)"/);
              if (filenameMatch) {
                retryFilename = filenameMatch[1];
              }
            }

            link.download = retryFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('PDF downloaded after generation');
          } else {
            throw new Error('Failed to download PDF after generation');
          }
        } else {
          throw new Error('Failed to generate PDF');
        }
      } else {
        throw new Error(`Failed to download PDF: ${downloadResponse.status}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + error.message);
    } finally {
      setDownloading(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

const fetchOrders = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${baseurl}/orders/all-orders`);
    const ordersData = response.data;
    console.log("Raw API ordersData:", ordersData);
    
    // Filter orders based on approval_status and order_status
    const filteredOrdersData = ordersData.filter(order => {
      const approvalStatus = order.approval_status?.toString().toLowerCase();
      const orderStatus = order.order_status?.toString().toLowerCase();
      
      const isApproved = approvalStatus === "approved";
      
      const isNotCancelled = orderStatus !== "cancelled";
      
      return isApproved && isNotCancelled;
    });
    
    console.log(`Filtered orders: ${filteredOrdersData.length} out of ${ordersData.length}`);
    
    const ordersWithItems = await Promise.all(
      filteredOrdersData.map(async (order) => {
        try {
          let itemsData = [];
          
          try {
            const itemsRes = await axios.get(`${baseurl}/orders/details/${order.order_number}`);
            console.log(`Response for order ${order.order_number}:`, itemsRes.data);
            
            if (itemsRes.data && itemsRes.data.items) {
              itemsData = itemsRes.data.items;
            } else if (itemsRes.data && Array.isArray(itemsRes.data)) {
              itemsData = itemsRes.data;
            }
          } catch (error1) {
            console.log(`First API failed for ${order.order_number}, trying alternatives:`, error1.message);
            
            try {
              const itemsRes2 = await axios.get(`${baseurl}/orders/order-items/${order.order_number}`);
              console.log(`Alternative response for order ${order.order_number}:`, itemsRes2.data);
              
              if (itemsRes2.data && itemsRes2.data.items) {
                itemsData = itemsRes2.data.items;
              } else if (itemsRes2.data && Array.isArray(itemsRes2.data)) {
                itemsData = itemsRes2.data;
              }
            } catch (error2) {
              console.error(`All API attempts failed for order ${order.order_number}:`, error2.message);
              itemsData = [];
            }
          }
          
          console.log(`Fetched ${itemsData.length} items for order ${order.order_number}:`, itemsData);
          
          const orderMode = order.order_mode || "Pakka";
          const staffIncentive = parseFloat(order.staff_incentive) || 0;

          // Fetch account details by customer ID
          let accountDetails = null;
          try {
            const accountRes = await axios.get(`${baseurl}/accounts/${order.customer_id}`);
            
            accountDetails = accountRes.data;
                 console.log(`🔍 Account details for customer ${order.customer_id}:`, {
              credit_limit_raw: accountDetails.credit_limit,
              unpaid_amount_raw: accountDetails.unpaid_amount,
              balance_amount_raw: accountDetails.balance_amount,
              full_details: accountDetails
            });
          } catch (accountErr) {
            console.warn(`Could not fetch account details for customer ID ${order.customer_id}:`, accountErr.message);
            accountDetails = null;
          }

          const items = await Promise.all(
            itemsData.map(async (item) => {
              let min_sale_price = 0;

              try {
                const productRes = await axios.get(`${baseurl}/products/${item.product_id}`);
                min_sale_price = productRes.data.min_sale_price || 0;
              } catch (productErr) {
                console.warn(`Could not fetch product details for product ID ${item.product_id}:`, productErr.message);
                min_sale_price = 0;
              }

              // Check if item needs approval (sale_price < min_sale_price)
              const salePrice = parseFloat(item.sale_price) || 0;
              const needsApproval = salePrice < parseFloat(min_sale_price);

              // Use edited_sale_price if available, otherwise use sale_price
              const editedSalePrice = parseFloat(item.edited_sale_price) || salePrice;
              
              return {
                // order_items table columns
                id: item.id || item.item_id || 0,
                order_number: item.order_number || order.order_number,
                item_name: item.item_name || item.product_name || "N/A",
                product_id: item.product_id || 0,
                mrp: parseFloat(item.mrp) || 0,
                sale_price: salePrice,
                edited_sale_price: editedSalePrice,
                credit_charge: parseFloat(item.credit_charge) || 0,
                customer_sale_price: parseFloat(item.customer_sale_price) || editedSalePrice,
                final_amount: parseFloat(item.final_amount) || editedSalePrice,
                quantity: parseInt(item.quantity) || 1,
                total_amount: parseFloat(item.total_amount) || 0,
                discount_percentage: parseFloat(item.discount_percentage) || 0,
                discount_amount: parseFloat(item.discount_amount) || 0,
                taxable_amount: parseFloat(item.taxable_amount) || 0,
                tax_percentage: parseFloat(item.tax_percentage) || 0,
                tax_amount: parseFloat(item.tax_amount) || 0,
                item_total: parseFloat(item.item_total) || 0,
                credit_period: parseInt(item.credit_period) || 0,
                invoice_number: item.invoice_number || null,
                invoice_date: item.invoice_date || null,
                invoice_status: parseInt(item.invoice_status) || 0,
                credit_percentage: parseFloat(item.credit_percentage) || 0,
                sgst_percentage: parseFloat(item.sgst_percentage) || 0,
                sgst_amount: parseFloat(item.sgst_amount) || 0,
                cgst_percentage: parseFloat(item.cgst_percentage) || 0,
                cgst_amount: parseFloat(item.cgst_amount) || 0,
                discount_applied_scheme: item.discount_applied_scheme || "N/A",
                created_at: item.created_at,
                updated_at: item.updated_at,
                
                // Additional calculated fields
                min_sale_price: min_sale_price,
                needs_approval: needsApproval,
                approval_status: item.approval_status || "pending",
                staff_id: item.staff_id || order.staff_id || 0,
                assigned_staff: item.assigned_staff || order.assigned_staff || null,
                staff_incentive: parseFloat(item.staff_incentive) || 0,
                
                // For display purposes
                price: editedSalePrice
              };
            })
          );

          console.log(`Processed ${items.length} items for order ${order.order_number}`);

          const assignedStaff = order.assigned_staff || "N/A";
          const staffId = order.staff_id || "N/A";
          const orderStatus = order.order_status || "N/A";

          return {
            ...order,
            items: items,
            assigned_staff: assignedStaff,
            staff_id: staffId,
            order_status: orderStatus,
            staff_incentive: staffIncentive,
            account_details: accountDetails,
            order_mode: orderMode
          };
        } catch (error) {
          console.error(`Error processing order ${order.order_number}:`, error);
          return {
            ...order,
            items: [],
            assigned_staff: order.assigned_staff || "N/A",
            staff_id: order.staff_id || "N/A",
            order_status: order.order_status || "N/A",
            staff_incentive: parseFloat(order.staff_incentive) || 0,
            account_details: null,
            order_mode: order.order_mode || "Pakka"
          };
        }
      })
    );

    setOrders(ordersWithItems);
    setLoading(false);
  } catch (err) {
    console.error("Error fetching orders:", err);
    setLoading(false);
  }
};

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  // Updated handleItemSelect function with approval check
  const handleItemSelect = (orderId, itemId, isSelected, itemCreditPeriod) => {
    const item = orders.find(o => o.id === orderId)?.items?.find(i => i.id === itemId);
    
    // Check if item needs approval and is not approved
    if (item && item.needs_approval && item.approval_status !== "approved") {
      alert(`This item requires approval before it can be selected for invoice generation. Sale price (₹${item.sale_price}) is less than minimum sale price (₹${item.min_sale_price}).`);
      return;
    }

    setSelectedItems(prev => {
      const newSelected = { ...prev };
      const currentSelectedIds = newSelected[orderId] || [];
      const order = orders.find(o => o.id === orderId);

      if (!order || !order.items) return prev;

      if (isSelected) {
        // Auto-select all eligible items with the same credit period
        if (currentSelectedIds.length === 0) {
          // No items selected yet - select all eligible with this credit period
          const eligibleItems = order.items.filter(item =>
            item.credit_period === itemCreditPeriod &&
            item.invoice_status !== 1 &&
            (!item.needs_approval || item.approval_status === "approved")
          );
          newSelected[orderId] = eligibleItems.map(item => item.id);
        } else {
          // Some items already selected - check if credit period matches
          const firstSelectedItemId = currentSelectedIds[0];
          const firstSelectedItem = order.items.find(item => item.id === firstSelectedItemId);

          if (firstSelectedItem && firstSelectedItem.credit_period === itemCreditPeriod) {
            // Same credit period - add all remaining eligible items with this credit period
            const eligibleItems = order.items.filter(item =>
              item.credit_period === itemCreditPeriod &&
              item.invoice_status !== 1 &&
              !currentSelectedIds.includes(item.id) &&
              (!item.needs_approval || item.approval_status === "approved")
            );
            newSelected[orderId] = [...currentSelectedIds, ...eligibleItems.map(item => item.id)];
          } else {
            // Different credit period - alert and don't select
            alert(`Cannot select items with different credit periods. Selected items have ${firstSelectedItem?.credit_period} days, this item has ${itemCreditPeriod} days.`);
            return prev;
          }
        }
      } else {
        // Deselecting - remove only this specific item
        if (currentSelectedIds.includes(itemId)) {
          newSelected[orderId] = currentSelectedIds.filter(id => id !== itemId);
          if (newSelected[orderId].length === 0) {
            delete newSelected[orderId];
          }
        }
      }
      return newSelected;
    });
  };

  // Select all items in an order with credit period validation and approval check
  const handleSelectAll = (orderId, items) => {
    const currentSelectedIds = selectedItems[orderId] || [];
    const isAllSelected = currentSelectedIds.length === items.length;

    if (isAllSelected) {
      // Deselect all
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[orderId];
        return newSelected;
      });
    } else {
      // Check if all items have the same credit period
      const creditPeriods = [...new Set(items.map(item => item.credit_period))];
      if (creditPeriods.length > 1) {
        alert(`Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days. Please select items with the same credit period.`);
        return;
      }

      // Filter items that are eligible (no invoice generated and approved if needed)
      const eligibleItems = items.filter(item => {
        if (item.invoice_status === 1) return false; // Skip items with existing invoice
        if (item.needs_approval && item.approval_status !== "approved") return false; // Skip items needing approval but not approved
        return true;
      });

      if (eligibleItems.length === 0) {
        alert("No items available for selection. All items either have invoices generated or require approval.");
        return;
      }

      // Select all eligible items
      setSelectedItems(prev => ({
        ...prev,
        [orderId]: eligibleItems.map(item => item.id)
      }));
    }
  };

  // Handle item approval
  const handleApproveItem = async (itemId, orderId) => {
    try {
      // Find the item
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const item = order.items.find(i => i.id === itemId);
      if (!item) return;
      
      // Call API to update approval status
      const response = await axios.put(`${baseurl}/orders/items/${itemId}/approve`, {
        approval_status: "approved"
      });
      
      if (response.data.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                items: order.items.map(item => 
                  item.id === itemId 
                    ? { ...item, approval_status: "approved" }
                    : item
                )
              };
            }
            return order;
          })
        );
        
        alert("Item approved successfully!");
      }
    } catch (error) {
      console.error("Error approving item:", error);
      alert(`Failed to approve item: ${error.response?.data?.error || error.message}`);
    }
  };

  // Handle item rejection
  const handleRejectItem = async (itemId, orderId) => {
    try {
      // Find the item
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const item = order.items.find(i => i.id === itemId);
      if (!item) return;
      
      // Call API to update approval status
      const response = await axios.put(`${baseurl}/orders/items/${itemId}/approve`, {
        approval_status: "rejected"
      });
      
      if (response.data.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                items: order.items.map(item => 
                  item.id === itemId 
                    ? { ...item, approval_status: "rejected" }
                    : item
                )
              };
            }
            return order;
          })
        );
        
        alert("Item rejected successfully!");
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
      alert(`Failed to reject item: ${error.response?.data?.error || error.message}`);
    }
  };

  const openOrderModal = (orderId) => {
    const orderData = orders.find(order => order.id === orderId);
    if (orderData) {
      setModalData(orderData);
      setShowOrderModal(true);
    }
  };

  const openItemModal = (orderNumber, itemId) => {
    const order = orders.find(order => order.order_number === orderNumber);
    if (order && order.items) {
      const itemData = order.items.find(item => item.id === itemId);
      if (itemData) {
        setModalData(itemData);
        setShowItemModal(true);
      }
    }
  };

  // Close modals
  const closeModals = () => {
    setShowOrderModal(false);
    setShowItemModal(false);
    setModalData(null);
  };

 const handleGenerateInvoice = (order) => {
  try {
    setGeneratingInvoice(true);

    const orderSelectedItems = selectedItems[order.id] || [];
    if (orderSelectedItems.length === 0) {
      alert("Please select at least one item to generate invoice!");
      setGeneratingInvoice(false);
      return;
    }

    const itemsWithApprovalIssue = orderSelectedItems.map(itemId => {
      const item = order.items.find(i => i.id === itemId);
      return item;
    }).filter(item => 
      item.needs_approval && item.approval_status !== "approved"
    );

    if (itemsWithApprovalIssue.length > 0) {
      const itemNames = itemsWithApprovalIssue.map(i => i.item_name).join(', ');
      alert(`Cannot generate invoice for the following items because they require approval but are not approved: ${itemNames}`);
      setGeneratingInvoice(false);
      return;
    }

    const selectedItemsData = order.items.filter(item =>
      orderSelectedItems.includes(item.id)
    );

    const itemsWithInvoice = selectedItemsData.filter(item => item.invoice_status === 1);
    if (itemsWithInvoice.length > 0) {
      alert(`Some selected items already have invoices generated: ${itemsWithInvoice.map(i => i.item_name).join(', ')}`);
      setGeneratingInvoice(false);
      return;
    }

    let invoiceNumber = nextInvoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = `INV${order.order_number.replace('ORD', '')}`;
    }

    const accountDetails = order.account_details;
    const staffId = selectedItemsData[0]?.staff_id || order.staff_id || 0;
    
    const staffIncentive = order.staff_incentive || 0;

    // Prepare selected items with ALL order_items columns
    const selectedItemsWithAllColumns = selectedItemsData.map(item => ({
      // All order_items table columns
      id: item.id,
      order_number: item.order_number,
      item_name: item.item_name,
      product_id: item.product_id,
      mrp: item.mrp,
      sale_price: item.sale_price,
      edited_sale_price: item.edited_sale_price,
      credit_charge: item.credit_charge,
      customer_sale_price: item.customer_sale_price,
      final_amount: item.final_amount,
      quantity: item.quantity,
      total_amount: item.total_amount,
      discount_percentage: item.discount_percentage,
      discount_amount: item.discount_amount,
      taxable_amount: item.taxable_amount,
      tax_percentage: item.tax_percentage,
      tax_amount: item.tax_amount,
      item_total: item.item_total,
      credit_period: item.credit_period,
      invoice_number: item.invoice_number,
      invoice_date: item.invoice_date,
      invoice_status: item.invoice_status,
      credit_percentage: item.credit_percentage,
      sgst_percentage: item.sgst_percentage,
      sgst_amount: item.sgst_amount,
      cgst_percentage: item.cgst_percentage,
      cgst_amount: item.cgst_amount,
      discount_applied_scheme: item.discount_applied_scheme,
      created_at: item.created_at,
      updated_at: item.updated_at,
      
      // Additional fields
      min_sale_price: item.min_sale_price,
      needs_approval: item.needs_approval,
      approval_status: item.approval_status,
      staff_id: item.staff_id,
      assigned_staff: item.assigned_staff,
      staff_incentive: item.staff_incentive,
      
      // For backward compatibility
      price: item.price
    }));

    // FIXED: Convert NULL strings to actual null or 0
    const creditLimit = accountDetails?.credit_limit;
    const unpaidAmount = accountDetails?.unpaid_amount;
    const balanceAmount = accountDetails?.balance_amount;
    
    console.log("🔍 DEBUG - Account details from Period:", {
      credit_limit_raw: creditLimit,
      unpaid_amount_raw: unpaidAmount,
      balance_amount_raw: balanceAmount,
      credit_limit_type: typeof creditLimit,
      unpaid_amount_type: typeof unpaidAmount,
      balance_amount_type: typeof balanceAmount,
      accountDetails: accountDetails
    });
    
    // Convert values properly
    const parseCreditValue = (value) => {
      if (value === null || value === undefined || value === "NULL" || value === "null") {
        return 0;
      }
      if (typeof value === 'string') {
        // Remove any non-numeric characters except decimal point
        const cleanValue = value.replace(/[^0-9.-]+/g, '');
        return parseFloat(cleanValue) || 0;
      }
      return parseFloat(value) || 0;
    };

    const parsedCreditLimit = parseCreditValue(creditLimit);
    const parsedUnpaidAmount = parseCreditValue(unpaidAmount);
    const parsedBalanceAmount = parseCreditValue(balanceAmount);

    console.log("✅ Parsed credit values:", {
      credit_limit: parsedCreditLimit,
      unpaid_amount: parsedUnpaidAmount,
      balance_amount: parsedBalanceAmount
    });

    const invoiceData = {
      transactionType: 'stock transfer',
      
      orderNumber: order.order_number,
      invoiceNumber: invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

      originalOrder: {
        ...order,
        items: undefined
      },

      // Pass ALL order_items columns
      selectedItems: selectedItemsWithAllColumns,
      selectedItemIds: orderSelectedItems,

      selectedItemsTotal: {
        taxableAmount: selectedItemsData.reduce((sum, item) => sum + (item.taxable_amount || 0), 0),
        taxAmount: selectedItemsData.reduce((sum, item) => sum + (item.tax_amount || 0), 0),
        discountAmount: selectedItemsData.reduce((sum, item) => sum + (item.discount_amount || 0), 0),
        grandTotal: selectedItemsData.reduce((sum, item) => sum + (item.item_total || 0), 0),
        creditChargeTotal: selectedItemsData.reduce((sum, item) => sum + (item.credit_charge || 0), 0)
      },

      companyInfo: {
        name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        gstin: "10AAOCS1541B1ZZ",
        state: "Bihar"
      },

      customerInfo: {
        name: accountDetails?.name || order.customer_name,
        businessName: accountDetails?.business_name || order.customer_name,
        state: accountDetails?.billing_state || order.billing_state || "Karnataka",
        gstin: accountDetails?.gstin || order.gstin || "29AABCD0503B1ZG",
        id: order.customer_id,
        account_details: accountDetails,
        // FIXED: Pass parsed values
        credit_limit: parsedCreditLimit,
        unpaid_amount: parsedUnpaidAmount,
        balance_amount: parsedBalanceAmount,
      },

      billingAddress: accountDetails ? {
        addressLine1: accountDetails.billing_address_line1 || "Address not specified",
        addressLine2: accountDetails.billing_address_line2 || "",
        city: accountDetails.billing_city || "City not specified",
        pincode: accountDetails.billing_pin_code || "000000",
        state: accountDetails.billing_state || "Karnataka",
        gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
        country: accountDetails.billing_country || "India"
      } : {
        addressLine1: order.billing_address || "Address not specified",
        addressLine2: "",
        city: order.billing_city || "City not specified",
        pincode: order.billing_pincode || "000000",
        state: order.billing_state || "Karnataka"
      },

      shippingAddress: accountDetails ? {
        addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
        addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
        city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
        pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
        state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
        gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
        country: accountDetails.shipping_country || "India"
      } : {
        addressLine1: order.shipping_address || order.billing_address || "Address not specified",
        addressLine2: "",
        city: order.shipping_city || order.billing_city || "City not specified",
        pincode: order.shipping_pincode || order.billing_pincode || "000000",
        state: order.shipping_state || order.billing_state || "Karnataka"
      },

      note: "Thank you for your business!",
      transportDetails: "Standard delivery",
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",

      transactionType: 'stock transfer',
      selectedSupplierId: order.customer_id,
      PartyID: order.customer_id,
      AccountID: order.customer_id,
      PartyName: order.customer_name,
      AccountName: order.customer_name,

      isSingleItemInvoice: orderSelectedItems.length === 1,
      selectedItemId: orderSelectedItems.length === 1 ? orderSelectedItems[0] : null,
      originalOrderId: order.id,
      isMultiSelect: orderSelectedItems.length > 1,

      staff_id: staffId,
      staff_incentive: staffIncentive,
      order_mode: order.order_mode || "Pakka",
      fullAccountDetails: accountDetails,
      
      itemDetails: selectedItemsWithAllColumns.map(item => ({
        id: item.id,
        order_number: item.order_number,
        item_name: item.item_name,
        product_id: item.product_id,
        quantity: item.quantity,
        edited_sale_price: item.edited_sale_price,
        credit_charge: item.credit_charge,
        customer_sale_price: item.customer_sale_price,
        final_amount: item.final_amount,
        total_amount: item.total_amount,
        discount_percentage: item.discount_percentage,
        discount_amount: item.discount_amount,
        taxable_amount: item.taxable_amount,
        tax_percentage: item.tax_percentage,
        tax_amount: item.tax_amount,
        item_total: item.item_total,
        credit_period: item.credit_period,
        credit_percentage: item.credit_percentage,
        sgst_percentage: item.sgst_percentage,
        sgst_amount: item.sgst_amount,
        cgst_percentage: item.cgst_percentage,
        cgst_amount: item.cgst_amount,
        discount_applied_scheme: item.discount_applied_scheme
      }))
    };

    console.log("📋 Invoice data being sent:", {
      invoiceData: invoiceData,
      customerInfo: invoiceData.customerInfo,
      credit_values: {
        credit_limit: invoiceData.customerInfo.credit_limit,
        unpaid_amount: invoiceData.customerInfo.unpaid_amount,
        balance_amount: invoiceData.customerInfo.balance_amount
      }
    });

    navigate(`/periodinvoicepreviewpdf/${order.id}`, {
      state: {
        invoiceData,
        selectedItemIds: orderSelectedItems
      }
    });

  } catch (error) {
    console.error("Error preparing invoice:", error);
    alert("Failed to prepare invoice data. Please try again.");
    setGeneratingInvoice(false);
  }
};

  // Filter orders by search and date
  const filteredOrders = orders.filter(order => {
    const customerMatch = order.customer_name.toLowerCase().includes(search.toLowerCase());
    let startMatch = true;
    let endMatch = true;

    if (startDate) startMatch = new Date(order.created_at) >= new Date(startDate);
    if (endDate) endMatch = new Date(order.created_at) <= new Date(endDate);

    return customerMatch && startMatch && endMatch;
  });

  if (loading) return <div className="p-admin-layout">Loading orders...</div>;

  return (
    <div className="p-admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`p-admin-main ${isCollapsed ? 'p-sidebar-collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="p-period-page">
          {/* Filters Section */}
          <div className="p-filters-section">
            <div className="p-filter-row">
              <div className="p-filter-group">
                <input
                  type="text"
                  className="p-form-control"
                  placeholder="Search Customer Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="p-filter-group">
                <input
                  type="date"
                  className="p-form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="p-filter-group">
                <input
                  type="date"
                  className="p-form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="p-filter-group">
                <button className="p-btn p-btn-primary" onClick={() => { }}>Search</button>
              </div>
            </div>
          </div>

          <div className="p-table-container">
            <table className="p-customers-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Order Number</th>
                  <th>Customer Name</th>
                  <th>Order Total</th>
                  <th>Discount Amount</th>
                  <th>Assigned Staff</th>
                  <th>Order Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                  <th>Download Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isOrderOpen = openRow === order.id;
                  const orderSelectedItems = selectedItems[order.id] || [];
                  const allItemsSelected = order.items &&
                    orderSelectedItems.length === order.items.length;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="p-customer-row">
                        <td>
                          <button className="p-toggle-btn" onClick={() => toggleRow(order.id)}>
                            <span className={isOrderOpen ? "p-arrow-up" : "p-arrow-down"}></span>
                          </button>
                        </td>
                        <td>{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>₹{(order.order_total ?? 0).toLocaleString()}</td>
                        <td>₹{(order.discount_amount ?? 0).toLocaleString()}</td>
                        <td>{order.assigned_staff || "N/A"}</td>
                        <td>{order.order_status || "N/A"}</td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString('en-GB')}
                        </td>
                        <td>
                          <div className="p-action-buttons">
                            <button
                              className="p-eye-btn"
                              onClick={() => openOrderModal(order.id)}
                              title="View Order Details"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="p-invoice-dropdown">
                            <div className="p-dropdown-toggle">
                              <button
                                className={`p-btn p-btn-pdf ${orderInvoices[order.order_number]?.length > 0 ? 'p-btn-success' : 'p-btn-warning'}`}
                                disabled={loadingInvoices[order.order_number]}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!orderInvoices[order.order_number]) {
                                    fetchInvoicesForOrder(order.order_number);
                                  }
                                  setOpenDropdown(openDropdown === order.order_number ? null : order.order_number);
                                }}
                                title={orderInvoices[order.order_number]?.length > 0
                                  ? `Click to view ${orderInvoices[order.order_number].length} invoice(s)`
                                  : "Generate PDF"}
                              >
                                {loadingInvoices[order.order_number] ? (
                                  <span className="p-download-spinner">Loading...</span>
                                ) : orderInvoices[order.order_number]?.length > 0 ? (
                                  <>
                                    <FaDownload className="p-icon" />
                                    {orderInvoices[order.order_number].length} Invoice(s)
                                    <span className="p-dropdown-arrow">▼</span>
                                  </>
                                ) : (
                                  <>
                                    <FaFilePdf className="p-icon" />
                                    Generate PDF
                                  </>
                                )}
                              </button>

                              {openDropdown === order.order_number && orderInvoices[order.order_number]?.length > 0 && (
                                <div className="p-dropdown-menu">
                                  <div className="p-dropdown-header">
                                    <span>Available Invoices</span>
                                    <button
                                      className="p-close-dropdown"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(null);
                                      }}
                                      title="Close"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  {orderInvoices[order.order_number].map((pdf, index) => (
                                    <div
                                      key={index}
                                      className="p-dropdown-item"
                                      onClick={() => {
                                        handleDownloadSpecificPDF(order.order_number, pdf);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <FaFilePdf className="p-icon-sm" />
                                      <span className="p-invoice-filename">
                                        {pdf.fileName || `Invoice_${index + 1}.pdf`}
                                      </span>
                                      <FaDownload className="p-icon-sm p-download-icon" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {isOrderOpen && (
                        <tr className="p-invoices-row">
                          <td colSpan={10}>
                            <div className="p-invoices-section">
                              <div className="p-items-header">
                                <h4>Order Items</h4>
                                {orderSelectedItems.length > 0 && (
                                  <button
                                    className="p-generate-invoice-btn p-bulk-btn"
                                    onClick={() => handleGenerateInvoice(order)}
                                    disabled={generatingInvoice}
                                    title={`Generate invoice for ${orderSelectedItems.length} selected item(s)`}
                                  >
                                    {generatingInvoice ? "Preparing..." : `Generate Invoice for ${orderSelectedItems.length} Item(s)`}
                                  </button>
                                )}
                              </div>
                              {order.items && order.items.length > 0 ? (
                                <table className="p-invoices-table">
                                 <thead>
  <tr>
    <th style={{ width: '50px' }}>
      <input
        type="checkbox"
        checked={allItemsSelected}
        onChange={() => handleSelectAll(order.id, order.items)}
        className="p-item-checkbox"
        disabled={(() => {
          const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
          return creditPeriods.length > 1;
        })()}
        title={(() => {
          const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
          if (creditPeriods.length > 1) {
            return `Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days`;
          }
          return allItemsSelected ? "Deselect all items" : "Select all items";
        })()}
      />
    </th>
    <th>Item Name</th>
    <th>Qty</th>
       <th>Sale Price</th>        {/* Added Sale Price column */}
    <th>MSP</th>        
    <th>Edited Price</th>
    <th>Credit Charge</th>
    <th>Dst Amnt</th>
    <th>CP</th>
    <th>Inv No</th>
    <th>Approval Status</th>
    <th>Action</th>
    <th>Status</th>
  </tr>
</thead>
                                  <tbody>
                                    {order.items.map((item) => {
                                      const isItemSelected = orderSelectedItems.includes(item.id);
                                      const hasInvoiceGenerated = item.invoice_status === 1;
                                      const needsApproval = item.needs_approval;
                                      const approvalStatus = item.approval_status;

                                      return (
                                        <tr key={item.id}>
                                          <td>
                                            {hasInvoiceGenerated ? (
                                              <span title="Invoice Already Generated">✅</span>
                                            ) : (
                                              (() => {
                                                const currentSelectedIds = selectedItems[order.id] || [];

                                                if (currentSelectedIds.length === 0) {
                                                  const canSelect = !needsApproval || approvalStatus === "approved";
                                                  return (
                                                    <input
                                                      type="checkbox"
                                                      checked={isItemSelected && canSelect}
                                                      onChange={(e) => {
                                                        if (!canSelect) {
                                                          alert(`This item requires approval before it can be selected for invoice generation. Sale price (₹${item.sale_price}) is less than minimum sale price (₹${item.min_sale_price}).`);
                                                          return;
                                                        }
                                                        handleItemSelect(order.id, item.id, e.target.checked, item.credit_period);
                                                      }}
                                                      className="p-item-checkbox"
                                                      disabled={!canSelect}
                                                      title={!canSelect ? 
                                                        "Item requires approval before selection" : 
                                                        "Select for invoice generation"}
                                                    />
                                                  );
                                                }

                                                const firstSelectedId = currentSelectedIds[0];
                                                const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
                                                const selectedCreditPeriod = firstSelectedItem?.credit_period;

                                                const isSelectable = selectedCreditPeriod === item.credit_period;
                                                const canSelect = isSelectable && (!needsApproval || approvalStatus === "approved");

                                                return (
                                                  <input
                                                    type="checkbox"
                                                    checked={isItemSelected && canSelect}
                                                    onChange={(e) => {
                                                      if (!canSelect) {
                                                        if (!isSelectable) {
                                                          alert(`Items with different credit periods cannot be selected together. Selected items have ${selectedCreditPeriod} days, this item has ${item.credit_period} days.`);
                                                        } else {
                                                          alert(`This item requires approval before it can be selected for invoice generation. Sale price (₹${item.sale_price}) is less than minimum sale price (₹${item.min_sale_price}).`);
                                                        }
                                                        return;
                                                      }
                                                      handleItemSelect(order.id, item.id, e.target.checked, item.credit_period);
                                                    }}
                                                    className="p-item-checkbox"
                                                    disabled={!canSelect}
                                                    title={!canSelect ? 
                                                      (!isSelectable ? 
                                                        `Items with different credit periods cannot be selected together. Selected items have ${selectedCreditPeriod} days, this item has ${item.credit_period} days.` :
                                                        "Item requires approval before selection") :
                                                      "Select for invoice generation"}
                                                  />
                                                );
                                              })()
                                            )}
                                          </td>
                                          <td>{item.item_name}</td>
                                          <td>{item.quantity}</td>
                                         <td>₹{item.sale_price.toLocaleString()}</td>       
                                         <td>₹{item.min_sale_price.toLocaleString()}</td>   
                                         <td>₹{item.edited_sale_price.toLocaleString()}</td>
                                          <td>₹{item.credit_charge.toLocaleString()}</td>
                                          <td>₹{item.discount_amount.toLocaleString()}</td>
                                          <td>{item.credit_period}</td>
                                          <td>{item.invoice_number || "N/A"}</td>
                                          <td>
                                            {needsApproval ? (
                                              <div className="p-approval-status">
                                                <span className={`p-approval-badge p-${approvalStatus}`}>
                                                  {approvalStatus === "approved" ? "Approved" : 
                                                   approvalStatus === "rejected" ? "Rejected" : "Pending"}
                                                </span>
                                                {approvalStatus === "pending" && (
                                                  <div className="p-approval-buttons">
                                                    <button
                                                      className="p-btn p-btn-approve"
                                                      onClick={() => handleApproveItem(item.id, order.id)}
                                                      title="Approve this item"
                                                    >
                                                      <FaCheck />
                                                    </button>
                                                    <button
                                                      className="p-btn p-btn-reject"
                                                      onClick={() => handleRejectItem(item.id, order.id)}
                                                      title="Reject this item"
                                                    >
                                                      <FaTimes />
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="p-approval-badge p-not-required">
                                                Not Required
                                              </span>
                                            )}
                                          </td>
                                          <td>
                                            <button
                                              className="p-eye-btn"
                                              onClick={() => openItemModal(order.order_number, item.id)}
                                              title="View Item Details"
                                            >
                                              👁️
                                            </button>
                                          </td>
                                          <td>
                                            {hasInvoiceGenerated ? (
                                              <span className="p-invoice-generated-text" title="Invoice Already Generated">
                                                Invoice Generated
                                              </span>
                                            ) : isItemSelected ? (
                                              <span className="p-selected-text" title="Selected for invoice">
                                                Selected ✓
                                              </span>
                                            ) : (() => {
                                              const currentSelectedIds = selectedItems[order.id] || [];
                                              if (currentSelectedIds.length > 0) {
                                                const firstSelectedId = currentSelectedIds[0];
                                                const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
                                                if (firstSelectedItem && firstSelectedItem.credit_period !== item.credit_period) {
                                                  return (
                                                    <span className="p-different-period-text"
                                                      title={`Different credit period (${item.credit_period} days vs selected ${firstSelectedItem.credit_period} days)`}>
                                                      Different Period
                                                    </span>
                                                  );
                                                }
                                              }
                                              
                                              if (needsApproval && approvalStatus !== "approved") {
                                                return (
                                                  <span className="p-requires-approval-text"
                                                    title={`Requires approval. Sale price (₹${item.sale_price}) < Min price (₹${item.min_sale_price})`}>
                                                    Requires Approval
                                                  </span>
                                                );
                                              }
                                              
                                              return (
                                                <span className="p-select-prompt-text" title="Select this item to generate invoice">
                                                  Available
                                                </span>
                                              );
                                            })()}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="p-no-items">
                                  <p>No items found for this order.</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && modalData && (
        <div className="p-modal-overlay" onClick={closeModals}>
          <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Order Details - {modalData.order_number}</h3>
              <button className="p-modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="p-modal-body">
              <div className="p-three-column-grid">
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Number:</span>
                    <span className="p-detail-value">{modalData.order_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer Name:</span>
                    <span className="p-detail-value">{modalData.customer_name}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer ID:</span>
                    <span className="p-detail-value">{modalData.customer_id}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Staff ID:</span>
                    <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Total:</span>
                    <span className="p-detail-value">₹{(modalData.order_total ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Amount:</span>
                    <span className="p-detail-value">₹{(modalData.discount_amount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Taxable Amount:</span>
                    <span className="p-detail-value">₹{(modalData.taxable_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax Amount:</span>
                    <span className="p-detail-value">₹{(modalData.tax_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Net Payable:</span>
                    <span className="p-detail-value">₹{(modalData.net_payable ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Period:</span>
                    <span className="p-detail-value">{modalData.credit_period} days</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Estimated Delivery:</span>
                    <span className="p-detail-value">
                      {modalData.estimated_delivery_date ? new Date(modalData.estimated_delivery_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Number:</span>
                    <span className="p-detail-value">{modalData.invoice_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Date:</span>
                    <span className="p-detail-value">
                      {modalData.invoice_date ? new Date(modalData.invoice_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Date:</span>
                    <span className="p-detail-value">
                      {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Last Updated:</span>
                    <span className="p-detail-value">
                      {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Mode:</span>
                    <span className="p-detail-value">{modalData.order_mode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-staff-info-section">
                <div className="p-three-column-grid">
                  <div className="p-column">
                    <div className="p-detail-row">
                      <span className="p-detail-label">Assigned Staff:</span>
                      <span className="p-detail-value staff-highlight">
                        {modalData.assigned_staff || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="p-column">
                    <div className="p-detail-row">
                      <span className="p-detail-label">Staff ID:</span>
                      <span className="p-detail-value">
                        {modalData.staff_id || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="p-column">
                    <div className="p-detail-row">
                      <span className="p-detail-label">Staff Incentive:</span>
                      <span className="p-detail-value incentive-highlight">
                        ₹{parseFloat(modalData.staff_incentive) || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemModal && modalData && (
        <div className="p-modal-overlay" onClick={closeModals}>
          <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Item Details - {modalData.item_name}</h3>
              <button className="p-modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="p-modal-body">
              <div className="p-three-column-grid">
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Item Name:</span>
                    <span className="p-detail-value">{modalData.item_name}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Staff ID:</span>
                    <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Product ID:</span>
                    <span className="p-detail-value">{modalData.product_id}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Number:</span>
                    <span className="p-detail-value">{modalData.order_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">MRP:</span>
                    <span className="p-detail-value">₹{modalData.mrp.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Sale Price:</span>
                    <span className="p-detail-value">₹{modalData.sale_price.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Edited Sale Price:</span>
                    <span className="p-detail-value">₹{modalData.edited_sale_price.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Charge:</span>
                    <span className="p-detail-value">₹{modalData.credit_charge.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer Sale Price:</span>
                    <span className="p-detail-value">₹{modalData.customer_sale_price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Final Amount:</span>
                    <span className="p-detail-value">₹{modalData.final_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Quantity:</span>
                    <span className="p-detail-value">{modalData.quantity}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Total Amount:</span>
                    <span className="p-detail-value">₹{modalData.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount %:</span>
                    <span className="p-detail-value">{modalData.discount_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Amount:</span>
                    <span className="p-detail-value">₹{modalData.discount_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Taxable Amount:</span>
                    <span className="p-detail-value">₹{modalData.taxable_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax %:</span>
                    <span className="p-detail-value">{modalData.tax_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax Amount:</span>
                    <span className="p-detail-value">₹{modalData.tax_amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Item Total:</span>
                    <span className="p-detail-value">₹{modalData.item_total.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Period:</span>
                    <span className="p-detail-value">{modalData.credit_period} days</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Percentage:</span>
                    <span className="p-detail-value">{modalData.credit_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">SGST %:</span>
                    <span className="p-detail-value">{modalData.sgst_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">SGST Amount:</span>
                    <span className="p-detail-value">₹{modalData.sgst_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">CGST %:</span>
                    <span className="p-detail-value">{modalData.cgst_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">CGST Amount:</span>
                    <span className="p-detail-value">₹{modalData.cgst_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Scheme:</span>
                    <span className="p-detail-value">{modalData.discount_applied_scheme}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Approval Status:</span>
                    <span className="p-detail-value">
                      {modalData.needs_approval ? (
                        <span className={`p-approval-badge p-${modalData.approval_status}`}>
                          {modalData.approval_status === "approved" ? "Approved" : 
                           modalData.approval_status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      ) : (
                        <span className="p-approval-badge p-not-required">Not Required</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Period;