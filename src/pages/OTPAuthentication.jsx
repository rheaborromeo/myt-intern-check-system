import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message, Spin, Statistic } from "antd";
import { postRequest } from "../utils/apicalls";
import "../styles/otpauthentication.css";

const { Countdown } = Statistic;

const OTPAuthentication = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [deadline, setDeadline] = useState(Date.now() + 300000);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const hasGeneratedOTP = useRef(false);
  const [loadingGenerate, setLoadingGenerate] = useState(true);
  const [loadingResend, setLoadingResend] = useState(false);

  const handleGenerateOTP = useCallback(async () => {
    try {
      setLoadingGenerate(true);
      const email = localStorage.getItem("email");

      const payload = {
        email,
      };

      const response = await postRequest("interns/generate_otp", payload);
      if (response.success) {
        setDeadline(Date.now() + 300000);
        setOtpExpired(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Failed to generate OTP. Please try again.");
    } finally {
      setLoadingGenerate(false);
    }
  }, []);

  useEffect(() => {
    if (email && !hasGeneratedOTP.current) {
      handleGenerateOTP();
      hasGeneratedOTP.current = true;
    }
  }, [email, handleGenerateOTP]);

  const handleResendOTP = async () => {
    if (loadingResend) return;
    setLoadingResend(true);

    const payload = {
      email,
    };

    try {
      const response = await postRequest("interns/resend_otp", payload);

      if (response.success) {
        message.success(response.message);
        setDeadline(Date.now() + 300000);
        setOtpExpired(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoadingResend(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!email) return;
    const otpString = otp.join("");

    if (otpExpired) {
      message.error("This OTP has expired. Please request a new one.", {
        autoClose: 2000,
      });
      return;
    }

    try {
      setLoadingVerify(true);
      const payload = { email, otp: otpString };
      const response = await postRequest("interns/verify_otp", payload);

      if (response.message === "Intern logged in successfully.") {
        message.success(response.message);

        if (response.token) {
          localStorage.setItem("authToken", response.token);
          localStorage.setItem("requester", response.id);
        }
        navigate("/intern-logs");
      } else {
        message.error("Invalid OTP. Please try again.");
        if (response.message.includes("expired")) {
          setOtpExpired(true);
        }
      }
    } catch (error) {
      message.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleChange = (element, index) => {
    const value = element.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (element, index) => {
    if (element.key === "Backspace" && index > 0 && otp[index] === "") {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  return (
    <div className="otp-container">
      <h2 className="otp-title">Email Verification</h2>
      <p className="otp-subtext">Please enter the OTP sent to your email.</p>
      <p className="otp-countdown">
        <Countdown
          value={deadline}
          format="mm:ss"
          onFinish={() => setOtpExpired(true)}
        />
      </p>

      <Form
        name="otp-form"
        onFinish={handleVerifyOTP}
        layout="vertical"
        className="w-full"
      >
        <div className="otp-inputs">
          {otp.map((value, index) => (
            <Input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength="1"
              className="otp-input"
              value={value}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <Form.Item className="w-full">
          <Button
            type="primary"
            htmlType="submit"
            onClick={handleVerifyOTP}
            disabled={loadingVerify}
            className="otp-button"
          >
            {loadingVerify ? <Spin /> : "Verify OTP"}
          </Button>
        </Form.Item>

        <Form.Item className="w-full">
          <Button
            onClick={handleResendOTP}
            disabled={loadingGenerate}
            className="resend-otp-button"
          >
            {loadingGenerate ? <Spin /> : "Resend OTP"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OTPAuthentication;
