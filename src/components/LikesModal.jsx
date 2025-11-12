import { Modal, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import api from "../services/api";

const LikesModal = ({ show, onClose, post }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && post?.postId) {
      fetchLikes();
    }
  }, [show, post]);

  const fetchLikes = async () => {
    setLoading(true);
    try {
      // 🔹 Busca o post para pegar os IDs de quem curtiu
      const res = await api.get(`/api/Post/${post.postId}`);
      const likerIds = res.data.likersIds || [];

      // 🔹 Busca o nome e foto de cada usuário
      const detailedLikes = await Promise.all(
        likerIds.map(async (id) => {
          try {
            const userRes = await api.get(`/api/Usuario/${id}`);
            const user = userRes.data;
            return {
              userId: id,
              userName: `${user.name} ${user.lastName}`,
              photoUrl: user.photoUrl,
            };
          } catch {
            return {
              userId: id,
              userName: `Usuário #${id}`,
              photoUrl: "/default-profile.png",
            };
          }
        })
      );

      setLikes(detailedLikes);
    } catch (err) {
      console.error("Erro ao buscar curtidas:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Curtidas{" "}
          {!loading && likes.length > 0 && (
            <span style={{ color: "#04b1b7", fontSize: "1.0rem" }}>
              ({likes.length})
            </span>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : likes.length === 0 ? (
          <p style={{ color: "#888" }}>Nenhuma curtida ainda.</p>
        ) : (
          likes.map((l) => (
            <div
              key={l.userId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "6px",
              }}
            >
              <img
                src={l.photoUrl}
                alt={l.userName}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <strong style={{ color: "#04b1b7" }}>{l.userName}</strong>
            </div>
          ))
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LikesModal;
