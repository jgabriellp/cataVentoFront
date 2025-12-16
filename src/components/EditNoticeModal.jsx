import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";
import { uploadToCloudinary } from "../services/uploadToCloudinary";
import { deleteFromCloudinary } from "../services/deleteFromCloudinary";

const EditNoticeModal = ({ show, onClose, notice, onUpdated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  // 🔹 Carregar dados quando abrir
  useEffect(() => {
    if (notice && show) {
      setTitle(notice.title || "");
      setContent(notice.content || "");
      setIsActive(notice.isActive);
      setPreviewUrl(notice.photoUrl || null);
      setPhotoFile(null);
    }
  }, [notice, show]);

  const resetFields = () => {
    setTitle("");
    setContent("");
    setIsActive(true);
    setPreviewUrl(null);
    setPhotoFile(null);

    const fileInput = document.getElementById("editNoticeFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    setLoading(true);

    let finalPhotoUrl = previewUrl;

    try {
      // 🔹 Upload de nova imagem
      if (photoFile) {
        finalPhotoUrl = await uploadToCloudinary(photoFile);
      }

      // 🔹 PUT Notice
      await api.put(`/api/Notice/${notice.noticeId}`, {
        noticeId: notice.noticeId,
        title,
        content,
        isActive,
        photoUrl: finalPhotoUrl,
        dateCreated: notice.dateCreated,
        creatorId: notice.creatorId,
        audiences: notice.audiences,
      });

      // 🔹 Exclui imagem antiga se trocou
      if (photoFile && notice.photoUrl) {
        await deleteFromCloudinary(notice.photoUrl);
      }

      alert("Aviso atualizado com sucesso!");

      if (onUpdated) onUpdated();
      resetFields();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar aviso.");
    }

    setLoading(false);
  };

  const closeAndReset = () => {
    resetFields();
    onClose();
  };

  return (
    <Modal show={show} onHide={closeAndReset} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#04b1b7" }}>Editar Aviso</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Título */}
        <Form.Group className="mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        {/* Conteúdo */}
        <Form.Group className="mb-3">
          <Form.Label>Conteúdo</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>

        {/* Ativo */}
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            label={isActive ? "Aviso ativo" : "Aviso inativo"}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Form.Group>

        {/* Foto */}
        <Form.Group className="mb-3">
          <Form.Control
            type="file"
            id="editNoticeFileInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <Button
            style={{
              backgroundColor: "#04b1b7",
              borderColor: "#04b1b7",
              borderRadius: "25px",
            }}
            onClick={() =>
              document.getElementById("editNoticeFileInput").click()
            }
          >
            Escolher Imagem
          </Button>

          {previewUrl && (
            <div className="mt-3 text-center">
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "2px solid #04b1b7",
                }}
              />
            </div>
          )}
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeAndReset} disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            fontWeight: "500",
            color: "white",
            background: "#04b1b7",
            borderColor: "#04b1b7",
          }}
        >
          {loading ? <Spinner size="sm" /> : "Salvar Alterações"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditNoticeModal;
