import React from 'react';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            No hidden fees. You only pay for the value we deliver.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
          
          {/* Stage 1 Card: 强调专业评估 */}
          <div className="border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col relative overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Step 1: Triage & Review
              </h3>
              <p className="mt-4 text-sm text-gray-500">
                For new patients. We analyze your needs and match you with the right specialist.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$30</span>
                <span className="text-base font-medium text-gray-500"> / one-time</span>
              </p>
              
              {/* 功能列表 */}
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Medical record translation (EN to CN)</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Best-match specialist identification</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Availability verification</p>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl mt-auto">
               <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-4">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Refundable if we can't help</span>
               </div>
              <button 
                onClick={() => navigate('/apply')}
                className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center transition"
              >
                Start Assessment
              </button>
            </div>
          </div>

          {/* Stage 2 Card: 强调结果和保障 */}
          <div className="border-2 border-blue-500 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-300 flex flex-col relative transform md:-translate-y-4">
            {/* 推荐标签 */}
            <div className="absolute top-0 right-0 -mt-3 mr-3">
               <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                 Pay Later
               </span>
            </div>

            <div className="p-6">
              <h3 className="text-lg leading-6 font-bold text-blue-600">
                Step 2: Priority Booking
              </h3>
              <p className="mt-4 text-sm text-gray-500">
                We secure your appointment and guide you to the hospital.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$100</span>
                <span className="text-base font-medium text-gray-500"> / successful booking</span>
              </p>

              {/* 功能列表 */}
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700"><strong>Guaranteed</strong> appointment slot</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Hospital registration fee included*</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Bilingual admission guide (PDF)</p>
                </li>
                 <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-check text-green-500"></i>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">24/7 Support during visit</p>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-blue-50 rounded-b-2xl mt-auto">
               <div className="flex items-center gap-2 text-sm text-green-700 font-bold mb-4">
                  <i className="fa-solid fa-lock"></i>
                  <span>100% Money-Back Guarantee</span>
               </div>
              <button 
                disabled={true} // 这一步不可直接点击，必须先过第一步
                className="w-full block bg-gray-200 text-gray-400 font-bold py-3 px-4 rounded-xl text-center cursor-not-allowed"
              >
                Unlocks after Step 1
              </button>
            </div>
          </div>

        </div>
        
        {/* 信任增强区域 */}
        <div className="mt-10 text-center">
             <p className="text-sm text-gray-400">
                *Standard registration fees are included. VIP/International department fees may vary.
             </p>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;