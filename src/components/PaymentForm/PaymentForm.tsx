import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";

const PaymentForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

//   const navigate = useNavigate();
  const code = "TestCode";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const ref = `TXN-${Date.now()}`; // Generate a unique transaction reference
    setTransactionRef(ref);

    try {
      const response = await fetch(
        `https://lceqxhhumahvtzkicksx.supabase.co/functions/v1/mpesaCharge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, ref, amount, code }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setSuccess(true);
        // Optionally, you can check the payment status here if needed
      } else {
        throw new Error(data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formAmount">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </Form.Group>

        <Button
          className="mt-3"
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Make Payment"}
        </Button>
      </Form>

      {loading && (
        <Alert variant="info" className="mt-3">
          Processing payment...
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mt-3">
          Payment successful! Transaction Reference: {transactionRef}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default PaymentForm;