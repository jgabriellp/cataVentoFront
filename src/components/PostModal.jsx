import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";

const PostModal = ({ show, handleClose, post, onSave, onDelete }) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(""); // imagem nova (preview local)
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Quando o usuário escolhe uma nova imagem:
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file)); // gera preview local
  };

  useEffect(() => {
    if (post) {
      setContent(post.content ?? "");
      setImageUrl(post.imageUrl ?? "");
    } else {
      setContent("");
      setImageUrl("");
    }
  }, [post, show]);

  // 🔹 Excluir imagem antiga no Cloudinary
  const deleteFromCloudinary = async (url) => {
    if (!url) return;
    try {
      const publicId = url.split("/").pop().split(".")[0];
      await fetch(`https://api.cloudinary.com/v1_1/dnxt4nqp3/delete_by_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      console.log("Imagem antiga excluída:", publicId);
    } catch (err) {
      console.warn("Falha ao excluir imagem antiga:", err);
    }
  };

  // 🔹 Upload da imagem (chamado apenas no salvar)
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload_sem_assinatura");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dnxt4nqp3/image/upload",
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let newImageUrl = imageUrl;

      // 🔹 Caso o usuário tenha removido a imagem atual
      if (!selectedFile && !imageUrl && post.imageUrl) {
        await deleteFromCloudinary(post.imageUrl);
        newImageUrl = "";
      }

      // 🔹 Caso o usuário tenha escolhido uma nova imagem
      if (selectedFile) {
        if (post.imageUrl) {
          await deleteFromCloudinary(post.imageUrl); // apaga antiga
        }
        newImageUrl = await uploadToCloudinary(selectedFile); // envia nova
      }

      // 🔹 Monta o objeto no formato que o endpoint espera
      const updated = {
        content,
        groupId: post.groupId,
        creatorId: post.creatorId,
        imageUrl: newImageUrl || "",
      };

      const res = await api.put(`/api/Post/${post.postId}`, updated);

      onSave(res.data);
      handleClose();
      window.location.reload();

    } catch (err) {
      console.error("Erro ao atualizar post:", err);
      alert("Erro ao atualizar o post.");
    } finally {
      setLoading(false);
    }
  };

  // Excluir post
  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este post?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/Post/${post.postId}`);
      onDelete(post.postId);
      handleClose();
    } catch (err) {
      console.error("Erro ao excluir post:", err);
      alert("Erro ao excluir o post.");
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="custom-modal-content"
    >
      <div
        style={{
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
      >
        <Modal.Header
          style={{
            borderBottom: "none",
            backgroundColor: "#04b1b7",
            color: "white",
          }}
        >
          <Modal.Title
            style={{
              fontWeight: "600",
              fontSize: "1.2rem",
            }}
          >
            ✏️ Editar ou Excluir Post
          </Modal.Title>
          <Button
            variant="light"
            size="sm"
            onClick={handleClose}
            style={{
              marginBottom: "auto",
              position: "absolute",
              right: "6px",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              padding: 0,
              lineHeight: 0,
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              color: "#04b1b7",
              fontWeight: "bold",
            }}
          >
            ✕
          </Button>
        </Modal.Header>

        <Modal.Body style={{ padding: "25px" }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 500, color: "#333" }}>
                Conteúdo
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  borderRadius: "12px",
                  resize: "none",
                  borderColor: "#ccc",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label style={{ fontWeight: 500, color: "#333" }}>
                Imagem
              </Form.Label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={uploading}
                  style={{
                    borderRadius: "12px",
                    padding: "8px",
                  }}
                />
                {uploading && <Spinner size="sm" animation="border" />}
              </div>

              {/* Prioriza preview local, se existir */}
              {(preview || imageUrl) && (
                <div
                  className="text-center mt-2"
                  style={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: "12px",
                    padding: "10px",
                  }}
                >
                  <img
                    src={preview || imageUrl}
                    alt="Pré-visualização"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "10px",
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "none",
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 25px 25px",
          }}
        >
          <Button
            variant="light"
            onClick={() => {
              setPreview("");
              setImageUrl("");
              document.querySelector('input[type="file"]').value = ""; // limpa input
            }}
            style={{
              borderRadius: "25px",
              padding: "6px 20px",
              fontWeight: "500",
              border: "1px solid #ddd",
            }}
          >
            Limpar foto
          </Button>

          <div>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
              style={{
                borderRadius: "25px",
                padding: "6px 20px",
                fontWeight: "500",
                marginRight: "10px",
              }}
            >
              {loading ? <Spinner size="sm" /> : "Excluir"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              style={{
                backgroundColor: "#04b1b7",
                border: "none",
                borderRadius: "25px",
                padding: "6px 25px",
                fontWeight: "600",
              }}
            >
              {loading ? <Spinner size="sm" /> : "Salvar"}
            </Button>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default PostModal;
