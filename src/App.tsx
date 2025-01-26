import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/SideBar";
import TopNavbar from "./components/TopNavbar";
import Dashboard from "./components/Dashboard";
import HomePage from "./pages/HomePage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <TopNavbar />
          <div className="p-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;