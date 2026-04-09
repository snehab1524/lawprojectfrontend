import { useEffect, useState } from "react"
import { getMyAdvices } from "../api/adviceApi"
import { getCurrentUser } from "../api/authApi"

const MyAdvice = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const res = await getMyAdvices()
        setData(res.data)
      } catch (err) {
        console.error("Error fetching advices:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="py-20 text-center">Loading...</div>
  if (!user) return <div className="py-20 text-center">Please login to view your questions.</div>

  return (
    <div className="max-w-3xl mx-auto py-20">
      <h1 className="text-3xl font-bold mb-6">My Legal Questions</h1>
      {data.length === 0 ? (
        <p>No questions yet. <a href="/get-advice" className="text-blue-400 underline">Ask one now</a></p>
      ) : (
        data.map((q) => (
          <div key={q.id} className="p-6 mb-4 bg-slate-800 rounded-lg">
            <h3 className="font-semibold mb-2">{q.category}</h3>
            <p className="mb-2">{q.question}</p>
            {q.answer && (
              <div className="bg-green-900 p-4 rounded mb-2">
                <strong>Lawyer Answer:</strong> {q.answer}
              </div>
            )}
            <div className="text-sm opacity-75">
              Status: <span className={`px-2 py-1 rounded text-xs ${q.status === 'answered' ? 'bg-green-600' : 'bg-yellow-600'}`}>{q.status}</span>
              {q.lawyer && ` | Lawyer: ${q.lawyer.name}`}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default MyAdvice
