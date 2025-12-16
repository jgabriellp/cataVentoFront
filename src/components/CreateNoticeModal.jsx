import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { uploadToCloudinary } from "../services/uploadToCloudinary";
import api from "../services/api";

const roles = [
  { id: 1, label: "Paciente" },
  { id: 2, label: "AT" },
  { id: 3, label: "Coordenador" },
  { id: 4, label: "Administrador" },
];

const CreateNoticeModal = ({ show, onClose, onCreated, creatorId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreview("");
    const fileInput = document.getElementById("createNoticeFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleCreate = async () => {
    if (!title || !content) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    if (selectedRoles.length === 0) {
      alert("Selecione pelo menos um público.");
      return;
    }

    setLoading(true);

    let photoUrlFinal = "";
    try {
      if (selectedFile) {
        photoUrlFinal = await uploadToCloudinary(selectedFile);
      }

      const newNotice = {
        title,
        content,
        isActive,
        photoUrl: photoUrlFinal,
        dateCreated: new Date().toISOString(),
        creatorId,
        audiences: selectedRoles.map((roleId) => ({ audienceRole: roleId })),
      };

      const res = await api.post("/api/Notice", newNotice);

      if (res.status !== 201 && res.status !== 200) {
        throw new Error("Erro ao criar aviso.");
      }

      alert("Aviso criado com sucesso!");
      setTitle("");
      setContent("");
      setSelectedRoles([]);
      handleClearImage();
      setIsActive(true);

      onClose();
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar aviso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#04b1b7" }}>Novo Aviso</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Conteúdo</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            label={isActive ? "Aviso ativo" : "Aviso inativo"}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Público</Form.Label>
          <div className="d-flex gap-3 flex-wrap">
            {roles.map((role) => (
              <Form.Check
                key={role.id}
                type="checkbox"
                label={role.label}
                checked={selectedRoles.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Imagem</Form.Label>
          <div className="d-flex gap-2 mb-2">
            <Form.Control
              type="file"
              accept="image/*"
              id="createNoticeFileInput"
              onChange={handleFileSelect}
              style={{ borderRadius: "12px" }}
            />
          </div>
          {(preview || selectedFile) && (
            <div className="text-center mt-2">
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: "100%", borderRadius: "10px" }}
              />
            </div>
          )}
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        {(preview || selectedFile) && (
          <Button
            variant="light"
            style={{
              borderRadius: "25px",
              padding: "6px 20px",
              fontWeight: "500",
              border: "1px solid #ddd",
              marginRight: "auto",
            }}
            onClick={handleClearImage}
          >
            Limpar Foto
          </Button>
        )}

        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          disabled={loading}
          style={{
            fontWeight: "500",
            color: "white",
            background: "#04b1b7",
            borderColor: "#04b1b7",
          }}
        >
          {loading ? <Spinner size="sm" /> : "Criar Aviso"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateNoticeModal;
