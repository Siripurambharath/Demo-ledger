import React, { useState, useEffect } from 'react';
import FormLayout, { FormSection } from '../../../Layouts/FormLayout/FormLayout';
import "./AddRetailer.css";
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { baseurl } from './../../../BaseURL/BaseURL';

// Helper function to convert state code to state name
const getStateName = (stateCode) => {
  const stateMap = {
    '36': 'Telangana',
    '28': 'Andhra Pradesh',
    '32': 'Kerala',
    '29': 'Karnataka',
    'TGC022': 'Telangana',

  };
  return stateMap[stateCode] || stateCode || '';
};

const RetailerForm = ({ user, mode = 'add' }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [isViewing, setIsViewing] = useState(mode === 'view');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isLoadingGstin, setIsLoadingGstin] = useState(false);
  const [gstinError, setGstinError] = useState(null);
  const [accountGroups, setAccountGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loading, setLoading] = useState(mode !== 'add');
  const [staffList, setStaffList] = useState([]);
const [isSubmitting, setIsSubmitting] = useState(false);
  const [createBoth, setCreateBoth] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    entity_type: "",
    name: "",
    role: "retailer",
    status: 1,
    group: "",
    mobile_number: "",
    email: "",
    assigned_staff: "",
    staffid: "",
    password: "",
    discount: 0,
    Target: 100000,
    credit_limit: "",
    gstin: "",
    gst_registered_name: "",
    business_name: "",
    additional_business_name: "",
    display_name: "",
    phone_number: "",
    fax: "",
    account_number: "",
    account_name: "",
    bank_name: "",
    account_type: "",
    branch_name: "",
    ifsc_code: "",
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
    shipping_state_code: "",
    billing_state_code: "",
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
    opening_balance: 0,
    opening_balance_type: "Debit",
    is_dual_account: 0,
  });

  // List of mandatory fields
  const mandatoryFields = [
    'name',
    'entity_type',
    'group',
    'gstin',
    'email',
    'display_name',
    'shipping_state',
    'shipping_country',
    'billing_state',
    'billing_country',
    'opening_balance',
    'opening_balance_type'
  ];



  // Master list of states with codes
  const STATES = [
    { code: '01', name: 'Jammu & Kashmir' },
    { code: '02', name: 'Himachal Pradesh' },
    { code: '03', name: 'Punjab' },
    { code: '04', name: 'Chandigarh' },
    { code: '05', name: 'Uttarakhand' },
    { code: '06', name: 'Haryana' },
    { code: '07', name: 'Delhi' },
    { code: '08', name: 'Rajasthan' },
    { code: '09', name: 'Uttar Pradesh' },
    { code: '10', name: 'Bihar' },
    { code: '11', name: 'Sikkim' },
    { code: '12', name: 'Arunachal Pradesh' },
    { code: '13', name: 'Nagaland' },
    { code: '14', name: 'Manipur' },
    { code: '15', name: 'Mizoram' },
    { code: '16', name: 'Tripura' },
    { code: '17', name: 'Meghalaya' },
    { code: '18', name: 'Assam' },
    { code: '19', name: 'West Bengal' },
    { code: '20', name: 'Jharkhand' },
    { code: '21', name: 'Odisha' },
    { code: '22', name: 'Chhattisgarh' },
    { code: '23', name: 'Madhya Pradesh' },
    { code: '24', name: 'Gujarat' },
    { code: '25', name: 'Daman & Diu' },
    { code: '26', name: 'Dadra & Nagar Haveli' },
    { code: '27', name: 'Maharashtra' },
    { code: '28', name: 'Andhra Pradesh' },
    { code: '29', name: 'Karnataka' },
    { code: '30', name: 'Goa' },
    { code: '31', name: 'Lakshadweep' },
    { code: '32', name: 'Kerala' },
    { code: '33', name: 'Tamil Nadu' },
    { code: '34', name: 'Puducherry' },
    { code: '35', name: 'Andaman & Nicobar Islands' },
    { code: '36', name: 'Telangana' },
    { code: '37', name: 'Andhra Pradesh (New)' }
  ];

  const getStateByName = (name) =>
    STATES.find(s => s.name === name);

  const getStateByCode = (code) =>
    STATES.find(s => s.code === code);


  // Conditional mandatory fields based on group type
  const getConditionalMandatoryFields = () => {
    const fields = [];
    if (formData.group !== 'SUPPLIERS') {
      fields.push('staffid', 'assigned_staff');
    }
    return fields;
  };

  useEffect(() => {
    const fetchAccountGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await axios.get(`${baseurl}/accountgroup`);
        setAccountGroups(response.data);
      } catch (err) {
        console.error('Failed to fetch account groups', err);
        setAccountGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchAccountGroups();

    if (id && mode !== 'add') {
      const fetchRetailer = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${baseurl}/accounts/${id}`);
          const data = response.data;

          setFormData(data);
          setIsEditing(mode === 'edit');
          setIsViewing(mode === 'view');

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
          console.error('Failed to fetch retailer data', err);
          alert('Failed to load retailer data');
        } finally {
          setLoading(false);
        }
      };
      fetchRetailer();
    }
  }, [id, mode]);

  useEffect(() => {
    if (formData.staffid && staffList.length > 0) {
      const selectedOption = staffList.find(option => option.value == formData.staffid);
      if (selectedOption && formData.assigned_staff !== selectedOption.label) {
        setFormData(prev => ({ ...prev, assigned_staff: selectedOption.label }));
      }
    }
  }, [formData.staffid, staffList]);

  const handleGstinChange = async (e) => {
    const { name, value } = e.target;
    const gstin = value.toUpperCase();

    setFormData(prev => ({ ...prev, [name]: gstin }));

    if (gstin.length === 15) {
      setIsLoadingGstin(true);
      setGstinError(null);

      try {
        const response = await axios.post(`${baseurl}/gstin-details`, { gstin });

        if (response.data.success && response.data.result) {
          const result = response.data.result;

          console.log("GSTIN API Response:", result);

          // Extract data based on your API response structure
          const businessName = result.lgnm || result.tradeNam || '';
          const address = result.pradr?.addr || {};

          // Build address lines
          const addressLine1 = [address.bno, address.bnm, address.st].filter(Boolean).join(', ');
          const addressLine2 = [address.loc, address.dst].filter(Boolean).join(', ');

          // Get state name from state code
          const stateName = getStateName(result.stjCd || address.stcd);

          setFormData(prev => ({
            ...prev,
            gst_registered_name: result.lgnm || '',
            business_name: businessName,
            additional_business_name: result.tradeNam || '',
            display_name: businessName,
            shipping_address_line1: addressLine1 || '',
            shipping_address_line2: addressLine2 || '',
            shipping_city: address.loc || address.dst || '',
            shipping_pin_code: address.pncd || '',
            shipping_state: stateName,
            shipping_country: 'India',
            billing_address_line1: addressLine1 || '',
            billing_address_line2: addressLine2 || '',
            billing_city: address.loc || address.dst || '',
            billing_pin_code: address.pncd || '',
            billing_state: stateName,
            billing_country: 'India'
          }));

          setSameAsShipping(true);
        } else {
          setGstinError(response.data.message || "GSTIN details not found. Enter manually.");
        }
      } catch (err) {
        console.error("Error fetching GSTIN details:", err);
        setGstinError("Failed to fetch GSTIN details. Enter manually.");
      } finally {
        setIsLoadingGstin(false);
      }
    } else {
      setGstinError(null);
    }
  };

  const tabs = [
    { id: 'information', label: 'Information' },
    { id: 'banking', label: 'Banking & Taxes' },
    { id: 'shipping', label: 'Shipping Address' },
    { id: 'billing', label: 'Billing Address' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleChange = (e) => {
    if (isViewing) return;

    const { name, value } = e.target;

    // Base update
    setFormData(prev => {
      let updated = { ...prev, [name]: value };

      // When user selects a shipping state by name, set its code
      if (name === 'shipping_state') {
        const st = getStateByName(value);
        updated.shipping_state_code = st ? st.code : "";
      }

      // When user selects a shipping state code, set its name
      if (name === 'shipping_state_code') {
        const st = getStateByCode(value);
        updated.shipping_state = st ? st.name : "";
      }

      // When user selects a billing state by name, set its code
      if (name === 'billing_state') {
        const st = getStateByName(value);
        updated.billing_state_code = st ? st.code : "";
      }

      // When user selects a billing state code, set its name
      if (name === 'billing_state_code') {
        const st = getStateByCode(value);
        updated.billing_state = st ? st.name : "";
      }

      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'staffid') {
      const selectedOption = staffList.find(option => option.value === value);
      if (selectedOption) {
        setFormData(prev => ({ ...prev, assigned_staff: selectedOption.label }));
      } else {
        setFormData(prev => ({ ...prev, assigned_staff: '' }));
      }
    }
  };


  const validateCurrentTab = () => {
    if (isViewing) return true;

    const newErrors = {};
    const conditionalMandatoryFields = getConditionalMandatoryFields();

    switch (activeTab) {
      case 'information':
        // Base mandatory fields for all
        const informationMandatoryFields = [
          'name',
          'group',
           'email', 
          'display_name',
          'opening_balance',
          'opening_balance_type',
          ...conditionalMandatoryFields
        ];

        // Add entity_type only if NOT SUPPLIERS
        if (formData.group !== 'SUPPLIERS') {
          informationMandatoryFields.push('entity_type');
        }

        // Validate all mandatory fields
        informationMandatoryFields.forEach(field => {
          if (!formData[field] || formData[field].toString().trim() === '') {
            newErrors[field] = 'This field is required';
          }
        });

        // Field-specific validations (only validate format if field has value)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }

        if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
          newErrors.mobile_number = 'Invalid mobile number (10 digits required)';
        }

        if (formData.phone_number && !/^[0-9]{10,15}$/.test(formData.phone_number)) {
          newErrors.phone_number = 'Invalid phone number (10-15 digits required)';
        }

        if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
          newErrors.gstin = 'Invalid GSTIN (15 characters required)';
        }
        break;

      case 'banking':
        // No mandatory fields in banking tab
        // Only validate if field is filled (optional validation)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        break;

      case 'shipping':
        // Only state and country are mandatory
        if (!formData.shipping_state) {
          newErrors.shipping_state = 'This field is required';
        }

        if (!formData.shipping_country) {
          newErrors.shipping_country = 'This field is required';
        }

        // Optional field validation if filled
        if (formData.shipping_pin_code && !/^[0-9]{6}$/.test(formData.shipping_pin_code)) {
          newErrors.shipping_pin_code = 'Invalid PIN code (6 digits required)';
        }

        if (formData.shipping_gstin && !/^[0-9A-Z]{0,15}$/.test(formData.shipping_gstin)) {
          newErrors.shipping_gstin = 'Invalid GSTIN (max 15 characters)';
        }
        break;

      case 'billing':
        if (!sameAsShipping) {
          // Only state and country are mandatory
          if (!formData.billing_state) {
            newErrors.billing_state = 'This field is required';
          }

          if (!formData.billing_country) {
            newErrors.billing_country = 'This field is required';
          }

          // Optional field validation if filled
          if (formData.billing_pin_code && !/^[0-9]{6}$/.test(formData.billing_pin_code)) {
            newErrors.billing_pin_code = 'Invalid PIN code (6 digits required)';
          }

          if (formData.billing_gstin && !/^[0-9A-Z]{0,15}$/.test(formData.billing_gstin)) {
            newErrors.billing_gstin = 'Invalid GSTIN (max 15 characters)';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get field label for error messages
  const getFieldLabel = (fieldName) => {
    const fieldLabels = {
      'name': 'Name',
      'entity_type': 'Entity Type',
      'group': 'Group Type',
      'email': 'Email',
      'display_name': 'Display Name',
      'phone_number': 'Phone Number',
      'mobile_number': 'Mobile Number',
      'gstin': 'GSTIN',
      'staffid': 'Assign Staff',
      'assigned_staff': 'Assigned Staff',
      'shipping_state': 'Shipping State',
      'shipping_country': 'Shipping Country',
      'shipping_state_code': 'Shipping State Code',
      'billing_state': 'Billing State',
      'billing_country': 'Billing Country',
      'billing_state_code': 'Billing State Code',
      'shipping_pin_code': 'Shipping PIN Code',
      'billing_pin_code': 'Billing PIN Code',
      'shipping_gstin': 'Shipping GSTIN',
      'billing_gstin': 'Billing GSTIN'
    };
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ');
  };

  const handleNext = () => {
    if (!validateCurrentTab()) {
      // Find the first error field and focus on it
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.focus();
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Show alert with specific missing fields
      const errorMessages = Object.keys(errors).map(field => {
        const fieldLabel = getFieldLabel(field);
        return `${fieldLabel}: ${errors[field]}`;
      }).join('\n');

      alert(`Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  useEffect(() => {
    setFormData(prev => {
      // Remove spaces and special characters from name for password generation
      const cleanName = prev.name ? prev.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') : '';
      return {
        ...prev,
        password: cleanName ? `${cleanName}@123` : ''
      };
    });
  }, [formData.name]);;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewing) {
      navigate('/retailers');
      return;
    }
 setIsSubmitting(true);
    // Validate all tabs before final submission
    let allTabsValid = true;
    const allErrors = {};

    // Check each tab's validation
    tabs.forEach(tab => {
      const tempErrors = {};
      const conditionalMandatoryFields = getConditionalMandatoryFields();

      if (tab.id === 'information') {
        // Base mandatory fields
        const informationMandatoryFields = [
          'name',
          'group',
           'email',
          'display_name',
          'opening_balance',
          'opening_balance_type',
          ...conditionalMandatoryFields
        ];

        // Add entity_type only if NOT SUPPLIERS
        if (formData.group !== 'SUPPLIERS') {
          informationMandatoryFields.push('entity_type');
        }

        // Add GSTIN for suppliers
        // if (formData.group === 'SUPPLIERS') {
        //   informationMandatoryFields.push('gstin');
        // }

        // informationMandatoryFields.forEach(field => {
        //   if (!formData[field]) {
        //     tempErrors[field] = 'This field is required';
        //   }
        // });

        // Field-specific validations
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          tempErrors.email = 'Invalid email format';
        }

        if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
          tempErrors.mobile_number = 'Invalid mobile number (10 digits required)';
        }

        if (formData.phone_number && !/^[0-9]{10,15}$/.test(formData.phone_number)) {
          tempErrors.phone_number = 'Invalid phone number (10-15 digits required)';
        }

        if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
          tempErrors.gstin = 'Invalid GSTIN (15 characters required)';
        }
      } else if (tab.id === 'shipping') {
        if (!formData.shipping_state) {
          tempErrors.shipping_state = 'This field is required';
        }

        if (!formData.shipping_country) {
          tempErrors.shipping_country = 'This field is required';
        }
      } else if (tab.id === 'billing' && !sameAsShipping) {
        if (!formData.billing_state) {
          tempErrors.billing_state = 'This field is required';
        }

        if (!formData.billing_country) {
          tempErrors.billing_country = 'This field is required';
        }
      }

      if (Object.keys(tempErrors).length > 0) {
        allTabsValid = false;
        Object.assign(allErrors, tempErrors);
      }
    });

    if (!allTabsValid) {
      setErrors(allErrors);
      alert('Please fill all required fields before submitting.');
      return;
    }

    // Clean the name for password generation (remove spaces and special chars)
    const cleanNameForPassword = formData.name ? formData.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') : '';

    let finalData = {
      ...formData,
      password: cleanNameForPassword ? `${cleanNameForPassword}@123` : ''
    };

    if (formData.group === 'SUPPLIERS') {
      const fieldsToRemove = ['assigned_staff', 'staffid', 'role', 'entity_type'];
      fieldsToRemove.forEach(field => {
        delete finalData[field];
      });
    }

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
        billing_gstin: formData.shipping_gstin
      };
    }

    const isSupplier = formData.group === "SUPPLIERS";

    try {

      // ✅ Add flag instead of creating 2 rows
      const finalDataToSend = {
        ...finalData,
        is_dual_account: createBoth ? 1 : 0
      };

      if (isEditing) {

        await axios.put(`${baseurl}/accounts/${id}`, finalDataToSend);

        if (isSupplier) {
          alert("Supplier updated successfully!");
        } else {
          alert("Retailer updated successfully!");
        }

      } else {

        await axios.post(`${baseurl}/accounts`, finalDataToSend);

        if (isSupplier) {
          alert("Supplier added successfully!");
        } else {
          alert("Retailer added successfully!");
        }
      }

      navigate('/retailers');

    } catch (err) {
      console.error(err);
      alert(`Failed to ${isEditing ? 'update' : 'add'} ${isSupplier ? 'supplier' : 'retailer'}`);
    }
     finally {
    setIsSubmitting(false);
  }

  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${baseurl}/api/account`);
        if (res.data.success) {
          const options = res.data.staff.map((staff) => ({
            value: staff.id,
            label: staff.name,
          }));
          setStaffList(options);
        }
      } catch (err) {
        console.error("Failed to fetch staff data:", err);
      }
    };

    fetchStaff();
  }, []);

  const handleCancel = () => {
    navigate('/retailers');
  };

  const renderError = (fieldName) => {
    return errors[fieldName] ? (
      <div className="invalid-feedback" style={{ display: 'block' }}>
        {errors[fieldName]}
      </div>
    ) : null;
  };

  const getInputClass = (fieldName) => {
    return `form-control customer-form-input ${errors[fieldName] ? 'is-invalid' : ''} ${isViewing ? 'view-mode' : ''}`;
  };

  const getSelectClass = (fieldName) => {
    return `form-select customer-form-input ${errors[fieldName] ? 'is-invalid' : ''} ${isViewing ? 'view-mode' : ''}`;
  };

  const renderField = (fieldConfig) => {
    const { type = 'text', name, label, required = false, options, onChange: customOnChange, ...props } = fieldConfig;

    // Check if field is mandatory based on our rules
    const isFieldMandatory = mandatoryFields.includes(name) ||
      (formData.group !== 'SUPPLIERS' && ['staffid', 'assigned_staff', 'entity_type'].includes(name));
    // Removed: (formData.group === 'SUPPLIERS' && name === 'gstin')

    if (isViewing) {
      const displayValue = (name === 'staffid' && formData.assigned_staff)
        ? formData.assigned_staff
        : (formData[name] || 'N/A');

      return (
        <div className="mb-3">
          <label className="customer-form-label view-mode-label">{label}</label>
          <div className="view-mode-value">{displayValue}</div>
        </div>
      );
    }

    // Hide role, assigned_staff, staffid for SUPPLIERS
    if (
      (formData.group === 'SUPPLIERS' && ['role', 'assigned_staff', 'staffid', 'entity_type'].includes(name)) &&
      !createBoth // ✅ show when checkbox enabled
    ) {
      return null;
    }
    if (type === 'select') {
      return (
        <div className="mb-3">
          <label className="customer-form-label">{label}{isFieldMandatory && '*'}</label>
          <select
            className={getSelectClass(name)}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            required={isFieldMandatory}
            {...props}
          >
            <option value="">Select</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderError(name)}
        </div>
      );
    }

    return (
      <div className="mb-3">
        <label className="customer-form-label">{label}{isFieldMandatory && '*'}</label>
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          className={getInputClass(name)}
          onChange={customOnChange || handleChange}
          required={isFieldMandatory}
          {...props}
        />
        {renderError(name)}
      </div>
    );
  };

  const renderActiveTab = () => {
    if (loading) {
      return <div className="loading-spinner">Loading retailer data...</div>;
    }

    switch (activeTab) {
      case 'information':
        return (
          <FormSection
            id="information"
            activeTab={activeTab}
            title="Information"
            onBack={null}
            onNext={handleNext}
            nextLabel="Banking & Taxes"
            isViewing={isViewing}
            onCancel={handleCancel}
          >
            {/* Debug section - remove in production */}
            {/* <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', border: '1px solid #ccc' }}>
      <h6>Debug Info:</h6>
      <p>Business Name: <strong>{formData.business_name || 'Empty'}</strong></p>
      <p>GST Registered Name: <strong>{formData.gst_registered_name || 'Empty'}</strong></p>
      <p>Display Name: <strong>{formData.display_name || 'Empty'}</strong></p>
    </div> */}

            <div className="row">
              <div className="col-md-6">
                <div className="row">
                  <div className="col-md-4">
                    {renderField({
                      type: 'select',
                      name: 'title',
                      label: 'Title',
                      options: [
                        { value: 'Mr.', label: 'Mr.' },
                        { value: 'Mrs.', label: 'Mrs.' },
                        { value: 'Ms.', label: 'Ms.' },
                        { value: 'Dr.', label: 'Dr.' }
                      ]
                    })}
                  </div>
                  <div className="col-md-8">
                    {renderField({
                      name: 'name',
                      label: 'Name',
                      required: true
                    })}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                {(formData.group !== 'SUPPLIERS' || createBoth) && renderField({
                  type: 'select',
                  name: 'entity_type',
                  label: 'Entity Type',
                  required: true,
                  options: [
                    { value: 'Individual', label: 'Individual' },
                    { value: 'Company', label: 'Company' },
                    { value: 'Partnership', label: 'Partnership' }
                  ]
                })}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'group',
                  label: 'Group Type',
                  required: true,
                  options: accountGroups.map(group => ({
                    value: group.AccountsGroupName,
                    label: group.AccountsGroupName
                  }))
                })}
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="customer-form-label">Customer GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin || ''}
                    className={getInputClass('gstin')}
                    onChange={handleGstinChange}
                    maxLength={15}
                    pattern="^[0-9A-Z]{15}$"
                    title="GSTIN must be exactly 15 characters (A-Z, 0-9 only)"
                    required={formData.group === 'SUPPLIERS' ? false : true}
                  />
                  {isLoadingGstin && <div className="text-muted small">Fetching GSTIN details...</div>}
                  {gstinError && <div className="text-danger small">{gstinError}</div>}
                  {renderError('gstin')}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'email',
                  name: 'email',
                  label: 'Email',
                  required: true
                })}
              </div>

              {formData.group !== 'SUPPLIERS' ? (
                <div className="col-md-6">
                  {renderField({
                    type: 'select',
                    name: 'staffid',
                    label: 'Assign staff',
                    required: true,
                    options: staffList
                  })}
                </div>
              ) : (
                <div className="col-md-6">
                  {renderField({
                    name: 'business_name',
                    label: 'Business Name'
                  })}
                </div>
              )}
            </div>

            <div className="row">
              {formData.group !== 'SUPPLIERS' ? (
                <>
                  <div className="col-md-6">
                    {renderField({
                      name: 'business_name',
                      label: 'Business Name'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'display_name',
                      label: 'Display Name',
                      required: true
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-6">
                    {renderField({
                      name: 'display_name',
                      label: 'Display Name',
                      required: true
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'gst_registered_name',
                      label: 'Customer GST Registered Name'
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="row">
              {formData.group !== 'SUPPLIERS' ? (
                <>
                  <div className="col-md-6">
                    {renderField({
                      name: 'gst_registered_name',
                      label: 'Customer GST Registered Name'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'additional_business_name',
                      label: 'Additional Business Name'
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-6">
                    {renderField({
                      name: 'additional_business_name',
                      label: 'Additional Business Name'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      type: 'tel',
                      name: 'mobile_number',
                      label: 'Mobile Number',
                      required: true
                    })}
                  </div>
                </>
              )}
            </div>

            {/* UPDATED SECTION - All groups show Mobile Number */}
            <div className="row">
              {formData.group !== 'SUPPLIERS' ? (
                // For all non-SUPPLIERS (Retailer, Distributor, Wholesaler, etc.) - show Mobile Number
                <>
                  <div className="col-md-6">
                    {renderField({
                      type: 'tel',
                      name: 'mobile_number',
                      label: 'Mobile Number',
                      required: true
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'fax',
                      label: 'Fax'
                    })}
                  </div>
                </>
              ) : (
                // For SUPPLIERS - show Fax and Mobile Number
                <>
                  <div className="col-md-6">
                    {renderField({
                      name: 'fax',
                      label: 'Fax'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      type: 'tel',
                      name: 'mobile_number',
                      label: 'Mobile Number',
                      required: true
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="row">
              {formData.group !== 'SUPPLIERS' ? (
                <>
                  <div className="col-md-6">
                    {renderField({
                      type: 'number',
                      name: 'discount',
                      label: 'Discount (%)',
                      min: 0,
                      max: 100,
                      step: 0.1
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      type: 'number',
                      name: 'Target',
                      label: 'Target (₹)',
                      min: 0,
                      step: 1000
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-6">
                    {renderField({
                      type: 'number',
                      name: 'Target',
                      label: 'Target (₹)',
                      min: 0,
                      step: 1000
                    })}
                  </div>
                  <div className="col-md-6">
                    <label className="customer-form-label">Opening Balance</label>
                    <div style={{ display: 'flex', width: '100%' }}>
                      <div style={{ width: '60%' }}>
                        <input
                          type="number"
                          name="opening_balance"
                          value={formData.opening_balance || ''}
                          className="form-control customer-form-input"
                          onChange={handleChange}
                          min={0}
                          step={1000}
                          placeholder="Amount"
                          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        />
                      </div>
                      <div style={{ width: '40%' }}>
                        <select
                          name="opening_balance_type"
                          value={formData.opening_balance_type || ''}
                          className="form-select customer-form-input"
                          onChange={handleChange}
                          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        >
                          <option value="">Select</option>
                          <option value="Credit">Credit</option>
                          <option value="Debit">Debit</option>
                        </select>
                      </div>
                    </div>
                    {renderError('opening_balance')}
                    {renderError('opening_balance_type')}
                  </div>
                </>
              )}
            </div>

            {formData.group === 'Retailer' ? (
              <div className="row">
                <div className="col-md-6">
                  {renderField({
                    type: 'number',
                    name: 'credit_limit',
                    label: 'Credit Limit (₹)',
                    min: 0,
                    step: 1000
                  })}
                </div>
                <div className="col-md-6">
                  <label className="customer-form-label">Opening Balance</label>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <div style={{ width: '60%' }}>
                      <input
                        type="number"
                        name="opening_balance"
                        value={formData.opening_balance || 0}
                        className="form-control customer-form-input"
                        onChange={handleChange}
                        min={0}
                        step={1000}
                        placeholder="Amount"
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        
                      />
                    </div>
                    <div style={{ width: '40%' }}>
                      <select
                        name="opening_balance_type"
                        value={formData.opening_balance_type || ''}
                        className="form-select customer-form-input"
                        onChange={handleChange}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <option value="">Select</option>
                        <option value="Credit">Credit</option>
                        <option value="Debit">Debit</option>
                      </select>
                    </div>
                  </div>
                  {renderError('opening_balance')}
                  {renderError('opening_balance_type')}
                </div>
              </div>
            ) : (
              <div className="row">
                {/* Empty row for non-Retailer groups */}
              </div>
            )}

<div className="row">
  <div className="col-md-6">
    {renderField({
      type: 'text',
      name: 'password',
      label: 'Password',
      readOnly: true,
      disabled: false, 
      placeholder: 'Auto-generated from name'
    })}
  </div>
  <div className="col-md-6">
    
  </div>
</div>

            {/* ✅ NEW CHECKBOX */}
            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="createBoth"
                  checked={formData.is_dual_account === 1}
                  onChange={(e) => {
                    const value = e.target.checked ? 1 : 0;
                    setCreateBoth(e.target.checked); // for UI logic
                    setFormData(prev => ({
                      ...prev,
                      is_dual_account: value // ✅ send 1 or 0
                    }));
                  }}
                />
                <label className="form-check-label" htmlFor="createBoth">
                  {formData.group === "SUPPLIERS"
                    ? "enable retailer for this supplier"
                    : "enable supplier for this retailer"}
                </label>
              </div>
            </div>
          </FormSection>
        );

      case 'banking':
        return (
          <FormSection
            id="banking"
            activeTab={activeTab}
            title="Banking & Taxes"
            onBack={handleBack}
            onNext={handleNext}
            nextLabel="Shipping Address"
            isViewing={isViewing}
            onCancel={handleCancel}
          >
            <div className="mb-4">
              <h3 className="customer-subsection-title">Account Information</h3>
              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    name: 'account_number',
                    label: 'Account Number',
                    type: 'text',
                    maxLength: 18,
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    name: 'account_name',
                    label: 'Account Name'
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'bank_name',
                    label: 'Bank Name',
                    options: [
                      { value: 'SBI', label: 'SBI' },
                      { value: 'HDFC', label: 'HDFC' },
                      { value: 'ICICI', label: 'ICICI' },
                      { value: 'Axis Bank', label: 'Axis Bank' }
                    ]
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    name: 'ifsc_code',
                    label: 'IFSC Code',
                    type: 'text',
                    maxLength: 11,
                    pattern: "^[A-Z]{4}0[0-9A-Z]{6}$",
                    title: "IFSC Code format: 4 letters, 0, then 6 alphanumeric (e.g. SBIN0000123)",
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'account_type',
                    label: 'Account Type',
                    options: [
                      { value: 'Savings Account', label: 'Savings Account' },
                      { value: 'Current Account', label: 'Current Account' }
                    ]
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    name: 'branch_name',
                    label: 'Branch Name'
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="customer-subsection-title">Tax Information</h3>
              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    name: 'pan',
                    label: 'PAN',
                    type: 'text',
                    maxLength: 10,
                    pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
                    title: "PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)",
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    name: 'tan',
                    label: 'TAN'
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'tds_slab_rate',
                    label: 'TCS Slab Rate',
                    options: [
                      { value: 'Not Applicable', label: 'TCS Not Applicable' },
                      { value: '0.1%', label: '0.1%' },
                      { value: '1%', label: '1%' },
                      { value: '5%', label: '5%' }
                    ]
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'currency',
                    label: 'Currency',
                    options: [
                      { value: 'INR', label: 'INR' },
                      { value: 'USD', label: 'US Dollar' },
                      { value: 'EUR', label: 'Euro' }
                    ]
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'terms_of_payment',
                    label: 'Terms of Payment',
                    options: [
                      { value: 'Net 15', label: 'Net 15' },
                      { value: 'Net 30', label: 'Net 30' },
                      { value: 'Net 60', label: 'Net 60' }
                    ]
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'reverse_charge',
                    label: 'Apply Reverse Charge',
                    options: [
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'export_sez',
                    label: 'Export or SEZ Developer',
                    options: [
                      { value: 'Not Applicable', label: 'Not Applicable' },
                      { value: 'Export', label: 'Export' },
                      { value: 'SEZ Developer', label: 'SEZ Developer' }
                    ]
                  })}
                </div>
              </div>
            </div>
          </FormSection>
        );

      case 'shipping':
        return (
          <FormSection
            id="shipping"
            activeTab={activeTab}
            title="Shipping Address"
            onBack={handleBack}
            onNext={handleNext}
            nextLabel="Billing Address"
            isViewing={isViewing}
            onCancel={handleCancel}
          >
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_address_line1',
                  label: 'Address Line 1'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_address_line2',
                  label: 'Address Line 2'
                })}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_city',
                  label: 'City'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_pin_code',
                  label: 'Pin Code'
                })}
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                {renderField({
                  type: 'select',
                  name: 'shipping_state',
                  label: 'State',
                  required: true,
                  options: STATES.map(s => ({ value: s.name, label: s.name }))
                })}
              </div>
              <div className="col-md-2">
                {renderField({
                  type: 'select',
                  name: 'shipping_state_code',
                  label: 'State Code',
                  required: true,
                  options: STATES.map(s => ({ value: s.code, label: s.code }))
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'shipping_country',
                  label: 'Country',
                  required: true,
                  options: [
                    { value: 'India', label: 'India' },
                    { value: 'Bangladesh', label: 'Bangladesh' },
                    { value: 'Canada', label: 'Canada' },
                    { value: 'Iraq', label: 'Iraq' }
                  ]
                })}
              </div>
            </div>


            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_branch_name',
                  label: 'Branch Name'
                })}
              </div>

              <div className="col-md-6">
                {renderField({
                  name: 'shipping_gstin',
                  label: 'GSTIN',
                  type: 'text',
                  maxLength: 15,
                  pattern: "^[0-9A-Z]{15}$",
                  title: "GSTIN must be exactly 15 characters long (A-Z, 0-9 only)"
                })}
              </div>
            </div>
          </FormSection>
        );

      case 'billing':
        return (
          <FormSection
            id="billing"
            activeTab={activeTab}
            title="Billing Address"
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLast={true}
            isViewing={isViewing}
            onCancel={handleCancel}
              isSubmitting={isSubmitting}  // ✅ NEW: Pass loading state
  submitLabel={isEditing ? "Update Retailer" : "Add Retailer"}  // ✅ NEW: Dynamic text
          >
            {!isViewing && (
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    disabled={isViewing}
                  />
                  <label className="form-check-label" htmlFor="sameAsShipping">
                    Shipping address is same as billing address
                  </label>
                </div>
              </div>
            )}

            {!sameAsShipping || isViewing ? (
              <>
                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_address_line1',
                      label: 'Address Line 1'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_address_line2',
                      label: 'Address Line 2'
                    })}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_city',
                      label: 'City'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_pin_code',
                      label: 'Pin Code'
                    })}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    {renderField({
                      type: 'select',
                      name: 'billing_state',
                      label: 'State',
                      required: true,
                      options: STATES.map(s => ({ value: s.name, label: s.name }))
                    })}
                  </div>
                  <div className="col-md-2">
                    {renderField({
                      type: 'select',
                      name: 'billing_state_code',
                      label: 'State Code',
                      required: true,
                      options: STATES.map(s => ({ value: s.code, label: s.code }))
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      type: 'select',
                      name: 'billing_country',
                      label: 'Country',
                      required: true,
                      options: [
                        { value: 'India', label: 'India' },
                        { value: 'Bangladesh', label: 'Bangladesh' },
                        { value: 'Canada', label: 'Canada' },
                        { value: 'Iraq', label: 'Iraq' }
                      ]
                    })}
                  </div>
                </div>


                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_branch_name',
                      label: 'Branch Name'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_gstin',
                      label: 'GSTIN',
                      type: 'text',
                      maxLength: 15,
                      pattern: "^[0-9A-Z]{15}$",
                      title: "GSTIN must be exactly 15 characters long (A-Z, 0-9 only)"
                    })}
                  </div>
                </div>
              </>
            ) : (
              isViewing && (
                <div className="alert alert-info">
                  <strong>Note:</strong> Billing address is same as shipping address.
                </div>
              )
            )}
          </FormSection>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return "Add Contact";
      case 'edit': return "Edit Contact";
      case 'view': return "View Contact";
      default: return "Retailer";
    }
  };

  return (
    <FormLayout
      user={user}
      title={getTitle()}
      tabs={tabs}
      activeTab={activeTab}
      onTabClick={handleTabClick}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      mode={mode}
    >
      <form onSubmit={handleSubmit}>
        {renderActiveTab()}
      </form>
    </FormLayout>
  );
};

export default RetailerForm;