// src/components/LoggedNavbar.jsx
import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const LoggedNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <Navbar
        expand="lg"
        style={{
          backgroundColor: "#04b1b7",
          fontFamily: "'Poppins', sans-serif",
        }}
        className="shadow-sm"
      >
        <Container>
          <img
            src="https://res.cloudinary.com/dnxt4nqp3/image/upload/v1762260156/ctvse_s8g67k.png"
            alt="Logo"
            style={{
              width: "45px",
              height: "45px",
              objectFit: "cover",
              borderRadius: "50%",
              marginRight: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          />
          <Navbar.Brand
            navigate="/relatos"
            style={{ color: "white", fontWeight: 600, fontSize: "1.2rem" }}
          >
            Instituto Cata-Vento
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />

          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link
                href="/relatos"
                style={{
                  color: "whitesmoke",
                  fontWeight: 500,
                  marginRight: "15px",
                }}
              >
                Relatos
              </Nav.Link>

              {user.role === 3 || user.role === 4 ? (
                <Nav.Link
                  href="/export"
                  style={{
                    color: "whitesmoke",
                    fontWeight: 500,
                    marginRight: "15px",
                  }}
                >
                  Exportação
                </Nav.Link>
              ) : null}

              <Nav.Link
                href="/board"
                style={{
                  color: "whitesmoke",
                  fontWeight: 500,
                  marginRight: "15px",
                }}
              >
                Board
              </Nav.Link>

              {user.role === 3 || user.role === 4 ? (
                <Nav.Link
                  href="/grupos"
                  style={{
                    color: "whitesmoke",
                    fontWeight: 500,
                    marginRight: "15px",
                  }}
                >
                  Grupos
                </Nav.Link>
              ) : null}

              {user.role === 3 || user.role === 4 ? (
                <Nav.Link
                  href="/avisos"
                  style={{
                    color: "whitesmoke",
                    fontWeight: 500,
                    marginRight: "15px",
                  }}
                >
                  Avisos
                </Nav.Link>
              ) : null}

              {user.role === 3 || user.role === 4 ? (
                <Nav.Link
                  href="/usuarios"
                  style={{
                    color: "whitesmoke",
                    fontWeight: 500,
                    marginRight: "15px",
                  }}
                >
                  Usuários
                </Nav.Link>
              ) : null}

              <Nav.Link
                as="span"
                onClick={() => navigate(`/perfil/${user.id}`)}
                style={{
                  color: "whitesmoke",
                  fontWeight: 500,
                  marginRight: "15px",
                  cursor: "pointer",
                }}
              >
                Perfil
              </Nav.Link>

              <Button
                variant="light"
                style={{
                  color: "#04b1b7",
                  fontWeight: 600,
                  borderRadius: "25px",
                  padding: "6px 18px",
                  border: "none",
                }}
                onClick={handleLogout}
              >
                Sair
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default LoggedNavbar;
