import { useState, useEffect } from 'react'
import { getCaseSummary, askLegalAI } from '../api/aiApi'
import { useParams } from 'react-router-dom'
import { MessageSquare, Brain, Lightbulb } from 'lucide-react'

const CaseAIAssistant = ({ caseRecord }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState('')

  useEffect(() => {
    if (caseRecord?.id) {
      fetchSummary()
    }
  }, [caseRecord?.id])

  const fetchSummary = async () => {
    try {
      const { summary: sum } = await getCaseSummary(caseRecord.id)
      setSummary(sum)
    } catch (err) {
      console.error('Summary error:', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setInput('')

    try {
      const { answer } = await askLegalAI({ 
        caseId: caseRecord.id, 
        question: input 
      })
      const aiMsg = { role: 'assistant', content: answer }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errorMsg = { role: 'assistant', content: 'Sorry, AI service temporarily unavailable. Please try again.' }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Legal Assistant</h2>
          <p className="text-gray-400">Ask about case summary, legal suggestions, or next steps</p>
        </div>
      </div>

      {/* Summary Button */}
      <button 
        onClick={() => setShowSummary(!showSummary)}
        className="mb-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
      >
        <Lightbulb className="w-5 h-5" />
        {showSummary ? 'Hide Summary' : 'Show Case Summary'}
      </button>

      {showSummary && (
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-3">Case Summary</h3>
          <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto bg-slate-900/50 border border-slate-700 rounded-2xl p-4 mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-3">
            <MessageSquare className="w-12 h-12 opacity-50" />
            <p>Ask me anything about this case!</p>
            <p className="text-sm">Examples: "Summarize the case", "What are next steps?", "Suggest legal strategy"</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-700 text-gray-200 rounded-bl-sm'}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Legal Assistant..."
          className="flex-1 p-4 bg-slate-700 border border-slate-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Send
        </button>
      </div>
    </div>
  )
}

export default CaseAIAssistant

