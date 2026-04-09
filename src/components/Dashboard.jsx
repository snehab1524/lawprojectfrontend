import { useState } from 'react';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-5 min-h-screen">
      {/* SIDEBAR */}
      <div className="col-span-1 bg-slate-900 p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">
          Dashboard
        </h2>
        <ul className="space-y-3 text-gray-400">
          <li>My Cases</li>
          <li>Documents</li>
          <li>Consultations</li>
        </ul>
      </div>
      {/* MAIN CONTENT */}
      <div className="col-span-4 bg-slate-50 text-black p-10 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="p-3 bg-yellow-400/30 rounded-full">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Lawyers Available</p>
                <p className="text-3xl font-bold">47</p>
              </div>
              <div className="p-3 bg-emerald-400/30 rounded-full">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6.47-4.72a.75.75 0 011.28.53v2.25a.75.75 0 01-.764.745H9.47a.75.75 0 01-.53-1.28l1.72-1.72zM10 8a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5A.75.75 0 0110 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">New Consultations</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <div className="p-3 bg-purple-400/30 rounded-full">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="font-semibold mb-6 text-xl">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/find-lawyer" className="bg-yellow-500 hover:bg-yellow-600 text-black p-6 rounded-xl text-center transition-all font-medium flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v1a1 1 0 001 1h5a1 1 0 001-1v-1H4v1zm9-1h-5v-1H4V7a1 1 0 011-1h10a1 1 0 011-1V7h-5v1z"/>
              </svg>
              Find Lawyer
            </a>
            <a href="/admin" className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-xl text-center transition-all font-medium flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Manage Content
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
