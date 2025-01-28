import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Container } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";

const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="text-center">
        <h1>Login to TransactiView</h1>
        <Button
          variant="outline-primary"
          onClick={signInWithGoogle}
          className="mt-3"
        >
          <FcGoogle className="me-2" size={24} />
          Sign in with Google
        </Button>
      </div>
    </Container>
  );
};

export default LoginPage;