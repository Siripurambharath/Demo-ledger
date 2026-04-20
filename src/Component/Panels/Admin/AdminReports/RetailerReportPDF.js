import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
   PageNumber,
  TotalPages
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

  /* Stats Cards Section */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
    flexWrap: 'wrap'
  },

  statCard: {
    width: '23%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },

  statLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center'
  },

  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5
  },

  statPeriod: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center'
  },

  positive: {
    color: '#10b981'
  },

  negative: {
    color: '#ef4444'
  },

  /* Section Title */
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

  /* Charts Section - Simplified for PDF */
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
    flexWrap: 'wrap'
  },

  chartCard: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 5
  },

  chartTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center'
  },

  stateList: {
    marginTop: 5
  },

  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },

  stateName: {
    fontSize: 9,
    color: '#374151'
  },

  stateCount: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4f46e5'
  },

  statePercentage: {
    fontSize: 8,
    color: '#6b7280'
  },

  businessList: {
    marginTop: 5
  },

  businessItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },

  businessName: {
    fontSize: 9,
    color: '#374151',
    flex: 1
  },

  businessCount: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4f46e5'
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
    alignItems: 'stretch'
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
    flexWrap: 'wrap',
    justifyContent: 'center'
  },

  /* Column widths */
  colSNo: {
    width: '5%',
    borderLeftWidth: 1,
    borderLeftColor: '#000000'
  },

  colName: { width: '12%' },
  colMobile: { width: '10%' },
  colEmail: { width: '15%' },
  colBusiness: { width: '15%' },
  colGSTIN: { width: '12%' },
  colStaff: { width: '12%' },
  colDate: { width: '10%' },
  colState: {
    width: '9%',
    borderRightWidth: 0
  },

  textRight: { textAlign: 'right' },
  textCenter: { textAlign: 'center' },

  /* Summary Row */
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

// Format currency (keeping for consistency, though not used in retailer report)
const formatCurrency = (amount) => {
  if (!amount || amount === '₹0') return '₹0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(numAmount)) return '₹0';
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  } catch (err) {
    return dateString;
  }
};

// Main PDF Document Component
export const RetailerReportPDF = ({ 
  data, 
  stats, 
  stateChartData,
  barChartData,
  fromDate, 
  toDate, 
  generatedDate 
}) => {
  // Calculate total retailers
  const totalRetailers = data.length;

  // Prepare state distribution data for PDF
  const prepareStateDistribution = () => {
    if (stateChartData && stateChartData.labels && stateChartData.datasets) {
      const stateCounts = {};
      stateChartData.labels.forEach((label, index) => {
        stateCounts[label] = stateChartData.datasets[0].data[index];
      });
      return stateCounts;
    }
    return {};
  };

  // Prepare business type data for PDF
  const prepareBusinessDistribution = () => {
    if (barChartData && barChartData.labels && barChartData.datasets) {
      const businessCounts = {};
      barChartData.labels.forEach((label, index) => {
        businessCounts[label] = barChartData.datasets[0].data[index];
      });
      return businessCounts;
    }
    return {};
  };

  const stateDistribution = prepareStateDistribution();
  const businessDistribution = prepareBusinessDistribution();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Retailer Report</Text>
          <Text style={styles.subtitle}>Comprehensive Retailer Analysis Report</Text>
          <Text style={styles.dateRange}>
            Period: {fromDate || 'All Time'} {toDate && `to ${toDate}`}
          </Text>
          <Text style={styles.dateRange}>
            Generated on: {generatedDate}
          </Text>
        </View>

    

        {/* Retailers Table Section */}
        <Text style={styles.sectionTitle}>All Retailers</Text>
        
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>S.No</Text>
          </View>
          <View style={[styles.tableCell, styles.colName]}>
            <Text style={styles.tableHeaderText}>Name</Text>
          </View>
          <View style={[styles.tableCell, styles.colMobile, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>Mobile</Text>
          </View>
          <View style={[styles.tableCell, styles.colEmail]}>
            <Text style={styles.tableHeaderText}>Email</Text>
          </View>
          <View style={[styles.tableCell, styles.colBusiness]}>
            <Text style={styles.tableHeaderText}>Business Name</Text>
          </View>
          <View style={[styles.tableCell, styles.colGSTIN]}>
            <Text style={styles.tableHeaderText}>GSTIN</Text>
          </View>
          <View style={[styles.tableCell, styles.colStaff]}>
            <Text style={styles.tableHeaderText}>Assigned Staff</Text>
          </View>
          <View style={[styles.tableCell, styles.colDate, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>Created Date</Text>
          </View>
          <View style={[styles.tableCell, styles.colState, styles.textCenter]}>
            <Text style={styles.tableHeaderText}>State</Text>
          </View>
        </View>

        {/* Table Body */}
        {data.slice(0, 20).map((item, index) => (
          <View key={index} style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
              <Text>{index + 1}</Text>
            </View>
            <View style={[styles.tableCell, styles.colName]}>
              <Text>{item.name || item.retailer_name || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colMobile, styles.textCenter]}>
              <Text>{item.mobile || item.mobile_number || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colEmail]}>
              <Text>{item.email || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colBusiness]}>
              <Text>{item.business_name || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colGSTIN]}>
              <Text>{item.gstin || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colStaff]}>
              <Text>{item.assigned_staff || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colDate, styles.textCenter]}>
              <Text>{formatDate(item.created_at || item.created_date)}</Text>
            </View>
            <View style={[styles.tableCell, styles.colState, styles.textCenter]}>
              <Text>{item.billing_state || item.state || 'N/A'}</Text>
            </View>
          </View>
        ))}

        {/* Show message if more records exist */}
        {data.length > 20 && (
          <View style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#6b7280' }}>
              + {data.length - 20} more records not shown in this view
            </Text>
          </View>
        )}

        {data.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>No retailer data available for selected filters</Text>
          </View>
        )}

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Retailers:</Text>
          <Text style={styles.summaryValue}>{totalRetailers}</Text>
        </View>

 <View style={styles.footer} fixed>
          <Text>This is a system-generated report. For any queries, please contact support.</Text>
          <Text>Page {`<PageNumber />`} of {`<TotalPages />`}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper function to generate PDF blob
export const generateRetailerReportPDF = async (data, stats, stateChartData, barChartData, fromDate, toDate) => {
  const { pdf } = await import('@react-pdf/renderer');
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const pdfBlob = await pdf(
    <RetailerReportPDF
      data={data}
      stats={stats}
      stateChartData={stateChartData}
      barChartData={barChartData}
      fromDate={fromDate}
      toDate={toDate}
      generatedDate={currentDate}
    />
  ).toBlob();
  
  return pdfBlob;
};

export default RetailerReportPDF;