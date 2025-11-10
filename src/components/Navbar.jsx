import React from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AppNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="shadow-sm px-4 py-3"
    >
      <Container>
        <Navbar.Brand href="/dashboard" className="fw-bold fs-4 text-uppercase">
          🧠 Question Paper Generator
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav" className="justify-content-end">
          <Nav>
            <Nav.Link href="/dashboard" className="text-light mx-2">
              Dashboard
            </Nav.Link>
            <Nav.Link href="/context" className="text-light mx-2">
              Contexts
            </Nav.Link>
            <Nav.Link href="/question" className="text-light mx-2">
              Download Paper
            </Nav.Link>
            <Button
              variant="outline-light"
              className="mx-2"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
