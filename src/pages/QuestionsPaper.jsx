import { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Table,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import api from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

import "bootstrap/dist/css/bootstrap.min.css";

export default function QuestionsPage() {
  const [contexts, setContexts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    context: "",
    question_text: "",
    correct_option: "",
    options: ["", "", "", ""],
  });

  // Fetch contexts by user
  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const username = localStorage.getItem("username");
        const res = await api.get(`contexts/${username}/`);
        setContexts(res.data);
      } catch (err) {
        console.error("Error fetching contexts:", err);
      }
    };
    fetchContexts();
  }, []);

  // Fetch questions for a context
  const fetchQuestionsByContext = async (contextId) => {
    if (!contextId) return;
    setLoading(true);
    try {
      const res = await api.get(`contexts/${contextId}/questions/`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Context selection
  const handleContextChange = (e) => {
    const contextId = e.target.value;
    setSelectedContext(contextId);
    setFormData({ ...formData, context: contextId });
    fetchQuestionsByContext(contextId);
  };

  // Input change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Option change
  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    updated[index] = value;
    setFormData({ ...formData, options: updated });
  };

  // Submit question + options
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContext) {
      setMessage("⚠️ Please select a context first!");
      return;
    }
    if (formData.options.some((opt) => !opt)) {
      setMessage("⚠️ Please fill all 4 options!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.post("questions/", formData);
      setMessage("✅ Question and options added successfully!");
      setFormData({
        context: selectedContext,
        question_text: "",
        correct_option: "",
        options: ["", "", "", ""],
      });
      fetchQuestionsByContext(selectedContext);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add question!");
    } finally {
      setLoading(false);
    }
  };

const handleDownloadPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Question Paper", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 35; // starting vertical position

  questions.forEach((q, index) => {
    // Question number + text
    doc.text(`${index + 1}) ${q.question_text}`, 14, y);
    y += 8;

    // Each option with A/B/C/D
    const optionLabels = ["a)", "b)", "c)", "d)"];
    q.options.slice(0, 4).forEach((opt, i) => {
      doc.text(`   ${optionLabels[i]} ${opt.option_text}`, 20, y);
      y += 7;
    });

    y += 5; // gap between questions

    // Add new page if content goes beyond page height
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("QuestionPaper.pdf");
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
          🎯 Context-Based Question Management
        </h2>

        {message && (
          <Alert
            variant={
              message.includes("❌")
                ? "danger"
                : message.includes("✅")
                ? "success"
                : "info"
            }
            className="text-center fw-semibold shadow-sm"
          >
            {message}
          </Alert>
        )}

        {/* Select Context */}
        <Card className="p-4 shadow-lg border-0 mb-4">
          <h4 className="fw-bold text-primary mb-3">Select Context</h4>
          <Form.Group>
            <Form.Select value={selectedContext} onChange={handleContextChange}>
              <option value="">-- Select Context --</option>
              {contexts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card>

        {/* Add Question */}
        {selectedContext && (
          <Card className="p-4 shadow-lg border-0 mb-4">
            <h4 className="fw-bold text-primary mb-3">Add Question</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {[0, 1, 2, 3].map((i) => (
                <Form.Group key={i} className="mb-2">
                  <Form.Label>Option {i + 1}</Form.Label>
                  <Form.Control
                    value={formData.options[i]}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required
                  />
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Label>Correct Option</Form.Label>
                <Form.Control
                  name="correct_option"
                  value={formData.correct_option}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="text-center mt-4">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="px-5 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Question"
                  )}
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* List Questions */}
        {selectedContext && (
          <Card className="p-4 shadow-lg border-0">
            <h4 className="fw-bold text-primary mb-3 d-flex justify-content-between">
              Questions
              <Button
                onClick={handleDownloadPDF}
                variant="danger"
                size="sm"
                className="fw-semibold"
              >
                ⬇️ Download PDF
              </Button>
            </h4>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <Table bordered hover responsive className="align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length ? (
                    questions.map((q, i) => (
                      <tr key={q.id}>
                        <td>{i + 1}</td>
                        <td>{q.question_text}</td>
                        <td>
                          {q.options.map((o, idx) => (
                            <div key={idx}>{o.option_text}</div>
                          ))}
                        </td>
                        <td>{q.correct_option}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-muted">
                        No questions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card>
        )}
      </Container>
    </Container>
  );
}
