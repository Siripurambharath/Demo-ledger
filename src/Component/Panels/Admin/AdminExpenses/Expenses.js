import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Expenses.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { baseurl } from "../../../BaseURL/BaseURL"; 

function Expenses() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expensesData, setExpensesData] = useState([]); // Filtered expenses data
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch expenses from API

    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${baseurl}/accounts`);
        console.log("Data=", response.data);

        // Filter data where group includes 'expenses' (case-insensitive)
        const filteredData = response.data.filter(
          (item) => item.group && item.group.toLowerCase().includes("expenses")
        );

        console.log("filteredData=", filteredData);

        // Add serial numbers for display
        const formattedData = filteredData.map((item, index) => ({
          ...item,
          serialNo: index + 1,
        }));

        setExpensesData(formattedData);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchExpenses();
  }, []);


  // Table columns
const columns = [
  { key: "serialNo", title: "S No" },
  { key: "name", title: "Name" },
  { key: "group", title: "Group" },
  { key: "opening_balance", title: "Opening Balance" },
 {
  key: "actions",
  title: "Actions",
  render: (value, row) => {
    if (!row) return null; // safeguard
    return (
      <div className="table-actions">
        <FaEdit
          className="edit-icon"
          style={{ cursor: "pointer", marginRight: "10px", color: 'blue' }}
          onClick={() => handleEdit(row)}
        />
        <FaTrash
          className="delete-icon"
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => handleDelete(row.id)}
        />
      </div>
    );
  },
}
,
];


  // Add Expenses button handler
  const handleAddRetailerClick = () => {
    navigate("/expenses/add");
  };

  const handleEdit = (expense) => {
  // Navigate to AddExpenses page with expense data
  navigate("/expenses/add", { state: { expense } });
};

const handleDelete = async (expenseId) => {
  if (window.confirm("Are you sure you want to delete this expense?")) {
    try {
      await axios.delete(`${baseurl}/accounts/${expenseId}`);
      // Refresh the expenses list after delete
      setExpensesData(expensesData.filter((item) => item.id !== expenseId));
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense.");
    }
  }
};

  return (
    <div className="expenses-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`expenses-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <div className="expenses-main-content">
          <AdminHeader isCollapsed={isCollapsed} />

          <div className="expenses-content-section">
            {/* Header Section */}
            <div className="expenses-header-top">
              <div className="expenses-title-section">
                <h1 className="expenses-main-title">All Expenses</h1>
                <p className="expenses-subtitle">
                  Manage and track expense accounts
                </p>
              </div>
              <button
                className="expenses-add-button expenses-add-button--top"
                onClick={handleAddRetailerClick}
              >
                <span className="expenses-add-icon">+</span>
                Add Expenses
              </button>
            </div>

            {/* Search Section */}
            <div className="expenses-search-container">
              <div className="expenses-search-box">
                <span className="expenses-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="expenses-search-input"
                />
              </div>
            </div>

            {/* Table Section */}
            <div className="expenses-list-section">
              <div className="expenses-section-header">
                <h2 className="expenses-section-title">
                  Expenses ({expensesData.length})
                </h2>
                <p className="expenses-section-description">
                  Showing all expense accounts
                </p>
              </div>

              <div className="expenses-table-container">
                {loading ? (
                  <p>Loading expenses...</p>
                ) : expensesData.length === 0 ? (
                  <p>No expenses found.</p>
                ) : (
                  <ReusableTable
                    data={expensesData}
                    columns={columns}
                    initialEntriesPerPage={5}
                    searchPlaceholder="Search expenses..."
                    showSearch={false}
                    showEntriesSelector={true}
                    showPagination={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expenses;
