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

  // 状态管理
  const [cases, setCases] = useState<any[]>([]);
  const [hospitalMeta, setHospitalMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVoucherModal, setShowVoucherModal] = useState(false); // 确保这行存在
  const[currentOrderId, setCurrentOrderId] = useState<string | null>(null); 
  const [voucherForm, setVoucherForm] = useState({ voucher_id: '', image_url: '' });

  // 元数据管理状态
  const [newCity, setNewCity] = useState('');
  const [selectedCityForHosp, setSelectedCityForHosp] = useState('');
  const [newHospitalName, setNewHospitalName] = useState('');

  // 👇 补上这个方法
 const openVoucherModal = (id: string) => {
  setCurrentOrderId(id); // 1. 记住当前点击的订单 ID
  setVoucherForm({ voucher_id: '', image_url: '' }); // 2. 清空表单（防止看到上一个人的数据）
  setShowVoucherModal(true); // 3. 打开弹窗
};

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

  const submitVoucher = async () => {
    try {
        // 这里的 endpoint 必须对应你后端那个能将状态改为 'confirmed' 的接口
        const res = await fetch(`${API_BASE_URL}/api/admin/cases/${currentOrderId}/finalize-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherForm) // 包含 voucher_id 和 image_url
        });

        if (!res.ok) throw new Error("Update failed");

        alert("Success! Status updated to confirmed.");
        setShowVoucherModal(false);
        setVoucherForm({ voucher_id: '', image_url: '' });
        fetchData(); // 刷新列表，此时按钮会自动消失，变成“已完成挂号”的绿字
    } catch (e) {
        alert("Update failed");
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
  };

  // 在 AdminPage.tsx 中，给每个订单增加一个“更新凭证”功能
const updateVoucher = async (caseId: string) => {
  const voucher_id = prompt("Enter Voucher ID:");
  const image_url = prompt("Enter Voucher Image URL:");

  await fetch(`${API_BASE_URL}/api/admin/cases/${caseId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voucher_id, image_url })
  });
  alert("Voucher updated!");
};

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
                        <div className={`text-[10px] font-black uppercase tracking-tighter w-fit px-2 py-1 rounded ${
                          c.stage2_status === 'paid' ? 'bg-amber-100 text-amber-600' :
                          c.stage2_status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {c.stage2_status || 'not_started'}
                        </div>
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
                            ): (
                               <button onClick={() => adminAction('confirm-stage3', { caseId: c.id })} className="text-[9px] font-black text-purple-600 underline">Confirm S3 Pay</button>
                            )}
                         </div>
                       ) : <span className="text-xs text-slate-300 italic">No Request</span>}
                    </td>

                    {/* 在你的 AdminPage.tsx 的表格渲染中 */}
                    <td className="px-8 py-6 text-right">
                      {/* 状态 A: 用户刚付完 $100，显示“录入挂号凭证”按钮 */}
                      {c.stage2_status === 'paid' && (
                        <button 
                          onClick={() => openVoucherModal(c.id)} // 触发你之前写的弹窗
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-green-700 shadow-lg"
                        >
                          录入挂号凭证
                        </button>
                      )}

                      {/* 状态 B: 凭证已录入，显示“已挂号”标签 */}
                      {c.stage2_status === 'confirmed' && (
                        <span className="text-emerald-600 font-black text-xs uppercase bg-emerald-50 px-3 py-1 rounded-full">
                          已完成挂号
                        </span>
                      )}
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

      {showVoucherModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
          <h3 className="text-xl font-black mb-6">录入挂号信息</h3>
          <input 
            value={voucherForm.voucher_id}
            onChange={(e) => setVoucherForm({...voucherForm, voucher_id: e.target.value})}
            placeholder="Voucher ID (挂号凭证号)" 
            className="w-full border-2 p-3 rounded-xl mb-3 outline-none" 
          />
          {/* 替换掉原来的 Image URL 输入框 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Upload Voucher Image (upload image)
            </label>
            
            {voucherForm.image_url ? (
              <div className="relative w-full h-40 mb-3 border-2 border-gray-200 rounded-xl overflow-hidden">
                <img 
                  src={voucherForm.image_url} 
                  alt="Voucher Preview" 
                  className="w-full h-full object-contain"
                />
                <button 
                  onClick={() => setVoucherForm({...voucherForm, image_url: ''})}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg text-xs"
                >
                  delete
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    setVoucherForm({ ...voucherForm, image_url: previewUrl });
                  }
                }}
                className="w-full border-2 p-2 rounded-xl outline-none text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>
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
