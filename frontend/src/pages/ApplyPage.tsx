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
    try {
      const res = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setCaseId(data.caseId);
    } catch (e) {
      alert("Error connecting to server. Please check your backend URL.");
    }
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

