import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, Clock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../App';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useAuth();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/all-cases`);
      const data = await res.json();
      setCases(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (role === 'admin') fetchCases(); }, [role]);

  // 通用的 API 请求函数
  const adminAction = async (endpoint: string, body: object) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) { fetchCases(); } else { alert("Action Failed"); }
  };

  if (role !== 'admin') return <div className="p-20 text-center">Unauthorized</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-800">Admin Operations Center</h1>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center text-slate-500 hover:text-red-600 font-medium">
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">Case/Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">Stage 1 ($30)</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">Stage 2 ($100)</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-blue-600 underline cursor-pointer" onClick={() => navigate(`/dashboard/${c.id}`)}>
                      {c.id.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-slate-500">{c.user_email}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1">{c.target_hospital}</div>
                  </td>

                  {/* Stage 1 状态 */}
                  <td className="px-6 py-4">
                    {c.stage1_paid ? (
                      <span className="flex items-center text-green-600 text-sm font-bold"><CheckCircle className="w-4 h-4 mr-1"/> Paid</span>
                    ) : (
                      <span className="flex items-center text-slate-400 text-sm"><Clock className="w-4 h-4 mr-1"/> Unpaid</span>
                    )}
                  </td>

                  {/* Stage 2 状态 */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      c.stage2_status === 'authorized' ? 'bg-amber-100 text-amber-700' :
                      c.stage2_status === 'captured' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {c.stage2_status.toUpperCase()}
                    </span>
                  </td>

                  {/* 核心操作按钮 */}
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* 操作 1: 确认收到 $30 */}
                    {!c.stage1_paid && (
                      <button 
                        onClick={() => adminAction('confirm-stage1', { caseId: c.id })}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700"
                      >
                        Confirm $30
                      </button>
                    )}

                    {/* 操作 2: 确认收到 $100 托管 (Webhook 没通时的手动补救) */}
                    {c.stage1_paid && c.stage2_status === 'not_started' && (
                      <button 
                        onClick={() => {
                          const id = window.prompt("Enter PayPal Auth ID (from PayPal dashboard):");
                          if (id) adminAction('confirm-stage2', { caseId: c.id, paypalAuthId: id });
                        }}
                        className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600"
                      >
                        Confirm $100 Escrow
                      </button>
                    )}

                    {/* 操作 3: 托管后的 扣款/退款 */}
                    {c.stage2_status === 'authorized' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => adminAction('capture-stage2', { caseId: c.id })}
                          className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700"
                        >
                          <Shield className="w-3 h-3 mr-1"/> Capture (Success)
                        </button>
                        <button 
                          onClick={() => adminAction('void-stage2', { caseId: c.id })}
                          className="flex items-center bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200"
                        >
                          <AlertCircle className="w-3 h-3 mr-1"/> Void (Refund)
                        </button>
                      </div>
                    )}

                    {c.stage2_status === 'captured' && <span className="text-green-600 font-bold text-sm italic">Case Completed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
