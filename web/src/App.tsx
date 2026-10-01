import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CliAuth from "./pages/Cli";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cli" element={<CliAuth />} />
        
        {/* Protected Routes (with sidebar) */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<div className="p-4">Devices Page</div>} />
          <Route path="/billing" element={<div className="p-4">Billing Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
