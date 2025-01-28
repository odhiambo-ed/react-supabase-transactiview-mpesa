import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="d-flex flex-column vh-100 bg-dark text-white">
      <Nav className="flex-column p-3">
        <Nav.Link as={Link} to="/" className="text-white">
          TransactiView
        </Nav.Link>
        <Nav.Link as={Link} to="/" className="text-white">
          Home
        </Nav.Link>
        <Nav.Link as={Link} to="/payment" className="text-white">
          Pay
        </Nav.Link>
        <Nav.Link as={Link} to="/dashboard" className="text-white">
          Dashboard
        </Nav.Link>
      </Nav>
      <div className="mt-auto p-3">
        <button className="btn btn-danger w-100" onClick={signOut}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;