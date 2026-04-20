import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import AddCompanyModal from "../Inventory/Sales_catalogue/AddCompanyModal";
import "./CompanyTable.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch, FaPlus } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

function CompanyTable() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [companiesData, setCompaniesData] = useState([]);
  const [filteredCompaniesData, setFilteredCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyDiscount, setCompanyDiscount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Normalize company data to ensure consistent field names
  const normalizeCompany = (company) => {
    return {
      id: company.id,
      company_name: company.company_name || company.name || "Unnamed Company",
      name: company.company_name || company.name || "Unnamed Company",
      email: company.email || "",
      status: company.status || "Active",
      discount: company.discount || 0,
      created_at: company.created_at || new Date().toISOString()
    };
  };

  // Sort companies by created_at in descending order (newest first)
  const sortCompaniesByCreatedAt = (companies) => {
    return companies.sort((a, b) => {
      const dateA = new Date(a.created_at || a.id);
      const dateB = new Date(b.created_at || b.id);
      return dateB - dateA; // Descending order (newest first)
    });
  };

  // Fetch companies data from API
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/companies`);
      
      const normalizedData = response.data.map(normalizeCompany);
      // Sort companies by created_at (newest first)
      const sortedData = sortCompaniesByCreatedAt(normalizedData);
      setCompaniesData(sortedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies data');
      
      const staticCompaniesData = [
        {
          id: 1,
          company_name: "Tech Solutions Inc",
          name: "Tech Solutions Inc",
          email: "contact@techsolutions.com",
          status: "Active",
          discount: 5.00,
          created_at: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          company_name: "Global Manufacturing Ltd",
          name: "Global Manufacturing Ltd",
          email: "info@globalmfg.com",
          status: "Active",
          discount: 10.00,
          created_at: "2024-01-16T11:30:00Z"
        }
      ];
      
      // Sort static data as well
      const sortedStaticData = sortCompaniesByCreatedAt(staticCompaniesData);
      setCompaniesData(sortedStaticData);
    } finally {
      setLoading(false);
    }
  };

  // Filter companies when search term changes
  useEffect(() => {
    if (companiesData.length > 0) {
      const filteredData = companiesData.filter(item =>
        (item.company_name || item.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id?.toString() || "").includes(searchTerm.toLowerCase()) ||
        (item.discount?.toString() || "").includes(searchTerm)
      );
      setFilteredCompaniesData(filteredData);
    }
  }, [companiesData, searchTerm]);

  // Handle delete company
  const handleDelete = async (id, companyName) => {
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      try {
        await axios.delete(`${baseurl}/companies/${id}`);
        alert('Company deleted successfully!');
        fetchCompanies();
      } catch (err) {
        console.error('Failed to delete company:', err);
        alert('Failed to delete company');
      }
    }
  };

  // Handle edit company
  const handleEdit = (id) => {
    const companyToEdit = companiesData.find(company => company.id === id);
    if (companyToEdit) {
      setEditingCompany(companyToEdit);
      setCompanyName(companyToEdit.company_name || companyToEdit.name);
      setCompanyDiscount(companyToEdit.discount || 0);
      setShowEditModal(true);
    }
  };

  // Handle update company
  const handleUpdateCompany = async () => {
    if (companyName.trim() === "" || !editingCompany) return;
    
    setIsSaving(true);
    try {
      await axios.put(`${baseurl}/companies/${editingCompany.id}`, {
        company_name: companyName,
        discount: parseFloat(companyDiscount) || 0
      });
      
      // Refetch companies to get proper sorting with updated data
      await fetchCompanies();
      
      setCompanyName("");
      setCompanyDiscount(0);
      setShowEditModal(false);
      setEditingCompany(null);
      alert('Company updated successfully!');
    } catch (error) {
      console.error("Error updating company:", error);
      alert('Failed to update company. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add new company from modal
  const handleAddCompany = (newCompany) => {
    fetchCompanies(); // This will refetch and sort with newest first
    setShowAddModal(false);
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Custom renderers for company data
  const renderSerialNumberCell = (item, index) => (
    <div className="companies-table__sno-cell">
      <span className="companies-table__sno">{index + 1}</span>
    </div>
  );

  const renderCompanyCell = (item) => (
    <div className="companies-table__company-cell">
      <div className="companies-table__header-row">
        <strong className="companies-table__company-name">{item.company_name || item.name}</strong>
      </div>
      <span className="companies-table__company-email">{item.email}</span>
    </div>
  );

  const renderDiscountCell = (item) => {
    const discount = item.discount || 0;
    return (
      <div className="companies-table__discount-cell">
        <span className={`companies-table__discount-value ${discount > 0 ? 'has-discount' : 'no-discount'}`}>
          {discount > 0 ? `${discount}%` : 'No Discount'}
        </span>
      </div>
    );
  };

  const renderStatusCell = (item) => (
    <span className={`companies-table__status companies-table__status--${item.status?.toLowerCase() || 'active'}`}>
      {item.status || "Active"}
    </span>
  );

  const renderActionsCell = (item) => (
    <div className="companies-table__actions">
      <button 
        className="companies-table__action-btn companies-table__action-btn--edit"
        onClick={() => handleEdit(item.id)}
        title="Edit"
      >
        ✏️
      </button>
      <button 
        className="companies-table__action-btn companies-table__action-btn--delete"
        onClick={() => handleDelete(item.id, item.company_name || item.name)}
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );

  const columns = [
    { 
      key: "__item", 
      title: "S.No", 
      render: (value, item, index) => renderSerialNumberCell(item, index) 
    },
    { key: "__item", title: "Company", render: (value, item) => renderCompanyCell(item) },
    { key: "__item", title: "Discount", render: (value, item) => renderDiscountCell(item) },
    { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
  ];

  if (loading) {
    return (
      <div className="companies-wrapper">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`companies-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="companies-main-content">
            <div className="loading-spinner">Loading companies...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="companies-wrapper">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen}
      />
      
      <div className={`companies-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={handleToggleMobile}
        />

        <div className="companies-main-content">
          <div className="companies-content-section">
            <div className="companies-header-top">
              <div className="companies-title-section">
                <h1 className="companies-main-title">All Companies</h1>
                <p className="companies-subtitle">
                  Manage company relationships and track business performance
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center companies-search-add-container">
              <div className="companies-search-container">
                <div className="companies-search-box">
                  <input
                    type="text"
                    placeholder="Search companies ..."
                    className="companies-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="companies-search-icon" size={18} />
                </div>
              </div>

              <button
                className="companies-add-button companies-add-button--top"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="companies-add-icon" />
                Add Company
              </button>
            </div>

            <div className="companies-list-section">
              <div className="companies-section-header">
                <h2 className="companies-section-title">
                  Companies ({filteredCompaniesData.length})
                </h2>
                <p className="companies-section-description">
                  Track company performance and manage business relationships
                </p>
              </div>

              <div className="companies-table-container">
                <ReusableTable
                  data={filteredCompaniesData}
                  columns={columns}
                  initialEntriesPerPage={5}
                  searchPlaceholder="Search companies..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
      <AddCompanyModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCompany}
      />

      {/* Edit Company Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Company</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Discount (%)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              value={companyDiscount}
              onChange={(e) => setCompanyDiscount(e.target.value)}
            />
            <Form.Text className="text-muted">
              Enter 0 for no discount
            </Form.Text>
          </Form.Group>
          {editingCompany && (
            <div className="text-muted small">
              Company ID: {editingCompany.id}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateCompany} 
            disabled={isSaving || companyName.trim() === ""}
          >
            {isSaving ? 'Updating...' : 'Update Company'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CompanyTable;