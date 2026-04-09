const LawyerCard = ({ lawyer, onChat, onBook }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
      <img
        src={lawyer.profileImage}
        alt={lawyer.name}
        className="w-20 h-20 rounded-2xl object-cover shadow-lg mx-auto mb-6"
      />
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
        {lawyer.name}
      </h3>
      <p className="text-lg font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl mx-auto text-center mb-6 w-fit">
        {lawyer.specialization}
      </p>
      <div className="space-y-3 mb-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-yellow-400 text-2xl">⭐</span>
          <span className="text-2xl font-bold">{lawyer.rating.toFixed(1)}</span>
        </div>
        <p className="text-lg text-gray-600 font-medium">
          {lawyer.experience} years experience
        </p>
        <p className="text-xl font-bold text-emerald-600">
          ₹{lawyer.consultationFee?.toLocaleString() || 'TBD'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onChat(lawyer.id)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          💬 Chat
        </button>
        <button 
          onClick={() => onBook(lawyer.id)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          📅 Book
        </button>
      </div>
    </div>
  )
}

export default LawyerCard

