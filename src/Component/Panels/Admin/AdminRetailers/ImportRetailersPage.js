import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaUpload, FaFileExcel, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDownload, FaArrowLeft } from 'react-icons/fa';
import * as XLSX from 'xlsx-js-style';
import axios from 'axios';
import { baseurl } from '../../../BaseURL/BaseURL';
import './ImportRetailersPage.css';

const ImportRetailersPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successfulUploads, setSuccessfulUploads] = useState(0);
  const [failedUploads, setFailedUploads] = useState(0);
  const fileInputRef = useRef(null);
  
  // Get selected role from location state or default to 'retailer'
  const selectedRole = location.state?.selectedRole || 'retailer';
  
  // Normalize column names to match expected format
  const normalizeColumnNames = (data) => {
    if (!data || data.length === 0) return data;

    const columnMapping = {
      // Required fields
      'name': 'name',
      'full name': 'name',
      'person name': 'name',
      'contact person': 'name',
      
      'business_name': 'business_name',
      'business name': 'business_name',
      'company name': 'business_name',
      'company_name': 'business_name',
      'store name': 'business_name',
      'store_name': 'business_name',
      
      'display_name': 'display_name',
      'display name': 'display_name',
      'shop name': 'display_name',
      'shop_name': 'display_name',
      
      // Contact fields
      'email': 'email',
      'email address': 'email',
      'email_id': 'email',
      
      'mobile_number': 'mobile_number',
      'mobile number': 'mobile_number',
      'mobile': 'mobile_number',
      'phone': 'mobile_number',
      'contact number': 'mobile_number',
      'contact_number': 'mobile_number',
      
      'phone_number': 'phone_number',
      'phone number': 'phone_number',
      'landline': 'phone_number',
      'telephone': 'phone_number',
      
      // Address fields
      'shipping_address_line1': 'shipping_address_line1',
      'shipping address line1': 'shipping_address_line1',
      'shipping address': 'shipping_address_line1',
      'address line1': 'shipping_address_line1',
      'address': 'shipping_address_line1',
      
      'shipping_city': 'shipping_city',
      'shipping city': 'shipping_city',
      'city': 'shipping_city',
      
      'shipping_state': 'shipping_state',
      'shipping state': 'shipping_state',
      'state': 'shipping_state',
      
      'shipping_pin_code': 'shipping_pin_code',
      'shipping pin code': 'shipping_pin_code',
      'shipping pincode': 'shipping_pin_code',
      'pin code': 'shipping_pin_code',
      'pincode': 'shipping_pin_code',
      'zip code': 'shipping_pin_code',
      
      'shipping_country': 'shipping_country',
      'shipping country': 'shipping_country',
      'country': 'shipping_country',
      
      'billing_address_line1': 'billing_address_line1',
      'billing address line1': 'billing_address_line1',
      'billing address': 'billing_address_line1',
      
      'billing_city': 'billing_city',
      'billing city': 'billing_city',
      
      'billing_state': 'billing_state',
      'billing state': 'billing_state',
      
      'billing_pin_code': 'billing_pin_code',
      'billing pin code': 'billing_pin_code',
      'billing pincode': 'billing_pin_code',
      
      'billing_country': 'billing_country',
      'billing country': 'billing_country',
      
      // Business fields
      'entity_type': 'entity_type',
      'entity type': 'entity_type',
      'business type': 'entity_type',
      'business_type': 'entity_type',
      'type': 'entity_type',
      
      'gstin': 'gstin',
      'gst': 'gstin',
      'gst number': 'gstin',
      'gst_number': 'gstin',
      'tax id': 'gstin',
      
      'discount': 'discount',
      'discount%': 'discount',
      'discount percent': 'discount',
      
      'target': 'target',
      'sales target': 'target',
      'sales_target': 'target',
      'annual target': 'target',
      
      'credit_limit': 'credit_limit',
      'credit limit': 'credit_limit',
      'credit': 'credit_limit',
      
      'group': 'group',
      'category': 'group',
      'retailer group': 'group',
      
      'role': 'role',
      'user role': 'role',
      'account type': 'role',
    };

    return data.map(row => {
      const normalizedRow = {};
      
      Object.keys(row).forEach(key => {
        const originalKey = key.toString().trim();
        let normalizedKey = '';
        
        const cleanKey = originalKey.toLowerCase().replace(/\s+/g, ' ').trim();
        
        if (columnMapping[cleanKey]) {
          normalizedKey = columnMapping[cleanKey];
        } else if (columnMapping[originalKey.toLowerCase()]) {
          normalizedKey = columnMapping[originalKey.toLowerCase()];
        } else {
          normalizedKey = originalKey.toLowerCase().replace(/\s+/g, '_');
        }
        
        normalizedRow[normalizedKey] = row[key];
      });
      
      return normalizedRow;
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload a valid Excel file (XLSX, XLS, CSV)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setExcelFile(file);
    setExcelData([]);
    setValidationErrors([]);
    setImportResults(null);
    setUploadProgress(0);
    setSuccessfulUploads(0);
    setFailedUploads(0);
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
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
          dateNF: 'yyyy-mm-dd'
        });
        
        if (jsonData.length === 0) {
          setValidationErrors(['Excel file is empty or has no data rows']);
          setLoading(false);
          return;
        }

        const normalizedData = normalizeColumnNames(jsonData);
        
        const errors = validateExcelData(normalizedData);
        setValidationErrors(errors);
        
        if (errors.length > 0) {
          setExcelData([]);
        } else {
          // Process and set data with status
          const processedData = normalizedData.map((row, index) => ({
            ...row,
            __id: index + 1,
            __status: "pending"
          }));
          setExcelData(processedData);
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

  // Validate Excel data
  const validateExcelData = (data) => {
    const errors = [];
    
    if (!data || data.length === 0) {
      errors.push('Excel file is empty or has no data rows');
      return errors;
    }

    const firstRow = data[0];
    const rowKeys = Object.keys(firstRow).map(key => key.toLowerCase());

  

    return errors;
  };

  // Process data for API
  const processDataForAPI = (data) => {
    return data.map((row) => {
      const processedRow = {
        ...row,
        role: selectedRole,
        status: "Active",
        password: row.name ? 
          `${row.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}@123` : "",
        discount: row.discount || 0,
        target: row.target || 100000,
      };
      
      if (selectedRole === "retailer") {
        processedRow.group = row.group || "Retailer";
        processedRow.entity_type = row.entity_type || "Individual";
      } else {
        processedRow.group = row.group || "SUPPLIERS";
      }
      
      return processedRow;
    });
  };

const downloadTemplate = () => {
  const templateHeaders = selectedRole === "retailer"
    ? [
        "name", "business_name", "display_name", "email", "mobile_number",
        "phone_number", "entity_type", "gstin", "discount", "target",
        "credit_limit", "opening_balance", "opening_balance_type",
        "shipping_address_line1", "shipping_city", "shipping_state",
        "shipping_pin_code", "shipping_country",
        "billing_address_line1", "billing_city", "billing_state",
        "billing_pin_code", "billing_country"
      ]
    : [
        "name", "business_name", "display_name", "email", "mobile_number",
        "phone_number", "gstin", "discount", "target",
        "opening_balance", "opening_balance_type",
        "shipping_address_line1", "shipping_city", "shipping_state",
        "shipping_pin_code", "shipping_country", "billing_address_line1",
        "billing_city", "billing_state", "billing_pin_code", "billing_country"
      ];

  const sampleData = selectedRole === "retailer"
    ? [
        "John Doe", "ABC Traders", "John's Store", "john@example.com", "9876543210",
        "0441234567", "Individual", "27ABCDE1234F1Z5", "10", "100000",
        "50000", "10000", "Credit",
        "123 Main Street", "Chennai", "Tamil Nadu", "600001",
        "India", "123 Main Street", "Chennai", "Tamil Nadu", "600001", "India"
      ]
    : [
        "Supplier Corp", "Supplier Corp", "Supplier Corp Display", "supplier@example.com",
        "9876543210", "0441234567", "27ABCDE1234F1Z5", "5", "500000",
        "10000", "Credit",
        "456 Supplier Street", "Mumbai", "Maharashtra", "400001",
        "India", "456 Supplier Street", "Mumbai", "Maharashtra", "400001", "India"
      ];
  const ws = {};
 const mandatoryColumns = [
  "name",
  "display_name",
  "entity_type",
  "shipping_state",
  "shipping_country",
  "billing_state",
  "billing_country",
  "opening_balance",
  "opening_balance_type",


];

const redStyle = {
  font: { bold: true, color: { rgb: "FF0000" } },
  alignment: { horizontal: "center" }
};

const normalStyle = {
  font: { bold: true, color: { rgb: "000000" } },
  alignment: { horizontal: "center" }
};

templateHeaders.forEach((header, colIndex) => {
  const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
  ws[cellRef] = {
    v: header,
    t: "s",
    s: mandatoryColumns.includes(header) ? redStyle : normalStyle
  };
});

  sampleData.forEach((value, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIndex });
    ws[cellRef] = { v: value, t: "s" };
  });

  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: 1, c: templateHeaders.length - 1 }
  });

  ws["!cols"] = templateHeaders.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  XLSX.writeFile(wb, `${selectedRole}_bulk_upload_template.xlsx`);
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

    setImporting(true);
    setUploadProgress(0);
    setSuccessfulUploads(0);
    setFailedUploads(0);
    setImportResults(null);

    try {
      const totalRecords = excelData.length;
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      const processedData = processDataForAPI(excelData);

      for (let i = 0; i < processedData.length; i++) {
        const record = processedData[i];
        
        const progress = Math.round(((i + 1) / totalRecords) * 100);
        setUploadProgress(progress);

        try {
          const uploadData = { ...record };
          delete uploadData.__id;
          delete uploadData.__status;

          await axios.post(`${baseurl}/accounts`, uploadData);
          successCount++;
          setSuccessfulUploads(successCount);

          const updatedData = [...excelData];
          updatedData[i] = {
            ...updatedData[i],
            __status: "success"
          };
          setExcelData(updatedData);

        } catch (error) {
          failCount++;
          setFailedUploads(failCount);
          
          const errorMsg = error.response?.data?.message || error.message || "Upload failed";
          errors.push(`Row ${i + 2}: ${errorMsg}`);
          
          const updatedData = [...excelData];
          updatedData[i] = {
            ...updatedData[i],
            __status: "error",
            __error: errorMsg
          };
          setExcelData(updatedData);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadProgress(100);
      
      setImportResults({
        total: totalRecords,
        success: successCount,
        failed: failCount,
        errors: errors
      });

      if (failCount === 0) {
        alert(`Successfully imported ${successCount} ${selectedRole}(s)!`);
      } else {
        alert(`Imported ${successCount} out of ${totalRecords} records. ${failCount} failed.`);
      }

    } catch (error) {
      console.error("Bulk upload error:", error);
      alert("Bulk upload failed. Please try again.");
      setImportResults({
        total: excelData.length,
        success: 0,
        failed: excelData.length,
        errors: [`System error: ${error.message}`]
      });
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
    setUploadProgress(0);
    setSuccessfulUploads(0);
    setFailedUploads(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Navigate back to retailers page (always navigate to /retailers)
  const handleBack = () => {
    navigate('/retailers');
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <AdminHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        <div className="content-wrapper">
          <div className="container-fluid mt-3">
            <div className="row">
              <div className="col-12">
                <Card className="shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                      <FaUpload className="me-2" />
                      Import {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}
                    </h4>
                    <small className="text-light">
                      Bulk import {selectedRole === 'retailer' ? 'retailers' : 'suppliers'} using Excel file
                    </small>
                  </Card.Header>
                  
                  <Card.Body style={{width:'100%'}}>
                    {/* Step 1: Instructions */}
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <h5>Step 1: Download Template</h5>
                        {/* <div className="alert alert-info">
                          <FaExclamationTriangle className="me-2" />
                          <strong>Important Notes:</strong>
                          <ul className="mb-0 mt-2">
                            <li><strong>Required fields:</strong> name, business_name, display_name</li>
                            <li><strong>Optional fields:</strong> email, mobile_number, phone_number, etc.</li>
                            <li>Each record will be added as a <strong>{selectedRole}</strong></li>
                            <li>Maximum file size: 5MB</li>
                            <li>Supported formats: .xlsx, .xls, .csv</li>
                          </ul>
                        </div> */}
                        
                        <Button
                          variant="outline-primary"
                          onClick={downloadTemplate}
                          className="d-flex align-items-center"
                        >
                          <FaDownload className="me-2" />
                          Download {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'} Template
                        </Button>
                      </div>
                    </div>

                    {/* Step 2: File Upload */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h5>Step 2: Upload Excel File</h5>
                        <Form.Group>
                          <Form.Label>Select Excel File</Form.Label>
                          <div className="input-group">
                            <Form.Control
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              onChange={handleFileUpload}
                              ref={fileInputRef}
                              disabled={loading || importing}
                            />
                            <Button 
                              variant="outline-secondary"
                              onClick={handleReset}
                              disabled={!excelFile || importing}
                            >
                              Clear
                            </Button>
                          </div>
                          <Form.Text className="text-muted">
                            Maximum file size: 5MB. Use the template for correct formatting.
                          </Form.Text>
                        </Form.Group>

                        {loading && (
                          <Alert variant="info" className="mt-3">
                            <Spinner size="sm" className="me-2" />
                            Reading Excel file...
                          </Alert>
                        )}

                        {excelFile && !loading && (
                          <Alert variant="success" className="mt-3">
                            <FaCheckCircle className="me-2" />
                            File selected: <strong>{excelFile.name}</strong> 
                            <br />
                            <small>
                              {excelData.length > 0 ? `${excelData.length} records found` : '0 records found'}
                            </small>
                          </Alert>
                        )}
                      </div>
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <Alert variant="danger">
                            <h6>
                              <FaTimesCircle className="me-2" />
                              Validation Errors ({validationErrors.length})
                            </h6>
                            <ul className="mb-0">
                              {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </Alert>
                        </div>
                      </div>
                    )}

                    {/* Data Preview */}
                    {excelData.length > 0 && validationErrors.length === 0 && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5>Preview ({excelData.length} records)</h5>
                          <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th>#</th>
                                  <th>Name</th>
                                  <th>Business Name</th>
                                  <th>Email</th>
                                  <th>Mobile</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {excelData.map((item, index) => (
                                  <tr key={index} className={item.__status === 'error' ? 'table-danger' : item.__status === 'success' ? 'table-success' : ''}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.business_name}</td>
                                    <td>{item.email || '-'}</td>
                                    <td>{item.mobile_number || '-'}</td>
                                    <td>
                                      <span className={`badge ${item.__status === 'success' ? 'bg-success' : item.__status === 'error' ? 'bg-danger' : 'bg-secondary'}`}>
                                        {item.__status === 'success' ? '✓ Ready' : 
                                         item.__status === 'error' ? '✗ Error' : '⏳ Pending'}
                                      </span>
                                      {item.__error && (
                                        <div className="small text-danger mt-1">{item.__error}</div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {importing && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5>Upload Progress</h5>
                          <div className="progress mb-2" style={{ height: '25px' }}>
                            <div 
                              className="progress-bar progress-bar-striped progress-bar-animated" 
                              role="progressbar" 
                              style={{ width: `${uploadProgress}%` }}
                              aria-valuenow={uploadProgress} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            >
                              {uploadProgress}%
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Uploading: {successfulUploads + failedUploads} of {excelData.length}</span>
                            <span>Success: {successfulUploads} | Failed: {failedUploads}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Import Results */}
                    {importResults && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <Alert variant={importResults.failed === 0 ? 'success' : 'warning'}>
                            <h5>Import Results</h5>
                            <p>
                              <strong>Total Records:</strong> {importResults.total}<br />
                              <strong>Successfully Imported:</strong> {importResults.success}<br />
                              <strong>Failed:</strong> {importResults.failed}
                            </p>
                            {importResults.errors.length > 0 && (
                              <div>
                                <h6>Errors:</h6>
                                <ul>
                                  {importResults.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
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
                            onClick={handleBack}
                            disabled={importing}
                          >
                            <FaArrowLeft className="me-2" />
                            Back to {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}
                          </Button>
                          
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-secondary"
                              onClick={handleReset}
                              disabled={!excelFile || importing}
                            >
                              Clear
                            </Button>
                            
                            <Button
                              variant="primary"
                              onClick={handleImport}
                              disabled={excelData.length === 0 || validationErrors.length > 0 || importing}
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
                                  Import {excelData.length} {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}
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

export default ImportRetailersPage;