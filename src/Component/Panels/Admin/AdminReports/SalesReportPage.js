import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./SalesReportPage.css";
import { baseurl } from "../../../BaseURL/BaseURL";

const SalesReportPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: "invoice_date",
    direction: "desc",
  });

  const [showModal, setShowModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${baseurl}/api/reports/sales-report`;
        const params = {};
        if (fromDate && toDate) {
          params.fromDate = fromDate;
          params.toDate = toDate;
        }
        const res = await axios.get(url, { params });
        setRows(res.data || []);
      } catch (e) {
        console.error("❌ Error fetching sales:", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fromDate, toDate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let data = [...rows];

    if (term) {
      data = data.filter((r) =>
        [
          r.service_name ?? "",
          r.invoice ?? "",
          r.invoice_date ?? "",
          String(r.taxable_amount ?? ""),
          String(r.net_payable ?? ""),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        const A = a[sortConfig.key] ?? "";
        const B = b[sortConfig.key] ?? "";
        if (A < B) return sortConfig.direction === "asc" ? -1 : 1;
        if (A > B) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [rows, search, sortConfig]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.taxable += Number(r.taxable_amount || 0);
        acc.net += Number(r.net_payable || 0);
        return acc;
      },
      { taxable: 0, net: 0 }
    );
  }, [filtered]);

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

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const handleGenerate = async () => {
    try {
      const res = await axios.post(
        `${baseurl}/api/reports/sales-report/download`,
        { fromDate: fromDate || null, toDate: toDate || null, format: reportFormat },
        { responseType: "blob" }
      );

      const name = `Sales_Report_${fromDate || "ALL"}_${toDate || "ALL"}.${
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
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      setRecentReports((prev) => [
        {
          id: Date.now(),
          name: "Sales Report",
          fileName: name,
          format: reportFormat,
          from: fromDate || "ALL",
          to: toDate || "ALL",
          timestamp: new Date().toLocaleString(),
          blob,
        },
        ...prev,
      ]);
      setShowModal(false);
    } catch (e) {
      console.error("❌ Download error:", e);
    }
  };

  const downloadRecent = (r) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(r.blob);
    a.download = r.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="sales-report-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`sales-report-main ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="sales-report-wrapper">
          <div className="sales-report-container">
            <div className="sales-report-header">
              <h2 className="sales-report-title">Sales Report</h2>

              <div className="sales-report-filterbar">
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
                  className="sales-report-btn success"
                  onClick={() => setShowModal(true)}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="sales-report-controls">
              <div className="sales-report-entries">
                Show{" "}
                <select value={entries} onChange={handleEntriesChange}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>{" "}
                entries
              </div>

              <div className="sales-report-search">
                <span>Search:</span>
                <input
                  type="text"
                  placeholder="Search service, invoice, amount..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <p>Loading…</p>
            ) : (
              <table className="sales-report-table">
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th onClick={() => handleSort("service_name")}>Service</th>
                    <th onClick={() => handleSort("invoice")}>Invoice</th>
                    <th onClick={() => handleSort("invoice_date")}>Date</th>
                    <th onClick={() => handleSort("taxable_amount")}>Taxable Amount</th>
                    <th onClick={() => handleSort("net_payable")}>Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td className="sales-report-empty" colSpan={6}>
                        No matching records
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r, i) => (
                      <tr key={`${r.invoice}-${i}`}>
                        <td>{startIdx + i + 1}</td>
                        <td>{r.service_name || "-"}</td>
                        <td>{r.invoice || "-"}</td>
                        <td>{formatDate(r.invoice_date)}</td>
                        <td>{Number(r.taxable_amount ?? 0).toFixed(2)}</td>
                        <td>{Number(r.net_payable ?? 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>
                      Totals:
                    </td>
                    <td style={{ fontWeight: 700 }}>{totals.taxable.toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>{totals.net.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            <div className="sales-report-footer">
              <div>
                {total === 0
                  ? "Showing 0 to 0 of 0 entries"
                  : `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`}
              </div>
              <div className="sales-report-pagination">
                <button
                  className="sales-report-pagebtn"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="sales-report-pageindex">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="sales-report-pagebtn"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            {recentReports.length > 0 && (
  <div className="sales-report-recent-reports">
    {recentReports.map((r) => (
      <div key={r.id} className="sales-report-report-item">
        <span>
          {r.name} • {r.format.toUpperCase()} • Range: {r.from} → {r.to} • {r.timestamp}
        </span>
      </div>
    ))}
  </div>
)}

          </div>
        </div>

        {showModal && (
          <div className="sales-report-modal">
            <div className="sales-report-modal-content">
              <button
                className="sales-report-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
              <div className="sales-report-modal-title">Generate Sales Report</div>

              <div className="sales-report-modal-options">
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

              <button className="sales-report-generate-btn" onClick={handleGenerate}>
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReportPage;
