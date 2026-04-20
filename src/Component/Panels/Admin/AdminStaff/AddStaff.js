import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./AddStaff.css";
import { baseurl } from "../../../BaseURL/BaseURL";

const TabNavigation = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="admin-staff-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`admin-staff-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const FormSection = ({
  id,
  activeTab,
  title,
  children,
  onBack,
  onNext,
  onSubmit,
  isLast = false,
  onCancel,
  submitLabel = "Submit",
  nextLabel = "Next",
}) => {
  if (id !== activeTab) return null;
  return (
    <div className={`admin-staff-form-card ${id === activeTab ? "active-section" : ""}`}>
      <h3 className="admin-staff-section-title">{title}</h3>
      <div className="admin-staff-form-section">{children}</div>
      <div className="admin-staff-form-actions">
        <div className="admin-staff-left-actions">
          <button type="button" className="admin-staff-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="admin-staff-right-actions">
          {onBack && (
            <button type="button" className="admin-staff-back-btn" onClick={onBack}>
              Back
            </button>
          )}
          {onNext && !isLast && (
            <button type="button" className="admin-staff-next-btn" onClick={onNext}>
              {nextLabel}
            </button>
          )}
          {onSubmit && isLast && (
            <button type="submit" className="admin-staff-submit-btn">
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function AddStaff() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [enableAsRetailer, setEnableAsRetailer] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    full_name: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    role: "staff",
    designation: "",
    department: "",
    joiningDate: "",
    incentivePercent: "",
    salary: "",
    status: "Active",
    password: "",

    // Bank fields
    accountNumber: "",
    accountName: "",
    bankName: "",
    ifscCode: "",
    accountType: "",
    branchName: "",
    upiId: "",

    // Tax / doc fields
    panNumber: "",
    tanNumber: "",
    tdsSlabRate: "",
    currency: "INR",
    termsOfPayment: "",
    reverseCharge: "No",
    exportSez: "Not Applicable",
    aadhaarNumber: "",
    bloodGroup: "",
    emergencyContact: "",

    // Retailer fields
    is_dual_account: 0,
    entity_type: "",
    gstin: "",
    business_name: "",
    display_name: "",
    gst_registered_name: "",
    additional_business_name: "",
    fax: "",
    discount: 0,
    Target: 100000,
    credit_limit: "",
    opening_balance: 0,
    opening_balance_type: "",

    // Shipping
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_pin_code: "",
    shipping_state: "",
    shipping_country: "India",
    shipping_branch_name: "",
    shipping_gstin: "",

    // Billing
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_pin_code: "",
    billing_state: "",
    billing_country: "India",
    billing_branch_name: "",
    billing_gstin: "",
    sameAsShipping: false,
  });

  const getTabs = () => {
    const baseTabs = [
      { id: "basic", label: "Basic Details" },
      { id: "job", label: "Job Details" },
      { id: "bank", label: "Bank Details" },
      { id: "documents", label: "Documents" },
    ];
    if (enableAsRetailer) {
      baseTabs.push(
        { id: "shipping", label: "Shipping Address" },
        { id: "billing", label: "Billing Address" }
      );
    }
    return baseTabs;
  };

  const tabs = getTabs();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchStaffData();
    }
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setIsFetching(true);
      const res = await fetch(`${baseurl}/api/staff/${id}`);
      const staffData = await res.json();
      const data = Array.isArray(staffData) ? staffData[0] : staffData;

      setFormData({
        full_name:                data.name || data.full_name || "",
        mobileNumber:             data.mobile_number || "",
        alternateNumber:          data.alternate_number || "",
        email:                    data.email || "",
        dateOfBirth:              data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
        joiningDate:              data.joining_date ? data.joining_date.split("T")[0] : "",
        gender:                   data.gender || "",
        address:                  data.address || "",
        role:                     data.role || "staff",
        designation:              data.designation || "",
        department:               data.department || "",
        incentivePercent:         data.incentive_percent || "",
        salary:                   data.salary || "",
        status:                   data.status || "Active",
        password:                 data.password || "",
        accountNumber:            data.account_number || "",
        accountName:              data.account_name || "",
        bankName:                 data.bank_name || "",
        ifscCode:                 data.ifsc_code || "",
        accountType:              data.account_type || "",
        branchName:               data.branch_name || "",
        upiId:                    data.upi_id || "",
        panNumber:                data.pan || "",
        tanNumber:                data.tan || "",
        tdsSlabRate:              data.tds_slab_rate || "",
        currency:                 data.currency || "INR",
        termsOfPayment:           data.terms_of_payment || "",
        reverseCharge:            data.reverse_charge || "No",
        exportSez:                data.export_sez || "Not Applicable",
        aadhaarNumber:            data.aadhaar_number || "",
        bloodGroup:               data.blood_group || "",
        emergencyContact:         data.emergency_contact || "",
        is_dual_account:          data.is_dual_account === 1 ? 1 : 0,
        entity_type:              data.entity_type || "",
        gstin:                    data.gstin || "",
        business_name:            data.business_name || "",
        display_name:             data.display_name || "",
        gst_registered_name:      data.gst_registered_name || "",
        additional_business_name: data.additional_business_name || "",
        fax:                      data.fax || "",
        discount:                 data.discount || 0,
        Target:                   data.target || data.Target || 100000,
        credit_limit:             data.credit_limit || "",
        opening_balance:          data.opening_balance || 0,
        opening_balance_type:     data.opening_balance_type || "",
        shipping_address_line1:   data.shipping_address_line1 || "",
        shipping_address_line2:   data.shipping_address_line2 || "",
        shipping_city:            data.shipping_city || "",
        shipping_pin_code:        data.shipping_pin_code || "",
        shipping_state:           data.shipping_state || "",
        shipping_country:         data.shipping_country || "India",
        shipping_branch_name:     data.shipping_branch_name || "",
        shipping_gstin:           data.shipping_gstin || "",
        billing_address_line1:    data.billing_address_line1 || "",
        billing_address_line2:    data.billing_address_line2 || "",
        billing_city:             data.billing_city || "",
        billing_pin_code:         data.billing_pin_code || "",
        billing_state:            data.billing_state || "",
        billing_country:          data.billing_country || "India",
        billing_branch_name:      data.billing_branch_name || "",
        billing_gstin:            data.billing_gstin || "",
        sameAsShipping:           false,
      });

      setEnableAsRetailer(data.is_dual_account === 1);


    } catch (err) {
      setError("Failed to load staff data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processed = value;

    if (["mobileNumber", "alternateNumber", "emergencyContact"].includes(name)) {
      processed = value.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "ifscCode") {
      processed = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    }
    if (name === "panNumber") {
      processed = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    }
    if (name === "tanNumber") {
      processed = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    }
    if (name === "accountNumber") {
      processed = value.replace(/\D/g, "").slice(0, 18);
    }
    if (["shipping_pin_code", "billing_pin_code"].includes(name)) {
      processed = value.replace(/\D/g, "").slice(0, 6);
    }
    if (name === "discount") processed = parseFloat(value) || 0;
    if (["Target", "credit_limit", "opening_balance"].includes(name)) {
      processed = value === "" ? 0 : parseFloat(value) || 0;
    }

    setFormData((prev) => ({ ...prev, [name]: processed }));
  };

  const handleRetailerToggle = (e) => {
    const checked = e.target.checked;
    setEnableAsRetailer(checked);
    setFormData((prev) => ({ ...prev, is_dual_account: checked ? 1 : 0 }));
  };

  const handleSameAsShipping = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsShipping: checked,
      ...(checked && {
        billing_address_line1: prev.shipping_address_line1,
        billing_address_line2: prev.shipping_address_line2,
        billing_city:          prev.shipping_city,
        billing_pin_code:      prev.shipping_pin_code,
        billing_state:         prev.shipping_state,
        billing_country:       prev.shipping_country,
        billing_branch_name:   prev.shipping_branch_name,
        billing_gstin:         prev.shipping_gstin,
      }),
    }));
  };

  const handleTabClick = (tabId) => setActiveTab(tabId);

  const handleNext = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
  };

  const validateRequiredFields = () => {
  const errors = [];
  
  // Basic Details Validation
  if (!formData.full_name.trim()) {
    errors.push("Full Name is required");
  }
  if (!formData.mobileNumber.trim()) {
    errors.push("Mobile Number is required");
  } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
    errors.push("Mobile Number must be 10 digits");
  }
  if (!formData.email.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Invalid email format");
  }
  
  // If enabled as retailer, validate retailer fields
  if (enableAsRetailer) {
    if (!formData.entity_type) {
      errors.push("Entity Type is required when enabling as retailer");
    }
    if (!formData.business_name) {
      errors.push("Business Name is required when enabling as retailer");
    }
    if (!formData.display_name) {
      errors.push("Display Name is required when enabling as retailer");
    }
    if (!formData.opening_balance_type) {
      errors.push("Opening Balance Type is required when enabling as retailer");
    }
  }
  
  return errors;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
      const validationErrors = validateRequiredFields();
  if (validationErrors.length > 0) {
    setError(validationErrors.join("\n"));
    return;
  }
    setIsLoading(true);
    setError("");

    try {
      const url = isEditMode ? `${baseurl}/api/staff/${id}` : `${baseurl}/api/staff`;
      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEditMode ? "Staff updated successfully!" : "Staff added successfully!");
        navigate("/staff");
      } else {
        const errData = await response.json();
        setError(errData.error || "Failed to save staff.");
      }
    } catch (err) {
      setError("Failed to save staff.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate("/staff");

  return (
    <div className="admin-staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`admin-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="admin-staff-container">
          <h1 className="admin-staff-page-title">
            {isEditMode ? "Edit Staff" : "Add New Staff"}
          </h1>

          {error && <div className="admin-staff-error-message">{error}</div>}

          {isFetching ? (
            <div className="admin-staff-loading-container">
              <div className="admin-staff-loading-spinner"></div>
              <p>Loading staff data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="admin-staff-form">
              <TabNavigation tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />

              {/* BASIC DETAILS */}
              <FormSection
                id="basic"
                activeTab={activeTab}
                title="Basic Details"
                onBack={null}
                onNext={handleNext}
                nextLabel="Job Details"
                onCancel={handleCancel}
              >
                <div className="admin-staff-form-grid">
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Full Name *</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="admin-staff-form-input"   required />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Mobile Number *</label>
                    <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="admin-staff-form-input"    required  // ← ADD THIS
  pattern="[0-9]{10}"  // ← ADD THIS
  title="10-digit mobile number" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Alternate Number</label>
                    <input type="text" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="admin-staff-form-input" required   />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="admin-staff-form-input">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Address</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Password</label>
                    <div className="admin-staff-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="admin-staff-form-input"
                        autoComplete="new-password"
                        placeholder="Automatically Generated"
                        readOnly   
                      />
                      {formData.password && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="admin-staff-password-toggle">
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Retailer Toggle */}
                  <div className="admin-staff-form-field admin-staff-full-width">
                    <label className="admin-staff-checkbox-label">
                      <input type="checkbox" checked={enableAsRetailer} onChange={handleRetailerToggle} className="admin-staff-checkbox" />
                      <span className="admin-staff-checkbox-text">Enable as Retailer (Create dual account)</span>
                    </label>
                  </div>

                  {enableAsRetailer && (
                    <>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Entity Type</label>
                        <select name="entity_type" value={formData.entity_type} onChange={handleInputChange} className="admin-staff-form-input">
                          <option value="">Select</option>
                          <option value="Individual">Individual</option>
                          <option value="Company">Company</option>
                          <option value="Partnership">Partnership</option>
                        </select>
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">GSTIN</label>
                        <input type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} maxLength={15} className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Business Name</label>
                        <input type="text" name="business_name" value={formData.business_name} onChange={handleInputChange} className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Display Name</label>
                        <input type="text" name="display_name" value={formData.display_name} onChange={handleInputChange} className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">GST Registered Name</label>
                        <input type="text" name="gst_registered_name" value={formData.gst_registered_name} onChange={handleInputChange} className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Additional Business Name</label>
                        <input type="text" name="additional_business_name" value={formData.additional_business_name} onChange={handleInputChange} className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Fax</label>
                        <input type="text" name="fax" value={formData.fax} onChange={handleInputChange} className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Discount (%)</label>
                        <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" max="100" step="0.1" className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Target (₹)</label>
                        <input type="number" name="Target" value={formData.Target} onChange={handleInputChange} min="0" className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Credit Limit (₹)</label>
                        <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleInputChange} min="0" className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Opening Balance</label>
                        <div className="admin-staff-opening-balance-group">
                          <input type="number" name="opening_balance" value={formData.opening_balance || ""} onChange={handleInputChange} min={0} step={1000} placeholder="Amount" className="admin-staff-form-input" />
                          <select name="opening_balance_type" value={formData.opening_balance_type || ""} onChange={handleInputChange} className="admin-staff-form-input">
                            <option value="">Select</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FormSection>

              {/* JOB DETAILS */}
              <FormSection id="job" activeTab={activeTab} title="Job Details" onBack={handleBack} onNext={handleNext} nextLabel="Bank Details" onCancel={handleCancel}>
                <div className="admin-staff-form-grid">
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Designation</label><input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Department</label><input type="text" name="department" value={formData.department} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Joining Date</label><input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Incentive %</label><input type="number" name="incentivePercent" value={formData.incentivePercent} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Salary</label><input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                </div>
              </FormSection>

              {/* BANK DETAILS */}
              <FormSection
                id="bank"
                activeTab={activeTab}
                title="Bank Details"
                onBack={handleBack}
                onNext={handleNext}
                nextLabel="Documents"
                onCancel={handleCancel}
              >
                <div className="admin-staff-form-grid">

                  {/* Account Information — always visible */}
                  <div className="admin-staff-full-width">
                    <h4 className="admin-staff-subsection-title">Account Information</h4>
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber || ""} onChange={handleInputChange} maxLength={18} className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Account Name</label>
                    <input type="text" name="accountName" value={formData.accountName || ""} onChange={handleInputChange} className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Bank Name</label>
                    <select name="bankName" value={formData.bankName || ""} onChange={handleInputChange} className="admin-staff-form-input">
                      <option value="">Select Bank</option>
                      <option value="SBI">SBI</option>
                      <option value="HDFC">HDFC</option>
                      <option value="ICICI">ICICI</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Yes Bank">Yes Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Union Bank">Union Bank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode || ""} onChange={handleInputChange} maxLength={11} placeholder="e.g., SBIN0001234" className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Account Type</label>
                    <select name="accountType" value={formData.accountType || ""} onChange={handleInputChange} className="admin-staff-form-input">
                      <option value="">Select Account Type</option>
                      <option value="Savings Account">Savings Account</option>
                      <option value="Current Account">Current Account</option>
                      <option value="Salary Account">Salary Account</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                    </select>
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Branch Name</label>
                    <input type="text" name="branchName" value={formData.branchName || ""} onChange={handleInputChange} className="admin-staff-form-input" />
                  </div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">UPI ID</label>
                    <input type="text" name="upiId" value={formData.upiId || ""} onChange={handleInputChange} placeholder="e.g., username@okhdfcbank" className="admin-staff-form-input" />
                  </div>

               
                  {/* ✅ Tax Information Fields — only shown when checkbox is checked */}
{enableAsRetailer && (
                    <>
                      <div className="admin-staff-full-width">
                        <h4 className="admin-staff-subsection-title">Tax Information</h4>
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">PAN Number</label>
                        <input type="text" name="panNumber" value={formData.panNumber || ""} onChange={handleInputChange} maxLength={10} placeholder="e.g., ABCDE1234F" className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">TAN</label>
                        <input type="text" name="tanNumber" value={formData.tanNumber || ""} onChange={handleInputChange} maxLength={10} placeholder="e.g., ABCD12345E" className="admin-staff-form-input" />
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">TCS/TDS Slab Rate</label>
                        <select name="tdsSlabRate" value={formData.tdsSlabRate || ""} onChange={handleInputChange} className="admin-staff-form-input">
                          <option value="">Select TCS Slab Rate</option>
                          <option value="Not Applicable">TCS Not Applicable</option>
                          <option value="0.1%">0.1%</option>
                          <option value="1%">1%</option>
                          <option value="5%">5%</option>
                        </select>
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Currency</label>
                        <select name="currency" value={formData.currency || "INR"} onChange={handleInputChange} className="admin-staff-form-input">
                          <option value="INR">INR</option>
                          <option value="USD">US Dollar</option>
                          <option value="EUR">Euro</option>
                        </select>
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Terms of Payment</label>
                        <select name="termsOfPayment" value={formData.termsOfPayment || ""} onChange={handleInputChange} className="admin-staff-form-input">
                          <option value="">Select Terms</option>
                          <option value="Net 15">Net 15 Days</option>
                          <option value="Net 30">Net 30 Days</option>
                          <option value="Net 60">Net 60 Days</option>
                        </select>
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Apply Reverse Charge</label>
                        <select name="reverseCharge" value={formData.reverseCharge || "No"} onChange={handleInputChange} className="admin-staff-form-input">
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="admin-staff-form-field">
                        <label className="admin-staff-form-label">Export or SEZ Developer</label>
                        <select name="exportSez" value={formData.exportSez || "Not Applicable"} onChange={handleInputChange} className="admin-staff-form-input">
                          <option value="Not Applicable">Not Applicable</option>
                          <option value="Export">Export</option>
                          <option value="SEZ Developer">SEZ Developer</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </FormSection>

              {/* DOCUMENTS */}
              <FormSection
                id="documents"
                activeTab={activeTab}
                title="Documents"
                onBack={handleBack}
                onNext={enableAsRetailer ? handleNext : null}
                onSubmit={!enableAsRetailer ? handleSubmit : null}
                isLast={!enableAsRetailer}
                onCancel={handleCancel}
                submitLabel={isEditMode ? "Update Staff" : "Add Staff"}
              >
                <div className="admin-staff-form-grid">
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Aadhaar Number</label><input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">PAN Number</label><input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Blood Group</label><input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field"><label className="admin-staff-form-label">Emergency Contact</label><input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                  <div className="admin-staff-form-field">
                    <label className="admin-staff-form-label">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="admin-staff-form-input">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </FormSection>

              {/* SHIPPING & BILLING */}
              {enableAsRetailer && (
                <>
                  <FormSection id="shipping" activeTab={activeTab} title="Shipping Address" onBack={handleBack} onNext={handleNext} nextLabel="Billing Address" onCancel={handleCancel}>
                    <div className="admin-staff-form-grid">
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">Address Line 1</label><input type="text" name="shipping_address_line1" value={formData.shipping_address_line1} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">Address Line 2</label><input type="text" name="shipping_address_line2" value={formData.shipping_address_line2} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">City</label><input type="text" name="shipping_city" value={formData.shipping_city} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">Pin Code</label><input type="text" name="shipping_pin_code" value={formData.shipping_pin_code} onChange={handleInputChange} maxLength={6} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">State</label><input type="text" name="shipping_state" value={formData.shipping_state} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">Country</label><input type="text" name="shipping_country" value={formData.shipping_country} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">Branch Name</label><input type="text" name="shipping_branch_name" value={formData.shipping_branch_name} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                      <div className="admin-staff-form-field"><label className="admin-staff-form-label">GSTIN</label><input type="text" name="shipping_gstin" value={formData.shipping_gstin} onChange={handleInputChange} maxLength={15} className="admin-staff-form-input" /></div>
                    </div>
                  </FormSection>

                  <FormSection id="billing" activeTab={activeTab} title="Billing Address" onBack={handleBack} onSubmit={handleSubmit} isLast={true} onCancel={handleCancel} submitLabel={isEditMode ? "Update Staff" : "Add Staff"}>
                    <div className="admin-staff-same-as-shipping">
                      <label className="admin-staff-checkbox-label">
                        <input type="checkbox" checked={formData.sameAsShipping} onChange={handleSameAsShipping} className="admin-staff-checkbox" />
                        <span className="admin-staff-checkbox-text">Same as Shipping Address</span>
                      </label>
                    </div>
                    {!formData.sameAsShipping && (
                      <div className="admin-staff-form-grid">
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">Address Line 1</label><input type="text" name="billing_address_line1" value={formData.billing_address_line1} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">Address Line 2</label><input type="text" name="billing_address_line2" value={formData.billing_address_line2} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">City</label><input type="text" name="billing_city" value={formData.billing_city} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">Pin Code</label><input type="text" name="billing_pin_code" value={formData.billing_pin_code} onChange={handleInputChange} maxLength={6} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">State</label><input type="text" name="billing_state" value={formData.billing_state} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">Country</label><input type="text" name="billing_country" value={formData.billing_country} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">Branch Name</label><input type="text" name="billing_branch_name" value={formData.billing_branch_name} onChange={handleInputChange} className="admin-staff-form-input" /></div>
                        <div className="admin-staff-form-field"><label className="admin-staff-form-label">GSTIN</label><input type="text" name="billing_gstin" value={formData.billing_gstin} onChange={handleInputChange} maxLength={15} className="admin-staff-form-input" /></div>
                      </div>
                    )}
                  </FormSection>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddStaff;