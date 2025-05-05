import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons"; 
import { getRequest } from "../utils/apicalls";
import { Pagination } from "antd";
import "../styles/interndetail.css";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";

const InternDetail = () => {
  const { id } = useParams();
  const [internInfo, setInternInfo] = useState({ name: "", school: "" });
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // Number of records per page
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchApprovedTimesheets = async () => {
      try {
        const response = await getRequest(
          `timesheets/get_approved_interns_timesheets?screen=1&id=${id}&token=${token}`
        );

        const { name, school, timesheets: ts } = response.data || {};
        setInternInfo({ name: name || "", school: school || "" });
        setTimesheets(Array.isArray(ts) ? ts : []);
      } catch (error) {
        console.error("Timesheet fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedTimesheets();
  }, [id, token]);

  const goBack = () => {
    navigate("/interns");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Slice timesheets for pagination
  const paginatedTimesheets = timesheets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="dtr-container">
      <div className="dtr-paper">
        <div className="close-icon-container">
          <CloseOutlined
            onClick={goBack}
            style={{ fontSize: "20px", cursor: "pointer" }}
          />
        </div>
        <div className="dtr-header">
          <img src={mytLogo} alt="Logo" className="dtr-logo" />
          <div className="dtr-header-text">
            <h2 className="dtr-company-name">MYT SoftDev Solutions, Inc.</h2>
            <p className="dtr-company-address">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
            </p>
          </div>
        </div>
        <h3 className="dtr-title">DAILY TIME RECORD</h3>
        <div className="dtr-info-table">
          <div className="dtr-info-cell">
            <strong>Name of Student:</strong>
            <div className="dtr-info-value">{internInfo.name}</div>
          </div>
          <div className="dtr-info-cell">
            <strong>Organization:</strong>
            <div className="dtr-info-value">{internInfo.school}</div>
          </div>
          <div className="dtr-info-cell">
            <strong>Name of Supervisor:</strong>
            <div className="dtr-info-value"></div>
          </div>
          <div className="dtr-info-cell">
            <strong>Designation:</strong>
            <div className="dtr-info-value">Intern</div>
          </div>
        </div>

        <div className="dtr-table-wrapper">
          <table className="dtr-record-table">
            <thead>
              <tr>
                <th className="dtr-date-col" rowSpan="2">Date</th>
                <th rowSpan="2">Set Up<br />(F2F/Remote)</th>
                <th colSpan="2">Morning</th>
                <th colSpan="2">Afternoon</th>
                <th rowSpan="2"># of Hours</th>
                <th rowSpan="2">Approved by</th>
              </tr>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : paginatedTimesheets.length > 0 ? (
                paginatedTimesheets.map((ts, index) => (
                  <tr key={index}>
                    <td>{formatDate(ts.date)}</td>
                    <td>
                      {ts.am_modality === "Absent" ? "" : ts.am_modality}
                      {ts.am_modality && ts.pm_modality && ts.am_modality !== "Absent" && ts.pm_modality !== "Absent" ? " / " : ""}
                      {ts.pm_modality === "Absent" ? "" : ts.pm_modality}
                    </td>
                    <td>{convertTo12HourFormat(ts.time_in_am)}</td>
                    <td>{convertTo12HourFormat(ts.time_out_am)}</td>
                    <td>{convertTo12HourFormat(ts.time_in_pm)}</td>
                    <td>{convertTo12HourFormat(ts.time_out_pm)}</td>
                    <td>{ts.total_hours || ""}</td>
                    <td>
                      {ts.approved_by && ts.approved_on
                        ? `${ts.approved_by.split(" ").slice(-1)[0]} (${formatDate(ts.approved_on)})`
                        : ts.approved_by || ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No Approved Records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="intern-pagination-container">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={timesheets.length}
            onChange={handlePageChange}
            showSizeChanger={false} // Disable page size changer
          />
        </div>
      </div>
    </div>
  );
};

export default InternDetail;
