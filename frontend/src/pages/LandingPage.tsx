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

  // 1. 从后端数据库获取动态城市和医院列表
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/meta/hospitals`)
      .then(res => res.json())
      .then(data => {
        setHospitalMeta(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load cities:", err);
        setLoading(false);
      });
  }, []);

  // 为不同城市匹配背景图（如果不在名单里，显示默认图）
  const getCityImage = (city: string) => {
    const images: { [key: string]: string } = {
      'Shanghai': 'https://images.unsplash.com/photo-1548919973-5cdf5916ad7a?q=80&w=800',
      'Beijing': 'https://images.unsplash.com/photo-1529921879218-f996677ca76e?q=80&w=800',
      'Guangzhou': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800',
      'Shenzhen': 'https://images.unsplash.com/photo-1583248352195-d3a8e766ede2?q=80&w=800',
      'Hangzhou': 'https://images.unsplash.com/photo-1599387737839-497677f98595?q=80&w=800',
      'Chengdu': 'https://images.unsplash.com/photo-1518331182281-22906d203874?q=80&w=800',
    };
    // 如果没有匹配到城市，返回一张通用的现代建筑/医疗图片
    return images[city] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800';
  };

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* --- 1. Hero Section (保持美观) --- */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure International Medical Concierge</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] mb-6 text-slate-900 uppercase italic">
              China's <span className="text-blue-600 underline decoration-blue-200">Elite Care</span><br/> 
              Accessible To You.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
              Skip the complexity. We coordinate your appointments at China's top specialized hospitals with full financial protection.
            </p>
            <button 
              onClick={() => navigate('/apply')}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center w-full sm:w-auto"
            >
              Book Specialist <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-[10px] border-white rotate-2 hover:rotate-0 transition-transform duration-500 hidden lg:block">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Hospital"/>
          </div>
        </div>
      </section>

      {/* --- 2. 动态城市网格 (这是修复的核心) --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="text-left">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Top Medical Hubs</h2>
              <p className="text-slate-500 mt-2 font-medium">Select a city to explore Class-A hospitals currently in our network.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching dynamic hubs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 遍历后端传来的所有城市 */}
              {Object.keys(hospitalMeta).map((city) => (
                <div key={city} onClick={() => setSelectedCity(city)} className="cursor-pointer group">
                  <CityCard 
                    city={city} 
                    img={getCityImage(city)} 
                    count={`${hospitalMeta[city].length} Hospitals`} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- 3. 如何运作 (保持美观) --- */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-3xl font-black uppercase italic mb-16 tracking-tighter text-slate-800">Your Secure Journey</h2>
          <div className="grid md:grid-cols-4 gap-12">
            <StepItem icon={<MousePointerClick/>} step="01" title="Register" desc="Submit passport & symptoms via our secure portal." />
            <StepItem icon={<FileSearch/>} step="02" title="Match" desc="Our team finds the perfect specialist for your case." />
            <StepItem icon={<Lock/>} step="03" title="Escrow" desc="Deposit booking fee. PayPal holds it for your safety." />
            <StepItem icon={<UserCheck/>} step="04" title="Confirm" desc="Get your voucher & meet your guide at the hospital." />
          </div>
        </div>
      </section>

      {/* --- 城市详情弹窗 --- */}
      {selectedCity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedCity(null)}></div>
          <div className="r
