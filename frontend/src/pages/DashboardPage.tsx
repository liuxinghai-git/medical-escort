import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { 
  CheckCircle2, Clock, ShieldCheck, AlertCircle, 
  MapPin, Hospital, User, FileText, ExternalLink, Loader2 
} from 'lucide-react';
import { API_BASE_URL } from '../App';

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const [caseData, setCaseData] = useState<any>(null);
  
  // Stage 3 表单状态
  const [showPayStep3, setShowPayStep3] = useState(false);
  const [compForm, setCompForm] = useState({ contact: '', gender: 'No Preference', duration: 'morning' });

  const getS3Price = () => compForm.duration === 'morning' ? "120.00" : "200.00";

  useEffect(() => {
    if (!caseData) return;
    const desiredIntent = (caseData.stage2_status === 'not_started') ? "authorize" : "capture";
    if (options.intent !== desiredIntent) {
      dispatch({ type: "resetOptions", value: { ...options, intent: desiredIntent } });
    }
  }, [caseData?.stage2_status]);

  const fetchCase = async () => {
    const res = await fetch(`${API_BASE_URL}/api/cases/${id}`);
    if (res.status === 404) return navigate('/');
    const data = await res.json();
    setCaseData(data);
  };

  useEffect(() => { fetchCase(); }, [id]);

  if (!caseData) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
      <p className="text-slate-500 font-medium">Synchronizing Case Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 顶部状态条 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center">
              Case Dashboard <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded uppercase tracking-wider">Active</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Order ID: {id}</p>
          </div>
          <div className="flex items-center space-x-2">
             <div className={`h-2 w-2 rounded-full animate-pulse ${caseData.stage3_status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
             <span className="text-sm font-bold text-slate-600">
               Current Status: {caseData.stage2_status === 'captured' ? 'Booking Confirmed' : 'In Progress'}
             </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-8">
        
        {/* 左侧：Case 详情卡片 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
               <span className="text-sm font-bold flex items-center"><FileText className="w-4 h-4 mr-2"/> Case Information</span>
               <span className="text-xs opacity-60">Submitted {new Date(caseData.created_at).toLocaleDateString()}</span>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <DetailItem icon={<User/>} label="Patient Name" value={caseData.patient_name} />
                  <DetailItem icon={<MapPin/>} label="City" value={caseData.target_city} />
                  <DetailItem icon={<Hospital/>} label="Preferred Hospital" value={caseData.target_hospital} />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                    <p className="font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest">Medical Symptoms</p>
                    <p className="text-slate-700 leading-relaxed">{caseData.symptoms}</p>
                  </div>
                  {caseData.passport_url && (
                    <a href={caseData.passport_url} target="_blank" className="flex items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-2xl text-blue-600 hover:bg-blue-50 transition-colors group">
                       <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold uppercase tracking-tight">View Passport Image</span>
                       <ExternalLink className="w-3 h-3 ml-2 opacity-40" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 进度追踪器 (Stepper) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
             <h3 className="font-bold text-slate-800 mb-8">Process Tracker</h3>
             <div className="space-y-8">
                <Step status={caseData.stage1_paid ? 'done' : 'current'} title="Phase 1: Coordination" desc="Medical research & hospital eligibility verification." />
                <Step status={caseData.stage2_status === 'captured' ? 'done' : (caseData.stage1_paid ? 'current' : 'pending')} title="Phase 2: Slot Booking" desc="Escrow-protected specialist registration." />
                <Step status={caseData.stage3_status === 'paid' ? 'done' : (caseData.stage2_status === 'captured' ? 'current' : 'pending')} title="Phase 3: Companion" desc="On-site guidance and native translation support." />
             </div>
          </div>
        </div>

        {/* 右侧：操作区 (支付 & 帮助) */}
        <div className="space-y-6">
          {/* 动态支付卡片 */}
          {caseData.stage1_paid && caseData.stage2_status === 'not_started' && (
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
               <ShieldCheck className="absolute top-4 right-4 opacity-10 w-24 h-24 rotate-12" />
               <h3 className="text-xl font-bold mb-2">Secure Your Slot</h3>
               <p className="text-blue-100 text-sm mb-6">Feasibility verified! Deposit $100 to start the booking process.</p>
               <div className="bg-white rounded-2xl p-4 mb-4 text-slate-900 text-center">
                  <span className="text-xs text-slate-400 block font-bold uppercase">Escrow Deposit</span>
                  <span className="text-3xl font-black">$100.00</span>
               </div>
               {isPending ? <Loader2 className="animate-spin mx-auto mt-4" /> : (
                 <PayPalButtons 
                   style={{ layout: "vertical", height: 45 }}
                   createOrder={(_, actions) => actions.order.create({
                     intent: "AUTHORIZE",
                     purchase_units: [{ amount: { currency_code: "USD", value: "100.00" }, custom_id: `${id}:stage_2` }]
                   })}
                   onApprove={async (_, actions) => {
                     await actions.order?.authorize();
                     alert("Deposit Secured!"); fetchCase();
                   }}
                 />
               )}
            </div>
          )}

          {/* 陪诊服务入口 */}
          {(caseData.stage2_status === 'authorized' || caseData.stage2_status === 'captured') && caseData.stage3_status !== 'paid' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-lg shadow-amber-50 relative">
               <span className="absolute -top-3 left-6 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded">UPGRADE RECOMMENDED</span>
               <h3 className="text-lg font-bold text-slate-800 mb-2">Bilingual Companion</h3>
               {!showPayStep3 ? (
                 <div className="space-y-3 mt-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase">Service Plan</label>
                       <select className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-sm" onChange={e => setCompForm({...compForm, duration: e.target.value})}>
                          <option value="morning">Morning Only ($120)</option>
                          <option value="full_day">Full Day ($200)</option>
                       </select>
                    </div>
                    <input className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-sm" placeholder="WeChat/WhatsApp ID" onChange={e => setCompForm({...compForm, contact: e.target.value})} />
                    <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold mt-2" onClick={() => compForm.contact ? setShowPayStep3(true) : alert("Please enter contact info")}>
                       Confirm & Pay ${getS3Price()}
                    </button>
                 </div>
               ) : (
                 <div className="mt-4 animate-in slide-in-from-right">
                    <button onClick={()=>setShowPayStep3(false)} className="text-xs text-slate-400 mb-4 underline">← Change plan</button>
                    <PayPalButtons 
                      style={{ height: 45 }}
                      createOrder={(_, actions) => actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{ amount: { currency_code: "USD", value: getS3Price() }, custom_id: `${id}:stage_3` }]
                      })}
                      onApprove={async (_, actions) => {
                        await actions.order?.capture();
                        await fetch(`${API_BASE_URL}/api/cases/${id}/companion-details`, {
                          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(compForm)
                        });
                        alert("Service Booked!"); fetchCase();
                      }}
                    />
                 </div>
               )}
            </div>
          )}

          {/* 帮助中心卡片 */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
             <h4 className="font-bold text-slate-800 text-sm mb-3">Support Center</h4>
             <p className="text-xs text-slate-500 mb-4 leading-relaxed">Having issues with your booking or payment? Our coordinator is online 24/7.</p>
             <button className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors">
                Message Us via WeChat
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- 辅助小组件 ---

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1 text-slate-400">{React.cloneElement(icon, { size: 16 })}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function Step({ status, title, desc }: { status: 'done' | 'current' | 'pending', title: string, desc: string }) {
  const styles = {
    done: { icon: <CheckCircle2 className="text-green-500"/>, text: 'text-slate-800', border: 'border-green-500' },
    current: { icon: <Clock className="text-blue-500"/>, text: 'text-slate-800', border: 'border-blue-500' },
    pending: { icon: <div className="h-5 w-5 rounded-full border-2 border-slate-200"/>, text: 'text-slate-300', border: 'border-slate-200' }
  };
  
  return (
    <div className="flex items-start space-x-4">
      <div className="mt-1">{styles[status].icon}</div>
      <div className={`pb-8 border-l-2 ml-2.5 px-6 -mt-1 ${styles[status].border} last:border-transparent`}>
         <h4 className={`text-sm font-bold -mt-1 ${styles[status].text}`}>{title}</h4>
         <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all ${
      active ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100'
    }`}>
      {label}
    </span>
  );
}
