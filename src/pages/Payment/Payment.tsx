import React from "react";
import PaymentForm from "../../components/PaymentForm/PaymentForm";

const Payment: React.FC = () => {
  return (
    <div className="p-4 w-60 border border-primary rounded">
      <h1>Pay Now</h1>
      <PaymentForm />
    </div>
  );
};

export default Payment;