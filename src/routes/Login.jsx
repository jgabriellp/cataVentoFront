import React from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        
        const email = event.target.formEmail.value;
        const password = event.target.formPassword.value;

        try {
            const response = await api.post('/api/AuthLogin/Login', {
                email,
                password
            });

            const token = response.data.token;
            const user = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                photo: response.data.photoUrl,
                role: response.data.role
            }
            console.log("Token recebido:", token);
            console.log("Usuário recebido:", user);

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/relatos");
            // console.log("Login bem-sucedido!");
        } catch (error) {
            alert("Email ou senha inválidos.");
            console.error(error);
        }

    }

  return (
    <>
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #04b1b7 0%, #9ce9ec 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <Card.Body className="p-5 text-center">
                  <h3
                    style={{
                      color: "#04b1b7",
                      marginBottom: "20px",
                      fontWeight: "600",
                    }}
                  >
                    Bem-vindo de volta
                  </h3>
                  <p style={{ color: "#666", marginBottom: "30px" }}>
                    Faça login para acessar sua conta
                  </p>
                  <Form onSubmit={handleLogin}>
                    <Form.Group
                      controlId="formEmail"
                      className="mb-3 text-start"
                    >
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Digite seu email"
                        style={{
                          borderRadius: "25px",
                          padding: "10px 15px",
                        }}
                      />
                    </Form.Group>

                    <Form.Group
                      controlId="formPassword"
                      className="mb-4 text-start"
                    >
                      <Form.Label>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Digite sua senha"
                        style={{
                          borderRadius: "25px",
                          padding: "10px 15px",
                        }}
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      style={{
                        backgroundColor: "#04b1b7",
                        border: "none",
                        borderRadius: "25px",
                        padding: "10px 20px",
                        fontWeight: "600",
                        width: "100%",
                      }}

                    >
                      Entrar
                    </Button>

                    {/* <p style={{ marginTop: "20px", color: "#555" }}>
                      Não tem uma conta?{" "}
                      <a href="#register" style={{ color: "#04b1b7" }}>
                        Cadastre-se
                      </a>
                    </p> */}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

export default Login;