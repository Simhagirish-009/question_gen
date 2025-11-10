import React from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Welcome = () => {
  return (
    <>
      {/* Navbar Section */}
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="shadow-sm px-4 py-3"
      >
        <Navbar.Brand href="/" className="fw-bold fs-4 text-uppercase">
          🧠 Question Paper Generator
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link href="/login">
              <Button variant="outline-light" className="mx-2">
                Login
              </Button>
            </Nav.Link>
            <Nav.Link href="/register">
              <Button variant="primary" className="mx-2">
                Register
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Welcome Section */}
      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center text-center vh-100 bg-light"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
          color: "white",
        }}
      >
        <Row>
          <Col>
            <h1 className="display-3 fw-bold mb-3">
              Welcome to <br />
              Question Paper Generator
            </h1>
            <p className="lead fs-5 mb-4">
              Effortlessly create, customize, and manage question papers with AI
              assistance.
            </p>
            <div>
              <Button
                href="/login"
                variant="light"
                size="lg"
                className="mx-2 px-4 fw-semibold"
              >
                Login
              </Button>
              <Button
                href="/register"
                variant="outline-light"
                size="lg"
                className="mx-2 px-4 fw-semibold"
              >
                Register
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Welcome;
