# TransactiView

**TransactiView** is a full-stack application that integrates Supabase as the backend and PostgreSQL as the database, with a React frontend. The primary purpose of the application is to display transaction data in a user-friendly interface while facilitating M-Pesa payments.

## Key Features

- **User Management**: 
  - The application includes a users table to store user information, such as names and email addresses.

- **Transaction Tracking**: 
  - A transactions table records financial transactions associated with users, including details like amount, type (credit or debit), and timestamps.

- **M-Pesa Payment Integration**: 
  - The application allows users to initiate payments through M-Pesa using a push payment request. It handles the payment process by sending requests to the M-Pesa API and managing transaction references.

- **Payment Confirmation Handling**: 
  - The application implements a webhook to receive payment confirmation callbacks from M-Pesa. This ensures that the transaction status is updated in real-time based on the payment provider's response.

- **Database Views**: 
  - A PostgreSQL view (`transactions_view`) combines data from the users and transactions tables, allowing for easy retrieval of transaction history along with user details.

- **Responsive UI**: 
  - The frontend is built using React and styled with Bootstrap, providing a clean and responsive user interface for displaying transaction history and payment statuses.

- **Supabase Integration**: 
  - The application utilizes Supabase's JavaScript client to interact with the database, enabling real-time data fetching and management.

- **Deployment Ready**: 
  - The project is structured for easy deployment, with instructions for using Vercel to host the application.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Supabase account
- M-Pesa API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/transactiview.git
   cd transactiview
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase URL and Anon key:
   ```plaintext
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   ```

### Running the Application

To start the development server, run:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Deployment

To deploy the application using Vercel, follow these steps:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy the application:
   ```bash
   vercel
   ```

Follow the prompts to complete the deployment process.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io) for providing a powerful backend solution.
- [M-Pesa](https://www.safaricom.co.ke/personal/m-pesa) for enabling seamless payment integration.
- [React](https://reactjs.org) and [Bootstrap](https://getbootstrap.com) for building a responsive user interface.
```