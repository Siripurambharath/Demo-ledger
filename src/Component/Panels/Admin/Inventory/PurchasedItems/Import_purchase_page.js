import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Alert, Spinner, Card } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import AdminSidebar from '../../../../Shared/AdminSidebar/AdminSidebar';
import Header from '../../../../Shared/AdminSidebar/AdminHeader';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaDownload, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { baseurl } from '../../../../BaseURL/BaseURL';

const Import_purchase_page = ({ user }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const [importMode, setImportMode] = useState('without_batch'); // 'without_batch' or 'with_batch'
  const [userSelectedMode, setUserSelectedMode] = useState(null); // Track if user selected mode manually
  
  // Data for mapping names to IDs
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch categories, companies, and units
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseurl}/categories`);
      setCategoryOptions(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${baseurl}/companies`);
      setCompanyOptions(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${baseurl}/units`);
      setUnitOptions(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchCompanies(),
          fetchUnits()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const findIdByNameOrId = (value, options, fieldName = 'name') => {
    if (!value || value.toString().trim() === '') return '';
    
    const strValue = value.toString().trim();
    
    // If it's already a number, check if it exists in options
    if (!isNaN(strValue) && strValue !== '') {
      const numValue = parseInt(strValue);
      // Check if this ID exists in the options
      const exists = options.find(opt => opt.id === numValue);
      if (exists) {
        return numValue;
      }
    }
    
    // Try to find by name (case insensitive)
    const found = options.find(opt => 
      opt[fieldName] && opt[fieldName].toString().toLowerCase() === strValue.toLowerCase()
    );
    
    if (found) {
      return found.id;
    }
    
    // Try partial match
    const partialMatch = options.find(opt => 
      opt[fieldName] && opt[fieldName].toString().toLowerCase().includes(strValue.toLowerCase())
    );
    
    if (partialMatch) {
      return partialMatch.id;
    }
    
    // Return original value (will cause validation error)
    return strValue;
  };

  // Helper function to find unit ID by name or code
  const findUnitId = (value) => {
    if (!value || value.toString().trim() === '') return '';
    
    const strValue = value.toString().trim();
    
    // If it's already a number, check if it exists
    if (!isNaN(strValue) && strValue !== '') {
      const numValue = parseInt(strValue);
      const exists = unitOptions.find(unit => unit.id === numValue);
      if (exists) {
        return numValue;
      }
    }
    
    // Try to find by unit name (case insensitive)
    const byName = unitOptions.find(unit => 
      unit.unit_name && unit.unit_name.toString().toLowerCase() === strValue.toLowerCase()
    );
    
    if (byName) {
      return byName.id;
    }
    
    // Try to find by unit code (case insensitive)
    const byCode = unitOptions.find(unit => 
      unit.unit_code && unit.unit_code.toString().toLowerCase() === strValue.toLowerCase()
    );
    
    if (byCode) {
      return byCode.id;
    }
    
    // Try partial match
    const partialMatch = unitOptions.find(unit => 
      (unit.unit_name && unit.unit_name.toString().toLowerCase().includes(strValue.toLowerCase())) ||
      (unit.unit_code && unit.unit_code.toString().toLowerCase().includes(strValue.toLowerCase()))
    );
    
    if (partialMatch) {
      return partialMatch.id;
    }
    
    // Return original value (will cause validation error)
    return strValue;
  };

  // Download template function for WITHOUT batch
  const downloadTemplateWithoutBatch = () => {
    setUserSelectedMode('without_batch');
    
    // Get sample names from loaded data for better examples
    const sampleCategory = categoryOptions.length > 0 ? categoryOptions[0] : { id: 1, name: 'Raw Materials' };
    const sampleCompany = companyOptions.length > 0 ? companyOptions[0] : { id: 1, name: 'Supplier Company' };
    const sampleUnit = unitOptions.length > 0 ? unitOptions[0] : { id: 1, unit_code: 'UNT-UNITS' };
    
    const templateData = [
      {
        'goods_name': 'Steel Rods',
        'category_id': sampleCategory.name, // Use Name (will be converted to ID)
        'company_id': sampleCompany.name, // Use Name (will be converted to ID)
        'purchase_price': '89999',
        'price': '99999',
        'mrp': '109999',
        'inclusive_gst': 'Inclusive',
        'gst_rate': '18',
        'non_taxable': 'No',
        'net_price': '',
        'hsn_code': '85171300',
        'unit': sampleUnit.unit_code, // Use unit code/name (will be converted to ID)
        'cess_rate': '0',
        'cess_amount': '0',
        'sku': 'STEELROD50',
        'opening_stock': '50',
        'opening_stock_date': '2024-01-15',
        'min_stock_alert': '10',
        'max_stock_alert': '100',
        'min_sale_price': '95000',
        'description': 'Steel Rods 50mm',
        'maintain_batch': 'false',
        'can_be_sold': 'true',
        'product_type': 'KACHA'
      },
      {
        'goods_name': 'Cement Bags',
        'category_id': '1', // Can also use ID directly
        'company_id': '2', // Can also use ID directly
        'purchase_price': '74999',
        'price': '84999',
        'mrp': '89999',
        'inclusive_gst': 'Inclusive',
        'gst_rate': '18',
        'non_taxable': 'No',
        'net_price': '',
        'hsn_code': '85171300',
        'unit': 'UNT-UNITS', // Using unit code
        'cess_rate': '0',
        'cess_amount': '0',
        'sku': 'CEMENT50KG',
        'opening_stock': '30',
        'opening_stock_date': '2024-01-10',
        'min_stock_alert': '5',
        'max_stock_alert': '50',
        'min_sale_price': '82000',
        'description': 'Cement 50kg bags',
        'maintain_batch': 'false',
        'can_be_sold': 'true',
        'product_type': 'PAKKA'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    const wscols = [
      { wch: 20 }, // goods_name
      { wch: 15 }, // category_id (can be ID or Name)
      { wch: 15 }, // company_id (can be ID or Name)
      { wch: 15 }, // purchase_price
      { wch: 10 }, // price
      { wch: 10 }, // mrp
      { wch: 15 }, // inclusive_gst
      { wch: 10 }, // gst_rate
      { wch: 12 }, // non_taxable
      { wch: 10 }, // net_price
      { wch: 12 }, // hsn_code
      { wch: 12 }, // unit (can be ID, Code, or Name)
      { wch: 10 }, // cess_rate
      { wch: 12 }, // cess_amount
      { wch: 15 }, // sku
      { wch: 12 }, // opening_stock
      { wch: 15 }, // opening_stock_date
      { wch: 12 }, // min_stock_alert
      { wch: 12 }, // max_stock_alert
      { wch: 12 }, // min_sale_price
      { wch: 30 }, // description
      { wch: 12 }, // maintain_batch
      { wch: 12 }, // can_be_sold
      { wch: 12 }, // product_type
    ];
    worksheet['!cols'] = wscols;

    // Make required columns bold
    const requiredColumns = ['goods_name', 'purchase_price', 'product_type'];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      const cell = worksheet[cellAddress];
      if (cell && requiredColumns.includes(cell.v)) {
        cell.s = { font: { bold: true, color: { rgb: "FF0000" } } };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Products Without Batch");

    XLSX.writeFile(workbook, "purchase_products_without_batch_template.xlsx");
  };

  // Download template function for WITH batch
  const downloadTemplateWithBatch = () => {
    setUserSelectedMode('with_batch');
    
    // Get sample names from loaded data for better examples
    const sampleCategory = categoryOptions.length > 0 ? categoryOptions[0] : { id: 1, name: 'Raw Materials' };
    const sampleCompany = companyOptions.length > 0 ? companyOptions[0] : { id: 1, name: 'Supplier Company' };
    const sampleUnit = unitOptions.length > 0 ? unitOptions[0] : { id: 1, unit_code: 'UNT-UNITS' };
    
    const templateData = [
      {
        'goods_name': 'Steel Rods',
        'category_id': sampleCategory.name, // Use Name
        'company_id': sampleCompany.name, // Use Name
        'purchase_price': '89999',
        'price': '99999',
        'mrp': '109999',
        'inclusive_gst': 'Inclusive',
        'gst_rate': '18',
        'non_taxable': 'No',
        'net_price': '',
        'hsn_code': '85171300',
        'unit': sampleUnit.unit_code, // Use unit code
        'cess_rate': '0',
        'cess_amount': '0',
        'sku': 'STEELROD50',
        'opening_stock': '50',
        'opening_stock_date': '2024-01-15',
        'min_stock_alert': '10',
        'max_stock_alert': '100',
        'min_sale_price': '95000',
        'description': 'Steel Rods 50mm',
        'maintain_batch': 'true',
        'can_be_sold': 'true',
        'product_type': 'KACHA',
        'batch_number': 'BATCH001',
        'mfg_date': '2024-01-01',
        'exp_date': '2025-12-31',
        'batch_selling_price': '99999',
        'batch_purchase_price': '89999',
        'batch_mrp': '109999',
        'batch_min_sale_price': '95000',
        'batch_opening_stock': '50',
        'batch_barcode': '123456'
      },
      {
        'goods_name': 'Steel Rods',
        'category_id': '1', // Using ID
        'company_id': '1', // Using ID
        'purchase_price': '89999',
        'price': '99999',
        'mrp': '109999',
        'inclusive_gst': 'Inclusive',
        'gst_rate': '18',
        'non_taxable': 'No',
        'net_price': '',
        'hsn_code': '85171300',
        'unit': '1', // Using ID
        'cess_rate': '0',
        'cess_amount': '0',
        'sku': 'STEELROD50',
        'opening_stock': '50',
        'opening_stock_date': '2024-01-15',
        'min_stock_alert': '10',
        'max_stock_alert': '100',
        'min_sale_price': '95000',
        'description': 'Steel Rods 50mm',
        'maintain_batch': 'true',
        'can_be_sold': 'true',
        'product_type': 'KACHA',
        'batch_number': 'BATCH002',
        'mfg_date': '2024-02-01',
        'exp_date': '2025-12-31',
        'batch_selling_price': '99999',
        'batch_purchase_price': '89999',
        'batch_mrp': '109999',
        'batch_min_sale_price': '95000',
        'batch_opening_stock': '50',
        'batch_barcode': '654321'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    const wscols = [
      { wch: 20 }, // goods_name
      { wch: 15 }, // category_id
      { wch: 15 }, // company_id
      { wch: 15 }, // purchase_price
      { wch: 10 }, // price
      { wch: 10 }, // mrp
      { wch: 15 }, // inclusive_gst
      { wch: 10 }, // gst_rate
      { wch: 12 }, // non_taxable
      { wch: 10 }, // net_price
      { wch: 12 }, // hsn_code
      { wch: 12 }, // unit
      { wch: 10 }, // cess_rate
      { wch: 12 }, // cess_amount
      { wch: 15 }, // sku
      { wch: 12 }, // opening_stock
      { wch: 15 }, // opening_stock_date
      { wch: 12 }, // min_stock_alert
      { wch: 12 }, // max_stock_alert
      { wch: 12 }, // min_sale_price
      { wch: 30 }, // description
      { wch: 12 }, // maintain_batch
      { wch: 12 }, // can_be_sold
      { wch: 12 }, // product_type
      { wch: 15 }, // batch_number
      { wch: 12 }, // mfg_date
      { wch: 12 }, // exp_date
      { wch: 15 }, // batch_selling_price
      { wch: 15 }, // batch_purchase_price
      { wch: 12 }, // batch_mrp
      { wch: 15 }, // batch_min_sale_price
      { wch: 15 }, // batch_opening_stock
      { wch: 15 }, // batch_barcode
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Products With Batch");

    XLSX.writeFile(workbook, "purchase_products_with_batch_template.xlsx");
  };

  // Normalize column names to match expected format
  const normalizeColumnNames = (data) => {
    if (!data || data.length === 0) return data;

    // Mapping of possible column names to expected names
    const columnMapping = {
      // Product fields
      'goods_name': 'goods_name',
      'goods name': 'goods_name',
      'product name': 'goods_name',
      'product_name': 'goods_name',
      'item name': 'goods_name',
      'item_name': 'goods_name',
      'name': 'goods_name',
      'product': 'goods_name',
      
      // category_id variations (also accept category_name)
      'category_id': 'category_id',
      'category id': 'category_id',
      'category': 'category_id',
      'categoryid': 'category_id',
      'cat_id': 'category_id',
      'cat id': 'category_id',
      'category_name': 'category_id',
      'category name': 'category_id',
      'cat_name': 'category_id',
      'cat name': 'category_id',
      
      // company_id variations (also accept company_name)
      'company_id': 'company_id',
      'company id': 'company_id',
      'company': 'company_id',
      'companyid': 'company_id',
      'comp_id': 'company_id',
      'comp id': 'company_id',
      'company_name': 'company_id',
      'company name': 'company_id',
      'comp_name': 'company_id',
      'comp name': 'company_id',
      
      // unit variations (accept unit_id, unit_code, unit_name)
      'unit': 'unit',
      'unit_id': 'unit',
      'unit id': 'unit',
      'unit_code': 'unit',
      'unit code': 'unit',
      'unit_name': 'unit',
      'unit name': 'unit',
      'uom': 'unit',
      'uom_id': 'unit',
      'uom code': 'unit',
      'uom_name': 'unit',
      
      // purchase price variations
      'purchase_price': 'purchase_price',
      'purchase price': 'purchase_price',
      'cost price': 'purchase_price',
      'cost_price': 'purchase_price',
      'buying price': 'purchase_price',
      'buying_price': 'purchase_price',
      
      // price variations (selling price)
      'price': 'price',
      'selling price': 'price',
      'selling_price': 'price',
      'sale price': 'price',
      'sale_price': 'price',
      'cost': 'price',
      
      // mrp variations
      'mrp': 'mrp',
      'maximum retail price': 'mrp',
      'max retail price': 'mrp',
      'retail price': 'mrp',
      
      // inclusive_gst variations
      'inclusive_gst': 'inclusive_gst',
      'inclusive gst': 'inclusive_gst',
      'gst type': 'inclusive_gst',
      'gst_type': 'inclusive_gst',
      'gst inclusive': 'inclusive_gst',
      'gst_inclusive': 'inclusive_gst',
      
      // gst_rate variations
      'gst_rate': 'gst_rate',
      'gst rate': 'gst_rate',
      'gst': 'gst_rate',
      'gst%': 'gst_rate',
      'tax rate': 'gst_rate',
      'tax_rate': 'gst_rate',
      
      // can_be_sold variations
      'can_be_sold': 'can_be_sold',
      'can be sold': 'can_be_sold',
      'sellable': 'can_be_sold',
      'saleable': 'can_be_sold',
      
      // product_type variations
      'product_type': 'product_type',
      'product type': 'product_type',
      'type': 'product_type',
      'product category': 'product_type',
      
      // other common fields
      'hsn_code': 'hsn_code',
      'hsn code': 'hsn_code',
      'hsn': 'hsn_code',
      'sku': 'sku',
      'product code': 'sku',
      'product_code': 'sku',
      'unit': 'unit',
      'uom': 'unit',
      'description': 'description',
      'desc': 'description',
      'opening_stock': 'opening_stock',
      'opening stock': 'opening_stock',
      'initial stock': 'opening_stock',
      'initial_stock': 'opening_stock',
      'stock': 'opening_stock',
      
      // Batch fields
      'maintain_batch': 'maintain_batch',
      'maintain batch': 'maintain_batch',
      'has batch': 'maintain_batch',
      'batch management': 'maintain_batch',
      'batch_management': 'maintain_batch',
      
      'batch_number': 'batch_number',
      'batch number': 'batch_number',
      'batch no': 'batch_number',
      'batch_no': 'batch_number',
      
      'mfg_date': 'mfg_date',
      'mfg date': 'mfg_date',
      'manufacturing date': 'mfg_date',
      'manufacture date': 'mfg_date',
      'production date': 'mfg_date',
      
      'exp_date': 'exp_date',
      'exp date': 'exp_date',
      'expiry date': 'exp_date',
      'expiration date': 'exp_date',
      
      'batch_selling_price': 'batch_selling_price',
      'batch selling price': 'batch_selling_price',
      'batch sale price': 'batch_selling_price',
      'batch_price': 'batch_selling_price',
      
      'batch_purchase_price': 'batch_purchase_price',
      'batch purchase price': 'batch_purchase_price',
      'batch cost price': 'batch_purchase_price',
      
      'batch_mrp': 'batch_mrp',
      'batch mrp': 'batch_mrp',
      'batch retail price': 'batch_mrp',
      
      'batch_min_sale_price': 'batch_min_sale_price',
      'batch min sale price': 'batch_min_sale_price',
      'batch minimum price': 'batch_min_sale_price',
      
      'batch_opening_stock': 'batch_opening_stock',
      'batch opening stock': 'batch_opening_stock',
      'batch stock': 'batch_opening_stock',
      
      'batch_barcode': 'batch_barcode',
      'batch barcode': 'batch_barcode',
      'barcode': 'batch_barcode',
    };

    return data.map(row => {
      const normalizedRow = {};
      
      Object.keys(row).forEach(key => {
        const originalKey = key.toString().trim();
        let normalizedKey = '';
        
        // Convert to lowercase and remove extra spaces
        const cleanKey = originalKey.toLowerCase().replace(/\s+/g, ' ').trim();
        
        // Find matching key
        if (columnMapping[cleanKey]) {
          normalizedKey = columnMapping[cleanKey];
        } else if (columnMapping[originalKey.toLowerCase()]) {
          normalizedKey = columnMapping[originalKey.toLowerCase()];
        } else {
          // Keep original key if no match found
          normalizedKey = originalKey.toLowerCase().replace(/\s+/g, '_');
        }
        
        normalizedRow[normalizedKey] = row[key];
      });
      
      return normalizedRow;
    });
  };

  // Helper function to convert boolean values
  const parseBoolean = (value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    
    const valueStr = value.toString().toLowerCase().trim();
    
    // Check for true values
    if (valueStr === 'true' || valueStr === 'yes' || valueStr === '1' || valueStr === 'on' || valueStr === 'y') {
      return true;
    }
    
    // Check for false values
    if (valueStr === 'false' || valueStr === 'no' || valueStr === '0' || valueStr === 'off' || valueStr === 'n') {
      return false;
    }
    
    // If it's a boolean already
    if (typeof value === 'boolean') {
      return value;
    }
    
    // If it's a number 0 or 1
    if (typeof value === 'number') {
      return value === 1;
    }
    
    return null;
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload a valid Excel file (XLSX, XLS, CSV)');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setExcelFile(file);
    setExcelData([]);
    setValidationErrors([]);
    setImportResults(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: false
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
          dateNF: 'yyyy-mm-dd'
        });
        
        console.log('Raw Excel Data (first row):', jsonData.length > 0 ? jsonData[0] : 'No data');
        
        if (jsonData.length === 0) {
          setValidationErrors(['Excel file is empty or has no data rows']);
          setLoading(false);
          return;
        }

        const normalizedData = normalizeColumnNames(jsonData);
        console.log('Normalized Data (first row):', normalizedData.length > 0 ? normalizedData[0] : 'No data');
        console.log('Normalized Columns:', normalizedData.length > 0 ? Object.keys(normalizedData[0]) : 'No columns');
        
        let detectedMode = 'without_batch'; // Default to simple mode
        
        const maintainBatchValues = normalizedData.map(row => parseBoolean(row.maintain_batch));
        
        let trueCount = 0;
        let falseCount = 0;
        let nullCount = 0;
        
        maintainBatchValues.forEach(value => {
          if (value === true) trueCount++;
          else if (value === false) falseCount++;
          else nullCount++;
        });
        
        console.log(`Batch mode analysis: TRUE=${trueCount}, FALSE=${falseCount}, NULL/EMPTY=${nullCount}`);
        
        if (trueCount > 0) {
          detectedMode = 'with_batch';
          console.log('Detected mode: BATCH (found maintain_batch = TRUE in some rows)');
        } else if (falseCount > 0 && trueCount === 0) {
          detectedMode = 'without_batch';
          console.log('Detected mode: SIMPLE (all rows have maintain_batch = FALSE)');
        } else {
          const hasBatchFields = normalizedData.some(row => 
            (row.batch_number && row.batch_number.toString().trim() !== '') ||
            (row.batch_selling_price && row.batch_selling_price.toString().trim() !== '') ||
            (row.batch_opening_stock && row.batch_opening_stock.toString().trim() !== '')
          );
          
          if (hasBatchFields) {
            detectedMode = 'with_batch';
            console.log('Detected mode: BATCH (fallback - found batch fields)');
          } else {
            detectedMode = 'without_batch';
            console.log('Detected mode: SIMPLE (default - no maintain_batch or batch fields)');
          }
        }
        
        if (!userSelectedMode) {
          setImportMode(detectedMode);
        } else {
          setImportMode(userSelectedMode);
        }
        
        // Validate the data
        const errors = validateExcelData(normalizedData, detectedMode === 'with_batch');
        setValidationErrors(errors);
        
        if (errors.length > 0) {
          setExcelData([]);
        } else {
          setExcelData(normalizedData);
        }
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file. Please check the format and try again.\n\nError: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Generate unique barcode for batch
  const generateBarcode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Validate Excel data
  const validateExcelData = (data, isBatchMode = false) => {
    const errors = [];
    
    if (!data || data.length === 0) {
      errors.push('Excel file is empty or has no data rows');
      return errors;
    }

    const firstRow = data[0];
    const rowKeys = Object.keys(firstRow).map(key => key.toLowerCase());
    
    console.log('Available columns in data:', rowKeys);

    // Check required columns with case-insensitive comparison
    const requiredColumns = ['goods_name', 'purchase_price', 'product_type'];
    const missingColumns = requiredColumns.filter(col => 
      !rowKeys.includes(col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      errors.push(`Available columns in file: ${Object.keys(firstRow).join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 2; // Excel rows start from 1, header is row 1

      // Check required fields with better validation
      if (!row.goods_name || row.goods_name.toString().trim() === '') {
        errors.push(`Row ${rowNum}: Product Name (goods_name) is required`);
      }

      // Purchase price validation
      const purchasePriceStr = row.purchase_price ? row.purchase_price.toString().trim() : '';
      if (purchasePriceStr === '') {
        errors.push(`Row ${rowNum}: Purchase Price is required`);
      } else if (isNaN(parseFloat(purchasePriceStr)) || parseFloat(purchasePriceStr) < 0) {
        errors.push(`Row ${rowNum}: Purchase Price must be a valid positive number (got: "${row.purchase_price}")`);
      }

      // Price validation (selling price)
      const priceStr = row.price ? row.price.toString().trim() : '';
      if (priceStr !== '') {
        if (isNaN(parseFloat(priceStr)) || parseFloat(priceStr) < 0) {
          errors.push(`Row ${rowNum}: Price must be a valid positive number (got: "${row.price}")`);
        }
        
        // Check if price is less than purchase price
        if (purchasePriceStr && parseFloat(priceStr) < parseFloat(purchasePriceStr)) {
          errors.push(`Row ${rowNum}: Price (${priceStr}) cannot be less than Purchase Price (${purchasePriceStr})`);
        }
      }

      // Product type validation
      const productType = row.product_type ? row.product_type.toString().trim().toUpperCase() : '';
      if (productType === '') {
        errors.push(`Row ${rowNum}: Product Type is required (must be KACHA or PAKKA)`);
      } else if (productType !== 'KACHA' && productType !== 'PAKKA') {
        errors.push(`Row ${rowNum}: Product Type must be either "KACHA" or "PAKKA" (got: "${row.product_type}")`);
      }

      // Can be sold validation (should be true for purchase flow)
      const canBeSoldValue = parseBoolean(row.can_be_sold);
      if (canBeSoldValue === null) {
        // Set default to true if not provided
        console.log(`Row ${rowNum}: can_be_sold not provided, defaulting to TRUE`);
      } else if (canBeSoldValue === false) {
        errors.push(`Row ${rowNum}: For purchase flow, can_be_sold must be TRUE`);
      }

      // Category validation - check if we can find it
      if (!row.category_id || row.category_id.toString().trim() === '') {
        errors.push(`Row ${rowNum}: Category is required (use ID or Name)`);
      } else {
        const categoryValue = row.category_id.toString().trim();
        const foundCategoryId = findIdByNameOrId(categoryValue, categoryOptions);
        
        if (foundCategoryId === categoryValue) {
          // If the returned value is same as input, it means we couldn't find it
          errors.push(`Row ${rowNum}: Category "${categoryValue}" not found. Available categories: ${categoryOptions.map(cat => `${cat.id} - ${cat.name}`).join(', ')}`);
        }
      }

      // Company validation - check if we can find it
      if (!row.company_id || row.company_id.toString().trim() === '') {
        errors.push(`Row ${rowNum}: Company is required (use ID or Name)`);
      } else {
        const companyValue = row.company_id.toString().trim();
        const foundCompanyId = findIdByNameOrId(companyValue, companyOptions);
        
        if (foundCompanyId === companyValue) {
          // If the returned value is same as input, it means we couldn't find it
          errors.push(`Row ${rowNum}: Company "${companyValue}" not found. Available companies: ${companyOptions.map(comp => `${comp.id} - ${comp.name}`).join(', ')}`);
        }
      }

      // Unit validation - check if we can find it
      if (!row.unit || row.unit.toString().trim() === '') {
        // Unit is optional, set default
        console.log(`Row ${rowNum}: Unit not provided, will use default`);
      } else {
        const unitValue = row.unit.toString().trim();
        const foundUnitId = findUnitId(unitValue);
        
        if (foundUnitId === unitValue) {
          // If the returned value is same as input, it means we couldn't find it
          errors.push(`Row ${rowNum}: Unit "${unitValue}" not found. Available units: ${unitOptions.map(unit => `${unit.id} - ${unit.unit_code} (${unit.unit_name})`).join(', ')}`);
        }
      }

      // GST rate validation
      if (row.gst_rate && row.gst_rate.toString().trim() !== '') {
        const gstStr = row.gst_rate.toString().trim();
        if (isNaN(parseFloat(gstStr)) || parseFloat(gstStr) < 0 || parseFloat(gstStr) > 100) {
          errors.push(`Row ${rowNum}: GST Rate must be a valid percentage between 0 and 100 (got: "${row.gst_rate}")`);
        }
      }

      // Opening stock validation
      if (row.opening_stock && row.opening_stock.toString().trim() !== '') {
        const stockStr = row.opening_stock.toString().trim();
        if (isNaN(parseInt(stockStr)) || parseInt(stockStr) < 0) {
          errors.push(`Row ${rowNum}: Opening Stock must be a valid positive number (got: "${row.opening_stock}")`);
        }
      }

      // Validate maintain_batch if present
      if (row.maintain_batch && row.maintain_batch.toString().trim() !== '') {
        const maintainBatchValue = parseBoolean(row.maintain_batch);
        if (maintainBatchValue === null) {
          errors.push(`Row ${rowNum}: maintain_batch must be one of: true/false, yes/no, 1/0 (got: "${row.maintain_batch}")`);
        }
      }

      // Validate batch fields only if in batch mode
      if (isBatchMode) {
        // Batch selling price validation (only if provided)
        if (row.batch_selling_price && row.batch_selling_price.toString().trim() !== '') {
          const batchPriceStr = row.batch_selling_price.toString().trim();
          if (isNaN(parseFloat(batchPriceStr)) || parseFloat(batchPriceStr) < 0) {
            errors.push(`Row ${rowNum}: Batch Selling Price must be a valid positive number (got: "${row.batch_selling_price}")`);
          }
        }

        // Batch opening stock validation (only if provided)
        if (row.batch_opening_stock && row.batch_opening_stock.toString().trim() !== '') {
          const batchStockStr = row.batch_opening_stock.toString().trim();
          if (isNaN(parseInt(batchStockStr)) || parseInt(batchStockStr) < 0) {
            errors.push(`Row ${rowNum}: Batch Opening Stock must be a valid positive number (got: "${row.batch_opening_stock}")`);
          }
        }

        // Batch purchase price validation (only if provided)
        if (row.batch_purchase_price && row.batch_purchase_price.toString().trim() !== '') {
          const batchPurchaseStr = row.batch_purchase_price.toString().trim();
          if (isNaN(parseFloat(batchPurchaseStr)) || parseFloat(batchPurchaseStr) < 0) {
            errors.push(`Row ${rowNum}: Batch Purchase Price must be a valid positive number (got: "${row.batch_purchase_price}")`);
          }
        }

        // Batch MRP validation (only if provided)
        if (row.batch_mrp && row.batch_mrp.toString().trim() !== '') {
          const batchMRPStr = row.batch_mrp.toString().trim();
          if (isNaN(parseFloat(batchMRPStr)) || parseFloat(batchMRPStr) < 0) {
            errors.push(`Row ${rowNum}: Batch MRP must be a valid positive number (got: "${row.batch_mrp}")`);
          }
        }
      }
    });

    return errors;
  };

  // Import data to backend
