import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import "../styles/adminlogin.css";
import logo from "../image/logo_.png";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;

    const payload = {
      username,
      password,
    };

    setLoading(true);
    try {
      const response = await postRequest("login", payload);

      // Log the response to see what is returned
      console.log("Login response:", response);

      // Check if the response contains the token and requester (id)
      if (!response.token || !response.id) {
        throw new Error("Missing token or id in response");
      }

      // Set the authToken and requester in localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("requester", response.id);

      // Show success message
      message.success(response.message || "Login successful!");

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/admin-logs", {
          state: { username: response.username },
        });
      }, 3000);
    } catch (error) {
      // Log any error and show failure message
      console.error("Login error:", error);
      message.error("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <Form name="login-form" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input
              className="input-field"
              placeholder="Enter your username"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              className="input-field"
              placeholder="Enter your password"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="login-button"
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>

          <div className="admin-login-link">
            <a href="/">Login as Intern</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AdminLogin;
