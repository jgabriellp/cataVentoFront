import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";

const EditGroupModal = ({ show, group, onClose, onUpdated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupUsers, setGroupUsers] = useState([]); // usuários do grupo (objetos)
  const [originalUsers, setOriginalUsers] = useState([]); // IDs originais ao abrir
  const [searchQuery, setSearchQuery] = useState(""); // texto digitado
  const [searchResults, setSearchResults] = useState([]); // usuários encontrados
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Carregar dados quando abrir
  useEffect(() => {
    if (show && group) {
      setGroupName(group.groupName);
      fetchGroupUsers(group.groupId);
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [show, group]);

  // Buscar usuários do grupo
  const fetchGroupUsers = async (groupId) => {
    try {
      const response = await api.get(`/api/Usuario/groupId/${groupId}`);
      setGroupUsers(response.data || []);

      // salvar IDs originais para comparar depois
      const ids = (response.data || []).map((u) => u.id);
      setOriginalUsers(ids);
    } catch (e) {
      console.error("Erro ao carregar usuários do grupo", e);
    }
  };

  // Buscar usuários por nome somente ao clicar no botão
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const response = await api.get(
        `/api/Usuario/name/${encodeURIComponent(searchQuery)}`
      );
      // opcional: remover da lista de resultados quem já está no grupo
      const filtered = (response.data || []).filter(
        (u) => !groupUsers.some((gu) => gu.id === u.id)
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error("Erro ao buscar usuários", e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Adicionar usuário ao grupo (visual)
  const addUserToList = (user) => {
    if (groupUsers.some((u) => u.id === user.id)) return;
    setGroupUsers((prev) => [...prev, user]);
    // remover da lista de resultados
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Remover usuário do grupo (visual)
  const removeUserFromList = (userId) => {
    setGroupUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Salvar alterações: atualiza nome, adiciona e remove usuários conforme diff
  const handleSave = async () => {
    setLoading(true);

    try {
      // 1) Atualizar nome do grupo (se necessário)
      await api.put(`/api/Group/${group.groupId}`, { groupName });

      // 2) Calcular IDs finais e diferenças
      const finalUserIds = groupUsers.map((u) => u.id);
      const toAdd = finalUserIds.filter((id) => !originalUsers.includes(id));
      const toRemove = originalUsers.filter((id) => !finalUserIds.includes(id));

      // 3) Chamar endpoints só quando necessário
      if (toAdd.length > 0) {
        // suposição: backend aceita array simples no body, ex: [1,2,3]
        await api.post(`/api/Group/${group.groupId}/add-users`, toAdd);
      }

      if (toRemove.length > 0) {
        // suposição: backend aceita array simples no body para remover
        await api.post(`/api/Group/${group.groupId}/remove-users`, toRemove);
      }

      onUpdated(); // atualiza tabela/parent
      onClose();
    } catch (err) {
      console.error("Erro ao salvar alterações do grupo", err);
      alert("Erro ao atualizar grupo. Veja o console para mais detalhes.");
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Grupo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Nome do grupo */}
        <Form.Group className="mb-3">
          <Form.Label>Nome do Grupo</Form.Label>
          <Form.Control
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Form.Group>

        {/* Usuários do grupo (com botão Remover) */}
        <h5 className="mt-4 mb-2">Usuários do grupo</h5>

        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          {groupUsers.length === 0 && <p>Nenhum usuário no grupo.</p>}

          {groupUsers.map((user) => (
            <div
              key={user.id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span>
                {user.name} {user.lastName}
              </span>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeUserFromList(user.id)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>

        <hr />

        {/* Busca por novos usuários */}
        <h5 className="mt-3">Adicionar usuários ao grupo</h5>

        <div className="d-flex mb-3">
          <Form.Control
            placeholder="Digite o nome"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={handleSearch}
            className="ms-2"
            disabled={searchLoading}
          >
            {searchLoading ? <Spinner size="sm" /> : "Pesquisar"}
          </Button>
        </div>

        {/* Resultados da busca */}
        {searchResults.length > 0 && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "10px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            <h6>Resultados:</h6>
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="d-flex justify-content-between align-items-center mb-2"
              >
                <span>
                  {user.name} {user.lastName}
                </span>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => addUserToList(user)}
                  disabled={groupUsers.some((u) => u.id === user.id)}
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={handleSave}
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
          {loading ? <Spinner size="sm" /> : "Salvar alterações"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditGroupModal;
