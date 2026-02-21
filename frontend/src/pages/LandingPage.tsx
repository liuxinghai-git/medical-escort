import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Activity, MapPin, ChevronRight, 
  Globe, CheckCircle2, X, Hospital, 
  Lock, MousePointerClick, FileSearch, UserCheck
} from 'lucide-react';
import { hospitalData } from '../data/hospitalData';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* --- 1. Hero Section --- */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure International Medical Concierge</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] mb-6 text-slate-900">
              Access China's <br/>
              <span className="text-blue-600">Top Specialists</span><br/> 
              With Zero Risk.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
              We bridge the gap between global patients and China's elite Tier-1 hospitals. Comprehensive coordination with protected escrow payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/apply')}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center"
              >
                Start Registration <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4 px-4 py-2 border border-slate-100 rounded-2xl bg-white/50">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">U{i}</div>)}
                 </div>
                 <span className="text-xs text-slate-400 font-medium">500+ Patients Assisted</span>
              </div>
            </div>
          </div>

          <div className="relative lg:block">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" 
                alt="Medical Center" 
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl hidden md:block">
               <p className="text-4xl font-black mb-1">100%</p>
               <p className="text-xs font-bold uppercase tracking-widest opacity-80">Refund Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. How It Works (功能步骤) --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500">Your professional journey to health in 4 simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard 
              icon={<MousePointerClick/>} 
              step="Step 1" title="Register & Scan" 
              desc="Upload your passport and medical needs. Our AI extracts details instantly." 
            />
            <StepCard 
              icon={<FileSearch/>} 
              step="Step 2" title="Expert Assessment" 
              desc="Our medical team matches your case with the best possible specialist." 
            />
            <StepCard 
              icon={<Lock/>} 
              step="Step 3" title="Secure Escrow" 
              desc="Pay the booking fee. Funds are held securely by PayPal until confirmation." 
            />
            <StepCard 
              icon={<UserCheck/>} 
              step="Step 4" title="Meet Your Guide" 
              desc="Get your voucher and meet your bilingual companion at the hospital gate." 
            />
          </div>
        </div>
      </section>

      {/* --- 3. Escrow Security (资金安全性解释) --- */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
          <ShieldCheck size={400} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">Your Funds Are <span className="text-blue-400">Escrow-Protected</span></h2>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              We use a "Payment for Results" model. Unlike traditional agencies, we do not take your booking fee upfront. 
            </p>
            
            <div className="space-y-6">
              <SecurityItem title="Authorized, Not Captured" desc="When you pay Stage 2, funds are only AUTHORIZED. PayPal holds the money, not us." />
              <SecurityItem title="Voucher-Based Release" desc="We only claim the funds once we upload your digital hospital appointment voucher." />
              <SecurityItem title="72h Auto-Refund" desc="If we cannot secure a slot within 72 hours, the authorization is voided and funds return to you instantly." />
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. Top Medical Hubs --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold">Top Medical Hubs</h2>
              <p className="text-slate-500 mt-2">Connecting you to China's 'Class A' Specialised Hospitals.</p>
            </div>
            <button 
              onClick={() => setSelectedCity('Shanghai')}
              className="px-6 py-2 border-2 border-slate-200 rounded-full font-bold text-sm hover:border-blue-600 transition-colors"
            >
              View All Hospital List
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div onClick={() => setSelectedCity('Shanghai')} className="cursor-pointer group">
               <CityCard city="Shanghai" img="https://images.pexels.com/photos/2763384/pexels-photo-2763384.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
            </div>
            <div onClick={() => setSelectedCity('Beijing')} className="cursor-pointer group">
               <CityCard city="Beijing" img="https://images.pexels.com/photos/5102098/pexels-photo-5102098.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
            </div>
          </div>
        </div>
      </section>

      {/* --- City Modal --- */}
      {selectedCity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedCity(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold flex items-center tracking-tight">
                <MapPin className="text-blue-600 mr-2" /> {selectedCity} Elite Hospitals
              </h3>
              <button onClick={() => setSelectedCity(null)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
              {hospitalData[selectedCity].map((h, i) => (
                <div key={i} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Hospital className="text-blue-500 mr-4 shrink-0" size={20} />
                  <span className="font-bold text-slate-700">{h}</span>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 text-center">
               <button onClick={() => navigate('/apply')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700">Begin Booking in {selectedCity}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center space-x-2">
              <Activity className="text-blue-600" />
              <span className="font-black text-xl uppercase tracking-tighter">ChinaMedAccess</span>
           </div>
           <div className="flex space-x-8 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:text-blue-600">Support</a>
           </div>
           <p className="text-slate-400 text-xs tracking-widest uppercase">© 2024 Global Medical Coordination</p>
        </div>
      </footer>
    </div>
  );
}

// 辅助组件：步骤卡片
function StepCard({ step, icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2">{step}</p>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// 辅助组件：安全项
function SecurityItem({ title, desc }: any) {
  return (
    <div className="flex items-start space-x-4">
      <div className="mt-1 bg-blue-500/20 p-1 rounded-full"><CheckCircle2 className="text-blue-400 w-5 h-5" /></div>
      <div>
        <h4 className="font-bold text-lg text-blue-100">{title}</h4>
        <p className="text-slate-500 text-sm">{desc}</p>
      </div>
    </div>
  );
}

// 辅助组件：城市
function CityCard({ city, img }: any) {
  return (
    <div className="relative h-96 rounded-[2.5rem] overflow-hidden shadow-lg group">
      <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
      <div className="absolute bottom-8 left-8">
        <h3 className="text-3xl font-black text-white italic uppercase">{city}</h3>
        <div className="mt-2 flex items-center text-blue-400 font-bold text-xs uppercase tracking-widest">
           <MapPin size={14} className="mr-1" /> Explore Hospitals
        </div>
      </div>
    </div>
  );
}
