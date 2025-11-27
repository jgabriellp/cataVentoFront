import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";
import { uploadToCloudinary } from "../services/uploadToCloudinary";
import { deleteFromCloudinary } from "../services/deleteFromCloudinary";

const CreateUserModal = ({ show, onClose, onCreated }) => {
  const [userName, setUserName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPhotoUrl, setUserPhotoUrl] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setUserName("");
    setLastName("");
    setUserEmail("");
    setUserPhotoUrl("");
    setUserRole("");
    setUserPhotoFile(null);
    setPreviewUrl(null);

    // resetar input de arquivo manualmente
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUserPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // preview local
  };

  const handleCreate = async () => {
    setLoading(true);

    let photoUrlFinal = null;

    try {
      // 1. Upload da foto (se existir)
      if (userPhotoFile) {
        photoUrlFinal = await uploadToCloudinary(userPhotoFile);
        console.log("Uploaded to Cloudinary:", photoUrlFinal);
      }

      // 2. Criar o usuário
      const res = await api.post("/api/Usuario", {
        name: userName,
        lastName: lastName,
        role: userRole,
        email: userEmail,
        password: userPassword,
        photoUrl: photoUrlFinal,
      });

      // ❗ Se der erro, forçar o catch
      if (res.status !== 201) {
        throw new Error("Failed to create user");
      }

      // 3. Sucesso
      alert("Usuário criado com sucesso!");
      resetFields();
      onClose();
      window.location.reload(false);
    } catch (err) {
      console.error(err);

      alert("Erro ao criar usuário.");

      // 🧹 4. Se falhou DEPOIS de upload → deletar imagem
      if (photoUrlFinal) {
        try {
          await deleteFromCloudinary(photoUrlFinal);
          console.log("Imagem deletada do Cloudinary.");
        } catch (deleteErr) {
          console.error("Erro ao deletar imagem:", deleteErr);
        }
      }
    }

    setLoading(false);
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        resetFields();
        onClose();
      }}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#04b1b7" }}>
          Criar Novo Usuário
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Nome */}
        <Form.Group className="mb-3">
          <Form.Label>Nome do Usuário</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ex: João Silva"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Form.Group>

        {/* Last Nome */}
        <Form.Group className="mb-3">
          <Form.Label>Sobrenome do Usuário</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ex: João Silva"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input"
          />
        </Form.Group>

        {/* Email */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="exemplo@email.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </Form.Group>

        {/* Password */}
        <Form.Group className="mb-3">
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />
        </Form.Group>

        {/* Role */}
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
      </Modal.Body>

      {/* Foto URL */}
      <Form.Group className="mb-3">
        {/* input escondido */}
        <Form.Control
          type="file"
          accept="image/*"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => handleFileSelect(e)}
        />

        {/* Botão para escolher arquivo */}
        <Button
          style={{
            backgroundColor: "#04b1b7",
            borderColor: "#04b1b7",
            borderRadius: "25px",
            padding: "8px 18px",
            fontWeight: "500",
            color: "white",
            marginBottom: "10px",
            marginLeft: "15px",
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          Escolher Foto
        </Button>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-2 text-center">
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "2px solid #04b1b7",
              }}
            />
          </div>
        )}
      </Form.Group>

      <Modal.Footer>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => {
            resetFields();
            onClose();
          }}
        >
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
          {loading ? <Spinner size="sm" /> : "Criar Usuário"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUserModal;
