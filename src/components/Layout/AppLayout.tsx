// src/components/Layout/AppLayout.tsx
import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <TopNavbar />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;

// src/components/Layout/Sidebar.tsx
import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiCreditCard, FiPieChart } from "react-icons/fi";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="sidebar bg-dark text-white vh-100">
      <div className="d-flex flex-column h-100">
        <div className="p-3">
          <h4 className="text-white mb-4">TransactiView</h4>
          <Nav className="flex-column">
            <Nav.Link
              as={Link}
              to="/"
              className={`text-white mb-2 ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              <FiHome className="me-2" /> Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/dashboard"
              className={`text-white mb-2 ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <FiPieChart className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/payment"
              className={`text-white mb-2 ${
                location.pathname === "/payment" ? "active" : ""
              }`}
            >
              <FiCreditCard className="me-2" /> Pay
            </Nav.Link>
          </Nav>
        </div>
        <div className="mt-auto p-3">
          <Link to="/payment" className="text-decoration-none">
            <button className="btn btn-primary w-100">Pay Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// src/components/Layout/TopNavbar.tsx
import React from "react";
import { Navbar, Container, NavDropdown } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import { RiSecurePaymentLine } from "react-icons/ri";

const TopNavbar: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <Navbar bg="white" className="border-bottom">
      <Container fluid>
        <Navbar.Brand className="d-flex align-items-center">
          <RiSecurePaymentLine className="me-2" />
          TransactiView
        </Navbar.Brand>
        <NavDropdown
          title={user?.user_metadata?.full_name || user?.email}
          align="end"
        >
          <NavDropdown.Item onClick={signOut}>Sign Out</NavDropdown.Item>
        </NavDropdown>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;