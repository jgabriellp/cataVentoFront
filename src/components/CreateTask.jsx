import React, { useState } from "react";
import { useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../services/api";

const priorityConfig = {
  1: { label: "Baixa", color: "#22c55e", light: "#dcfce7", dark: "#166534" },
  2: { label: "Média", color: "#f59e0b", light: "#fef3c7", dark: "#92400e" },
  3: { label: "Alta", color: "#ef4444", light: "#fee2e2", dark: "#991b1b" },
};

const statusConfig = {
  1: { label: "To Do",      bg: "#475569", text: "#fff" },
  2: { label: "In Progress", bg: "#0d9488", text: "#fff" },
  3: { label: "Review",     bg: "#d97706", text: "#fff" },
  4: { label: "Done",       bg: "#e8dfa0", text: "#3f3f46" },
};

const CreateTask = ({ show, onClose, onCreated, task, boardType }) => {
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
        boardType,
      });

      onCreated({ ...res.data, responsavel: selectedUser }); // devolve a task atualizada
      onClose();

      // reset
      setTitle("");
      setDescription("");
      setStatus("");
      setPriority("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
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
        boardType,
      });

      onCreated({ ...res.data, responsavel: selectedUser }); // devolve a task criada
      onClose();

      // reset
      setTitle("");
      setDescription("");
      setStatus("");
      setPriority("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Erro ao criar task", err);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = priority
    ? priorityConfig[Number(priority)]?.color
    : "#04b1b7";

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      {/* Faixa colorida no topo — muda com a prioridade selecionada */}
      <div
        style={{
          height: "5px",
          background: accentColor,
          borderRadius: "0.375rem 0.375rem 0 0",
          transition: "background 0.2s",
        }}
      />

      <Modal.Header
        closeButton
        style={{ borderBottom: "1px solid #f0f0f0", padding: "12px 20px" }}
      >
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {task ? "Editar tarefa" : "Nova tarefa"}
        </span>
      </Modal.Header>

      <Modal.Body style={{ padding: "16px 20px 8px" }}>

        {/* Título estilo card */}
        <Form.Control
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da tarefa..."
          style={{
            border: "none",
            borderBottom: "2px solid transparent",
            borderRadius: 0,
            fontSize: "18px",
            fontWeight: 700,
            padding: "4px 0",
            marginBottom: "10px",
            boxShadow: "none",
            color: "#111827",
          }}
          onFocus={(e) => (e.target.style.borderBottomColor = accentColor)}
          onBlur={(e) => (e.target.style.borderBottomColor = "transparent")}
        />

        {/* Descrição */}
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione uma descrição..."
          style={{
            border: "none",
            borderBottom: "1px solid #e5e7eb",
            borderRadius: 0,
            fontSize: "14px",
            color: "#6b7280",
            padding: "4px 0",
            marginBottom: "20px",
            boxShadow: "none",
            resize: "none",
          }}
        />

        {/* Prioridade */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
            Prioridade
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.entries(priorityConfig).map(([val, cfg]) => {
              const selected = priority === val || priority === Number(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPriority(val)}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "99px",
                    border: `1.5px solid ${cfg.color}`,
                    background: selected ? cfg.color : "transparent",
                    color: selected ? "#fff" : cfg.dark,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
            Coluna
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {Object.entries(statusConfig).map(([val, cfg]) => {
              const selected = status === val || status === Number(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStatus(val)}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "99px",
                    border: `1.5px solid ${cfg.bg}`,
                    background: selected ? cfg.bg : "transparent",
                    color: selected ? cfg.text : "#6b7280",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsável */}
        <div style={{ marginBottom: "8px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
            Responsável
          </p>

          {selectedUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%",
                background: accentColor, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700, flexShrink: 0,
              }}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827", flex: 1 }}>
                {selectedUser.name} {selectedUser.lastName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "0 2px" }}
              >
                ×
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <Form.Control
                placeholder="Buscar responsável..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: "14px", borderRadius: "8px" }}
              />
              <Button
                variant="outline-secondary"
                onClick={handleSearch}
                disabled={searchLoading}
                style={{ borderRadius: "8px", fontSize: "13px", whiteSpace: "nowrap" }}
              >
                {searchLoading ? <Spinner size="sm" /> : "Buscar"}
              </Button>
            </div>
          )}

          {searchResults.length > 0 && (
            <div style={{
              border: "1px solid #e5e7eb", borderRadius: "8px",
              maxHeight: "180px", overflowY: "auto", marginTop: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => addUser(user)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 12px", cursor: "pointer",
                    borderBottom: "1px solid #f3f4f6",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#e5e7eb", color: "#374151",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, flexShrink: 0,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "13px", color: "#374151" }}>
                    {user.name} {user.lastName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </Modal.Body>

      <Modal.Footer style={{ borderTop: "1px solid #f0f0f0", padding: "12px 20px" }}>
        <Button
          variant="link"
          onClick={onClose}
          style={{ color: "#6b7280", textDecoration: "none", fontWeight: 500 }}
        >
          Cancelar
        </Button>

        <Button
          onClick={task ? handleUpdate : handleCreate}
          disabled={loading}
          style={{
            background: accentColor,
            borderColor: accentColor,
            color: "#fff",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "6px 22px",
            transition: "filter 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          {loading ? <Spinner size="sm" /> : task ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTask;
