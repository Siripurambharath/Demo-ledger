import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 8,
    fontFamily: 'NotoSans',
    width: '100%',
    minHeight: '100%',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: '1pt solid #e0e0e0',
  },
  companyInfo: {
    flex: 2,
  },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 3,
    border: '1pt solid #dee2e6',
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#2c3e50',
  },
  companyAddress: {
    fontSize: 7,
    color: '#666666',
    marginBottom: 2,
    lineHeight: 1.2,
  },
  invoiceTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#dc3545',
    textAlign: 'center',
  },
  
  addressSection: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  addressBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 3,
    border: '1pt solid #dee2e6',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
    borderBottom: '1pt solid #007bff',
    paddingBottom: 2,
  },
  addressText: {
    fontSize: 7,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  
  salesPersonSection: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 5,
    borderRadius: 3,
    border: '1pt solid #dee2e6',
    gap: 8,
  },
  salesPersonLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666666',
  },
  salesPersonName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#007bff',
  },
  
  itemsSection: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
    paddingBottom: 3,
    borderBottom: '1pt solid #007bff',
  },
  
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#dee2e6',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dee2e6',
    minHeight: 22,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 0.5,
    borderBottomColor: '#212529',
  },
  
  colSNo: { width: '5%', padding: 3 },
  colProduct: { width: '18%', padding: 3 },
  colHsn: { width: '8%', padding: 3 },
  colQuantity: { width: '10%', padding: 3 },
  colRateIncl: { width: '10%', padding: 3 },
  colRateExcl: { width: '10%', padding: 3 },
  colDiscount: { width: '7%', padding: 3 },
  colGST: { width: '7%', padding: 3 },
  colTotal: { width: '12%', padding: 3 },
  
  tableCell: {
    fontSize: 7,
    lineHeight: 1.2,
    color: '#2c3e50',
  },
  tableCellHeader: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellBold: {
    fontWeight: 'bold',
  },
  
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  col: {
    flex: 1,
  },
  
  notesBox: {
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 3,
    border: '0.5pt solid #dee2e6',
    minHeight: 60,
  },
  
  amountSection: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 3,
    border: '0.5pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
    textAlign: 'center',
    borderBottom: '0.5pt solid #dee2e6',
    paddingBottom: 3,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: '0.5pt dotted #e9ecef',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1.5pt solid #007bff',
    paddingTop: 5,
    marginTop: 5,
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  
  transportBox: {
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 3,
    border: '0.5pt solid #dee2e6',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  qrSection: {
    backgroundColor: '#f0f8ff',
    padding: 5,
    borderRadius: 3,
    border: '0.5pt solid #007bff',
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 3,
    textAlign: 'center',
  },
  qrImage: {
    width: 50,
    height: 50,
  },
  qrAmount: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 3,
    textAlign: 'center',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingTop: 10,
    borderTop: '0.5pt solid #e0e0e0',
    gap: 8,
  },
  bankDetails: {
    flex: 1.2,
  },
  bankTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007bff',
  },
  bankText: {
    fontSize: 6.5,
    lineHeight: 1.2,
    marginBottom: 1.5,
  },
  signature: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  signatureBox: {
    alignItems: 'center',
    width: 100,
  },
  signatureLine: {
    width: 90,
    marginBottom: 3,
    marginTop: 12,
    borderBottom: '0.5pt solid #000',
  },
});

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

