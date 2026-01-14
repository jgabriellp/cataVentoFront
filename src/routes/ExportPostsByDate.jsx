import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/api";
import LoggedNavbar from "../components/LoggedNavbar";

const ExportPostsByDate = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        // const response = await api.get("/api/Group");
        const response = await api.get(
          `/api/Group/users/${loggedUser.id}/groups`
        );
        setGroups(response.data);
      } catch (err) {
        console.error("Erro ao buscar grupos:", err);
        alert("Não foi possível carregar os grupos.");
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // 🔹 Busca usuários por ID
  const fetchUsersByIds = async (creatorIds) => {
    const usersMap = {};
    await Promise.all(
      creatorIds.map(async (id) => {
        try {
          const response = await api.get(`/api/Usuario/${id}`);
          usersMap[id] = response.data.email;
        } catch {
          usersMap[id] = "E-mail não encontrado";
        }
      })
    );
    return usersMap;
  };

  // 🔹 Gera PDF sem imagens
  const generatePdf = async (posts, groupName) => {
    if (!posts || posts.length === 0) {
      alert("Nenhum post para exportar.");
      return;
    }

    const creatorIds = [...new Set(posts.map((p) => p.creatorId))];
    const usersMap = await fetchUsersByIds(creatorIds);

    const doc = new jsPDF();
    let currentY = 35;

    doc.setFontSize(18);
    doc.text(`Relatos do Grupo: ${groupName}`, 14, 22);

    doc.setFontSize(12);
    doc.text(`Período de ${startDate} a ${endDate}`, 14, 30);

    for (const post of posts) {
      // const content =
      //   post.content && post.content.length > 300
      //     ? post.content.substring(0, 300) + "..."
      //     : post.content || "";

      const content =
        post.content && post.content.length > 0 ? post.content : "";

      const formattedDate = post.date
        ? new Date(post.date).toLocaleDateString("pt-BR")
        : "";

      const creatorEmail = usersMap[post.creatorId] || "N/A";

      // 🔹 Renderiza linha de tabela
      autoTable(doc, {
        head: [["ID", "Conteúdo", "Criador (E-mail)", "Data"]],
        body: [[String(post.postId), content, creatorEmail, formattedDate]],
        startY: currentY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 85 },
          2: { cellWidth: 55 },
          3: { cellWidth: 25 },
        },
      });

      currentY = doc.lastAutoTable.finalY + 5;

      // 🔹 Quebra de página automática
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
    }

    doc.save(
      `relatos_${groupName.replace(/\s+/g, "_")}_${startDate}_a_${endDate}.pdf`
    );
  };

  const handleExport = async () => {
    if (!startDate || !endDate || !selectedGroup) {
      alert("Por favor, selecione data de início, data de fim e um grupo.");
      return;
    }

    setExporting(true);

    try {
      const response = await api.get(`/api/Post/group/${selectedGroup}/date`, {
        params: { startDate, endDate },
      });

      const posts = response.data;

      const groupName =
        groups.find((g) => g.groupId === Number(selectedGroup))?.groupName ||
        "Grupo";

      if (posts && posts.length > 0) {
        await generatePdf(posts, groupName);
      } else {
        alert("Nenhum post encontrado para o período e grupo selecionados.");
      }
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      alert("Não foi possível buscar os posts para exportação.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <LoggedNavbar />
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #04b1b7 0%, #9ce9ec 100%)",
          paddingTop: "60px",
          fontFamily: "'Poppins', sans-serif",
          position: "relative", // importante para o overlay
        }}
      >
        <div className="container mt-4">
          <h1 className="mb-4 text-white">Exportar Relatos por Período</h1>

          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Data de Início</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Data de Fim</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Grupo</label>
                  <select
                    className="form-select"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    disabled={loadingGroups}
                  >
                    <option value="">Selecione um grupo...</option>
                    {groups.map((group) => (
                      <option key={group.groupId} value={group.groupId}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={handleExport}
                    disabled={
                      !startDate || !endDate || !selectedGroup || exporting
                    }
                  >
                    {exporting ? "Exportando..." : "Exportar para PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Overlay de Loading */}
        {exporting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-lg font-semibold">
              Gerando PDF, por favor aguarde...
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ExportPostsByDate;
