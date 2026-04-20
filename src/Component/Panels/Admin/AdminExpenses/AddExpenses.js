import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import "./AddExpenses.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useLocation } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";

function AddExpenses() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accountGroups, setAccountGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const expenseToEdit = location.state?.expense;

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        name: expenseToEdit.name || "",
        group: expenseToEdit.account_group_id || "",
        opening_balance: expenseToEdit.opening_balance || "",
      });
    }
  }, [expenseToEdit]);

  const [formData, setFormData] = useState({
    name: "",
    group: "",
    opening_balance: "",
  });

  // Fetch account groups
  useEffect(() => {
    const fetchAccountGroups = async () => {
      try {
        const response = await axios.get(`${baseurl}/accountgroup`);

        // Filter groups that contain 'Expenses' in the name
        const filteredGroups = response.data.filter(group =>
          group.AccountsGroupName.toLowerCase().includes("expenses")
        );

        setAccountGroups(filteredGroups);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching account groups:", error);
        setLoading(false);
      }
    };

    fetchAccountGroups();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const selectedGroup = accountGroups.find(
        (grp) => grp.accountgroup_id === parseInt(formData.group)
      );

      if (!selectedGroup) {
        setErrorMessage("Invalid group selection");
        return;
      }

      const payload = {
        name: formData.name,
        opening_balance: formData.opening_balance,
        account_group_id: selectedGroup.accountgroup_id,
        group: selectedGroup.AccountsGroupName,
      };

      if (expenseToEdit) {
        // Update existing expense
        await axios.put(`${baseurl}/accounts/${expenseToEdit.id}`, payload);
        setSuccessMessage("Expense updated successfully!");
      } else {
        // Add new expense
        await axios.post(`${baseurl}/accounts`, payload);
        setSuccessMessage("Expense added successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        group: "",
        opening_balance: "",
      });
      navigate(-1)

    } catch (error) {
      console.error("Error saving expense:", error);
      setErrorMessage("Failed to save expense. Please try again.");
    }
  };


  return (
    <div className="expenses-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className={`expenses-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <div className="expenses-main-content">
          <AdminHeader isCollapsed={isCollapsed} />

          <div className="container mt-4">
            <Card className="shadow">
              <Card.Header>
                <h4 className="mb-0">Add Expense</h4>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    {/* Error and Success Messages */}
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    {/* Name Field */}
                    <Form.Group className="mb-3" controlId="formName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter expense name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    {/* Group Field */}
                    <Form.Group className="mb-3" controlId="formGroup">
                      <Form.Label>Group</Form.Label>
                      <Form.Select
                        name="group"
                        value={formData.group}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Group</option>
                        {accountGroups.map((group) => (
                          <option
                            key={group.accountgroup_id}
                            value={group.accountgroup_id}
                          >
                            {group.AccountsGroupName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Opening Balance Field */}
                    <Form.Group className="mb-3" controlId="formOpeningBalance">
                      <Form.Label>Opening Balance</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter opening balance"
                        name="opening_balance"
                        value={formData.opening_balance}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    {/* Submit Button */}
                    <div className="text-end">
                      <Button
                        variant="secondary"
                        className="me-2"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button variant="primary" type="submit">
                        Save
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddExpenses;
