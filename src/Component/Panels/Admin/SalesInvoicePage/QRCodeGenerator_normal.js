import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { FaQrcode } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import './QRCodeGenerator_normal.css';

const QRCodeGenerator_normal = ({ invoiceData, onQrDataGenerated }) => {
  
  const [qrValue, setQrValue] = useState('');
  const [displayAmount, setDisplayAmount] = useState(0);

  const calculateGrandTotal = () => {
    if (!invoiceData || !invoiceData.items) {
      console.log('❌ No invoice data or items for QR calculation');
      return 0;
    }
    
    // ✅ Use the grandTotal from invoiceData directly
    // This ensures QR code matches the invoice grand total
    const grandTotal = parseFloat(invoiceData.grandTotal) || 0;
    
    console.log('💰 QR Code Grand Total from invoice:', grandTotal);
    console.log('💰 Invoice Data:', {
      taxableAmount: invoiceData.taxableAmount,
      totalGST: invoiceData.totalGST,
      discountAmount: invoiceData.discount_charges_amount,
      discountType: invoiceData.discount_charges,
      additionalCharge: invoiceData.additionalChargeAmount,
      grandTotal: invoiceData.grandTotal
    });
    
    return grandTotal;
  };

  const generateQRCodeData = () => {
    if (!invoiceData) {
      console.log('❌ No invoice data available for QR code');
      return '';
    }
    
    try {
      // ✅ Use the same grandTotal from invoice
      const amount = calculateGrandTotal();
      setDisplayAmount(amount);
      
      // Format amount with 2 decimal places
      const formattedAmount = amount.toFixed(2);
      
      console.log('📊 QR Code Amount (Grand Total):', formattedAmount);
      
      // UPI ID
      const upiId = 'shreeshashwatrajagroprivatelimited@sbi';
      
      // Merchant name
      const merchantName = invoiceData.companyInfo?.name?.replace(/[^a-zA-Z0-9 ]/g, '') || 'Business';
      
      // Invoice number
      const invoiceNumber = invoiceData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`;
      
      // Transaction note
      let transactionNote = `Payment for Invoice ${invoiceNumber}`;
      
      // Create UPI URL with correct amount
      const upiParams = new URLSearchParams({
        pa: upiId,
        pn: merchantName,
        am: formattedAmount,
        tn: transactionNote,
        cu: 'INR'
      });
      
      const upiUrl = `upi://pay?${upiParams.toString()}`;
      
      console.log('✅ Generated UPI URL with amount:', formattedAmount);
      
      // Callback to parent
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
    if (invoiceData) {
      const amount = calculateGrandTotal();
      setDisplayAmount(amount);
      
      const timer = setTimeout(() => {
        const qrData = generateQRCodeData();
        setQrValue(qrData);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [invoiceData, invoiceData?.grandTotal]);

  if (!invoiceData) return null;

  // ✅ Use the grandTotal from invoiceData
  const grandTotal = parseFloat(invoiceData.grandTotal) || 0;

  return (
    <Card className="shadow-sm border-0 mb-3 qr-code-card">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaQrcode className="me-2" /> Scan to Pay</h5>
      </Card.Header>
      <Card.Body className="qr-code-body">
        <div className="text-center mb-3">
          <div className="qr-code-box d-inline-block">
            {qrValue ? (
              <QRCodeCanvas 
                value={qrValue}
                size={180}
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
          
          <div className="mt-3">
            <h3 className="text-success fw-bold">₹{grandTotal.toFixed(2)}</h3>
          
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QRCodeGenerator_normal;