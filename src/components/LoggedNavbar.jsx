// src/components/LoggedNavbar.jsx
import { useState } from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const navLinkStyle = (isActive) => ({
  color: "white",
  fontWeight: 500,
  marginRight: "4px",
  padding: "6px 12px",
  borderRadius: "8px",
  position: "relative",
  transition: "background-color 0.2s ease",
  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "transparent",
  textDecoration: "none",
});

const NavItem = ({ href, children, isActive }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Nav.Link
      href={href}
      style={{
        ...navLinkStyle(isActive),
        backgroundColor:
          isActive
            ? "rgba(255,255,255,0.2)"
            : hovered
            ? "rgba(255,255,255,0.12)"
            : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {isActive && (
        <span
          style={{
            display: "block",
            height: "2px",
            backgroundColor: "white",
            borderRadius: "2px",
            marginTop: "2px",
            position: "absolute",
            bottom: "4px",
            left: "12px",
            right: "12px",
          }}
        />
      )}
    </Nav.Link>
  );
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const LoggedNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .navbar-toggler { border-color: rgba(255,255,255,0.5) !important; }
        .navbar-toggler-icon { filter: invert(1); }
      `}</style>
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
            <Nav className="ms-auto align-items-center gap-1">
              <NavItem href="/relatos" isActive={isActive("/relatos")}>
                Relatos
              </NavItem>

              {user.role !== 5 && (
                <NavItem href="/tarefas" isActive={isActive("/tarefas")}>
                  Tarefas
                </NavItem>
              )}

              {(user.role === 3 || user.role === 4) && (
                <NavItem href="/grupos" isActive={isActive("/grupos")}>
                  Grupos
                </NavItem>
              )}

              {(user.role === 3 || user.role === 4) && (
                <NavItem href="/usuarios" isActive={isActive("/usuarios")}>
                  Usuários
                </NavItem>
              )}

              {(user.role === 3 || user.role === 4) && (
                <NavItem href="/export" isActive={isActive("/export")}>
                  Exportação
                </NavItem>
              )}

              {(user.role === 3 || user.role === 4) && (
                <NavItem href="/avisos" isActive={isActive("/avisos")}>
                  Avisos
                </NavItem>
              )}

              {/* Separador */}
              <div
                style={{
                  width: "1px",
                  height: "28px",
                  backgroundColor: "rgba(255,255,255,0.3)",
                  margin: "0 8px",
                }}
              />

              {/* Avatar com iniciais */}
              <div
                onClick={() => navigate(`/perfil/${user.id}`)}
                onMouseEnter={() => setAvatarHovered(true)}
                onMouseLeave={() => setAvatarHovered(false)}
                title={user.name || "Perfil"}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: avatarHovered
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.25)",
                  border: "2px solid rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "white",
                  transition: "background-color 0.2s ease, transform 0.2s ease",
                  transform: avatarHovered ? "scale(1.08)" : "scale(1)",
                  marginRight: "10px",
                  userSelect: "none",
                }}
              >
                {getInitials(user.name)}
              </div>

              {/* Botão Sair */}
              <Button
                variant="light"
                onMouseEnter={() => setLogoutHovered(true)}
                onMouseLeave={() => setLogoutHovered(false)}
                style={{
                  color: "#04b1b7",
                  fontWeight: 600,
                  borderRadius: "25px",
                  padding: "6px 18px",
                  border: "none",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity: logoutHovered ? 0.85 : 1,
                  transform: logoutHovered ? "scale(1.04)" : "scale(1)",
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
