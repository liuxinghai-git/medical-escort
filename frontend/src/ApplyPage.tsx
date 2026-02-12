import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { API_BASE_URL } from '../App';
import { cities, hospitalData } from '../data/hospitalData';
import { useAuth } from '../AuthContext';

interface FormState {
  name: string;
  email: string;
  city: string;
  hospital: string; // 新增
  symptoms: string;
}

export default function ApplyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: user?.email || '', // 默认使用登录邮箱
    city: cities[0],
    hospital: hospitalData[cities[0]][0],
    symptoms: ''
  });
  const [caseId, setCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // 1. 先提交表单生成 Case ID
  const createCase = async () => {
    if (!form.name || !form.email || !form.symptoms || !form.hospital) {
        setError("Please fill in all required fields and select a hospital.");
        return;
    }
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCaseId(data.caseId);
    } catch (e: any) {
      setError(`Server Error: ${e.message}`);
    }
  };

  // ... (其余代码与之前保持一致，但注意使用新的 form.hospital 字段)

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-8 text-blue-600 text-center">Medical Assessment ($30)</h1>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

        {!caseId ? (
          <div className="space-y-5">
            {/* ... Name, Email 字段 ... */}
            
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

            {/* ... Symptoms 字段 ... */}

            <button onClick={createCase} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Step 1: Save Info & Proceed to Payment
            </button>
          </div>
        ) : (
          // ... 支付按钮 (Stage 1) ...
          <div className="text-center">
            <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                Info Saved! Case ID: {caseId}. Please pay the assessment fee below.
            </div>
            <PayPalButtons 
                // ... 支付逻辑与之前 Stage 1 保持一致 ...
            />
          </div>
        )}
      </div>
    </div>
  );
}