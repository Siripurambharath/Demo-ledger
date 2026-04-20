import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import AddUnitModal from "../Inventory/Sales_catalogue/AddUnitsModal";
import "./UnitsTable.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch, FaPlus } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

function UnitsTable() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [unitsData, setUnitsData] = useState([]);
  const [filteredUnitsData, setFilteredUnitsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitName, setUnitName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Normalize unit data
  const normalizeUnit = (unit) => {
    return {
      id: unit.id,
      unit_name: unit.name || unit.unit_name,
      symbol: unit.symbol || (unit.name ? unit.name.substring(0, 2).toLowerCase() : ""),
      unit_type: unit.unit_type || "General",
      base_unit: unit.base_unit || (unit.name ? unit.name.toLowerCase() : ""),
      conversion_factor: unit.conversion_factor || "1",
      description: unit.description || `Unit for ${unit.name || unit.unit_name}`,
      decimal_places: unit.decimal_places || "2",
      status: unit.status || "Active",
      created_date: unit.created_date || new Date().toISOString().split('T')[0],
      created_at: unit.created_at || unit.created_date || new Date().toISOString()
    };
  };

  // Sort units by created_at in descending order (newest first)
  const sortUnitsByCreatedAt = (units) => {
    return units.sort((a, b) => {
      const dateA = new Date(a.created_at || a.created_date || a.id);
      const dateB = new Date(b.created_at || b.created_date || b.id);
      return dateB - dateA; // Descending order (newest first)
    });
  };

  // Fetch units data from API
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/units`);
      const transformedData = response.data.map(unit => ({
        id: unit.id,
        unit_name: unit.name,
        symbol: unit.name.substring(0, 2).toLowerCase(),
        unit_type: "General",
        base_unit: unit.name.toLowerCase(),
        conversion_factor: "1",
        description: `Unit for ${unit.name}`,
        decimal_places: "2",
        status: "Active",
        created_date: new Date().toISOString().split('T')[0],
        created_at: unit.created_at || new Date().toISOString()
      }));
      
      // Sort units by created_at (newest first)
      const sortedData = sortUnitsByCreatedAt(transformedData);
      setUnitsData(sortedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch units:', err);
      setError('Failed to load units data');
      
      const staticUnitsData = [
        {
          id: 1,
          unit_name: "Kilogram",
          symbol: "kg",
          unit_type: "Weight",
          base_unit: "gram",
          conversion_factor: "1000",
          description: "Standard unit for measuring weight",
          decimal_places: "3",
          status: "Active",
          created_date: "2023-01-15",
          created_at: "2023-01-15T10:00:00Z"
        },
        {
          id: 2,
          unit_name: "Meter",
          symbol: "m",
          unit_type: "Length",
          base_unit: "meter",
          conversion_factor: "1",
          description: "Standard unit for measuring length",
          decimal_places: "2",
          status: "Active",
          created_date: "2023-01-10",
          created_at: "2023-01-10T09:30:00Z"
        }
      ];
      
      // Sort static data as well
      const sortedStaticData = sortUnitsByCreatedAt(staticUnitsData);
      setUnitsData(sortedStaticData);
    } finally {
      setLoading(false);
    }
  };

  // Filter units when search term changes
  useEffect(() => {
    if (unitsData.length > 0) {
      const filteredData = unitsData.filter(item =>
        (item.unit_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.symbol || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.unit_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id?.toString() || "").includes(searchTerm.toLowerCase())
      );
      setFilteredUnitsData(filteredData);
    }
  }, [unitsData, searchTerm]);

  // Handle delete unit
  const handleDelete = async (id, unitName) => {
    if (window.confirm(`Are you sure you want to delete ${unitName}?`)) {
      try {
        await axios.delete(`${baseurl}/units/${id}`);
        alert('Unit deleted successfully!');
        fetchUnits();
      } catch (err) {
        console.error('Failed to delete unit:', err);
        alert('Failed to delete unit');
      }
    }
  };

  // Handle edit unit
  const handleEdit = (id) => {
    const unitToEdit = unitsData.find(unit => unit.id === id);
    if (unitToEdit) {
      setEditingUnit(unitToEdit);
      setUnitName(unitToEdit.unit_name);
      setShowEditModal(true);
    }
  };

  // Handle update unit
  const handleUpdateUnit = async () => {
    if (unitName.trim() === "" || !editingUnit) return;
    
    setIsSaving(true);
    try {
      await axios.put(`${baseurl}/units/${editingUnit.id}`, {
        name: unitName
      });
      
      // Refetch units to get proper sorting with updated data
      await fetchUnits();
      
      setUnitName("");
      setShowEditModal(false);
      setEditingUnit(null);
      alert('Unit updated successfully!');
    } catch (error) {
      console.error("Error updating unit:", error);
      alert('Failed to update unit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add new unit from modal
  const handleAddUnit = (newUnit) => {
    fetchUnits(); // This will refetch and sort with newest first
    setShowAddModal(false);
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Custom renderers for units data
  const renderSerialNumberCell = (item, index) => (
    <div className="units-table__sno-cell">
      <span className="units-table__sno">{index + 1}</span>
    </div>
  );

  const renderUnitCell = (item) => (
    <div className="units-table__unit-cell">
      <strong className="units-table__unit-name">{item.unit_name}</strong>
    </div>
  );

  const renderStatusCell = (item) => (
    <span className={`units-table__status units-table__status--${item.status?.toLowerCase() || 'active'}`}>
      {item.status || "Active"}
    </span>
  );

  const renderActionsCell = (item) => (
    <div className="units-table__actions">
      <button 
        className="units-table__action-btn units-table__action-btn--edit"
        onClick={() => handleEdit(item.id)}
        title="Edit"
      >
        ✏️
      </button>
      <button 
        className="units-table__action-btn units-table__action-btn--delete"
        onClick={() => handleDelete(item.id, item.unit_name)}
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
    { key: "__item", title: "Unit", render: (value, item) => renderUnitCell(item) },
    { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
  ];

  if (loading) {
    return (
      <div className="units-wrapper">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`units-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="units-main-content">
            <div className="loading-spinner">Loading units...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="units-wrapper">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen}
      />
      
      <div className={`units-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={handleToggleMobile}
        />

        <div className="units-main-content">
          <div className="units-content-section">
            <div className="units-header-top">
              <div className="units-title-section">
                <h1 className="units-main-title">All Units</h1>
                <p className="units-subtitle">
                  Manage measurement units and conversion factors
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center units-search-add-container">
              <div className="units-search-container">
                <div className="units-search-box">
                  <input
                    type="text"
                    placeholder="Search units ..."
                    className="units-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="units-search-icon" size={18} />
                </div>
              </div>

              <button
                className="units-add-button units-add-button--top"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="units-add-icon" />
                Add Unit
              </button>
            </div>

            <div className="units-list-section">
              <div className="units-section-header">
                <h2 className="units-section-title">
                  Units ({filteredUnitsData.length})
                </h2>
                <p className="units-section-description">
                  Manage and configure measurement units for your inventory
                </p>
              </div>

              <div className="units-table-container">
                <ReusableTable
                  data={filteredUnitsData}
                  columns={columns}
                  initialEntriesPerPage={5}
                  searchPlaceholder="Search units..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Unit Modal */}
      <AddUnitModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddUnit}
      />

      {/* Edit Unit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Unit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Unit Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter unit name"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
            />
          </Form.Group>
          {editingUnit && (
            <div className="text-muted small">
              Unit ID: {editingUnit.id}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUnit} 
            disabled={isSaving || unitName.trim() === ""}
          >
            {isSaving ? 'Updating...' : 'Update Unit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UnitsTable;