import React, { useState, useEffect } from 'react';
// ✅ 1. 引入你新写的组件
import PricingSection from './PricingSection'; 
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Activity, MapPin, ChevronRight, 
  Globe, CheckCircle2, X, Hospital, Zap, Globe2, Clock,
  Lock, MousePointerClick, FileSearch, UserCheck, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../App';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hospitalMeta, setHospitalMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. 从后端获取城市医院列表
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/meta/hospitals`)
      .then(res => res.json())
      .then(data => {
        setHospitalMeta(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Load cities failed:", err);
        setLoading(false);
      });
  }, []);

  // 城市背景图匹配逻辑
  const getCityImage = (city: string) => {
    const images: { [key: string]: string } = {
      'Shanghai': 'https://images.unsplash.com/photo-1616680687799-ea36d6fb2173?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fCVFNCVCOCU4QSVFNiVCNSVCN3xlbnwwfHwwfHx8MA%3D%3D',
      'Beijing': 'https://images.unsplash.com/photo-1584872589930-e99fe5bf4408?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8JUU1JThDJTk3JUU0JUJBJUFDfGVufDB8fDB8fHww',
      'Guangzhou': 'https://images.unsplash.com/photo-1743362306089-cff00e214ea2?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8JUU1JUI5JUJGJUU1JUI3JTlFfGVufDB8fDB8fHww',
      'Shenzhen': 'https://images.unsplash.com/photo-1608381742187-ea4b48c56630?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8JUU2JUI3JUIxJUU1JTlDJUIzfGVufDB8fDB8fHww',
      'Hangzhou': 'https://plus.unsplash.com/premium_photo-1692673142063-e1184cb78c0e?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8JUU2JTlEJUFEJUU1JUI3JTlFfGVufDB8fDB8fHww',
      'Chengdu': 'https://images.unsplash.com/photo-1722525760755-ddd7145d82d4?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8JUU2JTg4JTkwJUU5JTgzJUJEfGVufDB8fDB8fHww',
      'Chongqing': 'https://images.unsplash.com/photo-1567014688543-cc4abffb061a?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8JUU5JTg3JThEJUU1JUJBJTg2fGVufDB8fDB8fHww',
     // 'Kunming': 'https://images.unsplash.com/photo-1623836506940-1db1f8fbcbcd?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8JUU2JTk4JTg2JUU2JTk4JThFfGVufDB8fDB8fHww',
     // 'Heihe': 'https://images.unsplash.com/photo-1567014688543-cc4abffb061a?fm=jpg&q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8JUU5JTg3JThEJUU1JUJBJTg2fGVufDB8fDB8fHww',
      'Hainan': 'https://media.istockphoto.com/id/2219842386/photo/aerial-photography-of-coastline-in-haitang-bay-sanya-hainan-china-asia.webp?a=1&b=1&s=612x612&w=0&k=20&c=CBCxI4Fin1ymv_YSrFjJ0wOKbQVBT_9Egbupw9PmGF8=',
    };
    return images[city] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800';
  };

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* --- 1. Hero Section --- */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white text-center lg:text-left">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Medical Concierge</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-tight mb-6">
              Access China's <br/>
              <span className="text-blue-600 underline decoration-blue-200">Elite Hospitals</span><br/> 
              Without Stress.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto lg:mx-0">
              Personalized coordination and secure escrow payments for international patients visiting top-tier specialists.
            </p>
            <button 
              onClick={() => navigate('/apply')}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center w-full sm:w-auto"
            >
              Start Booking <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-[10px] border-white hidden lg:block">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Hospital"/>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 mb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              
              {/* 左侧：文字说明 */}
              <div className="flex-[1.2] p-8 md:p-12 bg-gradient-to-br from-white to-slate-50">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-6">
                  <Globe2 size={14} className="animate-spin-slow" /> Global Response Protocol
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                  Synchronized Care, <br />
                  <span className="text-blue-600">Across All Time Zones.</span>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  To ensure elite service for our international patients, our medical coordinators process applications during fixed daily windows. We synchronize with your time zone to provide a seamless consultation experience.
                </p>
                
                <div className="flex items-center gap-6 mt-8">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">24h Max Turnaround</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span className="text-xs font-bold text-slate-700">Secure Liaison</span>
                  </div>
                </div>
              </div>
      
              {/* 右侧：时区时间表 (深色专业风格) */}
              <div className="flex-1 bg-slate-900 p-8 md:p-12 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Clock size={120} />
                </div>
                
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                  Daily Synchronization Windows
                </h4>
      
                <div className="space-y-6 relative z-10">
                  {/* 北京 */}
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">China Standard (CST)</p>
                      <p className="text-lg font-light">Beijing / Shanghai</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-blue-400">20:00 - 00:00</span>
                    </div>
                  </div>
      
                  {/* 纽约 */}
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Eastern Time (EST)</p>
                      <p className="text-lg font-light">New York / Toronto</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-blue-400">08:00 - 12:00</span>
                    </div>
                  </div>
      
                  {/* 伦敦 */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Greenwich Mean (GMT)</p>
                      <p className="text-lg font-light">London / Lisbon</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-blue-400">12:00 - 16:00</span>
                    </div>
                  </div>
                </div>
      
                <p className="mt-8 text-[10px] text-slate-500 italic leading-relaxed">
                  * Initial assessment starts immediately. Our coordinator will contact you via WhatsApp/WeChat during the next available window above.
                </p>
              </div>
      
            </div>
          </div>
        </div>
      </section>
      
      {/* --- 2. 动态城市网格 --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-center mb-12">Top Medical Hubs</h2>
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin inline-block text-blue-600 w-10 h-10" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.keys(hospitalMeta || {}).map((city) => (
                <div key={city} onClick={() => setSelectedCity(city)} className="cursor-pointer">
                  <CityCard city={city} img={getCityImage(city)} count={`${hospitalMeta[city].length} Hospitals`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- 3. 弹出层 Modal --- */}
      {selectedCity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedCity(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black italic flex items-center tracking-tight uppercase">
                <MapPin className="text-blue-600 mr-2" /> {selectedCity}
              </h3>
              <button onClick={() => setSelectedCity(null)} className="p-2 hover:bg-white rounded-full shadow-sm"><X/></button>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto space-y-3">
              {hospitalMeta[selectedCity]?.map((h: string, i: number) => (
                <div key={i} className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <Hospital className="text-blue-500 mr-4 shrink-0" size={20} />
                  <span className="font-bold text-slate-700">{h}</span>
                </div>
              ))}
            </div>
            <div className="p-8 bg-white border-t text-center">
               <button onClick={() => navigate('/apply')} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg uppercase shadow-xl hover:bg-blue-600 transition-all">
                 Register in {selectedCity}
               </button>
            </div>
          </div>
        </div>
      )}

       {/* ========================================= */}
      {/* ✅ 插入位置：在这里调用新的价格组件 */}
      {/* ========================================= */}
      <PricingSection />

      {/* --- 4. 功能步骤 --- */}
      <section className="py-24 bg-white border-y border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black uppercase italic mb-16 tracking-tighter">Your Journey</h2>
          <div className="grid md:grid-cols-4 gap-12">
            <StepItem icon={<MousePointerClick/>} step="01" title="Register" desc="Submit symptoms & passport scan." />
            <StepItem icon={<FileSearch/>} step="02" title="Match" desc="Team finds the perfect specialist." />
            <StepItem icon={<Lock/>} step="03" title="Escrow" desc="Funds held safely via PayPal." />
            <StepItem icon={<UserCheck/>} step="04" title="Confirm" desc="Get voucher & meet your companion." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-16 text-center text-slate-500">
        <p className="font-black text-white text-xl uppercase mb-4 tracking-tighter italic">ChinaMedAccess</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">© 2024 Global Coordination • Secure Escrow</p>
      </footer>
    </div>
  );
}

// 辅助组件
function CityCard({ city, img, count }: any) {
  return (
    <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white transition-transform hover:scale-[1.02]">
      <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent"></div>
      <div className="absolute bottom-8 left-8">
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{city}</h3>
        <p className="mt-1 inline-block text-blue-400 font-black text-[10px] uppercase bg-blue-400/10 px-2 py-0.5 rounded-full">{count}</p>
      </div>
    </div>
  );
}

function StepItem({ icon, step, title, desc }: any) {
  return (
    <div className="text-center group">
      <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <p className="text-blue-600 font-black text-[10px] uppercase mb-2 tracking-widest">{step}</p>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
