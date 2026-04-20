import React, { useState, useEffect ,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from '../../../BaseURL/BaseURL';
import './Voucher.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import VoucherPDF from '../Vochur/VoucherPDF';
import Select from 'react-select';


const KachaPurchaseVochurTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [receiptData, setReceiptData] = useState([]);
  const [nextReceiptNumber, setNextReceiptNumber] = useState('REC001');
  const [hasFetchedReceiptNumber, setHasFetchedReceiptNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2026');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Voucher');
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [invoiceBalance, setInvoiceBalance] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
const [isRangeDownloading, setIsRangeDownloading] = useState(false);
const pdfRef = useRef();
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
  const y = 2025 + i;
  return { value: y, label: y };
});
  const [formData, setFormData] = useState({
    receiptNumber: 'REC001',
    supplierId: '',
    amount: '',
    currency: 'INR',
    paymentMethod: 'Cash',
    receiptDate: new Date().toISOString().split('T')[0],
    note: '',
    bankName: '',
    transactionDate: '',
    reconciliationOption: 'Do Not Reconcile',
    supplierMobile: '',
    supplierEmail: '',
    supplierGstin: '',
    suppliername: '',
    transactionProofFile: '',
    invoiceNumber: '',
          account_name: '', 
  business_name: '' 
  });

  const fetchInvoices = async () => {
    try {
      console.log('Fetching bharath from:', `${baseurl}/api/purchasevouchersnumber?type=stock inward`);
      const response = await fetch(`${baseurl}/api/purchasevouchersnumber?type=stock inward`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received invoices data:', data);
        
        if (Array.isArray(data)) {
          const invoiceNumbers = data.map(invoice => ({
     id: invoice.VoucherID || invoice.id,
  number: invoice.InvoiceNumber || invoice.VchNo,
  total_amount: invoice.TotalAmount || 0,
  paid_amount: invoice.paid_amount || 0,
  supplier_id: invoice.PartyID   // ✅ ADD THIS
}));

          console.log('Processed invoice numbers:', invoiceNumbers);
          setInvoices(invoiceNumbers);
        } else if (typeof data === 'object') {
          const invoiceArray = data.invoices || data.data || [];
          const invoiceNumbers = invoiceArray.map(invoice => ({
            id: invoice.VoucherID || invoice.id || Math.random(),
            number: invoice.VchNo || invoice.invoice_number || invoice.number || 'Unknown',
            total_amount: invoice.TotalAmount || invoice.total_amount || 0,
            paid_amount: invoice.paid_amount || 0
          }));
          console.log('Processed invoice numbers from object:', invoiceNumbers);
          setInvoices(invoiceNumbers);
        } else {
          console.warn('Unexpected invoices data format:', data);
          setInvoices([]);
        }
      } else {
        console.error('Failed to fetch invoices. Status:', response.status);
        await fetchInvoicesFromAlternativeEndpoint();
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      await fetchInvoicesFromAlternativeEndpoint();
    }
  };

  const fetchInvoicesFromAlternativeEndpoint = async () => {
    try {
      console.log('Trying alternative endpoint for invoices...');
      const endpoints = [
        `${baseurl}/api/invoices`,
        `${baseurl}/api/purchase-invoices`,
        `${baseurl}/api/purchasevouchers`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            console.log(`Found invoices at ${endpoint}:`, data);
            
            if (Array.isArray(data)) {
              const invoiceNumbers = data.map(invoice => ({
                id: invoice.id || invoice.VoucherID || Math.random(),
                number: invoice.invoice_number || invoice.VchNo || invoice.number || 'Unknown',
                total_amount: invoice.TotalAmount || invoice.total_amount || invoice.amount || 0,
                paid_amount: invoice.paid_amount || 0
              }));
              setInvoices(invoiceNumbers);
              return;
            }
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err);
        }
      }
      
      setInvoices([]);
    } catch (err) {
      console.error('Error in alternative invoice fetch:', err);
      setInvoices([]);
    }
  };

 const fetchInvoiceBalance = async (supplierId, invoiceNumber) => {
  if (!supplierId || !invoiceNumber) {
    setInvoiceBalance(0);
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
    return;
  }

  try {
    setIsFetchingBalance(true);
    console.log(`Fetching balance for supplier ${supplierId}, invoice ${invoiceNumber}`);
    
    const existingReceipt = receiptData.find(receipt => {
      const receiptSupplierId = receipt.PartyID || receipt.supplier?.id || receipt.AccountID;
      const receiptInvoiceNumbers = receipt.invoice_numbers || [receipt.InvoiceNumber];
      
      return receiptSupplierId == supplierId && 
             receiptInvoiceNumbers.includes(invoiceNumber);
    });

    if (existingReceipt) {
      console.log('Found existing receipt data:', existingReceipt);
      
      // Try different possible balance fields
      const balanceAmount = 
        existingReceipt.total_balance_amount ||
        existingReceipt.balance_amount ||
        (parseFloat(existingReceipt.total_invoice_amount || 0) - 
         parseFloat(existingReceipt.total_paid_amount || 0)) ||
        (parseFloat(existingReceipt.TotalAmount || 0) - 
         parseFloat(existingReceipt.paid_amount || 0)) ||
        0;
      
      console.log('Calculated balance from existing data:', balanceAmount);
      
      if (balanceAmount > 0) {
        setInvoiceBalance(balanceAmount);
        setFormData(prev => ({
          ...prev,
          amount: balanceAmount
        }));
      } else {
        setInvoiceBalance(0);
        setFormData(prev => ({
          ...prev,
          amount: ''
        }));
        alert('This invoice has no outstanding balance.');
      }
      
      setIsFetchingBalance(false);
      return;
    }

    // If not found in existing data, call the API
    try {
      const response = await fetch(
        `${baseurl}/api/purchase-invoice-balance?supplier_id=${supplierId}&invoice_number=${invoiceNumber}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received balance data from API:', data);
        
        // Extract balance from API response
        const balanceAmount = 
          data.total_balance_amount ||
          data.balance_amount ||
          (parseFloat(data.total_invoice_amount || 0) - parseFloat(data.total_paid_amount || 0)) ||
          0;
        
        console.log('Extracted balance amount:', balanceAmount);
        
        if (balanceAmount > 0) {
          setInvoiceBalance(balanceAmount);
          setFormData(prev => ({
            ...prev,
            amount: balanceAmount
          }));
        } else {
          setInvoiceBalance(0);
          setFormData(prev => ({
            ...prev,
            amount: ''
          }));
          alert('This invoice is already fully paid or has no balance.');
        }
      } else {
        console.warn('Balance API returned status:', response.status);
        // Fallback to local invoice data
        await fetchBalanceFromLocalInvoices(invoiceNumber);
      }
    } catch (apiError) {
      console.error('API error fetching balance:', apiError);
      // Fallback to local invoice data
      await fetchBalanceFromLocalInvoices(invoiceNumber);
    }
  } catch (err) {
    console.error('Error in fetchInvoiceBalance:', err);
    setInvoiceBalance(0);
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
  } finally {
    setIsFetchingBalance(false);
  }
};

const fetchBalanceFromLocalInvoices = async (invoiceNumber) => {
  const selectedInvoiceData = invoices.find(inv => inv.number === invoiceNumber);
  if (selectedInvoiceData) {
    const invoiceAmount = parseFloat(selectedInvoiceData.total_amount || 0);
    const paidAmount = parseFloat(selectedInvoiceData.paid_amount || 0);
    const balance = invoiceAmount - paidAmount;
    
    if (balance > 0) {
      setInvoiceBalance(balance);
      setFormData(prev => ({
        ...prev,
        amount: balance
      }));
    } else {
      setInvoiceBalance(0);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
      alert('This invoice is already fully paid based on local data.');
    }
  } else {
    console.log('Invoice not found in local data');
    // Show empty amount
    setInvoiceBalance(0);
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
  }
};
useEffect(() => {
  console.log('Balance fetch triggered:', {
    supplierId: formData.supplierId,
    invoiceNumber: formData.invoiceNumber,
    hasSupplier: !!formData.supplierId,
    hasInvoice: !!formData.invoiceNumber
  });
  
  if (formData.supplierId && formData.invoiceNumber) {
    const timer = setTimeout(() => {
      fetchInvoiceBalance(formData.supplierId, formData.invoiceNumber);
    }, 300);
    
    return () => clearTimeout(timer);
  } else {
    // Clear amount if either is missing
    setInvoiceBalance(0);
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
  }
}, [formData.supplierId, formData.invoiceNumber]);

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }
    
      setFormData(prev => ({
        ...prev,
        transactionProofFile: file
      }));
    }
  };

  // Filter vouchers by date range
const filterVouchersByDateRange = (vouchers, start, end) => {
  if (!start || !end) return vouchers;
  
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  
  return vouchers.filter(voucher => {
    const voucherDate = new Date(voucher.Date || voucher.receipt_date || voucher.created_at);
    return voucherDate >= startDate && voucherDate <= endDate;
  });
};

// Filter vouchers by month and year
const filterVouchersByMonthYear = (vouchers, month, year) => {
  if (!month || !year) return vouchers;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.indexOf(month);
  
  return vouchers.filter(voucher => {
    const voucherDate = new Date(voucher.Date || voucher.receipt_date || voucher.created_at);
    return voucherDate.getMonth() === monthIndex && 
           voucherDate.getFullYear() === parseInt(year);
  });
};

// Generate PDF using the VoucherPDF component
const generatePDF = async (filteredData, type = 'month') => {
  if (!filteredData || filteredData.length === 0) {
    alert('No Kacha purchase vouchers found for the selected period');
    return;
  }

  try {
    // Create a temporary div to render the PDF component
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    // Use ReactDOM to render the component
    const ReactDOM = require('react-dom');
    await new Promise((resolve) => {
      ReactDOM.render(
        <VoucherPDF 
          ref={pdfRef}
          vouchers={filteredData}
          startDate={type === 'range' ? startDate : null}
          endDate={type === 'range' ? endDate : null}
          month={type === 'month' ? month : null}
          year={type === 'month' ? year : null}
          title="Kacha Purchase Vouchers Report" // Custom title for Kacha
        />,
        element,
        resolve
      );
    });

    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);

    // Generate filename
    let filename = 'kacha_purchase_vouchers_report';
    if (type === 'range') {
      filename = `kacha_purchase_vouchers_${startDate}_to_${endDate}.pdf`;
    } else {
      filename = `kacha_purchase_vouchers_${month}_${year}.pdf`;
    }

    // Save PDF
    pdf.save(filename);

    // Cleanup
    ReactDOM.unmountComponentAtNode(element);
    document.body.removeChild(element);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
  }
};



  // File remove handler
  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      transactionProofFile: null
    }));
  };

  const receiptStats = [
    { label: 'Total Receipts', value: '₹ 2,50,000', change: '+18%', type: 'total' },
    { label: 'Cash Receipts', value: '₹ 1,50,000', change: '+15%', type: 'cash' },
    { label: 'Bank Receipts', value: '₹ 80,000', change: '+20%', type: 'bank' },
    { label: 'Digital Receipts', value: '₹ 20,000', change: '+25%', type: 'digital' }
  ];

  const columns = [
    { 
      key: 'payee', 
      title: 'Supplier Name', 
      style: { textAlign: 'left' },
      render: (value, row) => {
        const businessName =
         
          row?.payee_name ||
          row?.supplier_name ||
          'N/A';

        return businessName;
      }
    },
    { 
      key: 'VchNo', 
      title: 'VOUCHER NUMBER', 
      style: { textAlign: 'center' },
      render: (value, row) => (
        <button
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleViewReceipt(row.VoucherID)}
          title="Click to view receipt"
        >
          {value || 'N/A'}
        </button>
      )
    },
    { 
      key: 'paid_amount', 
      title: 'AMOUNT', 
      style: { textAlign: 'right' },
      render: (value) => value || '₹ 0.00'
    },
    { 
      key: 'payment_method', 
      title: 'PAYMENT METHOD', 
      style: { textAlign: 'center' },
      render: (value) => value || 'N/A'
    },
    {
      key:'InvoiceNumber',
      title:'Accounting',
      style:{textAlign:'center'},
      render:(value) => value || '0'
    },
    {
      key: 'Date',
      title: 'DATE',
      style: { textAlign: 'center' },
      render: (value) => {
        if (!value) return 'N/A';

        const dateObj = new Date(value);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}-${month}-${year}`;
      }
    }
  ];
 const tabs = [
    { name: ' Kacha Purchase Invoice', path: '/kachapurchaseinvoicetable' },
    // { name: 'Purchase Order', path: '/purchase/purchase-order' },
    { name: 'Voucher', path: '/kachaPurchasevoucher' },
    { name: 'Debit Note', path: '/kachadebitnotetable' },
    // { name: 'Payables', path: '/purchase/payables' }
  ];

  // Fetch next receipt number
  const fetchNextReceiptNumber = async () => {
    try {
      console.log('Fetching next receipt number from:', `${baseurl}/api/next-receipt-number`);
      const response = await fetch(`${baseurl}/api/next-receipt-number`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received next receipt number:', data.nextReceiptNumber);
        setNextReceiptNumber(data.nextReceiptNumber);
        setFormData(prev => ({
          ...prev,
          receiptNumber: data.nextReceiptNumber
        }));
        setHasFetchedReceiptNumber(true);
      } else {
        console.error('Failed to fetch next receipt number. Status:', response.status);
        await generateFallbackReceiptNumber();
      }
    } catch (err) {
      console.error('Error fetching next receipt number:', err);
      await generateFallbackReceiptNumber();
    }
  };

  // Fallback receipt number generation
  const generateFallbackReceiptNumber = async () => {
    try {
      console.log('Attempting fallback receipt number generation...');
      const response = await fetch(`${baseurl}/api/last-receipt`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastReceiptNumber) {
          const lastNumber = data.lastReceiptNumber;
          const numberMatch = lastNumber.match(/REC(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1], 10) + 1;
            const fallbackReceiptNumber = `REC${nextNum.toString().padStart(3, '0')}`;
            console.log('Fallback receipt number generated:', fallbackReceiptNumber);
            setNextReceiptNumber(fallbackReceiptNumber);
            setFormData(prev => ({
              ...prev,
              receiptNumber: fallbackReceiptNumber
            }));
            setHasFetchedReceiptNumber(true);
            return;
          }
        }
      }
      // Default fallback
      setNextReceiptNumber('REC001');
      setFormData(prev => ({
        ...prev,
        receiptNumber: 'REC001'
      }));
      setHasFetchedReceiptNumber(true);
    } catch (err) {
      console.error('Error in fallback receipt number generation:', err);
      setNextReceiptNumber('REC001');
      setFormData(prev => ({
        ...prev,
        receiptNumber: 'REC001'
      }));
      setHasFetchedReceiptNumber(true);
    }
  };
