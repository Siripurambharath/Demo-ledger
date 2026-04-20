import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { FaQrcode } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import './QRCodeGenerator.css'; // Import the CSS file

const QRCodeGenerator = ({ invoiceData, editableOrderMode, onQrDataGenerated }) => {
  
  const calculateGrandTotalForQR = () => {
    if (!invoiceData || !invoiceData.items) {
      console.log('❌ No invoice data or items for QR calculation');
      return 0;
    }
    
    const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();
    
    console.log('🔍 Calculating QR Grand Total:', {
      orderMode,
      itemCount: invoiceData.items.length
    });
    
    let grandTotal = 0;
    
    invoiceData.items.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 1;
      
      const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
      const totalTaxable = taxablePerUnit * quantity;
      
      const gstPerUnit = parseFloat(item.tax_amount) || 0;
      const totalGST = orderMode === "KACHA" ? 0 : gstPerUnit * quantity;
      
      const itemTotal = totalTaxable + totalGST;
      
      grandTotal += itemTotal;
      
      console.log(`💰 Item ${index + 1} Calculation:`, {
        product: item.product,
        quantity,
        taxablePerUnit,
        totalTaxable,
        gstPerUnit,
        totalGST,
        itemTotal,
        accumulatedTotal: grandTotal
      });
    });
    
    console.log('💰 FINAL QR Grand Total:', grandTotal);
    
    const invoiceGrandTotal = parseFloat(invoiceData.grandTotal) || 0;
    
    return Math.max(grandTotal, invoiceGrandTotal);
  };

  const generateQRCodeData = () => {
    if (!invoiceData) {
      console.log('❌ No invoice data available for QR code');
      return '';
    }
    
    try {
      const amount = calculateGrandTotalForQR();
      console.log('📊 QR Code Amount:', {
        amount,
        orderMode: editableOrderMode || invoiceData.order_mode,
        itemCount: invoiceData.items?.length || 0
      });
      
      // Ensure amount is properly formatted with 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);
      
      const upiId = 'shreeshashwatrajagroprivatelimited@sbi';
      
      const merchantName = invoiceData.companyInfo?.name?.replace(/[^a-zA-Z0-9 ]/g, '') || 'Business';
      
      const invoiceNumber = invoiceData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`;
      const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();
      
      const transactionNote = `Payment for Invoice ${invoiceNumber} (${orderMode} Order)`;
      
      const upiParams = new URLSearchParams({
        pa: upiId,
        pn: merchantName,
        am: formattedAmount,
        tn: transactionNote,
        cu: 'INR'
      });
      
      const upiUrl = `upi://pay?${upiParams.toString()}`;
      
      console.log('✅ Generated UPI URL for amount:', formattedAmount);
      
      // Callback to parent with QR data
      if (onQrDataGenerated) {
        onQrDataGenerated(upiUrl);
      }
      
      return upiUrl;
      
    } catch (error) {
      console.error('❌ Error generating QR code data:', error);
      return '';
    }
  };

  useEffect(() => {
    if (invoiceData && invoiceData.items) {
      const timer = setTimeout(() => {
        generateQRCodeData();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [invoiceData, editableOrderMode]);

  const getCorrectGrandTotal = () => {
    if (!invoiceData || !invoiceData.items) return 0;
    
    const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();
    
    let total = 0;
    
    invoiceData.items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 1;
      const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
      const taxPerUnit = parseFloat(item.tax_amount) || 0;
      
      const itemTaxable = taxablePerUnit * quantity;
      const itemTax = orderMode === "KACHA" ? 0 : taxPerUnit * quantity;
      const itemTotal = itemTaxable + itemTax;
      
      total += itemTotal;
    });
    
    console.log("✅ QR Correct Grand Total Calculation:", {
      calculated: total,
      invoiceDataGrandTotal: invoiceData.grandTotal,
      itemsCount: invoiceData.items.length
    });
    
    return total;
  };

  const correctGrandTotal = getCorrectGrandTotal();
  const orderMode = (editableOrderMode || invoiceData?.order_mode || "PAKKA").toUpperCase();

  if (!invoiceData) return null;

  return (
    <Card className="shadow-sm border-0 mb-3 qr-code-card">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaQrcode className="me-2" /> Scan to Pay</h5>
      </Card.Header>
      <Card.Body className="qr-code-body">
        <div className="text-center mb-3">
          <div className="qr-code-box d-inline-block">
            {generateQRCodeData() ? (
              <QRCodeCanvas 
                value={generateQRCodeData()}
                size={200}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="p-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Generating QR...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Amount Display */}
          <div className="mt-3">
            <h3 className="text-success fw-bold">₹{correctGrandTotal.toFixed(2)}</h3>
            <span className={`badge ${orderMode === "KACHA" ? "bg-warning" : "bg-success"} px-3 py-2 mt-2`} style={{ fontSize: '14px' }}>
              {orderMode} ORDER
            </span>
          </div>

        </div>
      </Card.Body>
    </Card>
  );
};

export default QRCodeGenerator;