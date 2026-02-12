import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { AlertTriangle, CheckCircle, Lock, Loader2, Phone, User, Clock } from 'lucide-react';
import { API_BASE_URL } from '../App';

export default function DashboardPage() {
  const { id } = useParams();
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const [caseData, setCaseData] = useState<any>(null);
  
  // Stage 3 表单状态
  const [showPayStep3, setShowPayStep3] = useState(false);
  const [compForm, setCompForm] = useState({ contact: '', gender: 'No Preference', duration: 'morning' });

  const getS3Price = () => compForm.duration === 'morning' ? "120.00" : "200.00";

  // 1. 核心：根据订单状态动态切换 PayPal Intent
  useEffect(() => {
    if (!caseData) return;
    const desiredIntent = (caseData.stage2_status === 'not_started') ? "authorize" : "capture";
    if (options.intent !== desiredIntent) {
      dispatch({ type: "resetOptions", value: { ...options, intent: desiredIntent } });
    }
  }, [caseData?.stage2_status]);

  const fetchCase = async () => {
    const res = await fetch(`${API_BASE_URL}/api/cases/${id}`);
    const data = await res.json();
    setCaseData(data);
  };

  useEffect(() => { fetchCase(); }, [id]);

  if (!caseData) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header 进度条 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold mb-4">Case Status</h1>
          <div className="flex gap-2">
            <Badge active={caseData.stage1_paid} label="Coordination" />
            <Badge active={caseData.stage2_status === 'authorized' || caseData.stage2_status === 'captured'} label="Escrow" />
            <Badge active={caseData.stage3_status === 'paid'} label="Companion" />
          </div>
        </div>

        {/* Stage 2: 保证金托管 */}
        {caseData.stage1_paid && caseData.stage2_status === 'not_started' && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-500">
            <div className="flex items-center mb-4 text-blue-800 font-bold"><Lock className="mr-2"/>Stage 2: Escrow Deposit ($100)</div>
            <p className="text-sm text-slate-600 mb-6">Funds are held by PayPal and only released if booking is successful.</p>
            {isPending ? <Loader2 className="animate-spin mx-auto"/> : (
              <PayPalButtons 
                style={{ layout: "vertical" }}
                createOrder={(_, actions) => actions.order.create({
                  intent: "AUTHORIZE",
                  purchase_units: [{ amount: { currency_code: "USD", value: "100.00" }, custom_id: `${id}:stage_2` }]
                })}
                onApprove={async (_, actions) => {
                  await actions.order?.authorize();
                  alert("Secured!"); fetchCase();
                }}
              />
            )}
          </div>
        )}

        {/* Stage 3: 陪诊服务表单 */}
        {(caseData.stage2_status === 'authorized' || caseData.stage2_status === 'captured') && caseData.stage3_status !== 'paid' && (
          <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
            <h3 className="font-bold text-amber-900 flex items-center mb-4"><AlertTriangle className="mr-2"/> Step 3: Medical Companion</h3>
            {!showPayStep3 ? (
              <div className="bg-white p-5 rounded-lg space-y-4 shadow-sm">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Contact (WeChat/WhatsApp)</label>
                  <input className="w-full border p-2 rounded mt-1" onChange={e => setCompForm({...compForm, contact: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="border p-2 rounded" onChange={e => setCompForm({...compForm, gender: e.target.value})}>
                    <option>No Preference</option><option>Female</option><option>Male</option>
                  </select>
                  <select className="border p-2 rounded" onChange={e => setCompForm({...compForm, duration: e.target.value})}>
                    <option value="morning">Morning ($120)</option>
                    <option value="full_day">Full Day ($200)</option>
                  </select>
                </div>
                <button className="w-full bg-amber-600 text-white py-3 rounded font-bold" 
                  onClick={() => compForm.contact ? setShowPayStep3(true) : alert("Need Contact")}>
                  Next: Pay ${getS3Price()}
                </button>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-green-300">
                <div className="flex justify-between mb-4">
                  <button onClick={()=>setShowPayStep3(false)} className="text-blue-600 text-xs underline">← Edit</button>
                  <span className="font-bold text-blue-700">Total: ${getS3Price()}</span>
                </div>
                <PayPalButtons 
                  createOrder={(_, actions) => actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [{ amount: { currency_code: "USD", value: getS3Price() }, custom_id: `${id}:stage_3` }]
                  })}
                  onApprove={async (_, actions) => {
                    await actions.order?.capture();
                    await fetch(`${API_BASE_URL}/api/cases/${id}/companion-details`, {
                      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(compForm)
                    });
                    alert("Booked!"); fetchCase();
                  }}
                />
              </div>
            )}
          </div>
        )}

        {caseData.stage3_status === 'paid' && (
          <div className="bg-green-100 p-6 rounded-xl text-green-800 font-bold flex items-center">
            <CheckCircle className="mr-4"/> All Services Confirmed! We will contact you shortly.
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`px-4 py-1 rounded-full text-xs font-bold border ${active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
      {label}
    </span>
  );
}
