import React from 'react';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import OrderRow from './OrderRow';

const OrderTable = ({
  filteredOrders,
  activeTab,
  openRow,
  toggleRow,
  selectedOrdersForDispatch,
  toggleOrderForDispatch,
  toggleAllOrdersForDispatch,
  selectedItems,
  setSelectedItems,
  handleItemSelect,
  handleSelectAll,
  handleEditItem,  // Add this
  navigate,  // Add this
  handleGenerateInvoice,
  handleApproveItem,
  handleRejectItem,
  openOrderModal,
  openItemModal,
  orderInvoices,
  loadingInvoices,
  fetchInvoicesForOrder,
  handleDownloadSpecificPDF,
  openDropdown,
  setOpenDropdown
}) => {
  return (
    <div className="p-table-container">
      <table className="p-customers-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>
              <input
                type="checkbox"
                checked={filteredOrders.length > 0 && selectedOrdersForDispatch.length === filteredOrders.length}
                onChange={toggleAllOrdersForDispatch}
                title={filteredOrders.length > 0 ?
                  (selectedOrdersForDispatch.length === filteredOrders.length ?
                    "Deselect all orders" : "Select all orders") :
                  "No orders to select"}
                disabled={filteredOrders.length === 0}
              />
            </th>
            <th></th>
            <th>Order Number</th>
            <th>Customer Name</th>
            <th>Order Total</th>
            <th>Discount Amount</th>
            <th>Assigned Staff</th>
            <th>Order Status</th>
            <th>Created At</th>
            <th>Action</th>
            {activeTab === "completed" && <th>Download Invoice</th>}
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              activeTab={activeTab}
              openRow={openRow}
              toggleRow={toggleRow}
              isSelectedForDispatch={selectedOrdersForDispatch.includes(order.id)}
              toggleOrderForDispatch={toggleOrderForDispatch}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              handleItemSelect={handleItemSelect}
              handleSelectAll={handleSelectAll}
                handleEditItem={handleEditItem}  // Add this
              navigate={navigate}  // Add this
              handleGenerateInvoice={handleGenerateInvoice}
              handleApproveItem={handleApproveItem}
              handleRejectItem={handleRejectItem}
              openOrderModal={openOrderModal}
              openItemModal={openItemModal}
              orderInvoices={orderInvoices}
              loadingInvoices={loadingInvoices}
              fetchInvoicesForOrder={fetchInvoicesForOrder}
              handleDownloadSpecificPDF={handleDownloadSpecificPDF}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;