import React, { useState, useEffect } from "react";
import { Bar, Pie, getElementsAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Table, Alert } from "react-bootstrap";
import { supabase } from "../../contexts/AuthContext";
import { Transaction, TransactionStats } from "../../types/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [transactionStats, setTransactionStats] =
    useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transaction statistics
        const { data: statsData, error: statsError } = await supabase
          .from<TransactionStats>("transaction_stats_view")
          .select("*")
          .single();

        if (statsError) throw statsError;
        setTransactionStats(statsData);

        // Fetch individual transactions
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from<Transaction>("transaction_status_view")
            .select("*");

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart.js options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Transaction Statistics",
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Transaction Status Distribution",
      },
    },
  };

  // Chart.js data
  const barChartData = {
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        label: "Number of Transactions",
        data: transactionStats
          ? [
              transactionStats.completed_transactions,
              transactionStats.pending_transactions,
              transactionStats.failed_transactions,
            ]
          : [],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  const pieChartData = {
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        label: "Transaction Status",
        data: transactionStats
          ? [
              transactionStats.completed_transactions,
              transactionStats.pending_transactions,
              transactionStats.failed_transactions,
            ]
          : [],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  return (
    <div>
      <h2>Dashboard</h2>

      {loading && <p>Loading data...</p>}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="row">
            <div className="col-md-6 mb-4">
              <Bar options={barChartOptions} data={barChartData} />
            </div>
            <div className="col-md-6 mb-4">
              <Pie options={pieChartOptions} data={pieChartData} />
            </div>
          </div>

          <div className="mt-4">
            <h4>Transaction Details</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Receipt #</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Completed At</th>
                  <th>Callback Data</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.mpesa_receipt_number}</td>
                    <td>{transaction.phone}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.status}</td>
                    <td>{new Date(transaction.created_at).toLocaleString()}</td>
                    <td>
                      {transaction.completed_at
                        ? new Date(transaction.completed_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <pre>
                        {JSON.stringify(transaction.callback_data, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;