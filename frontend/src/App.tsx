import { Routes, Route } from 'react-router-dom';
import ApplyPage from './pages/ApplyPage';
import DashboardPage from './pages/DashboardPage';

// ⚠️ 部署后端后，这里替换为后端 URL (例如 https://api.onrender.com)
export const API_BASE_URL = "http://localhost:3000"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<ApplyPage />} />
      <Route path="/dashboard/:id" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;