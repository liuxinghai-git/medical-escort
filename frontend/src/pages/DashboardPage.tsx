import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { 
  CheckCircle2, Clock, ShieldCheck, AlertCircle, 
  MapPin, Hospital, User, FileText, 
  Loader2, X, MessageCircle, Phone, Globe 
} from 'lucide-react';
// ⚠️ 确保这个路径正确，指向你的 App.tsx 或 config 文件
import { API_BASE_URL } from '../App';

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 1. 去掉 dispatch，我们不再动态切换脚本，直接在 index.html 或 App.tsx 里配置好 capture 模式
  // const [{ options, isPending }, dispatch] = usePayPalScriptReducer(); 
  const [caseData, setCaseData] = useState<any>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  const [showPayStep3, setShowPayStep3] = useState(false);
  const [compForm, setCompForm] = useState({ contact: '', gender: 'No Preference', duration: 'morning' });

  const getS3Price = () => compForm.duration === 'morning' ? "120.00" : "200.00";

  const fetchCase = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cases/${id}`);
      if (res.status === 404) return navigate('/');
      const data = await res.json();
      setCaseData(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => { fetchCase(); }, [id]);

  if (!caseData) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
    </div>
  );

  // 判断 Stage 2 是否已完成 (paid 或 captured 都算完成)
  const isStage2Paid = caseData.stage2_status === 'paid' || caseData.stage2_status === 'captured';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 md:pt-28 pb-20">
      
      {/* 顶部状态面包屑 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Medical Case Overview</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Ref ID: {id}</p>
          </div>
          <Badge 
            active={isStage2Paid} 
            label={isStage2Paid ? "Registration In Progress" : "Action Required"} 
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
        
        {/* 左侧主要内容 */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. 信息卡片 */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
               <span className="text-sm font-bold flex items-center tracking-wide">
                 <FileText className="w-4 h-4 mr-2 text-blue-400"/> REGISTERED INFORMATION
               </span>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <DetailItem icon={<User/>} label="Patient Name" value={caseData.patient_name} />
                <DetailItem icon={<MapPin/>} label="Target City" value={caseData.target_city} />
                <DetailItem icon={<Hospital/>} label="Medical Center" value={caseData.target_hospital} />
              </div>
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Symptoms</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{caseData.symptoms}</p>
                </div>
                {caseData.passport_url && (
                  <a href={caseData.passport_url} target="_blank" rel="noreferrer" 
                     className="flex items-center justify-center p-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 hover:bg-blue-50 transition-all font-bold text-xs uppercase tracking-tighter">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Verify Passport Attachment
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 2. 进度可视化 */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
             <h3 className="font-bold text-slate-800 mb-8 text-lg flex items-center">
               <Globe className="w-5 h-5 mr-2 text-blue-500"/> Service Timeline
             </h3>
             <div className="space-y-0">
                <Step status={caseData.stage1_paid ? 'done' : 'current'} title="Phase 1: Coordination" desc="Specialist matching & medical translation." />
                
                {/* 状态逻辑：如果S2已付，则显示done，否则如果S1已付显示current */}
                <Step 
                  status={isStage2Paid ? 'done' : (caseData.stage1_paid ? 'current' : 'pending')} 
                  title="Phase 2: Slot Booking (Escrow)" 
                  desc="Registration securing via hospital internal systems." 
                />
                
                <Step 
                  status={caseData.stage3_status === 'paid' ? 'done' : (isStage2Paid ? 'current' : 'pending')} 
                  title="Phase 3: Medical Companion" 
                  desc="On-site guidance & professional translation." 
                />
             </div>
          </div>
        </div>

        {/* 右侧操作栏 */}
        <div className="space-y-6">
          
          {/* ========================================================= */}
          {/* ✅ Stage 2: Escrow Payment (包含状态切换逻辑)             */}
          {/* ========================================================= */}
          {caseData.stage1_paid && (
            <div className="relative transition-all duration-500">
              {isStage2Paid ? (
                // 🔵 状态 B：已支付 (Paid) -> 显示“正在处理”
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white text-center shadow-xl flex flex-col justify-center items-center animate-in fade-in zoom-in border border-blue-500/30 min-h-[400px]">
                  
                  {/* 动态图标 */}
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
                    <Loader2 className="w-10 h-10 text-white animate-spin-slow" /> 
                  </div>

                  <h3 className="text-2xl font-black mb-4 tracking-tight">Registration in Progress</h3>
                  
                  <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/10 w-full">
                    <p className="text-sm font-medium text-blue-100 leading-relaxed">
                      Your <strong className="text-white">$100.00</strong> deposit has been verified. 
                    </p>
                  </div>

                  <p className="text-sm text-blue-200 mb-8 max-w-xs mx-auto leading-relaxed">
                    Our team is currently finalizing the booking with <strong>{caseData.target_hospital}</strong>. 
                    <br/><br/>
                    Please wait for the notification to proceed to <strong>Phase 3 (Companion)</strong>.
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-300 bg-blue-900/40 px-4 py-2 rounded-full">
                    <ShieldCheck size={14} />
                    <span>Funds Held in Escrow</span>
                  </div>
                </div>
              ) : (
                // 🔘 状态 A：未支付 -> 显示 PayPal 按钮
                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                   <ShieldCheck className="mb-4 w-10 h-10 text-blue-200" />
                   <h3 className="text-xl font-bold mb-2">Stage 2: Escrow Payment</h3>
                   <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                     We've verified your request. Deposit $100 to start the actual hospital registration.
                   </p>
                   <div className="bg-white rounded-2xl p-4 mb-6 text-slate-900 text-center shadow-inner">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Held securely by PayPal</span>
                      <span className="text-3xl font-black">$100.00</span>
                   </div>
                   
                   {/* PayPal 按钮 - 强制使用 CAPTURE 模式 */}
                   <PayPalButtons 
                     style={{ layout: "vertical", height: 48 }}
                     createOrder={(_, actions) => actions.order.create({
                       intent: "CAPTURE", // ✅ 强制使用 Capture 模式
                       purchase_units: [{ 
                          amount: { currency_code: "USD", value: "100.00" }, 
                          custom_id: `${id}:stage_2`,
                          description: "Escrow Deposit for Medical Appointment"
                       }]
                     })}
                     onApprove={async (_, actions) => {
                       // 1. 捕获资金
                       await actions.order?.capture();
                       
                       // 2. 调用后端更新数据库 (确保这一步执行)
                       try {
                         await fetch(`${API_BASE_URL}/api/cases/${id}/stage2-complete`, { method: 'POST' });
                       } catch (err) {
                         console.error("Backend update failed", err);
                       }

                       // 3. 🚀 关键：立即更新本地 UI，无需刷新页面
                       setCaseData((prev: any) => ({ ...prev, stage2_status: 'paid' }));
                       
                       alert("Deposit Received! We are processing your booking."); 
                     }}
                   />
                   
                   <p className="mt-4 text-center text-[10px] text-blue-200/60 uppercase tracking-widest">
                     100% Refundable if booking fails
                   </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ✅ Stage 3: Medical Companion (S2 付完款后出现)             */}
          {/* ========================================================= */}
          {isStage2Paid && caseData.stage3_status !== 'paid' && (
            <div className="bg-white rounded-3xl p-7 border-2 border-amber-200 shadow-xl shadow-amber-50 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center space-x-2 text-amber-600 mb-4 font-black text-xs uppercase tracking-widest">
                  <AlertCircle size={14}/> <span>Optional Service</span>
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-4">Phase 3: Medical Companion</h3>
               <p className="text-sm text-slate-500 mb-6">Need a translator on-site? Book a professional companion.</p>
               
               {!showPayStep3 ? (
                 <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contact Method</label>
                        <input className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="WhatsApp / WeChat ID" onChange={e => setCompForm({...compForm, contact: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Service Duration</label>
                        <select className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl text-sm mt-1 outline-none" onChange={e => setCompForm({...compForm, duration: e.target.value})}>
                            <option value="morning">Half Day (Morning) - $120</option>
                            <option value="full_day">Full Day (All-inclusive) - $200</option>
                        </select>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all" 
                      onClick={() => compForm.contact ? setShowPayStep3(true) : alert("Please provide contact info")}>
                      Proceed to Pay ${getS3Price()}
                    </button>
                 </div>
               ) : (
                 <div className="animate-in slide-in-from-right duration-300">
                    <button onClick={()=>setShowPayStep3(false)} className="text-xs text-slate-400 mb-4 flex items-center hover:text-blue-600">
                      <Clock size={12} className="mr-1"/> Edit plan
                    </button>
                    <PayPalButtons 
                      style={{ height: 48 }}
                      createOrder={(_, actions) => actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{ 
                           amount: { currency_code: "USD", value: getS3Price() }, 
                           custom_id: `${id}:stage_3`,
                           description: `Medical Companion - ${compForm.duration}`
                        }]
                      })}
                      onApprove={async (_, actions) => {
                        await actions.order?.capture();
                        await fetch(`${API_BASE_URL}/api/cases/${id}/companion-details`, {
                            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(compForm)
                        });
                        // 刷新页面状态
                        fetchCase();
                        alert("Service Confirmed! We will contact you shortly.");
                      }}
                    />
                 </div>
               )}
            </div>
          )}

          {/* 🌐 联系方式 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <h4 className="font-bold text-slate-800 mb-2">Patient Support</h4>
             <p className="text-xs text-slate-500 mb-6 leading-relaxed">Questions about your hospital visit? Our global team is here to help.</p>
             
             <div className="space-y-3">
                <a 
                  href="https://wa.me/15241189220" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-[#25D366] text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center shadow-md shadow-green-50"
                >
                  <Phone className="w-4 h-4 mr-2" /> WhatsApp Us
                </a>

                <button 
                  onClick={() => setIsSupportOpen(true)}
                  className="w-full bg-[#07C160] text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center shadow-md shadow-green-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> WeChat Support
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* 📸 WeChat Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center relative shadow-2xl">
            <button onClick={() => setIsSupportOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 font-black text-2xl">CM</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Concierge Chat</h3>
            <p className="text-sm text-slate-500 mb-8">Scan the QR code below to connect with your personal coordinator on WeChat.</p>
            <div className="bg-slate-50 p-6 rounded-[32px] mb-8 border border-slate-100 shadow-inner">
                <img src="/wechat_qr.png" alt="WeChat QR" className="w-48 h-48 mx-auto mix-blend-multiply" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 辅助小组件 ---
function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start space-x-4">
      <div className="mt-1 text-blue-500 bg-blue-50 p-2 rounded-xl">{React.cloneElement(icon, { size: 18 })}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value || '---'}</p>
      </div>
    </div>
  );
}

function Step({ status, title, desc }: any) {
  const styles: any = {
    done: { icon: <CheckCircle2 className="text-green-500 w-6 h-6 bg-white"/>, border: 'border-green-500', text: 'text-slate-900', op: 'opacity-100' },
    current: { icon: <Clock className="text-blue-500 w-6 h-6 bg-white animate-pulse"/>, border: 'border-blue-200 border-dashed', text: 'text-slate-900', op: 'opacity-100' },
    pending: { icon: <div className="h-6 w-6 rounded-full border-2 border-slate-100 bg-white"/>, border: 'border-slate-100', text: 'text-slate-300', op: 'opacity-50' }
  };
  return (
    <div className={`flex items-start ${styles[status].op}`}>
      <div className="z-10 -mr-3 translate-y-1">{styles[status].icon}</div>
      <div className={`ml-6 pb-12 border-l-2 pl-10 ${styles[status].border} last:border-transparent`}>
        <h4 className={`text-base font-black ${styles[status].text} leading-none`}>{title}</h4>
        <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Badge({ active, label }: any) {
  return (
    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${
      active ? 'bg-green-500 text-white border-green-600' : 'bg-orange-500 text-white border-orange-600'
    }`}>
      {label}
    </span>
  );
}
