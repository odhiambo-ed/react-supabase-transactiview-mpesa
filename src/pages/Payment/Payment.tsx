import React from "react";
import PaymentForm from "../../components/PaymentForm/PaymentForm";
import Mpesa from "../../assets/images/M-PESA_LOGO.png";

const Payment: React.FC = () => {
  return (
    <div className="p-4 w-60 border border-primary rounded">
      <div className="row d-flex flex-row justify-content-around">
        <h1>Pay Now</h1>
        <img src={Mpesa} alt="Mpesa Logo" className="mpesa__logo" />
      </div>
      <PaymentForm />
    </div>
  );
};

export default Payment;