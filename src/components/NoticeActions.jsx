import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { MoreVertical } from "lucide-react";

const NoticeActions = ({ notice, onEdit }) => {
  const [show, setShow] = useState(false);

  return (
    <Dropdown show={show} onToggle={() => setShow(!show)} align="end">
      <Dropdown.Toggle
        as="span"
        style={{
          cursor: "pointer",
          color: "#666",
          display: "flex",
          alignItems: "center",
        }}
      >
        <MoreVertical size={20} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onEdit(notice)}>
          Editar aviso
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NoticeActions;
