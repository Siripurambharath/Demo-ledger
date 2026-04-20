import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet
} from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
  },
  companyInfo: {
    flex: 2,
  },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#dc3545',
    textAlign: 'center',
  },
  addressSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  addressBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '7%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#343a40',
    padding: 5,
  },
  tableCol: {
    width: '7%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColHeaderProduct: {
    width: '18%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#343a40',
    padding: 5,
  },
  tableColProduct: {
    width: '18%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColHeaderDesc: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#343a40',
    padding: 5,
  },
  tableColDesc: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColHeaderPrice: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#343a40',
    padding: 5,
  },
  tableColPrice: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColHeaderAmount: {
    width: '13%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#343a40',
    padding: 5,
  },
  tableColAmount: {
    width: '13%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tableCell: {
    margin: 'auto',
    fontSize: 8,
    lineHeight: 1.2,
  },
  tableCellProduct: {
    fontSize: 8,
    lineHeight: 1.2,
  },
  tableCellCenter: {
    textAlign: 'center',
    fontSize: 8,
    lineHeight: 1.2,
  },
  tableCellRight: {
    textAlign: 'right',
    fontSize: 8,
    lineHeight: 1.2,
  },
  totalsSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  notesSection: {
    flex: 2,
    marginRight: 10,
  },
  amountSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #000',
    paddingTop: 5,
    marginTop: 5,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTop: '1pt solid #000',
    paddingTop: 10,
  },
  signature: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    borderBottom: '1pt solid #000',
    marginBottom: 5,
  },
  textBold: {
    fontWeight: 'bold',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textSuccess: {
    color: '#28a745',
  },
  mb1: {
    marginBottom: 5,
  },
  mb2: {
    marginBottom: 10,
  },
});

