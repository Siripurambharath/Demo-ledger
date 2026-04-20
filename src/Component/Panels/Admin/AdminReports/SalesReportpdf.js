import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

// Register font
Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSans',
    fontSize: 10,
    backgroundColor: '#ffffff'
  },

  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 5
  },

  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 5
  },

  dateRange: {
    fontSize: 10,
    textAlign: 'center',
    color: '#000000',
    marginTop: 5
  },

  /* ✅ TABLE */
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000000'
  },

  /* ✅ AUTO HEIGHT ROW */
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    alignItems: 'stretch'   // 🔥 important for dynamic height
  },

  tableHeader: {
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#000000'
  },

  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9
  },

  /* ✅ CELL WITH WRAP */
  tableCell: {
    padding: 6,
    fontSize: 8,
    textAlign: 'left',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    flexWrap: 'wrap',        // 🔥 wrap text
    justifyContent: 'center' // vertical alignment
  },

  /* Column widths */
  colSNo: {
    width: '5%',
    borderLeftWidth: 1,
    borderLeftColor: '#000000'
  },

  colProduct: { width: '18%' },
  colQuantity: { width: '7%' },
  colTaxable: { width: '12%' },
  colTotal: { width: '12%' },
  colRetailer: { width: '14%' },

  /* ✅ Bigger for long names */
  colStaff: { width: '23%' },

  /* ✅ Last column fix */
  colDate: {
    width: '9%',
    borderRightWidth: 0
  },

  textRight: { textAlign: 'right' },
  textCenter: { textAlign: 'center' },

  /* ✅ TEXT WRAP FIX */
  textWrap: {
    wordBreak: 'break-all'
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000000'
  },

  summaryText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 10
  },

  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000'
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
});

// Format currency
const formatCurrency = (amount) => {
  if (!amount || amount === '₹0') return '₹0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(numAmount)) return '₹0';
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return dateString;
};



// Main PDF Document Component
export const SalesReportPDF = ({ 
  data, 
  summary, 
  fromDate, 
  toDate, 
  transactionType,
  generatedDate 
}) => {
  // Filter data based on transaction type if needed
  const filteredData = transactionType && transactionType !== 'all'
    ? data.filter(item => {
        const itemType = item.TransactionType || (item.sales_type === 'pakka' ? 'Pakka' : 'Kacha');
        return itemType.toLowerCase() === transactionType.toLowerCase();
      })
    : data;

  // Calculate totals from filtered data
  const calculateTotals = () => {
    let totalTaxable = 0;
    let totalAmount = 0;
    
    filteredData.forEach(item => {
      const taxable = parseFloat(item.Subtotal?.replace(/[^0-9.-]/g, '')) || 
                      parseFloat(item.taxable_amount) || 0;
      const amount = parseFloat(item.total?.replace(/[^0-9.-]/g, '')) || 
                     parseFloat(item.total_amount) || 0;
      totalTaxable += taxable;
      totalAmount += amount;
    });
    
    return { totalTaxable, totalAmount };
  };
  
  const totals = calculateTotals();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report</Text>
          <Text style={styles.subtitle}>Comprehensive Sales Analysis Report</Text>
          <Text style={styles.dateRange}>
            Period: {fromDate || 'All Time'} {toDate && `to ${toDate}`}
          </Text>
          {transactionType && transactionType !== 'all' && (
            <Text style={styles.dateRange}>
              Transaction Type: {transactionType === 'pakka' ? 'Pakka/Sales' : 'Kacha Sales'}
            </Text>
          )}
          <Text style={styles.dateRange}>
            Generated on: {generatedDate}
          </Text>
        </View>

   

        {/* Sales Transactions Table */}
        <Text style={styles.sectionTitle}>Sales Transactions</Text>
        
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>S.No</Text>
          </View>
          <View style={[styles.tableCell, styles.colProduct]}>
            <Text style={styles.tableHeaderText}>Product</Text>
          </View>
          <View style={[styles.tableCell, styles.colQuantity, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>Qty</Text>
          </View>
          <View style={[styles.tableCell, styles.colTaxable, styles.textRight]}>
            <Text style={styles.tableHeaderText}>Taxable Amount</Text>
          </View>
          <View style={[styles.tableCell, styles.colTotal, styles.textRight]}>
            <Text style={styles.tableHeaderText}>Total Amount</Text>
          </View>
          <View style={[styles.tableCell, styles.colRetailer]}>
            <Text style={styles.tableHeaderText}>Retailer</Text>
          </View>
          <View style={[styles.tableCell, styles.colStaff]}>
            <Text style={styles.tableHeaderText}>Staff</Text>
          </View>
          <View style={[styles.tableCell, styles.colDate, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>Date</Text>
          </View>
        
        </View>

        {/* Table Body */}
        {filteredData.map((item, index) => (
          <View key={index} style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
              <Text>{index + 1}</Text>
            </View>
            <View style={[styles.tableCell, styles.colProduct]}>
              <Text>{item.product || '-'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colQuantity, styles.textCenter]}>
              <Text>{item.quantity || '-'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colTaxable, styles.textRight]}>
              <Text>{item.Subtotal || formatCurrency(item.taxable_amount) || '₹0'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colTotal, styles.textRight]}>
              <Text>{item.total || formatCurrency(item.total_amount) || '₹0'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colRetailer]}>
              <Text>{item.retailer || '-'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colStaff]}>
              <Text>{item.assigned_staff || 'Not Assigned'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colDate, styles.textCenter]}>
              <Text>{formatDate(item.invoice_date)}</Text>
            </View>
          
          </View>
        ))}

        {/* Table Footer Summary */}
        {filteredData.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total Taxable Amount:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totals.totalTaxable)}</Text>
          </View>
        )}

        {filteredData.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>No data available for selected filters</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>This is a system-generated report. For any queries, please contact support.</Text>
          <Text>Page {`<PageNumber />`} of {`<TotalPages />`}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper function to generate PDF blob
export const generateSalesReportPDF = async (data, summary, fromDate, toDate, transactionType) => {
  const { pdf } = await import('@react-pdf/renderer');
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const pdfBlob = await pdf(
    <SalesReportPDF
      data={data}
      summary={summary}
      fromDate={fromDate}
      toDate={toDate}
      transactionType={transactionType}
      generatedDate={currentDate}
    />
  ).toBlob();
  
  return pdfBlob;
};

export default SalesReportPDF;