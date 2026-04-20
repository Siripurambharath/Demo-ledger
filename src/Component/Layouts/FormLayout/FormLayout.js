import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AdminSidebar from "../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../Shared/AdminSidebar/AdminHeader";

const FormLayout = ({ 
  user, 
  title, 
  tabs, 
  activeTab, 
  onTabClick, 
  children,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area */}
      <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
      
        <div className="container customer-form-container">
          <h1 className="customer-form-title">{title}</h1>
          
          <div className="customer-form-tabs">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                className={`customer-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabClick(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export const FormSection = ({ 
  id, 
  activeTab, 
  title, 
  children, 
  onBack, 
  onNext, 
  nextLabel,
  isLast = false,
  onSubmit,
  isSubmitting = false,  // ✅ Add this prop
  submitLabel = "Submit"  // ✅ Add this prop
}) => {
  return (
    <div className={`card customer-form-card ${activeTab === id ? 'active-section' : ''}`}>
      <div className="customer-form-section">
        <h2 className="customer-section-title">{title}</h2>
        {children}
      </div>

      <div className="customer-form-submit">
        {onBack && (
          <Button 
            variant="outline-secondary" 
            className="customer-back-btn"
            onClick={onBack}
            disabled={isSubmitting}  // ✅ Disable while submitting
          >
            Back
          </Button>
        )}
        {onNext && !isLast && (
          <Button 
            variant="primary" 
            className="customer-submit-btn"
            onClick={onNext}
            disabled={isSubmitting}  // ✅ Disable while submitting
          >
            Next: {nextLabel}
          </Button>
        )}
        {isLast && (
          <Button 
            type="submit" 
            variant="primary" 
            className="customer-submit-btn"
            onClick={onSubmit}
            disabled={isSubmitting}  // ✅ Disable while submitting
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormLayout;