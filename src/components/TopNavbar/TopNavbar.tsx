import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { RiSecurePaymentLine } from "react-icons/ri";

const TopNavbar: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home" className="">
          Code
          <span>
            <RiSecurePaymentLine />
          </span>
          Cafe
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;