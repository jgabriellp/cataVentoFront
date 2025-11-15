import React, { useEffect, useState } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import api from "../services/api";

const GroupsTable = () => {
  const [groups, setGroups] = useState([]);
  const [participantsMap, setParticipantsMap] = useState({}); // ← novo estado
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [loading, setLoading] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  // 🔹 Busca usuários por grupo (apenas quantidade)
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

  // 🔹 Buscar grupos
  const fetchGroups = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/Group?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      const data = response.data;

      setGroups(data);

      // Chamar a quantidade de usuários por grupo
      data.forEach((g) => fetchParticipants(g.groupId));

      // Se vier menos que 5 itens, acabou a paginação
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
        <h4 style={{ marginBottom: "15px", color: "#04b1b7" }}>
          Lista de Grupos
        </h4>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Grupo</th>
              <th>Participantes</th>
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
                  <td>
                    {participantsMap[g.groupId] ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* 🔹 Paginação */}
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
      </div>
    </>
  );
};

export default GroupsTable;
