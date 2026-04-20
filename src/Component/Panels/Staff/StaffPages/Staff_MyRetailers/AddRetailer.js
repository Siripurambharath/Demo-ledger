import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./AddRetailer.css";
import { baseurl } from "./../../../../BaseURL/BaseURL";

function AddRetailer({ mode = "add" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [loading, setLoading] = useState(mode !== "add");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isLoadingGstin, setIsLoadingGstin] = useState(false);
  const [gstinError, setGstinError] = useState(null);
  const [accountGroups, setAccountGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("information");
  const [errors, setErrors] = useState({});
  // Retrieve data from localStorage
const storedData = localStorage.getItem("user");

// Parse it back into an object
const user = storedData ? JSON.parse(storedData) : null;

// Get id and name separately
const userId = user ? user.id : null;
const userName = user ? user.name : null;


  const [formData, setFormData] = useState({
    title: "",
    name: "",
    entity_type: "",
    group: "customer",
    role: "retailer", 
    gstin: "",
    email: "",
      assigned_staff: userName,
    staffid: userId,
    business_name: "",
    display_name: "",
    gst_registered_name: "",
    additional_business_name: "",
    phone_number: "",
    fax: "",
    mobile_number: "",
    password: "",
    account_number: "",
    account_name: "",
    bank_name: "",
    account_type: "",
    ifsc_code: "",
    branch_name: "",
    pan: "",
    tan: "",
    tds_slab_rate: "",
    currency: "",
    terms_of_payment: "",
    reverse_charge: "",
    export_sez: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_pin_code: "",
    shipping_state: "",
    shipping_country: "",
    shipping_branch_name: "",
    shipping_gstin: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_pin_code: "",
    billing_state: "",
    billing_country: "",
    billing_branch_name: "",
    billing_gstin: "",
  });

  const tabs = [
    { id: "information", label: "Information" },
    { id: "banking", label: "Banking & Taxes" },
    { id: "shipping", label: "Shipping Address" },
    { id: "billing", label: "Billing Address" },
  ];

  const getAuthToken = () => {
    return localStorage.getItem("token") || ""; 
  };

  useEffect(() => {
    // Fetch account groups dynamically
    const fetchAccountGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await axios.get(`${baseurl}/accountgroup`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setAccountGroups(
          response.data.map((group) => ({
            value: group.AccountsGroupName,
            label: group.AccountsGroupName,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch account groups:", err);
        if (err.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          navigate("/login"); // Redirect to login
        }
        setAccountGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchAccountGroups();

    // Fetch retailer data for edit/view modes
    if (mode !== "add" && id) {
      const fetchRetailerData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${baseurl}/accounts/${id}`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
          const data = response.data;
          setFormData(data);
          const isSameAddress =
            data.billing_address_line1 === data.shipping_address_line1 &&
            data.billing_address_line2 === data.shipping_address_line2 &&
            data.billing_city === data.shipping_city &&
            data.billing_pin_code === data.shipping_pin_code &&
            data.billing_state === data.shipping_state &&
            data.billing_country === data.shipping_country &&
            data.billing_branch_name === data.shipping_branch_name &&
            data.billing_gstin === data.shipping_gstin;
          setSameAsShipping(isSameAddress);
        } catch (err) {
          console.error("Failed to fetch retailer data:", err);
          if (err.response?.status === 401) {
            alert("Unauthorized: Please log in again.");
            navigate("/login");
          } else {
            alert("Failed to load retailer data");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchRetailerData();
    }
  }, [id, mode, navigate]);

  useEffect(() => {
    // Auto-generate password when name changes
    if (mode !== "view" && formData.name) {
      setFormData((prev) => ({ ...prev, password: `${formData.name}@123` }));
    }
  }, [formData.name, mode]);

  const handleGstinChange = async (e) => {
    if (mode === "view") return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "gstin" && value.length === 15) {
      try {
        setIsLoadingGstin(true);
        setGstinError(null);
        const response = await axios.post(
          `${baseurl}/gstin-details`,
          { gstin: value },
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        if (response.data.success && response.data.result) {
          const result = response.data.result;
          const addr = result.pradr?.addr || {};
          const addressLine1 = `${addr.bno || ""}${addr.bno && addr.flno ? ", " : ""}${addr.flno || ""}`.trim();
          const addressLine2 = `${addr.st || ""}${addr.st && addr.bnm ? ", " : ""}${addr.bnm || ""}${
            (addr.st || addr.bnm) && addr.loc ? ", " : ""
          }${addr.loc || ""}`.trim();
          setFormData((prev) => ({
            ...prev,
            gst_registered_name: result.lgnm || "",
            business_name: result.tradeNam || "",
            additional_business_name: result.tradeNam || "",
            display_name: result.lgnm || "",
            shipping_address_line1: addressLine1,
            shipping_address_line2: addressLine2,
            shipping_city: result.ctj || "",
            shipping_pin_code: addr.pncd || "",
            shipping_state: addr.stcd || "",
            shipping_country: "India",
            billing_address_line1: addressLine1,
            billing_address_line2: addressLine2,
            billing_city: result.ctj || "",
            billing_pin_code: addr.pncd || "",
            billing_state: addr.stcd || "",
            billing_country: "India",
          }));
          setSameAsShipping(true);
        }
      } catch (error) {
        setGstinError("Failed to fetch GSTIN details. Please enter manually.");
        console.error("Error fetching GSTIN details:", error);
        if (error.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          navigate("/login");
        }
      } finally {
        setIsLoadingGstin(false);
      }
    }
  };

  const validateCurrentTab = () => {
    if (mode === "view") return true;
    const newErrors = {};
    switch (activeTab) {
      case "information":
        const infoFields = ["title", "name", "entity_type", "group", "mobile_number", "email", "business_name", "display_name"];
        infoFields.forEach((field) => {
          if (!formData[field]) {
            newErrors[field] = "This field is required";
          }
        });
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Invalid email format";
        }
        if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
          newErrors.mobile_number = "Invalid mobile number (10 digits required)";
        }
        break;
      case "banking":
        const bankingFields = ["account_number", "account_name", "bank_name", "account_type", "ifsc_code", "branch_name", "pan", "currency", "terms_of_payment"];
        bankingFields.forEach((field) => {
          if (!formData[field]) {
            newErrors[field] = "This field is required";
          }
        });
        break;
      case "shipping":
        const shippingFields = ["shipping_address_line1", "shipping_city", "shipping_pin_code", "shipping_state", "shipping_country"];
        shippingFields.forEach((field) => {
          if (!formData[field]) {
            newErrors[field] = "This field is required";
          }
        });
        if (formData.shipping_pin_code && !/^[0-9]{6}$/.test(formData.shipping_pin_code)) {
          newErrors.shipping_pin_code = "Invalid PIN code (6 digits required)";
        }
        break;
      case "billing":
        if (!sameAsShipping) {
          const billingFields = ["billing_address_line1", "billing_city", "billing_pin_code", "billing_state", "billing_country"];
          billingFields.forEach((field) => {
            if (!formData[field]) {
              newErrors[field] = "This field is required";
            }
          });
          if (formData.billing_pin_code && !/^[0-9]{6}$/.test(formData.billing_pin_code)) {
            newErrors.billing_pin_code = "Invalid PIN code (6 digits required)";
          }
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    if (mode === "view") return;
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNext = () => {
    if (!validateCurrentTab()) {
      alert("Please fill all required fields correctly in the current tab.");
      return;
    }
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "view") {
      navigate("/staff/retailers");
      return;
    }
    if (!validateCurrentTab()) {
      alert("Please fill all required fields correctly in the current tab.");
      return;
    }

    let finalData = { ...formData };
    if (sameAsShipping) {
      finalData = {
        ...finalData,
        billing_address_line1: formData.shipping_address_line1,
        billing_address_line2: formData.shipping_address_line2,
        billing_city: formData.shipping_city,
        billing_pin_code: formData.shipping_pin_code,
        billing_state: formData.shipping_state,
        billing_country: formData.shipping_country,
        billing_branch_name: formData.shipping_branch_name,
        billing_gstin: formData.shipping_gstin,
      };
    }

    console.log("Submitting data:", finalData); // Debug payload
    try {
      if (mode === "edit") {
        await axios.put(`${baseurl}/accounts/${id}`, finalData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        alert("Retailer updated successfully!");
      } else {
        await axios.post(`${baseurl}/accounts`, finalData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        alert("Retailer added successfully!");
      }
      navigate("/staff/retailers");
    } catch (err) {
      console.error("Failed to submit retailer data:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 400) {
        alert(`Failed to ${mode === "edit" ? "update" : "add"} retailer: Invalid data provided.`);
      } else {
        alert(`Failed to ${mode === "edit" ? "update" : "add"} retailer`);
      }
    }
  };

  const handleCancel = () => {
    navigate("/staff/retailers");
  };

  const renderField = ({ type = "text", name, label, required = true, options = [], onChange }) => {
    if (mode === "view") {
      return (
        <div className="form-group">
          <label htmlFor={name}>{label}</label>
          <div className="view-mode-value">{formData[name] || "N/A"}</div>
        </div>
      );
    }
    if (type === "select") {
      return (
        <div className="form-group">
          <label htmlFor={name}>{label}{required && " *"}</label>
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={onChange || handleInputChange}
            required={required}
            disabled={loadingGroups && name === "group"}
          >
            <option value="">Select</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
        </div>
      );
    }
    return (
      <div className="form-group">
        <label htmlFor={name}>{label}{required && " *"}</label>
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={onChange || handleInputChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          required={required}
          maxLength={type === "text" && name.includes("gstin") ? 15 : undefined}
          disabled={name === "password"}
          className={errors[name] ? "is-invalid" : ""}
        />
        {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
      </div>
    );
  };

  const getTitle = () => {
    return "Add New Retailer";
  };

  const renderActiveTab = () => {
    if (loading || loadingGroups) {
      return <div className="loading-spinner">Loading...</div>;
    }

    switch (activeTab) {
      case "information":
        return (
          <div className="form-section">
            <h2 className="section-title">Information</h2>
            {renderField({
              type: "select",
              name: "title",
              label: "Title",
              options: [
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Ms.", label: "Ms." },
                { value: "Dr.", label: "Dr." },
              ],
            })}
            {renderField({ name: "name", label: "Name" })}
            {renderField({
              type: "select",
              name: "entity_type",
              label: "Entity Type",
              options: [
                { value: "Individual", label: "Individual" },
                { value: "Company", label: "Company" },
                { value: "Partnership", label: "Partnership" },
              ],
            })}
            {renderField({
              type: "select",
              name: "group",
              label: "Group Type",
              options: accountGroups,
            })}
            {renderField({
              name: "gstin",
              label: "Customer GSTIN",
              required: false,
              onChange: handleGstinChange,
            })}
            {isLoadingGstin && <div className="text-muted small">Fetching GSTIN details...</div>}
            {gstinError && <div className="text-danger small">{gstinError}</div>}
            {renderField({ type: "email", name: "email", label: "Email Address" })}
            {renderField({ name: "business_name", label: "Business Name" })}
            {renderField({ name: "display_name", label: "Display Name" })}
            {renderField({ name: "gst_registered_name", label: "Customer GST Registered Name", required: false })}
            {renderField({ name: "additional_business_name", label: "Additional Business Name", required: false })}
            {renderField({ type: "tel", name: "phone_number", label: "Phone Number", required: false })}
            {renderField({ name: "fax", label: "Fax", required: false })}
            {renderField({ type: "tel", name: "mobile_number", label: "Mobile Number" })}
            {renderField({ name: "password", label: "Password", required: false })}
            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={handleNext}>
                Banking & Taxes
              </button>
            </div>
          </div>
        );
      case "banking":
        return (
          <div className="form-section">
            <h2 className="section-title">Banking & Taxes</h2>
            <div className="form-subsection">
              <h3 className="subsection-title">Account Information</h3>
              {renderField({ name: "account_number", label: "Account Number" })}
              {renderField({ name: "account_name", label: "Account Name" })}
              {renderField({
                type: "select",
                name: "bank_name",
                label: "Bank Name",
                options: [
                  { value: "SBI", label: "SBI" },
                  { value: "HDFC", label: "HDFC" },
                  { value: "ICICI", label: "ICICI" },
                  { value: "Axis Bank", label: "Axis Bank" },
                ],
              })}
              {renderField({ name: "ifsc_code", label: "IFSC Code" })}
              {renderField({
                type: "select",
                name: "account_type",
                label: "Account Type",
                options: [
                  { value: "Savings Account", label: "Savings Account" },
                  { value: "Current Account", label: "Current Account" },
                ],
              })}
              {renderField({ name: "branch_name", label: "Branch Name" })}
            </div>
            <div className="form-subsection">
              <h3 className="subsection-title">Tax Information</h3>
              {renderField({ name: "pan", label: "PAN" })}
              {renderField({ name: "tan", label: "TAN", required: false })}
              {renderField({
                type: "select",
                name: "tds_slab_rate",
                label: "TCS Slab Rate",
                options: [
                  { value: "Not Applicable", label: "TCS Not Applicable" },
                  { value: "0.1%", label: "0.1%" },
                  { value: "1%", label: "1%" },
                  { value: "5%", label: "5%" },
                ],
              })}
              {renderField({
                type: "select",
                name: "currency",
                label: "Currency",
                options: [
                  { value: "INR", label: "INR" },
                  { value: "USD", label: "US Dollar" },
                  { value: "EUR", label: "Euro" },
                ],
              })}
              {renderField({
                type: "select",
                name: "terms_of_payment",
                label: "Terms of Payment",
                options: [
                  { value: "Net 15", label: "Net 15" },
                  { value: "Net 30", label: "Net 30" },
                  { value: "Net 60", label: "Net 60" },
                ],
              })}
              {renderField({
                type: "select",
                name: "reverse_charge",
                label: "Apply Reverse Charge",
                options: [
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ],
              })}
              {renderField({
                type: "select",
                name: "export_sez",
                label: "Export or SEZ Developer",
                options: [
                  { value: "Not Applicable", label: "Not Applicable" },
                  { value: "Export", label: "Export" },
                  { value: "SEZ Developer", label: "SEZ Developer" },
                ],
              })}
            </div>
            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={handleBack}>
                Back
              </button>
              <button type="button" className="submit-btn" onClick={handleNext}>
                Next: Shipping Address
              </button>
            </div>
          </div>
        );
      case "shipping":
        return (
          <div className="form-section">
            <h2 className="section-title">Shipping Address</h2>
            {renderField({ name: "shipping_address_line1", label: "Address Line 1" })}
            {renderField({ name: "shipping_address_line2", label: "Address Line 2", required: false })}
            {renderField({ name: "shipping_city", label: "City" })}
            {renderField({ name: "shipping_pin_code", label: "Pin Code" })}
            {renderField({
              type: "select",
              name: "shipping_state",
              label: "State",
              options: [
                { value: "Telangana", label: "Telangana" },
                { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                { value: "Kerala", label: "Kerala" },
                { value: "Karnataka", label: "Karnataka" },
              ],
            })}
            {renderField({
              type: "select",
              name: "shipping_country",
              label: "Country",
              options: [
                { value: "India", label: "India" },
                { value: "Bangladesh", label: "Bangladesh" },
                { value: "Canada", label: "Canada" },
                { value: "Iraq", label: "Iraq" },
              ],
            })}
            {renderField({ name: "shipping_branch_name", label: "Branch Name", required: false })}
            {renderField({ name: "shipping_gstin", label: "GSTIN", required: false })}
            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={handleBack}>
                Back
              </button>
              <button type="button" className="submit-btn" onClick={handleNext}>
                Next: Billing Address
              </button>
            </div>
          </div>
        );
      case "billing":
        return (
          <div className="form-section">
            <h2 className="section-title">Billing Address</h2>
            {mode !== "view" && (
              <div className="form-group">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="sameAsShipping">
                    Shipping address is same as billing address
                  </label>
                </div>
              </div>
            )}
            {(!sameAsShipping || mode === "view") && (
              <>
                {renderField({ name: "billing_address_line1", label: "Address Line 1" })}
                {renderField({ name: "billing_address_line2", label: "Address Line 2", required: false })}
                {renderField({ name: "billing_city", label: "City" })}
                {renderField({ name: "billing_pin_code", label: "Pin Code" })}
                {renderField({
                  type: "select",
                  name: "billing_state",
                  label: "State",
                  options: [
                    { value: "Telangana", label: "Telangana" },
                    { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                    { value: "Kerala", label: "Kerala" },
                    { value: "Karnataka", label: "Karnataka" },
                  ],
                })}
                {renderField({
                  type: "select",
                  name: "billing_country",
                  label: "Country",
                  options: [
                    { value: "India", label: "India" },
                    { value: "Bangladesh", label: "Bangladesh" },
                    { value: "Canada", label: "Canada" },
                    { value: "Iraq", label: "Iraq" },
                  ],
                })}
                {renderField({ name: "billing_branch_name", label: "Branch Name", required: false })}
                {renderField({ name: "billing_gstin", label: "GSTIN", required: false })}
              </>
            )}
            {mode === "view" && sameAsShipping && (
              <div className="alert alert-info">
                <strong>Note:</strong> Billing address is same as shipping address.
              </div>
            )}
            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="submit-btn">
                Add Retailer
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <StaffMobileLayout>
      <div className="add-retailer-mobile">
        <header className="form-header">
          <h1>{getTitle()}</h1>
          <p>Fill in the details to add a retailer to your network</p>
        </header>
        <form onSubmit={handleSubmit} className="retailer-form">
          {renderActiveTab()}
        </form>
      </div>
    </StaffMobileLayout>
  );
}

export default AddRetailer;