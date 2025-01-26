// src/components/Sidebar.tsx
import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import './Sidebar.css'

const Sidebar: React.FC = () => {
  return (
    <div className="d-flex flex-column vh-100 bg-dark text-white">
      <Nav className="flex-column p-3">
        <Nav.Link as={Link} to="/" className="text-white">
          TransactiView
        </Nav.Link>
        <Nav.Link as={Link} to="HomePage" className="text-white">
          Home
        </Nav.Link>
        <Nav.Link as={Link} to="/payment" className="text-white">
          Pay
        </Nav.Link>
      </Nav>
      <div className="mt-auto p-3">
        <Nav.Link as={Link} to="/payment">
          <button className="btn btn-primary w-100">Pay Now</button>
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;