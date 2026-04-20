

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./RetailerReportPage.css";
import { baseurl } from "../../../BaseURL/BaseURL"; // ensure baseurl is exported as { baseurl }

const RetailerReportPage = () => {
  // Layout state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Table data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table controls
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");

  // Recent Reports
  const [recentReports, setRecentReports] = useState([]);

  // ✅ Fetch Retailers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${baseurl}/api/reports/retailer-report`;
        console.log("📌 Fetching Retailers:", url);
        const res = await axios.get(url);
        setData(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching Retailers:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Search filter
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.mobile_number?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.business_name?.toLowerCase().includes(term) ||
        r.display_name?.toLowerCase().includes(term)
    );
  }, [data, search]);

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

  // ✅ Generate report
  const handleGenerateReport = async () => {
    try {
      const res = await axios.post(
        `${baseurl}/api/reports/retailer-report/download`,
        { format: reportFormat },
        { responseType: "blob" }
      );

      const fileName = `Retailer_Report.${reportFormat === "pdf" ? "pdf" : "xlsx"}`;

      const blob =
        reportFormat === "pdf"
          ? new Blob([res.data], { type: "application/pdf" })
          : new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

      // trigger download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      // add to Recent
      setRecentReports((prev) => [
        {
          id: Date.now(),
          name: "Retailers Report",
          fileName,
          format: reportFormat,
          timestamp: new Date().toLocaleString(),
          blob,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("❌ Error downloading report:", err);
    }
  };

  // ✅ Download from memory
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
    <div className="retailer-report-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`retailer-report-main ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="retailer-report-wrapper">
          <div className="retailer-report-container">
            {/* Header */}
            <div className="retailer-report-header">
              <h2 className="retailer-report-title">Retailers Report</h2>
              <button
                className="retailer-report-btn success"
                onClick={() => setShowModal(true)}
              >
                + Generate Report
              </button>
            </div>

            {/* Controls */}
            <div className="retailer-report-controls">
              <div className="retailer-report-entries">
                Show{" "}
                <select value={entries} onChange={handleEntriesChange}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>{" "}
                entries
              </div>
              <div className="retailer-report-search">
                <label>Search:</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search Retailers..."
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <table className="retailer-report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                        <th>Business Name</th>
                    <th>GSTIN</th>
                    <th>GST Registered Name</th>
                
                    {/* <th>Display Name</th> */}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No matching records found</td>
                    </tr>
                  ) : (
                    pageRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>{row.mobile_number}</td>
                        <td>{row.email}</td>
                          <td>{row.business_name}</td>
                        <td>{row.gstin}</td>
                        <td>{row.gst_registered_name}</td>
                      
                        {/* <td>{row.display_name}</td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="retailer-report-footer">
              <div className="retailer-report-info">
                {total === 0
                  ? "Showing 0 to 0 of 0 entries"
                  : `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`}
              </div>
              <div className="retailer-report-pagination">
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
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="retailer-report-side-modal">
            <div className="retailer-report-side-modal-content">
              <button
                className="retailer-report-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
              <h3>Generate Report</h3>
              <div className="retailer-report-modal-options">
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={reportFormat === "pdf"}
                    onChange={(e) => setReportFormat(e.target.value)}
                  />{" "}
                  PDF
                </label>
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={reportFormat === "excel"}
                    onChange={(e) => setReportFormat(e.target.value)}
                  />{" "}
                  Excel
                </label>
              </div>

              <button
                className="retailer-report-generate-btn"
                onClick={handleGenerateReport}
              >
                Download
              </button>

              {/* Recent Reports */}
              {recentReports.length > 0 && (
                <>
                  <h4>Recent Reports</h4>
                  <div className="retailer-report-recent-reports">
                    {recentReports.map((r) => (
                      <div key={r.id} className="retailer-report-report-item">
                        <span>
                          {r.name} ({r.format.toUpperCase()}) • {r.timestamp}
                        </span>
                        <button onClick={() => downloadRecent(r)}>⬇</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerReportPage;