const fetchReceipts = async () => {
  try {
    setIsLoading(true);
    
    const response = await fetch(`${baseurl}/api/voucher?data_type=stock inward`);
    
    if (response.ok) {
      const data = await response.json();
      
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.receipt_date || a.created_at || a.VoucherDate || new Date());
        const dateB = new Date(b.receipt_date || b.created_at || b.VoucherDate || new Date());
        return dateB - dateA || (b.VoucherID || b.id) - (a.VoucherID || a.id);
      });

      const transformedData = sortedData.map(receipt => {
        // Calculate balance amount if not present
        const totalAmount = parseFloat(receipt.TotalAmount || receipt.total_amount || 0);
        const paidAmount = parseFloat(receipt.paid_amount || 0);
        const balanceAmount = receipt.total_balance_amount || 
                             receipt.balance_amount || 
                             (totalAmount - paidAmount);
        
        return {
          ...receipt,
          id: receipt.id || '',
          supplier: receipt.supplier || {
            business_name: receipt.payee_name || receipt.supplier_name || receipt.PartyName || 'N/A' 
          },
          payee: receipt.supplier?.business_name || receipt.payee_name || receipt.supplier_name || receipt.PartyName || 'N/A',
          amount: `₹ ${parseFloat(receipt.amount || totalAmount).toLocaleString('en-IN')}`,
          receipt_date: receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('en-IN') : 
                       receipt.VoucherDate ? new Date(receipt.VoucherDate).toLocaleDateString('en-IN') : 'N/A',
          payment_method: receipt.payment_method || 'N/A',
          invoice_numbers: receipt.invoice_numbers || receipt.InvoiceNumber || 'N/A',
          total_balance_amount: balanceAmount,
          data_type: "stock inward", 
          PartyID: receipt.PartyID,
          AccountID: receipt.AccountID,
          InvoiceNumber: receipt.InvoiceNumber
        };
      });

      console.log('Transformed stock inward data (first item):', transformedData[0]);
      
      setReceiptData(transformedData);
    } else {
      console.error('Failed to fetch stock inward vouchers. Status:', response.status);
      alert('Failed to load stock inward data. Please try again later.');
    }
  } catch (err) {
    console.error('Error fetching stock inward data:', err);
    alert('Error connecting to server. Please check your network connection.');
  } finally {
    setIsLoading(false);
  }
};

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${baseurl}/accounts`);
      if (res.ok) {
        const data = await res.json();
        const supplierAccounts = data.filter(acc => 
          acc.role === "supplier" || 
          (acc.role === "retailer" && Number(acc.is_dual_account) === 1)
        );
        setSuppliers(supplierAccounts);
      } else {
        console.error('Failed to fetch suppliers:', res.statusText);
        alert('Failed to load suppliers. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      alert('Error connecting to server. Please check your network or try again later.');
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching initial data...');
    fetchSuppliers();
    fetchReceipts();
    fetchNextReceiptNumber();
    fetchInvoices();
  }, []);

  // Tab navigation
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Create receipt modal
  const handleCreateClick = async () => {
    console.log('Create button clicked, current receipt number:', nextReceiptNumber);
    if (!hasFetchedReceiptNumber) {
      console.log('Voucher number not fetched yet, fetching now...');
      await fetchNextReceiptNumber();
    }
    
    // Reset form data for new voucher
    setFormData(prev => ({
      ...prev,
      supplierId: '',
      amount: '',
      invoiceNumber: '',
      note: '',
      bankName: '',
      transactionDate: '',
      transactionProofFile: ''
    }));
    setSelectedInvoice('');
    setInvoiceBalance(0);
    
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setFormData(prev => ({
      ...prev,
      supplierId: '',
      amount: '',
            retailerName: '',
    account_name: '', 
    business_name: '', 

      currency: 'INR',
      paymentMethod: 'Direct Deposit',
      receiptDate: new Date().toISOString().split('T')[0],
      note: '',
      bankName: '',
      transactionDate: '',
      reconciliationOption: 'Do Not Reconcile',
      receiptNumber: nextReceiptNumber,
      invoiceNumber: '',
      transactionProofFile: ''
    }));
    setSelectedInvoice('');
    setInvoiceBalance(0);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'amount') {
      if (value !== invoiceBalance.toString()) {
      }
    }
  };

const handleSupplierChange = (e) => {
  const selectedSupplierId = e.target.value;
  const selectedSupplier = suppliers.find(supp => supp.id == selectedSupplierId);
  
  if (!selectedSupplier) {
    console.error('Supplier not found with ID:', selectedSupplierId);
    return;
  }
  
  console.log('Selected Supplier:', {
    id: selectedSupplier.id,
    name: selectedSupplier.name, 
    business_name: selectedSupplier.business_name,
    mobile: selectedSupplier.mobile_number,
    email: selectedSupplier.email,
    gstin: selectedSupplier.gstin
  });
  
  setFormData(prev => ({
    ...prev,
    supplierId: selectedSupplierId,
    supplierMobile: selectedSupplier.mobile_number || '',
    supplierEmail: selectedSupplier.email || '',
    supplierGstin: selectedSupplier.gstin || '',
    suppliername: selectedSupplier.name || '', 
    business_name: selectedSupplier.business_name || '', 
      account_name: selectedSupplier.account_name || '',
    amount: '' 
  }));
  
  setInvoiceBalance(0);
  
  // If invoice is already selected, fetch balance
  if (formData.invoiceNumber) {
    fetchInvoiceBalance(selectedSupplierId, formData.invoiceNumber);
  }
};

  // Handle invoice selection change
  // Handle invoice selection change
 const handleInvoiceChange = (e) => {
  const selectedInvoiceNumber = e.target.value;

  const selectedInvoice = invoices.find(
    inv => inv.number === selectedInvoiceNumber
  );

  setSelectedInvoice(selectedInvoiceNumber);

  setFormData(prev => ({
    ...prev,
    invoiceNumber: selectedInvoiceNumber,
    amount: selectedInvoice ? selectedInvoice.total_amount : ''
  }));

  setInvoiceBalance(
    selectedInvoice ? parseFloat(selectedInvoice.total_amount) : 0
  );
};

const handleCreateReceipt = async () => {
  // Validation
  if (!formData.supplierId) {
    alert('Please select a supplier');
    return;
  }
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    alert('Please enter a valid amount');
    return;
  }

   if (!formData.invoiceNumber) {
  alert('Please select an invoice number');
  return;
}

  if (!formData.receiptDate) {
    alert('Please select a receipt date');
    return;
  }

  try {
    setIsLoading(true);
    
    // Get the selected supplier details
    const selectedSupplier = suppliers.find(supp => supp.id == formData.supplierId);
    if (!selectedSupplier) {
      alert('Supplier not found');
      setIsLoading(false);
      return;
    }
    
    const formDataToSend = new FormData();
    
    formDataToSend.append('retailer_id', formData.supplierId);
    
    formDataToSend.append('retailer_name', selectedSupplier.name || '');
    
     formDataToSend.append('account_name', formData.account_name || ''); // Add this
    formDataToSend.append('business_name', formData.business_name || ''); // Add this

    // Other required fields
 formDataToSend.append('amount', formData.amount); // This was the main issue
     formDataToSend.append('bank_name', selectedSupplier.bankName || '');
    formDataToSend.append('invoice_number', formData.invoiceNumber || '');
    formDataToSend.append('TransactionType', 'purchase voucher');
    formDataToSend.append('data_type', 'stock inward');
    
    // Optional fields
    formDataToSend.append('currency', formData.currency || 'INR');
    formDataToSend.append('payment_method', formData.paymentMethod || 'Direct Deposit');
    formDataToSend.append('receipt_date', formData.receiptDate);
    formDataToSend.append('note', formData.note || '');
    formDataToSend.append('transaction_date', formData.transactionDate || '');
    
    // Supplier contact details
    if (selectedSupplier.mobile_number) {
      formDataToSend.append('supplier_mobile', selectedSupplier.mobile_number);
    }
    if (selectedSupplier.email) {
      formDataToSend.append('supplier_email', selectedSupplier.email);
    }
    if (selectedSupplier.gstin) {
      formDataToSend.append('supplier_gstin', selectedSupplier.gstin);
    }

    // Append file if exists
    if (formData.transactionProofFile) {
      formDataToSend.append('transaction_proof', formData.transactionProofFile);
    }
    
    console.log('FormData entries:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(`${baseurl}/api/receipts`, {
      method: 'POST',
      body: formDataToSend,
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Voucher created successfully:', result);
      
      await fetchReceipts();
      
      handleCloseModal();
      
      alert('Voucher created successfully!');
      
     
      await fetchNextReceiptNumber();
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create voucher. Status:', response.status);
      console.error('Error response:', errorText);
      
      let errorMessage = 'Failed to create voucher. ';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += errorData.error || errorData.message || 'Please try again.';
      } catch {
        errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    }
  } catch (err) {
    console.error('❌ Error creating voucher:', err);
    alert('Network error. Please check your connection and try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleViewReceipt = (receiptId) => {
    console.log('View receipt:', receiptId);
    navigate(`/kachaPurchasevoucherview/${receiptId}`);
  };

 const handleDownload = async () => {
  try {
    setIsDownloading(true);
    
    // Filter vouchers by selected month and year
    const filteredVouchers = filterVouchersByMonthYear(receiptData, month, year);
    
    if (filteredVouchers.length === 0) {
      alert(`No Kacha purchase vouchers found for ${month} ${year}`);
      setIsDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredVouchers.length} Kacha purchase vouchers for:`, month, year);
    
    // Generate PDF
    await generatePDF(filteredVouchers, 'month');
    
  } catch (err) {
    console.error('Download error:', err);
    alert('Error downloading Kacha purchase vouchers: ' + err.message);
  } finally {
    setIsDownloading(false);
  }
};

