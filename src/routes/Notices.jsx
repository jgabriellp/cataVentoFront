import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import { MoreVertical } from "lucide-react";
import LoggedNavbar from "../components/LoggedNavbar";
import api from "../services/api";
import EditNoticeModal from "../components/EditNoticeModal";
import CreateNoticeModal from "../components/CreateNoticeModal"; // Novo modal

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [showButton, setShowButton] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const pageSize = 5;

  // =========================
  // Helpers
  // =========================
  const getAudienceLabel = (role) => {
    switch (role) {
      case 1:
        return "Paciente";
      case 2:
        return "AT";
      case 3:
        return "Coordenador";
      case 4:
        return "Administrador";
      default:
        return "Outro";
    }
  };

  const getAudienceColor = (role) => {
    switch (role) {
      case 1:
        return "secondary";
      case 2:
        return "success";
      case 3:
        return "warning";
      case 4:
        return "danger";
      default:
        return "info";
    }
  };

  const handleOpenEditModal = (notice) => {
    setSelectedNotice(notice);
    setShowEditModal(true);
  };

  // =========================
  // API
  // =========================
  const fetchNotices = async (page = 1) => {
    try {
      const response = await api.get(
        `/api/Notice?pageNumber=${page}&pageSize=${pageSize}`
      );

      const data = response.data;

      if (!data || data.length === 0) {
        setShowButton(false);
        return;
      }

      if (page === 1) {
        setNotices(data);
      } else {
        setNotices((prev) => [...prev, ...data]);
      }

      setPageNumber(page);
    } catch (err) {
      console.error("Erro ao carregar notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNoticeStatus = async (notice) => {
    try {
      const updatedNotice = {
        ...notice,
        isActive: !notice.isActive,
      };

      await api.put(`/api/Notice/${notice.noticeId}`, updatedNotice);

      setNotices((prev) =>
        prev.map((n) => (n.noticeId === notice.noticeId ? updatedNotice : n))
      );
    } catch (err) {
      console.error("Erro ao atualizar status do aviso:", err);
    }
  };

  // =========================
  // Effects
  // =========================
  useEffect(() => {
    fetchNotices(1);
  }, []);

  // =========================
  // Render
  // =========================
  return (
    <>
      <LoggedNavbar />

      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #04b1b7 0%, #9ce9ec 100%)",
          paddingTop: "60px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: "white", fontWeight: "600" }}>Avisos</h2>
                <Button
                  style={{
                    backgroundColor: "#04b1b7",
                    borderColor: "#04b1b7",
                    borderRadius: "25px",
                    fontWeight: "600",
                  }}
                  onClick={() => setShowCreateModal(true)}
                >
                  Novo Aviso
                </Button>
              </div>

              {loading && pageNumber === 1 ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  {notices.map((notice) => (
                    <Card
                      key={notice.noticeId}
                      className="mb-4"
                      style={{
                        borderRadius: "15px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        opacity: notice.isActive ? 1 : 0.6,
                      }}
                    >
                      <Card.Body>
                        {/* Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                            gap: "10px",
                          }}
                        >
                          <h5 style={{ fontWeight: "600", marginBottom: 0 }}>
                            {notice.title}
                          </h5>

                          <span
                            style={{
                              color: "#888",
                              fontSize: "0.85rem",
                              display: "block",
                              marginLeft: "10px",
                              marginRight: "auto",
                              marginBottom: "6px",
                            }}
                          >
                            {new Date(notice.dateCreated).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>

                          {/* Toggle ativo/inativo */}
                          <Form.Check
                            type="switch"
                            id={`notice-active-${notice.noticeId}`}
                            label={notice.isActive ? "Ativo" : "Inativo"}
                            checked={notice.isActive}
                            onChange={() => toggleNoticeStatus(notice)}
                          />

                          {/* Botão de ações */}
                          <MoreVertical
                            size={20}
                            style={{
                              cursor: "pointer",
                              color: "#666",
                              marginTop: "auto",
                              marginBottom: "auto",
                            }}
                            onClick={() => handleOpenEditModal(notice)}
                          />
                        </div>

                        {/* Conteúdo */}
                        <p style={{ marginBottom: "10px" }}>{notice.content}</p>

                        {/* Imagem */}
                        {notice.photoUrl && (
                          <img
                            src={notice.photoUrl}
                            alt="Aviso"
                            style={{
                              width: "100%",
                              borderRadius: "10px",
                              objectFit: "cover",
                              marginBottom: "5px",
                            }}
                          />
                        )}

                        {/* Públicos */}
                        {notice.audiences?.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            {notice.audiences.map((aud) => (
                              <Badge
                                key={aud.noticeAudienceId}
                                bg={getAudienceColor(aud.audienceRole)}
                                className="me-1"
                              >
                                {getAudienceLabel(aud.audienceRole)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}

                  {showButton && (
                    <div className="text-center mt-3">
                      <Button
                        variant="light"
                        style={{
                          color: "#04b1b7",
                          borderRadius: "25px",
                          padding: "6px 18px",
                          fontWeight: "600",
                        }}
                        onClick={() => fetchNotices(pageNumber + 1)}
                      >
                        Carregar mais
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Modal de edição de aviso */}
      <EditNoticeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        notice={selectedNotice}
        onUpdated={() => fetchNotices(1)}
      />

      {/* Modal de criação de aviso */}
      <CreateNoticeModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => fetchNotices(1)}
      />
    </>
  );
};

export default Notices;
