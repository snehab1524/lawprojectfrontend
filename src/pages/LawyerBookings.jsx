import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';
import { getLawyerBookings, updateBookingStatus } from '../api/bookingApi';
import { getOrCreateChat } from '../api/chatApi';

const LawyerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const navigate = useNavigate();

  const refreshBookings = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser?.role === 'lawyer') {
        setLoading(true);
        const bookingsData = await getLawyerBookings(currentUser.id);
        setBookings(bookingsData);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const handleUpdateStatus = useCallback(async (id, status) => {
    setUpdatingIds(prev => new Set([...prev, id]));
    try {
      const response = await updateBookingStatus(id, status);
      await refreshBookings();
        if (response.caseCreated && response.caseId) {
          alert(`Booking accepted! Case #${response.caseId} created successfully.`);
          navigate(`/lawyer-dashboard/cases/${response.caseId}`);
        }
    } catch (err) {
      console.error('Status update failed:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [refreshBookings, navigate]);

  const handleChat = useCallback(async (booking) => {
    try {
      const chat = await getOrCreateChat(booking.client?.id || booking.clientId);
      navigate('/lawyer-dashboard/chat', { state: { chatId: chat.id, partnerName: booking.client?.name || booking.clientName } });
    } catch (err) {
      console.error('Chat open failed:', err);
      alert('Failed to open chat');
    }
  }, [navigate]);

  const handleReschedule = useCallback((booking) => {
    if (confirm(`Reschedule booking for ${booking.clientName || booking.client?.name}? Contact client directly for now.`)) {
      console.log('Reschedule booking:', booking.id);
      // TODO: Implement reschedule API
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-lg text-black">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            My Bookings
          </h1>
          <p className="text-xl text-gray-600">
            Manage client appointments and consultations
          </p>
        </div>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-16 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-lg text-gray-600 mb-8">Clients will appear here once they book consultations with you.</p>
            <a href="/lawyer-dashboard/profile" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition">
              Complete your profile
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Case</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-black">{booking.clientName || booking.client?.name || 'Client'}</div>
                        <div className="text-sm text-gray-500">{booking.client?.email || booking.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-black">{booking.caseDescription?.substring(0, 50) || 'Consultation booking'}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {booking.caseId ? `Case #${booking.caseId} is visible in Cases page` : 'Accept to create a case'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                              disabled={updatingIds.has(booking.id)}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                              disabled={updatingIds.has(booking.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleChat(booking)}
                            className="text-blue-600 hover:text-blue-900 font-medium transition hover:underline"
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => handleReschedule(booking)}
                            className="text-green-600 hover:text-green-900 font-medium transition hover:underline"
                          >
                            Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {bookings.length} bookings
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerBookings;