const handleDownloadRange = async () => {
  try {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be after end date');
      return;
    }

    setIsRangeDownloading(true);
    
    // Filter vouchers by date range
    const filteredVouchers = filterVouchersByDateRange(receiptData, startDate, endDate);
    
    if (filteredVouchers.length === 0) {
      alert(`No Kacha purchase vouchers found from ${startDate} to ${endDate}`);
      setIsRangeDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredVouchers.length} Kacha purchase vouchers for date range:`, startDate, 'to', endDate);
    
    // Generate PDF
    await generatePDF(filteredVouchers, 'range');
    
  } catch (err) {
    console.error('Download range error:', err);
    alert('Error downloading Kacha purchase vouchers: ' + err.message);
  } finally {
    setIsRangeDownloading(false);
  }
};
    const filteredInvoices = formData.supplierId
  ? invoices.filter(
      inv => String(inv.supplier_id) === String(formData.supplierId)
    )
  : [];

  return (
    <div className="receipts-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`receipts-main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="receipts-content-area">
          {/* Tabs Section */}
          <div className="receipts-tabs-section">
            <div className="receipts-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`receipts-tab ${activeTab === tab.name ? 'receipts-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Header Section */}
          <div className="receipts-header-section">
            <div className="receipts-header-top">
              <div className="receipts-title-section">
                <h1 className="receipts-main-title">Voucher Management</h1>
                <p className="receipts-subtitle">Create, manage and track all your payment receipts</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="receipts-stats-grid">
            {receiptStats.map((stat, index) => (
              <div key={index} className={`receipts-stat-card receipts-stat-card--${stat.type}`}>
                <h3 className="receipts-stat-label">{stat.label}</h3>
                <div className="receipts-stat-value">{stat.value}</div>
                <div className={`receipts-stat-change ${stat.change.startsWith('+') ? 'receipts-stat-change--positive' : 'receipts-stat-change--negative'}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Actions Section */}
          <div className="receipts-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Voucher</h5>
              {/* Filters and Actions */}
              <div className="row align-items-end g-3 mb-3">
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Month and Year Data:</label>
                  <div className="d-flex">
                    <select
                      className="form-select me-2"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </select>
                              
                                                                <Select
  options={yearOptions}
  value={{ value: year, label: year }}
  onChange={(selected) => setYear(selected.value)}
  maxMenuHeight={150}
  styles={{
    control: (provided) => ({
      ...provided,
      width: '100px',  // Adjust width as needed
      minWidth: '100px',
    }),
    menu: (provided) => ({
      ...provided,
      width: '100px',  // Same width as control
      minWidth: '100px',
    }),
    option: (provided) => ({
      ...provided,
      whiteSpace: 'nowrap',
      padding: '8px 12px',
    })
  }}
/>
                  </div>
                </div>
                <div className="col-md-auto">
            <button
  className="btn btn-success mt-4"
  onClick={handleDownload}
  disabled={isDownloading}
>
  {isDownloading ? (
    <div className="spinner-border spinner-border-sm" role="status"></div>
  ) : (
    <i className="bi bi-download me-1"></i>
  )} Download
</button>
                </div>
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Date Range:</label>
                  <div className="d-flex">
                    <input
                      type="date"
                      className="form-control me-2"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-auto">
                 <button
  className="btn btn-success mt-4"
  onClick={handleDownloadRange}
  disabled={isRangeDownloading}
>
  {isRangeDownloading ? (
    <div className="spinner-border spinner-border-sm" role="status"></div>
  ) : (
    <i className="bi bi-download me-1"></i>
  )} Download Range
</button>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-info text-white mt-4"
                    onClick={handleCreateClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Voucher'}
                  </button>
                </div>
              </div>

              {/* Receipts Table */}
              <ReusableTable
                title="Receipts"
                data={receiptData} 
                columns={columns}
                searchPlaceholder="Search receipts..."
                initialEntriesPerPage={5}
                showSearch={true}
                showEntriesSelector={false} 
                showPagination={true}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Create Voucher Modal */}
          {isModalOpen && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Create Voucher</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                      disabled={isLoading}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-md-6">
 <div className="company-info-recepits-table text-center">
  <label className="form-label-recepits-table">iiiQBets</label>
  <p>MG Road, Bengaluru</p>
  <p>Karnataka, 560001</p>
  <p>GST : 29ABCDE1234F1Z5</p>
  <p>Email: demo@gmail.com</p>
  <p>Phone: 9801049700</p>
</div>                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Voucher Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="receiptNumber"
                            value={formData.receiptNumber}
                            onChange={handleInputChange}
                            placeholder="REC0001"
                            readOnly
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Voucher Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="receiptDate"
                            value={formData.receiptDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <select
                            className="form-select"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                          >
                            <option>Direct Deposit</option>
                            <option>Online Payment</option>
                            <option>Credit/Debit Card</option>
                            <option>Demand Draft</option>
                            <option>Cheque</option>
                            <option>Cash</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className='row'>
<div className="col-md-6">
  <div className="mb-3">
    <label className="form-label">Supplier *</label>
    <select
      className="form-select"
      name="supplierId"
      value={formData.supplierId}
      onChange={handleSupplierChange}
      required
    >
      <option value="">Select Supplier</option>
    {suppliers.map((supp) => (
  <option key={supp.id} value={supp.id}>
    {supp.gstin?.trim()
      ? (supp.display_name || supp.name)
      : (supp.name || supp.display_name)}
  </option>
))}
    </select>
  </div>
</div>
        
     <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Invoice Number *</label>
                         <select
  className="form-select"
  name="invoiceNumber"
  value={formData.invoiceNumber}
  onChange={handleInvoiceChange}
  required
  disabled={!formData.supplierId}
>
  <option value="">Select Invoice Number</option>

  {filteredInvoices.map((invoice) => (
    <option key={invoice.id} value={invoice.number}>
      {invoice.number}
    </option>
  ))}
</select>

{formData.supplierId && filteredInvoices.length === 0 && (
  <small className="text-danger">
    No invoices found for selected supplier
  </small>
)}
                          {invoices.length === 0 && (
                            <small className="text-danger">
                              No invoices available. Please check if invoices are created.
                            </small>
                          )}
                        </div>
                      </div>
                      </div>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Amount *</label>
                          <div className="input-group custom-amount-receipts-table">
                            <select
                              className="form-select currency-select-receipts-table"
                              name="currency"
                              value={formData.currency}
                              onChange={handleInputChange}
                            >
                              <option>INR</option>
                              <option>USD</option>
                              <option>EUR</option>
                              <option>GBP</option>
                            </select>
                            <input
                              type="number"
                              className="form-control amount-input-receipts-table"
                              name="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              placeholder={invoiceBalance > 0 ? "Auto-filled from balance" : "Enter amount"}
                              min="0"
                              step="1"
                              required
                            />
                          </div>
                          {invoiceBalance > 0 && formData.amount && (
                            <small className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Auto-filled from invoice balance
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Note</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Additional notes..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Bank Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder="Bank Name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Transaction Proof Document</label>
                          <input 
                            type="file" 
                            className="form-control" 
                            onChange={(e) => handleFileChange(e)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                          <small className="text-muted">
                            {formData.transactionProofFile ? formData.transactionProofFile.name : 'No file chosen'}
                          </small>
                          
                          {formData.transactionProofFile && (
                            <div className="mt-2">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-success me-2">
                                  <i className="bi bi-file-earmark-check"></i>
                                </span>
                                <span className="small">
                                  {formData.transactionProofFile.name} 
                                  ({Math.round(formData.transactionProofFile.size / 1024)} KB)
                                </span>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger ms-2"
                                  onClick={() => handleRemoveFile()}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Transaction Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="transactionDate"
                            value={formData.transactionDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Reconciliation Option</label>
                          <select
                            className="form-select"
                            name="reconciliationOption"
                            value={formData.reconciliationOption}
                            onChange={handleInputChange}
                          >
                            <option>Do Not Reconcile</option>
                            <option>Customer Reconcile</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={isLoading}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateReceipt}
                      disabled={isLoading || !formData.amount || parseFloat(formData.amount) <= 0}
                    >
                      {isLoading ? 'Creating...' : 'Create Voucher'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KachaPurchaseVochurTable;