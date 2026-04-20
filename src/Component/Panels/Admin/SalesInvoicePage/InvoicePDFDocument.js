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
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '1pt solid #e0e0e0',
  },
  companyInfo: {
    flex: 2,
  },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  companyAddress: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#dc3545',
    textAlign: 'center',
  },
  
  // Address Section
  addressSection: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  addressBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
    borderBottom: '1pt solid #007bff',
    paddingBottom: 3,
  },
  addressText: {
    fontSize: 8,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  
  // Sales Person Section
  salesPersonSection: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  
  // Order Mode Section
  orderModeSection: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#f0f8ff',
    padding: 5,
    borderRadius: 4,
    border: '1pt solid #007bff',
  },
  orderModeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#007bff',
  },
  
  // Items Table
  itemsSection: {
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
    paddingBottom: 4,
    borderBottom: '1pt solid #007bff',
  },
  
  // Table Styles
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
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 2,
    borderBottomColor: '#212529',
    minHeight: 25,
  },
  
  // Column widths
  colSNo: { width: '3%', padding: 2 },
  colProduct: { width: '12%', padding: 2 },
  colDesc: { width: '12%', padding: 2 },
  colQty: { width: '4%', padding: 2 },
  colFreeQty: { width: '4%', padding: 2 },
  colPrice: { width: '7%', padding: 2 },
  colDiscount: { width: '7%', padding: 2 },
  colCreditCharge: { width: '7%', padding: 2 },
  colTaxable: { width: '8%', padding: 2 },
  colGSTPercent: { width: '5%', padding: 2 },
  colGSTAmt: { width: '7%', padding: 2 },
  colCGST: { width: '7%', padding: 2 },
  colSGST: { width: '7%', padding: 2 },
  colTotal: { width: '8%', padding: 2 },
  
  // Table cell styles
  tableCell: {
    fontSize: 7,
    lineHeight: 1.3,
    color: '#2c3e50',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableCellBold: {
    fontWeight: 'bold',
  },
  
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  notesSection: {
    flex: 2,
  },
  notesBox: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 80,
  },
  
  // ✅ ADD TRANSPORT STYLES
  transportBox: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    marginTop: 8,
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  transportLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#007bff',
  },
  transportValue: {
    fontSize: 8,
    color: '#333333',
  },
  
  amountSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
    textAlign: 'center',
    borderBottom: '1pt solid #dee2e6',
    paddingBottom: 5,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: '0.5pt dotted #e9ecef',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '2pt solid #007bff',
    paddingTop: 8,
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1pt solid #e0e0e0',
  },
  bankDetails: {
    flex: 1,
  },
  bankTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
  },
  bankText: {
    fontSize: 8,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  signature: {
    alignItems: 'flex-end',
    flex: 1,
  },
  signatureBox: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    width: 180,
    marginBottom: 5,
    marginTop: 20,
    borderBottom: '1pt solid #000',
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

const InvoicceprintOrder = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState }) => {
  const currentData = invoiceData || {};
  const companyInfo = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo = getSafeData(currentData, 'supplierInfo', {});
  const shippingAddress = getSafeData(currentData, 'shippingAddress', {});
  const items = getSafeData(currentData, 'items', []);
  const orderMode = getSafeData(currentData, 'order_mode', 'PAKKA').toUpperCase();
  const transportDetails = getSafeData(currentData, 'transportDetails', {});
  
  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate') 
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');
    
  const dueDate = getSafeData(currentData, 'validityDate') 
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString('en-IN') 
    : 'N/A';
  
  // Calculate totals from items with proper calculations matching preview
  const calculateTotals = () => {
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalDiscountAmount = 0;
    let totalCreditCharge = 0;
    let grandTotal = 0;
    
    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 1));
      const flashOffer = parseInt(getSafeData(item, 'flash_offer', 0));
      const buyQuantity = parseInt(getSafeData(item, 'buy_quantity', 0));
      const getQuantity = parseInt(getSafeData(item, 'get_quantity', 0));
      
      // Use net_price first, fallback to price
      const price = parseFloat(getSafeData(item, 'net_price', getSafeData(item, 'price', 0)));
      const discountAmount = parseFloat(getSafeData(item, 'discount_amount', 0)) * quantity;
      const creditCharge = parseFloat(getSafeData(item, 'credit_charge', 0)) * quantity;
      
      // Get taxable amount - use taxable_amount from item if available
      const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0));
      const taxableAmount = taxablePerUnit * quantity;
      
      // GST calculations
      const gst = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'gst', 0));
      const gstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'tax_amount', 0)) * quantity;
      const cgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'cgst_amount', 0)) * quantity;
      const sgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'sgst_amount', 0)) * quantity;
      
      const itemTotal = orderMode === 'KACHA' ? taxableAmount : taxableAmount + gstAmount;
      
      totalTaxableAmount += taxableAmount;
      totalGSTAmount += gstAmount;
      totalCGSTAmount += cgstAmount;
      totalSGSTAmount += sgstAmount;
      totalDiscountAmount += discountAmount;
      totalCreditCharge += creditCharge;
      grandTotal += itemTotal;
    });
    
    return {
      totalTaxableAmount: totalTaxableAmount.toFixed(2),
      totalGSTAmount: totalGSTAmount.toFixed(2),
      totalCGSTAmount: totalCGSTAmount.toFixed(2),
      totalSGSTAmount: totalSGSTAmount.toFixed(2),
      totalDiscountAmount: totalDiscountAmount.toFixed(2),
      totalCreditCharge: totalCreditCharge.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };
  
  const totals = calculateTotals();
  
  // Get assigned staff
  const assignedStaff = getSafeData(currentData, 'assigned_staff', 'N/A');
  
  // Get transport values
  const transport = getSafeData(transportDetails, 'transport', '-');
  const grNumber = getSafeData(transportDetails, 'grNumber', '-');
  const vehicleNo = getSafeData(transportDetails, 'vehicleNo', '-');
  const station = getSafeData(transportDetails, 'station', '-');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{getSafeData(companyInfo, 'name', 'SHREE SHASHWAT RAJ AGRO PVT.LTD.')}</Text>
            <Text style={styles.companyAddress}>
              {getSafeData(companyInfo, 'address', 'PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113')}
            </Text>
            <Text style={styles.companyAddress}>
              Email: {getSafeData(companyInfo, 'email', 'spmathur56@gmail.com')} | 
              Phone: {getSafeData(companyInfo, 'phone', '9801049700')} | 
              GSTIN: {getSafeData(companyInfo, 'gstin', '10AAOCS1541B1ZZ')}
            </Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>
        
        {/* Address Section */}
        <View style={styles.addressSection}>
          {/* Billing Address */}
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={[styles.addressText, styles.tableCellBold, styles.tableCellLeft]}>
              {getSafeData(supplierInfo, 'name', 'Customer')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(supplierInfo, 'businessName', '')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              Mobile: {getSafeData(supplierInfo, 'phone', getSafeData(supplierInfo, 'mobile_number', 'N/A'))}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              State: {getSafeData(supplierInfo, 'state', 'N/A')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              Email: {getSafeData(supplierInfo, 'email', 'N/A')}
            </Text>
          </View>
          
          {/* Shipping Address */}
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'addressLine1', 'N/A')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'addressLine2', '')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'state', '')}, {getSafeData(shippingAddress, 'country', 'India')}
            </Text>
            {getSafeData(shippingAddress, 'gstin') && (
              <Text style={[styles.addressText, styles.tableCellLeft]}>
                Shipping GSTIN: {getSafeData(shippingAddress, 'gstin')}
              </Text>
            )}
          </View>
        </View>
        
        {/* Sales Person and Order Mode */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          {assignedStaff && assignedStaff !== 'N/A' && (
            <View style={styles.salesPersonSection}>
              <Text style={[styles.addressText, styles.tableCellBold]}>Sales Person:</Text>
              <Text style={[styles.addressText, styles.tableCellBold, { color: '#007bff' }]}>
                {assignedStaff}
              </Text>
            </View>
          )}
          
          <View style={[styles.orderModeSection, { alignSelf: 'flex-end' }]}>
            <Text style={styles.orderModeText}>Order Type: {orderMode}</Text>
          </View>
        </View>
        
        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items Details</Text>
          
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colSNo}><Text style={styles.tableCellHeader}>#</Text></View>
            <View style={styles.colProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
            <View style={styles.colDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
            <View style={styles.colQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
            <View style={styles.colFreeQty}><Text style={styles.tableCellHeader}>Free Qty</Text></View>
            <View style={styles.colPrice}><Text style={styles.tableCellHeader}>Price</Text></View>
            <View style={styles.colDiscount}><Text style={styles.tableCellHeader}>Discount Amt</Text></View>
            <View style={styles.colCreditCharge}><Text style={styles.tableCellHeader}>Credit Charge</Text></View>
            <View style={styles.colTaxable}><Text style={styles.tableCellHeader}>Taxable Amt</Text></View>
            <View style={styles.colGSTPercent}><Text style={styles.tableCellHeader}>GST %</Text></View>
            <View style={styles.colGSTAmt}><Text style={styles.tableCellHeader}>GST Amt</Text></View>
            <View style={styles.colCGST}><Text style={styles.tableCellHeader}>CGST Amt</Text></View>
            <View style={styles.colSGST}><Text style={styles.tableCellHeader}>SGST Amt</Text></View>
            <View style={styles.colTotal}><Text style={styles.tableCellHeader}>Item Total</Text></View>
          </View>
          
          {/* Table Rows */}
          {items.map((item, index) => {
            const quantity = parseFloat(getSafeData(item, 'quantity', 1));
            const flashOffer = parseInt(getSafeData(item, 'flash_offer', 0));
            const buyQuantity = parseInt(getSafeData(item, 'buy_quantity', 0));
            const getQuantity = parseInt(getSafeData(item, 'get_quantity', 0));
            
            // Use net_price first, fallback to price
            const price = parseFloat(getSafeData(item, 'net_price', getSafeData(item, 'price', 0)));
            const discountAmount = parseFloat(getSafeData(item, 'discount_amount', 0)) * quantity;
            const creditCharge = parseFloat(getSafeData(item, 'credit_charge', 0)) * quantity;
            
            // Taxable amount
            const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0));
            const taxableAmount = taxablePerUnit * quantity;
            
            // GST calculations
            const gst = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'gst', 0));
            const gstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'tax_amount', 0)) * quantity;
            const cgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'cgst_amount', 0)) * quantity;
            const sgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'sgst_amount', 0)) * quantity;
            
            const itemTotal = orderMode === 'KACHA' ? taxableAmount : taxableAmount + gstAmount;
            
            return (
              <View style={styles.tableRow} key={index}>
                <View style={styles.colSNo}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                <View style={styles.colProduct}>
                  <Text style={[styles.tableCell, styles.tableCellLeft, styles.tableCellBold]}>
                    {getSafeData(item, 'product', `Item ${index + 1}`)}
                  </Text>
                </View>
                <View style={styles.colDesc}>
                  <Text style={[styles.tableCell, styles.tableCellLeft]}>
                    {getSafeData(item, 'description', 'No description')}
                  </Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.tableCell}>
                    {flashOffer === 1 ? buyQuantity : quantity}
                  </Text>
                </View>
                <View style={styles.colFreeQty}>
                  <Text style={styles.tableCell}>
                    {flashOffer === 1 ? getQuantity : '-'}
                  </Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>₹{price.toFixed(2)}</Text>
                </View>
                <View style={styles.colDiscount}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>₹{discountAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.colCreditCharge}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>₹{creditCharge.toFixed(2)}</Text>
                </View>
                <View style={styles.colTaxable}>
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>
                    ₹{taxableAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.colGSTPercent}>
                  <Text style={styles.tableCell}>
                    {orderMode === 'KACHA' ? '0%' : `${gst}%`}
                  </Text>
                </View>
                <View style={styles.colGSTAmt}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    ₹{orderMode === 'KACHA' ? '0.00' : gstAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.colCGST}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    ₹{orderMode === 'KACHA' ? '0.00' : cgstAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.colSGST}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>
                    ₹{orderMode === 'KACHA' ? '0.00' : sgstAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold, { color: '#28a745' }]}>
                    ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Totals Section with Transportation Details */}
        <View style={styles.totalsSection}>
          {/* Notes and Transportation Section */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={[styles.tableCell, styles.tableCellLeft]}>
                {getSafeData(currentData, 'note', 'Thank you for your business!')}
              </Text>
            </View>
            
            {/* ✅ TRANSPORTATION DETAILS SECTION */}
            <View style={styles.transportBox}>
              <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Transportation Details:</Text>
              
              <View style={styles.transportRow}>
                <Text style={styles.transportLabel}>Transport:</Text>
                <Text style={styles.transportValue}>{transport || '-'}</Text>
              </View>
              
              <View style={styles.transportRow}>
                <Text style={styles.transportLabel}>GR/RR No.:</Text>
                <Text style={styles.transportValue}>{grNumber || '-'}</Text>
              </View>
              
              <View style={styles.transportRow}>
                <Text style={styles.transportLabel}>Vehicle No.:</Text>
                <Text style={styles.transportValue}>{vehicleNo || '-'}</Text>
              </View>
              
              <View style={styles.transportRow}>
                <Text style={styles.transportLabel}>Station:</Text>
                <Text style={styles.transportValue}>{station || '-'}</Text>
              </View>
            </View>
          </View>
          
          {/* Amount Summary */}
          <View style={styles.amountSection}>
            <Text style={styles.amountTitle}>Amount Summary</Text>
            
            {/* Taxable Amount */}
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Taxable Amount:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold]}>₹{totals.totalTaxableAmount}</Text>
            </View>
            
            {/* GST Breakdown */}
            {orderMode === 'PAKKA' && (
              <>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>CGST:</Text>
                  <Text style={styles.tableCell}>₹{totals.totalCGSTAmount}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>SGST:</Text>
                  <Text style={styles.tableCell}>₹{totals.totalSGSTAmount}</Text>
                </View>
              </>
            )}
            
            {/* Total GST */}
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Total GST:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { color: '#28a745' }]}>
                ₹{orderMode === 'KACHA' ? '0.00' : totals.totalGSTAmount}
              </Text>
            </View>
            
            {/* Grand Total */}
            <View style={styles.grandTotal}>
              <Text style={[styles.tableCell, styles.tableCellBold, { fontSize: 10 }]}>Grand Total:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { color: '#28a745', fontSize: 10 }]}>
                ₹{totals.grandTotal}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            <Text style={styles.bankText}>Account Name: {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
            <Text style={styles.bankText}>Account Number: 44773710377</Text>
            <Text style={styles.bankText}>IFSC Code: SBIN0063699</Text>
            <Text style={styles.bankText}>Bank Name: STATE BANK OF INDIA</Text>
          </View>
          
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.bankText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
              <View style={styles.signatureLine} />
              <Text style={[styles.bankText, { marginTop: 5 }]}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicceprintOrder;