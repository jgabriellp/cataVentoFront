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
// 🔹 CARD COLORS PER STATUS
// =====================================================
const cardColorByStatus = {
  1: "bg-slate-600",    // To Do
  2: "bg-teal-600",     // In Progress
  3: "bg-amber-600",    // Review
  4: "bg-[#f1e6af]",  // Done
};

// =====================================================
// 🔹 TASK CARD
// =====================================================
const TaskCard = ({ task, status, onClick, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${cardColorByStatus[status] || "bg-zinc-700"} ${status === 4 ? "text-zinc-800" : "text-white"} p-3 rounded mb-3 cursor-move`}
    >
      <div className="flex justify-between items-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => onClick(task)}
        >
          {task.title}
        </span>
        <button
          className="rounded-full px-2 py-1 hover:text-red-400 transition-colors"
          onClick={() => onRemove(task)}
        >
          x
        </button>
      </div>

      {task.responsavel && (
        <small className={status === 4 ? "text-zinc-600" : "text-zinc-300"}>
          Responsável: {task.responsavel.name}
        </small>
      )}
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

  return (
    <div
      ref={setNodeRef}
      className="w-80 bg-zinc-100 rounded-lg p-4 min-h-[200px]"
    >
      <h3 className="font-bold mb-4">
        {title} ({tasks.length})
      </h3>

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
const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
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
    })
  );

  // ---------------------------------------------------
  // LOAD TASKS
  // ---------------------------------------------------
  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/Task");
      setTasks(res.data);
    } catch (err) {
      console.error("Erro ao carregar tasks", err);
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
      .filter((t) => t.status === Number(status))
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
        }))
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
        (t) => t.id !== activeId
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
  return (
    <>
      <div className="flex justify-center mb-6">
        <button
          onClick={() => {
            setSelectedTask(null);
            setShowCreate(true);
          }}
          className="font-medium text-[#04b1b7] border border-[#04b1b7] rounded-full px-4 py-1.5 bg-white"
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
            <div className={`${cardColorByStatus[activeTask.status] || "bg-zinc-700"} ${activeTask.status === 4 ? "text-zinc-800" : "text-white"} p-3 rounded shadow-lg w-72`}>
              <div className="flex justify-between items-center">
                <span>{activeTask.title}</span>
              </div>
              {activeTask.responsavel && (
                <small className={activeTask.status === 4 ? "text-zinc-600" : "text-zinc-300"}>
                  Responsável: {activeTask.responsavel.name}
                </small>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTask
        show={showCreate}
        task={selectedTask}
        onClose={() => {
          setShowCreate(false);
          setSelectedTask(null);
        }}
        onCreated={(task) => setTasks((prev) => [...prev, task])}
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
