//import React, { useState } from 'react';
// ⬇️ 必须在这里显式加上 useEffect
import React, { useState, useEffect } from 'react'; 
// ... 其他 import 保持不变
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Camera, CheckCircle2, MapPin, Hospital, Stethoscope, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../App';
import { cities, hospitalData } from '../data/hospitalData';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function ApplyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true); // 增加一个检查状态
  
  // 表单状态
  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    city: cities[0],
    hospital: hospitalData[cities[0]][0],
    symptoms: ''
  });

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

  const handleCityChange = (city: string) => {
    setForm({ ...form, city, hospital: hospitalData[city][0] });
  };

  const handleApply = async () => {
    if (!form.name || !form.symptoms || !passportFile) {
      return alert("Please complete all fields and upload passport photo.");
    }

    setIsUploading(true);
    try {
      // 1. 上传护照照片
      const fileExt = passportFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('passports')
        .upload(`${user?.id}/${fileName}`, passportFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('passports').getPublicUrl(`${user?.id}/${fileName}`);

      // 2. 创建订单
      const res = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, passport_url: publicUrl })
      });
      const data = await res.json();
      setCaseId(data.caseId);
    } catch (e) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

   useEffect(() => {
    const checkExistingCase = async () => {
      if (!user?.email) return;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/cases/lookup/${user.email}`);
        const caseInfo = await res.json();
        
        // 如果 Stage 1 已经付过钱了，直接送他去 Dashboard，不准他再填一遍表
        if (caseInfo.id && caseInfo.stage1_paid) {
          navigate(`/dashboard/${caseInfo.id}`);
        }
      } catch (e) {
        console.error("Lookup error", e);
      } finally {
        setChecking(false);
      }
    };
    checkExistingCase();
  }, [user, navigate]);
   if (checking) return <div className="p-20 text-center">Checking your records...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <Stethoscope className="mr-3 text-blue-400" />
            Medical Registration
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-wider">Phase 1: Information Gathering</p>
        </div>

        {!caseId ? (
          <div className="p-8 space-y-8">
            {/* 1. 城市选择 - 药丸样式按钮 */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3">Target City</label>
              <div className="flex space-x-3">
                {cities.map(c => (
                  <button 
                    key={c}
                    onClick={() => handleCityChange(c)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${form.city === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                  >
                    <MapPin className="w-4 h-4 inline mr-1"/> {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 医院选择 */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3">Preferred Hospital</label>
              <div className="relative">
                <Hospital className="absolute left-3 top-3.5 w-5 h-5 text-slate-300" />
                <select 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 appearance-none font-medium"
                  value={form.hospital}
                  onChange={(e) => setForm({...form, hospital: e.target.value})}
                >
                  {hospitalData[form.city].map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>

            {/* 3. 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Patient Full Name</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="As per passport" 
                    onChange={e => setForm({...form, name: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Current Symptoms</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Brief description" 
                    onChange={e => setForm({...form, symptoms: e.target.value})} />
               </div>
            </div>

            {/* 4. 护照拍照 */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase">Passport Info Page</label>
              <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${passportFile ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                {passportFile ? (
                  <div className="text-green-600 font-bold flex items-center justify-center">
                    <CheckCircle2 className="mr-2" /> Photo Ready
                  </div>
                ) : (
                  <>
                    <Camera className="mx-auto w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-sm font-bold text-slate-500">Tap to take a photo of your passport</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="hidden" 
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <button 
              onClick={handleApply}
              disabled={isUploading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {isUploading ? <Loader2 className="animate-spin mr-2"/> : null}
              PROCEED TO ASSESSMENT ($30)
            </button>
          </div>
        ) : (
          <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Registration Saved!</h3>
            <p className="text-slate-500 mb-8">Please complete the initial service fee payment to start the process.</p>
            <PayPalButtons 
              createOrder={(data, actions) => actions.order.create({
                intent: "CAPTURE",
                purchase_units: [{ amount: { currency_code: "USD", value: "30.00" }, custom_id: `${caseId}:stage_1` }]
              })}
              onApprove={async () => navigate(`/dashboard/${caseId}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
