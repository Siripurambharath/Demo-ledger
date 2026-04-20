import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet
} from '@react-pdf/renderer';

// Create styles matching the preview design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: '1pt solid #e0e0e0',
  },
  companyInfo: {
    flex: 2,
  },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  companyDetails: {
    fontSize: 9,
    color: '#6c757d',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#dc3545',
    textAlign: 'center',
  },
  invoiceDetails: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  addressSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  addressBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 3,
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
    paddingBottom: 4,
    borderBottom: '1pt solid #007bff',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottom: '1pt solid #dee2e6',
  },
  tableHeader: {
    backgroundColor: '#007bff',
    borderBottom: '2pt solid #0056b3',
  },
  tableColHeader: {
    width: '6%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableCol: {
    width: '6%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColHeaderProduct: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColProduct: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColHeaderDesc: {
    width: '28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColDesc: {
    width: '28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColHeaderQty: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColQty: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColHeaderPrice: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColPrice: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColHeaderGst: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColGst: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColHeaderAmount: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableColAmount: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#2c3e50',
  },
  tableCellProduct: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#2c3e50',
  },
  tableCellCenter: {
    textAlign: 'center',
    fontSize: 9,
    lineHeight: 1.3,
    color: '#2c3e50',
  },
  tableCellRight: {
    textAlign: 'right',
    fontSize: 9,
    lineHeight: 1.3,
    color: '#2c3e50',
  },
  batchText: {
    fontSize: 7,
    color: '#6c757d',
    marginTop: 2,
  },
  totalsSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  notesSection: {
    flex: 2,
  },
  notesBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 120,
  },
  amountSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: '0.5pt solid #e9ecef',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '2pt solid #007bff',
    paddingTop: 8,
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    paddingTop: 15,
    borderTop: '1pt solid #e0e0e0',
  },
  bankDetails: {
    flex: 1,
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
  },
  bankText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 3,
    color: '#495057',
  },
  signature: {
    alignItems: 'flex-end',
    flex: 1,
  },
  signatureBox: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 180,
    borderBottom: '1pt solid #2c3e50',
    marginBottom: 4,
    marginTop: 20,
  },
  signatureText: {
    fontSize: 9,
    color: '#495057',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textPrimary: {
    color: '#007bff',
  },
  textSuccess: {
    color: '#28a745',
  },
  textMuted: {
    color: '#6c757d',
  },
  mb1: {
    marginBottom: 5,
  },
  mb2: {
    marginBottom: 10,
  },
});