// Create Document Component
const InvoicePDFDocument = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState }) => {
  // Safe data access with fallbacks
  const currentData = invoiceData || {};
  const companyInfo = currentData.companyInfo || {};
  const supplierInfo = currentData.supplierInfo || {};
  const shippingAddress = currentData.shippingAddress || {};
  const items = currentData.items || [];
  
  const displayInvoiceNumber = invoiceNumber || currentData.invoiceNumber || 'INV001';
  const invoiceDate = currentData.invoiceDate ? new Date(currentData.invoiceDate).toLocaleDateString() : 'N/A';
  const dueDate = currentData.validityDate ? new Date(currentData.validityDate).toLocaleDateString() : 'N/A';

  // Calculate totals from items
  const calculateTotals = () => {
    let taxableAmount = 0;
    let totalGST = 0;
    let totalCess = 0;
    let grandTotal = 0;

    items.forEach(item => {
      const quantity = parseFloat(item.quantity || 0);
      const price = parseFloat(item.price || 0);
      const discountPercent = parseFloat(item.discount || 0);
      const gstPercent = parseFloat(item.gst || 0);
      const cessPercent = parseFloat(item.cess || 0);
      
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
    const additionalChargeAmount = parseFloat(currentData.additionalChargeAmount || 0);
    grandTotal += additionalChargeAmount;

    return { taxableAmount, totalGST, totalCess, grandTotal };
  };

  const { taxableAmount, totalGST, totalCess, grandTotal } = calculateTotals();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyInfo.name || 'Company Name'}</Text>
            <Text style={styles.mb1}>{companyInfo.address || 'Company Address'}</Text>
            <Text style={styles.mb1}>Email: {companyInfo.email || 'N/A'}</Text>
            <Text style={styles.mb1}>Phone: {companyInfo.phone || 'N/A'}</Text>
            <Text>GSTIN: {companyInfo.gstin || 'N/A'}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.mb1}><Text style={styles.textBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.mb1}><Text style={styles.textBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text><Text style={styles.textBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.textBold}>{supplierInfo.name || 'Supplier Name'}</Text>
            <Text style={styles.mb1}>{supplierInfo.businessName || ''}</Text>
            <Text style={styles.mb1}>GSTIN: {supplierInfo.gstin || 'N/A'}</Text>
            <Text>State: {supplierInfo.state || 'N/A'}</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.mb1}>{shippingAddress.addressLine1 || 'N/A'}</Text>
            <Text style={styles.mb1}>{shippingAddress.addressLine2 || ''}</Text>
            <Text style={styles.mb1}>{shippingAddress.city || ''} - {shippingAddress.pincode || ''}</Text>
            <Text>{shippingAddress.state || ''}</Text>
          </View>
        </View>

        {/* Items Table */}
        <Text style={[styles.sectionTitle, styles.mb2]}>Items Details</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>#</Text></View>
            <View style={styles.tableColHeaderProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
            <View style={styles.tableColHeaderDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Qty</Text></View>
            <View style={styles.tableColHeaderPrice}><Text style={styles.tableCellHeader}>Price</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Disc %</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>GST %</Text></View>
            <View style={styles.tableColHeaderAmount}><Text style={styles.tableCellHeader}>Amount</Text></View>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => {
            const quantity = parseFloat(item.quantity || 0);
            const price = parseFloat(item.price || 0);
            const discountPercent = parseFloat(item.discount || 0);
            const gstPercent = parseFloat(item.gst || 0);
            const cessPercent = parseFloat(item.cess || 0);
            
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
                  <Text style={styles.tableCellProduct}>{item.product || 'Product'}</Text>
                  {item.batch && (
                    <Text style={[styles.tableCellProduct, { fontSize: 7, color: '#666' }]}>
                      Batch: {item.batch}
                    </Text>
                  )}
                </View>
                <View style={styles.tableColDesc}><Text style={styles.tableCell}>{item.description || 'Description'}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCellCenter}>{quantity}</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCellRight}>₹{price.toFixed(2)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCellCenter}>{discountPercent}%</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCellCenter}>{gstPercent}%</Text></View>
                <View style={styles.tableColAmount}><Text style={[styles.tableCellRight, styles.textBold]}>₹{itemGrandTotal.toFixed(2)}</Text></View>
              </View>
            );
          })}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, styles.mb1]}>Notes:</Text>
            <Text style={styles.mb2}>
              {currentData.note || 'Thank you for your business! We appreciate your timely payment.'}
            </Text>
            
            <Text style={[styles.sectionTitle, styles.mb1]}>Transportation Details:</Text>
            <Text>
              {currentData.transportDetails || 'Standard delivery. Contact us for tracking information.'}
            </Text>
          </View>
          
          <View style={styles.amountSection}>
            <Text style={[styles.sectionTitle, styles.mb2]}>Amount Summary</Text>
            
            <View style={styles.amountRow}>
              <Text>Taxable Amount:</Text>
              <Text>₹{taxableAmount.toFixed(2)}</Text>
            </View>
            
            {isSameState ? (
              <>
                <View style={styles.amountRow}>
                  <Text>CGST:</Text>
                  <Text>₹{(totalGST / 2).toFixed(2)}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text>SGST:</Text>
                  <Text>₹{(totalGST / 2).toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.amountRow}>
                <Text>IGST:</Text>
                <Text>₹{totalGST.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.amountRow}>
              <Text>Total GST:</Text>
              <Text>₹{totalGST.toFixed(2)}</Text>
            </View>
            
            <View style={styles.amountRow}>
              <Text>Total Cess:</Text>
              <Text>₹{totalCess.toFixed(2)}</Text>
            </View>
            
            {currentData.additionalCharge && (
              <View style={styles.amountRow}>
                <Text>{currentData.additionalCharge}:</Text>
                <Text>₹{parseFloat(currentData.additionalChargeAmount || 0).toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.grandTotal}>
              <Text style={styles.textBold}>Grand Total:</Text>
              <Text style={[styles.textBold, styles.textSuccess]}>
                ₹{grandTotal.toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.mb1, { marginTop: 10, padding: 5, border: '1pt solid #ddd' }]}>
              <Text style={{ fontSize: 7 }}>
                <Text style={styles.textBold}>Tax Summary: </Text>
                {isSameState 
                  ? `CGST + SGST = ₹${totalGST.toFixed(2)}`
                  : `IGST = ₹${totalGST.toFixed(2)}`
                }
                {totalCess > 0 ? `, Cess = ₹${totalCess.toFixed(2)}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={[styles.sectionTitle, styles.mb1]}>Bank Details:</Text>
            <Text style={styles.mb1}>Account Name: {companyInfo.name || 'Company Name'}</Text>
            <Text style={styles.mb1}>Account Number: XXXX XXXX XXXX</Text>
            <Text style={styles.mb1}>IFSC Code: XXXX0123456</Text>
            <Text>Bank Name: Sample Bank</Text>
          </View>
          
          <View style={styles.signature}>
            <Text style={styles.mb1}>For {companyInfo.name || 'Company Name'}</Text>
            <View style={styles.signatureLine} />
            <Text>Authorized Signatory</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={{ marginTop: 15, paddingTop: 10, borderTop: '1pt solid #000' }}>
          <Text style={[styles.sectionTitle, styles.mb1]}>Terms & Conditions:</Text>
          <Text style={{ fontSize: 7 }}>
            • Payment due within 30 days of invoice date • Late payment interest @ 1.5% per month • 
            Goods once sold will not be taken back • All disputes subject to local jurisdiction
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFDocument;