import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/agents" element={<Layout><Agents /></Layout>} />
          <Route path="/agents/create" element={<Layout><CreateAgent /></Layout>} />
          <Route path="/agents/test" element={<Layout><TestAgent /></Layout>} />
          <Route path="/conversations" element={<Layout><Conversations /></Layout>} />
          <Route path="/crm" element={<Layout><CRM /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="/plans" element={<Layout><Plans /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
        </Routes>
    </BrowserRouter>
  );
}

export default App; 