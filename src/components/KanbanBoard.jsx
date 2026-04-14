import React, { useEffect, useState } from "react";
import api from "../services/api";
import CreateTask from "./CreateTask";
import ConfirmDialog from "./ConfirmDialog";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// =====================================================
// 🔹 CONFIG POR STATUS E PRIORIDADE
// =====================================================
const columnConfig = {
  1: { color: "#475569", label: "To Do" },
  2: { color: "#0d9488", label: "In Progress" },
  3: { color: "#d97706", label: "Review" },
  4: { color: "#ca8a04", label: "Done" },
};

const priorityConfig = {
  1: { color: "#22c55e", label: "Baixa" },
  2: { color: "#f59e0b", label: "Média" },
  3: { color: "#ef4444", label: "Alta" },
};

// =====================================================
// 🔹 TASK CARD
// =====================================================
const TaskCard = ({ task, status, onClick, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const accentColor = columnConfig[status]?.color || "#6b7280";
  const priority = priorityConfig[task.priority];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "white",
    borderRadius: "8px",
    padding: "16px 18px",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    borderLeft: `4px solid ${accentColor}`,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>

      {/* Título + botão remover */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
        <span
          style={{ fontSize: "15px", fontWeight: 600, color: "#111827", lineHeight: "1.4", cursor: "pointer" }}
          onClick={() => onClick(task)}
        >
          {task.title}
        </span>
        <button
          onClick={() => onRemove(task)}
          style={{
            background: "none", border: "none", color: "#d1d5db",
            fontSize: "20px", lineHeight: 1, cursor: "pointer",
            padding: "0 2px", flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
        >
          ×
        </button>
      </div>

      {/* Rodapé do card: badge de prioridade + avatar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {priority ? (
          <span style={{
            fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "99px",
            background: priority.color + "18",
            color: priority.color,
            border: `1px solid ${priority.color}40`,
          }}>
            {priority.label}
          </span>
        ) : <span />}

        {task.responsavel && (
          <div
            title={`${task.responsavel.name} ${task.responsavel.lastName ?? ""}`}
            style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: accentColor, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, flexShrink: 0,
            }}
          >
            {task.responsavel.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// 🔹 COLUMN (DROPPABLE)
// =====================================================
const KanbanColumn = ({ status, title, tasks, onTaskClick, onRemove }) => {
  const { setNodeRef } = useDroppable({
    id: `column-${status}`,
  });

  const accentColor = columnConfig[Number(status)]?.color || "#6b7280";

  return (
    <div
      ref={setNodeRef}
      className="w-80 rounded-lg p-4 min-h-[200px]"
      style={{ background: "#f4f5f7" }}
    >
      {/* Cabeçalho da coluna */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: "15px", color: "#374151", letterSpacing: "0.02em" }}>
          {title}
        </span>
        <span style={{
          marginLeft: "auto", fontSize: "12px", fontWeight: 600,
          background: "#e5e7eb", color: "#6b7280",
          borderRadius: "99px", padding: "2px 10px",
        }}>
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            status={Number(status)}
            onClick={onTaskClick}
            onRemove={onRemove}
          />
        ))}
      </SortableContext>
    </div>
  );
};

// Função para iniciar remoção de tarefa
const handleRemoveClick = (task) => {
  setTaskToRemove(task);
  setShowConfirm(true);
};

