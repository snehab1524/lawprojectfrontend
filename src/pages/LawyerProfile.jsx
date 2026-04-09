import { useState, useEffect } from 'react';
import { createOrUpdateLawyerProfile, getMyLawyerProfile } from '../api/lawyerProfileApi';

const LawyerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    experience: 0,
    bio: '',
    consultationFee: 0,
    availability: '[]',
    location: '',
    profileImage: 'https://i.pravatar.cc/150'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getMyLawyerProfile();
      setProfile(data);
      setFormData({
        fullName: data.name || data.fullName || '',
        specialization: data.specialization || '',
        experience: data.experience || 0,
        bio: data.bio || '',
        consultationFee: data.consultationFee || 0,
        availability: JSON.stringify(data.availability || []),
        location: data.location || '',
        profileImage: data.profileImage || 'https://i.pravatar.cc/150'
      });
    } catch (err) {
      console.log('No profile yet or error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = {
        ...formData,
        availability: JSON.parse(formData.availability || '[]'),
        experience: parseInt(formData.experience),
        consultationFee: parseFloat(formData.consultationFee)
      };
      const updated = await createOrUpdateLawyerProfile(dataToSend);
      setProfile(updated);
      alert('Profile saved successfully!');
      fetchProfile();
    } catch (err) {
      alert('Error saving profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="text-lg text-black">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-12 text-center">
          My Lawyer Profile
        </h1>
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Specialization
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Corporate Law">Corporate Law</option>
                  <option value="Family Law">Family Law</option>
                  <option value="Civil Law">Civil Law</option>
                  <option value="Constitutional Law">Constitutional Law</option>
                  <option value="Tax Law">Tax Law</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                Availability (JSON array)
              </label>
              <textarea
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                rows="3"
                className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-vertical text-black"
                placeholder='["Mon 9-5", "Wed 9-5", "Fri 9-5"]'
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="5"
                className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-vertical text-black"
                placeholder="Tell clients about your expertise..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving Profile...' : 'Save My Profile'}
            </button>
          </form>
          {profile && (
            <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200">
              <h3 className="text-2xl font-bold text-black mb-4">Preview</h3>
              <div className="flex gap-6 items-center">
                <img src={formData.profileImage} alt="Preview" className="w-24 h-24 rounded-2xl shadow-lg object-cover" />
                <div>
                  <h4 className="text-2xl font-bold text-black">{formData.fullName}</h4>
                  <p className="text-lg text-blue-600 font-semibold">{formData.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">⭐ {profile.rating.toFixed(1)}</span>
                    <span className="text-black text-sm">({profile.experience}+ years)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
