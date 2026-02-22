import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import { LogOut, CheckCircle, Clock, Shield, AlertCircle } from 'lucide-react';
// 找到这行引入图标的代码，加上 Camera
import { LogOut, CheckCircle, Clock, Shield, AlertCircle, Loader2, Camera } from 'lucide-react';
import { API_BASE_URL } from '../App';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const [cases, setCases] = useState<any[]>([]);
  const navigate = useNavigate();
  const { role } = useAuth();

  const fetchCases = async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/all-cases`);
    const data = await res.json();
    setCases(data);
  };

  useEffect(() => { if (role === 'admin') fetchCases(); }, [role]);

  const adminAction = async (endpoint: string, body: object) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (res.ok) fetchCases();
  };

  if (role !== 'admin') return <div className="p-20 text-center">Unauthorized</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight text-blue-600">Med-China Admin</h1>
          <button onClick={() => supabase.auth.signOut()} className="text-red-500 font-bold flex items-center"><LogOut className="w-4 h-4 mr-1"/> Logout</button>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">Patient/Hospital</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">S1 ($30)</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">S2 ($100)</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">S3 (Companion)</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  {/* 在 AdminPage.tsx 的表格列中添加 */}
                  <td className="px-6 py-4">
                    {c.passport_url ? (
                      <a 
                        href={c.passport_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center text-blue-600 hover:underline text-xs font-bold"
                      >
                        <Camera className="w-3 h-3 mr-1"/> View Passport
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs italic">No Photo</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-blue-600">{c.patient_name}</div>
                    <div className="text-xs text-slate-400">{c.user_email}</div>
                    <div className="text-[10px] text-slate-500 italic mt-1">{c.target_hospital}</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.stage1_paid ? <span className="text-green-600 text-xs font-black uppercase">Paid ✅</span> : 
                      <button onClick={() => adminAction('confirm-stage1', {caseId: c.id})} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px]">Confirm $30</button>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase">{c.stage2_status}</span>
                    {c.stage1_paid && c.stage2_status === 'not_started' && 
                      <button onClick={() => {
                        const pid = window.prompt("PayPal Auth ID:");
                        if(pid) adminAction('confirm-stage2', {caseId: c.id, paypalAuthId: pid})
                      }} className="block mt-1 bg-amber-500 text-white px-2 py-1 rounded text-[10px]">Confirm Auth</button>
                    }
                  </td>
                  <td className="px-6 py-4">
                    {c.companion_request ? (
                      <div className="text-[10px] bg-purple-50 p-1 border rounded">
                        {c.companion_request.duration} | {c.companion_request.contact}
                      </div>
                    ) : <span className="text-slate-300 italic text-[10px]">No Request</span>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    {c.stage2_status === 'authorized' && (
                      <>
                        <button onClick={() => adminAction('capture-stage2', {caseId: c.id})} className="bg-green-600 text-white px-2 py-1 rounded text-[10px]">Capture</button>
                        <button onClick={() => adminAction('void-stage2', {caseId: c.id})} className="bg-red-500 text-white px-2 py-1 rounded text-[10px]">Void</button>
                      </>
                    )}
                    {c.stage3_status === 'not_started' && c.stage2_status === 'captured' && (
                      <button onClick={() => adminAction('confirm-stage3', {caseId: c.id})} className="bg-purple-600 text-white px-2 py-1 rounded text-[10px]">Confirm S3</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// frontend/src/pages/AdminPage.tsx 新增管理模块

export function DataManagement() {
  const [newCity, setNewCity] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [newHospital, setNewHospital] = useState('');

  const addCity = async () => {
    await fetch(`${API_BASE_URL}/api/admin/meta/cities`, {
      method: 'POST',
      body: JSON.stringify({ name: newCity })
    });
    alert("City Added");
    window.location.reload();
  };

  const addHospital = async () => {
    await fetch(`${API_BASE_URL}/api/admin/meta/hospitals`, {
      method: 'POST',
      body: JSON.stringify({ cityName: targetCity, hospitalName: newHospital })
    });
    alert("Hospital Added");
    window.location.reload();
  };

  return (
    <div className="mt-12 grid md:grid-cols-2 gap-8 bg-slate-100 p-8 rounded-3xl">
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Add New City</h3>
        <input className="w-full p-2 rounded border" placeholder="City Name (e.g. Heihe)" 
          onChange={e => setNewCity(e.target.value)} />
        <button onClick={addCity} className="bg-slate-800 text-white px-4 py-2 rounded font-bold">Save City</button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Add Hospital to City</h3>
        <input className="w-full p-2 rounded border" placeholder="City Name" onChange={e => setTargetCity(e.target.value)} />
        <input className="w-full p-2 rounded border" placeholder="Hospital Name" onChange={e => setNewHospital(e.target.value)} />
        <button onClick={addHospital} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Save Hospital</button>
      </div>
    </div>
  );
}


