import React from "react";
import UsersTable from "../components/UsersTable";
import LoggedNavbar from "../components/LoggedNavbar";

const Users = () => {
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
        <UsersTable />
      </section>
    </>
  );
};

export default Users;
