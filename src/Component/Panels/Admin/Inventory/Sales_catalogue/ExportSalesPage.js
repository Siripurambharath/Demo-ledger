import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Alert, Spinner, Row, Col, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';
import AdminSidebar from '../../../../Shared/AdminSidebar/AdminSidebar';
import Header from '../../../../Shared/AdminSidebar/AdminHeader';
import { useNavigate } from 'react-router-dom';
import { 
  FaDownload, 
  FaFileExcel, 
  FaFileCsv, 
  FaFilter,
  FaCalendarAlt,
  FaList,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { baseurl } from '../../../../BaseURL/BaseURL';

const ExportSalesPage = ({ user }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minStock: '',
    maxStock: '',
    minPrice: '',
    maxPrice: '',
    category: 'all',
    company: 'all'
  });
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsResponse = await axios.get(`${baseurl}/products`);
      const salesProducts = productsResponse.data.filter(item => item.group_by === "Salescatalog");
      setProducts(salesProducts);
      setFilteredProducts(salesProducts);
      
      // Fetch categories
      const categoriesResponse = await axios.get(`${baseurl}/categories`);
      setCategories(categoriesResponse.data);
      
      // Fetch companies
      const companiesResponse = await axios.get(`${baseurl}/companies`);
      setCompanies(companiesResponse.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data for export');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...products];

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at);
        const filterDate = new Date(filters.dateFrom);
        return itemDate >= filterDate;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at);
        const filterDate = new Date(filters.dateTo);
        return itemDate <= filterDate;
      });
    }

    // Stock filter
    if (filters.minStock) {
      filtered = filtered.filter(item => 
        (item.balance_stock || 0) >= parseInt(filters.minStock)
      );
    }

    if (filters.maxStock) {
      filtered = filtered.filter(item => 
        (item.balance_stock || 0) <= parseInt(filters.maxStock)
      );
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(item => 
        (item.price || 0) >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(item => 
        (item.price || 0) <= parseFloat(filters.maxPrice)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => 
        item.category_id === filters.category
      );
    }

    // Company filter
    if (filters.company !== 'all') {
      filtered = filtered.filter(item => 
        item.company_id === filters.company
      );
    }

    setFilteredProducts(filtered);
    setSelectedProducts([]);
    setSelectAll(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      minStock: '',
      maxStock: '',
      minPrice: '',
      maxPrice: '',
      category: 'all',
      company: 'all'
    });
    setFilteredProducts(products);
    setSelectedProducts([]);
    setSelectAll(false);
  };

  // Handle product selection
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  // Prepare data for export
  const prepareExportData = () => {
    const productsToExport = selectedProducts.length > 0 
      ? filteredProducts.filter(p => selectedProducts.includes(p.id))
      : filteredProducts;

    return productsToExport.map(item => ({
      'Product ID': item.id,
      'Product Name': item.goods_name,
      'Price': item.price,
      'MRP': item.mrp || '',
      'Purchase Price': item.purchase_price || '',
      'Description': item.description,
      'GST Rate': `${item.gst_rate || 0}%`,
      'GST Type': item.inclusive_gst || 'Inclusive',
      'HSN Code': item.hsn_code || '',
      'SKU': item.sku || '',
      'Category ID': item.category_id,
      'Category Name': categories.find(c => c.id === item.category_id)?.category_name || '',
      'Company ID': item.company_id,
      'Company Name': companies.find(c => c.id === item.company_id)?.company_name || '',
      'Unit': item.unit || 'UNT-UNITS',
      'Opening Stock': item.opening_stock || 0,
      'Current Stock': item.balance_stock || 0,
      'Stock In': item.stock_in || 0,
      'Stock Out': item.stock_out || 0,
      'Min Stock Alert': item.min_stock_alert || '',
      'Max Stock Alert': item.max_stock_alert || '',
      'Min Sale Price': item.min_sale_price || '',
      'CESS Rate': item.cess_rate || 0,
      'CESS Amount': item.cess_amount || 0,
      'Non Taxable': item.non_taxable || 'No',
      'Maintain Batch': item.maintain_batch ? 'Yes' : 'No',
      'Can Be Sold': item.can_be_sold ? 'Yes' : 'No',
      'Created At': new Date(item.created_at).toLocaleString(),
      'Updated At': new Date(item.updated_at).toLocaleString(),
      'Status': item.status || 'active'
    }));
  };

  // Export function
  const handleExport = async () => {
    if (filteredProducts.length === 0) {
      alert('No products to export!');
      return;
    }

    setExporting(true);

    try {
      const exportData = prepareExportData();
      
      if (selectedFormat === 'excel') {
        exportToExcel(exportData);
      } else {
        exportToCSV(exportData);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    const maxWidth = 30;
    const wscols = Object.keys(data[0]).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Products");

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const selectedCount = selectedProducts.length > 0 ? `${selectedProducts.length}_selected_` : '';
    const filename = `sales_products_${selectedCount}${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
    
    alert(`Successfully exported ${data.length} products to ${filename}`);
  };

  // Export to CSV
  const exportToCSV = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const selectedCount = selectedProducts.length > 0 ? `${selectedProducts.length}_selected_` : '';
    const filename = `sales_products_${selectedCount}${timestamp}.csv`;
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Successfully exported ${data.length} products to ${filename}`);
  };

  // Export batch details
  const handleExportBatchDetails = async () => {
    if (filteredProducts.length === 0) {
      alert('No products to export!');
      return;
    }

    setExporting(true);

    try {
      // Fetch batch details for each product
      const batchData = [];
      
      for (const product of filteredProducts) {
        if (product.maintain_batch) {
          try {
            const response = await axios.get(`${baseurl}/products/${product.id}/batches`);
            const batches = response.data || [];
            
            batches.forEach(batch => {
              batchData.push({
                'Product ID': product.id,
                'Product Name': product.goods_name,
                'Batch Number': batch.batch_number || '',
                'Mfg Date': batch.mfg_date?.split('T')[0] || '',
                'Exp Date': batch.exp_date?.split('T')[0] || '',
                'Quantity': batch.quantity || 0,
                'Opening Stock': batch.opening_stock || 0,
                'Current Stock': batch.quantity || 0,
                'Stock In': batch.stock_in || 0,
                'Stock Out': batch.stock_out || 0,
                'Selling Price': batch.selling_price || '',
                'Purchase Price': batch.purchase_price || '',
                'MRP': batch.mrp || '',
                'Min Sale Price': batch.min_sale_price || '',
                'Barcode': batch.barcode || '',
                'Status': 'active'
              });
            });
          } catch (error) {
            console.error(`Error fetching batches for product ${product.id}:`, error);
          }
        }
      }

      if (batchData.length === 0) {
        alert('No batch data found to export');
        return;
      }

      // Export batch data
      const worksheet = XLSX.utils.json_to_sheet(batchData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Batch Details");

      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `batch_details_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);
      
      alert(`Successfully exported ${batchData.length} batch records to ${filename}`);
      
    } catch (error) {
      console.error('Error exporting batch details:', error);
      alert('Failed to export batch details');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Header user={user} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        <div className="content-wrapper">
          <div className="container-fluid mt-3">
            <div className="row mb-3">
              <div className="col-12">
                <h3 className="mb-0">
                  <FaDownload className="me-2" />
                  Export Sales Products
                </h3>
                <p className="text-muted">Export your sales products to Excel or CSV format</p>
              </div>
            </div>

            <div className="row">
              {/* Left Column: Filters */}
              <div className="col-md-4">
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaFilter className="me-2" />
                      Export Filters
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      {/* Date Range */}
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaCalendarAlt className="me-2" />
                          Date Range
                        </Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="From Date"
                              value={filters.dateFrom}
                              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="date"
                              placeholder="To Date"
                              value={filters.dateTo}
                              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                            />
                          </Col>
                        </Row>
                      </Form.Group>

                      {/* Stock Range */}
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Range</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="number"
                              placeholder="Min Stock"
                              value={filters.minStock}
                              onChange={(e) => setFilters({...filters, minStock: e.target.value})}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="number"
                              placeholder="Max Stock"
                              value={filters.maxStock}
                              onChange={(e) => setFilters({...filters, maxStock: e.target.value})}
                            />
                          </Col>
                        </Row>
                      </Form.Group>

                      {/* Price Range */}
                      <Form.Group className="mb-3">
                        <Form.Label>Price Range</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="number"
                              step="0.01"
                              placeholder="Min Price"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="number"
                              step="0.01"
                              placeholder="Max Price"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                            />
                          </Col>
                        </Row>
                      </Form.Group>

                      {/* Category Filter */}
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={filters.category}
                          onChange={(e) => setFilters({...filters, category: e.target.value})}
                        >
                          <option value="all">All Categories</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.category_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {/* Company Filter */}
                      <Form.Group className="mb-3">
                        <Form.Label>Company</Form.Label>
                        <Form.Select
                          value={filters.company}
                          onChange={(e) => setFilters({...filters, company: e.target.value})}
                        >
                          <option value="all">All Companies</option>
                          {companies.map(company => (
                            <option key={company.id} value={company.id}>
                              {company.company_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {/* Format Selection */}
                      <Form.Group className="mb-3">
                        <Form.Label>Export Format</Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            label={
                              <>
                                <FaFileExcel className="me-1" />
                                Excel (.xlsx)
                              </>
                            }
                            name="exportFormat"
                            value="excel"
                            checked={selectedFormat === 'excel'}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label={
                              <>
                                <FaFileCsv className="me-1" />
                                CSV (.csv)
                              </>
                            }
                            name="exportFormat"
                            value="csv"
                            checked={selectedFormat === 'csv'}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                          />
                        </div>
                      </Form.Group>

                      {/* Action Buttons */}
                      <div className="d-grid gap-2">
                        <Button 
                          variant="primary" 
                          onClick={applyFilters}
                          disabled={loading}
                        >
                          <FaFilter className="me-2" />
                          Apply Filters
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={resetFilters}
                          disabled={loading}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                {/* Summary Card */}
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Export Summary</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Products:</span>
                      <strong>{products.length}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Filtered Products:</span>
                      <strong>{filteredProducts.length}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Selected Products:</span>
                      <strong>{selectedProducts.length}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Format:</span>
                      <strong>{selectedFormat.toUpperCase()}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Products with Batches:</span>
                      <strong>{filteredProducts.filter(p => p.maintain_batch).length}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Right Column: Product List and Actions */}
              <div className="col-md-8">
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <FaList className="me-2" />
                        Products for Export ({filteredProducts.length})
                      </h6>
                      <div className="d-flex gap-2">
                        <Form.Check
                          type="checkbox"
                          label="Select All"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="mt-2">Loading products...</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-5">
                        <FaTimesCircle size={48} className="text-muted mb-3" />
                        <p>No products found with current filters</p>
                        <Button variant="outline-primary" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table hover size="sm">
                          <thead>
                            <tr>
                              <th style={{ width: '40px' }}>#</th>
                              <th>Select</th>
                              <th>Product Name</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Category</th>
                              <th>Batches</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product, index) => (
                              <tr key={product.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleSelectProduct(product.id)}
                                  />
                                </td>
                                <td>
                                  <small className="fw-semibold">{product.goods_name}</small>
                                  <br />
                                  <small className="text-muted">{product.sku}</small>
                                </td>
                                <td>₹{product.price}</td>
                                <td>
                                  <span className={product.balance_stock <= 0 ? 'text-danger' : ''}>
                                    {product.balance_stock || 0}
                                  </span>
                                </td>
                                <td>
                                  <small>
                                    {categories.find(c => c.id === product.category_id)?.category_name || 'N/A'}
                                  </small>
                                </td>
                                <td>
                                  {product.maintain_batch ? (
                                    <span className="badge bg-info">Has Batches</span>
                                  ) : (
                                    <span className="badge bg-secondary">No</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Export Actions */}
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Export Actions</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-3">
                      <Button 
                        variant="success" 
                        size="lg"
                        onClick={handleExport}
                        disabled={filteredProducts.length === 0 || exporting}
                      >
                        {exporting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <FaDownload className="me-2" />
                            Export {selectedProducts.length > 0 ? `${selectedProducts.length} Selected` : `${filteredProducts.length} Filtered`} Products
                          </>
                        )}
                      </Button>

                      <Button 
                        variant="info" 
                        size="lg"
                        onClick={handleExportBatchDetails}
                        disabled={filteredProducts.filter(p => p.maintain_batch).length === 0 || exporting}
                      >
                        <FaFileExcel className="me-2" />
                        Export Batch Details
                      </Button>

                      <div className="d-flex justify-content-between">
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => navigate('/sale_items')}
                          disabled={exporting}
                        >
                          Back to Sales
                        </Button>
                        
                        <Button 
                          variant="outline-primary" 
                          onClick={() => navigate('/import-sales')}
                          disabled={exporting}
                        >
                          Go to Import
                        </Button>
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

export default ExportSalesPage;