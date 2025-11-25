import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { uploadToCloudinary } from "../services/uploadToCloudinary";
import { deleteFromCloudinary } from "../services/deleteFromCloudinary";
import api from "../services/api";

const EditUserModal = ({ show, onClose, user, onUpdated }) => {
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const [userName, setUserName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  // 🔹 Carrega dados do usuário quando o modal abrir
  useEffect(() => {
    if (user && show) {
      setUserName(user.name || "");
      setLastName(user.lastName || "");
      setUserEmail(user.email || "");
      setUserRole(user.role || "");
      setPreviewUrl(user.photoUrl || null);
      setUserPhotoFile(null);
    }
  }, [user, show]);

  // 🔹 Reseta tudo ao fechar
  const resetFields = () => {
    setUserName("");
    setLastName("");
    setUserEmail("");
    setUserRole("");
    setPreviewUrl(null);
    setUserPhotoFile(null);

    const fileInput = document.getElementById("editFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUserPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // preview local
  };

  const handleUpdate = async () => {
    setLoading(true);

    let photoUrlFinal = previewUrl;

    try {
      // 🔹 Se uma nova foto foi anexada → fazer upload no Cloudinary
      if (userPhotoFile) {
        // Excluir foto antiga do Cloudinary
        const isDeleted = await deleteFromCloudinary(user.photoUrl);
        console.log(isDeleted);

        // Fazer upload da nova foto
        photoUrlFinal = await uploadToCloudinary(userPhotoFile);
        console.log("Uploaded to Cloudinary:", photoUrlFinal);
      }

      // 🔹 Enviar dados atualizados para o backend
      await api.put(`/api/Usuario/${user.id}`, {
        name: userName,
        lastName,
        role: userRole,
        email: userEmail,
        password: "",
        photoUrl: photoUrlFinal,
      });

      alert("Usuário atualizado com sucesso!");

      if (onUpdated) onUpdated();

      resetFields();
      onClose();
      window.location.reload();
    } catch (err) {
      alert("Erro ao atualizar usuário.");
      console.error(err);
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
        <Modal.Title style={{ color: "#04b1b7" }}>Editar Usuário</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Nome */}
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Form.Group>

        {/* Sobrenome */}
        <Form.Group className="mb-3">
          <Form.Label>Sobrenome</Form.Label>
          <Form.Control
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Group>

        {/* Email */}
        {loggedUser.role === 4 ? (
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </Form.Group>
        ) : null}

        {/* Role */}
        {loggedUser.role === 4 ? (
          <Form.Group className="mb-3">
            <Form.Label>Função (Role)</Form.Label>
            <Form.Select
              value={userRole}
              onChange={(e) => setUserRole(Number(e.target.value))}
            >
              <option value="">Selecione...</option>
              <option value={1}>Paciente</option>
              <option value={2}>AT</option>
              <option value={3}>Coordenador</option>
              <option value={4}>Administrador</option>
            </Form.Select>
          </Form.Group>
        ) : null}

        {/* Foto */}
        <Form.Group className="mb-3">
          <Form.Control
            type="file"
            id="editFileInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <Button
            style={{
              backgroundColor: "#04b1b7",
              borderColor: "#04b1b7",
              padding: "8px 18px",
              fontWeight: "500",
              color: "white",
              borderRadius: "25px",
            }}
            onClick={() => document.getElementById("editFileInput").click()}
          >
            Escolher Foto
          </Button>

          {previewUrl && (
            <div className="mt-3 text-center">
              <img
                src={previewUrl}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "10px",
                  border: "2px solid #04b1b7",
                  objectFit: "cover",
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
        >
          {loading ? <Spinner size="sm" /> : "Salvar Alterações"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUserModal;
