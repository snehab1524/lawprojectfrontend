import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientLayout from "./components/ClientLayout";
import ClientDashboard from "./pages/ClientDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import LawyerDashboard from "./pages/LawyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LawyerBookings from "./pages/LawyerBookings";
import ClientBookings from "./pages/ClientBookings";


import CasePage from "./pages/CasePage";
import Cases from "./pages/Cases";
import LawyerCasesList from "./pages/lawyer/CasesList";
import Chat from "./pages/Chat";
import Calendar from "./pages/Calendar";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";

import LawyerProfile from "./pages/LawyerProfile";
import JudgesCorner from "./pages/JudgesCorner";
import CaseNotes from "./pages/CaseNotes";
import AdminPanel from "./pages/AdminPanel.jsx";
import DashboardLayout from "./components/DashboardLayout";
import Articles from "./pages/Articles";
import FindLawyer from "./pages/FindLawyer";
import LawyersList from "./pages/client/LawyersList";
import MyCases from "./pages/client/MyCases";

import AIAssistant from "./pages/AIAssistant";

function Placeholder({ title }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 p-8">
      <div className="max-w-4xl mx-auto text-center py-24">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-xl text-gray-400 mb-8">Feature coming soon</p>
        <div className="inline-flex bg-slate-800/50 backdrop-blur-xl px-8 py-4 rounded-2xl border border-slate-700">
          <a href="/" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/lawyer-dashboard/*" element={
        <ProtectedRoute roles={["lawyer"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LawyerDashboard />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CasePage />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="chat" element={<Chat />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="judges" element={<JudgesCorner />} />
        <Route path="tasks" element={<Tasks />} />

        <Route path="profile" element={<LawyerProfile />} />
        <Route path="notes" element={<CaseNotes />} />
        <Route path="landmark" element={<Articles />} />
        <Route path="bookings" element={<LawyerBookings />} />
      </Route>

      <Route path="/client-dashboard/*" element={
        <ProtectedRoute roles={["client"]}>
          <ClientLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ClientDashboard />} />
        <Route path="lawyers-list" element={<LawyersList />} />
        <Route path="cases" element={<MyCases />} />
        <Route path="cases/:id" element={<CasePage />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="chat" element={<Chat />} />
        <Route path="bookings" element={<ClientBookings />} />
        <Route path="calendar" element={<Calendar />} />

      </Route>




      <Route path="/admin-dashboard" element={
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={<AdminPanel />} />

      <Route path="/lawyer-bookings" element={
        <ProtectedRoute roles={["lawyer", "admin"]}>
          <Placeholder title="Lawyer Bookings" />
        </ProtectedRoute>
      } />

      <Route path="/find-lawyer" element={<FindLawyer />} />
      <Route path="/lawyers" element={<FindLawyer />} />

      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/lawyer-advice" element={<FindLawyer />} />
      <Route path="/judges-corner" element={<Placeholder title="Judges Corner" />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/court-updates" element={<Placeholder title="Court Updates" />} />
      <Route path="/case-notes" element={<Placeholder title="Case Notes" />} />
      <Route path="/calendar" element={<Placeholder title="Calendar" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
