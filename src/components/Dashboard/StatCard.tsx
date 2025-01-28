// src/components/Dashboard/StatCard.tsx
import React from "react";
import { Card } from "react-bootstrap";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className="me-3">{icon}</div>
          <div>
            <Card.Title className="mb-1">{title}</Card.Title>
            <h3 className="mb-0">{value}</h3>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// src/components/Dashboard/TransactionChart.tsx
import React from "react";
import { Card } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { TransactionStats } from "../../types/transaction";

interface TransactionChartProps {
  stats: TransactionStats;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const TransactionChart: React.FC<TransactionChartProps> = ({ stats }) => {
  const data = [
    { name: "Completed", value: stats.completed_transactions },
    { name: "Pending", value: stats.pending_transactions },
    { name: "Failed", value: stats.failed_transactions },
  ];

  return (
    <Card>
      <Card.Body>
        <Card.Title>Transaction Status Distribution</Card.Title>
        <div className="d-flex justify-content-center">
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </Card.Body>
    </Card>
  );
};

// src/components/Dashboard/RecentTransactions.tsx
import React from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { Transaction } from "../../types/transaction";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Recent Transactions</Card.Title>
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.mpesa_receipt_number || "Pending"}</td>
                  <td>{formatCurrency(tx.amount)}</td>
                  <td>
                    <Badge
                      bg={
                        tx.status === "completed"
                          ? "success"
                          : tx.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td>{formatDate(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};