import { useState } from "react";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/orders/all-orders`);
      const ordersData = response.data;
      
      const filteredOrdersData = ordersData.filter(order => {
        const approvalStatus = order.approval_status?.toString().toLowerCase();
        const orderStatus = order.order_status?.toString().toLowerCase();
        const isApproved = approvalStatus === "approved";
        const isNotCancelled = orderStatus !== "cancelled";
        return isApproved && isNotCancelled;
      });

      const ordersWithItems = await Promise.all(
        filteredOrdersData.map(async (order) => {
          try {
            let itemsData = [];
            
            try {
              const itemsRes = await axios.get(`${baseurl}/orders/details/${order.order_number}`);
              itemsData = itemsRes.data?.items || (Array.isArray(itemsRes.data) ? itemsRes.data : []);
            } catch (error1) {
              try {
                const itemsRes2 = await axios.get(`${baseurl}/orders/order-items/${order.order_number}`);
                itemsData = itemsRes2.data?.items || (Array.isArray(itemsRes2.data) ? itemsRes2.data : []);
              } catch (error2) {
                itemsData = [];
              }
            }

            const orderMode = order.order_mode || "Pakka";
            const staffIncentive = parseFloat(order.staff_incentive) || 0;
            
            let accountDetails = null;
            try {
              const accountRes = await axios.get(`${baseurl}/accounts/${order.customer_id}`);
              accountDetails = accountRes.data;
            } catch (accountErr) {
              accountDetails = null;
            }

            const items = await Promise.all(
              itemsData.map(async (item) => {
                let min_sale_price = 0;
                let stock_quantity = 0;
                let stock_insufficient = false;
                
                try {
                  const productRes = await axios.get(`${baseurl}/products/${item.product_id}`);
                  min_sale_price = productRes.data.min_sale_price || 0;
                  
                  try {
                    const batchesRes = await axios.get(`${baseurl}/products/${item.product_id}/batches`);
                    if (batchesRes.data && Array.isArray(batchesRes.data)) {
                      stock_quantity = batchesRes.data.reduce((total, batch) => {
                        return total + (parseFloat(batch.quantity) || 0);
                      }, 0);
                      
                      const itemQuantity = parseInt(item.quantity) || 1;
                      if (itemQuantity > stock_quantity) {
                        stock_insufficient = true;
                      }
                    }
                  } catch (batchErr) {
                    // Ignore batch errors
                  }
                } catch (productErr) {
                  min_sale_price = 0;
                }

                const salePrice = parseFloat(item.sale_price) || 0;
                const editedSalePrice = parseFloat(item.edited_sale_price) || salePrice;
                const needsApproval = salePrice < parseFloat(min_sale_price);
                const flashOffer = parseInt(item.flash_offer) || 0;
                const buyQuantity = parseInt(item.buy_quantity) || 0;
                const getQuantity = parseInt(item.get_quantity) || 0;

                return {
                  id: item.id || item.item_id || 0,
                  order_number: item.order_number || order.order_number,
                  item_name: item.item_name || item.product_name || "N/A",
                  product_id: item.product_id || 0,
                  mrp: parseFloat(item.mrp) || 0,
                  sale_price: salePrice,
                  edited_sale_price: editedSalePrice,
                  net_price: parseFloat(item.net_price) || 0,
                  weight: parseFloat(item.weight) || 0,
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
                  min_sale_price: min_sale_price,
                  needs_approval: needsApproval,
                  approval_status: item.approval_status || "pending",
                  staff_id: item.staff_id || order.staff_id || 0,
                  assigned_staff: item.assigned_staff || order.assigned_staff || null,
                  staff_incentive: parseFloat(item.staff_incentive) || 0,
                  price: editedSalePrice,
                  stock_quantity: stock_quantity,
                  stock_insufficient: stock_insufficient,
                  can_edit: salePrice < parseFloat(min_sale_price),
                  flash_offer: flashOffer,
                  buy_quantity: buyQuantity,
                  get_quantity: getQuantity
                };
              })
            );

            return {
              ...order,
              items: items,
              assigned_staff: order.assigned_staff || "N/A",
              staff_id: order.staff_id || "N/A",
              order_status: order.order_status || "N/A",
              staff_incentive: staffIncentive,
              account_details: accountDetails,
              order_mode: orderMode
            };
          } catch (error) {
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
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (orderId, itemId, isSelected, itemCreditPeriod) => {
    const order = orders.find(o => o.id === orderId);
    const item = order?.items?.find(i => i.id === itemId);

    if (item?.needs_approval && item.approval_status !== "approved") {
      alert(`This item requires approval before it can be selected for invoice generation.`);
      return;
    }

    setSelectedItems(prev => {
      const newSelected = { ...prev };
      const currentSelectedIds = newSelected[orderId] || [];
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.items) return prev;

      if (isSelected) {
        if (currentSelectedIds.length === 0) {
          const eligibleItems = order.items.filter(item =>
            item.credit_period === itemCreditPeriod &&
            item.invoice_status !== 1 &&
            (!item.needs_approval || item.approval_status === "approved")
          );
          newSelected[orderId] = eligibleItems.map(item => item.id);
        } else {
          const firstSelectedItemId = currentSelectedIds[0];
          const firstSelectedItem = order.items.find(item => item.id === firstSelectedItemId);
          if (firstSelectedItem && firstSelectedItem.credit_period === itemCreditPeriod) {
            const eligibleItems = order.items.filter(item =>
              item.credit_period === itemCreditPeriod &&
              item.invoice_status !== 1 &&
              !currentSelectedIds.includes(item.id) &&
              (!item.needs_approval || item.approval_status === "approved")
            );
            newSelected[orderId] = [...currentSelectedIds, ...eligibleItems.map(item => item.id)];
          } else {
            alert(`Cannot select items with different credit periods.`);
            return prev;
          }
        }
      } else {
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

  const handleSelectAll = (orderId, items) => {
    const currentSelectedIds = selectedItems[orderId] || [];
    const isAllSelected = currentSelectedIds.length === items.length;

    if (isAllSelected) {
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[orderId];
        return newSelected;
      });
    } else {
      const creditPeriods = [...new Set(items.map(item => item.credit_period))];
      if (creditPeriods.length > 1) {
        alert(`Cannot select all items because they have different credit periods.`);
        return;
      }

      const eligibleItems = items.filter(item => {
        if (item.invoice_status === 1) return false;
        if (item.needs_approval && item.approval_status !== "approved") return false;
        return true;
      });

      if (eligibleItems.length === 0) {
        alert("No items available for selection.");
        return;
      }

      setSelectedItems(prev => ({
        ...prev,
        [orderId]: eligibleItems.map(item => item.id)
      }));
    }
  };

  const handleApproveItem = async (itemId, orderId) => {
    try {
      const response = await axios.put(`${baseurl}/orders/items/${itemId}/approve`, {
        approval_status: "approved"
      });

      if (response.data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                items: order.items.map(item =>
                  item.id === itemId ? { ...item, approval_status: "approved" } : item
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

  const handleRejectItem = async (itemId, orderId) => {
    try {
      const response = await axios.put(`${baseurl}/orders/items/${itemId}/approve`, {
        approval_status: "rejected"
      });

      if (response.data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                items: order.items.map(item =>
                  item.id === itemId ? { ...item, approval_status: "rejected" } : item
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

  const handleEditItem = (order, item, navigate) => {
    console.log("Editing item:", item);
    
    // Prepare all calculations for the checkout page
    const newEditedPrice = item.edited_sale_price || item.sale_price;
    const discountPercentage = item.discount_percentage || 0;
    const creditPeriod = item.credit_period || 0;
    const quantity = item.quantity || 1;
    const gstPercentage = item.tax_percentage || 18;
    const creditPercentage = item.credit_percentage || 2;
    
    // Recalculate all values based on the new edited price
    const taxableAmount = newEditedPrice;
    const discountAmount = taxableAmount * (discountPercentage / 100);
    const priceAfterDiscount = taxableAmount - discountAmount;
    const taxAmount = taxableAmount * (gstPercentage / 100);
    const sgstPercentage = gstPercentage / 2;
    const cgstPercentage = gstPercentage / 2;
    const sgstAmount = taxAmount / 2;
    const cgstAmount = taxAmount / 2;
    
    let creditCharge = 0;
    if (creditPeriod > 0) {
      creditCharge = (taxableAmount * creditPercentage * creditPeriod) / (30 * 100);
    }
    
    const finalAmount = taxableAmount + taxAmount + creditCharge;
    const customerSalePrice = finalAmount;
    const itemTotal = finalAmount * quantity;
    const totalDiscount = discountAmount * quantity;
    const totalTax = taxAmount * quantity;
    const totalTaxableAmount = taxableAmount * quantity;
    const totalCreditCharges = creditCharge * quantity;
    const finalTotal = itemTotal;

    const cartItem = {
      product_id: item.product_id,
      item_name: item.item_name,
      quantity: item.quantity,
      sale_price: item.sale_price,
      edited_sale_price: newEditedPrice,
      mrp: item.mrp,
      min_sale_price: item.min_sale_price,
      credit_period: creditPeriod,
      staff_incentive: item.staff_incentive || 0,
      discount_percentage: discountPercentage,
      tax_percentage: gstPercentage,
      credit_percentage: creditPercentage,
      
      breakdown: {
        perUnit: {
          mrp: item.mrp,
          sale_price: item.sale_price,
          edited_sale_price: newEditedPrice,
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
    };

    const orderTotals = {
      subtotal: itemTotal,
      totalTax: totalTax,
      totalDiscount: totalDiscount,
      totalTaxableAmount: totalTaxableAmount,
      totalCreditCharges: totalCreditCharges,
      finalTotal: finalTotal,
      itemCount: 1,
      userDiscount: discountPercentage
    };

    navigate('/retailers/checkout', {
      state: {
        retailerId: order.customer_id,
        customerName: order.customer_name,
        displayName: order.customer_name,
        discount: order.discount_amount || 0,
        cartItems: [cartItem],
        staffId: order.staff_id,
        orderTotals: orderTotals,
        userDiscountPercentage: discountPercentage,
        creditPeriods: creditPeriod,
        isEditMode: true,
        editOrderNumber: order.order_number,
        editItemId: item.id,
        originalItemData: item,
        calculationParams: {
          discountPercentage: discountPercentage,
          gstPercentage: gstPercentage,
          creditPercentage: creditPercentage,
          quantity: quantity
        }
      }
    });
  };

  return {
    orders,
    loading,
    selectedItems,
    setSelectedItems,
    fetchOrders,
    handleApproveItem,
    handleRejectItem,
    handleItemSelect,
    handleSelectAll,
    handleEditItem  // Now properly defined and returned
  };
};