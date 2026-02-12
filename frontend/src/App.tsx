import { Routes, Route, Navigate } from 'react-router-dom';
import ApplyPage from './pages/ApplyPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage'; 
import { AuthProvider, useAuth } from './AuthContext'; // 引入 Auth Provider

export const API_BASE_URL = "https://backend.bigsea0922.workers.dev"; // 确保是你的 Workers 地址

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
    const { user, role, loading } = useAuth();

    if (loading) return null; // 等待 Context 加载完成

    if (!user) return <Navigate to="/auth" replace />; // 未登录，跳转到登录页

    if (adminOnly && role !== 'admin') {
        alert("Unauthorized access.");
        return <Navigate to="/" replace />; // 非管理员，跳转到首页
    }

    return <>{children}</>;
};


function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          {/* 普通用户路由 */}
          <Route path="/" element={
            <ProtectedRoute>
                <ApplyPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/:id" element={
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
          } />

          {/* 管理员专属路由 */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
                <AdminPage />
            </ProtectedRoute>
          } />
        </Routes>
    </AuthProvider>
  );
}

export default App;