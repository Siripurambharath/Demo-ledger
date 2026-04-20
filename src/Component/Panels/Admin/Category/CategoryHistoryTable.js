import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Badge } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaHistory, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";

function CategoryDiscountHistory({ categoryId, categoryName }) {
  const [showModal, setShowModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDiscountHistory = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/categories/${categoryId}/discount-history`);
      setHistoryData(response.data);
    } catch (error) {
      console.error("Error fetching discount history:", error);
      alert('Failed to load discount history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal && categoryId) {
      fetchDiscountHistory();
    }
  }, [showModal, categoryId]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setHistoryData([]);
  };

  const handleOpenAddModal = () => {
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenEditModal = (entry) => {
    setEditingEntry(entry);
    setDiscountValue(entry.discount_value);
    setStartDate(entry.start_date);
    setEndDate(entry.end_date);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingEntry(null);
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
  };

  const handleAddDiscountHistory = async () => {
    if (!discountValue || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }

    setIsSaving(true);
    try {
      await axios.post(`${baseurl}/categories/${categoryId}/discount-history`, {
        discount_value: parseFloat(discountValue),
        start_date: startDate,
        end_date: endDate
      });

      await fetchDiscountHistory();
      handleCloseAddModal();
      alert('Discount history added successfully!');
    } catch (error) {
      console.error("Error adding discount history:", error);
      alert('Failed to add discount history');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDiscountHistory = async () => {
    if (!discountValue || !startDate || !endDate || !editingEntry) {
      alert("Please fill all fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(`${baseurl}/categories/${categoryId}/discount-history/${editingEntry.id}`, {
        discount_value: parseFloat(discountValue),
        start_date: startDate,
        end_date: endDate
      });

      await fetchDiscountHistory();
      handleCloseEditModal();
      alert('Discount history updated successfully!');
    } catch (error) {
      console.error("Error updating discount history:", error);
      alert('Failed to update discount history');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDiscountHistory = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this discount history entry?")) {
      try {
        await axios.delete(`${baseurl}/categories/${categoryId}/discount-history/${entryId}`);
        await fetchDiscountHistory();
        alert('Discount history entry deleted successfully!');
      } catch (error) {
        console.error("Error deleting discount history:", error);
        alert('Failed to delete discount history entry');
      }
    }
  };

  const getStatusBadge = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) {
      return <Badge bg="secondary">Upcoming</Badge>;
    } else if (today > end) {
      return <Badge bg="danger">Expired</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Button
        variant="outline-info"
        size="sm"
        onClick={handleOpenModal}
        title="View Discount History"
        className="me-2"
      >
        <FaHistory /> History
      </Button>

      {/* Main History Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaHistory className="me-2" />
            Discount History - {categoryName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>Discount History Records</h6>
            <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
              <FaCalendarAlt className="me-1" />
              Add Discount Period
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-3">Loading history...</div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No discount history found for this category.
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <strong>{entry.discount_value}%</strong>
                      </td>
                      <td>{formatDate(entry.start_date)}</td>
                      <td>{formatDate(entry.end_date)}</td>
                      <td>{getStatusBadge(entry.start_date, entry.end_date)}</td>
                      <td>{formatDate(entry.created_at)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleOpenEditModal(entry)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteDiscountHistory(entry.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Discount History Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Discount Period</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Discount Value (%)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddDiscountHistory}
            disabled={isSaving || !discountValue || !startDate || !endDate}
          >
            {isSaving ? 'Saving...' : 'Save Discount Period'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Discount History Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Discount Period</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Discount Value (%)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateDiscountHistory}
            disabled={isSaving || !discountValue || !startDate || !endDate}
          >
            {isSaving ? 'Updating...' : 'Update Discount Period'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CategoryDiscountHistory;