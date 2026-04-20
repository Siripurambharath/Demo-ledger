import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
  },
  shopName: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 4,
  },
  // Base column style - width will be dynamic
  colBase: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerTextLeft: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'left',
  },
  headerTextRight: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'right',
  },
  cellLeft: {
    textAlign: 'left',
    fontSize: 9,
  },
  cellRight: {
    textAlign: 'right',
    fontSize: 9,
  },
  boldRight: {
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
});

// Map column keys to their display properties
const columnConfig = {
  itemName: { title: 'Item Name', align: 'left', width: '18%' },
  categoryName: { title: 'Category', align: 'left', width: '12%' },
  opQty: { title: 'Op. Qty', align: 'right', width: '7%' },
  currentStock: { title: 'BL. Qty', align: 'right', width: '7%' },
  opVal: { title: 'Op. Val', align: 'right', width: '9%' },
  prchQty: { title: 'Prch Qty', align: 'right', width: '7%' },
  prchVal: { title: 'Prch Val', align: 'right', width: '9%' },
  saleQty: { title: 'Sale Qty', align: 'right', width: '7%' },
  saleVal: { title: 'Sale Val', align: 'right', width: '9%' },
  cloBal: { title: 'Clo. Bal', align: 'right', width: '9%' },
};

const StockReportPDF = ({ reportData }) => {
  const {
    shopName = "SHREE SHASHWAT RAJ AGRO PVT.LTD",
    fromDate = "01-04-2025",
    toDate = "01-04-2025",
    items = [],
    selectedColumns = ["itemName", "categoryName", "opQty", "currentStock", "opVal", "prchQty", "prchVal", "saleQty", "saleVal", "cloBal"]
  } = reportData || {};

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0.00";
    return Number(value).toFixed(2);
  };

  // Get only the columns that are selected
  const activeColumns = selectedColumns.filter(col => columnConfig[col]);

  // Calculate total width percentage (should be close to 100)
  const totalWidth = activeColumns.reduce((sum, col) => sum + parseFloat(columnConfig[col].width), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <Text style={styles.shopName}>{shopName}</Text>
        <Text style={styles.reportTitle}>
          STOCK REPORT From : {fromDate} To {toDate}
        </Text>

        {/* Header Row - only selected columns */}
        <View style={styles.headerRow}>
          {activeColumns.map((colKey) => {
            const config = columnConfig[colKey];
            return (
              <View 
                key={colKey} 
                style={[styles.colBase, { width: config.width }]}
              >
                <Text style={config.align === 'left' ? styles.headerTextLeft : styles.headerTextRight}>
                  {config.title}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Data Rows - only selected columns */}
        {items.map((item, index) => (
          <View style={styles.row} key={index}>
            {activeColumns.map((colKey) => {
              const config = columnConfig[colKey];
              let value;
              
              // Get the value based on column key
              switch(colKey) {
                case 'itemName':
                  value = item.itemName || '-';
                  break;
                case 'categoryName':
                  value = item.categoryName || 'Uncategorized';
                  break;
                case 'opQty':
                  value = formatNumber(item.opQty);
                  break;
                case 'currentStock':
                  value = formatNumber(item.currentStock);
                  break;
                case 'opVal':
                  value = formatNumber(item.opVal);
                  break;
                case 'prchQty':
                  value = formatNumber(item.prchQty);
                  break;
                case 'prchVal':
                  value = formatNumber(item.prchVal);
                  break;
                case 'saleQty':
                  value = formatNumber(item.saleQty);
                  break;
                case 'saleVal':
                  value = formatNumber(item.saleVal);
                  break;
                case 'cloBal':
                  value = formatNumber(
                    item.cloBal ??
                    (item.opQty || 0) + (item.prchQty || 0) - (item.saleQty || 0)
                  );
                  break;
                default:
                  value = '-';
              }
              
              return (
                <View 
                  key={colKey} 
                  style={[styles.colBase, { width: config.width }]}
                >
                  <Text style={config.align === 'left' ? styles.cellLeft : styles.cellRight}>
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* No data message */}
        {items.length === 0 && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#666' }}>No data available for the selected period</Text>
          </View>
        )}

        {/* Page number */}
        <Text
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 8,
            color: '#666',
          }}
          fixed
        >
          Page 1 of 1
        </Text>
      </Page>
    </Document>
  );
};

export default StockReportPDF;