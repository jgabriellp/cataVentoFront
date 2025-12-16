import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";
import { uploadToCloudinary } from "../services/uploadToCloudinary";
import { deleteFromCloudinary } from "../services/deleteFromCloudinary";

const roles = [
  { id: 1, label: "Paciente" },
  { id: 2, label: "AT" },
  { id: 3, label: "Coordenador" },
  { id: 4, label: "Administrador" },
];

const EditNoticeModal = ({ show, onClose, notice, onUpdated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedRoles, setSelectedRoles] = useState([]); // para checkboxes

  const [loading, setLoading] = useState(false);

  // Carregar dados do notice
  useEffect(() => {
    if (notice && show) {
      setTitle(notice.title || "");
      setContent(notice.content || "");
      setIsActive(notice.isActive);
      setImageUrl(notice.photoUrl || "");
      setPreview("");
      setSelectedFile(null);

      // popula os públicos selecionados
      const rolesIds = notice.audiences?.map((a) => a.audienceRole) || [];
      setSelectedRoles(rolesIds);
    }
  }, [notice, show]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setPreview("");
    setImageUrl("");
    setSelectedFile(null);
    const fileInput = document.getElementById("editNoticeFileInput");
    if (fileInput) fileInput.value = "";
  };

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleUpdate = async () => {
    if (selectedRoles.length === 0) {
      alert("Selecione pelo menos um público.");
      return;
    }

    setLoading(true);

    const oldImageUrl = notice.photoUrl;
    let newImageUrl = imageUrl;
    let uploadedNewImage = false;

    try {
      if (!selectedFile && !imageUrl && oldImageUrl) {
        newImageUrl = "";
      }

      if (selectedFile) {
        newImageUrl = await uploadToCloudinary(selectedFile);
        uploadedNewImage = true;
      }

      // monta o objeto para PUT
      const updatedNotice = {
        noticeId: notice.noticeId,
        title,
        content,
        isActive,
        photoUrl: newImageUrl,
        dateCreated: notice.dateCreated,
        creatorId: notice.creatorId,
        audiences: selectedRoles.map((roleId) => ({ audienceRole: roleId })),
      };

      await api.put(`/api/Notice/${notice.noticeId}`, updatedNotice);

      // deletar imagens antigas se necessário
      if (!selectedFile && !imageUrl && oldImageUrl) {
        await deleteFromCloudinary(oldImageUrl);
      }
      if (selectedFile && oldImageUrl) {
        await deleteFromCloudinary(oldImageUrl);
      }

      alert("Aviso atualizado com sucesso!");
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar aviso.");

      if (uploadedNewImage && newImageUrl) {
        try {
          await deleteFromCloudinary(newImageUrl);
        } catch (deleteErr) {
          console.error("Erro ao deletar nova imagem após falha:", deleteErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicione dentro do componente EditNoticeModal, antes do return:

  const handleDeleteNotice = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este aviso?")) return;

    setLoading(true);
    try {
      // Deleta a imagem do Cloudinary se existir
      if (notice.photoUrl) {
        await deleteFromCloudinary(notice.photoUrl);
      }

      // Deleta o aviso no backend
      await api.delete(`/api/Notice/${notice.noticeId}`);

      alert("Aviso excluído com sucesso!");
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir aviso.");
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    setTitle("");
    setContent("");
    setIsActive(true);
    setImageUrl("");
    setPreview("");
    setSelectedFile(null);
    setSelectedRoles([]);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeAndReset} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#04b1b7" }}>Editar Aviso</Modal.Title>
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
              id="editNoticeFileInput"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ borderRadius: "12px" }}
            />
          </div>
          {(preview || imageUrl) && (
            <div className="text-center mt-2">
              <img
                src={preview || imageUrl}
                alt="preview"
                style={{ maxWidth: "100%", borderRadius: "10px" }}
              />
            </div>
          )}
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        {(preview || imageUrl) && (
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

        <Button
          variant="danger"
          onClick={handleDeleteNotice}
          disabled={loading}
          style={{
            borderRadius: "25px",
            padding: "6px 20px",
            fontWeight: "500",
            marginRight: "10px",
          }}
        >
          {loading ? <Spinner size="sm" /> : "Excluir Aviso"}
        </Button>
        
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
