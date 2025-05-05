import React, { useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { postRequest } from "../utils/apicalls";
import { useNavigate } from "react-router-dom";
import "../styles/createintern.css";

const { Option } = Select;

const CreateInterns = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        first_name: values.firstName,
        middle_name: values.middleName || null,
        last_name: values.lastName,
        suffix: values.suffix || null,
        school: values.school,
        email: values.email,
        type: values.type,
      };

      const response = await postRequest("interns/create", payload);

      if (response.intern_id) {
        message.success(response.message);
        form.resetFields();
        navigate("/interns");
      } else {
        message.error("Failed to add intern");
      }
    } catch (error) {
      message.error("An error occurred while adding the intern.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    navigate("/interns");
  };

  return (
    <div className="add-intern-form-container relative">
      <button className="close-button" onClick={handleClose}>
        <CloseOutlined />
      </button>
      <h2 className="create-form-title">Add New Intern</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please input the first name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Middle Name" name="middleName">
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please input the last name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Suffix" name="suffix">
          <Input />
        </Form.Item>

        <Form.Item
          label="School"
          name="school"
          rules={[{ required: true, message: "Please input the school!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input the email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Please select the type!" }]}
        >
          <Select placeholder="Select intern type">
            <Option value="College">College</Option>
            <Option value="HS">HS</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="submit-button"
          >
            Add Intern
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateInterns;
