import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Default } from './components/pages/Default';
import { Register } from './components/pages/Register';
import { Login } from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import { Logout } from './components/pages/Logout';
import ForgotPassword from './components/pages/ForgotPassword';
import ViewScreenshot from './components/pages/ViewScreenshot';

function App() {
  return (
    <Layout>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/screenshot/:id" element={<ViewScreenshot />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
}

export default App;
