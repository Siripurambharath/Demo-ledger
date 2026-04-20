// Salesreportdetailpdf.js
import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// Font
Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'NotoSans',
    fontSize: 9,
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
    color: '#444'
  },
  productName: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  dateRange: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 3,
    color: '#666'
  },
  generatedDate: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
    color: '#999'
  },
  
  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9'
  },
  summaryLabel: {
    fontSize: 8,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center'
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50'
  },
  summarySubtext: {
    fontSize: 7,
    color: '#999',
    textAlign: 'center',
    marginTop: 2
  },  

  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch'  
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'stretch' 
  },
  tableRowAlternate: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    alignItems: 'stretch'  
  },
  tableCell: {
    padding: 6,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    flex: 1  
  },
  headerCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#4a6a8a',
    flex: 1 
  },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },
  
  // Column widths in order: S.No, Party Name, Date, Invoice No, Amount, Rate per unit, Quantity
  colSNo:     { width: '5%' },
  colParty:   { width: '23%' },
  colDate:    { width: '12%' },
  colInvoice: { width: '15%' },
  colAmount:  { width: '15%' },
  colRate:    { width: '15%' },
  colQty:     { width: '15%' },

  // Footer Summary
  footerSummary: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20
  },
  summaryItem: {
    flexDirection: 'row',
    marginLeft: 20,
    alignItems: 'center'
  },
  summaryLabelBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#2c3e50'
  },
  summaryValueBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e74c3c'
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8
  }
});

// Currency format function
const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  } catch {
    return '-';
  }
};

// PDF Component
export const SalesReportPDFDocument = ({
  data,
  fromDate,
  toDate,
  productName,
  generatedDate,
  summary
}) => {
  // Calculate totals
  let totalQuantity = 0;
  let totalAmount = 0;
  let totalRatePerUnit = 0;
  let totalTransactions = new Set();

  data.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    totalQuantity += qty;
    totalAmount += price * qty;
    totalRatePerUnit += price;  // ✅ Sum of Rate per unit column
    if (item.VchNo) totalTransactions.add(item.VchNo);
  });

  const avgRate = data.length > 0 ? totalRatePerUnit / data.length : 0;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report - Product Details</Text>
          <Text style={styles.subtitle}>Detailed Transaction Report</Text>
          {productName && (
            <Text style={styles.productName}>Product: {productName}</Text>
          )}
          <Text style={styles.dateRange}>
            Period: {fromDate || 'All Dates'} to {toDate || 'All Dates'}
          </Text>
          <Text style={styles.generatedDate}>
            Generated on: {generatedDate}
          </Text>
        </View>

        {/* TABLE SECTION - Column order: S.No, Party Name, Date, Invoice No, Amount, Rate per unit, Quantity */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colSNo, styles.textCenter]}>S.No</Text>
            <Text style={[styles.headerCell, styles.colParty, styles.textLeft]}>Party Name</Text>
            <Text style={[styles.headerCell, styles.colDate, styles.textCenter]}>Date</Text>
            <Text style={[styles.headerCell, styles.colInvoice, styles.textCenter]}>Invoice No</Text>
            <Text style={[styles.headerCell, styles.colRate, styles.textRight]}>Rate per unit</Text>
            <Text style={[styles.headerCell, styles.colQty, styles.textCenter]}>Quantity</Text>
                        <Text style={[styles.headerCell, styles.colAmount, styles.textRight]}>Amount</Text>

          </View>

          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCell, styles.colParty, styles.textLeft]}>
                {item.PartyName || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.colDate, styles.textCenter]}>
                {item.date || formatDate(item.Date)}
              </Text>
              <Text style={[styles.tableCell, styles.colInvoice, styles.textCenter]}>
                {item.VchNo || '-'}
              </Text>
            
              <Text style={[styles.tableCell, styles.colRate, styles.textRight]}>
                {formatCurrency(parseFloat(item.price) || 0)}
              </Text>
              <Text style={[styles.tableCell, styles.colQty, styles.textCenter]}>
                {parseFloat(item.quantity) || 0}
              </Text>
                <Text style={[styles.tableCell, styles.colAmount, styles.textRight]}>
                {formatCurrency((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footerSummary}>
         
         
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabelBold}>Total Quantity:</Text>
            <Text style={styles.summaryValueBold}>{totalQuantity}</Text>
          </View>
           <View style={styles.summaryItem}>
            <Text style={styles.summaryLabelBold}>Total Amount:</Text>
            <Text style={styles.summaryValueBold}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* PAGE FOOTER */}
        <View style={styles.footer} fixed>
          <Text>This is a system generated report • {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
};

// GENERATE FUNCTION
export const generateSalesReportPDF = async (
  data,
  summary,
  fromDate,
  toDate,
  transactionType,
  productName
) => {
  const { pdf } = await import('@react-pdf/renderer');
  const currentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const blob = await pdf(
    <SalesReportPDFDocument
      data={data}
      fromDate={fromDate}
      toDate={toDate}
      productName={productName}
      generatedDate={currentDate}
      summary={summary}
    />
  ).toBlob();

  return blob;
};

export default generateSalesReportPDF;