import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
// Dashboards
import AdminDashboard from "./Component/Panels/Admin/AdminDashboard/AdminDashboard";
import StaffDashboard from "./Component/Panels/Staff/StaffPages/StaffDashboard";
import Login from "./Component/Panels/Auth/Login";
import ForgotPassword from "./Component/Panels/Auth/ForgotPassword";
import ResetPassword from "./Component/Panels/Auth/ResetPassword";

//Retailer pages

import RetailerHome from "./Component/Panels/Retailer/RetailerHome/RetailerHomeWrapper";
import RetailerHistory from "./Component/Panels/Retailer/RetailerHistory/RetailerHistoryWrapper";
import RetailerOffers from "./Component/Panels/Retailer/RetailerOffers/RetailerOffersWrapper";
import RetailerProfile from "./Component/Panels/Retailer/RetailerProfile/RetailerProfileWrapper";
import RetailerReportPage from "./Component/Panels/Admin/AdminReports/RetailerReportPage";


//sales 
import SalesReportPage from "./Component/Panels/Admin/AdminReports/SalesReportPage";

// Admin Pages
import AdminRetailers from "./Component/Panels/Admin/AdminRetailers/Retailers";
import AddRetailerForm from "./Component/Panels/Admin/AdminRetailers/AddRetailer"
import AdminStaff from "./Component/Panels/Admin/AdminStaff/Staff";
import AddStaff from "./Component/Panels/Admin/AdminStaff/AddStaff"
import AdminSales from "./Component/Panels/Admin/AdminSales/Sales";
import SalesInvoiceTable from "./Component/Panels/Admin/SalesInvoicePage/InvoiceTable"
import SalesInvoiceForm from "./Component/Panels/Admin/SalesInvoicePage/SalesInvoiceForm";
import AdminReceiptsTable from "./Component/Panels/Admin/Receipts/ReceiptsTable"
import CreateReceiptForm from "./Component/Panels/Admin/Receipts/ReceiptsForm";
import QuotationsTable from "./Component/Panels/Quotation/QuotationTable";
import BillOfSupplyTable from "./Component/Panels/Admin/BillOfSupply/BillOfSupply";
import CreditNoteTable from "./Component/Panels/Admin/CreditNote/CreditNoteTable";
import DeliveryChallanTable from "./Component/Panels/Admin/DeliveryChallan/DeliveryChallanTable";
import ReceivablesTable from "./Component/Panels/Receivables/ReceivablesTable";
import AddSales from "./Component/Panels/Admin/AdminSales/AddSales"
import AdminProducts from "./Component/Panels/Admin/AdminProducts/Products";
import PurchaseInvoiceTable from "./Component/Panels/Admin/PurchaseInvoicePage/PurchaseInvoiceTable";
import CreatePurchaseInvoiceForm from "./Component/Panels/Admin/PurchaseInvoicePage/PurchaseInvoiceForm";
import PurchaseOrderTable from "./Component/Panels/Admin/PurchaseOrderTable/PurchaseOrderTable";
import VoucherTable from "./Component/Panels/Admin/Vochur/VochurTable";
import AddProduct from './Component/Panels/Admin/AdminProducts/AddProducts';
import AdminMarketing from "./Component/Panels/Admin/AdminMarketing/Marketing";
import AddMarketing from "./Component/Panels/Admin/AdminMarketing/AddMarketing";
import AdminExpenses from "./Component/Panels/Admin/AdminExpenses/Expenses";
import AddExpenses from "./Component/Panels/Admin/AdminExpenses/AddExpenses";
import AdminReports from "./Component/Panels/Admin/AdminReports/Reports";
import AdminRoleAccess from "./Component/Panels/Admin/AdminRoleAccess/RoleAccess";
import DashboardCard from "./Component/Panels/Admin/AdminDashboard/DashboardCard"
import ExpenseReportPage from "./Component/Panels/Admin/AdminReports/ExpenseReportPage";


// Staff Pages (Mobile Only)
import MyRetailers from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/MyRetailers";
import AddRetailer from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/AddRetailer";

import SalesVisits from "./Component/Panels/Staff/StaffPages/Staff_SalesVisits/SalesVisits";
import LogVisit from "./Component/Panels/Staff/StaffPages/Staff_SalesVisits/LogVisit";
import StaffExpenses from "./Component/Panels/Staff/StaffPages/Staff_Expenses/StaffExpenses";
import AddExpense from "./Component/Panels/Staff/StaffPages/Staff_Expenses/AddExpense";
import StaffOffers from "./Component/Panels/Staff/StaffPages/Staff_Offers/StaffOffers";
import SalesVisit from "./Component/Panels/Admin/AdminSalesvisit/SalesVisit";

