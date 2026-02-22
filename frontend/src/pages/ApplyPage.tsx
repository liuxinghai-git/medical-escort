import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { 
  Camera, CheckCircle2, MapPin, Hospital, 
  Stethoscope, Loader2, User, AlertCircle, Info 
} from 'lucide-react';
import { API_BASE_URL } from '../App';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function ApplyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 状态管理
  const [hospitalMeta, setHospitalMeta] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    city: '',
    hospital: '',
    symptoms: ''
  });
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

  // 1. 初始化：获取数据库中的动态城市和医院列表
  useEffect(() => {
    const initData = async () => {
      try {
        // 获取医院元数据
        const res = await fetch(`${API_BASE_URL}/api/meta/hospitals`);
        const data = await res.json();
        setHospitalMeta(data);
        
        const firstCity = Object.keys(data)[0];
        if (firstCity) {
          setForm(prev => ({ 
            ...prev, 
            city: firstCity, 
            hospital: data[firstCity][0] || '' 
          }));
        }

        // 2. 查重：如果该用户已有付过费的活跃订单，直接送去 Dashboard
        if (user?.email) {
          const lookupRes = await fetch(`${API_BASE_URL}/api/cases/lookup/${user.email}`);
          const caseInfo = await lookupRes.json();
          if (caseInfo.found && caseInfo.stage1_paid) {
            navigate(`/dashboard/${caseInfo.id}`);
          }
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setChecking(false);
      }
    };
    initData();
  }, [user, navigate]);

  // 处理城市切换，自动重置该城市下的第一家医院
  const handleCityChange = (city: string) => {
    setForm({ 
      ...form, 
      city, 
      hospital: hospitalMeta[city][0] || '' 
    });
  };

  // 核心：处理申请提交（含照片上传）
  const handleApply = async () => {
    if (!form.name || !form.symptoms || !passportFile) {
      return alert("Please complete all fields and capture your passport photo.");
    }

    setIsUploading(true);
    try {
      // A. 上传护照照片到 Supabase Storage (passports bucket)
      const fileExt = passportFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('passports')
        .upload(filePath, passportFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('passports')
        .getPublicUrl(filePath);

      // B. 调用后端接口创建订单
      const res = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, passport_url: publicUrl })
      });
      const data = await res.json();
      
      if (data.caseId) {
        setCaseId(data.caseId);
      } else {
        throw new Error("Failed to create case");
      }
    } catch (e: any) {
      alert("Submission failed: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (checking || !hospitalMeta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
        <p className="text-slate-500 font-medium">Syncing medical database...</p>
      </div>
    );
  }

  const citiesList = Object.keys(hospitalMeta);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Stethoscope className="mr-3 text-blue-400" />
                  Case Registration
                </h2>
                <p className="text-slate-400 text-xs mt-2 font-black uppercase tracking-widest">
                  Phase 1: Coordination & Assessment
                </p>
              </div>
              <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-600/30">
                Step 1 of 3
              </div>
            </div>
          </div>

          {!caseId ? (
            <div className="p-8 space-y-8">
              {/* 1. 城市选择 (药丸样式) */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-tighter">1. Target City</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {citiesList.map(c => (
                    <button 
                      key={c}
                      onClick={() => handleCityChange(c)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border-2 ${
                        form.city === c 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                        : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <MapPin size={12} className="inline mr-1 mb-0.5" /> {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 医院选择 (动态下拉) */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-tighter">2. Preferred Hospital</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Hospital size={18} />
                  </div>
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 appearance-none font-bold text-slate-700"
                    value={form.hospital}
                    onChange={(e) => setForm({...form, hospital: e.target.value})}
                  >
                    {hospitalMeta[form.city]?.map((h: string) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. 基础信息输入 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Patient Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white transition-all"
                      placeholder="As shown on passport" 
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Medical Symptoms</label>
                  <input 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white transition-all"
                    placeholder="Brief description (e.g. Fever)" 
                    onChange={e => setForm({...form, symptoms: e.target.value})}
                  />
                </div>
              </div>

              {/* 4. 📸 护照拍照区域 */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Official ID Verification</label>
                <label className={`group block border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                  passportFile ? 'border-green-500 bg-green-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                }`}>
                  {passportFile ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-100">
                        <CheckCircle2 size={32} />
                      </div>
                      <span className="text-green-700 font-bold">Passport Captured Successfully</span>
                      <span className="text-xs text-green-600/70 mt-1">Tap to retake</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Camera size={32} />
                      </div>
                      <span className="block text-sm font-bold text-slate-600">Take a photo of your passport information page</span>
                      <span className="text-[10px] text-slate-400 mt-2 block italic">Mandatory for hospital registration in China</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" // 在手机端直接唤起相机
                    className="hidden" 
                    onChange={(e) => setPassportFile(e.target.files?.[0] || null)} 
                  />
                </label>
              </div>

              {/* 提交按钮 */}
              <div className="pt-4">
                <button 
                  onClick={handleApply}
                  disabled={isUploading}
                  className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center justify-center"
                >
                  {isUploading ? <Loader2 className="animate-spin mr-3"/> : null}
                  SUBMIT FOR ASSESSMENT ($30)
                </button>
                <div className="flex items-center justify-center mt-6 text-slate-400 space-x-4">
                   <div className="flex items-center text-[10px] font-bold"><ShieldCheck size={14} className="mr-1 text-green-500"/> SSL SECURE</div>
                   <div className="flex items-center text-[10px] font-bold"><Info size={14} className="mr-1 text-blue-500"/> NON-REFUNDABLE FEE</div>
                </div>
              </div>
            </div>
          ) : (
            /* --- 第二阶段：支付界面 --- */
            <div className="p-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Information Saved!</h3>
              <p className="text-slate-500 mb-10 leading-relaxed max-w-sm mx-auto">
                Your ID and medical request have been securely stored. Please complete the assessment fee to begin coordination.
              </p>
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-slate-400 uppercase">Service Item</span>
                   <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="font-bold text-slate-700 text-sm">Medical Feasibility Report</span>
                   <span className="font-black text-blue-600 text-xl">$30.00</span>
                </div>
              </div>

              <PayPalButtons 
                style={{ layout: "vertical", shape: "pill", label: "pay" }}
                createOrder={(_data, actions) => actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{ 
                    amount: { currency_code: "USD", value: "30.00" }, 
                    custom_id: `${caseId}:stage_1` 
                  }]
                })}
                onApprove={async () => navigate(`/dashboard/${caseId}`)}
              />
              <p className="mt-8 text-[10px] text-slate-400 leading-loose">
                By paying, you agree to our Terms of Service. <br/>
                The Coordination fee covers medical record research and is non-refundable.
              </p>
            </div>
          )}
        </div>

        {/* 底部安全提示 */}
        <div className="mt-8 flex items-start p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <AlertTriangle className="text-blue-600 mr-3 shrink-0" size={20} />
          <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
            <strong>Privacy Notice:</strong> Your passport photo and medical data are encrypted. We only share necessary info with hospital administrators for registration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

// 辅助组件：状态药丸
function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
      active 
        ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
        : 'bg-slate-100 text-slate-400 border-slate-200'
    }`}>
      {label}
    </span>
  );
}
