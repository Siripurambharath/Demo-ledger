
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./ExpenseReportPage.css";
import { baseurl } from "../../../BaseURL/BaseURL";

const ExpenseReportPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: "expense_id", direction: "asc" });

  const [showModal, setShowModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [recentReports, setRecentReports] = useState([]);

  // ✅ Fetch expenses (All if no date filter)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${baseurl}/api/reports/expense-report`;
        const params = {};
        if (fromDate && toDate) {
          params.fromDate = fromDate;
          params.toDate = toDate;
        }
        const res = await axios.get(url, { params });
        setData(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching expenses:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fromDate, toDate]);

  // ✅ Search + Sort
  const filtered = useMemo(() => {
    let result = [...data];
    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter(
        (r) =>
          r.staff?.toLowerCase().includes(term) ||
          r.category?.toLowerCase().includes(term) ||
          r.status?.toLowerCase().includes(term) ||
          r.payment_status?.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortConfig]);

  // ✅ Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / entries));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * entries;
  const endIdx = Math.min(startIdx + entries, total);
  const pageRows = filtered.slice(startIdx, endIdx);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleEntriesChange = (e) => {
    setEntries(Number(e.target.value));
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // ✅ Generate Report
  const handleGenerate = async () => {
    try {
      const res = await axios.post(
        `${baseurl}/api/reports/expense-report/download`,
        { fromDate: fromDate || null, toDate: toDate || null, format: reportFormat },
        { responseType: "blob" }
      );

      const fileName = `Expense_Report_${fromDate || "ALL"}_${toDate || "ALL"}.${
        reportFormat === "pdf" ? "pdf" : "xlsx"
      }`;

      const blob =
        reportFormat === "pdf"
          ? new Blob([res.data], { type: "application/pdf" })
          : new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      setRecentReports((prev) => [
        {
          id: Date.now(),
          name: "Expense Report",
          fileName,
          format: reportFormat,
          from: fromDate || "ALL",
          to: toDate || "ALL",
          timestamp: new Date().toLocaleString(),
          blob,
        },
        ...prev,
      ]);

      setShowModal(false);
    } catch (err) {
      console.error("❌ Error downloading report:", err);
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  };

  return (
    <div className="expense-report-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`expense-report-main ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="expense-report-wrapper">
          <div className="expense-report-container">
            <div className="expense-report-header">
              <h2 className="expense-report-title">Expense Report</h2>
              <div className="expense-report-filterbar">
                <div className="date-field">
                  <label>From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="date-field">
                  <label>To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <button
                  className="expense-report-btn success"
                  onClick={() => setShowModal(true)}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="expense-report-controls">
              <label>
                Show{" "}
                <select value={entries} onChange={handleEntriesChange}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>{" "}
                entries
              </label>
              <label>
                Search:{" "}
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="expense-report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Staff</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No matching records found</td>
                    </tr>
                  ) : (
                    pageRows.map((r, i) => (
                      <tr key={r.expense_id}>
                        <td>{r.expense_id}</td>
                        <td>{r.staff}</td>
                        <td>{r.category}</td>
                        <td>{r.amount}</td>
                        <td>{formatDate(r.expense_date)}</td>
                        <td>{r.status}</td>
                        <td>{r.payment_status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            <div className="expense-report-footer">
              <div>
                {total === 0
                  ? "Showing 0 to 0 of 0 entries"
                  : `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`}
              </div>
              <div className="expense-report-pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button onClick={handleNext} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </div>

            {recentReports.length > 0 && (
              <div className="expense-report-recent-reports">
                {recentReports.map((r) => (
                  <div key={r.id} className="expense-report-report-item">
                    <span>
                      {r.name} • {r.format.toUpperCase()} • Range: {r.from} → {r.to} •{" "}
                      {r.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="expense-report-modal">
            <div className="expense-report-modal-content">
              <button
                className="expense-report-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
              <div className="expense-report-modal-title">Generate Expense Report</div>
              <div className="expense-report-modal-options">
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={reportFormat === "pdf"}
                    onChange={(e) => setReportFormat(e.target.value)}
                  />
                  PDF
                </label>
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={reportFormat === "excel"}
                    onChange={(e) => setReportFormat(e.target.value)}
                  />
                  Excel
                </label>
              </div>
              <button className="expense-report-generate-btn" onClick={handleGenerate}>
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseReportPage;
