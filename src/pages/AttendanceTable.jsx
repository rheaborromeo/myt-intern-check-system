import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Spin, Select, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../utils/apicalls";
import Sidebar from "../components/Sidebar";
import "../styles/attendancetable.css";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";

const AttendanceTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasTimedOutToday, setHasTimedOutToday] = useState(false);
  const [totalApprovedHours, setTotalApprovedHours] = useState(0);
  const [studentInfo, setStudentInfo] = useState({ name: "", school: "" });
  const [approvedTimesheets, setApprovedTimesheets] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchAttendance = async (page, pageSize) => {
    setLoading(true);
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("requester");
   

    try {
      const response = await getRequest(
        `timesheets/attendance?id=${id}&email=${email}&page=${page}&pageSize=${pageSize}`
      );
      if (response?.status === "success" && Array.isArray(response.data)) {
        setAttendanceData(response.data);
        setPagination({
          page: response.pagination.page,
          pageSize: response.pagination.pageSize,
        });
        setHasNextPage(response.pagination.hasNextPage);

        checkIfTimedOut(response.data);
      } else {
        setAttendanceData([]);
        setPagination({ page: 1, pageSize: 10 });
        setHasNextPage(false);
        setTotalRecords(0);
      }
    } catch (error) {
      setAttendanceData([]);
      setPagination({ page: 1, pageSize: 10 });
      setHasNextPage(false);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentInfo = async () => {
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("requester");
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(
        `timesheets/get_approved_interns_timesheets?id=${id}&email=${email}&token=${token}`
      );

      if (response?.data) {
        setStudentInfo({
          name: response.data.name,
          school: response.data.school,
        });

        if (Array.isArray(response.data.timesheets)) {
          setApprovedTimesheets(response.data.timesheets);
        }
      }
    } catch (error) {
      console.error("Failed to fetch student info", error);
    }
  };

  const checkIfTimedOut = (data) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentHour = now.getHours();

    const todayRecord = data.find(
      (record) => record.date?.split("T")[0] === today
    );

    if (!todayRecord) {
      localStorage.setItem("hasTimeInAM", "false");
      localStorage.setItem("hasTimeOutAM", "false");
      localStorage.setItem("hasTimeInPM", "false");
      localStorage.setItem("hasTimeOutPM", "false");
      setHasTimedOutToday(false);
      return;
    }

    const hasTimeInAM = !!todayRecord.time_in_am;
    const hasTimeOutAM = !!todayRecord.time_out_am;
    const hasTimeInPM = !!todayRecord.time_in_pm;
    const hasTimeOutPM = !!todayRecord.time_out_pm;

    localStorage.setItem("hasTimeInAM", hasTimeInAM.toString());
    localStorage.setItem("hasTimeOutAM", hasTimeOutAM.toString());
    localStorage.setItem("hasTimeInPM", hasTimeInPM.toString());
    localStorage.setItem("hasTimeOutPM", hasTimeOutPM.toString());

    setHasTimedOutToday(
      (currentHour < 12 && hasTimeInAM && hasTimeOutAM) ||
        (currentHour >= 12 && hasTimeInPM && hasTimeOutPM)
    );
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  useEffect(() => {
    const total = approvedTimesheets.reduce(
      (sum, record) => sum + (parseFloat(record.total_hours) || 0),
      0
    );
    setTotalApprovedHours(total.toFixed(2));
  }, [approvedTimesheets]);

  const handlePrint = () => {
    const approvedData = approvedTimesheets;

    const totalApprovedHours = approvedData.reduce(
      (sum, record) => sum + (parseFloat(record.total_hours) || 0),
      0
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Approved Attendance</title>
          <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        font-size: 14px; 
      }
      .header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
      }
      .header img {
        width: 128px;
        height: auto;
      }
      .header div {
        line-height: 1.0;
        font-size: 16px;
      }
      .title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin: 20px 0;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        border: 1px solid #000;
      }
      .info-table td {
        border: 1px solid #000;
        padding: 8px;
      }
      .content-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
        margin-top: 20px;
      }
      .content-table th,
      .content-table td {
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
      }
      .content-table th {
        background-color: rgb(255, 255, 255);
      }
      .footer {
        margin-top: 30px;
        text-align: center;
      }
      .footer p {
        font-weight: bold;
      }
      @media print {
        body {
          padding: 10mm;
          font-size: 12pt; 
          margin: 0;
        }

        .header {
          display: flex;

          margin-bottom: 20px;
        }

        .header img {
          width: 128px;
          height: auto;
        }

        .title {
          font-size: 20px;
          margin: 15px 0;
        }

        .info-table td,
        .content-table th,
        .content-table td {
          padding: 6px; /* Reduced padding for a more compact layout */
        }

        .footer {
          margin-top: 30px;
        }

        .footer p {
          font-size: 12pt;
        }

        @page {
          size: auto;
          margin: 10mm;
          mso-footer-space: 1cm;
          mso-header-space: 1cm;
        }

        /* Remove background images (if any) for print */
        * {
          -webkit-print-color-adjust: exact; /* Ensure proper color rendering in print */
        }

      }
    </style>
        </head>
        <body>
          <!-- Header Section -->
          <div class="header">
            <img src="https://i.ibb.co/237pgqWV/myt-logo-d51e67ca4d4eeea6450b.png" alt="MYT Logo" />
            <div>
              <p>MYT SoftDev Solutions, Inc.</p>
              <p>301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu</p>
            </div>
          </div>
  
          <!-- Title -->
          <h2 class="title">DAILY TIME RECORD</h2>
  
          <!-- Info Section -->
          <table class="info-table">
            <tr>
              <td><strong>Name of Student:</strong> ${studentInfo.name}</td>
              <td><strong>Organization:</strong> ${studentInfo.school}</td>
            </tr>
            <tr>
              <td><strong>Name of Supervisor: </strong></td>
              <td><strong>Designation:</strong> Intern</td>
            </tr>
          
          </table>
  
          <!-- Attendance Table -->
          <table class="content-table">
            <thead>
              <tr>
                <th rowspan="2">Date</th>
                <th rowspan="2">Setup</th>
                <th colspan="2">Morning</th>
                <th colspan="2">Afternoon</th>
                <th rowspan="2"># of hours</th>
                <th rowspan="2">Approved by</th>
              </tr>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              ${approvedData
                .map((record) => {
                  const date = new Date(record.date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  const setup = (() => {
                    const am = record.am_modality;
                    const pm = record.pm_modality;

                    if (am && pm) {
                      return am === pm ? am : `${am} / ${pm}`;
                    } else if (am) {
                      return am;
                    } else if (pm) {
                      return pm;
                    } else {
                      return "";
                    }
                  })();

                  const approvedBy = record.approved_by
                    ? `${record.approved_by} (${new Date(
                        record.approved_on
                      ).toLocaleDateString("en-US")})`
                    : "";

                  const convert = (time) => {
                    if (!time) return "";
                    const [h, m] = time.split(":").map(Number);
                    const ampm = h >= 12 ? "PM" : "AM";
                    const hour12 = h % 12 || 12;
                    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
                  };

                  return `
                    <tr>
                      <td>${date}</td>
                      <td>${setup}</td>
                      <td>${convert(record.time_in_am)}</td>
                      <td>${convert(record.time_out_am)}</td>
                      <td>${convert(record.time_in_pm)}</td>
                      <td>${convert(record.time_out_pm)}</td>
                      <td>${record.total_hours}</td>
                      <td>${approvedBy}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
  
          <!-- Footer -->
          <div class="footer">
            <p>Total Approved Hours: ${totalApprovedHours.toFixed(2)} hrs</p>
          </div>
  
         <script>
  window.onload = function() {
    window.print();
  };
  window.onafterprint = function() {
    window.close();
  };
</script>

        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
    {
      title: "Setup",
      key: "setup",
      render: (record) => {
        const am = record.am_modality !== "Absent" ? record.am_modality : "";
        const pm = record.pm_modality !== "Absent" ? record.pm_modality : "";
        if (am && pm && am === pm) return am;
        return [am, pm].filter(Boolean).join(" / ") || "";
      },
    },
    {
      title: "Morning",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_am",
          render: convertTo12HourFormat,
        },
        {
          title: "End",
          dataIndex: "time_out_am",
          render: convertTo12HourFormat,
        },
      ],
    },
    {
      title: "Afternoon",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_pm",
          render: convertTo12HourFormat,
        },
        {
          title: "End",
          dataIndex: "time_out_pm",
          render: convertTo12HourFormat,
        },
      ],
    },
    {
      title: "# of hours",
      dataIndex: "total_hours",
      key: "total_hours",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color = "default";
        if (text === "approved") color = "green";
        else if (text === "disapproved") color = "red";
        else if (text === "pending") color = "blue";

        return text === "absent" ? "" : <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Approved by",
      dataIndex: "approved_by_name",
      key: "approved_by_name",
      render: (text, record) => {
        return record.approved_by_name
          ? `${record.approved_by_name} (${new Date(
              record.approved_on
            ).toLocaleDateString("en-US")})`
          : "";
      },
    },
  ];

  return (
    <div
      className={`attendance-container ${collapsed ? "collapsed" : "expanded"}`}
    >
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="attendance-paper overflow-y-auto h-screen p-4">
        <div className="attendance-header flex items-center">
          <img src={mytLogo} alt="MYT Logo" className="attendance-logo" />
          <div className="attendance-header-text">
            <h2 className="attendance-company-name text-xl font-bold">
              MYT SoftDev Solutions, Inc.
            </h2>
            <p className="attendance-comp-address text-sm">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000
            </p>
          </div>
        </div>

        <h3 className="attendance-title text-lg font-semibold">
          DAILY TIME RECORD
        </h3>

        <div className="attendance-button-container my-4 flex flex-wrap gap-2">
          <Button
            type="primary"
            onClick={() => navigate("/mark-attendance")}
            disabled={hasTimedOutToday}
            className="attendance-button"
          >
            Time in/out
          </Button>
          <Button onClick={handlePrint} className="print-button">
            Print
          </Button>
        </div>

        <Spin spinning={loading} size="large">
          <div className="attendance-table-wrapper overflow-x-auto overflow-y-auto">
            <Table
              dataSource={attendanceData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              columns={columns}
              pagination={false}
              className="attendance-record-table min-w-[1000px]"
            />
          </div>

          <div className="total-hours-container mt-4">
            <h3 className="text-base font-medium">
              Total Hours Rendered: {totalApprovedHours} hrs.
            </h3>
          </div>

          <div className="pagination-container mt-4 flex flex-wrap items-center">
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={
                hasNextPage
                  ? (pagination.page + 1) * pagination.pageSize
                  : pagination.page * pagination.pageSize
              } // Adjust total to reflect the next page
              onChange={(page, pageSize) => setPagination({ page, pageSize })}
              showSizeChanger={true}

              itemRender={(page, type, originalElement) => {
                if (type === "page") {
                  return page === pagination.page ? (
                    <span>{page}</span> // Only show the current page number
                  ) : null; // Hide other page numbers
                }
                return originalElement;
              }}
            />
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default AttendanceTable;
