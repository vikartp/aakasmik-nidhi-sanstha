import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Default } from './components/pages/Default';
import { Register } from './components/pages/Register';
import { Login } from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import { Logout } from './components/pages/Logout';
import { useAuth } from './context/AuthContext';
import ForgotPassword from './components/pages/ForgotPassword';

function App() {
  const { user } = useAuth();
  console.log('App user:', user);
  return (
    <Layout>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
}

export default App;