const handleImport = async () => {
    if (excelData.length === 0) {
      alert('No data to import. Please upload a valid Excel file.');
      return;
    }

    if (validationErrors.length > 0) {
      alert('Please fix validation errors before importing.');
      return;
    }

    if (loadingData) {
      alert('Please wait while we load category, company, and unit data...');
      return;
    }

    setImporting(true);
    setImportResults(null);

    const results = {
      total: excelData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      // Group data by product for batch processing
      const productGroups = {};
      
      // Determine import mode based on maintain_batch field
      let shouldImportAsBatch = importMode === 'with_batch';
      
      // If importMode was auto-detected, check the data
      if (!userSelectedMode) {
        // Count maintain_batch values
        let trueCount = 0;
        let falseCount = 0;
        
        excelData.forEach(row => {
          const maintainBatchValue = parseBoolean(row.maintain_batch);
          if (maintainBatchValue === true) trueCount++;
          else if (maintainBatchValue === false) falseCount++;
        });
        
        shouldImportAsBatch = trueCount > 0;
        console.log(`Import decision: TRUE=${trueCount}, FALSE=${falseCount}, BatchMode=${shouldImportAsBatch}`);
      }
      
      if (shouldImportAsBatch) {
        // Group by product for batch processing
        excelData.forEach((row, index) => {
          // Convert names to IDs before creating key
          const categoryId = findIdByNameOrId(row.category_id, categoryOptions);
          const companyId = findIdByNameOrId(row.company_id, companyOptions);
          const key = `${row.goods_name}_${categoryId}_${companyId}`;
          
          if (!productGroups[key]) {
            productGroups[key] = {
              product: row,
              batches: []
            };
          }
          
          // Check if this row should have batch data
          const maintainBatchValue = parseBoolean(row.maintain_batch);
          const hasBatchForThisRow = maintainBatchValue === true;
          
          // If maintain_batch is true or there are batch fields, add as batch
          if (hasBatchForThisRow || 
              (row.batch_number && row.batch_number.toString().trim() !== '') ||
              (row.batch_selling_price && row.batch_selling_price.toString().trim() !== '') ||
              (row.batch_opening_stock && row.batch_opening_stock.toString().trim() !== '')) {
            productGroups[key].batches.push(row);
          }
        });
      } else {
        // Without batch - each row is a separate product
        excelData.forEach((row, index) => {
          const key = `product_${index}`;
          productGroups[key] = {
            product: row,
            batches: []
          };
        });
      }

      // Process each product group
      const productKeys = Object.keys(productGroups);
      
      for (let i = 0; i < productKeys.length; i++) {
        const key = productKeys[i];
        const { product, batches } = productGroups[key];
        
        try {
          // Convert names to IDs
          const categoryId = findIdByNameOrId(product.category_id, categoryOptions);
          const companyId = findIdByNameOrId(product.company_id, companyOptions);
          const unitId = findUnitId(product.unit);
          
          // Determine if this product should have batch management
          const maintainBatchValue = parseBoolean(product.maintain_batch);
          let hasBatchManagement = shouldImportAsBatch && (maintainBatchValue === true || batches.length > 0);
          
          // If maintain_batch is explicitly false, don't use batch management
          if (maintainBatchValue === false) {
            hasBatchManagement = false;
          }

          // Determine can_be_sold value (default to true for purchase flow)
          const canBeSoldValue = parseBoolean(product.can_be_sold);
          const finalCanBeSold = canBeSoldValue === null ? true : canBeSoldValue;
          
          // Calculate totals
          let totalOpeningStock = 0;
          let totalPurchasePrice = 0;
          let totalPrice = 0;
          let totalMRP = 0;
          
          const batchDataArray = [];
          
          if (hasBatchManagement) {
            // If there are specific batches, use them
            if (batches.length > 0) {
              // Calculate totals from all batches
              batches.forEach(batchRow => {
                const batchStock = parseInt(batchRow.batch_opening_stock) || parseInt(batchRow.opening_stock) || 0;
                const batchPurchase = parseFloat(batchRow.batch_purchase_price) || parseFloat(batchRow.purchase_price) || 0;
                const batchPrice = parseFloat(batchRow.batch_selling_price) || parseFloat(batchRow.price) || 0;
                const batchMRPValue = parseFloat(batchRow.batch_mrp) || parseFloat(batchRow.mrp) || 0;
                
                totalOpeningStock += batchStock;
                totalPurchasePrice += batchPurchase;
                totalPrice += batchPrice;
                totalMRP += batchMRPValue;
                
                // Get batch number - use provided or default to "General"
                const batchNumber = batchRow.batch_number?.toString().trim() || 'General';
                
                // Helper function to convert empty strings to null
                const getValueOrNull = (value) => {
                  if (value === undefined || value === null || value.toString().trim() === '') {
                    return null;
                  }
                  return value.toString().trim();
                };
                
                // Prepare batch data with proper null handling
                batchDataArray.push({
                  batch_number: batchNumber,
                  mfg_date: getValueOrNull(batchRow.mfg_date),
                  exp_date: getValueOrNull(batchRow.exp_date),
                  quantity: batchStock,
                  opening_stock: batchStock,
                  stock_in: 0,
                  stock_out: 0,
                  min_sale_price: parseFloat(batchRow.batch_min_sale_price) || parseFloat(batchRow.min_sale_price) || null,
                  selling_price: batchPrice,
                  purchase_price: batchPurchase,
                  mrp: batchMRPValue,
                  barcode: batchRow.batch_barcode?.toString().trim() || generateBarcode(),
                  group_by: 'Purchaseditems',
                  isExisting: false
                });
              });
            } else {
              // Create a default "General" batch for batch-managed products without specific batches
              totalOpeningStock = parseInt(product.opening_stock) || 0;
              totalPurchasePrice = parseFloat(product.purchase_price) || 0;
              totalPrice = parseFloat(product.price) || 0;
              totalMRP = parseFloat(product.mrp) || 0;
              
              // Helper function to convert empty strings to null
              const getValueOrNull = (value) => {
                if (value === undefined || value === null || value.toString().trim() === '') {
                  return null;
                }
                return value.toString().trim();
              };
              
              // Create default batch
              batchDataArray.push({
                batch_number: 'General',
                mfg_date: null,
                exp_date: null,
                quantity: totalOpeningStock,
                opening_stock: totalOpeningStock,
                stock_in: 0,
                stock_out: 0,
                min_sale_price: parseFloat(product.min_sale_price) || null,
                selling_price: totalPrice,
                purchase_price: totalPurchasePrice,
                mrp: totalMRP,
                barcode: generateBarcode(),
                group_by: 'Purchaseditems',
                isExisting: false
              });
            }
          } else {
            // Without batch management
            totalOpeningStock = parseInt(product.opening_stock) || 0;
            totalPurchasePrice = parseFloat(product.purchase_price) || 0;
            totalPrice = parseFloat(product.price) || 0;
            totalMRP = parseFloat(product.mrp) || 0;
          }

          // Calculate net price based on GST
          let netPrice = 0;
          if (product.gst_rate && product.purchase_price) {
            const gstRate = parseFloat(product.gst_rate) || 0;
            const priceValue = parseFloat(product.purchase_price) || 0;
            const gstType = product.inclusive_gst?.toString().trim() || 'Inclusive';
            
            if (gstType === 'Inclusive') {
              netPrice = priceValue / (1 + (gstRate / 100));
            } else {
              netPrice = priceValue;
            }
          }

          // Format the product data to match your backend API
          const productData = {
            group_by: 'Purchaseditems',
            goods_name: product.goods_name?.toString().trim() || '',
            category_id: categoryId,
            company_id: companyId,
            purchase_price: totalPurchasePrice,
            price: totalPrice,
            mrp: totalMRP,
            inclusive_gst: product.inclusive_gst?.toString().trim() || 'Inclusive',
            gst_rate: parseFloat(product.gst_rate) || 0,
            non_taxable: product.non_taxable?.toString().trim() || '',
            net_price: netPrice,
            hsn_code: product.hsn_code?.toString().trim() || '',
            unit: unitId || 'UNT-UNITS', // Use ID or default
            cess_rate: parseFloat(product.cess_rate) || 0,
            cess_amount: parseFloat(product.cess_amount) || 0,
            sku: product.sku?.toString().trim() || '',
            opening_stock: totalOpeningStock,
            opening_stock_date: product.opening_stock_date?.toString().trim() || new Date().toISOString().split('T')[0],
            min_stock_alert: parseInt(product.min_stock_alert) || 0,
            max_stock_alert: parseInt(product.max_stock_alert) || 0,
            min_sale_price: parseFloat(product.min_sale_price) || 0,
            description: product.description?.toString().trim() || '',
            maintain_batch: hasBatchManagement,
            can_be_sold: finalCanBeSold,
            product_type: product.product_type?.toString().trim().toUpperCase() || 'KACHA',
            images: [],
            batches: batchDataArray
          };

          console.log(`Importing purchase product:`, productData.goods_name);
          console.log(`Category ID: ${categoryId}, Company ID: ${companyId}, Unit ID: ${unitId}`);
          console.log(`Batch mode: ${hasBatchManagement}, Batch count: ${batchDataArray.length}`);
          console.log(`Product Type: ${productData.product_type}, Can be Sold: ${productData.can_be_sold}`);

          // Use the same POST API as your form
          const response = await axios.post(`${baseurl}/products`, productData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          });

          // FIXED: Better success detection
          console.log(`Response for ${product.goods_name}:`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data
          });

          // Check for success (200 or 201 status codes)
          if (response.status === 200 || response.status === 201) {
            console.log(`✅ Successfully imported: ${product.goods_name}`);
            results.success++;
          } else {
            results.failed++;
            const errorMsg = `Server returned status ${response.status}: ${response.statusText}`;
            results.errors.push(`Product "${product.goods_name}": ${errorMsg}`);
            console.error(`Error importing product "${product.goods_name}":`, response.status, response.statusText);
          }
        } catch (error) {
          results.failed++;
          const errorMsg = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.statusText || 
                          error.message || 
                          'Unknown error';
          results.errors.push(`Product "${product.goods_name}": ${errorMsg}`);
          console.error(`Error importing product "${product.goods_name}":`, error);
          
          // Log detailed error for debugging
          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
          } else if (error.request) {
            console.error('Error request:', error.request);
          }
        }
      }

      setImportResults(results);
      
      // FIXED: Better alert messages
      if (results.failed === 0 && results.success > 0) {
        alert(`✅ Successfully imported ${results.success} purchase products!`);
        // Redirect after successful import
        setTimeout(() => navigate('/purchased_items'), 2000);
      } else if (results.success === 0 && results.failed > 0) {
        alert(`❌ All imports failed. Please check the error messages below.`);
      } else if (results.success > 0 && results.failed > 0) {
        alert(`⚠️ Import partially completed with ${results.success} successes and ${results.failed} failures.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('❌ Error during import. Please check console for details.');
    } finally {
      setImporting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setExcelFile(null);
    setExcelData([]);
    setValidationErrors([]);
    setImportResults(null);
    setImportMode('without_batch');
    setUserSelectedMode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Header user={user} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        <div className="content-wrapper">
          <div className="container-fluid mt-3">
            <div className="row">
              <div className="col-12">
                <Card className="shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                      <FaUpload className="me-2" />
                      Import Purchase Products
                    </h4>
                    <small className="opacity-75">Import purchase products with batch management support</small>
                  </Card.Header>
                  <Card.Body>
                    {loadingData && (
                      <div className="alert alert-info">
                        <Spinner size="sm" className="me-2" />
                        Loading categories, companies, and units data...
                      </div>
                    )}
                    
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <h5>Step 1: Choose Template Type</h5>
                        <div className="d-flex gap-3 mb-3">
                          <Button 
                            variant={importMode === 'without_batch' ? 'primary' : 'outline-primary'}
                            onClick={() => {
                              setImportMode('without_batch');
                              setUserSelectedMode('without_batch');
                            }}
                            disabled={loadingData}
                          >
                            Simple Products (maintain_batch = FALSE)
                          </Button>
                          <Button 
                            variant={importMode === 'with_batch' ? 'primary' : 'outline-primary'}
                            onClick={() => {
                              setImportMode('with_batch');
                              setUserSelectedMode('with_batch');
                            }}
                            disabled={loadingData}
                          >
                            Batch Products (maintain_batch = TRUE)
                          </Button>
                        </div>
                    
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <h5>Step 2: Download Template</h5>
                        <p className="text-muted">
                          {importMode === 'with_batch' 
                            ? ' For batch products, set maintain_batch = TRUE for batch management.'
                            : ' For simple products, set maintain_batch = FALSE for no batch management.'
                          }
                        </p>
                        <div className="d-flex gap-3">
                          <Button 
                            variant="outline-primary" 
                            onClick={downloadTemplateWithoutBatch}
                            className="d-flex align-items-center"
                            disabled={loadingData}
                          >
                            <FaDownload className="me-2" />
                            Simple Products Template (maintain_batch = FALSE)
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            onClick={downloadTemplateWithBatch}
                            className="d-flex align-items-center"
                            disabled={loadingData}
                          >
                            <FaDownload className="me-2" />
                            Batch Products Template (maintain_batch = TRUE)
                          </Button>
                        </div>
                    
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-12">
                        <h5>Step 3: Upload Excel File</h5>
                        <Form.Group>
                          <Form.Label>Select Excel File</Form.Label>
                          <div className="input-group">
                            <Form.Control
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              onChange={handleFileUpload}
                              ref={fileInputRef}
                              disabled={loading || importing || loadingData}
                            />
                            <Button 
                              variant="outline-secondary"
                              onClick={handleReset}
                              disabled={!excelFile || importing || loadingData}
                            >
                              Clear
                            </Button>
                          </div>
                          <Form.Text className="text-muted">
                            Maximum file size: 5MB. Use the appropriate template for correct formatting.
                          </Form.Text>
                        </Form.Group>

                        {loading && (
                          <div className="alert alert-info mt-2">
                            <Spinner size="sm" className="me-2" />
                            Reading Excel file...
                          </div>
                        )}

                        {excelFile && !loading && (
                          <div className="alert alert-success mt-2">
                            <FaCheckCircle className="me-2" />
                            File selected: <strong>{excelFile.name}</strong> 
                            <br />
                            <small>
                              {excelData.length > 0 ? `${excelData.length} records found` : '0 records found'} | 
                              Mode: <strong>{importMode === 'with_batch' ? 'Batch (maintain_batch = TRUE)' : 'Simple (maintain_batch = FALSE)'}</strong>
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <Alert variant="danger">
                            <h5><FaTimesCircle className="me-2" /> Validation Errors</h5>
                            <ul className="mb-0">
                              {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </Alert>
                        </div>
                      </div>
                    )}

                    {/* Import Results */}
                    {importResults && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <Alert variant={importResults.failed === 0 ? 'success' : 'warning'}>
                            <h5>
                              {importResults.failed === 0 ? (
                                <FaCheckCircle className="me-2" />
                              ) : (
                                <FaExclamationTriangle className="me-2" />
                              )}
                              Import Results
                            </h5>
                            <p>
                              Total: {importResults.total} | 
                              Successful: <strong>{importResults.success}</strong> | 
                              Failed: <strong>{importResults.failed}</strong>
                            </p>
                            {importResults.errors.length > 0 && (
                              <>
                                <h6>Error Details:</h6>
                                <ul className="mb-0">
                                  {importResults.errors.slice(0, 10).map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                  {importResults.errors.length > 10 && (
                                    <li>... and {importResults.errors.length - 10} more errors</li>
                                  )}
                                </ul>
                              </>
                            )}
                          </Alert>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex justify-content-between">
                          <Button
                            variant="secondary"
                            onClick={() => navigate('/purchased_items')}
                            disabled={importing || loadingData}
                          >
                            Back to Purchase Items
                          </Button>
                          
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-secondary"
                              onClick={handleReset}
                              disabled={!excelFile || importing || loadingData}
                            >
                              Clear
                            </Button>
                            
                            <Button
                              variant="primary"
                              onClick={handleImport}
                              disabled={excelData.length === 0 || validationErrors.length > 0 || importing || loadingData}
                            >
                              {importing ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                  />
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <FaUpload className="me-2" />
                                  Import {excelData.length} {importMode === 'with_batch' ? 'Batches' : 'Products'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import_purchase_page;