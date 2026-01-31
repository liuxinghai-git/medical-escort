import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { API_BASE_URL } from '../App';

export default function DashboardPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);

  const fetchCase = async () => {
    const res = await fetch(`${API_BASE_URL}/api/cases/${id}`);
    const data = await res.json();
    setCaseData(data);
  };

  useEffect(() => { fetchCase(); }, [id]);

  if (!caseData) return <div>Loading Case...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Case Dashboard</h1>
          <p className="text-sm text-slate-500">ID: {id}</p>
          <div className="mt-4 flex gap-2">
            <Badge active={caseData.stage1_paid} label="1. Assessment" />
            <Badge active={caseData.stage2_status === 'authorized'} label="2. Booking (Escrow)" />
            <Badge active={caseData.stage3_status === 'paid'} label="3. Companion" />
          </div>
        </div>

        {/* Stage 2: Escrow Payment Section */}
        {caseData.stage1_paid && caseData.stage2_status === 'not_started' && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-500">
            <div className="flex items-center mb-4 text-blue-800">
              <Lock className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-bold">Stage 2: Secure Escrow Deposit</h2>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              We have verified feasibility. Please deposit <strong>$100</strong>. 
              <br/>This funds are <strong>HELD</strong> by PayPal and only released if we secure the appointment.
            </p>
            
            <PayPalButtons 
              forceReRender={[caseData.id]}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "AUTHORIZE", // ⚠️ 关键：只授权不扣款 (Escrow)
                  purchase_units: [{
                    amount: { value: "100.00" },
                    description: "Escrow Deposit for Appointment",
                    custom_id: `${id}:stage_2`
                  }]
                });
              }}
              onApprove={() => {
                alert("Deposit Secured! We are now booking your slot.");
                setTimeout(fetchCase, 2000); // 刷新状态
              }}
            />
          </div>
        )}

        {/* Stage 2 Status: Escrow Active */}
        {caseData.stage2_status === 'authorized' && (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-green-800">
            <CheckCircle className="w-8 h-8 mb-2" />
            <h2 className="font-bold">Funds Secured in Escrow</h2>
            <p className="text-sm">We are currently contacting the hospital.</p>
          </div>
        )}

        {/* Stage 3: Upsell (预约成功后显示) */}
        {caseData.stage2_status === 'authorized' && caseData.stage3_status !== 'paid' && (
          <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm mt-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900">Hospital Requirement: Physical Presence</h3>
                <p className="text-amber-800 text-sm mt-2 mb-4">
                  You MUST be present at the hospital window with your passport to validate the booking.
                  Staff likely won't speak English. 
                </p>
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800">Add Medical Companion ($120)</span>
                  </div>
                  <PayPalButtons 
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          amount: { value: "120.00" },
                          custom_id: `${id}:stage_3`
                        }]
                      });
                    }}
                    onApprove={() => {
                      alert("Companion Booked!");
                      setTimeout(fetchCase, 2000);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const Badge = ({ active, label }: any) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
    {label}
  </span>
);