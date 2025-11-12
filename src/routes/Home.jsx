import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
} from "react-bootstrap";

const Home = () => {
  
  const navigate = useNavigate();

  return (
    <>
      {/* NAVBAR */}
      <Navbar
        style={{
          backgroundColor: "#04b1b7",
          fontFamily: "'Poppins', sans-serif",
          padding: "15px 0",
        }}
        expand="lg"
        className="shadow-sm fixed-top"
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
            style={{
              color: "whitesmoke",
              fontWeight: 600,
              fontSize: "1.3rem",
            }}
            onClick={(e) => {
              e.preventDefault();
              const section = document.getElementById("carousel");
              if (section) {
                const yOffset = -70; // ajuste conforme a altura da sua navbar
                const y =
                  section.getBoundingClientRect().top +
                  window.pageYOffset +
                  yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            Instituto Cata-Vento
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {[
                { label: "Quem somos?", id: "about" },
                { label: "Nossa missão", id: "mission" },
                { label: "Nossa visão", id: "vision" },
                { label: "Serviços", id: "services" },
                { label: "Contato", id: "contact" },
              ].map(({ label, id }, idx) => (
                <Nav.Link
                  key={idx}
                  style={{
                    color: "whitesmoke",
                    fontWeight: 500,
                    marginRight: "10px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.getElementById(id);
                    if (section) {
                      const yOffset = -70; // ajuste conforme a altura da sua navbar
                      const y =
                        section.getBoundingClientRect().top +
                        window.pageYOffset +
                        yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                >
                  {label}
                </Nav.Link>
              ))}

              <Button
                variant="light"
                style={{
                  color: "#04b1b7",
                  fontWeight: 600,
                  borderRadius: "25px",
                  padding: "6px 18px",
                  border: "none",
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* HERO / CAROUSEL */}
      <section
        id="carousel"
        style={{
          background: "#f5f5f5",
          textAlign: "center",
          marginTop: "70px",
        }}
      >
        <Carousel fade>
          {[
            "https://res.cloudinary.com/dnxt4nqp3/image/upload/v1757531406/IMG_8446_cjgfjw_nuemgo.jpg",
            "https://res.cloudinary.com/dnxt4nqp3/image/upload/v1755089475/WhatsApp_Image_2025-07-31_at_08.31.42_vt3b8t.jpg",
            "https://res.cloudinary.com/dnxt4nqp3/image/upload/v1755089475/WhatsApp_Image_2025-07-31_at_08.31.41_qxfmux.jpg",
          ].map((src, i) => (
            <Carousel.Item key={i}>
              <img
                src={src}
                alt={`slide-${i}`}
                className="d-block w-100"
                style={{
                  maxHeight: "500px",
                  objectFit: "cover",
                  width: "100%",
                }}
              />
              {/* <Carousel.Caption>
                <h3 style={{ fontWeight: 600 }}>Transformando Vidas</h3>
                <p>Com ciência, empatia e propósito.</p>
              </Carousel.Caption> */}
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* QUEM SOMOS */}
      <section id="about" style={{ padding: "80px 0" }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <img
                src="https://res.cloudinary.com/dnxt4nqp3/image/upload/v1762259847/img_aj44oc.png"
                alt="Sobre nós"
                className="img-fluid"
                style={{
                  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                }}
              />
            </Col>
            <Col md={6}>
              <h2 style={{ fontWeight: 700, color: "#04b1b7" }}>Quem somos?</h2>
              <p style={{ fontSize: "1.1rem", marginTop: "20px" }}>
                O Instituto Cata-Vento é uma clínica especializada que atua com
                intervenção em ABA para pessoas com transtornos do
                neurodesenvolvimento e desenvolvimento atípico. A clínica
                oferece um serviço qualificado e caracterizado pelo atendimento
                personalizado, considerando as necessidades e singularidades de
                cada aprendiz.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* MISSÃO */}
      <section
        id="mission"
        style={{
          padding: "80px 0",
          backgroundColor: "#f8f9fa",
          textAlign: "center",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 style={{ color: "#04b1b7", fontWeight: 700 }}>
                Nossa missão
              </h2>
              <p style={{ fontSize: "1.1rem", marginTop: "20px" }}>
                Promover a qualidade de vida aos aprendizes neuro atípicos,
                famílias e comunidade envolvida através de serviços respaldados
                na ciência e ética, promovendo a difusão do conhecimento de
                práticas baseadas evidências (PBE’s) para a sociedade em geral.
              </p>
            </Col>
            <Col md={6}>
              <img
                src="https://res.cloudinary.com/dnxt4nqp3/image/upload/v1762260156/ctvse_s8g67k.png"
                alt="Missão"
                style={{
                  width: "280px",
                  height: "280px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  marginTop: "30px",
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* SERVIÇOS */}
      <section id="services" style={{ padding: "80px 0" }}>
        <Container>
          <h2
            className="text-center"
            style={{ color: "#04b1b7", fontWeight: 700, marginBottom: "15px" }}
          >
            Nossos Serviços
          </h2>
          <p className="text-center mb-5" style={{ fontSize: "1.1rem" }}>
            Onde a compreensão encontra a inovação terapêutica.
          </p>
          <Row>
            {[
              "Intervenção ABA",
              "Treino de Habilidades Sociais",
              "Avaliação Diagnóstica e de Repertório",
              "Treinamento Parental",
              "Supervisão de Casos",
              "Psicopedagogia",
            ].map((servico, i) => (
              <Col md={4} className="mb-4" key={i}>
                <Card
                  style={{
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <Card.Body style={{ textAlign: "center" }}>
                    <Card.Title style={{ fontWeight: 600 }}>
                      {servico}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* VISÃO */}
      <section
        id="vision"
        style={{
          padding: "80px 0",
          backgroundColor: "#f8f9fa",
          textAlign: "center",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 style={{ color: "#04b1b7", fontWeight: 700 }}>Nossa Visão</h2>
              <p style={{ fontSize: "1.1rem", marginTop: "20px" }}>
                A nossa visão é entregar um serviço individualizado com o mais
                alto padrão de qualidade técnica e ética, criando um impacto
                profundo e duradouro na vida das pessoas atendidas, contribuindo
                significativamente para a sociedade.
              </p>
            </Col>
            <Col md={6}>
              <img
                src="https://res.cloudinary.com/dnxt4nqp3/image/upload/v1762382098/interact_j8r2xz.png"
                alt="Visão"
                className="img-fluid"
                style={{
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  borderRadius: "10px",
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        style={{
          padding: "50px 0",
          background: "#04b1b7",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Container>
          <h5>Localização</h5>
          <a
            href="https://www.google.com/maps/place/Instituto+Cata-Vento/@-10.9340261,-37.0573287,17z/data=!3m1!4b1!4m6!3m5!1s0x71ab3ec4895e9fd:0x2c36e670caabe097!8m2!3d-10.9340261!4d-37.0573287!16s%2Fg%2F11vsyj317d?entry=ttu&g_ep=EgoyMDI1MTEwMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginBottom: "10px",
              display: "inline-block",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            R. Francisco Portugal, 809 - Grageru, Aracaju - SE, 49025-240
          </a>

          <h5>Contato</h5>
          <p style={{ marginBottom: "10px" }}>contato@cataventose.com.br</p>
          <p>(79) 98854-2390</p>
          <p style={{ fontSize: "0.9rem", marginTop: "20px" }}>
            © 2025 Instituto Cata-Vento. Todos os direitos reservados.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Home;
