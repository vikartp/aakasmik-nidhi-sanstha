import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Default } from "./components/pages/Default";
import { Register } from "./components/pages/Register";
import { Login } from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";
import { Logout } from "./components/pages/Logout";

function App() {
  // const token = localStorage.getItem("token");
  return (
    <Layout>
      <BrowserRouter>
        <Routes>
          {/* ✅ Default route */}
          <Route path="/" element={<Default />} />

          {/* Auth routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logout" element={<Logout />} />

          {/* Fallback route (optional) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
}

export default App;