import PurchasedItems from './Component/Panels/Admin/Inventory/PurchasedItems/PurchasedItems';
import SalesItems from "./Component/Panels/Admin/Inventory/Sales_catalogue/SalesItems";
import SalesItemsPage from "./Component/Panels/Admin/Inventory/Sales_catalogue/SalesItemsPage";
import AddProductPage from "./Component/Panels/Admin/Inventory/PurchasedItems/AddProductPage";
import AddCompanyModal from "./Component/Panels/Admin/Inventory/Sales_catalogue/AddCompanyModal";
import AddCategoryModal from "./Component/Panels/Admin/Inventory/PurchasedItems/AddCategoryModal";
import StockDetailsModal from "./Component/Panels/Admin/Inventory/PurchasedItems/StockDetailsModal";
import DeductStockModal from "./Component/Panels/Admin/Inventory/PurchasedItems/DeductStockModal";
import AddStockModal from "./Component/Panels/Admin/Inventory/PurchasedItems/AddStockModal";
import AddServiceModal from "./Component/Panels/Admin/Inventory/PurchasedItems/AddServiceModal";
import Staff_expensive from "./Component/Panels/Staff/StaffPages/Expensive/Staff_expensive";
import Staff_Add_expensive from "./Component/Panels/Staff/StaffPages/Expensive/Staff_Add_expensive";
import AdminExpensiveRequest from "./Component/Panels/Admin/AdminExpensiveRequest/AdminExpensiveRequest";
import Salesitems_productsdetails from "./Component/Panels/Admin/Inventory/PurchasedItems/Salesitems_productsdetails";
import DebitNoteTable from "./Component/Panels/Admin/DebitTable/DebitTableNote";
import PayablesTable from "./Component/Panels/Admin/Payables/Payables";

import InvoicePDFPreview from './Component/Panels/Admin/SalesInvoicePage/InvoicePDFPreview';
import PurchasePDFPreview from "./Component/Panels/Admin/PurchaseInvoicePage/PurchasePDFPreview";
import ReceiptView from "./Component/Panels/Admin/Receipts/Receiptsview";
import AddUnitModal from "./Component/Panels/Admin/Inventory/Sales_catalogue/AddUnitsModal";
import OffersPostings from './Component/Panels/Admin/AdminMarketing/OffersModule/OffersPostings/OffersPostings'
import Category from "./Component/Panels/Admin/Category/CategoryTable"
import Company from "./Component/Panels/Admin/Company/CompanyTable"
import Units from "./Component/Panels/Admin/Units/UnitsTable"
import Ledger from "./Component/Panels/Admin/Ledger/Ledger";
import CreateNote from "./Component/Panels/Admin/CreditNote/CreateNote";
// Add this import
import InvoicePDFDownload from './Component/Panels/Admin/SalesInvoicePage/InvoicePDFDocument';

import Profile from "./Component/Panels/Retailer/RetailerProfile/Profile";
import RetailerOrders from "./Component/Panels/Retailer/RetailerOrders/RetailerOrders";
import DeleteProfile from "./Component/Panels/Retailer/RetailerProfile/DeleteProfile";
import EditProfile from "./Component/Panels/Retailer/RetailerProfile/EditProfile";
import EditCreditNote from "./Component/Panels/Admin/CreditNote/EditCreditNote";
import PurchaseInvoiceEdit from "./Component/Panels/Admin/PurchaseInvoicePage/PurchaseInvoiceEdit";


import CreditPeriodTable from "./Component/Panels/Admin/CreditPeriod/CreditPeriodTable"
import AddCreditPeriodFix from './Component/Panels/Admin/CreditPeriod/AddCreditPeriod';

import VoucherView from "./Component/Panels/Admin/Vochur/VoucherView"
import Creditsview from "./Component/Panels/Admin/CreditNote/Creditsview";
import CreateDebitNote from "./Component/Panels/Admin/DebitTable/CreateDebitNote";
import DebitView from "./Component/Panels/Admin/DebitTable/DebitView";
import EditDebitNote from "./Component/Panels/Admin/DebitTable/EditDebitNote";
import KachaSalesInvoiceForm from "./Component/Panels/Admin/KachaSales/KachaSalesInvoiceForm";
import KachaInvoiceTable from "./Component/Panels/Admin/KachaSales/KachaInvoiceTable";
import KachaInvoicePDFPreview from "./Component/Panels/Admin/KachaSales/KachaInvoicePDFPreview";
import Period from "./Component/Panels/Admin/Period/Period";
import Period_InvoicePDFPreview from "./Component/Panels/Admin/Period/Period_InvoicePDFPreview";
import PlaceSalesOrder from "./Component/Panels/Admin/AdminRetailers/PlaceSalesOrder";
import CartPage from "./Component/Panels/Admin/AdminRetailers/CartPage";
import Checkout from "./Component/Panels/Admin/AdminRetailers/Checkout";
import InvoicePreview_preview from "./Component/Panels/Admin/Period/InvoicePreview_preview";
import ReceiptModal_preview from "./Component/Panels/Admin/Period/ReceiptModal_preview";
import QRCodeGenerator from "./Component/Panels/Admin/Period/QRCodeGenerator";
import RetailersScore from "./Component/Panels/Admin/RetailersScore/RetailersScore";
import KachaReceiptsTable from "./Component/Panels/kachreceipts/Receipts/KachaReceiptsTable";
import SalesPersonScore from "./Component/Panels/Admin/SalesPersonScore/SalesPersonScore";
import ImportSalesPage from "./Component/Panels/Admin/Inventory/Sales_catalogue/ImportSalesPage";
import ExportSalesPage from "./Component/Panels/Admin/Inventory/Sales_catalogue/ExportSalesPage";
import SalesPdfDocument from "./Component/Panels/Admin/SalesInvoicePage/SalesPdfDocument";
import Kachareceiptview from "./Component/Panels/kachreceipts/Receipts/Kachareceiptview";
import ImportRetailersPage from "./Component/Panels/Admin/AdminRetailers/ImportRetailersPage";
import Import_purchase_page from "./Component/Panels/Admin/Inventory/PurchasedItems/Import_purchase_page";
import KachaPurchaseInvoiceForm from "./Component/Panels/Admin/KachaPurchase/KachaPurchaseInvoiceForm";
import KachaPurchaseInvoicePDFPreview from "./Component/Panels/Admin/KachaPurchase/KachaPurchaseInvoicePDFPreview";
import KachaPurchaseInvoiceTable from "./Component/Panels/Admin/KachaPurchase/KachaPurchaseInvoiceTable";
import KachaPurchaseVochurTable from "./Component/Panels/Admin/KachaPurchaseVoucher/KachaPurchaseVochurTable";
import KachaPurchaseVoucherView from "./Component/Panels/Admin/KachaPurchaseVoucher/KachaPurchaseVoucherView";
import Kacha_CreditNoteTable from "./Component/Panels/Admin/KachaCreditNote/Kacha_CreditNoteTable";
import KachaCreateNote from "./Component/Panels/Admin/KachaCreditNote/KachaCreateNote";
import Kacha_EditCreditNote from "./Component/Panels/Admin/KachaCreditNote/Kacha_EditCreditNote";
import KachaDebitTableNote from "./Component/Panels/Admin/KachaPurchaseDebit/KachaDebitTableNote";
import KachaCreateDebitNote from "./Component/Panels/Admin/KachaPurchaseDebit/KachaCreateDebitNote";
import KachaEditDebitNote from "./Component/Panels/Admin/KachaPurchaseDebit/KachaEditDebitNote";
import KachaCreditview from "./Component/Panels/Admin/KachaCreditNote/KachaCreditview";
import KachaPurchaseDebitView from "./Component/Panels/Admin/KachaPurchaseDebit/KachaPurchaseDebitView";
import KachaPurchaseInvoiceEdit from "./Component/Panels/Admin/KachaPurchase/KachaPurchaseInvoiceEdit";
import DispatchReportPDF from "./Component/Panels/Admin/Period/DispatchReportPDF";
import HsnReport from "./Component/Panels/Admin/AdminReports/HsnReport";
import PrivateRoute from "./Component/Layouts/PrivateRoute";
import QRCodeGenerator_normal from "./Component/Panels/Admin/SalesInvoicePage/QRCodeGenerator_normal";
import SalesReportdetail from "./Component/Panels/Admin/AdminReports/SalesReportdetail";



