import React from "react";

const DebitNoteCustomerInfo = ({ customerData, loadingCustomer }) => {
  return (
    <div className="row mt-3">
      <div className="col-md-4 border p-3">
        <div className="fw-bold">Customer Info</div>

        {loadingCustomer ? (
          <div className="small text-muted mt-2">
            Loading...
          </div>
        ) : customerData ? (
          <>
            <div className="small">Business: {customerData.business_name}</div>
            <div className="small">Email: {customerData.email}</div>
            <div className="small">Mobile: {customerData.mobile_number}</div>
            <div className="small">GST: {customerData.gstin}</div>
          </>
        ) : (
          <div className="small mt-2 text-muted">
            Select an invoice to load customer details
          </div>
        )}
      </div>
 <div className="col-md-4 border p-3">
        <div className="fw-bold">Billing Address</div>
        <div className="small mt-2">
          {customerData ? customerData.billing_address_line1 : "N/A"},
          {customerData ? customerData.billing_address_line2 : "N/A"},

          {customerData ? customerData.billing_city : "N/A"},
          </div>
                  <div className="small mt-2">

          {customerData ? customerData.billing_state : "N/A"},
          {customerData ? customerData.billing_country : "N/A"},
          {customerData ? customerData.billing_pin_code : "N/A"},




        </div>
      </div>
       <div className="col-md-4 border p-3">
        <div className="fw-bold">Shipping Address</div>
        <div className="small mt-2">
          {customerData ? customerData.shipping_address_line1 : "N/A"},
          {customerData ? customerData.shipping_address_line2 : "N/A"},
          {customerData ? customerData.shipping_city : "N/A"},
           </div>
          <div className="small mt-2">

          {customerData ? customerData.shipping_state : "N/A"},
          {customerData ? customerData.shipping_country : "N/A"},
          {customerData ? customerData.shipping_pin_code : "N/A"},
       </div>
      </div>
    </div>
  );
};

export default DebitNoteCustomerInfo;
