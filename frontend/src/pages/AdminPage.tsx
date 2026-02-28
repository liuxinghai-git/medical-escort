import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, CheckCircle, Clock, Shield, AlertCircle, Activity,
  Loader2, Camera, Plus, Trash2, Hospital, MapPin, ExternalLink
} from 'lucide-react';
import { API_BASE_URL } from '../App';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  // 状态管理
  const [cases, setCases] = useState<any[]>([]);
  const [hospitalMeta, setHospitalMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 元数据管理状态
  const [newCity, setNewCity] = useState('');
  const [selectedCityForHosp, setSelectedCityForHosp] = useState('');
  const [newHospitalName, setNewHospitalName] = useState('');

  // 1. 初始化加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取所有订单
      const casesRes = await fetch(`${API_BASE_URL}/api/admin/all-cases`);
      const casesData = await casesRes.json();
      setCases(casesData);

      // 获取当前城市医院列表
      const metaRes = await fetch(`${API_BASE_URL}/api/meta/hospitals`);
      const metaData = await metaRes.json();
      setHospitalMeta(metaData);
      if (Object.keys(metaData).length > 0) {
        setSelectedCityForHosp(Object.keys(metaData)[0]);
      }
    } catch (e) {
      console.error("Admin Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') fetchData();
  }, [role]);

  // --- 核心业务操作函数 ---
  const adminAction = async (endpoint: string, body: object) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        await fetchData(); // 操作成功后刷新列表
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (e) {
      alert("Network Error");
    }
  };

  // --- 元数据管理函数 ---
  const handleAddCity = async () => {
    if (!newCity) return;
    await adminAction('meta/cities', { name: newCity });
    setNewCity('');
  };

  const handleAddHospital = async () => {
    if (!newHospitalName || !selectedCityForHosp) return;
    await adminAction('meta/hospitals', { cityName: selectedCityForHosp, hospitalName: newHospitalName });
    setNewHospitalName('');
  };

  // 权限拦截
  if (role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h1 className="text-xl font-bold">Unauthorized Access</h1>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header - 顶栏 */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Control <span className="text-blue-600">Panel</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Global Medical Coordination System</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase">System Status</p>
                <p className="text-sm font-black text-green-500 uppercase">Online & Secure</p>
             </div>
             <button onClick={() => supabase.auth.signOut()} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center hover:bg-red-600 transition-colors">
                <LogOut size={16} className="mr-2" /> Logout
             </button>
          </div>
        </div>

        {/* --- 第一部分：订单管理表格 --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
          <div className="px-8 py-6 bg-slate-900 flex justify-between items-center">
             <h2 className="text-white font-bold flex items-center tracking-tight">
                <Activity className="text-blue-400 mr-2" size={20} />
                Live Case Management
             </h2>
             <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {cases.length} Total Requests
             </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient / ID</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">S1 Assessment ($30)</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">S2 Escrow ($100)</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">S3 Companion</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* 病人基本信息 */}
                    <td className="px-8 py-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-50 p-2 rounded-xl">
                           <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none mb-1">{c.patient_name || 'Incomplete'}</p>
                          <p className="text-xs text-slate-400 mb-2">{c.user_email}</p>
                          <div className="flex items-center space-x-2">
                             {c.passport_url ? (
                               <a href={c.passport_url} target="_blank" className="text-[10px] font-bold text-blue-600 flex items-center bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100">
                                 <Camera size={10} className="mr-1" /> View Passport
                               </a>
                             ) : <span className="text-[10px] text-slate-300 italic">No Photo</span>}
                             <span className="text-[10px] font-mono text-slate-300">{c.id.slice(0,8)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stage 1 咨询费 */}
                    <td className="px-8 py-6">
                      {c.stage1_paid ? (
                        <div className="inline-flex items-center text-green-600 font-black text-xs uppercase tracking-tighter">
                          <CheckCircle size={14} className="mr-1" /> Paid
                        </div>
                      ) : (
                        <button 
                          onClick={() => adminAction('confirm-stage1', { caseId: c.id })}
                          className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all uppercase"
                        >
                          Confirm $30
                        </button>
                      )}
                    </td>

                    {/* Stage 2 挂号托管费 */}
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className={`text-[10px] font-black uppercase tracking-tighter w-fit px-2 py-0.5 rounded ${
                          c.stage2_status === 'authorized' ? 'bg-amber-100 text-amber-600' :
                          c.stage2_status === 'captured' ? 'bg-green-100 text-green-600' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {c.stage2_status}
                        </div>
                        {c.stage1_paid && c.stage2_status === 'not_started' && (
                           <button 
                            onClick={() => {
                              const pid = window.prompt("Enter PayPal Auth ID from Merchant Dashboard:");
                              if(pid) adminAction('confirm-stage2', { caseId: c.id, paypalAuthId: pid });
                            }}
                            className="text-[9px] font-bold text-amber-600 underline decoration-2 underline-offset-2 hover:text-amber-700"
                           >
                            Confirm $100 Auth
                           </button>
                        )}
                      </div>
                    </td>

                    {/* Stage 3 陪诊服务 */}
                    <td className="px-8 py-6">
                       {c.companion_request ? (
                         <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
                            <p className="text-[10px] font-bold text-slate-700">📞 {c.companion_request.contact}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black">
                               {c.companion_request.duration === 'morning' ? 'Morning' : 'Full Day'} | {c.companion_request.gender}
                            </p>
                            {c.stage3_status === 'paid' ? (
                               <span className="text-[9px] font-black text-green-600 uppercase">Paid ✅</span>
                            ) : (
                               <button onClick={() => adminAction('confirm-stage3', { caseId: c.id })} className="text-[9px] font-black text-purple-600 underline">Confirm S3 Pay</button>
                            )}
                         </div>
                       ) : <span className="text-xs text-slate-300 italic">No Request</span>}
                    </td>

                    {/* 管理操作：最终执行 */}
                    <td className="px-8 py-6 text-right">
                       {c.stage2_status === 'authorized' ? (
                         <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => adminAction('capture-stage2', { caseId: c.id })}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-green-700 shadow-lg shadow-green-100"
                            >
                              Capture (Done)
                            </button>
                            <button 
                              onClick={() => adminAction('void-stage2', { caseId: c.id })}
                              className="bg-white border-2 border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all"
                            >
                              Refund
                            </button>
                         </div>
                       ) : (
                         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                            {c.stage2_status === 'captured' ? 'Completed' : 'Wait S2 Auth'}
                         </span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- 第二部分：基础数据管理 (城市 & 医院) --- */}
        <div className="grid md:grid-cols-2 gap-8">
           {/* 添加城市 */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                 <MapPin className="text-blue-600 mr-2" /> Add Coverage City
              </h3>
              <div className="flex space-x-3">
                 <input 
                    className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                    placeholder="e.g. Heihe / Hainan"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                 />
                 <button onClick={handleAddCity} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase">Save</button>
              </div>
           </div>

           {/* 添加医院 */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                 <Hospital className="text-blue-600 mr-2" /> Add Hospital to City
              </h3>
              <div className="space-y-3">
                 <select 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                    value={selectedCityForHosp}
                    onChange={(e) => setSelectedCityForHosp(e.target.value)}
                 >
                    {hospitalMeta && Object.keys(hospitalMeta).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                 </select>
                 <div className="flex space-x-3">
                    <input 
                        className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                        placeholder="Hospital Name"
                        value={newHospitalName}
                        onChange={(e) => setNewHospitalName(e.target.value)}
                    />
                    <button onClick={handleAddHospital} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase">Add</button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
