import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Spinner } from "react-bootstrap";
import ConfirmDialog from "./ConfirmDialog";
import EditGroupModal from "./EditGroupModal";
import CreateGroupModal from "./CreateGroupModal"; // ← ADICIONE ESTA IMPORTAÇÃO
import api from "../services/api";

const GroupsTable = () => {
  const [groups, setGroups] = useState([]);
  const [participantsMap, setParticipantsMap] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDeleteClick = (groupId) => {
    setSelectedGroup(groupId);
    setConfirmOpen(true);
  };

  const deleteGroup = async () => {
    try {
      await api.delete(`/api/Group/${selectedGroup}`);
      setConfirmOpen(false);
      fetchGroups(page);
    } catch (err) {
      alert("Erro ao excluir grupo.");
    }
  };

  // Busca usuários por grupo
  const fetchParticipants = async (groupId) => {
    try {
      const response = await api.get(`/api/Usuario/groupId/${groupId}`);
      const users = response.data;

      setParticipantsMap((prev) => ({
        ...prev,
        [groupId]: users.length,
      }));
    } catch (error) {
      console.error(`Erro ao buscar usuários do grupo ${groupId}`, error);
      setParticipantsMap((prev) => ({
        ...prev,
        [groupId]: 0,
      }));
    }
  };

  // Buscar grupos
  const fetchGroups = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/Group?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      const data = response.data;

      setGroups(data);

      data.forEach((g) => fetchParticipants(g.groupId));

      setHasMore(data.length === pageSize);
      setPage(pageNumber);
    } catch (err) {
      console.error("Erro ao buscar grupos:", err);
      alert("Não foi possível carregar os grupos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(1);
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
          <h4 style={{ color: "#04b1b7" }}>Lista de Grupos</h4>

          {/* 🔹 BOTÃO CRIAR GRUPO */}
          <Button
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
            Criar Grupo
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Grupo</th>
              <th>Participantes</th>
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
            ) : groups.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center"
                  style={{ color: "#888" }}
                >
                  Nenhum grupo encontrado.
                </td>
              </tr>
            ) : (
              groups.map((g) => (
                <tr key={g.groupId}>
                  <td>{g.groupId}</td>
                  <td>{g.groupName}</td>
                  <td>{participantsMap[g.groupId] ?? "—"}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      style={{ marginRight: "8px", fontWeight: "500" }}
                      onClick={() => {
                        setSelectedGroupData(g);
                        setEditOpen(true);
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      style={{ fontWeight: "500" }}
                      onClick={() => handleDeleteClick(g.groupId)}
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
            onClick={() => fetchGroups(page - 1)}
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
            onClick={() => fetchGroups(page + 1)}
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

        <ConfirmDialog
          show={confirmOpen}
          title="Excluir grupo"
          message={`Tem certeza que deseja excluir o grupo?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={deleteGroup}
        />

        <EditGroupModal
          show={editOpen}
          group={selectedGroupData}
          onClose={() => setEditOpen(false)}
          onUpdated={() => fetchGroups(page)}
        />

        {/* 🔹 MODAL PARA CRIAR GRUPO */}
        <CreateGroupModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => fetchGroups(page)}
        />
      </div>
    </>
  );
};

export default GroupsTable;
