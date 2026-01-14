import React, { useState } from "react";
import { Modal, Button, Form, Spinner, InputGroup } from "react-bootstrap";
import GroupsTable from "../components/GroupsTable";
import LoggedNavbar from "../components/LoggedNavbar";
import api from "../services/api";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Se o campo de busca estiver vazio, limpa resultados e volta para a tabela normal
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Substitui espaços por '+' ou mantém o nome “como está”
      const formattedName = searchQuery.replace(/ /g, " ");
      const response = await api.get(`/api/Group/name/${formattedName}`);
      setSearchResults(response.data ? [response.data] : []);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("Grupo não encontrado.");
      } else {
        console.error("Erro ao buscar grupos", err);
        alert("Ocorreu um erro ao buscar o grupo.");
      }

      console.error("Erro ao buscar grupos", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
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
        }}
      >
        {/* Título estilizado */}
        <h3
          className="text-center mb-4"
          style={{
            color: "#ffffff",
            fontWeight: "600",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Pesquisar Grupo pelo Nome
        </h3>

        {/* Campo de busca centralizado e estilizado */}
        <div
          className="d-flex justify-content-center mb-4"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <InputGroup>
            <Form.Control
              placeholder="Digite o nome do grupo"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: "25px",
                border: "1px solid #04b1b7",
                padding: "10px 15px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              style={{
                borderRadius: "25px",
                marginLeft: "8px",
                backgroundColor: "#04b1b7",
                borderColor: "#04b1b7",
                fontWeight: "500",
                padding: "6px 20px",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#03a0a6")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#04b1b7")}
            >
              {searchLoading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Pesquisar"
              )}
            </Button>

            <Button
              variant="light"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              style={{
                borderRadius: "25px",
                marginLeft: "8px",
              }}
            >
              Limpar Busca
            </Button>
          </InputGroup>
        </div>

        {/* Tabela de grupos */}
        <GroupsTable searchResults={searchResults} />
      </section>
    </>
  );
};

export default Groups;
