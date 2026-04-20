// ExpenseReportPDF.jsx
import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
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
    color: '#000000'
  },

  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000000'
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
    borderColor: '#000000' // ✅ black
  },

  /* ✅ DYNAMIC HEIGHT ROW */
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000', // ✅ black
    alignItems: 'stretch' // 🔥 important
  },

  tableHeader: {
    backgroundColor: '#000000', // ✅ black header
    borderBottomWidth: 2,
    borderBottomColor: '#000000'
  },

  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 8
  },

  /* ✅ CELL */
  tableCell: {
    padding: 6,
    fontSize: 8,
    textAlign: 'left',
    borderRightWidth: 1,
    borderRightColor: '#000000', // ✅ vertical lines black
    flexWrap: 'wrap', // 🔥 wrap text
    justifyContent: 'center'
  },

  /* Column widths */
  colSNo: {
    width: '6%',
    borderLeftWidth: 1,
    borderLeftColor: '#000000'
  },

  colDate: { width: '12%' },
  colStaff: { width: '20%' },
  colCategory: { width: '18%' }, // थोड़ा बढ़ाया
  colAmount: { width: '12%' },
  colStatus: { width: '12%' },
  colPaymentStatus: { 
    width: '15%',
    borderRightWidth: 0 // ✅ last column fix
  },

  textRight: { textAlign: 'right' },
  textCenter: { textAlign: 'center' },

  /* ✅ TEXT WRAP */
  textWrap: {
    wordBreak: 'break-all'
  },

  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7,
    textAlign: 'center',
    alignSelf: 'center'
  },

  statusApproved: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },

  statusPending: {
    backgroundColor: '#fed7aa',
    color: '#92400e'
  },

  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
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
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 10
  },

  summaryValue: {
    fontSize: 10,
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
    color: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 10
  }
});

// Format currency
const formatCurrency = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(numAmount)) return '₹0';
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return dateString;
};

// Get status style
const getStatusStyle = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'approved') return styles.statusApproved;
  if (statusLower === 'pending') return styles.statusPending;
  if (statusLower === 'rejected') return styles.statusRejected;
  return {};
};

// Main PDF Document Component
export const ExpenseReportPDF = ({ 
  data, 
  stats, 
  categoryData,
  staffData,
  fromDate, 
  toDate, 
  generatedDate 
}) => {
  // Calculate totals
  const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Expense Report</Text>
          <Text style={styles.subtitle}>Comprehensive Expense Analysis Report</Text>
          <Text style={styles.dateRange}>
            Period: {fromDate || 'All Time'} {toDate && `to ${toDate}`}
          </Text>
          <Text style={styles.dateRange}>
            Generated on: {generatedDate}
          </Text>
        </View>


     
        {/* Expense Transactions Table */}
        <Text style={[styles.chartTitle, { marginTop: 15, textAlign: 'left' }]}>
          Expense Transactions
        </Text>

        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>S.No</Text>
          </View>
          <View style={[styles.tableCell, styles.colDate]}>
            <Text style={styles.tableHeaderText}>Date</Text>
          </View>
          <View style={[styles.tableCell, styles.colStaff]}>
            <Text style={styles.tableHeaderText}>Staff</Text>
          </View>
          <View style={[styles.tableCell, styles.colCategory]}>
            <Text style={styles.tableHeaderText}>Category</Text>
          </View>
          <View style={[styles.tableCell, styles.colAmount, styles.textRight]}>
            <Text style={styles.tableHeaderText}>Amount</Text>
          </View>
          <View style={[styles.tableCell, styles.colStatus]}>
            <Text style={styles.tableHeaderText}>Status</Text>
          </View>
          <View style={[styles.tableCell, styles.colPaymentStatus]}>
            <Text style={styles.tableHeaderText}>Payment Status</Text>
          </View>
        </View>

        {/* Table Body */}
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
              <Text>{index + 1}</Text>
            </View>
            <View style={[styles.tableCell, styles.colDate]}>
              <Text>{formatDate(item.expense_date)}</Text>
            </View>
            <View style={[styles.tableCell, styles.colStaff]}>
              <Text>{item.staff || 'Unassigned'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colCategory]}>
              <Text>{item.category || 'Uncategorized'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colAmount, styles.textRight]}>
              <Text style={{ fontWeight: 'bold', color: '#059669' }}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.colStatus]}>
              <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>
                {item.status || 'Pending'}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.colPaymentStatus]}>
              <Text>{item.payment_status || 'N/A'}</Text>
            </View>
          </View>
        ))}

        {/* Table Footer Summary */}
        {data.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total Expenses:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        )}

        {data.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>No expense data available for selected filters</Text>
          </View>
        )}

        {/* Footer - Fixed version */}
        <View style={styles.footer} fixed>
          <Text>This is a system-generated expense report. For any queries, please contact support.</Text>
          <Text
  render={({ pageNumber, totalPages }) =>
    `Page ${pageNumber} of ${totalPages}`
  }
/>
        </View>
      </Page>
    </Document>
  );
};

// Helper function to generate PDF blob
export const generateExpenseReportPDF = async (data, stats, categoryData, staffData, fromDate, toDate) => {
  const { pdf } = await import('@react-pdf/renderer');
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const pdfBlob = await pdf(
    <ExpenseReportPDF
      data={data}
      stats={stats}
      categoryData={categoryData}
      staffData={staffData}
      fromDate={fromDate}
      toDate={toDate}
      generatedDate={currentDate}
    />
  ).toBlob();
  
  return pdfBlob;
};

export default ExpenseReportPDF;