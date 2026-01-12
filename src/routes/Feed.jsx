import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import LoggedNavbar from "../components/LoggedNavbar.jsx";
import PostModal from "../components/PostModal";
import CommentModal from "../components/CommentModal.jsx";
import LikesModal from "../components/LikesModal.jsx";
import NoticeModal from "../components/NoticeModal.jsx";
import { MoreVertical } from "lucide-react";
import { uploadToCloudinary } from "../services/uploadToCloudinary.js";
import api from "../services/api.js";

const Feed = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [novoPost, setNovoPost] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedCommentPost, setSelectedCommentPost] = useState(null);
  const [comments, setComments] = useState({});
  const [likesModalPost, setLikesModalPost] = useState(null); // post selecionado para exibir curtidas
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]); // guarda os posts curtidos pelo usuário
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [showButton, setShowButton] = useState(true);
  const [posting, setPosting] = useState(false);

  const textRef = useRef(null);

  const handleInput = () => {
    const el = textRef.current;
    el.style.height = "auto"; // reseta altura
    el.style.height = el.scrollHeight + "px"; // ajusta para o conteúdo
  };

  useEffect(() => {
    if (!novoPost && textRef.current) {
      textRef.current.style.height = "60px"; // sua altura mínima
    }
  }, [novoPost]);

  useEffect(() => {
    if (posts.length > 0) {
      const liked = posts
        .filter((p) => p.likersIds?.includes(user.id))
        .map((p) => p.postId);
      setLikedPosts(liked);
    }
  }, [posts, user.id]);

  useEffect(() => {
    setPosts([]); // limpa os posts antigos
    setCurrentPage(1); // reseta paginação

    if (selectedGroup) {
      fetchPosts(1); // carrega a primeira página do novo grupo
    }
  }, [selectedGroup]);

  const handleLikePost = async (postId) => {
    try {
      const alreadyLiked = likedPosts.includes(postId);

      if (alreadyLiked) {
        // 🔹 Se já curtiu, descurte
        await api.post(`/api/PostLiker`, {
          postId,
          usuarioId: user.id,
        });
        setLikedPosts((prev) => prev.filter((id) => id !== postId));
      } else {
        // 🔹 Se não curtiu ainda, curte
        await api.post(`/api/PostLiker`, {
          postId,
          usuarioId: user.id,
        });
        setLikedPosts((prev) => [...prev, postId]);
      }
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
    }
  };

  // 🔹 Abrir modal de curtidas
  const handleOpenLikesModal = (post) => {
    setLikesModalPost(post);
    setShowLikesModal(true);
  };

  // 🔹 Fechar modal de curtidas
  const handleCloseLikesModal = () => {
    setLikesModalPost(null);
    setShowLikesModal(false);
  };

  const handleOpenComments = (post) => {
    setSelectedCommentPost(post);
    setShowCommentModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentModal(false);
    setSelectedCommentPost(null);
  };

  // quando adicionar um comentário novo
  const handleAddComment = (postId, newComment) => {
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
  };

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handleSavePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.postId === updatedPost.postId ? updatedPost : p))
    );
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.postId !== id));
  };

  /* =======================
     AVISOS (MODAL)
  ======================= */
  useEffect(() => {
    const fetchActiveNotices = async () => {
      try {
        const response = await api.get(
          `/api/Notice/active?pageNumber=1&pageSize=50`
        );

        const activeNotices = response.data || [];

        // filtra avisos pelo role do usuário
        const noticesByRole = activeNotices.filter((notice) =>
          notice.audiences?.some((aud) => aud.audienceRole === user.role)
        );

        if (noticesByRole.length > 0) {
          setFilteredNotices(noticesByRole);
          setNoticeModalOpen(true);
        }
      } catch (err) {
        console.error("Erro ao buscar avisos:", err);
      }
    };

    fetchActiveNotices();
  }, [user.role]);

  // Buscar posts do grupo selecionado
  const fetchPosts = async (page = 1) => {
    if (!selectedGroup) return;
    try {
      const response = await api.get(
        `/api/Post/group/${selectedGroup}?pageNumber=${page}&pageSize=${pageSize}`
      );

      const postsData = response.data;

      if (postsData.length === 0) {
        setShowButton(false);
        return; // evita concatenar nada
      } else {
        setShowButton(true); // ainda há posts, mantém o botão
      }

      const enrichedPosts = await Promise.all(
        postsData.map(async (post) => {
          try {
            // const [groupRes, creatorRes] = await Promise.all([
            //   api.get(`/api/Group/${post.groupId}`),
            //   api.get(`/api/Usuario/${post.creatorId}`),
            // ]);

            const groupRes = await api.get(`/api/Group/${post.groupId}`);
            const creatorRes = await api
              .get(`/api/Usuario/${post.creatorId}`)
              .catch((err) => {
                if (err.response?.status === 404)
                  return { data: "Usuário desconhecido" };
                throw err; // Se for outro erro (ex: 500), aí sim ele deve subir
              });

            return {
              postId: post.postId,
              content: post.content,
              date: new Date(post.date).toLocaleDateString("pt-BR"),
              groupName: groupRes.data.groupName,
              authorName: creatorRes.data.name || "Usuário desconhecido",
              authorPhotoUrl: creatorRes.data.photoUrl,
              imageUrl: post.imageUrl,
              creatorId: post.creatorId,
              groupId: post.groupId,
              likersIds: post.likersIds || [],
            };
          } catch (innerErr) {
            console.error("Erro ao buscar detalhes do post:", innerErr);
            return {
              postId: post.postId,
              content: post.content,
              date: new Date(post.date).toLocaleDateString("pt-BR"),
              groupName: "Grupo desconhecido",
              authorName: "Usuário desconhecido",
              imageUrl: post.imageUrl,
            };
          }
        })
      );

      // 🔹 Se for a primeira página, substitui; senão, adiciona
      if (page === 1) {
        setPosts(enrichedPosts);
      } else {
        setPosts((prev) => [...prev, ...enrichedPosts]);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedGroup]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setSelectedImage(preview);
    setImageUrl(""); // limpa URL de imagem anterior
    setUploadingImage(false);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get(`/api/Group/users/${user.id}/groups`);
        setGroups(response.data);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const handlePostar = async (e) => {
    e.preventDefault();
    if (!novoPost.trim() || !selectedGroup) return;

    try {
      setPosting(true); // 🔒 trava a tela
      setUploadingImage(true);

      let uploadedUrl = "";
      const fileInput = document.getElementById("fileInput");

      if (fileInput?.files?.length > 0) {
        uploadedUrl = await uploadToCloudinary(fileInput.files[0]);
      }

      const novoPostData = {
        content: novoPost,
        groupId: Number(selectedGroup),
        creatorId: user.id,
        imageUrl: uploadedUrl,
      };

      const response = await api.post("/api/Post", novoPostData);
      console.log("✅ Post criado com sucesso:", response.data);

      // Limpa campos
      setNovoPost("");
      setSelectedImage(null);
      setImageUrl("");
      fileInput.value = "";

      await fetchPosts(); // Atualiza o feed
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Ocorreu um erro ao publicar o post. Tente novamente.");
    } finally {
      setUploadingImage(false);
      setPosting(false); // 🔓 libera a tela quando o feed já foi atualizado
    }
  };

  return (
    <>
      <LoggedNavbar />

      {/* 🔔 MODAL DE AVISOS */}
      <NoticeModal
        show={noticeModalOpen}
        notices={filteredNotices}
        onFinish={() => setNoticeModalOpen(false)}
      />

      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #04b1b7 0%, #9ce9ec 100%)",
          paddingTop: "60px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <h2
                className="text-center mb-4"
                style={{ color: "white", fontWeight: "600" }}
              >
                Relatos
              </h2>

              {/* Seleção de grupo */}
              <Card
                className="mb-4"
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body>
                  <Form.Group controlId="groupSelect">
                    <Form.Label
                      style={{
                        fontWeight: "500",
                        color: "#04b1b7",
                      }}
                    >
                      Selecione um grupo:
                    </Form.Label>

                    {loadingGroups ? (
                      <div className="text-center py-2">
                        <Spinner animation="border" size="sm" /> Carregando...
                      </div>
                    ) : (
                      <Form.Select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        style={{
                          borderRadius: "15px",
                          borderColor: "#04b1b7",
                          marginBottom: "10px",
                        }}
                      >
                        <option value="">-- Escolha um grupo --</option>
                        {groups.map((group) => (
                          <option key={group.groupId} value={group.groupId}>
                            {group.groupName}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Card de criação de post */}
              <Card
                className="mb-4"
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body>
                  <Form onSubmit={handlePostar}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={
                          selectedGroup
                            ? "Compartilhe uma atualização..."
                            : "Selecione um grupo antes de postar"
                        }
                        value={novoPost}
                        onChange={(e) => {
                          setNovoPost(e.target.value);
                          handleInput();
                        }}
                        // disabled={!selectedGroup}
                        disabled={!selectedGroup || posting}
                        ref={textRef}
                        style={{
                          borderRadius: "15px",
                          resize: "none",
                          overflow: "hidden", // impede scroll interno
                          minHeight: "60px", // altura mínima bonita
                          lineHeight: "1.5",
                        }}
                      />
                    </Form.Group>

                    {/* Botão de anexo */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <label
                        htmlFor="fileInput"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          color: "#04b1b7",
                          fontWeight: "500",
                        }}
                      >
                        <i
                          className="bi bi-paperclip"
                          style={{ marginRight: "6px" }}
                        ></i>
                        Anexar imagem
                      </label>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        style={{ display: "none", marginTop: "5px" }}
                        onChange={handleImageSelect}
                        disabled={!selectedGroup || posting}
                      />

                      <Button
                        type="submit"
                        disabled={!selectedGroup || posting}
                        style={{
                          backgroundColor: "#04b1b7",
                          border: "none",
                          borderRadius: "25px",
                          padding: "8px 20px",
                          fontWeight: "600",
                          marginTop: "5px",
                          opacity: posting ? 0.6 : 1,
                        }}
                      >
                        {posting ? (
                          <>
                            <Spinner
                              size="sm"
                              animation="border"
                              className="me-2"
                            />
                            Publicando...
                          </>
                        ) : (
                          "Publicar"
                        )}
                      </Button>
                    </div>

                    {/* Preview da imagem selecionada */}
                    {selectedImage && (
                      <div
                        style={{ textAlign: "center", marginBottom: "10px" }}
                      >
                        <img
                          src={selectedImage}
                          alt="Prévia"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: "10px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                  </Form>
                </Card.Body>
              </Card>

              {/* Lista de posts */}
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <img
                        src={post.authorPhotoUrl || "/default-profile.png"}
                        alt="Logo"
                        style={{
                          width: "45px",
                          height: "45px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginRight: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      />
                      <strong
                        style={{
                          marginRight: "auto",
                          marginTop: "auto",
                          marginBottom: "auto",
                        }}
                      >
                        {post.authorName}
                      </strong>
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
                      {post.creatorId === user.id && (
                        <MoreVertical
                          size={20}
                          style={{
                            cursor: "pointer",
                            color: "#666",
                            marginTop: "auto",
                            marginBottom: "auto",
                            textAlign: "right",
                            marginRight: 0,
                          }}
                          onClick={() => handleOpenModal(post)}
                        />
                      )}
                    </div>
                    {post.groupName && (
                      <p style={{ color: "#04b1b7", fontSize: "0.9rem" }}>
                        {post.groupName}
                      </p>
                    )}
                    <p
                      style={{
                        marginBottom: "5px",
                        whiteSpace: "pre-wrap", // 👈 MANTÉM \n
                        wordBreak: "break-word", // evita quebrar layout
                      }}
                    >
                      {post.content}
                    </p>
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
                    {/* Botões de interação */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                        onClick={() => handleLikePost(post.postId)}
                      >
                        <i
                          className={
                            likedPosts.includes(post.postId)
                              ? "bi bi-heart-fill"
                              : "bi bi-heart"
                          }
                        ></i>
                        {likedPosts.includes(post.postId)
                          ? "Descurtir"
                          : "Curtir"}
                      </Button>

                      <Button
                        variant="link"
                        style={{
                          color: "#04b1b7",
                          fontWeight: "500",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
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
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                        onClick={() => handleOpenComments(post)}
                      >
                        <i className="bi bi-chat"></i> Comentar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* 🔹 Botão "Carregar mais" */}
              {selectedGroup && showButton && (
                <div className="text-center mt-3">
                  <Button
                    variant="light"
                    style={{
                      color: "#04b1b7",
                      borderRadius: "25px",
                      padding: "6px 18px",
                      fontWeight: "600",
                    }}
                    onClick={() => fetchPosts(currentPage + 1)}
                  >
                    Carregar mais
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Container>
        {posting && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.4)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(3px)",
            }}
          >
            <div className="text-center text-white">
              <Spinner animation="border" />
              <p style={{ marginTop: "10px", fontWeight: "500" }}>
                Publicando...
              </p>
            </div>
          </div>
        )}
      </section>
      <PostModal
        show={showModal}
        handleClose={handleCloseModal}
        post={selectedPost}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
      />
      <CommentModal
        show={showCommentModal}
        onClose={handleCloseComments}
        post={selectedCommentPost}
        comments={comments}
        onAddComment={handleAddComment}
        user={user}
      />
      <LikesModal
        show={showLikesModal}
        onClose={handleCloseLikesModal}
        post={likesModalPost}
      />
    </>
  );
};

export default Feed;