// Safe data access helper
const getSafeData = (data, path, defaultValue = '') => {
  try {
    const keys = path.split('.');
    let result = data;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined || result === null) return defaultValue;
    }
    return result || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const InvoicePDFDocument = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState }) => {
  // Safe data access with fallbacks
  const currentData = invoiceData || {};
  const companyInfo = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo = getSafeData(currentData, 'supplierInfo', {});
  const shippingAddress = getSafeData(currentData, 'shippingAddress', {});
  const items = getSafeData(currentData, 'items', []);
  
  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate') 
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString() 
    : 'N/A';
  const dueDate = getSafeData(currentData, 'validityDate') 
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString() 
    : 'N/A';

  // Calculate totals from items to ensure accuracy
  const calculateTotals = () => {
    let taxableAmount = 0;
    let totalGST = 0;
    let totalCess = 0;
    let grandTotal = 0;

    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 0));
      const price = parseFloat(getSafeData(item, 'price', 0));
      const discountPercent = parseFloat(getSafeData(item, 'discount', 0));
      const gstPercent = parseFloat(getSafeData(item, 'gst', 0));
      const cessPercent = parseFloat(getSafeData(item, 'cess', 0));
      
      const itemTotal = quantity * price;
      const discountAmount = itemTotal * (discountPercent / 100);
      const taxableValue = itemTotal - discountAmount;
      const gstAmount = taxableValue * (gstPercent / 100);
      const cessAmount = taxableValue * (cessPercent / 100);
      
      taxableAmount += taxableValue;
      totalGST += gstAmount;
      totalCess += cessAmount;
      grandTotal += taxableValue + gstAmount + cessAmount;
    });

    // Add additional charges if any
    const additionalChargeAmount = parseFloat(getSafeData(currentData, 'additionalChargeAmount', 0));
    grandTotal += additionalChargeAmount;

    return { 
      taxableAmount: taxableAmount.toFixed(2), 
      totalGST: totalGST.toFixed(2), 
      totalCess: totalCess.toFixed(2), 
      grandTotal: grandTotal.toFixed(2) 
    };
  };

  const { taxableAmount, totalGST, totalCess, grandTotal } = calculateTotals();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{getSafeData(companyInfo, 'name', 'Company Name')}</Text>
            <Text style={styles.companyDetails}>{getSafeData(companyInfo, 'address', 'Company Address')}</Text>
            <Text style={styles.companyDetails}>
              Email: {getSafeData(companyInfo, 'email', 'N/A')} | Phone: {getSafeData(companyInfo, 'phone', 'N/A')} | GSTIN: {getSafeData(companyInfo, 'gstin', 'N/A')}
            </Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceDetails}><Text style={styles.textBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.invoiceDetails}><Text style={styles.textBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text style={styles.invoiceDetails}><Text style={styles.textBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={[styles.addressText, styles.textBold]}>{getSafeData(supplierInfo, 'name', 'Supplier Name')}</Text>
            <Text style={styles.addressText}>{getSafeData(supplierInfo, 'businessName', '')}</Text>
            <Text style={styles.addressText}>GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}</Text>
            <Text style={styles.addressText}>State: {getSafeData(supplierInfo, 'state', 'N/A')}</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'addressLine1', 'N/A')}</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'addressLine2', '')}</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'state', '')}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Item Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>#</Text></View>
              <View style={styles.tableColHeaderProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
              <View style={styles.tableColHeaderDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
              <View style={styles.tableColHeaderQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
              <View style={styles.tableColHeaderPrice}><Text style={styles.tableCellHeader}>Price (₹)</Text></View>
              <View style={styles.tableColHeaderGst}><Text style={styles.tableCellHeader}>GST %</Text></View>
              <View style={styles.tableColHeaderAmount}><Text style={styles.tableCellHeader}>Amount (₹)</Text></View>
            </View>

            {/* Table Rows */}
            {items.map((item, index) => {
              const quantity = parseFloat(getSafeData(item, 'quantity', 0));
              const price = parseFloat(getSafeData(item, 'price', 0));
              const discountPercent = parseFloat(getSafeData(item, 'discount', 0));
              const gstPercent = parseFloat(getSafeData(item, 'gst', 0));
              const cessPercent = parseFloat(getSafeData(item, 'cess', 0));
              
              const itemTotal = quantity * price;
              const discountAmount = itemTotal * (discountPercent / 100);
              const taxableValue = itemTotal - discountAmount;
              const gstAmount = taxableValue * (gstPercent / 100);
              const cessAmount = taxableValue * (cessPercent / 100);
              const itemGrandTotal = taxableValue + gstAmount + cessAmount;

              return (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableCol}><Text style={styles.tableCellCenter}>{index + 1}</Text></View>
                  <View style={styles.tableColProduct}>
                    <Text style={styles.tableCellProduct}>{getSafeData(item, 'product', 'Product')}</Text>
                    {getSafeData(item, 'batch') && (
                      <Text style={styles.batchText}>
                        Batch: {getSafeData(item, 'batch')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.tableColDesc}><Text style={styles.tableCell}>{getSafeData(item, 'description', 'Description')}</Text></View>
                  <View style={styles.tableColQty}><Text style={styles.tableCellCenter}>{quantity}</Text></View>
                  <View style={styles.tableColPrice}><Text style={styles.tableCellRight}>₹{price.toFixed(2)}</Text></View>
                  <View style={styles.tableColGst}><Text style={styles.tableCellCenter}>{gstPercent}%</Text></View>
                  <View style={styles.tableColAmount}><Text style={[styles.tableCellRight, styles.textBold]}>₹{itemGrandTotal.toFixed(2)}</Text></View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, styles.mb1]}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.tableCell}>
                {getSafeData(currentData, 'note', 'Thank you for your business! We appreciate your timely payment.')}
              </Text>
            </View>
            
            <Text style={[styles.sectionTitle, styles.mb1, styles.mt2]}>Transportation Details:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.tableCell}>
                {getSafeData(currentData, 'transportDetails', 'Standard delivery. Contact us for tracking information.')}
              </Text>
            </View>
          </View>
          
          <View style={styles.amountSection}>
            <Text style={styles.amountTitle}>Amount Summary</Text>
            
            <View style={styles.amountRow}>
              <Text style={styles.tableCell}>Taxable Amount:</Text>
              <Text style={styles.tableCellRight}>₹{taxableAmount}</Text>
            </View>
            
            {isSameState ? (
              <>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>CGST:</Text>
                  <Text style={styles.tableCellRight}>₹{(parseFloat(totalGST) / 2).toFixed(2)}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>SGST:</Text>
                  <Text style={styles.tableCellRight}>₹{(parseFloat(totalGST) / 2).toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.amountRow}>
                <Text style={styles.tableCell}>IGST:</Text>
                <Text style={styles.tableCellRight}>₹{totalGST}</Text>
              </View>
            )}
            
            <View style={styles.amountRow}>
              <Text style={styles.tableCell}>Total GST:</Text>
              <Text style={styles.tableCellRight}>₹{totalGST}</Text>
            </View>
            
            {parseFloat(totalCess) > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.tableCell}>Total Cess:</Text>
                <Text style={styles.tableCellRight}>₹{totalCess}</Text>
              </View>
            )}
            
            {getSafeData(currentData, 'additionalCharge') && parseFloat(getSafeData(currentData, 'additionalChargeAmount', 0)) > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.tableCell}>{getSafeData(currentData, 'additionalCharge')}:</Text>
                <Text style={styles.tableCellRight}>₹{parseFloat(getSafeData(currentData, 'additionalChargeAmount', 0)).toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.grandTotal}>
              <Text style={[styles.tableCell, styles.textBold]}>Grand Total:</Text>
              <Text style={[styles.tableCellRight, styles.textBold, styles.textSuccess]}>
                ₹{grandTotal}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            <Text style={styles.bankText}>Account Name: {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
            <Text style={styles.bankText}>Account Number: XXXX XXXX XXXX</Text>
            <Text style={styles.bankText}>IFSC Code: XXXX0123456</Text>
            <Text style={styles.bankText}>Bank Name: Sample Bank</Text>
          </View>
          
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFDocument;