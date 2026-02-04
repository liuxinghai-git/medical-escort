import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../App';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient'; // 假设你已创建此文件

// 为了简洁，使用 anyType
type AnyType = any; 

export default function AdminPage() {
  const [cases, setCases] = useState<AnyType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useAuth(); // 权限检查

  // 检查是否是管理员
  if (role !== 'admin') {
    return <div className="p-10 text-center text-red-600">Access Denied: Not an Admin.</div>;
  }
  
  // 从后端获取所有 Case (此API需要在后端实现权限校验)
  const fetchCases = async () => {
    setLoading(true);
    try {
        // ⚠️ 实际代码需要传递 JWT Token，后端 Hono 才能验证你的管理员身份
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch(`${API_BASE_URL}/api/admin/all-cases`, {
            headers: {
                'Authorization': `Bearer ${session?.access_token}`, // 发送 Token
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) throw new Error("Failed to fetch cases from protected API.");
        
        const data = await res.json();
        setCases(data);
    } catch (e) {
        console.error("Admin fetch failed:", e);
        // navigate('/auth'); // 失败跳转登录页
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // 模拟：释放托管资金 (Capture)
  const handleRelease = async (caseId: string, authId: string) => {
    if (!window.confirm("CONFIRM: Release funds for this case?")) return;
    
    // ⚠️ 实际需要调用后端 API，这里仅为 UI 演示
    alert(`Simulating Capture for Case ${caseId}. Check PayPal/Cloudflare Logs.`);
    // 成功后手动更新 UI 状态
    setCases(cases.map(c => c.id === caseId ? { ...c, stage2_status: 'captured' } : c));
  };

  // 模拟：取消托管 (Void/Refund)
  const handleRefund = async (caseId: string, authId: string) => {
    if (!window.confirm("CONFIRM: Void authorization and refund customer?")) return;
    
    // ⚠️ 实际需要调用后端 API，这里仅为 UI 演示
    alert(`Simulating Refund for Case ${caseId}. Check PayPal/Cloudflare Logs.`);
    // 成功后手动更新 UI 状态
    setCases(cases.map(c => c.id === caseId ? { ...c, stage2_status: 'voided' } : c));
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline-block mr-2"/> Loading Cases...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard ({cases.length} Cases)</h1>
        <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 font-medium">
            <LogOut className="w-5 h-5 mr-2"/> Logout
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        {/* 表格内容与之前 AdminPage 保持一致 */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Hospital</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage 1 Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escrow Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((c: AnyType) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/${c.id}`)}>
                  {c.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {c.user_email}<br/>({c.target_hospital})
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {c.stage1_paid ? <CheckCircle className="w-5 h-5 text-green-500"/> : <XCircle className="w-5 h-5 text-red-500"/>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      c.stage2_status === 'authorized' ? 'bg-yellow-100 text-yellow-800' : 
                      c.stage2_status === 'captured' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                  }`}>
                    {c.stage2_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* 仅在已托管状态才显示操作按钮 */}
                  {c.stage2_status === 'authorized' && (
                    <>
                      <button 
                        onClick={() => handleRelease(c.id, c.stage2_auth_id)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        Capture
                      </button>
                      <button 
                        onClick={() => handleRefund(c.id, c.stage2_auth_id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Refund
                      </button>
                    </>
                  )}
                  {c.stage2_status === 'not_started' && <span className="text-gray-400">Waiting Deposit</span>}
                  {c.stage2_status === 'captured' && <span className="text-green-600">Completed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}