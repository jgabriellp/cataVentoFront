import React, { useState } from "react";
import { Modal, Button, Form, Spinner, InputGroup } from "react-bootstrap";
import UsersTable from "../components/UsersTable";
import LoggedNavbar from "../components/LoggedNavbar";
import api from "../services/api";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);

    try {
      const response = await api.get(`/api/Usuario/name/${searchQuery}`);

      // Sua API já retorna um array
      setSearchResults(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("Usuário não encontrado.");
      } else {
        console.error("Erro ao buscar usuário", err);
        alert("Erro ao buscar usuário.");
      }
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
        <h3
          className="text-center mb-4"
          style={{
            color: "#ffffff",
            fontWeight: "600",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Pesquisar Usuário pelo Nome
        </h3>

        <div
          className="d-flex justify-content-center mb-4"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <InputGroup>
            <Form.Control
              placeholder="Digite o nome do usuário"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: "25px",
                border: "1px solid #04b1b7",
                padding: "10px 12px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                minWidth: "221px",
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

        <UsersTable searchResults={searchResults} />
      </section>
    </>
  );
};

export default Users;
