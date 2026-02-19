import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, MapPin, ChevronRight, Globe, CheckCircle2, X, Hospital } from 'lucide-react';
// 导入我们之前创建的医院数据
import { hospitalData, cities } from '../data/hospitalData';

export default function LandingPage() {
  const navigate = useNavigate();
  // 控制弹窗的状态
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <div className="font-sans text-slate-900 relative">
      {/* 1. Hero Section (保持不变) */}
      <section className="relative bg-white pt-16 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 w-96 h-96 bg-blue-600 rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Escrow Payment System</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Professional <br/>
              <span className="text-blue-600">Medical Access</span><br/> 
              in China.
            </h1>
            <button 
              onClick={() => navigate('/apply')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center mx-auto lg:mx-0"
            >
              Book an Appointment <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-slate-200 aspect-video lg:aspect-square">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Hospital"/>
          </div>
        </div>
      </section>

      {/* 2. Top Medical Hubs (修改这里让按钮生效) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <h2 className="text-3xl font-bold italic">Top Medical Hubs</h2>
              <p className="text-slate-500 mt-2">Only Tier-1 specialized hospitals.</p>
            </div>
            {/* 点击 View all 默认看第一个城市的医院 */}
            <button 
              onClick={() => setSelectedCity('Shanghai')}
              className="text-blue-600 font-bold flex items-center hover:underline"
            >
              View all hospitals <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 上海卡片 */}
            <div onClick={() => setSelectedCity('Shanghai')}>
              <CityCard 
                city="Shanghai" 
                img="https://www.bing.com/th/id/OIP.1S7xD3X1ovAbJfPo-P4eAAHaE8?w=235&h=180&c=7&r=0&o=7&cb=defcache2&dpr=1.5&pid=1.7&rm=3&defcache=1" 
                count="Top Tier Hospitals" 
              />
            </div>
            {/* 北京卡片 */}
            <div onClick={() => setSelectedCity('Beijing')}>
              <CityCard 
                city="Beijing" 
                img="https://www.bing.com/th/id/OIP.tf8-jIMtoCToEzUQchTucgHaE8?w=256&h=180&c=7&r=0&o=7&cb=defcache2&dpr=1.5&pid=1.7&rm=3&defcache=1" 
                count="Top Tier Hospitals" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. 弹出层 Modal (点击按钮后显示的内容) --- */}
      {selectedCity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* 黑色半透明背景 */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCity(null)}></div>
          
          {/* 白框内容 */}
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                <MapPin className="text-blue-600 mr-2" /> {selectedCity} Specialists
              </h3>
              <button onClick={() => setSelectedCity(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4">
                {hospitalData[selectedCity].map((hosp, idx) => (
                  <div key={idx} className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <Hospital className="w-5 h-5 text-blue-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{hosp}</p>
                      <p className="text-xs text-slate-400 uppercase mt-1 tracking-wider">Tier-1 Public General Hospital</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
               <p className="text-sm text-slate-500">Ready to book?</p>
               <button 
                onClick={() => navigate('/apply')}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
               >
                 Register Now
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (保持不变) */}
      <footer className="bg-slate-900 text-slate-500 py-12 px-6 text-center mt-20">
        <p className="text-sm font-medium uppercase tracking-widest mb-4">ChinaMed Access</p>
        <p className="text-xs">© 2024 China Medical Concierge. Licensed Coordination Service.</p>
      </footer>
    </div>
  );
}

// 辅助组件：城市卡片样式
function CityCard({ city, img, count }: any) {
  return (
    <div className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer bg-slate-200 shadow-lg border border-slate-100">
      <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent"></div>
      <div className="absolute bottom-6 left-6 text-white text-left">
        <h3 className="text-2xl font-black mb-1 italic uppercase tracking-tight">{city}</h3>
        <p className="text-xs font-bold opacity-90 flex items-center uppercase tracking-widest bg-blue-600/80 px-2 py-1 rounded w-fit">
          <MapPin className="w-3 h-3 mr-1" /> {count}
        </p>
      </div>
    </div>
  );
}
