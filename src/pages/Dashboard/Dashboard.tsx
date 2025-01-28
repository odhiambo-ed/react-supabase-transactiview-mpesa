import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
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
import { Table, Alert, Pagination } from "react-bootstrap";
import { supabase } from "../../contexts/AuthContext";
import { Transaction, TransactionStats } from "../../types/types";
import { ChartData, ChartOptions } from "chart.js";

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3; // Display 3 items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transaction statistics
        const { data: statsData, error: statsError } = await supabase
          .from("transaction_stats_view")
          .select("*")
          .single();

        if (statsError) throw statsError;
        setTransactionStats(statsData as TransactionStats);

        // Fetch individual transactions
        const { data: transactionsData, error: transactionsError } =
          await supabase.from("transaction_status_view").select("*");

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData as Transaction[]);
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
  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Transaction Statistics",
      },
    },
  };

  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Transaction Status Distribution",
      },
    },
  };

  // Chart.js data
  const barChartData: ChartData<"bar", number[], string> = {
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

  const pieChartData: ChartData<"pie", number[], string> = {
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

  // Get current transactions for pagination
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2>Dashboard</h2>

      {loading && <p>Loading data...</p>}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="row">
            <div className="col-md-4 mb-4">
              <Bar options={barChartOptions} data={barChartData} />
            </div>
            <div className="col-md-4 mb-4">
              <Pie options={pieChartOptions} data={pieChartData} />
            </div>
          </div>

          <div className="mt-4">
            <h4>Transaction Details</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.mpesa_receipt_number}>
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
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <Pagination>
              {Array.from(
                { length: Math.ceil(transactions.length / itemsPerPage) },
                (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                )
              )}
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;