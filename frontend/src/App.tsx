import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import CreateAgent from './pages/CreateAgent';
import TestAgent from './pages/TestAgent';
import Conversations from './pages/Conversations';
import CRM from './pages/CRM';
import Admin from './pages/Admin';
import Plans from './pages/Plans';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { PrivateRoute } from './components/auth/PrivateRoute';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Layout><Dashboard /></Layout>} />} />
          <Route path="/agents" element={<PrivateRoute element={<Layout><Agents /></Layout>} />} />
          <Route path="/agents/create" element={<PrivateRoute element={<Layout><CreateAgent /></Layout>} />} />
          <Route path="/agents/test" element={<PrivateRoute element={<Layout><TestAgent /></Layout>} />} />
          <Route path="/conversations" element={<PrivateRoute element={<Layout><Conversations /></Layout>} />} />
          <Route path="/crm" element={<PrivateRoute element={<Layout><CRM /></Layout>} />} />
          <Route path="/admin" element={<PrivateRoute element={<Layout><Admin /></Layout>} />} />
          <Route path="/plans" element={<PrivateRoute element={<Layout><Plans /></Layout>} />} />
          <Route path="/profile" element={<PrivateRoute element={<Layout><Profile /></Layout>} />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App; 