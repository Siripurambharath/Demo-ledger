import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./AddMarketing.css";

function AddMarketing() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    offerType: "",
    description: "",
    discountType: "",
    minimumAmount: "",
    distributorValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    // Navigate back to marketing page after submission
    navigate("/marketing");
  };

  const handleCancel = () => {
    navigate("/marketing");
  };

  return (
    <div>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      {/* <AdminHeader isCollapsed={isCollapsed} /> */}
      <div className={`add-marketing-content ${isCollapsed ? "collapsed" : ""}`}>
                      <AdminHeader isCollapsed={isCollapsed} />

        <div className="add-marketing-container">
          <div className="add-marketing-header">
            <h1>Create New Offer</h1>
            <p>Set up a new marketing offer for retailers</p>
          </div>

          <form className="marketing-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Offer Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Offer Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  placeholder="Enter offer title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Offer Type */}
              <div className="form-group">
                <label htmlFor="offerType" className="form-label">
                  Offer Type *
                </label>
                <select
                  id="offerType"
                  name="offerType"
                  className="form-select"
                  value={formData.offerType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="discount">Discount</option>
                  <option value="flash-sale">Flash Sale</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="seasonal">Seasonal Offer</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  placeholder="Enter offer description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Discount Type */}
              <div className="form-group">
                <label htmlFor="discountType" className="form-label">
                  Discount Type *
                </label>
                <select
                  id="discountType"
                  name="discountType"
                  className="form-select"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select discount type</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="bogo">Buy X Get Y</option>
                </select>
              </div>

              {/* Minimum Amount */}
              <div className="form-group">
                <label htmlFor="minimumAmount" className="form-label">
                  Minimum Amount (₹)
                </label>
                <input
                  type="number"
                  id="minimumAmount"
                  name="minimumAmount"
                  className="form-input"
                  placeholder="Minimum purchase amount"
                  value={formData.minimumAmount}
                  onChange={handleInputChange}
                />
              </div>

              {/* Distributor Value */}
              <div className="form-group">
                <label htmlFor="distributorValue" className="form-label">
                  Distributor Value *
                </label>
                <input
                  type="number"
                  id="distributorValue"
                  name="distributorValue"
                  className="form-input"
                  placeholder="Enter value"
                  value={formData.distributorValue}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Max Discount */}
              <div className="form-group">
                <label htmlFor="maxDiscount" className="form-label">
                  Max Discount (₹)
                </label>
                <input
                  type="number"
                  id="maxDiscount"
                  name="maxDiscount"
                  className="form-input"
                  placeholder="Maximum discount limit"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                />
              </div>

              {/* Start Date */}
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* End Date */}
              <div className="form-group">
                <label htmlFor="endDate" className="form-label">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Usage Limit */}
              <div className="form-group full-width">
                <label htmlFor="usageLimit" className="form-label">
                  Usage Limit
                </label>
                <input
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  className="form-input"
                  placeholder="Maximum number of times this offer can be used"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Offer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMarketing;