// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminDashboard from './Component/Panels/Admin';
// import StaffDashboard from './Component/Panels/Staff/StaffDashboard/StaffDashboard';
// import RetailerDashboard from './Component/Panels/Retailer/RetailerDashboard/RetailerDashboard';

// function App() {
//   return (
//     <Router>
//       <div>
//         <Routes>
//           <Route path="/" element={<AdminDashboard />} />
//           <Route path="/staffdashboard" element={<StaffDashboard />} />
//           <Route path="/retailerdashboard" element={<RetailerDashboard />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminDashboard from "./Component/Panels/Admin";
// import StaffDashboard from "./Component/Panels/Staff/StaffDashboard/StaffDashboard";
// import RetailerDashboard from "./Component/Panels/Retailer/RetailerDashboard/RetailerDashboard";
// import Login from "./Component/Panels/Auth/Login";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="" element={<AdminDashboard />} />
//         <Route path="/staffdashboard" element={<StaffDashboard />} />
//         <Route path="/retailerdashboard" element={<RetailerDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



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

// import Category from "./Component/Panels/Admin/Category/CategoryTable"
// import Company from "./Component/Panels/Admin/Company/CompanyTable"
// import Units from "./Component/Panels/Admin/Units/UnitsTable"
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
        <Route path="/dashboard" element={<DashboardCard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />


        {/* Retailers */}
        <Route path="/retailer-home" element={<RetailerHome />} />
        <Route path="/retailer-history" element={<RetailerHistory />} />
        <Route path="/retailer-offers" element={<RetailerOffers />} />
        <Route path="/retailer-profile" element={<RetailerProfile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/retailer-orders" element={<RetailerOrders />} />
        {/* <Route path="/retailer-profile/:id?" element={<RetailerProfile />} /> */}

        <Route path="/reports/retailer-report-page" element={<RetailerReportPage />} />



        {/* Staff Mobile Pages */}
        <Route path="/staff/retailers" element={<MyRetailers />} />
        <Route path="/staff/add-retailer" element={<AddRetailer />} />
        <Route path="/staff/sales-visits" element={<SalesVisits />} />
        <Route path="/staff/log-visit" element={<LogVisit />} />
        <Route path="/staff/expences" element={<StaffExpenses />} />
        <Route path="/staff/add-expense" element={<AddExpense />} />



        {/* Admin  Pages */}
        <Route path="/staff/offers" element={<StaffOffers />} />
        <Route path="/retailers/place-order" element={<PlaceSalesOrder />} />
        <Route path="/retailers/cart" element={<CartPage />} />
        <Route path="/retailers/checkout" element={<Checkout />} />
        <Route path="/staff" element={<AdminStaff />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/sale" element={<AdminSales />} />
        <Route path="/sales/invoices" element={<SalesInvoiceTable />} />
        <Route path="/sales/createinvoice" element={<SalesInvoiceForm />} />

        <Route path="/sales/createinvoice/:id" element={<SalesInvoiceForm />} />
  
        <Route path="/sales/invoice-preview/:id" element={<InvoicePDFPreview />} />
        <Route path="/purchase/invoice-preview/:id" element={<PurchasePDFPreview />} />
        <Route path="/sales/invoice-preview" element={<InvoicePDFPreview />} />
        {/* <Route path="/purchase/invoice-preview" element={<PurchasePDFPreview />} /> */}
        <Route path="/Purchase/editinvoice/:id" element={<PurchaseInvoiceEdit />} />


        <Route path="/sales/receipts" element={<AdminReceiptsTable />} />
        {/* <Route path="/createreceipt" element={<CreateReceiptForm />} /> */}

        <Route path="/sales/quotations" element={<QuotationsTable />} />

        <Route path="/sales/bill_of_supply" element={<BillOfSupplyTable />} />

        <Route path="/sales/credit_note" element={<CreditNoteTable />} />

        <Route path="/sales/delivery_challan" element={<DeliveryChallanTable />} />

        <Route path="/sales/receivables" element={<ReceivablesTable />} />


        <Route path="/sales/add" element={<AddSales />} />
        <Route path="/staff/edit/:id" element={<AddStaff />} />
        <Route path="/product" element={<AdminProducts />} />

        <Route path="/purchase/purchase-invoice" element={<PurchaseInvoiceTable />} />
        <Route path="/purchase/create-purchase-invoice" element={<CreatePurchaseInvoiceForm />} />
        <Route path="/purchase/invoice-preview/:id" element={<PurchasePDFPreview />} />

        <Route path="/purchase/purchase-order" element={<PurchaseOrderTable />} />
        <Route path="/purchase/voucher" element={<VoucherTable />} />
        <Route path="/purchase/debit-note" element={<DebitNoteTable />} />
        <Route path="/purchase/debit_note" element={<CreateDebitNote />} />
        <Route path="/purchase/debit-note/edit/:id" element={<EditDebitNote />} />
        <Route path="/purchase/payables" element={<PayablesTable />} />
        <Route path="/voucher_view/:id" element={<VoucherView />} />

        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/marketing" element={<AdminMarketing />} />
        <Route path="/add-marketing" element={<AddMarketing />} />
        {/* <Route path="/admin/marketing/global-offers" element={<GlobalOffers />} /> */}
        {/* <Route path="/admin/marketing/category-offers" element={<CategorySpecificOffers />} /> */}
        {/* <Route path="/admin/marketing/flash-sales" element={<FlashSales />} />| */}
        <Route path="/admin/marketing/offers-postings" element={<OffersPostings />} />
        {/* <Route path="/admin/marketing/global-offers" element={<GlobalOffers />} />
        <Route path="/admin/marketing/category-offers" element={<CategorySpecificOffers />} />
        <Route path="/admin/marketing/flash-sales" element={<FlashSales />} />|
        <Route path="/admin/marketing/offers-postings" element={<OffersPostings />} /> */}
        

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/delete" element={<DeleteProfile />} />

        <Route path="/retailers" element={<AdminRetailers />} />
        <Route path="/retailers/add" element={<AddRetailerForm mode="add" />} />
        <Route path="/retailers/edit/:id" element={<AddRetailerForm mode="edit" />} />
        <Route path="/retailers/view/:id" element={<AddRetailerForm mode="view" />} />

        <Route path="/expenses" element={<AdminExpenses />} />
        <Route path="/expenses/add" element={<AddExpenses />} />
        <Route path="/reports/expense-report-page" element={<ExpenseReportPage />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/roleaccess" element={<AdminRoleAccess />} />
        <Route path="/sales_visit" element={<SalesVisit />} />
        <Route path="/sales_visit/edit/:id" element={<SalesVisit mode="edit" />} />
        <Route path="/sales_visit/view/:id" element={<SalesVisit mode="view" />} />

        <Route path="/purchased_items" element={<PurchasedItems />} />
        <Route path="/sale_items" element={<SalesItems />} />
        <Route path='/AddProductPage' element={<AddProductPage />} />
        <Route path="/AddProductPage/:productId" element={<AddProductPage />} />
        <Route path='/salesitemspage/:productId' element={<SalesItemsPage />} />
        <Route path='/salesitemspage' element={<SalesItemsPage />} />
        <Route path="/addcompanymodal " element={<AddCompanyModal />} />
        <Route path="/addcategorymodal" element={<AddCategoryModal />} />
        <Route path="/stockdetailsmodule" element={< StockDetailsModal />} />
        <Route path="/deductstockmodal" element={< DeductStockModal />} />
        <Route path="/addstockmodal" element={< AddStockModal />} />
        <Route path="/addservicemodal" element={<AddServiceModal />} />

        <Route path="/staff_expensive" element={<Staff_expensive />} />
        <Route path="/staff_add_expensive" element={<Staff_Add_expensive />} />
        <Route path="/admin_expensive" element={<AdminExpensiveRequest />} />
        <Route path="/admin_expensive/view/:id" element={<AdminExpensiveRequest mode="view" />} />
        <Route path="/admin_expensive/edit/:id" element={<AdminExpensiveRequest mode="edit" />} />
        <Route path="/salesitems_productdetails/:id" element={<Salesitems_productsdetails />} />
        <Route path="/receipts_view/:id" element={<ReceiptView />} />
        <Route path="/addunitsmodal" element={<AddUnitModal />} />

        <Route path="/category" element={<Category />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/company" element={<Company />} />
        <Route path="/company/:id" element={<Company />} />
        <Route path="/units" element={<Units />} />
        <Route path="/ledger" element={<Ledger />} />

        <Route path="/sales/credit-note/edit/:id" element={<EditCreditNote />} />


        <Route path="/sales/create_note" element={<CreateNote />} />

        <Route path="/units/:id" element={<Units />} />


        <Route path="/reports/sales-report-page" element={<SalesReportPage />} />
        <Route path="/creditview/:id" element={<Creditsview />} />

        <Route path="/credit-period" element={<CreditPeriodTable />} />
        <Route path="/credit-period-fix/add" element={<AddCreditPeriodFix />} />
        <Route path="/credit-period-fix/edit/:id" element={<AddCreditPeriodFix />} />



        ||Kacha Sales||
        <Route path="/kachinvoicetable" element={<KachaInvoiceTable />} />
        <Route path="/kacha_sales" element={<KachaSalesInvoiceForm />} />
        <Route path="/kacha_sales/:id" element={<KachaSalesInvoiceForm />} />

        <Route path="/kachainvoicepdf/:id" element={<KachaInvoicePDFPreview />} />
        <Route path="/period" element={<Period />} />
        <Route path="/periodinvoicepreviewpdf" element={<Period_InvoicePDFPreview />} />
        <Route path="/periodinvoicepreviewpdf/:id" element={<Period_InvoicePDFPreview />} />
        <Route path="/invoicepreview_preivew" element={<InvoicePreview_preview />} />
        <Route path="/receiptmodal_preview" element={<ReceiptModal_preview />} />
        <Route path="/QRCodeGenerator" element={<QRCodeGenerator />} />
        <Route path="/debitnote_view/:id" element={<DebitView />} />
        <Route path="/retailersscore" element={<RetailersScore />} />
        <Route path="/kachareceipts" element={<KachaReceiptsTable />} />
        <Route path="/salesmanscore" element={<SalesPersonScore />} />
        <Route path="/import-sales" element={<ImportSalesPage />} />
        <Route path="/retailers/import" element={<ImportRetailersPage />} />
        <Route path="/export-sales" element={<ExportSalesPage />} />
        <Route path="/salespdfdocument" element={<SalesPdfDocument />} />
        <Route path="/kachareceipts_view/:id" element={<Kachareceiptview />} />
        <Route path="/import_purchase" element={<Import_purchase_page />} />
        <Route path="/kachapurchaseinvoice" element={<KachaPurchaseInvoiceForm />} />
        <Route path="/kachapurchasepdf/:id" element={<KachaPurchaseInvoicePDFPreview />} />
                <Route path="/kachapurchasepdf" element={<KachaPurchaseInvoicePDFPreview />} />

        <Route path="/kachapurchaseinvoicetable" element={<KachaPurchaseInvoiceTable />} />
<Route path="/kachaPurchasevoucher" element={<KachaPurchaseVochurTable />} />
<Route path="/kachaPurchasevoucherview" element={<KachaPurchaseVoucherView />} />
<Route path="/kachaPurchasevoucherview/:id" element={<KachaPurchaseVoucherView />} />
<Route path="/kachacreditenotetable"element={<Kacha_CreditNoteTable />} />
<Route path="/kachacreditenotetable/:id"element={<Kacha_CreditNoteTable />} />
<Route path="/kachacreditenote" element={<KachaCreateNote />} />
<Route path='/kachaeditcreditnote' element={<Kacha_EditCreditNote />} />
<Route path='/kachaeditcreditnote/:id' element={<Kacha_EditCreditNote />} />
<Route path='/kachadebitnotetable' element={<KachaDebitTableNote />} />
<Route path="/kachadebitnote/:id" element={<KachaCreateDebitNote />} />
<Route path="/kachadebitnote" element={<KachaCreateDebitNote />} />
<Route path="/kachaeditdebitenote" element={<KachaEditDebitNote />} />
<Route path="/kachaeditdebitenote/:id" element={<KachaEditDebitNote />} />
<Route path="/kachacreditview/:id" element={<KachaCreditview />} />
<Route path="/kachadebitenoteview/:id" element={<KachaPurchaseDebitView />} />

<Route path="/kachapurchaseedit/:id" element={<KachaPurchaseInvoiceEdit />} />

<Route path="/dispatch-report" element={<DispatchReportPDF />} />
<Route path="/hsn-report" element={<HsnReport />} />

      </Routes>
    </Router>

     </GoogleOAuthProvider>
  );
}

export default App;

