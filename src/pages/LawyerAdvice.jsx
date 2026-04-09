import { useEffect, useState } from "react"
import { getPendingAdvices, answerAdvice } from "../api/adviceApi"
import { getCurrentUser } from "../api/authApi"

const LawyerAdvice = () => {
  const [advices, setAdvices] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const user = getCurrentUser()

  useEffect(() => {
    if (user && user.role === "lawyer") {
      fetchPendingAdvices()
    }
  }, [user])

  const fetchPendingAdvices = async () => {
    try {
      setLoading(true)
      const response = await getPendingAdvices()
      setAdvices(response.data)
    } catch (err) {
      console.error('Error fetching advice:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (adviceId) => {
    const answer = answers[adviceId]
    if (!answer || !answer.trim()) {
      alert('Please enter an answer')
      return
    }
    try {
      await answerAdvice(adviceId, answer)
      // Refresh list
      fetchPendingAdvices()
      // Clear answer
      setAnswers(prev => ({ ...prev, [adviceId]: '' }))
    } catch (err) {
      alert('Failed to submit answer')
    }
  }

  if (loading) return <div className="flex-1 p-8 text-white">Loading...</div>

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Client Advice Requests</h1>
        {advices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <h3 className="text-2xl font-semibold mb-4 text-white">No pending requests</h3>
            <p>Advice requests will appear here</p>
          </div>
        ) : (
          advices.map(advice => (
            <div key={advice.id} className="bg-slate-800/50 p-6 mb-6 rounded-xl border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">{advice.category}</h3>
              <p className="text-gray-300 mb-4">{advice.question}</p>
              <div className="text-sm text-gray-400 mb-4">
                Client: {advice.client.name} | Asked: {new Date(advice.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-blue-400 mb-2">
                Response Type: <span className="font-semibold">{advice.responseType?.toUpperCase()}</span>
              </div>
              <textarea 
                value={answers[advice.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [advice.id]: e.target.value }))}
                placeholder="Your legal advice..."
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded mb-3 text-white"
                rows="4"
              />
              <button 
                onClick={() => handleAnswer(advice.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-medium"
              >
                Submit Answer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LawyerAdvice
