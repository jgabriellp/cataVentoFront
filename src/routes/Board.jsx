import React, { useState } from "react";
import LoggedNavbar from "../components/LoggedNavbar"
import KanbanBoard from "../components/KanbanBoard"

const Board = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = Number(user?.role) === 4;

  const [activeBoard, setActiveBoard] = useState(isAdmin ? 2 : 1);

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

        {isAdmin && (
          <div className="flex justify-center gap-2 pt-4 pb-2">
            <button
              onClick={() => setActiveBoard(2)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                activeBoard === 2
                  ? "bg-white text-[#04b1b7] shadow-md"
                  : "bg-white/30 text-white hover:bg-white/50"
              }`}
            >
              Gestão
            </button>
            <button
              onClick={() => setActiveBoard(1)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                activeBoard === 1
                  ? "bg-white text-[#04b1b7] shadow-md"
                  : "bg-white/30 text-white hover:bg-white/50"
              }`}
            >
              Coordenação
            </button>
          </div>
        )}

        <KanbanBoard boardType={activeBoard} />

      </section>
    </>
  );
};

export default Board;
