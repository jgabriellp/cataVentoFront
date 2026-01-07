import React from "react";
import LoggedNavbar from "../components/LoggedNavbar"
import KanbanBoard from "../components/KanbanBoard" 

const Board = () => {
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
      
      <KanbanBoard />

      </section>

    </>
  );
};

export default Board;
