import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import LedgerPDF from "./LedgerPDF";
import html2pdf from "html2pdf.js";
import ReusableTable from "../../../Layouts/TableLayout/ReusableTable";
import "./Ledger.css";

const Ledger = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const pdfContentRef = useRef(null);
  const [orderModeFilter, setOrderModeFilter] = useState("ALL");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchLedger();
    fetchVoucherList();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(`${baseurl}/ledger`);
      setLedgerData(res.data);
    } catch (err) {
      console.error("Error fetching ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${baseurl}/accounts`);
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const getPartyOpeningBalance = (partyID) => {
    const account = accounts.find((acc) => acc.id === parseInt(partyID));
    if (!account) return { balance: 0, type: null };
    const balance = parseFloat(account.opening_balance || 0);
    const type = account.opening_balance_type || null;
    return { balance, type };
  };

  const fetchVoucherList = async () => {
    try {
      const res = await axios.get(`${baseurl}/voucher-list`);
      setVoucherList(res.data);
    } catch (err) {
      console.error("Error fetching voucher list:", err);
    }
  };

  const findVoucherByNumber = (voucherNumber) => {
    return voucherList.find(
      (voucher) =>
        voucher.InvoiceNumber === voucherNumber ||
        voucher.VchNo === voucherNumber
    );
  };

  const handleVoucherClick = (voucherNumber, ledgerTransactionType, transaction) => {
    const transType = ledgerTransactionType?.toLowerCase() || "";

    if (transType === "debitnote" || transType === "creditnote") {
      const dbId = transaction.id;
      if (transType === "debitnote") {
        if (transaction.data_type?.toLowerCase() === "purchase") {
          navigate(`/debitnote_view/${dbId}`);
        } else if (transaction.data_type?.toLowerCase() === "stock inward") {
          navigate(`/kachadebitenoteview/${dbId}`);
        }
      } else if (transType === "creditnote") {
        if (transaction.data_type?.toLowerCase() === "sales") {
          navigate(`/creditview/${dbId}`);
        } else if (transaction.data_type?.toLowerCase() === "stock transfer") {
          navigate(`/kachacreditview/${dbId}`);
        }
      }
      return;
    }

    const voucher = findVoucherByNumber(voucherNumber);
    if (!voucher) {
      console.error("Voucher not found:", voucherNumber);
      return;
    }

    const transactionType = voucher.TransactionType?.toLowerCase() || "";
    const dataType = voucher.data_type?.toLowerCase() || "";
    const voucherId = voucher.VoucherID;
    const ledgerTransType = ledgerTransactionType?.toLowerCase() || "";

    console.log("Voucher clicked:", { transactionType, dataType, voucherId, ledgerTransType });

    if (ledgerTransType === "receipt" || ledgerTransType === "purchase voucher") {
      if (dataType === "sales") navigate(`/receipts_view/${voucherId}`);
      else if (dataType === "purchase") navigate(`/voucher_view/${voucherId}`);
      else if (dataType === "stock transfer") navigate(`/kachareceipts_view/${voucherId}`);
      else if (dataType === "stock inward") navigate(`/kachaPurchasevoucherview/${voucherId}`);
      else navigate(`/voucher_view/${voucherId}`);
      return;
    }

    if (transactionType === "stock transfer" || ledgerTransType === "stock transfer") {
      navigate(`/kachainvoicepdf/${voucherId}`);
    } else if (transactionType === "stock inward" || ledgerTransType === "stock inward") {
      navigate(`/kachapurchasepdf/${voucherId}`);
    } else if (transactionType === "sales" || ledgerTransType === "sales") {
      navigate(`/sales/invoice-preview/${voucherId}`);
    } else if (transactionType === "purchase" || ledgerTransType === "purchase") {
      navigate(`/purchase/invoice-preview/${voucherId}`);
    }
  };

  const getVoucherDisplay = (voucherNumber, transactionType) => {
    const voucher = findVoucherByNumber(voucherNumber);
    const transType = transactionType?.toLowerCase() || "";
    if (transType === "debitnote" || transType === "creditnote") return voucherNumber;
    if (!voucher) return voucherNumber;
    if (transType === "receipt" || transType === "purchase voucher") return voucher.VchNo || voucherNumber;
    return voucher.InvoiceNumber || voucher.VchNo || voucherNumber;
  };

  const matchesOrderMode = (transaction) => {
    if (orderModeFilter === "ALL") return true;
    const trantype = transaction.trantype?.toLowerCase() || "";
    const dataType = transaction.data_type?.toLowerCase() || "";
    if (orderModeFilter === "PAKKA") {
      return (
        trantype === "purchase" ||
        trantype === "sales" ||
        trantype === "credit note" ||
        trantype === "debit note" ||
        dataType === "sales" ||
        dataType === "purchase"
      );
    } else if (orderModeFilter === "KACHA") {
      return (
        trantype === "stock inward" ||
        trantype === "stock transfer" ||
        trantype === "credit note" ||
        trantype === "debit note" ||
        dataType === "stock inward" ||
        dataType === "stock transfer"
      );
    }
    return true;
  };

  const groupedLedger = ledgerData.reduce((acc, entry) => {
    const key = entry.PartyID || "Unknown";
    if (!matchesOrderMode(entry)) return acc;
    if (!acc[key]) {
      acc[key] = {
        partyID: entry.PartyID || "Unknown",
        partyName: entry.PartyName || "Unknown Party",
        transactions: [],
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
      };
    }
    acc[key].transactions.push(entry);
    acc[key].transactions.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    const amount = parseFloat(entry.Amount || 0);
    if (entry.DC === "D") acc[key].totalDebit += amount;
    else if (entry.DC === "C") acc[key].totalCredit += amount;
    acc[key].balance = acc[key].totalCredit - acc[key].totalDebit;
    return acc;
  }, {});

  const groupedArray = Object.values(groupedLedger);

  // ── helper: convert UTC ISO string → local YYYY-MM-DD ──
  const getLocalDateStr = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day   = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ── filteredLedger uses APPLIED dates only (set on button click) ──
  const filteredLedger = groupedArray.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partyID.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (appliedStartDate || appliedEndDate) {
      const hasMatchingTx = item.transactions.some((tx) => {
        const txDate = getLocalDateStr(tx.date);
        if (!txDate) return false;
        if (appliedStartDate && appliedEndDate) return txDate >= appliedStartDate && txDate <= appliedEndDate;
        if (appliedStartDate) return txDate >= appliedStartDate;
        if (appliedEndDate)   return txDate <= appliedEndDate;
        return true;
      });
      if (!hasMatchingTx) return false;
    }

    return true;
  });

  // ── Apply button: copy input dates → applied dates ──
  const handleApplyFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setIsFiltered(true);
  };

  // ── Clear button: reset everything ──
  const handleClearFilter = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setIsFiltered(false);
    setOrderModeFilter("ALL");
  };

  const exportToPDF = async () => {
    if (filteredLedger.length === 0) {
      alert("No data to export");
      return;
    }
    setExportLoading(true);
    try {
      const element = pdfContentRef.current;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `ledger_report_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true, useCORS: true, logging: true },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
        pagebreak: {
          mode: ["css", "legacy"],
          before: ".pdf-party-section",
          after: ["pdf-summary-page", "pdf-details-page"],
        },
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const ledgerColumns = [
    {
      key: "partyID",
      title: "",
      render: (_, ledger) => {
        const balanceType = ledger.balance >= 0 ? "Cr" : "Dr";
        const balanceAmt = Math.abs(ledger.balance).toFixed(2);
        const openingBalanceData = getPartyOpeningBalance(ledger.partyID);
        const openingBalanceNum = openingBalanceData.balance;
        const openingBalanceType = openingBalanceData.type;

        const openingBalanceDisplay = openingBalanceType
          ? `₹${openingBalanceNum.toFixed(2)} ${openingBalanceType === "Debit" ? "Dr" : "Cr"}`
          : `₹${openingBalanceNum.toFixed(2)}`;

        // ── inner rows also filtered by APPLIED dates ──
        const sortedTransactions = [...ledger.transactions]
          .filter((tx) => {
            if (!appliedStartDate && !appliedEndDate) return true;
            const txDate = getLocalDateStr(tx.date);
            if (!txDate) return false;
            if (appliedStartDate && appliedEndDate) return txDate >= appliedStartDate && txDate <= appliedEndDate;
            if (appliedStartDate) return txDate >= appliedStartDate;
            if (appliedEndDate)   return txDate <= appliedEndDate;
            return true;
          })
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateA - dateB;
          });

        let runningBalance = openingBalanceNum;

        if (openingBalanceType === "Credit") {
          runningBalance = -openingBalanceNum;
        }

        const transactionsWithBalance = sortedTransactions.map((tx) => {
          const amount = parseFloat(tx.Amount || 0);
          const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();

          if (openingBalanceType === "Debit") {
            if (dc === "D") runningBalance = runningBalance + amount;
            else if (dc === "C") runningBalance = runningBalance - amount;
          } else if (openingBalanceType === "Credit") {
            if (dc === "D") runningBalance = runningBalance + amount;
            else if (dc === "C") runningBalance = runningBalance - amount;
          } else {
            if (dc === "D") runningBalance = runningBalance + amount;
            else if (dc === "C") runningBalance = runningBalance - amount;
          }

          return { ...tx, runningBalance };
        });

        return (
          <div className="ledger-party-section">
            {/* Party Header */}
            <div className="ledger-party-header">
              {ledger.partyName} (ID: {ledger.partyID}) —
              {orderModeFilter === "ALL" && ` Opening Balance: ${openingBalanceDisplay} | `}
              Balance: {balanceAmt} {balanceType}
            </div>

            {/* Transactions Table */}
            <table className="ledger-transactions-table">
              <thead>
                <tr>
                  <th>Transaction Date</th>
                  <th>Transaction Type</th>
                  <th>Rec/Vou No</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  {orderModeFilter === "ALL" && <th>Balance</th>}
                </tr>
              </thead>
              <tbody>
                {transactionsWithBalance.map((tx, idx) => {
                  const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();
                  const voucherId = tx.voucherID;
                  const voucherDisplay = getVoucherDisplay(voucherId, tx.trantype);
                  const amount = parseFloat(tx.Amount || 0);
                  const amountDisplay = amount.toFixed(2);
                  const txBalanceDisplay = Math.abs(tx.runningBalance).toFixed(2);
                  const balanceSign = tx.runningBalance >= 0 ? "Dr" : "Cr";

                  return (
                    <tr key={tx.id || idx}>
                      <td>
                        {tx.date
                          ? new Date(tx.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td>{tx.trantype || "-"}</td>
                      <td>
                        {voucherId ? (
                          <span
                            onClick={() => handleVoucherClick(voucherId, tx.trantype, tx)}
                            className="ledger-voucher-link"
                            title="Click to view invoice"
                          >
                            {voucherDisplay}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {dc === "C" ? (
                          <span className="ledger-credit-amount">{amountDisplay}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {dc === "D" ? (
                          <span className="ledger-debit-amount">{amountDisplay}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      {orderModeFilter === "ALL" && (
                        <td>
                          <span className="ledger-balance-amount">
                            {txBalanceDisplay} {balanceSign}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      },
    },
  ];

  return (
    <div className="ledger-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`ledger-main-content ${isCollapsed ? "ledger-main-content--collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="ledger-container">

          {/* Search Filters */}
          <div className="ledger-filters">
            <div className="ledger-filters-left">

              {/* Search */}
              <div className="ledger-filter-group">
                <label className="ledger-filter-label">Search:</label>
                <input
                  type="text"
                  placeholder="Search by Name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ledger-search-input"
                />
              </div>

              {/* From Date */}
              <div className="ledger-filter-group">
                <label className="ledger-filter-label">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ledger-date-input"
                />
              </div>

              {/* To Date */}
              <div className="ledger-filter-group">
                <label className="ledger-filter-label">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="ledger-date-input"
                />
              </div>

              {/* Apply / Clear toggle button */}
              {(searchTerm || startDate || endDate || orderModeFilter !== "ALL") && (
                <>
                  {isFiltered ? (
                    <button
                      onClick={handleClearFilter}
                      className="ledger-clear-filters-btn ledger-clear-filters-btn--active"
                    >
                      Clear Filter
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyFilter}
                      className="ledger-clear-filters-btn-apply-filter"
                    >
                      Apply Filter
                    </button>
                  )}
                </>
              )}

            </div>

            {/* Export PDF */}
            <button
              onClick={exportToPDF}
              disabled={exportLoading || filteredLedger.length === 0}
              className={`ledger-export-btn ${exportLoading ? "ledger-export-btn--loading" : ""}`}
            >
              {exportLoading ? (
                <>
                  <span className="ledger-spinner" role="status" aria-hidden="true"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg
                    className="ledger-export-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>

<div className="ledger-order-mode">
  {["ALL", "PAKKA", "KACHA"].map((mode) => (
    <button
      key={mode}
      onClick={() => {
        setOrderModeFilter(mode);
        if (mode !== "ALL") {
          setIsFiltered(true);
        } else {
          setIsFiltered(false);
        }
      }}
      className={`ledger-order-btn ${orderModeFilter === mode ? "ledger-order-btn--active" : ""}`}
    >
      {mode}
    </button>
  ))}
</div>

          <div className="ledger-pdf-hidden">
            <LedgerPDF
              ref={pdfContentRef}
              filteredLedger={filteredLedger}
              getPartyOpeningBalance={getPartyOpeningBalance}
              orderModeFilter={orderModeFilter}
            />
          </div>

          {/* Loading / ReusableTable */}
          {loading ? (
            <div className="ledger-loading-container">
              <div className="ledger-spinner ledger-spinner--large" role="status">
                <span className="ledger-visually-hidden">Loading...</span>
              </div>
              <p className="ledger-loading-text">Loading ledger...</p>
            </div>
          ) : (
            <div className="ledger-table-wrapper">
              <ReusableTable
                data={filteredLedger}
                columns={ledgerColumns}
                initialEntriesPerPage={10}
                showSearch={false}
                showEntriesSelector={true}
                showPagination={true}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Ledger;