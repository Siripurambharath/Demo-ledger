import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import "./LogVisit.css";

function LogVisit() {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState([]);
  const [loadingRetailers, setLoadingRetailers] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user from localStorage
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  const [formData, setFormData] = useState({
    retailer_id: "",
    retailer_name: "",
    staff_id: userId,      // only from localStorage
    staff_name: userName,  // only from localStorage
    visitType: "",
    visitOutcome: "",
    salesAmount: "",
    transactionType: "",
    description: "",
  });

  // Fetch retailers (only for dropdown)
  useEffect(() => {
    setLoadingRetailers(true);
    setError(null);

    fetch(`${baseurl}/api/retailers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          // Only store retailer_id and retailer_name
          const filtered = result.data.map((r) => ({
            retailer_id: r.retailer_id,
            retailer_name: r.retailer_name,
          }));
          setRetailers(filtered);
        } else {
          throw new Error(result.error || "Failed to fetch retailers");
        }
      })
      .catch((err) => {
        console.error("Error fetching retailers:", err);
        setError("Failed to load retailers. Please check your connection or try again.");
      })
      .finally(() => setLoadingRetailers(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "retailer_id") {
      const selected = retailers.find((r) => String(r.retailer_id) === String(value));
      setFormData((prev) => ({
        ...prev,
        retailer_id: value,
        retailer_name: selected ? selected.retailer_name : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      retailer_id: formData.retailer_id,
      retailer_name: formData.retailer_name,
      staff_id: userId,     // from localStorage only
      staff_name: userName, // from localStorage only
      visit_type: formData.visitType,
      visit_outcome: formData.visitOutcome,
      sales_amount: formData.salesAmount
        ? Number(String(formData.salesAmount).replace(/[^0-9.-]+/g, ""))
        : null,
      transaction_type: formData.transactionType || null,
      description: formData.description || null,
    };

    try {
      const res = await fetch(`${baseurl}/api/salesvisits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        console.log("Visit logged:", data.data);
        navigate("/staff/sales-visits");
      } else {
        console.error("Failed to save visit:", data);
        alert(`Failed to save visit: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving visit:", err);
      alert("Server error while saving visit");
    }
  };

  const handleCancel = () => {
    navigate("/staff/sales-visits");
  };

  return (
    <StaffMobileLayout>
      <div className="log-visit-mobile">
        <header className="form-header">
          <h1>Log Sales Visit</h1>
          <p>Record details of your retailer visit</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="visit-form">
          {/* Retailer Dropdown */}
          <div className="form-group">
            <label htmlFor="retailer_id">Retailer Name *</label>
            <select
              id="retailer_id"
              name="retailer_id"
              value={formData.retailer_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select retailer</option>
              {loadingRetailers ? (
                <option value="" disabled>Loading...</option>
              ) : retailers.length === 0 ? (
                <option value="" disabled>No retailers available</option>
              ) : (
                retailers.map((r) => (
                  <option key={r.retailer_id} value={r.retailer_id}>
                    {r.retailer_name || "Unnamed Retailer"}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Visit Type */}
          <div className="form-group">
            <label htmlFor="visitType">Visit Type *</label>
            <select
              id="visitType"
              name="visitType"
              value={formData.visitType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select visit type</option>
              <option value="Routine">Routine</option>
              <option value="Follow Up">Follow Up</option>
              <option value="New Retailer">New Retailer</option>
              <option value="Issue Resolution">Issue Resolution</option>
            </select>
          </div>

          {/* Visit Outcome */}
          <div className="form-group">
            <label htmlFor="visitOutcome">Visit Outcome *</label>
            <select
              id="visitOutcome"
              name="visitOutcome"
              value={formData.visitOutcome}
              onChange={handleInputChange}
              required
            >
              <option value="">Select outcome</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          {/* Sales Amount */}
          <div className="form-group">
            <label htmlFor="salesAmount">Sales Amount</label>
            <input
              type="text"
              id="salesAmount"
              name="salesAmount"
              value={formData.salesAmount}
              onChange={handleInputChange}
              placeholder="Enter sales amount (e.g., 45000)"
            />
          </div>

          {/* Transaction Type */}
          <div className="form-group">
            <label htmlFor="transactionType">Transaction Type</label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleInputChange}
            >
              <option value="">Select transaction type</option>
              <option value="Paikka">Paikka</option>
              <option value="Kaccha">Kaccha</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="description">Notes</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional notes about the visit (optional)"
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="form-buttons">
             
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
             <button type="submit" className="submit-btn">
            Submit
            </button>
          
          </div>
        </form>
      </div>
    </StaffMobileLayout>
  );
}

export default LogVisit;
