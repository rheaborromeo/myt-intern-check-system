import React, { useState, useEffect } from "react";
import { Layout, Menu, message, Button } from "antd";
import { ClockCircleOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import internCheckLogo from "../image/inchck_logo.png";

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedKey, setSelectedKey] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");
    const requester = localStorage.getItem("requester");

    if (!requester || !token || !email) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
      setIsLoggingOut(false);
      return;
    }

    const payload = { requester, token, email };

    try {
      const response = await postRequest("interns/logout", payload);

      if (response?.message === "Intern logged out successfully.") {
        message.success(response.message);
        localStorage.clear();
        navigate("/");
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error("An error occurred while logging out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("attendance")) {
      setSelectedKey("1");
    } else {
      setSelectedKey("");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (e) => {
    if (e.key === "2") {
      handleLogout();
    } else if (e.key === "1") {
      navigate("/intern-logs");
    }
  };

  const handleTitleClick = () => {
    onCollapse(!collapsed);
  };

  return (
    <Layout>
      {/* Show the sidebar trigger at the top for mobile screens */}
      {isMobile && (
        <Button
          icon={<MenuOutlined />}
          onClick={handleTitleClick}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1000,
          }}
        />
      )}

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        className="fixed-sidebar"
        width={200}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        trigger={null}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
        }}
      >
        <div className="logo" onClick={handleTitleClick}>
          <img
            src={internCheckLogo}
            alt="Intern Check"
            className="web-logo transition-all duration-300 w-[90px] h-[auto]"
          />
        </div>

        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          className="custom-menu"
        >
          <Menu.Item key="1" icon={<ClockCircleOutlined />}>
            Daily Time Record
          </Menu.Item>
          <Menu.Item key="2" icon={<LogoutOutlined />} disabled={isLoggingOut}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
    </Layout>
  );
};

export default Sidebar;
