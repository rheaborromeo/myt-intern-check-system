import React, { useState, useEffect } from "react";
import { postRequest } from "../utils/apicalls";
import { Button, message } from "antd";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../styles/markattendance.css";
import timelog from "../image/Time management.png";

const MarkAttendance = () => {
  const navigate = useNavigate();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const [currentFormattedTime, setCurrentFormattedTime] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFormattedTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = new Date().toISOString().split("T")[0];
  if (localStorage.getItem("attendanceDate") !== todayDate) {
    localStorage.setItem("attendanceDate", todayDate);
    localStorage.removeItem("isTimedIn_morning");
    localStorage.removeItem("isTimedOut_morning");
    localStorage.removeItem("isTimedIn_afternoon");
    localStorage.removeItem("isTimedOut_afternoon");
  }

  const hasTimeInAM = localStorage.getItem("hasTimeInAM") === "true";
  const hasTimeOutAM = localStorage.getItem("hasTimeOutAM") === "true";
  const hasTimeInPM = localStorage.getItem("hasTimeInPM") === "true";
  const hasTimeOutPM = localStorage.getItem("hasTimeOutPM") === "true";

  // Determine session
  let session = currentHour < 13 ? "morning" : "afternoon";


  const isTimedIn =
    session === "morning"
      ? hasTimeInAM
      : session === "afternoon"
      ? hasTimeInPM
      : false;

  const isTimedOut =
    session === "morning"
      ? hasTimeOutAM
      : session === "afternoon"
      ? hasTimeOutPM
      : false;

  const handleTimeInOut = async () => {
    if (isTimedOut) return;

    const id = localStorage.getItem("requester");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");

    try {
      const response = await postRequest("timesheets/punch", {
        id,
        token,
        email,
      });
      if (response.status === "failed") {
        message.error(response.message, {
          position: "top-center",
          autoClose: 3000,
        });
        setTimeout(() => {
          message.destroy();
        }, 3000);
        return;
      }

      message.success(response.message, {
        position: "top-center",
        autoClose: 3000,
      });

      if (!isTimedIn) {
        localStorage.setItem(`hasTimeIn${session === "morning" ? "AM" : "PM"}`, "true");
      } else {
        localStorage.setItem(`hasTimeOut${session === "morning" ? "AM" : "PM"}`, "true");
      }
      

      setTimeout(() => {
        message.destroy();
        navigate("/intern-logs");
      }, 3000);
    } catch (error) {
      message.error("An error occurred. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
      setTimeout(() => {
        message.destroy();
      }, 3000);
    }
  };

  const disableButton =
    (session === "morning" && !isTimedIn && currentHour >= 12) ||
    (session === "afternoon" &&
      !isTimedIn &&
      (currentHour > 16 || (currentHour === 16 && currentMinute >= 30))) ||
    isTimedOut;

  if (session === "none") {
    return (
      <div className="log-overlay-container">
        <div className="log-box-container">
          <img src={timelog} alt="logo" className="log-attendance-image" />
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => navigate(-1)}
            className="close-button"
          />
          <div className="clock-display">
            <ClockCircleOutlined style={{ marginRight: 8, fontSize: "1.6em" }} />
            <strong className="log-current-time">{currentFormattedTime}</strong>
          </div>
          <p className="session-class">
            You have completed this session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="log-overlay-container">
      <div className="log-box-container">
        <img src={timelog} alt="logo" className="log-attendance-image" />
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => navigate(-1)}
          className="close-button"
        />
        <div className="clock-display">
          <ClockCircleOutlined style={{ marginRight: 8, fontSize: "1.6em" }} />
          <strong className="log-current-time">{currentFormattedTime}</strong>
        </div>
        <div className="time-section">
          <h3 className="session-class">
            {session.charAt(0).toUpperCase() + session.slice(1)} Session
          </h3>
          <div className="time-buttons">
            <Button
              type={isTimedIn ? "default" : "primary"}
              onClick={handleTimeInOut}
              disabled={disableButton}
            >
              {isTimedOut
                ? "Session Completed"
                : isTimedIn
                ? "Time Out"
                : "Time In"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
