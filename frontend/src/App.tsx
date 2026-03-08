import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ApplyPage from './pages/ApplyPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage'; 
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';

// 确保这里的后端地址正确
export const API_BASE_URL = "https://backend.bigsea0922.workers.dev"; 

// 🔒 路由守卫组件
const ProtectedRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user) {
    // 未登录，带上当前路径跳转到登录页，方便登录后跳回来
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <Routes>
          {/* 1. 公开页面：首页 */}
          <Route path="/" element={<LandingPage />} />
          
          {/* 2. 公开页面：登录/注册 */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* 3. 受保护页面：挂号登记页 (必须定义 /apply) */}
          <Route path="/apply" element={
            <ProtectedRoute>
              <ApplyPage />
            </ProtectedRoute>
          } />
          
          {/* 4. 受保护页面：个人控制面板 */}
          <Route path="/dashboard/:id" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* 5. 管理员专区 */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          } />

          {/* 6. 404 兜底：跳回首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <!-- 录入凭证弹窗
        <div v-if="showVoucherModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white p-6 rounded-2xl w-full max-w-sm">
                <h3 class="text-lg font-bold mb-4">录入挂号信息</h3>
                <input v-model="voucherForm.voucher_id" placeholder="Voucher ID" class="w-full border p-2 mb-3 rounded">
                <input v-model="voucherForm.image_url" placeholder="Image URL (optional)" class="w-full border p-2 mb-6 rounded">
                <div class="flex gap-2">
                    <button @click="showVoucherModal = false" class="flex-1 py-2 text-gray-500">Cancel</button>
                    <button @click="submitVoucher" class="flex-1 bg-blue-600 text-white py-2 rounded">Confirm</button>
                </div>
            </div>
        </div> -->
      </div>
    </AuthProvider>
  );
}

export default App;
