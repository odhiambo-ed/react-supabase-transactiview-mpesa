// src/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import { StatCard } from "../../components/Dashboard/StatCard";
import { TransactionChart } from "../../components/Dashboard/TransactionChart";
import { RecentTransactions } from "../../components/Dashboard/RecentTransactions";
import { supabase } from "../../lib/supabase";
import { TransactionStats, Transaction } from "../../types/transaction";
import { formatCurrency } from "../../utils/formatters";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        supabase.from("transaction_stats_view").select("*").single(),
        supabase
          .from("transaction_status_view")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (statsResponse.data) setStats(statsResponse.data);
      if (transactionsResponse.data) setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2 className="mb-4">Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatCard
            title="Total Transactions"
            value={stats?.total_transactions || 0}
            icon={<FiActivity size={24} className="text-primary" />}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Completed"
            value={stats?.completed_transactions || 0}
            icon={<FiCheckCircle size={24} className="text-success" />}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Total Amount"
            value={formatCurrency(stats?.total_amount_completed || 0)}
            icon={<FiDollarSign size={24} className="text-warning" />}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Avg. Time"
            value={`${stats?.avg_completion_time_minutes.toFixed(1) || 0} min`}
            icon={<FiClock size={24} className="text-info" />}
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>{stats && <TransactionChart stats={stats} />}</Col>
        <Col md={6}>
          <RecentTransactions transactions={transactions} />
        </Col>
      </Row>
    </div>
  );
};

// src/pages/HomePage/HomePage.tsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1>Welcome {user?.user_metadata?.full_name || "Back"}!</h1>
          <p className="lead">
            Manage your payments with ease using TransactiView
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Make Payment</Card.Title>
              <Card.Text>
                Initiate a new M-Pesa payment quickly and securely.
              </Card.Text>
              <Link to="/payment">
                <Button variant="primary">Pay Now</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>View Transactions</Card.Title>
              <Card.Text>
                Check your transaction history and payment status.
              </Card.Text>
              <Link to="/dashboard">
                <Button variant="outline-primary">View Dashboard</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Need Help?</Card.Title>
              <Card.Text>
                Having issues with your payment? We're here to help.
              </Card.Text>
              <Button variant="outline-secondary">Contact Support</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// src/pages/Payment/Payment.tsx
import React from "react";
import { Container, Card } from "react-bootstrap";
import PaymentForm from "../../components/PaymentForm/PaymentForm";
import "./Payment.css";

const Payment: React.FC = () => {
  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <h2 className="mb-4">Make Payment</h2>
          <PaymentForm />
        </Card.Body>
      </Card>
    </Container>
  );
};