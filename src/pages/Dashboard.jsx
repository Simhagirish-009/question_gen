import React, { useEffect, useState } from "react";
import API from "../api/axios";
import {
  Container,
  Card,
  Table,
  Navbar,
  Nav,
  Button,
  Row,
  Col,
} from "react-bootstrap";
// import Navbar from "../components/Navbar"
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get("dashboard/").then((res) => {
      setStats(res.data.stats);
      setHistory(res.data.recent_history);
    });
  }, []);

  return (
    <>
      {/* Navbar */}
      {/* Main Section */}
      <Container
        fluid
        className="py-5"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
          minHeight: "100vh",
        }}
      >
        <Container>
          <h2 className="text-center text-white fw-bold mb-4">Dashboard</h2>

          {/* Stats Cards */}
          <Row className="justify-content-center mb-4">
            <Col md={4} sm={6} className="mb-3">
              <Card className="text-center shadow border-0 py-3">
                <h5 className="text-muted">Total Contexts</h5>
                <h2 className="fw-bold text-primary">
                  {stats.total_contexts || 0}
                </h2>
              </Card>
            </Col>
            <Col md={4} sm={6} className="mb-3">
              <Card className="text-center shadow border-0 py-3">
                <h5 className="text-muted">Total Questions</h5>
                <h2 className="fw-bold text-success">
                  {stats.total_questions || 0}
                </h2>
              </Card>
            </Col>
            <Col md={4} sm={6} className="mb-3">
              <Card className="text-center shadow border-0 py-3">
                <h5 className="text-muted">Total Papers</h5>
                <h2 className="fw-bold text-danger">
                  {stats.total_papers || 0}
                </h2>
              </Card>
            </Col>
          </Row>

          {/* Recent History Table */}
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body>
              <h4 className="fw-bold mb-3 text-dark text-center">
                📄 Recent Generation History
              </h4>
              <Table hover responsive className="align-middle text-center">
                <thead className="table-primary">
                  <tr>
                    <th>Context</th>
                    <th>Total Questions</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.context_title}</td>
                        <td>{h.total_questions}</td>
                        <td>{new Date(h.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-muted">
                        No recent history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </>
  );
}

export default Dashboard;
