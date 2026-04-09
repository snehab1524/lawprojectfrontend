import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/authApi';
import { getJudges } from '../api/judgeApi';
import JudgeCard from '../components/JudgeCard';

const JudgesCorner = () => {
  const user = getCurrentUser();
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const data = await getJudges();
        setJudges(data.data || []);
      } catch (err) {
        console.error(err);
        setJudges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJudges();
  }, []);

  if (!user || user.role !== 'lawyer') return <div>Access denied</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Judge's Corner - Flashcards</h1>
      {loading ? (
        <div>Loading judges...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{Array.isArray(judges) && judges.length > 0 ? judges.map((judge) => (
            <JudgeCard key={judge.id} judge={judge} />
          )) : (
            <div className="col-span-full text-center py-12 text-slate-400 text-lg">No judges available at the moment.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default JudgesCorner;

