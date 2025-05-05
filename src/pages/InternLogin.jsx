import React, { useState } from "react";
import { postRequest } from "../utils/apicalls";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../image/logo_.png";
import "../styles/internlogin.css";

const InternLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@module-zero\.com$/;
    if (!email) {
      message.error("Please enter your email.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      message.error("Please enter a valid email address.");
      return false;
    }
    if (!pattern.test(email)) {
      message.error("Email must be from module-zero.com domain.");
      return false;
    }
    return true;
  };

  const onFinish = async (values) => {
    const { email } = values;

    if (!validateEmail(email)) return;

    setLoading(true);
    const payload = { email };

    try {
      const response = await postRequest("interns/login", payload);

      if (response.success) {
        message.success(response.message);
        localStorage.setItem("email", email);

        setTimeout(() => {
          navigate("/otp-verification", { state: { email } });
        }, 3000);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intern-login-container">
      <div className="intern-form-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <Form
          name="login-form"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ email: "" }}
        >
          <Form.Item label="Email" name="email">
            <Input
              placeholder="Enter your email"
              disabled={loading}
              className="input-field"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="btn-login"
            >
              Login
            </Button>
          </Form.Item>

          <div className="admin-login-link">
            <Button type="link" onClick={() => navigate("/admin-login")}>
              Login as admin
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default InternLogin;
