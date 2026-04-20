import { pdf } from '@react-pdf/renderer';
import InvoicePDFDocument from '../components/InvoicePDFDocument';
import { baseurl } from '../../../BaseURL/BaseURL';

export const downloadInvoicePDF = async (invoiceData, invoiceNumber, gstBreakdown, isSameState) => {
  try {
    const filename = `Invoice_${invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Create PDF blob using react-pdf
    const blob = await pdf(
      <InvoicePDFDocument 
        invoiceData={invoiceData}
        invoiceNumber={invoiceNumber}
        gstBreakdown={gstBreakdown}
        isSameState={isSameState}
      />
    ).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Convert blob to base64 for storage
    const base64PDF = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
    
    // Store in voucher table
    await storePDFInVoucher(base64PDF, filename, invoiceNumber, invoiceData);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const storePDFInVoucher = async (pdfBlob, filename, invoiceNumber, invoiceData) => {
  try {
    const voucherData = {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      totalAmount: invoiceData.grandTotal,
      pdfData: pdfBlob,
      fileName: filename,
      createdAt: new Date().toISOString()
    };
    
    // Call your API to store in voucher table
    const response = await fetch(`${baseurl}/api/vouchers/store-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voucherData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('PDF stored successfully in voucher table:', result);
      return result;
    } else {
      const errorData = await response.json();
      console.error('Failed to store PDF in voucher table:', errorData);
      throw new Error(errorData.message || 'Failed to store PDF');
    }
  } catch (error) {
    console.error('Error storing PDF in voucher:', error);
    throw error;
  }
};

export const downloadExistingPDF = async (invoiceNumber) => {
  try {
    const response = await fetch(`${baseurl}/api/vouchers/pdf/${invoiceNumber}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch PDF');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'PDF not found');
    }
    
    // Convert base64 to blob and download
    const base64Response = await fetch(result.pdfData);
    const blob = await base64Response.blob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, filename: result.fileName };
  } catch (error) {
    console.error('Error downloading existing PDF:', error);
    throw error;
  }
};