import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch } from "react-icons/fa";
import "./AdminExpensiveRequest.css";

const AdminExpensiveRequest = ({ mode = "list" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: "",
    note: "",
    status: "",
  });

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseurl}/accounts`);
      const expenseCategories = response.data.filter(
        (item) => item.group && item.group.toLowerCase().includes("expenses")
      );

      // Extract only names
      const categoryNames = expenseCategories.map((item) => item.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ✅ Fetch All Expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/expensive`);
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Single Expense
  const fetchExpense = async (expenseId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/expensive/${expenseId}`);
      setCurrentExpense(response.data);
      setFormData({
        category: response.data.category || "",
        amount: response.data.amount || "",
        date: response.data.date
          ? new Date(response.data.date).toISOString().split("T")[0]
          : "",
        note: response.data.note || "",
        status: response.data.status || "",
      });
    } catch (error) {
      console.error("Error fetching expense:", error);
      alert("Failed to fetch expense");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial Data Load
  useEffect(() => {
    fetchCategories();
    if (id && (mode === "view" || mode === "edit")) {
      fetchExpense(id);
    } else {
      fetchExpenses();
    }
  }, [id, mode]);

  // ✅ Filter Search
  const filteredExpenses = expenses.filter(
    (item) =>
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.note?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.amount).includes(search) ||
      String(item.id).includes(search) ||
      (item.status && item.status.toLowerCase().includes(search.toLowerCase()))
  );

  // ✅ Handle Status Change in Table
  const handleStatusChange = async (expenseId, newStatus) => {
    try {
      // Optimistically update UI
      const updatedExpenses = expenses.map((exp) =>
        exp.id === expenseId ? { ...exp, status: newStatus } : exp
      );
      setExpenses(updatedExpenses);

      // Update in DB (using PUT or PATCH; adjust if your API uses PATCH)
      await axios.put(`${baseurl}/expensive/${expenseId}`, { status: newStatus });

      alert("Status updated successfully!");
      // Optionally refetch if needed, but optimistic update is fine
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
      // Revert on failure
      fetchExpenses();
    }
  };

// ✅ Table Columns
const columns = [
  { key: "id", title: "ID", width: "8%" },
  { key: "category", title: "Category", width: "20%" },
  {
  key: "staff_name",
  title: "Staff Name",
  width: "12%",
  render: (value, row) => {
    const item = row || value;
    return item?.staff_name ? item.staff_name : "-";
  },
},
,
  {
    key: "amount",
    title: "Amount",
    width: "12%",
    render: (value, row) => {
      const item = row || value;
      if (!item) return "-";
      return parseFloat(item.amount || 0).toFixed(2);
    },
  },
  {
    key: "date",
    title: "Date",
    width: "15%",
    render: (value, row) => {
      const item = row || value;
      if (!item || !item.date) return "-";
      return new Date(item.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  { key: "note", title: "Note", width: "25%" },
  {
    key: "status",
    title: "Status",
    width: "10%",
    render: (value, row) => {
      const item = row || value;
      if (!item) return null;

      return (
        <select
          className="AdminExpensiveRequest__status-select"
          value={item.status || "pending"}
          onChange={(e) => handleStatusChange(item.id, e.target.value)}
          style={{
            color: item.status === "approved" ? "green" : "red",
            fontWeight: "bold",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "4px 8px",
          }}
        >
          <option value="pending" style={{ color: "red", fontWeight: "bold" }}>
            Pending
          </option>
          <option value="approved" style={{ color: "green", fontWeight: "bold" }}>
            Approved
          </option>
        </select>
      );
    },
  },
  {
    key: "actions",
    title: "Actions",
    width: "10%",
    render: (value, row) => {
      const item = row || value;
      if (!item) return null;

      return (
        <div className="AdminExpensiveRequest__actions">
          <button
            className="AdminExpensiveRequest__btn AdminExpensiveRequest__btn--view"
            onClick={() => handleView(item.id)}
            title="View"
          >
            👁️
          </button>
          <button
            className="AdminExpensiveRequest__btn AdminExpensiveRequest__btn--edit"
            onClick={() => handleEdit(item.id)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="AdminExpensiveRequest__btn AdminExpensiveRequest__btn--delete"
            onClick={() => handleDelete(item.id, item.retailer_name || item.staff_name)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      );
    },
  },
];

  // ✅ Action Handlers
  const handleView = (id) => navigate(`/admin_expensive/view/${id}`);
  const handleEdit = (id) => navigate(`/admin_expensive/edit/${id}`);
  const handleCancel = () => navigate("/admin_expensive");

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`${baseurl}/expensive/${expenseId}`);
      setExpenses(expenses.filter((item) => item.id !== expenseId));
      alert("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  // ✅ Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (mode === "edit") {
        await axios.put(`${baseurl}/expensive/${id}`, formData);
        alert("Expense updated successfully!");
      } else {
        await axios.post(`${baseurl}/expensive`, formData);
        alert("Expense created successfully!");
      }
      navigate("/admin_expensive");
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense");
    }
  };

  // ✅ Render: View Mode
  const renderViewMode = () => (
    <div className="AdminExpensiveRequest__form-container">
      <div className="AdminExpensiveRequest__form-card">
        <div className="AdminExpensiveRequest__form-grid">
          <div className="AdminExpensiveRequest__form-group">
            <label>ID</label>
            <div className="AdminExpensiveRequest__view-value">
              {currentExpense?.id || "-"}
            </div>
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Category</label>
            <div className="AdminExpensiveRequest__view-value">
              {currentExpense?.category || "-"}
            </div>
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Staff Name</label>
            <div className="AdminExpensiveRequest__view-value">
              {currentExpense?.staff_name || "-"}
            </div>
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Amount</label>
            <div className="AdminExpensiveRequest__view-value">
              {parseFloat(currentExpense?.amount || 0).toFixed(2)}
            </div>
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Date</label>
            <div className="AdminExpensiveRequest__view-value">
              {currentExpense?.date
                ? new Date(currentExpense.date).toLocaleDateString()
                : "-"}
            </div>
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Status</label>
            <div className={`status-badge status-${currentExpense?.status}`}>
              {currentExpense?.status || ""}
            </div>
          </div>
        </div>

        <div className="AdminExpensiveRequest__form-group full-width">
          <label>Note</label>
          <div className="AdminExpensiveRequest__view-value textarea">
            {currentExpense?.note || "-"}
          </div>
        </div>

        <div className="AdminExpensiveRequest__form-actions">
          <button
            className="AdminExpensiveRequest__btn AdminExpensiveRequest__btn--cancel"
            onClick={handleCancel}
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Render: Edit Mode
  const renderEditMode = () => (
    <div className="AdminExpensiveRequest__form-container">
      <div className="AdminExpensiveRequest__form-card">
        <div className="AdminExpensiveRequest__form-grid">
          <div className="AdminExpensiveRequest__form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="AdminExpensiveRequest__input"
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="AdminExpensiveRequest__input"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="AdminExpensiveRequest__input"
            />
          </div>

          <div className="AdminExpensiveRequest__form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="AdminExpensiveRequest__input"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        <div className="AdminExpensiveRequest__form-group full-width">
          <label>Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            className="AdminExpensiveRequest__textarea"
            placeholder="Enter expense note..."
            rows={4}
          />
        </div>

        <div className="AdminExpensiveRequest__form-actions">
          <button
            className="AdminExpensiveRequest__btn AdminExpensiveRequest__btn--cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="AdminExpensiveRequest__btn AdminExpensiveRequest__btn--save"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Render: List Mode
  const renderListMode = () => (
    <>
      <div className="AdminExpensiveRequest__search-container">
        <div className="AdminExpensiveRequest__search-box">
          <FaSearch className="AdminExpensiveRequest__search-icon" size={18} />
          <input
            type="text"
            placeholder="Search expenses..."
            className="AdminExpensiveRequest__search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="AdminExpensiveRequest__table-container">
        <ReusableTable
          data={filteredExpenses}
          columns={columns}
          initialEntriesPerPage={10}
          showSearch={false}
          showEntriesSelector={true}
          showPagination={true}
        />
      </div>
    </>
  );

  // ✅ Loading Spinner
  if (loading) {
    return (
      <div className="AdminExpensiveRequest">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div
          className={`AdminExpensiveRequest__content ${
            isCollapsed ? "collapsed" : ""
          }`}
        >
          <AdminHeader />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Final Return
  return (
    <div className="AdminExpensiveRequest">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={`AdminExpensiveRequest__content ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <AdminHeader />
        {mode === "view" && renderViewMode()}
        {mode === "edit" && renderEditMode()}
        {mode === "list" && renderListMode()}
      </div>
    </div>
  );
};

export default AdminExpensiveRequest;