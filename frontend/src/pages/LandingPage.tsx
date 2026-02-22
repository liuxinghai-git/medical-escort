import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Activity, MapPin, ChevronRight, 
  Globe, CheckCircle2, X, Hospital, 
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
      'Shanghai': 'https://images.unsplash.com/photo-1548919973-5cdf5916ad7a?q=80&w=800',
      'Beijing': 'https://images.unsplash.com/photo-1529921879218-f996677ca76e?q=80&w=800',
      'Guangzhou': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800',
      'Shenzhen': 'https://images.unsplash.com/photo-1583248352195-d3a8e766ede2?q=80&w=800',
      'Hangzhou': 'https://images.unsplash.com/photo-1599387737839-497677f98595?q=80&w=800',
      'Chengdu': 'https://images.unsplash.com/photo-1518331182281-22906d203874?q=80&w=800',
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
