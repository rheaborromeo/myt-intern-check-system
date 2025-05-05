import React, { useState, useEffect } from "react";
import { Table, Tabs, Checkbox, message, Button, Pagination, Tag } from "antd";
import AdminSidebar from "../components/AdminSidebar";
import { getRequest, postRequest } from "../utils/apicalls";
import "../styles/admindashboard.css";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";

const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState({
    pending: [],
    approved: [],
    disapproved: [],
    all: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState({});
  const [pagination, setPagination] = useState({ offset: 0, limit: 10 });
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchAttendance(activeTab, pagination.offset, pagination.limit);
  }, [activeTab, pagination]);

  const fetchAttendance = async (
    status = "pending",
    offset = 0,
    limit = 10
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const requester = localStorage.getItem("requester");
      const url = `timesheets/get_timesheets_by_status?token=${token}&requester=${requester}&status=${status}&offset=${offset}&limit=${limit}`;

      const response = await getRequest(url);
      if (response && response.data) {
        setData((prevData) => ({
          ...prevData,
          [status]: response.data,
        }));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSelectChange = (record, checked) => {
    setSelectedRecords((prev) => ({ ...prev, [record.id]: checked }));
  };

  const approveSelected = async () => {
    const approvedIds = Object.keys(selectedRecords).filter(
      (id) => selectedRecords[id]
    );
    if (approvedIds.length === 0) {
      message.warning("No records selected for approval.");
      return;
    }
    const requester = localStorage.getItem("requester");
    try {
      await postRequest("timesheets/approve_timesheets", {
        requester,
        timesheet_ids: approvedIds,
      });
      message.success("Selected records approved successfully.");
      fetchAttendance("pending", pagination.offset, pagination.limit);
      setSelectedRecords({});
    } catch (error) {
      message.error("Failed to approve records.");
    }
  };

  const disapproveSelected = async () => {
    const disapprovedIds = Object.keys(selectedRecords).filter(
      (id) => selectedRecords[id]
    );
    if (disapprovedIds.length === 0) {
      message.warning("No records selected for disapproval.");
      return;
    }
    const requester = localStorage.getItem("requester");
    try {
      await postRequest("timesheets/disapprove_timesheets", {
        requester,
        timesheet_ids: disapprovedIds,
      });
      message.success("Selected records disapproved successfully.");
      fetchAttendance("pending", pagination.offset, pagination.limit);
      setSelectedRecords({});
    } catch (error) {
      message.error("Failed to disapprove records.");
    }
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const columnsBase = [
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
      width: 50,
    },
    {
      title: "Setup",
      key: "setup",
      render: (record) => {
        const formatModality = (modality) => {
          if (!modality || modality === "Absent") return "";
          return modality === "FTF" ? "F2F" : modality;
        };
        const am = formatModality(record.am_modality || "").trim();
        const pm = formatModality(record.pm_modality || "").trim();
        if (!am && !pm) return "-";
        if (am && pm && am.toLowerCase() === pm.toLowerCase()) return am;
        if (!am) return pm;
        if (!pm) return am;
        return `${am} / ${pm}`;
      },
      width: 50,
    },
    {
      title: "Morning",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_am",
          key: "time_in_am",
          render: convertTo12HourFormat,
          width: 50,
        },
        {
          title: "End",
          dataIndex: "time_out_am",
          key: "time_out_am",
          render: convertTo12HourFormat,
          width: 50,
        },
      ],
    },
    {
      title: "Afternoon",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_pm",
          key: "time_in_pm",
          render: convertTo12HourFormat,
          width: 50,
        },
        {
          title: "End",
          dataIndex: "time_out_pm",
          key: "time_out_pm",
          render: convertTo12HourFormat,
          width: 50,
        },
      ],
    },
    {
      title: "# of hours",
      dataIndex: "total_hours",
      key: "total_hours",
      width: 50,
    },
  ];

  const renderPagination = () => (
    <div className="mt-4 flex justify-start lg:justify-end">
      <Pagination
        current={pagination.offset / pagination.limit + 1}
        pageSize={pagination.limit}
        total={data[activeTab]?.length || 0}
        onChange={(page, pageSize) => {
          setPagination({ offset: (page - 1) * pageSize, limit: pageSize });
        }}
      />
    </div>
  );

  return (
    <div
      className={`admin-dashboard-container ${
        collapsed ? "collapsed" : "expanded"
      }`}
    >
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="admin-dashboard-content overflow-y-auto p-4 h-[100vh]">
        <div
          className={`admin-header-container ${
            collapsed ? "" : "expanded-sidebar"
          }`}
        >
          <img src={mytLogo} alt="MYT Logo" className="admin-myt-logo" />
          <div className="admin-header-text">
            <h2 className="admin-company-name text-xl font-bold">
              MYT SoftDev Solutions, Inc.
            </h2>
            <p className="admin-company-address text-sm">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
            </p>
          </div>
        </div>
        <h3 className="admin-title-header mt-4 text-lg font-semibold">
          Monitoring Records
        </h3>
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          className="mt-4"
        >
          <TabPane tab="Pending" key="pending">
            {/* Top controls for medium and up */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <Checkbox
                onChange={(e) => {
                  const checked = e.target.checked;
                  const updatedSelection = {};
                  data.pending.forEach((record) => {
                    updatedSelection[record.id] = checked;
                  });
                  setSelectedRecords(updatedSelection);
                }}
                checked={
                  data.pending.length > 0 &&
                  data.pending.every((record) => selectedRecords[record.id])
                }
                indeterminate={
                  Object.values(selectedRecords).some(Boolean) &&
                  !data.pending.every((record) => selectedRecords[record.id])
                }
              >
                Select All
              </Checkbox>

              {/* Buttons for medium and up */}
              <div className=" hidden md:flex gap-2 ">
                <Button type="primary" onClick={approveSelected}>
                  Approve
                </Button>
                <Button type="primary" danger onClick={disapproveSelected}>
                  Disapprove
                </Button>
              </div>
            </div>

            <div className="admin-monitoring-table-wrapper">
              <Table
                columns={[
                  {
                    title: "",
                    key: "select",
                    render: (_, record) => (
                      <Checkbox
                        checked={selectedRecords[record.id] || false}
                        onChange={(e) =>
                          onSelectChange(record, e.target.checked)
                        }
                      />
                    ),
                    width: 50,
                  },
                  {
                    title: "Name",
                    dataIndex: "full_name",
                    key: "full_name",
                    width: 100,
                  },
                  ...columnsBase,
                ]}
                dataSource={data.pending}
                rowKey="id"
                loading={loading}
                pagination={false}
                className="admin-monitoring-table"
              />
            </div>

            {/* Buttons below table for small screens */}
            <div className="flex flex-wrap md:hidden gap-2 mt-4">
              <Button type="primary" onClick={approveSelected}>
                Approve
              </Button>
              <Button type="primary" danger onClick={disapproveSelected}>
                Disapprove
              </Button>
            </div>

            {renderPagination()}
          </TabPane>

          <TabPane tab="Approved" key="approved">
            <div className="admin-monitoring-table-wrapper">
              <Table
                columns={[
                  {
                    title: "Name",
                    dataIndex: "full_name",
                    key: "full_name",
                    width: 50,
                  },

                  ...columnsBase,
                  {
                    title: "Approved By",
                    key: "approved_by",
                    dataIndex: "approved_by",
                    width: 100,
                    render: (_, record) => {
                      const approver = record.approved_by;
                      const approvedOn = record.approved_on
                        ? new Date(record.approved_on).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "";
                      return approver ? `${approver} (${approvedOn})` : "-";
                    },
                  },
                ]}
                dataSource={data.approved}
                rowKey="id"
                loading={loading}
                pagination={false}
                className="admin-monitoring-table"
              />
            </div>
            {renderPagination()}
          </TabPane>

          <TabPane tab="Disapproved" key="disapproved">
            <div className="admin-monitoring-table-wrapper">
              <Table
                columns={[
                  {
                    title: "Name",
                    dataIndex: "full_name",
                    key: "full_name",
                    width: 50,
                  },
                  ...columnsBase,
                ]}
                dataSource={data.disapproved}
                rowKey="id"
                loading={loading}
                pagination={false}
                className="admin-monitoring-table"
              />
            </div>
            {renderPagination()}
          </TabPane>

          <TabPane tab="All" key="all">
            <div className="admin-monitoring-table-wrapper">
              <Table
                columns={[
                  {
                    title: "Name",
                    dataIndex: "full_name",
                    key: "full_name",
                    width: 50,
                  },
                  ...columnsBase,
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    width: 50,
                    render: (text) => {
                      let color = "default";
                      if (text === "approved") {
                        color = "green";
                      } else if (text === "disapproved") {
                        color = "red";
                      } else if (text === "pending") {
                        color = "blue";
                      }

                      return text === "absent" ? (
                        ""
                      ) : (
                        <Tag color={color}>{text}</Tag>
                      );
                    },
                  },
                ]}
                dataSource={data.all}
                rowKey="id"
                loading={loading}
                pagination={false}
                className="admin-monitoring-table"
              />
            </div>
            {renderPagination()}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
