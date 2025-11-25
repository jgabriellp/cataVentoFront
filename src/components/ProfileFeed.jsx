import React, { useState, useEffect } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import CommentModal from "../components/CommentModal.jsx";
import LikesModal from "../components/LikesModal.jsx";
import api from "../services/api.js";
import { MoreVertical } from "lucide-react";
import PostModal from "./PostModal.jsx";
import EditUserModal from "./EditUserModal.jsx";

const ProfileFeed = ({ userId, userPhoto }) => {
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesModalPost, setLikesModalPost] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // paginação
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [showButton, setShowButton] = useState(true);

  // -------------------------------------------------------------------
  // 🔹 Carregar posts com paginação (igual feed)
  // -------------------------------------------------------------------
  const fetchUserPosts = async (pageNumber) => {
    try {
      const response = await api.get(
        `/api/Post/user/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      const postsData = response.data;

      if (postsData.length === 0) {
        setShowButton(false);
        return;
      } else {
        setShowButton(true);
      }

      const enrichedPosts = await Promise.all(
        postsData.map(async (post) => {
          try {
            const [groupRes, creatorRes] = await Promise.all([
              api.get(`/api/Group/${post.groupId}`),
              api.get(`/api/Usuario/${post.creatorId}`),
            ]);

            return {
              postId: post.postId,
              content: post.content,
              date: new Date(post.date).toLocaleDateString("pt-BR"),
              groupName: groupRes.data.groupName,
              authorName: creatorRes.data.name || "Usuário desconhecido",
              imageUrl: post.imageUrl,
              creatorId: post.creatorId,
              groupId: post.groupId,
              likersIds: post.likersIds || [],
            };
          } catch (err) {
            console.error("Erro enriquecendo post:", err);
            return {
              postId: post.postId,
              content: post.content,
              date: new Date(post.date).toLocaleDateString("pt-BR"),
              groupName: "Grupo desconhecido",
              authorName: "Usuário desconhecido",
              imageUrl: post.imageUrl,
              creatorId: post.creatorId,
              groupId: post.groupId,
              likersIds: post.likersIds || [],
            };
          }
        })
      );

      if (pageNumber === 1) {
        setPosts(enrichedPosts);
      } else {
        setPosts((prev) => [...prev, ...enrichedPosts]);
      }

      setPage(pageNumber);
    } catch (err) {
      console.error("Erro carregando posts:", err);
    }
  };

  useEffect(() => {
    fetchUserPosts(1); // primeira página
  }, [userId]);

  // -------------------------------------------------------------------
  // 🔹 Carregar mais posts
  // -------------------------------------------------------------------
  const loadMore = () => {
    fetchUserPosts(page + 1);
  };

  // -------------------------------------------------------------------
  // 🔹 Curtir / Descurtir
  // -------------------------------------------------------------------
  const handleLikePost = async (postId) => {
    try {
      const alreadyLiked = likedPosts.includes(postId);

      await api.post(`/api/PostLiker`, {
        postId,
        usuarioId: loggedUser.id,
      });

      setLikedPosts((prev) =>
        alreadyLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
      );
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
    }
  };

  // -------------------------------------------------------------------
  // 🔹 Comentários
  // -------------------------------------------------------------------
  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleAddComment = (postId, newComment) => {
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
  };

  // -------------------------------------------------------------------
  // 🔹 Curtidas (modal)
  // -------------------------------------------------------------------
  const handleOpenLikesModal = (post) => {
    setLikesModalPost(post);
    setShowLikesModal(true);
  };

  // -------------------------------------------------------------------
  // 🔹 Editar Post
  // -------------------------------------------------------------------
  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleSavePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.postId === updatedPost.postId ? updatedPost : p))
    );
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.postId !== id));
  };

  // -------------------------------------------------------------------
  // 🔹 UI
  // -------------------------------------------------------------------

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h3
            className="text-center mb-4"
            style={{ color: "white", fontWeight: "600" }}
          >
            Publicações
          </h3>

          {posts.map((post) => (
            <Card
              key={post.postId}
              className="mb-4"
              style={{
                borderRadius: "15px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              <Card.Body>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <img
                    src={userPhoto || "/default-profile.png"}
                    alt="Foto"
                    style={{
                      width: "45px",
                      height: "45px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginRight: "12px",
                    }}
                  />

                  <div style={{ marginRight: "auto" }}>
                    <strong>{post.authorName}</strong>
                    <div style={{ fontSize: "0.85rem", color: "#888" }}>
                      {post.groupName}
                    </div>
                  </div>

                  <span
                    style={{
                      color: "#888",
                      fontSize: "0.9rem",
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                  >
                    {post.date}
                  </span>

                  <MoreVertical
                    size={20}
                    style={{
                      cursor: "pointer",
                      color: "#666",
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                    onClick={() => handleOpenModal(post)}
                  />
                </div>

                {/* Conteúdo */}
                <p>{post.content}</p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Imagem do post"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      objectFit: "cover",
                    }}
                  />
                )}

                {/* Ações */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #eee",
                    paddingTop: "8px",
                  }}
                >
                  <Button
                    variant="link"
                    style={{
                      color: likedPosts.includes(post.postId)
                        ? "#e63946"
                        : "#04b1b7",
                      fontWeight: "500",
                      textDecoration: "none",
                    }}
                    onClick={() => handleLikePost(post.postId)}
                  >
                    <i
                      className={
                        likedPosts.includes(post.postId)
                          ? "bi bi-heart-fill"
                          : "bi bi-heart"
                      }
                    ></i>{" "}
                    {likedPosts.includes(post.postId) ? "Descurtir" : "Curtir"}
                  </Button>

                  <Button
                    variant="link"
                    style={{
                      color: "#04b1b7",
                      fontWeight: "500",
                      textDecoration: "none",
                    }}
                    onClick={() => handleOpenLikesModal(post)}
                  >
                    <i className="bi bi-people"></i> Ver curtidas
                  </Button>

                  <Button
                    variant="link"
                    style={{
                      color: "#04b1b7",
                      fontWeight: "500",
                      textDecoration: "none",
                    }}
                    onClick={() => handleOpenComments(post)}
                  >
                    <i className="bi bi-chat"></i> Comentar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Botão Carregar mais */}
          {showButton && posts.length > 0 && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                style={{
                  background: "white",
                  color: "#04b1b7",
                  fontWeight: "600",
                  border: "none",
                  padding: "10px 30px",
                  borderRadius: "25px",
                  marginBottom: "25px",
                }}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Modals */}
      <PostModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        post={selectedPost}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
      />

      <CommentModal
        show={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        post={selectedPost}
        comments={comments}
        onAddComment={handleAddComment}
        user={loggedUser}
      />

      <LikesModal
        show={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        post={likesModalPost}
      />
    </Container>
  );
};

export default ProfileFeed;
