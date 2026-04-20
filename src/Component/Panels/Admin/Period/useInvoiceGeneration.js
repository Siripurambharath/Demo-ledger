import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";

export const useInvoiceGeneration = (orders, selectedItems, navigate) => {
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/next-invoice-number`);
      if (response.ok) {
        const data = await response.json();
        setNextInvoiceNumber(data.nextInvoiceNumber);
      } else {
        generateFallbackInvoiceNumber();
      }
    } catch (err) {
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
            setNextInvoiceNumber(`INV${nextNum.toString().padStart(3, '0')}`);
            return;
          }
        }
      }
      setNextInvoiceNumber('INV001');
    } catch (err) {
      setNextInvoiceNumber('INV001');
    }
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
      }).filter(item => item.needs_approval && item.approval_status !== "approved");

      if (itemsWithApprovalIssue.length > 0) {
        const itemNames = itemsWithApprovalIssue.map(i => i.item_name).join(', ');
        alert(`Cannot generate invoice for the following items because they require approval: ${itemNames}`);
        setGeneratingInvoice(false);
        return;
      }

      const selectedItemsData = order.items.filter(item => orderSelectedItems.includes(item.id));
      const itemsWithInvoice = selectedItemsData.filter(item => item.invoice_status === 1);

      if (itemsWithInvoice.length > 0) {
        alert(`Some selected items already have invoices generated.`);
        setGeneratingInvoice(false);
        return;
      }

      let invoiceNumber = nextInvoiceNumber || `INV${order.order_number.replace('ORD', '')}`;
      const accountDetails = order.account_details;
      const staffId = selectedItemsData[0]?.staff_id || order.staff_id || 0;
      const staffIncentive = order.staff_incentive || 0;

      const selectedItemsWithAllColumns = selectedItemsData.map(item => ({
        id: item.id,
        order_number: item.order_number,
        item_name: item.item_name,
        product_id: item.product_id,
        mrp: item.mrp,
        sale_price: item.sale_price,
        edited_sale_price: item.edited_sale_price,
        net_price: item.net_price || 0,
        weight: item.weight || 0,
        flash_offer: item.flash_offer || 0,
        buy_quantity: item.buy_quantity || 0,
        get_quantity: item.get_quantity || 0,
        credit_charge: item.credit_charge,
        customer_sale_price: item.customer_sale_price,
        final_amount: item.final_amount,
        quantity: item.flash_offer === 1 ? item.buy_quantity : item.quantity,
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
        min_sale_price: item.min_sale_price,
        needs_approval: item.needs_approval,
        approval_status: item.approval_status,
        staff_id: item.staff_id,
        assigned_staff: item.assigned_staff,
        staff_incentive: item.staff_incentive,
        price: item.price
      }));

      const parseCreditValue = (value) => {
        if (value === null || value === undefined || value === "NULL" || value === "null") return 0;
        if (typeof value === 'string') return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
        return parseFloat(value) || 0;
      };

      const parsedCreditLimit = parseCreditValue(accountDetails?.credit_limit);
      const parsedUnpaidAmount = parseCreditValue(accountDetails?.unpaid_amount);
      const parsedBalanceAmount = parseCreditValue(accountDetails?.balance_amount);

      const invoiceData = {
        transactionType: 'stock transfer',
        orderNumber: order.order_number,
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        originalOrder: { ...order, items: undefined },
        flashOfferSummary: {
          hasFlashOffer: selectedItemsData.some(item => item.flash_offer === 1),
          totalItemsWithFlashOffer: selectedItemsData.filter(item => item.flash_offer === 1).length
        },
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
        order_mode: order.order_mode || "",
        fullAccountDetails: accountDetails,
        itemDetails: selectedItemsWithAllColumns.map(item => ({
          id: item.id,
          order_number: item.order_number,
          item_name: item.item_name,
          product_id: item.product_id,
          quantity: item.flash_offer === 1 ? item.buy_quantity : item.quantity,
          edited_sale_price: item.edited_sale_price,
          net_price: item.net_price || 0,
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

      navigate(`/periodinvoicepreviewpdf/${order.id}`, {
        state: { invoiceData, selectedItemIds: orderSelectedItems }
      });
    } catch (error) {
      console.error("Error preparing invoice:", error);
      alert("Failed to prepare invoice data. Please try again.");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  return {
    generatingInvoice,
    handleGenerateInvoice,
    fetchNextInvoiceNumber
  };
};