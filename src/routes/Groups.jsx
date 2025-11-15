import React from "react";
import GroupsTable from "../components/GroupsTable";
import LoggedNavbar from "../components/LoggedNavbar";

const Groups = () => {
  const user = JSON.parse(localStorage.getItem("user"));

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
        <GroupsTable />
      </section>
    </>
  );
};

export default Groups;
