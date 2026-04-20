import { useState, useEffect } from "react";
import { baseurl } from "../../../BaseURL/BaseURL";

export const useInvoices = (orders) => {
  const [orderInvoices, setOrderInvoices] = useState({});
  const [loadingInvoices, setLoadingInvoices] = useState({});

  useEffect(() => {
    if (orders.length > 0) {
      orders.forEach(order => {
        fetchInvoicesForOrder(order.order_number);
      });
    }
  }, [orders]);

  const fetchInvoicesForOrder = async (orderNumber) => {
    try {
      setLoadingInvoices(prev => ({ ...prev, [orderNumber]: true }));
      const response = await fetch(`${baseurl}/transactions/download-pdf?order_number=${encodeURIComponent(orderNumber)}`);
      if (response.ok) {
        const data = await response.json();
        setOrderInvoices(prev => ({
          ...prev,
          [orderNumber]: data.pdfs || []
        }));
      } else {
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
      const pdfModule = await import('./InvoicceprintOrder');
      const InvoicceprintOrder = pdfModule.default;
      const { pdf } = await import('@react-pdf/renderer');
      
      const order = orders.find(o => o.order_number === orderNumber);
      if (!order) {
        alert('Order not found');
        return;
      }

      const invoiceNumber = `INV${order.order_number.replace('ORD', '')}`;
      const accountDetails = order.account_details || {};

      const invoiceData = {
        orderNumber: order.order_number,
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        companyInfo: {
          name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
          address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
          email: "spmathur56@gmail.com",
          phone: "9801049700",
          gstin: "10AAOCS1541B1ZZ",
          state: "Bihar"
        },
        supplierInfo: {
          name: accountDetails?.name || order.customer_name,
          businessName: accountDetails?.business_name || order.customer_name,
          gstin: accountDetails?.gstin || order.gstin || "N/A",
          state: accountDetails?.billing_state || order.billing_state || "Karnataka",
          email: accountDetails?.email || "customer@example.com"
        },
        shippingAddress: accountDetails ? {
          addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
          addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
          city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
          pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
          state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
          country: accountDetails.shipping_country || "India"
        } : {
          addressLine1: order.shipping_address || order.billing_address || "Address not specified",
          city: order.shipping_city || order.billing_city || "City not specified",
          pincode: order.shipping_pincode || order.billing_pincode || "000000",
          state: order.shipping_state || order.billing_state || "Karnataka"
        },
        items: order.items.map(item => ({
          product: item.item_name,
          description: item.item_name,
          quantity: item.flash_offer === 1 ? item.buy_quantity || item.quantity : item.quantity,
          flash_offer: item.flash_offer || 0,
          buy_quantity: item.buy_quantity || 0,
          get_quantity: item.get_quantity || 0,
          price: item.edited_sale_price || item.sale_price,
          net_price: item.net_price || item.edited_sale_price || item.sale_price,
          discount_amount: item.discount_amount || 0,
          credit_charge: item.credit_charge || 0,
          taxable_amount: item.taxable_amount || 0,
          gst: item.tax_percentage || 0,
          tax_amount: item.tax_amount || 0,
          cgst_amount: item.cgst_amount || 0,
          sgst_amount: item.sgst_amount || 0
        })),
        order_mode: order.order_mode || "PAKKA",
        assigned_staff: order.assigned_staff || "N/A",
        note: "Thank you for your business!"
      };

      const pdfDoc = <InvoicceprintOrder
        invoiceData={invoiceData}
        invoiceNumber={invoiceNumber}
        gstBreakdown={{}}
        isSameState={true}
      />;

      const blob = await pdf(pdfDoc).toBlob();
      const fileName = `Invoice_${orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + error.message);
    }
  };

  return {
    orderInvoices,
    loadingInvoices,
    fetchInvoicesForOrder,
    handleDownloadSpecificPDF
  };
};