import React, { useState } from "react";
import API from "../api/axios";
import {
  Form,
  Button,
  Card,
  Container,
  Alert,
  Navbar,
  Nav,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("register/", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.password || "Registration failed");
    }
  };

  return (
    <>
      {/* Main Section */}
      <Container
        fluid
        className="d-flex justify-content-center align-items-center vh-100"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
        }}
      >
        <Card
          className="p-4 shadow-lg border-0"
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "20px",
          }}
        >
          <h3 className="text-center mb-3 fw-bold text-dark">
            Create Account 🚀
          </h3>
          <p className="text-center text-muted mb-4">
            Register to start generating question papers
          </p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Username"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Email"
                type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Full Name"
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Password"
                type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Control
                placeholder="Confirm Password"
                type="password"
                onChange={(e) =>
                  setForm({ ...form, password2: e.target.value })
                }
                className="py-2"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 py-2 fw-semibold"
              style={{ borderRadius: "10px" }}
            >
              Register
            </Button>
          </Form>

          <p className="text-center mt-3 text-muted">
            Already have an account?{" "}
            <a href="/login" className="text-decoration-none fw-semibold">
              Login
            </a>
          </p>
        </Card>
      </Container>
    </>
  );
}

export default Register;
