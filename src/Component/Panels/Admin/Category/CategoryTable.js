import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./CategoryTable.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch, FaHistory, FaCalendarAlt, FaPlus, FaTrash, FaSync } from "react-icons/fa";
import { Modal, Button, Form, Table, Badge, Tabs, Tab, Row, Col, Card, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Category() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState([]);
  const [filteredCategoriesData, setFilteredCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDiscount, setCategoryDiscount] = useState(0);
  const [categoryDiscountEndDate, setCategoryDiscountEndDate] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Discount History States for Add/Edit Modal
  const [discountHistory, setDiscountHistory] = useState([]);
  const [historyForm, setHistoryForm] = useState({
    discount_value: "",
    start_date: null,
    end_date: null
  });

  // Normalize category data to ensure consistent field names
  const normalizeCategory = (category) => {
    return {
      id: category.id,
      name: category.category_name || "Unnamed Category",
      discount: category.discount || 0,
      discount_end_date: category.discount_end_date || null,
      created_at: category.created_at || new Date().toISOString(),
      current_discount_from_history: category.current_discount_from_history || null
    };
  };

  // Sort categories by created_at in descending order (newest first)
  const sortCategoriesByCreatedAt = (categories) => {
    return categories.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  };

  // Fetch categories data
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when data changes
  useEffect(() => {
    if (categoriesData.length > 0) {
      const filteredData = categoriesData.filter(item => {
        const name = item.name || "";
        const discount = item.discount?.toString() || "";
        
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.includes(searchTerm)
        );
      });
      setFilteredCategoriesData(filteredData);
    } else {
      setFilteredCategoriesData([]);
    }
  }, [categoriesData, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/categories`);
      const normalizedData = response.data.map(normalizeCategory);
      const sortedData = sortCategoriesByCreatedAt(normalizedData);
      setCategoriesData(sortedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories data from server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single category by ID
  const fetchCategoryById = async (categoryId) => {
    try {
      const response = await axios.get(`${baseurl}/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  };

  // Fetch discount history for a category
  const fetchDiscountHistory = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await axios.get(`${baseurl}/categories/${categoryId}/discount-history`);
      // Convert string dates to Date objects for the date picker
      const historyWithDates = response.data.map(entry => ({
        ...entry,
        start_date: entry.start_date ? new Date(entry.start_date) : null,
        end_date: entry.end_date ? new Date(entry.end_date) : null
      }));
      setDiscountHistory(historyWithDates);
    } catch (error) {
      console.error("Error fetching discount history:", error);
      setDiscountHistory([]);
    }
  };

  // Handle save category with discount history
  const handleSaveCategory = async () => {
    if (categoryName.trim() === "") return;
    
    setIsSaving(true);
    try {
      // Format dates for API
      const formattedDiscountEndDate = categoryDiscountEndDate 
        ? formatDateForAPI(categoryDiscountEndDate) 
        : null;

      // First, create the category
      const categoryResponse = await axios.post(`${baseurl}/categories`, {
        category_name: categoryName,
        discount: parseFloat(categoryDiscount) || 0,
        discount_end_date: formattedDiscountEndDate
      });

      const newCategoryId = categoryResponse.data.id;
      
      // Create discount history entries
      if (discountHistory.length > 0) {
        for (const history of discountHistory) {
          await axios.post(`${baseurl}/categories/${newCategoryId}/discount-history`, {
            discount_value: parseFloat(history.discount_value),
            start_date: formatDateForAPI(history.start_date),
            end_date: formatDateForAPI(history.end_date)
          });
        }
      }

      // Also create a history entry for the current discount if it exists
      if (parseFloat(categoryDiscount) > 0) {
        await axios.post(`${baseurl}/categories/${newCategoryId}/discount-history`, {
          discount_value: parseFloat(categoryDiscount),
          start_date: new Date().toISOString().split('T')[0],
          end_date: formattedDiscountEndDate || '2099-12-31'
        });
      }

      // Sync the discount
      await axios.post(`${baseurl}/categories/${newCategoryId}/sync-discount`);

      await fetchCategories();
      resetForm();
      setShowAddModal(false);
      alert('Category added successfully with discount history!');
    } catch (error) {
      console.error("Error saving category:", error);
      alert('Failed to add category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update category with discount history
  const handleUpdateCategory = async () => {
    if (categoryName.trim() === "" || !editingCategory) return;
    
    setIsSaving(true);
    try {
      const oldDiscount = editingCategory.discount || 0;
      const newDiscount = parseFloat(categoryDiscount) || 0;

      // Format dates for API
      const formattedDiscountEndDate = categoryDiscountEndDate 
        ? formatDateForAPI(categoryDiscountEndDate) 
        : null;

      // Update the category
      await axios.put(`${baseurl}/categories/${editingCategory.id}`, {
        category_name: categoryName,
        discount: newDiscount,
        discount_end_date: formattedDiscountEndDate
      });
      
      // Create a new history entry if discount changed
      if (newDiscount !== oldDiscount) {
        await axios.post(`${baseurl}/categories/${editingCategory.id}/discount-history`, {
          discount_value: newDiscount,
          start_date: new Date().toISOString().split('T')[0],
          end_date: formattedDiscountEndDate || '2099-12-31'
        });
      }

      // Create history entries for new discount periods
      if (discountHistory.length > 0) {
        for (const history of discountHistory) {
          // Check if this is a new entry (has temporary ID)
          if (history.id && history.id > 1000000000000) { // Temporary IDs are large numbers
            await axios.post(`${baseurl}/categories/${editingCategory.id}/discount-history`, {
              discount_value: parseFloat(history.discount_value),
              start_date: formatDateForAPI(history.start_date),
              end_date: formatDateForAPI(history.end_date)
            });
          }
        }
      }

      // Sync with history
      await axios.post(`${baseurl}/categories/${editingCategory.id}/sync-discount`);

      await fetchCategories();
      resetForm();
      setShowEditModal(false);
      setEditingCategory(null);
      alert('Category updated successfully with new discount history!');
    } catch (error) {
      console.error("Error updating category:", error);
      alert('Failed to update category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id, categoryName) => {
    if (window.confirm(`Are you sure you want to delete ${categoryName}?`)) {
      try {
        await axios.delete(`${baseurl}/categories/${id}`);
        await fetchCategories();
        alert('Category deleted successfully!');
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert('Failed to delete category');
      }
    }
  };

  // Discount History Management Functions
  const addDiscountHistory = () => {
    if (!historyForm.discount_value || !historyForm.start_date || !historyForm.end_date) {
      alert("Please fill all discount history fields");
      return;
    }

    if (historyForm.start_date > historyForm.end_date) {
      alert("Start date cannot be after end date");
      return;
    }

    const newHistory = {
      id: Date.now(), // Temporary ID for local management
      discount_value: historyForm.discount_value,
      start_date: historyForm.start_date,
      end_date: historyForm.end_date,
      created_at: new Date().toISOString()
    };

    setDiscountHistory(prev => [...prev, newHistory]);
    setHistoryForm({ discount_value: "", start_date: null, end_date: null });
  };

 const removeDiscountHistory = async (index, historyId, categoryId) => {
  // If it's a real database entry (not a temporary one), delete from backend
  if (historyId && historyId < 1000000000000 && categoryId) {
    try {
      await axios.delete(`${baseurl}/categories/${categoryId}/discount-history/${historyId}`);
      // Also sync the discount after deletion
      await axios.post(`${baseurl}/categories/${categoryId}/sync-discount`);
    } catch (error) {
      console.error("Error deleting discount history from backend:", error);
      alert('Failed to delete discount period from server.');
      return; // Don't remove from local state if backend deletion fails
    }
  }
  
  // Remove from local state
  setDiscountHistory(prev => prev.filter((_, i) => i !== index));
};

  const resetForm = () => {
    setCategoryName("");
    setCategoryDiscount(0);
    setCategoryDiscountEndDate(null);
    setDiscountHistory([]);
    setHistoryForm({ discount_value: "", start_date: null, end_date: null });
  };

  // Handle edit category
  const handleEdit = async (id) => {
    try {
      // Fetch the specific category details
      const categoryData = await fetchCategoryById(id);
      const normalizedCategory = normalizeCategory(categoryData);
      
      setEditingCategory(normalizedCategory);
      setCategoryName(normalizedCategory.name);
      setCategoryDiscount(normalizedCategory.discount || 0);
      
      // Handle date parsing safely
      if (normalizedCategory.discount_end_date) {
        const date = new Date(normalizedCategory.discount_end_date);
        if (!isNaN(date.getTime())) {
          setCategoryDiscountEndDate(date);
        } else {
          console.warn('Invalid date format:', normalizedCategory.discount_end_date);
          setCategoryDiscountEndDate(null);
        }
      } else {
        setCategoryDiscountEndDate(null);
      }
      
      // Fetch discount history
      await fetchDiscountHistory(id);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error loading category for edit:", error);
      alert('Failed to load category details. Please try again.');
    }
  };

  // Sync discount for a category
  const handleSyncDiscount = async (categoryId) => {
    try {
      await axios.post(`${baseurl}/categories/${categoryId}/sync-discount`);
      await fetchCategories();
      alert('Discount synced successfully from history!');
    } catch (error) {
      console.error("Error syncing discount:", error);
      alert('Failed to sync discount');
    }
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Handle modal open/close
  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    resetForm();
    setEditingCategory(null);
  };

  // Helper functions
  const getStatusBadge = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) return <Badge bg="secondary">Upcoming</Badge>;
    if (today > end) return <Badge bg="danger">Expired</Badge>;
    return <Badge bg="success">Active</Badge>;
  };

  // Format date for display (Indian format)
  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for API:', error);
      return null;
    }
  };

  // Custom date picker component with Indian format
  const CustomDatePicker = ({ selected, onChange, placeholder }) => (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      className="form-control"
      isClearable
      showYearDropdown
      scrollableYearDropdown
    />
  );

  // Custom renderers
  const renderSerialNumberCell = (item, index) => (
    <div className="category-table__sno-cell">
      <span className="category-table__sno">{index + 1}</span>
    </div>
  );

  const renderCategoryCell = (item) => {
    const name = item.name || "Unnamed Category";
    
    return (
      <div className="category-table__category-cell">
        <div className="category-table__header-row">
          <strong className="category-table__category-name">{name}</strong>
        </div>
        <div className="category-table__meta-info">
          <small className="text-muted">ID: {item.id}</small>
        </div>
      </div>
    );
  };

  const renderDiscountCell = (item) => {
    const discount = item.discount || 0;
    const discountEndDate = item.discount_end_date;
    const fromHistory = item.current_discount_from_history;
    
    return (
      <div className="category-table__discount-cell">
        <span className={`category-table__discount-value ${discount > 0 ? 'has-discount' : 'no-discount'}`}>
          {discount > 0 ? `${discount}%` : 'No Discount'}
        </span>
        {discount > 0 && discountEndDate && (
          <div className="category-table__discount-end-date">
            <small className="text-muted">Until: {formatDate(discountEndDate)}</small>
          </div>
        )}
        {fromHistory !== null && fromHistory !== discount && fromHistory !== 0 && (
          <div className="category-table__sync-alert">
            <small className="text-warning">
              <FaSync className="me-1" />
              Sync needed
            </small>
          </div>
        )}
      </div>
    );
  };

  const renderActionsCell = (item) => {
    const name = item.name || "Unnamed Category";
    const needsSync = item.current_discount_from_history !== null && 
                     item.current_discount_from_history !== item.discount &&
                     item.current_discount_from_history !== 0;
    
    return (
      <div className="category-table__actions">
        {needsSync && (
          <button 
            className="category-table__action-btn category-table__action-btn--sync"
            onClick={() => handleSyncDiscount(item.id)}
            title="Sync Discount from History"
          >
            <FaSync />
          </button>
        )}
        <button 
          className="category-table__action-btn category-table__action-btn--edit"
          onClick={() => handleEdit(item.id)}
          title="Edit"
        >
          ✏️
        </button>
        <button 
          className="category-table__action-btn category-table__action-btn--delete"
          onClick={() => handleDelete(item.id, name)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    );
  };

  const columns = [
    { 
      key: "__item", 
      title: "S.No", 
      render: (value, item, index) => renderSerialNumberCell(item, index) 
    },
    { key: "__item", title: "Category", render: (value, item) => renderCategoryCell(item) },
    { key: "__item", title: "Discount", render: (value, item) => renderDiscountCell(item) },
    { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
  ];

  // Common Discount History Form Component
  const DiscountHistorySection = ({ isEdit = false }) => (
    <Card className="mb-4">
      <Card.Header>
        <h6 className="mb-0">
          <FaHistory className="me-2" />
          Discount History Management
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Add New Discount History Form */}
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Discount Value (%)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g., 10"
                value={historyForm.discount_value}
                onChange={(e) => setHistoryForm({...historyForm, discount_value: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <CustomDatePicker
                selected={historyForm.start_date}
                onChange={(date) => setHistoryForm({...historyForm, start_date: date})}
                placeholder="DD/MM/YYYY"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <CustomDatePicker
                selected={historyForm.end_date}
                onChange={(date) => setHistoryForm({...historyForm, end_date: date})}
                placeholder="DD/MM/YYYY"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Label>&nbsp;</Form.Label>
            <div>
              <Button 
                variant="primary" 
                onClick={addDiscountHistory}
                disabled={!historyForm.discount_value || !historyForm.start_date || !historyForm.end_date}
              >
                <FaPlus className="me-1" />
                Add Period
              </Button>
            </div>
          </Col>
        </Row>

        {/* Current Discount History Table */}
        {discountHistory.length > 0 && (
          <>
            <h6>Discount Periods ({discountHistory.length})</h6>
            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {discountHistory.map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td><strong>{entry.discount_value}%</strong></td>
                      <td>{formatDate(entry.start_date)}</td>
                      <td>{formatDate(entry.end_date)}</td>
                      <td>{getStatusBadge(entry.start_date, entry.end_date)}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeDiscountHistory(
                            index, 
                            entry.id, 
                            isEdit ? editingCategory?.id : null
                          )}
                          title="Remove"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {discountHistory.length === 0 && (
          <div className="text-center text-muted py-3">
            No discount periods added yet. Add discount periods to track historical pricing.
          </div>
        )}
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="category-wrapper">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`category-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="category-main-content">
            <div className="loading-spinner">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-wrapper">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen}
      />
      
      <div className={`category-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={handleToggleMobile}
        />

        <div className="category-main-content">
          <div className="category-content-section">
            <div className="category-header-top">
              <div className="category-title-section">
                <h1 className="category-main-title">All Categories</h1>
                <p className="category-subtitle">
                  Manage product categories and organize your inventory
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center category-search-add-container">
              <div className="category-search-container">
                <div className="category-search-box">
                  <input
                    type="text"
                    placeholder="Search categories ..."
                    className="category-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="category-search-icon" size={18} />
                </div>
              </div>

              <button
                className="category-add-button category-add-button--top"
                onClick={handleOpenAddModal}
              >
                <span className="category-add-icon">+</span>
                Add Category
              </button>
            </div>

            {error && (
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            )}

            <div className="category-list-section">
              <div className="category-section-header">
                <h2 className="category-section-title">
                  Categories ({filteredCategoriesData.length})
                </h2>
                <p className="category-section-description">
                  Organize your products with categories and sub-categories
                </p>
              </div>

              <div className="category-table-container">
                <ReusableTable
                  data={filteredCategoriesData}
                  columns={columns}
                  initialEntriesPerPage={5}
                  searchPlaceholder="Search categories..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Basic Information">
              <Form.Group className="mb-3">
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Current Discount (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter discount percentage"
                  value={categoryDiscount}
                  onChange={(e) => setCategoryDiscount(e.target.value)}
                />
                <Form.Text className="text-muted">
                  This will be the current active discount for the category
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discount End Date</Form.Label>
                <CustomDatePicker
                  selected={categoryDiscountEndDate}
                  onChange={setCategoryDiscountEndDate}
                  placeholder="DD/MM/YYYY"
                />
                <Form.Text className="text-muted">
                  Leave empty for no end date (permanent discount)
                </Form.Text>
              </Form.Group>
            </Tab>
            
            <Tab eventKey="history" title="Discount History">
              <DiscountHistorySection />
              <Alert variant="info">
                <small>
                  <strong>Note:</strong> The current discount above will be automatically added as an active period. 
                  You can add additional historical or future discount periods here.
                </small>
              </Alert>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveCategory} 
            disabled={isSaving || categoryName.trim() === ""}
          >
            {isSaving ? 'Saving...' : 'Save Category'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Category - {editingCategory?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Basic Information">
              <Form.Group className="mb-3">
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Current Discount (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter discount percentage"
                  value={categoryDiscount}
                  onChange={(e) => setCategoryDiscount(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Changing this discount will create a new history entry
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discount End Date</Form.Label>
                <CustomDatePicker
                  selected={categoryDiscountEndDate}
                  onChange={setCategoryDiscountEndDate}
                  placeholder="DD/MM/YYYY"
                />
                <Form.Text className="text-muted">
                  Leave empty for no end date (permanent discount)
                </Form.Text>
              </Form.Group>
              {editingCategory && (
                <div className="text-muted small">
                  Category ID: {editingCategory.id}
                </div>
              )}
            </Tab>
            
            <Tab eventKey="history" title="Discount History">
              <DiscountHistorySection isEdit={true} />
              <Alert variant="info">
                <small>
                  <strong>Note:</strong> This shows existing discount history. You can add new periods for future discounts.
                  New periods added here will be saved when you update the category.
                </small>
              </Alert>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateCategory} 
            disabled={isSaving || categoryName.trim() === ""}
          >
            {isSaving ? 'Updating...' : 'Update Category'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Category;