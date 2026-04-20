import { useState } from "react";
import DispatchReportPDF from './DispatchReportPDF';

export const useDispatchReport = (orders, activeTab, startDate, endDate, search) => {
  const [selectedOrdersForDispatch, setSelectedOrdersForDispatch] = useState([]);

  const handleGenerateDispatchReport = async () => {
    try {
      if (selectedOrdersForDispatch.length === 0) {
        alert("Please select at least one order to generate dispatch report!");
        return;
      }

      const selectedOrdersData = orders.filter(order =>
        selectedOrdersForDispatch.includes(order.id)
      );

      const ordersWithDateMatch = selectedOrdersData.filter(order => {
        let dateMatch = true;
        if (startDate) dateMatch = dateMatch && new Date(order.created_at) >= new Date(startDate);
        if (endDate) dateMatch = dateMatch && new Date(order.created_at) <= new Date(endDate);
        return dateMatch;
      });

      if (ordersWithDateMatch.length === 0) {
        alert("No orders match the selected date range. Please adjust dates or select different orders.");
        return;
      }

      const allDispatchItems = [];
      let totalWeightAllOrders = 0;
      let totalAmountAllOrders = 0;

      ordersWithDateMatch.forEach(order => {
        order.items.forEach(item => {
          const salePrice = parseFloat(item.sale_price) || 0;
          const quantity = item.flash_offer === 1 ?
            (parseInt(item.buy_quantity) || parseInt(item.quantity) || 1) :
            (parseInt(item.quantity) || 1);
          
          const amount = salePrice * quantity;
          const weightPerUnit = parseFloat(item.weight) || 0;
          const itemWeight = weightPerUnit * quantity;

          allDispatchItems.push({
            item_name: item.item_name,
            weight: itemWeight,
            weight_per_unit: weightPerUnit,
            quantity: item.flash_offer === 1 ? `${item.buy_quantity || item.quantity}` : item.quantity,
            actual_quantity: quantity,
            amount: amount,
            sale_price: salePrice,
            flash_offer: item.flash_offer,
            buy_quantity: item.buy_quantity,
            get_quantity: item.get_quantity,
            order_number: order.order_number,
            customer_name: order.customer_name,
            invoice_number: item.invoice_number || order.invoice_number,
            invoice_status: item.invoice_status || 0,
            created_at: order.created_at,
            has_invoice: item.invoice_status === 1
          });

          totalWeightAllOrders += itemWeight;
          totalAmountAllOrders += amount;
        });
      });

      if (allDispatchItems.length === 0) {
        alert("No items found in selected orders.");
        return;
      }

      const dispatchData = {
        orders: ordersWithDateMatch.map(order => ({
          orderNumber: order.order_number,
          customerName: order.account_details?.name || order.customer_name,
          invoiceNumber: order.invoice_number || `ORD${order.order_number.replace('ORD', '')}`,
          invoiceDate: new Date().toISOString().split('T')[0],
          orderDate: order.created_at,
          orderStatus: order.order_status || "N/A",
          items: order.items.map(item => {
            const salePrice = parseFloat(item.sale_price) || 0;
            const quantity = item.flash_offer === 1 ?
              (parseInt(item.buy_quantity) || parseInt(item.quantity) || 1) :
              (parseInt(item.quantity) || 1);
            const amount = salePrice * quantity;
            const weightPerUnit = parseFloat(item.weight) || 0;
            const itemWeight = weightPerUnit * quantity;

            return {
              item_name: item.item_name,
              weight: itemWeight,
              weight_per_unit: weightPerUnit,
              quantity: item.flash_offer === 1 ? `${item.buy_quantity || item.quantity}` : item.quantity,
              actual_quantity: quantity,
              amount: amount,
              sale_price: salePrice,
              get_quantity: item.get_quantity || 0,
              flash_offer: item.flash_offer,
              invoice_status: item.invoice_status || 0,
              has_invoice: item.invoice_status === 1
            };
          })
        })),
        allItems: allDispatchItems,
        totalWeight: totalWeightAllOrders.toFixed(2),
        totalAmount: totalAmountAllOrders,
        totalItemsWithInvoice: allDispatchItems.filter(item => item.has_invoice).length,
        totalItemsWithoutInvoice: allDispatchItems.filter(item => !item.has_invoice).length,
        companyInfo: {
          name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
          address: "PATNA ROAD, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
          email: "spmathur56@gmail.com",
          phone: "9801049700",
          gstin: "10AAOCS1541B1ZZ"
        },
        transportDetails: { vehicleNo: "To be filled" },
        filterInfo: {
          fromDate: startDate,
          toDate: endDate,
          customerSearch: search,
          totalOrders: selectedOrdersForDispatch.length,
          ordersInDateRange: ordersWithDateMatch.length,
          activeTab: activeTab
        },
        totalSelectedOrders: selectedOrdersForDispatch.length,
        totalFilteredOrders: ordersWithDateMatch.length,
        totalItems: allDispatchItems.length,
        reportDate: new Date().toISOString().split('T')[0]
      };

      const { pdf } = await import('@react-pdf/renderer');
      const pdfDoc = <DispatchReportPDF invoiceData={dispatchData} />;
      const blob = await pdf(pdfDoc).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, '_blank');
      
      if (newTab) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (error) {
      console.error("Error generating dispatch report:", error);
      alert("Failed to generate dispatch report. Please try again.");
    }
  };

  return {
    selectedOrdersForDispatch,
    setSelectedOrdersForDispatch,
    handleGenerateDispatchReport
  };
};