// =====================================================
// 🔹 BOARD
// =====================================================
const KanbanBoard = ({ boardType }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToRemove, setTaskToRemove] = useState(null);

  // // Função para abrir o modal de exclusão de tarefa
  const handleRemoveClick = (task) => {
    setTaskToRemove(task);
    setShowConfirm(true);
  };

  // Função para confirmar remoção de tarefa
  const confirmRemoveTask = async () => {
    if (!taskToRemove) return;

    try {
      await api.delete(`/api/Task/${taskToRemove.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToRemove.id));
    } catch (err) {
      console.error("Erro ao remover task", err);
    } finally {
      setShowConfirm(false);
      setTaskToRemove(null);
    }
  };

  const columns = {
    1: "To Do",
    2: "In Progress",
    3: "Review",
    4: "Done",
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // ---------------------------------------------------
  // LOAD TASKS
  // ---------------------------------------------------
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const isAdmin = Number(user?.role) === 4;

      const res1 = await api.get("/api/Task?boardType=1");
      let allTasks = [...res1.data];

      if (isAdmin) {
        const res2 = await api.get("/api/Task?boardType=2");
        allTasks = [...allTasks, ...res2.data];
      }

      setTasks(allTasks);
    } catch (err) {
      console.error("Erro ao carregar tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------
  const tasksByStatus = (status) =>
    tasks
      .filter((t) => t.status === Number(status) && t.boardType === boardType)
      .sort((a, b) => a.position - b.position);

  const findTask = (id) => tasks.find((t) => t.id === id);
  const findStatusByTaskId = (id) => tasks.find((t) => t.id === id)?.status;

  // ---------------------------------------------------
  // SAVE REORDER (BACKEND)
  // ---------------------------------------------------
  const saveReorder = async (updatedTasks) => {
    try {
      await api.post(
        "/api/Task/reorder",
        updatedTasks.map((t) => ({
          id: t.id,
          status: t.status,
          position: t.position,
        })),
      );
    } catch (err) {
      console.error("Erro ao salvar reorder", err);
    }
  };

  // ---------------------------------------------------
  // DRAG START (OVERLAY)
  // ---------------------------------------------------
  const handleDragStart = ({ active }) => {
    const task = findTask(active.id);
    setActiveTask(task);
  };

  // ---------------------------------------------------
  // DRAG END
  // ---------------------------------------------------
  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const fromStatus = findStatusByTaskId(activeId);
    if (!fromStatus) return;

    // =========================================
    // 🔹 DROP EM COLUNA
    // =========================================
    if (String(overId).startsWith("column-")) {
      const toStatus = Number(overId.replace("column-", ""));
      if (fromStatus === toStatus) return;

      const fromTasks = tasksByStatus(fromStatus).filter(
        (t) => t.id !== activeId,
      );

      const toTasks = tasksByStatus(toStatus);

      const updatedTasks = tasks.map((t) => {
        if (t.id === activeId) {
          return {
            ...t,
            status: toStatus,
            position: toTasks.length + 1,
          };
        }

        if (t.status === fromStatus && t.id !== activeId) {
          const idx = fromTasks.findIndex((x) => x.id === t.id);
          return { ...t, position: idx + 1 };
        }

        return t;
      });

      setTasks(updatedTasks);
      await saveReorder(updatedTasks);
      return;
    }

    // =========================================
    // 🔹 DROP EM CARD (MESMA COLUNA)
    // =========================================
    const toStatus = findStatusByTaskId(overId);
    if (fromStatus !== toStatus) return;

    const columnTasks = tasksByStatus(fromStatus);
    const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
    const newIndex = columnTasks.findIndex((t) => t.id === overId);

    const reordered = arrayMove(columnTasks, oldIndex, newIndex);

    const updatedTasks = tasks.map((t) => {
      const idx = reordered.findIndex((r) => r.id === t.id);
      return idx !== -1 ? { ...t, position: idx + 1 } : t;
    });

    setTasks(updatedTasks);
    await saveReorder(updatedTasks);
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-6">
        <button
          onClick={() => {
            setSelectedTask(null);
            setShowCreate(true);
          }}
          className="font-medium bg-white text-[#04b1b7] border border-[#04b1b7] rounded-full px-4 py-1.5 hover:!bg-[#039aa0] hover:!border-[#039aa0] hover:text-white transition-colors"
        >
          Nova tarefa
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex justify-center gap-6 overflow-x-auto">
          {Object.entries(columns).map(([status, title]) => (
            <KanbanColumn
              key={status}
              status={status}
              title={title}
              tasks={tasksByStatus(status)}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setShowCreate(true);
              }}
              onRemove={handleRemoveClick}
            />
          ))}
        </div>

        {/* 🔹 OVERLAY (FLUIDEZ) */}
        <DragOverlay>
          {activeTask ? (
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "12px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                borderLeft: `4px solid ${columnConfig[activeTask.status]?.color || "#6b7280"}`,
                width: "280px",
                opacity: 0.95,
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
                {activeTask.title}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {priorityConfig[activeTask.priority] && (
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                    background: priorityConfig[activeTask.priority].color + "18",
                    color: priorityConfig[activeTask.priority].color,
                    border: `1px solid ${priorityConfig[activeTask.priority].color}40`,
                  }}>
                    {priorityConfig[activeTask.priority].label}
                  </span>
                )}
                {activeTask.responsavel && (
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: columnConfig[activeTask.status]?.color || "#6b7280",
                    color: "white", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "11px", fontWeight: 700,
                  }}>
                    {activeTask.responsavel.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTask
        show={showCreate}
        task={selectedTask}
        boardType={boardType}
        onClose={() => {
          setShowCreate(false);
          setSelectedTask(null);
        }}
        onCreated={(newTask) =>
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === newTask.id);
            if (exists) {
              return prev.map((t) => (t.id === newTask.id ? newTask : t));
            }
            return [...prev, newTask];
          })
        }
      />
      <ConfirmDialog
        show={showConfirm}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${taskToRemove?.title}"?`}
        onConfirm={confirmRemoveTask}
        onCancel={() => {
          setShowConfirm(false);
          setTaskToRemove(null);
        }}
      />
    </>
  );
};

export default KanbanBoard;
