import React, { useState } from "react";
import { useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";

const CreateTask = ({ show, onClose, onCreated, task }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Apenas 1 responsável

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status?.toString() || "");
      setPriority(task.priority?.toString() || "");
      setSelectedUser(task.responsavel || null);
    } else {
      // Nova tarefa
      setTitle("");
      setDescription("");
      setStatus("");
      setPriority("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [task, show]);

  // 🔹 Busca usuário pelo nome
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const response = await api.get(
        `/api/Usuario/name/${encodeURIComponent(searchQuery)}`
      );

      // Se já tem usuário selecionado, não mostra resultados
      const filtered = selectedUser ? [] : response.data || [];
      setSearchResults(filtered);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 🔹 Seleciona usuário como responsável
  const addUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
  };

  // 🔹 Atualizar tarefa
  const handleUpdate = async () => {
    if (!title || !status || !priority || !selectedUser) {
      alert("Preencha todos os campos e selecione um responsável");
      return;
    }

    try {
      setLoading(true);

      const res = await api.put(`/api/Task/${task.id}`, {
        id: task.id,
        title,
        description,
        status: Number(status),
        priority: Number(priority),
        usuarioId: selectedUser.id,
      });

      onCreated(res.data); // devolve a task atualizada
      onClose();

      // reset
      setTitle("");
      setDescription("");
      setStatus("");
      setPriority("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao atualizar task", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Criar tarefa
  const handleCreate = async () => {
    if (!title || !status || !priority || !selectedUser) {
      alert("Preencha todos os campos e selecione um responsável");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/Task", {
        title,
        description,
        status: Number(status),
        priority: Number(priority),
        usuarioId: selectedUser.id,
      });

      onCreated(res.data); // devolve a task criada
      onClose();

      // reset
      setTitle("");
      setDescription("");
      setStatus("");
      setPriority("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao criar task", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#04b1b7" }}>
          {task ? "Editar Tarefa" : "Nova Tarefa"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da tarefa"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Coluna</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value={1}>To Do</option>
              <option value={2}>In Progress</option>
              <option value={3}>Review</option>
              <option value={4}>Completed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prioridade</Form.Label>
            <Form.Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value={1}>Baixa</option>
              <option value={2}>Média</option>
              <option value={3}>Alta</option>
            </Form.Select>
          </Form.Group>
        </Form>

        {/* Busca usuário */}
        <div className="d-flex mb-3">
          <Form.Control
            placeholder="Digite o nome do responsável pela tarefa"
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

        {/* Usuário selecionado */}
        {selectedUser && (
          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "8px 10px",
              background: "#f8f9fa",
            }}
          >
            <span>
              Responsável:{" "}
              <strong>
                {selectedUser.name} {selectedUser.lastName}
              </strong>
            </span>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setSelectedUser(null)}
            >
              Remover
            </Button>
          </div>
        )}

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
                  Selecionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>

        {task ? (
          <Button
            variant="primary"
            onClick={handleUpdate}
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
            {loading ? <Spinner size="sm" /> : "Atualizar tarefa"}
          </Button>
        ) : (
          <Button
            variant="primary"
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
            {loading ? <Spinner size="sm" /> : "Criar tarefa"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTask;
