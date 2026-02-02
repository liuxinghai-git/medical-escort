import React, { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App';

export default function ApplyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', city: 'Shanghai', symptoms: '' });
  const [caseId, setCaseId] = useState<string | null>(null);

  // 1. 先提交表单生成 Case ID
  const createCase = async () => {
    if(!form.email) return alert("Email required");
    const res = await fetch(`${API_BASE_URL}/api/cases`, {
      method: 'POST',
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setCaseId(data.caseId);
    return data.caseId;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Medical Assessment ($30)</h1>
        
        {!caseId ? (
          <div className="space-y-4">
            <input placeholder="Full Name" className="w-full border p-2 rounded" 
              onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Email" type="email" className="w-full border p-2 rounded" 
              onChange={e => setForm({...form, email: e.target.value})} />
            <textarea placeholder="Brief Symptoms" className="w-full border p-2 rounded" 
              onChange={e => setForm({...form, symptoms: e.target.value})} />
            
            <button onClick={createCase} className="w-full bg-blue-600 text-white py-2 rounded font-bold">
              Step 1: Save Info
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 bg-green-50 text-green-700 p-3 rounded text-sm">
              Info Saved! Please pay the assessment fee.
            </div>
            {/* Stage 1: 直接扣款 */}
            <PayPalButtons 
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: { value: "00.00" },
                    custom_id: `${caseId}:stage_1` // 关键：绑定 Case ID
                  }]
                });
              }}
              onApprove={async () => {
                // 支付成功后跳转 Dashboard
                navigate(`/dashboard/${caseId}`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

}
