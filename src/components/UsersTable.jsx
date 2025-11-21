import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Spinner } from "react-bootstrap";
import ConfirmDialog from "./ConfirmDialog";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import api from "../services/api";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const handleDeleteClick = (id) => {
    setSelectedUser(id);
    setConfirmOpen(true);
  };

  const deleteUser = async () => {
    try {
      await api.delete(`/api/Usuario/${selectedUser}`);
      setConfirmOpen(false);
      fetchUsers(page);
    } catch (err) {
      alert("Erro ao excluir usuário.");
    }
  };

  // Buscar por usuários
  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/Usuario?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      const data = response.data;

      setUsers(data);

      setHasMore(data.length === pageSize);
      setPage(pageNumber);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      alert("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  return (
    <>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 style={{ color: "#04b1b7" }}>Lista de Usuários</h4>

          {/* 🔹 BOTÃO CRIAR USUÁRIO */}
          <Button
            // onClick={() => setShowCreateModal(true)}
            onClick={() => setShowCreateModal(true)}
            style={{
              fontWeight: "500",
              color: "#04b1b7",
              borderColor: "#04b1b7",
              borderRadius: "25px",
              padding: "6px 18px",
              background: "white",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#e9f9fa")}
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            Criar Usuário
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Usuário</th>
              <th>Email</th>
              <th>Função</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center"
                  style={{ color: "#888" }}
                >
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  {u.role === 1 && <td>Paciente</td>}
                  {u.role === 2 && <td>AT</td>}
                  {u.role === 3 && <td>Coordenador</td>}
                  {u.role === 4 && <td>Administrador</td>}
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      style={{ marginRight: "8px", fontWeight: "500" }}
                      onClick={() => {
                        setSelectedUser(u);
                        setShowEditModal(true);
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      style={{ fontWeight: "500" }}
                      onClick={() => handleDeleteClick(u.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Paginação */}
        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="light"
            disabled={page === 1 || loading}
            onClick={() => fetchUsers(page - 1)}
            style={{
              borderRadius: "25px",
              padding: "6px 20px",
              fontWeight: "500",
              color: "#04b1b7",
              border: "1px solid #ddd",
            }}
          >
            ← Anterior
          </Button>

          <Button
            variant="light"
            disabled={!hasMore || loading}
            onClick={() => fetchUsers(page + 1)}
            style={{
              borderRadius: "25px",
              padding: "6px 20px",
              fontWeight: "500",
              color: "#04b1b7",
              border: "1px solid #ddd",
            }}
          >
            Próxima →
          </Button>
        </div>
      </div>
      <ConfirmDialog
        show={confirmOpen}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir o usuário?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deleteUser}
      />
      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => fetchUsers(1)} // recarrega a lista após criar
      />
      <EditUserModal
        show={showEditModal}
        user={selectedUser}
        onClose={() => setShowEditModal(false)}
        onUpdated={() => fetchUsers(page)}
      />
    </>
  );
};

export default UsersTable;
