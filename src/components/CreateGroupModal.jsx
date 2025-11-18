import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";

const CreateGroupModal = ({ show, onClose, onCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Buscar usuários pelo nome (somente quando clicar em Pesquisar)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const response = await api.get(
        `/api/Usuario/name/${encodeURIComponent(searchQuery)}`
      );

      const filtered = (response.data || []).filter(
        (u) => !selectedUsers.some((sel) => sel.id === u.id)
      );

      setSearchResults(filtered);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Adicionar usuário ao grupo
  const addUser = (user) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Remover usuário do grupo
  const removeUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Criar grupo
  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert("Digite um nome para o grupo.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/Group", {
        groupName,
        usuariosIds: selectedUsers.map((u) => u.id),
      });

      onCreated();
      onClose();

      // limpar estado ao fechar
      setGroupName("");
      setSelectedUsers([]);
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Erro ao criar grupo", err);
      alert("Erro ao criar grupo.");
    } finally {
      setLoading(false);
    }
  };

  // Ao fechar, limpa tudo
  const handleModalClose = () => {
    setGroupName("");
    setSelectedUsers([]);
    setSearchResults([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Criar Novo Grupo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Nome do grupo */}
        <Form.Group className="mb-3">
          <Form.Label>Nome do Grupo</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ex: Nome da Equipe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Form.Group>

        {/* Usuários selecionados */}
        <h5 className="mt-4 mb-2">Usuários adicionados ao grupo</h5>

        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          {selectedUsers.length === 0 && <p>Nenhum usuário adicionado.</p>}

          {selectedUsers.map((user) => (
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
                onClick={() => removeUser(user.id)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>

        <hr />

        {/* Busca de usuários */}
        <h5 className="mt-3">Adicionar usuários</h5>

        <div className="d-flex mb-3">
          <Form.Control
            placeholder="Digite o nome para pesquisar"
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
                  onClick={() => addUser(user)}
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleModalClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleCreate}
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
          {loading ? <Spinner size="sm" /> : "Criar Grupo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGroupModal;
