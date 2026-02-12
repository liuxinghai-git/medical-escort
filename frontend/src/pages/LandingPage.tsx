import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, Activity, MapPin, ChevronRight, Globe, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative bg-white pt-16 pb-32 overflow-hidden">
        {/* 背景图形 */}
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
            <p className="text-xl text-slate-500 mb-10 max-w-xl mx-auto lg:mx-0">
              Assisting global patients to secure appointments at China's top-tier hospitals with 100% financial protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/apply')}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center"
              >
                Book an Appointment <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                How it works
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" 
                alt="Modern Hospital" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* 浮动统计卡片 */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:block">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg"><Activity className="text-green-600" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Success Rate</p>
                  <p className="text-lg font-black text-slate-800">98.5%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 三步流程可视化 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">The Risk-Free Process</h2>
          <p className="text-slate-500 mb-16 max-w-2xl mx-auto">We protect your funds through every stage of the registration.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ProcessCard 
              step="01" icon={<Globe/>} title="Assessment" 
              desc="Information research & hospital matching strategy."
            />
            <ProcessCard 
              step="02" icon={<ShieldCheck/>} title="Escrow Deposit" 
              desc="Booking fee held by PayPal. 100% Refundable if failed."
            />
            <ProcessCard 
              step="03" icon={<CheckCircle2/>} title="Confirmation" 
              desc="Registration voucher secured. Specialist visit confirmed."
            />
          </div>
        </div>
      </section>

      {/* 3. 城市选择卡片 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <h2 className="text-3xl font-bold">Top Medical Hubs</h2>
              <p className="text-slate-500 mt-2">Only Tier-1 specialized hospitals.</p>
            </div>
            <button className="text-blue-600 font-bold flex items-center hover:underline">
              View all hospitals <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <CityCard city="Shanghai" img="https://images.unsplash.com/photo-1548919973-5cdf5916ad7a?auto=format&fit=crop&q=80&w=800" count="45+ Hospitals" />
            <CityCard city="Beijing" img="https://images.unsplash.com/photo-1529921879218-f996677ca76e?auto=format&fit=crop&q=80&w=800" count="30+ Hospitals" />
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-500 py-12 px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-widest mb-4">ChinaMed Access</p>
        <p className="text-xs">© 2024 China Medical Concierge. Licensed Coordination Service.</p>
      </footer>
    </div>
  );
}

// 辅助组件
function ProcessCard({ step, icon, title, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-6">{React.cloneElement(icon, { size: 32 })}</div>
      <div className="text-4xl font-black text-slate-100 mb-2">{step}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CityCard({ city, img, count }: any) {
  return (
    <div className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer">
      <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
      <div className="absolute bottom-6 left-6 text-white text-left">
        <h3 className="text-2xl font-bold mb-1">{city}</h3>
        <p className="text-xs font-medium opacity-80 flex items-center tracking-wide uppercase">
          <MapPin className="w-3 h-3 mr-1" /> {count}
        </p>
      </div>
    </div>
  );
}