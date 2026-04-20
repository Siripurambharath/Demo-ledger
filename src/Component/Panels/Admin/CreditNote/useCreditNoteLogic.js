import { useEffect, useState } from "react";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { useNavigate } from "react-router-dom";

const useCreditNoteLogic = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState("");
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // Product + Batch lists
  const [products, setProducts] = useState([]);
  const [productBatches, setProductBatches] = useState({});

  // Editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedProduct, setEditedProduct] = useState("");
  const [editedBatch, setEditedBatch] = useState("");
  const [editedQuantity, setEditedQuantity] = useState("");

  // ------------------------------------------------------------------------------------
  // FETCH ALL TRANSACTIONS
  // ------------------------------------------------------------------------------------
  const fetchAllTransactions = async () => {
    setLoadingInvoices(true);
    const res = await axios.get(`${baseurl}/transactions`);
    setLoadingInvoices(false);
    return res.data;
  };

  // ------------------------------------------------------------------------------------
  // CALCULATE AVAILABLE QUANTITY (Sales - Credit Notes)
  // ------------------------------------------------------------------------------------
  const calculateAvailableQuantity = (invoiceNumber, product, batch) => {
    // Get all transactions for this invoice's product and batch
    const allTransactions = JSON.parse(localStorage.getItem('allTransactions') || '[]');
    
    console.log("=== CALCULATE AVAILABLE QUANTITY DEBUG ===");
    console.log("Input - Invoice:", invoiceNumber, "Product:", product, "Batch:", batch);
    
    // Find the original sales transaction
    const salesTransaction = allTransactions.find(t => 
      t.InvoiceNumber === invoiceNumber && 
      t.TransactionType === "Sales"
    );
    
    if (!salesTransaction) {
      console.log("❌ No sales transaction found for invoice:", invoiceNumber);
      return 0;
    }
    
    const salesItems = salesTransaction.batch_details || salesTransaction.items || [];
    const salesItem = salesItems.find(item => item.product === product && item.batch === batch);
    
    if (!salesItem) {
      console.log("❌ No matching sales item found for product:", product, "batch:", batch);
      return 0;
    }
    
    const originalSalesQty = parseFloat(salesItem.quantity) || 0;
    console.log("✅ Original Sales Quantity:", originalSalesQty);
    
    const creditNotes = allTransactions.filter(t => 
      t.TransactionType === "CreditNote" && 
      t.InvoiceNumber === invoiceNumber  
    );
    
    console.log("Credit Notes for this invoice:", creditNotes.length);
    
    let totalCreditedQty = 0;
    creditNotes.forEach((cn, index) => {
      const cnItems = cn.batch_details || cn.items || [];
      const cnItem = cnItems.find(item => item.product === product && item.batch === batch);
      
      if (cnItem) {
        const creditedQty = parseFloat(cnItem.quantity) || 0;
        console.log(`✅ Found credit item - Quantity: ${creditedQty}`);
        totalCreditedQty += creditedQty;
      }
    });
    
    console.log("📊 Total Credited Quantity:", totalCreditedQty);
    
    // Available quantity = Original Sales - Total Credit Notes
    const availableQty = originalSalesQty - totalCreditedQty;
    console.log("🎯 Final Available Quantity:", availableQty, `(${originalSalesQty} - ${totalCreditedQty})`);
    console.log("=== END DEBUG ===\n");
    
    return availableQty;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const creditNo = await axios.get(`${baseurl}/api/next-creditnote-number`);
        setCreditNoteNumber(creditNo.data.nextCreditNoteNumber || "CNOTE001");

        const all = await fetchAllTransactions();
        // Store all transactions for quantity calculations
        localStorage.setItem('allTransactions', JSON.stringify(all));
        
        console.log("🔄 INITIAL LOAD - All Transactions Count:", all.length);
        
        const salesInvoices = all.filter(t => t.TransactionType === "Sales");
        console.log("📈 Sales Invoices Count:", salesInvoices.length);
        
        setInvoiceList(salesInvoices);
      } catch (err) {
        setError("Failed to load initial data");
      }
    };

    init();
  }, []);

  // ------------------------------------------------------------------------------------
  // LOAD CUSTOMER + ITEM DETAILS WHEN INVOICE SELECTED
  // ------------------------------------------------------------------------------------
  useEffect(() => {
    const loadCustomer = async () => {
      if (!selectedInvoice) {
        setCustomerData(null);
        setItems([]);
        setProducts([]);
        setProductBatches({});
        return;
      }

      setLoadingCustomer(true);

      const all = await fetchAllTransactions();
      const inv = all.find(t => t.InvoiceNumber === selectedInvoice);

      console.log("🔄 INVOICE SELECTED DEBUG ===");
      console.log("Selected Invoice:", selectedInvoice);

      if (!inv) {
        console.log("❌ Invoice not found");
        setLoadingCustomer(false);
        return;
      }

      setCustomerData(inv);

      const itemList = inv.batch_details || inv.items || [];
      console.log("📦 Raw Items from Invoice:", itemList.length);
      
      // Enhance items with available quantity
      const enhancedItems = itemList.map(item => {
        const availableQty = calculateAvailableQuantity(
          selectedInvoice, 
          item.product, 
          item.batch
        );
        
        const enhancedItem = {
          ...item,
          originalQuantity: parseFloat(item.quantity) || 0, 
          availableQuantity: availableQty,
          quantity: availableQty > 0 ? availableQty : 0, 
          soldQuantity: parseFloat(item.quantity) || 0,
          creditedQuantity: (parseFloat(item.quantity) || 0) - availableQty
        };
        
        console.log("🎯 Enhanced Item:", {
          product: enhancedItem.product,
          batch: enhancedItem.batch,
          sold: enhancedItem.soldQuantity,
          credited: enhancedItem.creditedQuantity,
          available: enhancedItem.availableQuantity
        });
        return enhancedItem;
      });

      console.log("📊 Final Enhanced Items Count:", enhancedItems.length);
      setItems(enhancedItems);

      // Extract unique products
      const uniqueProducts = [...new Set(enhancedItems.map(i => i.product))];
      setProducts(uniqueProducts);

      // Create a mapping of product → batches
      const batchMap = {};
      enhancedItems.forEach((i) => {
        if (!batchMap[i.product]) batchMap[i.product] = [];
        if (!batchMap[i.product].includes(i.batch)) batchMap[i.product].push(i.batch);
      });

      setProductBatches(batchMap);
      console.log("📋 Products:", uniqueProducts);

      setLoadingCustomer(false);
    };

    loadCustomer();
  }, [selectedInvoice]);

  // ------------------------------------------------------------------------------------
  // EDIT LOGIC - UPDATED WITH QUANTITY VALIDATION
  // ------------------------------------------------------------------------------------
  const handleEditClick = (index, item) => {
    console.log("✏️ EDIT CLICKED - Index:", index, "Available Qty:", item.availableQuantity);
    setEditingIndex(index);
    setEditedProduct(item.product);
    setEditedBatch(item.batch);
    setEditedQuantity(item.quantity);
  };

  const handleCancelEdit = () => {
    console.log("❌ EDIT CANCELLED");
    setEditingIndex(null);
    setEditedProduct("");
    setEditedBatch("");
    setEditedQuantity("");
  };

  const handleQuantityChange = (e) => {
    console.log("🔢 QUANTITY CHANGED:", e.target.value);
    setEditedQuantity(e.target.value);
  };

  const handleProductChange = (e) => {
    console.log("📦 PRODUCT CHANGED:", e.target.value);
    setEditedProduct(e.target.value);
    setEditedBatch("");
  };

  const handleBatchChange = (e) => {
    console.log("🏷️ BATCH CHANGED:", e.target.value);
    setEditedBatch(e.target.value);
  };

  const handleUpdateItem = (index) => {
    console.log("💾 UPDATE ITEM - Index:", index);

    if (!editedProduct || !editedBatch || !editedQuantity) {
      alert("Please fill all fields");
      return;
    }

    const availableQty = calculateAvailableQuantity(selectedInvoice, editedProduct, editedBatch);
    const requestedQty = parseFloat(editedQuantity);

    console.log("📊 Quantity Check - Available:", availableQty, "Requested:", requestedQty);

    if (requestedQty > availableQty) {
      alert(`Maximum available quantity is ${availableQty}`);
      return;
    }

    const updated = [...items];
    const originalItem = items.find(item => 
      item.product === editedProduct && item.batch === editedBatch
    );

    updated[index] = {
      ...updated[index],
      product: editedProduct,
      batch: editedBatch,
      quantity: requestedQty,
      originalQuantity: originalItem?.originalQuantity || 0,
      availableQuantity: availableQty,
      soldQuantity: originalItem?.soldQuantity || 0,
      creditedQuantity: (originalItem?.soldQuantity || 0) - availableQty + requestedQty
    };

    console.log("✅ UPDATED ITEM - New Credit Qty:", requestedQty);
    setItems(updated);
    handleCancelEdit();
  };

  const handleDeleteItem = (index) => {
    console.log("🗑️ DELETE ITEM - Index:", index);
    if (window.confirm("Delete this item?")) {
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
    }
  };

  // ------------------------------------------------------------------------------------
  // CALCULATE TOTALS
  // ------------------------------------------------------------------------------------
  const totals = {
    taxableAmount: items.reduce((s, i) => s + i.quantity * i.price, 0).toFixed(2),
    totalIGST: items.reduce((s, i) => s + (i.quantity * i.price * i.igst) / 100, 0).toFixed(2),
    grandTotal: items.reduce(
      (s, i) => s + i.quantity * i.price * (1 + i.igst / 100),
      0
    ).toFixed(2)
  };
