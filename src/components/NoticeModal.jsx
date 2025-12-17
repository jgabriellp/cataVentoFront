import React, { useEffect, useState } from "react";
import { Modal, Button, Badge } from "react-bootstrap";

const NoticeModal = ({ notices = [], show, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentNotice = notices[currentIndex];

  useEffect(() => {
    if (!show) {
      setCurrentIndex(0);
    }
  }, [show]);

  const handleClose = () => {
    if (currentIndex < notices.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
      setCurrentIndex(0);
    }
  };

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

  if (!currentNotice) return null;

  return (
    <Modal show={show} backdrop="static" centered onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>{currentNotice.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Data */}
        <small style={{ color: "#888" }}>
          {new Date(currentNotice.dateCreated).toLocaleDateString("pt-BR")}
        </small>

        {/* Conteúdo */}
        <p style={{ marginTop: "10px" }}>{currentNotice.content}</p>

        {/* Imagem */}
        {currentNotice.photoUrl && (
          <img
            src={currentNotice.photoUrl}
            alt="Aviso"
            style={{
              width: "100%",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          />
        )}

        {/* Públicos */}
        {/* {currentNotice.audiences?.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            {currentNotice.audiences.map((aud) => (
              <Badge key={aud.noticeAudienceId} bg="info" className="me-1">
                {getAudienceLabel(aud.audienceRole)}
              </Badge>
            ))}
          </div>
        )} */}
      </Modal.Body>

      <Modal.Footer>
        <Button style={{ backgroundColor: "#04b1b7" }} onClick={handleClose}>
          {currentIndex < notices.length - 1 ? "Próximo aviso" : "Fechar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NoticeModal;
