import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const PasswordChangeModal = ({ show, onClose, user, onUpdated }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setOldPassword("");
    setNewPassword("");
  };

  const closeAndReset = () => {
    resetFields();
    onClose();
  };

  return (
    <Modal show={show} onHide={closeAndReset} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#04b1b7" }}>Mudar Senha</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Old Password */}
        <Form.Group className="mb-3">
          <Form.Label>Senha Atual</Form.Label>
          <Form.Control
            type="text"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </Form.Group>

        {/* New Password */}
        <Form.Group className="mb-3">
          <Form.Label>Nova Senha</Form.Label>
          <Form.Control
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeAndReset} disabled={loading}>
          Cancelar
        </Button>

        <Button
          disabled={loading}
          style={{
            fontWeight: "500",
            color: "white",
            background: "#04b1b7",
            borderColor: "#04b1b7",
            padding: "6px 20px",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#039aa0";
            e.target.style.borderColor = "#039aa0";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#04b1b7";
            e.target.style.borderColor = "#04b1b7";
          }}
          // onClick={handleUpdate}
        >
          {loading ? <Spinner size="sm" /> : "Salvar Alterações"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PasswordChangeModal;
