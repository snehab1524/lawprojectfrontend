import { useEffect, useState } from "react"
import { getAllAdvices, answerAdvice } from "../api/adviceApi"
import { getCurrentUser } from "../api/authApi"

const AdviceSection = () => {
  const [advices, setAdvices] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState({})
  const [success, setSuccess] = useState({})

  useEffect(() => {
    fetchAdvices()
  }, [])

  const fetchAdvices = async () => {
    try {
      const response = await getAllAdvices()
      setAdvices(response.data)
    } catch (err) {
      console.error('Error fetching advice:', err)
    }
  }

  const handleAnswer = async (adviceId) => {
    const answer = answers[adviceId]
    if (!answer || answer.trim() === '') return

    setLoading(prev => ({...prev, [adviceId]: true}))
    try {
      await answerAdvice(adviceId, answer)
      setSuccess(prev => ({...prev, [adviceId]: true}))
      setTimeout(() => {
        setSuccess(prev => ({...prev, [adviceId]: false}))
        fetchAdvices()
      }, 2000)
    } catch (err) {
      alert('Failed to submit answer: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(prev => ({...prev, [adviceId]: false}))
    }
  }

  if (advices.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <h3 className="text-2xl font-semibold mb-4 text-white">No Advice Requests</h3>
        <p>Pending questions will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {advices.map(advice => (
        <div key={advice.id} className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{advice.category}</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">{advice.question}</p>
              <div className="text-sm text-gray-400">
                Client: {advice.client?.name} | Asked: {new Date(advice.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              advice.status === 'answered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {advice.status.toUpperCase()}
            </span>
          </div>

          {advice.status === 'pending' && (
            <div className="space-y-4">
              <textarea 
                value={answers[advice.id] || ''}
                onChange={(e) => setAnswers({...answers, [advice.id]: e.target.value})}
                placeholder="Provide your expert legal advice..."
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[120px] resize-vertical"
                rows="4"
              />
              <button 
                onClick={() => handleAnswer(advice.id)}
                disabled={loading[advice.id] || !answers[advice.id]?.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading[advice.id] ? "Submitting..." : "Submit Answer"}
              </button>
              {success[advice.id] && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl backdrop-blur-sm">
                  ✅ Answer submitted successfully!
                </div>
              )}
            </div>
          )}

          {advice.answer && (
            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">Answer:</h4>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{advice.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AdviceSection
