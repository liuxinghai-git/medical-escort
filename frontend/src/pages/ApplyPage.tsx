//import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App';
import { cities, hospitalData } from '../data/hospitalData';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient'; // 确保引入了 supabase 客户端
import { Camera, Upload, Loader2 } from 'lucide-react';

export default function ApplyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: user?.email || '', city: cities[0], hospital: hospitalData[cities[0]][0], symptoms: '' });
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

    useEffect(() => {
    if (user && !form.email) {
        setForm(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);
  
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setForm(prev => ({
      ...prev,
      city: newCity,
      hospital: hospitalData[newCity][0] // 城市改变，医院列表重置为第一个
    }));
  };

   // --- 核心上传函数 ---
  const uploadPassport = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('passports')
      .upload(filePath, file);

    if (error) throw error;

    // 获取公开访问链接
    const { data: { publicUrl } } = supabase.storage
      .from('passports')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // 1. 先提交表单生成 Case ID
   const createCase = async () => {
    if (!form.name || !passportFile) return alert("Please fill name and take a photo of your passport");
    
    setUploading(true);
    try {
      // 1. 先上传护照照片
      const passportUrl = await uploadPassport(passportFile);

      // 2. 将 URL 连同表单一起发给后端
      const res = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, passport_url: passportUrl })
      });
      const data = await res.json();
      setCaseId(data.caseId);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Step 1: Registration Info</h1>
        
        {!caseId ? (
          <div className="space-y-4">
            {/* ... 之前的姓名、城市、医院、病情输入框 ... */}
            {/* 城市选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Target City</label>
              <select 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                value={form.city}
                onChange={handleCityChange}
              >
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* 医院选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Hospital</label>
              <select 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                value={form.hospital}
                onChange={e => setForm({...form, hospital: e.target.value})}
              >
                {hospitalData[form.city]?.map(hospital => (
                    <option key={hospital} value={hospital}>{hospital}</option>
                ))}
              </select>
            </div>
             <input placeholder="Full Name" className="w-full border p-2 rounded" 
              onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Email" type="email" className="w-full border p-2 rounded" 
              onChange={e => setForm({...form, email: e.target.value})} />
            <textarea placeholder="Brief Symptoms" className="w-full border p-2 rounded" 
              onChange={e => setForm({...form, symptoms: e.target.value})} />
            
            {/* 📸 护照上传组件 */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <label className="cursor-pointer block">
                {passportFile ? (
                  <div className="space-y-2">
                    <img src={URL.createObjectURL(passportFile)} className="h-32 mx-auto rounded shadow" alt="Passport Preview" />
                    <p className="text-sm text-green-600 font-bold">Passport Photo Captured!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-12 h-12 mx-auto text-slate-400" />
                    <p className="text-sm font-medium text-slate-600">Take a Photo of Passport Information Page</p>
                    <p className="text-xs text-slate-400">Required for hospital registration</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" // 🚨 关键：在手机上直接唤起相机
                  className="hidden" 
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button 
              onClick={createCase} 
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex justify-center items-center"
            >
              {uploading ? <Loader2 className="animate-spin mr-2" /> : null}
              Submit Assessment ($30)
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
              Info & Passport saved. Final step: Pay the assessment fee.
            </div>
            {/* Stage 1: 直接扣款 */}
            <PayPalButtons 
              createOrder={(_data: any, actions: any) => {
                return actions.order.create({
                  intent: "CAPTURE", // 明确告诉 PayPal 我们要扣款
                  purchase_units: [{
                    amount: { 
                      currency_code: "USD",
                      value: "30.00" 
                    },
                    custom_id: `${caseId}:stage_1`
                  }]
                });
              }}
              onApprove={async (_data: any, actions: any) => {
                // 关键修复：加上这行代码，钱才会真的划走！ 
                try {
                   await actions.order.capture();
                   // 扣款成功后，才跳转
                   navigate(`/dashboard/${caseId}`);
                } catch (error) {
                   console.error("Capture failed:", error);
                   alert("Payment failed, please try again.");
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}




