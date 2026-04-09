import React, { useState, useEffect } from "react";
import { Star, BadgeCheck } from "lucide-react";
import { getTopRatedLawyers } from "../api/lawyerApi.js";

const TopLawyers = () => {
  const [lawyers, setLawyers] = useState([
    { name: "Rahul Sharma", specialization: "Corporate Law", rating: 4.9, status: "Available" },
    { name: "Ananya Singh", specialization: "Criminal Law", rating: 4.8, status: "Available" },
    { name: "Arjun Mehta", specialization: "Family Law", rating: 4.7, status: "Busy" }
  ]);

  useEffect(() => {
    getTopRatedLawyers().then(data => setLawyers(data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <section className="max-w-7xl mx-auto py-24 px-4">
      <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Top Verified Lawyers
      </h2>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
        {lawyers.map((lawyer, index) => (
          <div key={index} className="group bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-white/20 hover:scale-[1.02] transition-all duration-500 shadow-2xl hover:shadow-3xl">
            <div className="relative">
              <img src={`https://i.pravatar.cc/120?u=${index}`} className="w-24 h-24 rounded-2xl border-4 border-white/20 mx-auto group-hover:border-white/40 transition-all duration-300" />
              <div className="absolute -top-2 -right-2 bg-emerald-500 p-2 rounded-2xl">
                <BadgeCheck className="text-white" size={20}/>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mt-6 mb-2 text-center group-hover:text-emerald-400 transition-colors">
              {lawyer.name}
            </h3>
            <p className="text-gray-300 font-medium text-center mb-4">
              {lawyer.specialization}
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={18} className={`ml-1 ${i < lawyer.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                ))}
law
              <span className="text-lg font-bold text-white ml-2">({lawyer.rating.toFixed(1)})</span>
            </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                lawyer.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                ● {lawyer.status}
              </span>
            </div>
            <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 transform">
              Book Consultation Free
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopLawyers;

