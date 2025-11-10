import React, { useState } from "react";
import API from "../api/axios";
import {
  Container,
  Card,
  Form,
  Button,
  ListGroup,
  Alert,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function ContextPage() {
  const [title, setTitle] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [context, setContext] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await API.post("context/", { title, paragraph });
      setContext(res.data.context);
      setQuestions(res.data.context.questions || []);
      setMessage(res.data.message || "Questions generated successfully!");
    } catch (err) {
      setMessage("⚠️ Error generating questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="py-5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
      }}
    >
      <Container>
        <h2 className="fw-bold text-white text-center mb-5">
          🧠 Generate Questions from Context
        </h2>

        {/* Context Input Form */}
        <Card
          className="p-4 shadow-lg border-0 mb-4"
          style={{ borderRadius: "20px" }}
        >
          <h4 className="fw-bold text-primary mb-3">Add Context</h4>
          <Form onSubmit={handleGenerate}>
            <Row>
              <Col md={12} className="mb-3">
                <h5>Title </h5>
                <Form.Control
                  placeholder="Enter context title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="py-2"
                  required
                />
              </Col>
              <Col md={12} className="mb-4">
                <h5>Context </h5>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="Enter the context paragraph..."
                  value={paragraph}
                  onChange={(e) => setParagraph(e.target.value)}
                  className="py-2"
                  required
                />
              </Col>
            </Row>
            <div className="text-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="px-5 fw-semibold"
                style={{ borderRadius: "10px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Questions"
                )}
              </Button>
            </div>
          </Form>
        </Card>

        {/* Message Alert */}
        {message && (
          <Alert
            variant={
              message.toLowerCase().includes("error") ? "danger" : "success"
            }
            className="mt-3 shadow-sm text-center fw-semibold"
          >
            {message}
          </Alert>
        )}

        {/* Generated Context & Questions */}
        {context && (
          <Card
            className="p-4 shadow-lg border-0 mt-4"
            style={{ borderRadius: "20px" }}
          >
            <h4 className="fw-bold text-primary">{context.title}</h4>
            <p className="text-muted">{context.paragraph}</p>

            <h5 className="fw-bold mt-4 mb-3 text-primary">
              Generated Questions
            </h5>
            <ListGroup variant="flush">
              {questions.map((q, i) => (
                <ListGroup.Item key={i} className="py-3">
                  <strong>Q{i + 1}:</strong> {q.question_text}
                  <ol className="mt-2">
                    {q.options.map((opt, j) => (
                      <li key={j}>{opt.option_text}</li>
                    ))}
                  </ol>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}
      </Container>
    </Container>
  );
}

export default ContextPage;
