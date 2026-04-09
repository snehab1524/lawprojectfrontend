import { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/authApi';

const LandmarkCases = () => {
  const user = getCurrentUser();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    // Placeholder - fetch landmark cases from articleApi or caseApi
    setCases([
      { title: 'Landmark Case 1', description: 'Description...' },
      { title: 'Landmark Case 2', description: 'Description...' },
    ]);
  }, []);

  if (!user || user.role !== 'lawyer') return <div>Access denied</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Landmark Cases</h1>
      <div className="grid gap-6">
        {cases.map((caseItem, index) => (
          <div key={index} className="bg-slate-800 p-6 rounded-xl">
            <h3 className="font-bold text-white text-xl">{caseItem.title}</h3>
            <p className="text-gray-300">{caseItem.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandmarkCases;

