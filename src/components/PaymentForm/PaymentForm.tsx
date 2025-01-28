import { useState, useEffect, useRef } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

const PaymentForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const intervalRef = useRef<null | NodeJS.Timeout>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Timers for success and error messages
  const successTimerRef = useRef<null | NodeJS.Timeout>(null);
  const errorTimerRef = useRef<null | NodeJS.Timeout>(null);

  // Function to check the status of the transaction
  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const response = await fetch(
        `https://lceqxhhumahvtzkicksx.supabase.co/functions/v1/check-payment-status?transactionId=${transactionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (data.status === "completed") {
          setSuccess(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setLoading(false);

          // Set a timer to clear the success message after 5 seconds
          successTimerRef.current = setTimeout(() => {
            setSuccess(false);
          }, 5000);
        } else if (data.status === "failed") {
          setError("Payment failed.");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setLoading(false);

          // Set a timer to clear the error message after 5 seconds
          errorTimerRef.current = setTimeout(() => {
            setError("");
          }, 5000);
        }
      } else {
        throw new Error(data.message || "Failed to confirm payment status.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch transaction status."
      );

      // Set a timer to clear the error message after 5 seconds
      errorTimerRef.current = setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setPaymentInitiated(true);

    const ref = `TXN-${Date.now()}`;
    setTransactionRef(ref);

    try {
      const response = await fetch(
        "https://lceqxhhumahvtzkicksx.supabase.co/functions/v1/mpesa-stk-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, amount, ref }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setTransactionId(data.transaction_id);
      } else {
        throw new Error(data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setLoading(false);

      // Set a timer to clear the error message after 5 seconds
      errorTimerRef.current = setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  useEffect(() => {
    if (paymentInitiated && transactionId && !success && !error) {
      intervalRef.current = setInterval(() => {
        checkTransactionStatus(transactionId);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paymentInitiated, transactionId, success, error]);

  // Function to clear the form fields
  const clearForm = () => {
    setPhone("");
    setAmount(0);
    setTransactionRef("");
    setPaymentInitiated(false);
    setTransactionId(null);
  };

  useEffect(() => {
    // Clear the form when a payment is successful
    if (success) {
      clearForm();
    }
  }, [success]);

  useEffect(() => {
    return () => {
      // Clear timers when the component unmounts
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="254xxxxxxxxx"
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