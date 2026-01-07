import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import api from "../services/api";
import LoggedNavbar from "../components/LoggedNavbar.jsx";
import ProfileFeed from "../components/ProfileFeed.jsx";
import EditUserModal from "../components/EditUserModal.jsx";
import PasswordChangeModal from "../components/PasswordChangeModal.jsx";

const Profile = () => {
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const { id } = useParams(); // pega o id da URL

  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/Usuario/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <p>Carregando...</p>;

  return (
    <>
      <LoggedNavbar />
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #04b1b7 0%, #9ce9ec 100%)",
          paddingTop: "60px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <img
            src={user.photoUrl}
            alt="Foto"
            style={{
              width: "130px",
              height: "130px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "3px solid white",
              marginBottom: "15px",
              marginLeft: "auto",
              marginRight: "auto",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          />

          <h2 style={{ color: "white", fontWeight: 700 }}>
            {user.name} {user.lastName}
          </h2>

          <p style={{ color: "#f5f5f5", marginTop: "-4px" }}>{user.email}</p>

          <span
            style={{
              background: "rgba(255,255,255,0.3)",
              padding: "8px 18px",
              borderRadius: "20px",
              color: "white",
              fontWeight: "600",
              fontSize: "0.9rem",
              display: "inline-block",
              marginTop: "15px",
              marginRight: "10px",
            }}
          >
            {["", "Paciente", "AT", "Coordenador", "Administrador"][user.role]}
          </span>

          {Number(loggedUser.role) === 4 ||
          Number(user.id) === Number(loggedUser.id) ? (
            <Button
              style={{
                background: "rgba(255,255,255,0.3)",
                padding: "8px 18px",
                borderRadius: "20px",
                borderColor: "white",
                color: "white",
                fontWeight: "600",
                fontSize: "0.9rem",
                display: "inline-block",
                marginRight: "10px",
              }}
              onClick={() => {
                setSelectedUser(user);
                setShowProfileModal(true);
              }}
            >
              Editar
            </Button>
          ) : null}

          {Number(loggedUser.role) === 4 ||
          Number(user.id) === Number(loggedUser.id) ? (
            <Button
              style={{
                background: "rgba(255,255,255,0.3)",
                padding: "8px 18px",
                borderRadius: "20px",
                borderColor: "white",
                color: "white",
                fontWeight: "600",
                fontSize: "0.9rem",
                display: "inline-block",
              }}
              onClick={() => {
                setShowPasswordChangeModal(true);
              }}
            >
              Atualizar a senha
            </Button>
          ) : null}
        </div>

        <br />

        <ProfileFeed userId={id} userPhoto={user.photoUrl} />
      </section>
      <EditUserModal
        show={showProfileModal}
        user={user}
        onClose={() => setShowProfileModal(false)}
        onUpdated={() => window.location.reload()}
      />
      <PasswordChangeModal
        show={showPasswordChangeModal}
        user={loggedUser}
        onClose={() => setShowPasswordChangeModal(false)}
      />
    </>
  );
};

export default Profile;