function App() {
  return (
    <GoogleOAuthProvider clientId="77643630750-2f13qfdip7lv5npp634cfu70h0ig7vle.apps.googleusercontent.com">
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboards */}
          <Route path="/admindashboard" element={<PrivateRoute allowedRoles={["admin"]}><AdminDashboard /></PrivateRoute>} />
          <Route path="/staffdashboard" element={<PrivateRoute allowedRoles={["staff"]}><StaffDashboard /></PrivateRoute>} />

          {/* Retailers */}
          <Route path="/retailer-home" element={<PrivateRoute allowedRoles={["retailer"]}><RetailerHome /></PrivateRoute>} />
          <Route path="/retailer-history" element={<PrivateRoute allowedRoles={["retailer"]}><RetailerHistory /></PrivateRoute>} />
          <Route path="/retailer-offers" element={<PrivateRoute allowedRoles={["retailer"]}><RetailerOffers /></PrivateRoute>} />
          <Route path="/retailer-profile" element={<PrivateRoute allowedRoles={["retailer"]}><RetailerProfile /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute allowedRoles={["retailer", "admin"]}><Profile /></PrivateRoute>} />
          <Route path="/retailer-orders" element={<PrivateRoute allowedRoles={["retailer"]}><RetailerOrders /></PrivateRoute>} />
          {/* <Route path="/retailer-profile/:id?" element={<RetailerProfile />} /> */}

          <Route path="/reports/retailer-report-page" element={<PrivateRoute allowedRoles={["admin"]}><RetailerReportPage /></PrivateRoute>} />

          {/* Staff Mobile Pages */}
          <Route path="/staff/retailers" element={<PrivateRoute allowedRoles={["staff"]}><MyRetailers /></PrivateRoute>} />
          <Route path="/staff/add-retailer" element={<PrivateRoute allowedRoles={["staff"]}><AddRetailer /></PrivateRoute>} />
          <Route path="/staff/sales-visits" element={<PrivateRoute allowedRoles={["staff"]}><SalesVisits /></PrivateRoute>} />
          <Route path="/staff/log-visit" element={<PrivateRoute allowedRoles={["staff"]}><LogVisit /></PrivateRoute>} />
          <Route path="/staff/expences" element={<PrivateRoute allowedRoles={["staff"]}><StaffExpenses /></PrivateRoute>} />
          <Route path="/staff/add-expense" element={<PrivateRoute allowedRoles={["staff"]}><AddExpense /></PrivateRoute>} />

          {/* Admin Pages */}
          <Route path="/staff/offers" element={<PrivateRoute allowedRoles={["staff"]}><StaffOffers /></PrivateRoute>} />
          <Route path="/retailers/place-order" element={<PrivateRoute allowedRoles={["admin"]}><PlaceSalesOrder /></PrivateRoute>} />
          <Route path="/retailers/cart" element={<PrivateRoute allowedRoles={["admin"]}><CartPage /></PrivateRoute>} />
          <Route path="/retailers/checkout" element={<PrivateRoute allowedRoles={["admin"]}><Checkout /></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute allowedRoles={["admin"]}><AdminStaff /></PrivateRoute>} />
          <Route path="/staff/add" element={<PrivateRoute allowedRoles={["admin"]}><AddStaff /></PrivateRoute>} />
          <Route path="/sale" element={<PrivateRoute allowedRoles={["admin"]}><AdminSales /></PrivateRoute>} />
          <Route path="/sales/invoices" element={<PrivateRoute allowedRoles={["admin"]}><SalesInvoiceTable /></PrivateRoute>} />
          <Route path="/sales/createinvoice" element={<PrivateRoute allowedRoles={["admin"]}><SalesInvoiceForm /></PrivateRoute>} />
          <Route path="/sales/createinvoice/:id" element={<PrivateRoute allowedRoles={["admin"]}><SalesInvoiceForm /></PrivateRoute>} />
          <Route path="/sales/invoice-preview/:id" element={<PrivateRoute allowedRoles={["admin"]}><InvoicePDFPreview /></PrivateRoute>} />
          <Route path="/purchase/invoice-preview/:id" element={<PrivateRoute allowedRoles={["admin"]}><PurchasePDFPreview /></PrivateRoute>} />
          <Route path="/sales/invoice-preview" element={<PrivateRoute allowedRoles={["admin"]}><InvoicePDFPreview /></PrivateRoute>} />
          {/* <Route path="/purchase/invoice-preview" element={<PurchasePDFPreview />} /> */}
          <Route path="/Purchase/editinvoice/:id" element={<PrivateRoute allowedRoles={["admin"]}><PurchaseInvoiceEdit /></PrivateRoute>} />
          <Route path="/sales/receipts" element={<PrivateRoute allowedRoles={["admin"]}><AdminReceiptsTable /></PrivateRoute>} />
          {/* <Route path="/createreceipt" element={<CreateReceiptForm />} /> */}
          <Route path="/sales/quotations" element={<PrivateRoute allowedRoles={["admin"]}><QuotationsTable /></PrivateRoute>} />
          <Route path="/sales/bill_of_supply" element={<PrivateRoute allowedRoles={["admin"]}><BillOfSupplyTable /></PrivateRoute>} />
          <Route path="/sales/credit_note" element={<PrivateRoute allowedRoles={["admin"]}><CreditNoteTable /></PrivateRoute>} />
          <Route path="/sales/delivery_challan" element={<PrivateRoute allowedRoles={["admin"]}><DeliveryChallanTable /></PrivateRoute>} />
          <Route path="/sales/receivables" element={<PrivateRoute allowedRoles={["admin"]}><ReceivablesTable /></PrivateRoute>} />
          <Route path="/sales/add" element={<PrivateRoute allowedRoles={["admin"]}><AddSales /></PrivateRoute>} />
          <Route path="/staff/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><AddStaff /></PrivateRoute>} />
          <Route path="/product" element={<PrivateRoute allowedRoles={["admin"]}><AdminProducts /></PrivateRoute>} />
          <Route path="/purchase/purchase-invoice" element={<PrivateRoute allowedRoles={["admin"]}><PurchaseInvoiceTable /></PrivateRoute>} />
          <Route path="/purchase/create-purchase-invoice" element={<PrivateRoute allowedRoles={["admin"]}><CreatePurchaseInvoiceForm /></PrivateRoute>} />
          <Route path="/purchase/purchase-order" element={<PrivateRoute allowedRoles={["admin"]}><PurchaseOrderTable /></PrivateRoute>} />
          <Route path="/purchase/voucher" element={<PrivateRoute allowedRoles={["admin"]}><VoucherTable /></PrivateRoute>} />
          <Route path="/purchase/debit-note" element={<PrivateRoute allowedRoles={["admin"]}><DebitNoteTable /></PrivateRoute>} />
          <Route path="/purchase/debit_note" element={<PrivateRoute allowedRoles={["admin"]}><CreateDebitNote /></PrivateRoute>} />
          <Route path="/purchase/debit-note/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><EditDebitNote /></PrivateRoute>} />
          <Route path="/purchase/payables" element={<PrivateRoute allowedRoles={["admin"]}><PayablesTable /></PrivateRoute>} />
          <Route path="/voucher_view/:id" element={<PrivateRoute allowedRoles={["admin"]}><VoucherView /></PrivateRoute>} />
          <Route path="/add-product" element={<PrivateRoute allowedRoles={["admin"]}><AddProduct /></PrivateRoute>} />
          <Route path="/marketing" element={<PrivateRoute allowedRoles={["admin"]}><AdminMarketing /></PrivateRoute>} />
          <Route path="/add-marketing" element={<PrivateRoute allowedRoles={["admin"]}><AddMarketing /></PrivateRoute>} />
          {/* <Route path="/admin/marketing/global-offers" element={<GlobalOffers />} /> */}
          {/* <Route path="/admin/marketing/category-offers" element={<CategorySpecificOffers />} /> */}
          {/* <Route path="/admin/marketing/flash-sales" element={<FlashSales />} />| */}
          <Route path="/admin/marketing/offers-postings" element={<PrivateRoute allowedRoles={["admin"]}><OffersPostings /></PrivateRoute>} />
          {/* <Route path="/admin/marketing/global-offers" element={<GlobalOffers />} />
          <Route path="/admin/marketing/category-offers" element={<CategorySpecificOffers />} />
          <Route path="/admin/marketing/flash-sales" element={<FlashSales />} />|
          <Route path="/admin/marketing/offers-postings" element={<OffersPostings />} /> */}

          <Route path="/profile" element={<PrivateRoute allowedRoles={["retailer", "admin"]}><Profile /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute allowedRoles={["retailer", "admin"]}><EditProfile /></PrivateRoute>} />
          <Route path="/profile/delete" element={<PrivateRoute allowedRoles={["retailer", "admin"]}><DeleteProfile /></PrivateRoute>} />

          <Route path="/retailers" element={<PrivateRoute allowedRoles={["admin"]}><AdminRetailers /></PrivateRoute>} />
          <Route path="/retailers/add" element={<PrivateRoute allowedRoles={["admin"]}><AddRetailerForm mode="add" /></PrivateRoute>} />
          <Route path="/retailers/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><AddRetailerForm mode="edit" /></PrivateRoute>} />
          <Route path="/retailers/view/:id" element={<PrivateRoute allowedRoles={["admin"]}><AddRetailerForm mode="view" /></PrivateRoute>} />

          <Route path="/expenses" element={<PrivateRoute allowedRoles={["admin"]}><AdminExpenses /></PrivateRoute>} />
          <Route path="/expenses/add" element={<PrivateRoute allowedRoles={["admin"]}><AddExpenses /></PrivateRoute>} />
          <Route path="/reports/expense-report-page" element={<PrivateRoute allowedRoles={["admin"]}><ExpenseReportPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute allowedRoles={["admin"]}><AdminReports /></PrivateRoute>} />
          <Route path="/roleaccess" element={<PrivateRoute allowedRoles={["admin"]}><AdminRoleAccess /></PrivateRoute>} />
          <Route path="/sales_visit" element={<PrivateRoute allowedRoles={["admin"]}><SalesVisit /></PrivateRoute>} />
          <Route path="/sales_visit/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><SalesVisit mode="edit" /></PrivateRoute>} />
          <Route path="/sales_visit/view/:id" element={<PrivateRoute allowedRoles={["admin"]}><SalesVisit mode="view" /></PrivateRoute>} />

          <Route path="/purchased_items" element={<PrivateRoute allowedRoles={["admin"]}><PurchasedItems /></PrivateRoute>} />
          <Route path="/sale_items" element={<PrivateRoute allowedRoles={["admin"]}><SalesItems /></PrivateRoute>} />
          <Route path='/AddProductPage' element={<PrivateRoute allowedRoles={["admin"]}><AddProductPage /></PrivateRoute>} />
          <Route path="/AddProductPage/:productId" element={<PrivateRoute allowedRoles={["admin"]}><AddProductPage /></PrivateRoute>} />
          <Route path='/salesitemspage/:productId' element={<PrivateRoute allowedRoles={["admin"]}><SalesItemsPage /></PrivateRoute>} />
          <Route path='/salesitemspage' element={<PrivateRoute allowedRoles={["admin"]}><SalesItemsPage /></PrivateRoute>} />
          <Route path="/addcompanymodal " element={<PrivateRoute allowedRoles={["admin"]}><AddCompanyModal /></PrivateRoute>} />
          <Route path="/addcategorymodal" element={<PrivateRoute allowedRoles={["admin"]}><AddCategoryModal /></PrivateRoute>} />
          <Route path="/stockdetailsmodule" element={<PrivateRoute allowedRoles={["admin"]}><StockDetailsModal /></PrivateRoute>} />
          <Route path="/deductstockmodal" element={<PrivateRoute allowedRoles={["admin"]}><DeductStockModal /></PrivateRoute>} />
          <Route path="/addstockmodal" element={<PrivateRoute allowedRoles={["admin"]}><AddStockModal /></PrivateRoute>} />
          <Route path="/addservicemodal" element={<PrivateRoute allowedRoles={["admin"]}><AddServiceModal /></PrivateRoute>} />

          <Route path="/staff_expensive" element={<PrivateRoute allowedRoles={["staff"]}><Staff_expensive /></PrivateRoute>} />
          <Route path="/staff_add_expensive" element={<PrivateRoute allowedRoles={["staff"]}><Staff_Add_expensive /></PrivateRoute>} />
          <Route path="/admin_expensive" element={<PrivateRoute allowedRoles={["admin"]}><AdminExpensiveRequest /></PrivateRoute>} />
          <Route path="/admin_expensive/view/:id" element={<PrivateRoute allowedRoles={["admin"]}><AdminExpensiveRequest mode="view" /></PrivateRoute>} />
          <Route path="/admin_expensive/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><AdminExpensiveRequest mode="edit" /></PrivateRoute>} />
          <Route path="/salesitems_productdetails/:id" element={<PrivateRoute allowedRoles={["admin"]}><Salesitems_productsdetails /></PrivateRoute>} />
          <Route path="/receipts_view/:id" element={<PrivateRoute allowedRoles={["admin"]}><ReceiptView /></PrivateRoute>} />
          <Route path="/addunitsmodal" element={<PrivateRoute allowedRoles={["admin"]}><AddUnitModal /></PrivateRoute>} />

          <Route path="/category" element={<PrivateRoute allowedRoles={["admin"]}><Category /></PrivateRoute>} />
          <Route path="/category/:id" element={<PrivateRoute allowedRoles={["admin"]}><Category /></PrivateRoute>} />
          <Route path="/company" element={<PrivateRoute allowedRoles={["admin"]}><Company /></PrivateRoute>} />
          <Route path="/company/:id" element={<PrivateRoute allowedRoles={["admin"]}><Company /></PrivateRoute>} />
          <Route path="/units" element={<PrivateRoute allowedRoles={["admin"]}><Units /></PrivateRoute>} />
          <Route path="/ledger" element={<PrivateRoute allowedRoles={["admin"]}><Ledger /></PrivateRoute>} />

          <Route path="/sales/credit-note/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><EditCreditNote /></PrivateRoute>} />
          <Route path="/sales/create_note" element={<PrivateRoute allowedRoles={["admin"]}><CreateNote /></PrivateRoute>} />
          <Route path="/units/:id" element={<PrivateRoute allowedRoles={["admin"]}><Units /></PrivateRoute>} />

          <Route path="/reports/sales-report-page" element={<PrivateRoute allowedRoles={["admin"]}><SalesReportPage /></PrivateRoute>} />
          <Route path="/creditview/:id" element={<PrivateRoute allowedRoles={["admin"]}><Creditsview /></PrivateRoute>} />

          <Route path="/credit-period" element={<PrivateRoute allowedRoles={["admin"]}><CreditPeriodTable /></PrivateRoute>} />
          <Route path="/credit-period-fix/add" element={<PrivateRoute allowedRoles={["admin"]}><AddCreditPeriodFix /></PrivateRoute>} />
          <Route path="/credit-period-fix/edit/:id" element={<PrivateRoute allowedRoles={["admin"]}><AddCreditPeriodFix /></PrivateRoute>} />

          {/* Kacha Sales */}
          <Route path="/kachinvoicetable" element={<PrivateRoute allowedRoles={["admin"]}><KachaInvoiceTable /></PrivateRoute>} />
          <Route path="/kacha_sales" element={<PrivateRoute allowedRoles={["admin"]}><KachaSalesInvoiceForm /></PrivateRoute>} />
          <Route path="/kacha_sales/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaSalesInvoiceForm /></PrivateRoute>} />
          <Route path="/kachainvoicepdf/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaInvoicePDFPreview /></PrivateRoute>} />
          <Route path="/period" element={<PrivateRoute allowedRoles={["admin"]}><Period /></PrivateRoute>} />
          <Route path="/periodinvoicepreviewpdf" element={<PrivateRoute allowedRoles={["admin"]}><Period_InvoicePDFPreview /></PrivateRoute>} />
          <Route path="/periodinvoicepreviewpdf/:id" element={<PrivateRoute allowedRoles={["admin"]}><Period_InvoicePDFPreview /></PrivateRoute>} />
          <Route path="/invoicepreview_preivew" element={<PrivateRoute allowedRoles={["admin"]}><InvoicePreview_preview /></PrivateRoute>} />
          <Route path="/receiptmodal_preview" element={<PrivateRoute allowedRoles={["admin"]}><ReceiptModal_preview /></PrivateRoute>} />
          <Route path="/QRCodeGenerator" element={<PrivateRoute allowedRoles={["admin"]}><QRCodeGenerator /></PrivateRoute>} />
          <Route path="/debitnote_view/:id" element={<PrivateRoute allowedRoles={["admin"]}><DebitView /></PrivateRoute>} />
          <Route path="/retailersscore" element={<PrivateRoute allowedRoles={["admin"]}><RetailersScore /></PrivateRoute>} />
          <Route path="/kachareceipts" element={<PrivateRoute allowedRoles={["admin"]}><KachaReceiptsTable /></PrivateRoute>} />
          <Route path="/salesmanscore" element={<PrivateRoute allowedRoles={["admin"]}><SalesPersonScore /></PrivateRoute>} />
          <Route path="/import-sales" element={<PrivateRoute allowedRoles={["admin"]}><ImportSalesPage /></PrivateRoute>} />
          <Route path="/retailers/import" element={<PrivateRoute allowedRoles={["admin"]}><ImportRetailersPage /></PrivateRoute>} />
          <Route path="/export-sales" element={<PrivateRoute allowedRoles={["admin"]}><ExportSalesPage /></PrivateRoute>} />
          <Route path="/salespdfdocument" element={<PrivateRoute allowedRoles={["admin"]}><SalesPdfDocument /></PrivateRoute>} />
          <Route path="/kachareceipts_view/:id" element={<PrivateRoute allowedRoles={["admin"]}><Kachareceiptview /></PrivateRoute>} />
          <Route path="/import_purchase" element={<PrivateRoute allowedRoles={["admin"]}><Import_purchase_page /></PrivateRoute>} />
          <Route path="/kachapurchaseinvoice" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseInvoiceForm /></PrivateRoute>} />
          <Route path="/kachapurchasepdf/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseInvoicePDFPreview /></PrivateRoute>} />
          <Route path="/kachapurchasepdf" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseInvoicePDFPreview /></PrivateRoute>} />
          <Route path="/kachapurchaseinvoicetable" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseInvoiceTable /></PrivateRoute>} />
          <Route path="/kachaPurchasevoucher" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseVochurTable /></PrivateRoute>} />
          <Route path="/kachaPurchasevoucherview" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseVoucherView /></PrivateRoute>} />
          <Route path="/kachaPurchasevoucherview/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseVoucherView /></PrivateRoute>} />
          <Route path="/kachacreditenotetable" element={<PrivateRoute allowedRoles={["admin"]}><Kacha_CreditNoteTable /></PrivateRoute>} />
          <Route path="/kachacreditenotetable/:id" element={<PrivateRoute allowedRoles={["admin"]}><Kacha_CreditNoteTable /></PrivateRoute>} />
          <Route path="/kachacreditenote" element={<PrivateRoute allowedRoles={["admin"]}><KachaCreateNote /></PrivateRoute>} />
          <Route path='/kachaeditcreditnote' element={<PrivateRoute allowedRoles={["admin"]}><Kacha_EditCreditNote /></PrivateRoute>} />
          <Route path='/kachaeditcreditnote/:id' element={<PrivateRoute allowedRoles={["admin"]}><Kacha_EditCreditNote /></PrivateRoute>} />
          <Route path='/kachadebitnotetable' element={<PrivateRoute allowedRoles={["admin"]}><KachaDebitTableNote /></PrivateRoute>} />
          <Route path="/kachadebitnote/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaCreateDebitNote /></PrivateRoute>} />
          <Route path="/kachadebitnote" element={<PrivateRoute allowedRoles={["admin"]}><KachaCreateDebitNote /></PrivateRoute>} />
          <Route path="/kachaeditdebitenote" element={<PrivateRoute allowedRoles={["admin"]}><KachaEditDebitNote /></PrivateRoute>} />
          <Route path="/kachaeditdebitenote/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaEditDebitNote /></PrivateRoute>} />
          <Route path="/kachacreditview/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaCreditview /></PrivateRoute>} />
          <Route path="/kachadebitenoteview/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseDebitView /></PrivateRoute>} />
          <Route path="/kachapurchaseedit/:id" element={<PrivateRoute allowedRoles={["admin"]}><KachaPurchaseInvoiceEdit /></PrivateRoute>} />
          <Route path="/dispatch-report" element={<PrivateRoute allowedRoles={["admin"]}><DispatchReportPDF /></PrivateRoute>} />
          <Route path="/hsn-report" element={<PrivateRoute allowedRoles={["admin"]}><HsnReport /></PrivateRoute>} />
          <Route path="/qrcodenormal" element={<PrivateRoute allowedRoles={["admin"]}><QRCodeGenerator_normal /></PrivateRoute>} />
          <Route path="/salesreportdetail" element={<PrivateRoute allowedRoles={["admin"]}><SalesReportdetail /></PrivateRoute>} />
          <Route path="/salesreportdetail/:id" element={<PrivateRoute allowedRoles={["admin"]}><SalesReportdetail /></PrivateRoute>} />

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;