const handleCreateCreditNote = async () => {
  try {
    let accountData = {};

    if (customerData?.AccountID || customerData?.customer_id) {
      const accRes = await axios.get(
        `${baseurl}/accounts/${customerData.AccountID || customerData.customer_id}`
      );
      accountData = accRes.data || {};
    }

    const payload = {
      data_type: "Sales",
      TransactionType: "CreditNote",
      creditNoteNumber,
      noteDate,
      InvoiceNumber: selectedInvoice,
      AccountID: customerData?.AccountID || null,
      PartyID: customerData?.PartyID || null,
      PartyName: customerData?.PartyName || accountData.name || "Customer",

      account_name: accountData.account_name || "",
      business_name: accountData.business_name || "",

      items: items.map(({ originalQuantity, availableQuantity, soldQuantity, creditedQuantity, ...rest }) => rest),
    };

    await axios.post(`${baseurl}/transaction`, payload);

    alert("✅ Credit Note Created!");
    navigate("/sales/credit_note");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to create credit note");
  }
};


  // ------------------------------------------------------------------------------------
  // RETURN EVERYTHING FOR UI
  // ------------------------------------------------------------------------------------
  return {
    // Layout
    isCollapsed,
    setIsCollapsed,

    // Display + errors
    error,

    // Header fields
    creditNoteNumber,
    noteDate,
    setNoteDate,
    selectedInvoice,
    setSelectedInvoice,

    // Invoice list
    invoiceList,
    loadingInvoices,

    // Customer
    customerData,
    loadingCustomer,

    // Items
    items,
    products,
    productBatches,

    // Edit state
    editingIndex,
    editedProduct,
    editedBatch,
    editedQuantity,

    // Edit handlers
    handleEditClick,
    handleCancelEdit,
    handleQuantityChange,
    handleProductChange,
    handleBatchChange,
    handleUpdateItem,
    handleDeleteItem,

    // Totals
    totals,

    // Creating credit note
    handleCreateCreditNote,
  };
};

export default useCreditNoteLogic;