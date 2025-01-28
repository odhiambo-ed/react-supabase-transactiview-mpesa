// src/components/Auth/Login.tsx
import React from "react";
import { Card, Button, Container, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>("");

  const handleLogin = async () => {
    try {
      await signIn();
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="p-4 shadow-sm" style={{ maxWidth: "400px" }}>
        <Card.Body className="text-center">
          <h2 className="mb-4">Welcome to TransactiView</h2>
          <p className="text-muted mb-4">Sign in to access your dashboard</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button
            variant="outline-dark"
            className="w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogin}
          >
            <FcGoogle size={24} />
            Sign in with Google
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

// src/components/Auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "react-bootstrap";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// src/components/Auth/index.ts
export { default as Login } from "./Login";
export { default as ProtectedRoute } from "./ProtectedRoute";