const SalesPdfDocument = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState, qrDataUrl, qrAmount, unitData }) => {
  const currentData = invoiceData || {};
  const companyInfo = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo = getSafeData(currentData, 'supplierInfo', {});
  const shippingAddress = getSafeData(currentData, 'shippingAddress', {});
  const items = getSafeData(currentData, 'items', []);
  
  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate') 
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');
    
  const dueDate = getSafeData(currentData, 'validityDate') 
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString('en-IN') 
    : 'N/A';
  
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              SHREE SHASHWATRAJ AGRO PVT LTD
            </Text>
            <Text style={styles.companyAddress}>
              Growth Center, Jasoiya, Aurangabad, Bihar - 824101
            </Text>
            <Text style={styles.companyAddress}>
              GSTIN/UIN: 10AAOCS1541B1ZZ
            </Text>
            <Text style={styles.companyAddress}>
              State Name: Bihar | Code: 10
            </Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.addressText}><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.addressText}><Text style={styles.tableCellBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text style={styles.addressText}><Text style={styles.tableCellBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>
        
        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={[styles.addressText, styles.tableCellBold]}>
              {getSafeData(supplierInfo, 'name', 'Customer')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(supplierInfo, 'business_name', '')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(supplierInfo, 'mobile_number') || getSafeData(supplierInfo, 'phone_number', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              State: {getSafeData(supplierInfo, 'state', 'N/A')}
            </Text>
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'addressLine1', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'addressLine2', '')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'state', '')}
            </Text>
          </View>
        </View>
        
        {/* Sales Person */}
        {getSafeData(currentData, 'assigned_staff') && getSafeData(currentData, 'assigned_staff') !== 'N/A' && (
          <View style={styles.salesPersonSection}>
            <Text style={styles.salesPersonLabel}>Sales Person:</Text>
            <Text style={styles.salesPersonName}>
              {getSafeData(currentData, 'assigned_staff')}
            </Text>
          </View>
        )}
        
        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items Details</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.colSNo}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>#</Text></View>
              <View style={styles.colProduct}><Text style={[styles.tableCellHeader, styles.tableCellLeft]}>Product</Text></View>
              <View style={styles.colHsn}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>HSN</Text></View>
              <View style={styles.colQuantity}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>Units</Text></View>
              <View style={styles.colRateIncl}><Text style={[styles.tableCellHeader, styles.tableCellRight]}>Rate (Incl of Tax)</Text></View>
              <View style={styles.colRateExcl}><Text style={[styles.tableCellHeader, styles.tableCellRight]}>Rate (Excl of Tax)</Text></View>
              <View style={styles.colDiscount}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>Disc%</Text></View>
              <View style={styles.colGST}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>GST%</Text></View>
              <View style={styles.colTotal}><Text style={[styles.tableCellHeader, styles.tableCellRight]}>Amount</Text></View>
            </View>
            
            {/* Table Rows */}
            {items.map((item, index) => {
              const quantity = parseFloat(getSafeData(item, 'quantity', 1));
              const price = parseFloat(getSafeData(item, 'price', 0));
              const originalPrice = parseFloat(getSafeData(item, 'original_price', price));
              const gst = parseFloat(getSafeData(item, 'gst', 0));
              const discount = parseFloat(getSafeData(item, 'discount', 0));
              const hsnCode = getSafeData(item, 'hsn_code', '');
              // ✅ Get unit_name from item or fallback to unitData mapping
              const unitName = getSafeData(item, 'unit_name') || (unitData && unitData[item.unit_id]) || '';
              
              const subtotal = quantity * price;
              const discountAmount = subtotal * (discount / 100);
              const amountAfterDiscount = subtotal - discountAmount;
              const gstAmount = amountAfterDiscount * (gst / 100);
              const itemTotal = amountAfterDiscount + gstAmount;
              
              // ✅ Quantity with Unit Name combined
              const quantityDisplay = unitName && unitName !== 'null' && unitName !== ''
                ? `${quantity} ${unitName}`
                : quantity.toString();
              
              return (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.colSNo}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{index + 1}</Text>
                  </View>
                  <View style={styles.colProduct}>
                    <Text style={[styles.tableCell, styles.tableCellLeft, styles.tableCellBold]}>
                      {getSafeData(item, 'product', `Item ${index + 1}`).substring(0, 20)}
                    </Text>
                  </View>
                  <View style={styles.colHsn}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>
                      {hsnCode || '-'}
                    </Text>
                  </View>
                  <View style={styles.colQuantity}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>
                      {quantityDisplay}
                    </Text>
                  </View>
                  <View style={styles.colRateIncl}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>
                      ₹{originalPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.colRateExcl}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>₹{price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colDiscount}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{discount}%</Text>
                  </View>
                  <View style={styles.colGST}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{gst}%</Text>
                  </View>
                  <View style={styles.colTotal}>
                    <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>
                      ₹{itemTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* ROW 1: Notes + Amount Summary */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.addressText}>
                {getSafeData(currentData, 'note', 'Thank you for your business!')}
              </Text>
            </View>
          </View>
          
          <View style={styles.col}>
            <View style={styles.amountSection}>
              <Text style={styles.amountTitle}>Amount Summary</Text>
              
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Taxable Amount:</Text>
                <Text style={styles.amountValue}>₹{getSafeData(currentData, 'taxableAmount', '0.00')}</Text>
              </View>
              
              {isSameState ? (
                <>
                  <View style={styles.amountRow}>
                    <Text style={styles.addressText}>CGST:</Text>
                    <Text style={styles.addressText}>₹{gstBreakdown?.totalCGST || '0.00'}</Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.addressText}>SGST:</Text>
                    <Text style={styles.addressText}>₹{gstBreakdown?.totalSGST || '0.00'}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.amountRow}>
                  <Text style={styles.addressText}>IGST:</Text>
                  <Text style={styles.addressText}>₹{gstBreakdown?.totalIGST || '0.00'}</Text>
                </View>
              )}
              
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total GST:</Text>
                <Text style={[styles.amountValue, { color: '#28a745' }]}>
                  ₹{getSafeData(currentData, 'totalGST', '0.00')}
                </Text>
              </View>
              
              <View style={styles.grandTotal}>
                <Text style={styles.amountLabel}>Grand Total:</Text>
                <Text style={[styles.amountValue, { color: '#28a745', fontSize: 9 }]}>
                  ₹{getSafeData(currentData, 'grandTotal', '0.00')}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* ROW 2: Transport Details + QR Code */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Transport Details:</Text>
            <View style={styles.transportBox}>
              <View style={styles.transportRow}>
                <Text style={[styles.addressText, { fontWeight: 'bold' }]}>Transport:</Text>
                <Text style={styles.addressText}>
                  {getSafeData(currentData, 'transportDetails.transport') || '-'}
                </Text>
              </View>
              <View style={styles.transportRow}>
                <Text style={[styles.addressText, { fontWeight: 'bold' }]}>GR/RR No.:</Text>
                <Text style={styles.addressText}>
                  {getSafeData(currentData, 'transportDetails.grNumber') || '-'}
                </Text>
              </View>
              <View style={styles.transportRow}>
                <Text style={[styles.addressText, { fontWeight: 'bold' }]}>Vehicle No.:</Text>
                <Text style={styles.addressText}>
                  {getSafeData(currentData, 'transportDetails.vehicleNo') || '-'}
                </Text>
              </View>
              <View style={styles.transportRow}>
                <Text style={[styles.addressText, { fontWeight: 'bold' }]}>Station:</Text>
                <Text style={styles.addressText}>
                  {getSafeData(currentData, 'transportDetails.station') || '-'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.col}>
            {qrDataUrl && (
              <View style={styles.qrSection}>
                <Text style={styles.qrTitle}>Scan to Pay</Text>
                <Image src={qrDataUrl} style={styles.qrImage} />
                <Text style={styles.qrAmount}>
                  ₹{(qrAmount || parseFloat(getSafeData(currentData, 'grandTotal', 0))).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            <Text style={styles.bankText}>SHREE SHASHWATRAJ AGRO PVT LTD</Text>
            <Text style={styles.bankText}>SBI - SME AURANGABAD</Text>
            <Text style={styles.bankText}>A/C: 44773710377</Text>
            <Text style={styles.bankText}>IFSC: SBIN0063699</Text>
          </View>
          
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.bankText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
              <View style={styles.signatureLine} />
              <Text style={[styles.bankText, { marginTop: 3 }]}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SalesPdfDocument;