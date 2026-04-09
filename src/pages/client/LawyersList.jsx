import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllLawyerProfiles } from '../../api/lawyerProfileApi';
import LawyerCard from '../../components/LawyerCard';

const LawyersList = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchLawyers();
  }, [filters]);

  const fetchLawyers = async () => {
    try {
      const data = await getAllLawyerProfiles(filters);
      setLawyers(data);
    } catch (err) {
      console.error('Error fetching lawyers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading lawyers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Find Top Lawyers
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Browse verified lawyer profiles and find the perfect specialist for your legal needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {lawyers.map((lawyer) => (
            <div key={lawyer.id} className="group">
              <Link to={`/lawyer-profile/${lawyer.id}`} className="block">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group-hover:border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <img 
                      src={lawyer.profileImage} 
                      alt={lawyer.name}
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg mb-6"
                    />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {lawyer.name}
                    </h3>
                    <p className="text-lg font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl mb-4">
                      {lawyer.specialization}
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xl">⭐</span>
                        <span className="font-bold text-xl">{lawyer.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {lawyer.experience}+ years experience
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        ₹{lawyer.consultationFee.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-3 h-16">
                      {lawyer.bio}
                    </p>
                    <div className="flex gap-3 w-full">
                      <Link
                        to={`/chat?lawyerId=${lawyer.id}`}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-bold text-center shadow-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:-translate-y-1"
                      >
                        💬 Chat
                      </Link>
                      <Link
                        to={`/client-dashboard/bookings?lawyerId=${lawyer.id}`}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-center shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all transform hover:-translate-y-1"
                      >
                        📅 Book
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {lawyers.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">👨‍⚖️</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">
              No lawyers found
            </h3>
            <p className="text-xl text-gray-500 max-w-md mx-auto">
              Try adjusting your search filters or check back later for new profiles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyersList;
