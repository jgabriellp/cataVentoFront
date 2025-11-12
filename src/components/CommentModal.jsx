import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import api from "../services/api";

const CommentModal = ({ show, onClose, post, user }) => {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Buscar comentários quando o modal abrir
  useEffect(() => {
    if (show && post?.postId) {
      fetchComments();
    }
  }, [show, post]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/Comment/postId/${post.postId}`);
      const commentsData = res.data;
      setComments(commentsData);

      // 🔹 Buscar nomes dos autores
      const uniqueIds = [...new Set(commentsData.map((c) => c.creatorId))];
      const nameMap = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const userRes = await api.get(`/api/Usuario/${id}`);
            nameMap[id] = userRes.data.name || `Usuário ${id}`;
          } catch {
            nameMap[id] = `Usuário ${id}`;
          }
        })
      );

      setUserNames(nameMap);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Enviar novo comentário
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const newCommentObj = {
        content: newComment,
        postId: post.postId,
        creatorId: user.id,
      };

      const res = await api.post(`/api/Comment`, newCommentObj);

      // Atualiza lista local e inclui o nome do autor logado
      setComments((prev) => [res.data, ...prev]);
      setUserNames((prev) => ({
        ...prev,
        [user.id]: user.name || "Você",
      }));
      setNewComment("");
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      style={{ borderRadius: "15px" }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Comentários{" "}
          {!loading && comments.length > 0 && (
            <span style={{ color: "#04b1b7", fontSize: "1.0rem" }}>
              ({comments.length})
            </span>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : comments.length === 0 ? (
          <p style={{ color: "#888" }}>Nenhum comentário ainda.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.commentId}
              style={{
                marginBottom: "12px",
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            >
              <strong style={{ color: "#04b1b7" }}>
                {userNames[c.creatorId] || `Usuário ${c.creatorId}`}
              </strong>
              <p style={{ marginBottom: 0 }}>{c.content}</p>
              <small style={{ color: "#aaa" }}>
                {new Date(c.date).toLocaleString("pt-BR")}
              </small>
            </div>
          ))
        )}

        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{
            borderRadius: "10px",
            marginTop: "10px",
            marginBottom: "8px",
          }}
          disabled={submitting}
        />
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: "#04b1b7",
            border: "none",
            borderRadius: "10px",
            width: "100%",
          }}
        >
          {submitting ? "Enviando..." : "Enviar"}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default CommentModal;
