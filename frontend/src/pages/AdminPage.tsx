import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 找到这行引入图标的代码，确保包含 User 和 Activity
import { 
  LogOut, CheckCircle, Clock, Shield, AlertCircle, 
  Loader2, Camera, Plus, Trash2, Hospital, MapPin, 
  ExternalLink, Activity, User  // ⬅️ 确保这两个在这里
} from 'lucide-react';
import { API_BASE_URL } from '../App';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [cases, setCases] = useState<any[]>([]);
  const [hospitalMeta, setHospitalMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 【修正 1】使用 React 的 useState 代替 Vue 的 ref
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [voucherForm, setVoucherForm] = useState({ voucher_id: '', image_url: '' });

  // 元数据管理状态
  const [newCity, setNewCity] = useState('');
  const [selectedCityForHosp, setSelectedCityForHosp] = useState('');
  const [newHospitalName, setNewHospitalName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const casesRes = await fetch(`${API_BASE_URL}/api/admin/all-cases`);
      const casesData = await casesRes.json();
      setCases(casesData);

      const metaRes = await fetch(`${API_BASE_URL}/api/meta/hospitals`);
      const metaData = await metaRes.json();
      setHospitalMeta(metaData);
    } catch (e) {
      console.error("Admin Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') fetchData();
  }, [role]);

  // 【修正 2】整合凭证提交逻辑
  const submitVoucher = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/cases/${currentOrderId}/verify-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherForm)
        });
        
        if (!res.ok) throw new Error("Update failed");
        
        alert("Success! Status updated to confirmed.");
        setShowVoucherModal(false);
        setVoucherForm({ voucher_id: '', image_url: '' });
        fetchData(); 
    } catch (e) {
        alert("Update failed");
    }
  };

  const adminAction = async (endpoint: string, body: object) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) await fetchData();
      else alert("Error");
    } catch (e) { alert("Network Error"); }
  };

  if (role !== 'admin') return <div className="p-10 text-center">Unauthorized</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border">
          <h1 className="text-2xl font-black italic">CONTROL PANEL</h1>
          <button onClick={() => supabase.auth.signOut()} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center">
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>

        {/* 订单管理表格 */}
        <div className="bg-white rounded-[2rem] shadow-lg border overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase">Patient</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase">S1</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase">S2 Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase">Operation</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td className="px-8 py-6 font-bold">{c.patient_name}</td>
                  <td className="px-8 py-6">{c.stage1_paid ? "PAID" : "Pending"}</td>
                  <td className="px-8 py-6 font-black text-xs uppercase">{c.stage2_status}</td>
                  <td className="px-8 py-6">
                    {/* ✅ 这里是 React 的条件渲染 */}
                    {c.stage2_status === 'paid' && (
                      <button 
                        onClick={() => { setCurrentOrderId(c.id); setShowVoucherModal(true); }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                      >
                        录入挂号凭证
                      </button>
                    )}
                    {c.stage2_status === 'confirmed' && <span className="text-emerald-600 font-bold text-xs">已完成挂号</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ 录入凭证弹窗 */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-6">录入挂号信息</h3>
            <input 
              value={voucherForm.voucher_id}
              onChange={(e) => setVoucherForm({...voucherForm, voucher_id: e.target.value})}
              placeholder="Voucher ID" 
              className="w-full border-2 p-3 rounded-xl mb-3 outline-none" 
            />
            <input 
              value={voucherForm.image_url}
              onChange={(e) => setVoucherForm({...voucherForm, image_url: e.target.value})}
              placeholder="Image URL" 
              className="w-full border-2 p-3 rounded-xl mb-6 outline-none" 
            />
            <div className="flex gap-3">
              <button onClick={() => setShowVoucherModal(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
              <button onClick={submitVoucher} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
