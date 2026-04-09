import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCurrentUser } from "../api/authApi"
import { getCase, updateCase } from "../api/caseApi"
import { getLawyers } from "../api/lawyerApi"
import taskApi, { createTask, getTasksByCase, updateTask, deleteTask } from "../api/taskApi"
import documentApi, { uploadDocument, getDocumentsByCase, deleteDocument, downloadDocument } from "../api/documentApi"

const CaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [caseRecord, setCaseRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [lawyers, setLawyers] = useState([])
  const [formData, setFormData] = useState({})
  const [tasks, setTasks] = useState([])
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedLawyerId: '', dueDate: '' })
  const [editingTask, setEditingTask] = useState(null)
  const [documents, setDocuments] = useState([])
  const [documentLoading, setDocumentLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [socket, setSocket] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCase()
    fetchLawyers()
  }, [id])

  useEffect(() => {
    if (caseRecord?.id) {
      fetchTasks(caseRecord.id)
      fetchDocuments(caseRecord.id)
      fetchChatMessages(caseRecord.id)
      joinCaseChat(caseRecord.id)
    }
  }, [caseRecord?.id])

  const fetchCase = async () => {
    try {
      const data = await getCase(id)
      setCaseRecord(data)
      setFormData({
        title: data.title,
        description: data.description,
        lawyerId: data.lawyerId,
        status: data.status,
        hearingDates: data.hearingDates
      })
    } catch (err) {
      setError('Failed to load case')
    } finally {
      setLoading(false)
    }
  }

  const fetchLawyers = async () => {
    try {
      const data = await getLawyers()
      setLawyers(data)
    } catch (_) {}
  }

  const fetchTasks = async (caseId) => {
    try {
      const data = await getTasksByCase(caseId)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const newTask = await createTask({
        caseId: caseRecord.id,
        ...taskForm
      })
      setTasks([...tasks, newTask])
      setTaskForm({ title: '', description: '', assignedLawyerId: '', dueDate: '' })
    } catch (err) {
      setError('Failed to create task')
    }
  }

  const handleUpdateTask = async (taskId) => {
    try {
      const updatedTask = await updateTask(taskId, taskForm)
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
      setEditingTask(null)
      setTaskForm({ title: '', description: '', assignedLawyerId: '', dueDate: '' })
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateCase(id, formData)
      fetchCase()
      setEditing(false)
    } catch (err) {
      setError('Failed to update case')
    }
  }

  if (loading) return <div className="p-8 text-white text-center">Loading...</div>
  if (!caseRecord) return <div className="p-8 text-white text-center">Case not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-indigo-300 mb-8 text-lg font-medium flex items-center gap-2">
          ← Back to Cases
        </button>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{caseRecord.title}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                caseRecord.status === 'open' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                caseRecord.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              }`}>
                {caseRecord.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <button onClick={() => setEditing(!editing)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium">
              {editing ? 'Cancel' : 'Edit Case'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Assigned Lawyer</label>
                  <select 
                    value={formData.lawyerId}
                    onChange={(e) => setFormData({...formData, lawyerId: e.target.value})}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="">Unassigned</option>
                    {lawyers.map(lawyer => (
                      <option key={lawyer.id} value={lawyer.id}>{lawyer.name} ({lawyer.specialization})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Hearing Dates</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.hearingDates?.map((date, index) => (
                    <span key={index} className="bg-slate-700 px-3 py-1 rounded-full text-sm text-gray-300">
                      {new Date(date).toLocaleDateString()}
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, hearingDates: formData.hearingDates.filter((_, i) => i !== index) })}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="date"
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (newDate) {
                      setFormData({
                        ...formData, 
                        hearingDates: [...(formData.hearingDates || []), newDate]
                      });
                    }
                  }}
                  className="p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-bold">
                Update Case
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{caseRecord.description}</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Case Chat</h3>
                <div className="h-96 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`mb-3 p-3 rounded-lg ${msg.senderId === user.id ? 'bg-blue-600 ml-auto text-right' : 'bg-slate-700'}`}>
                      <div className="text-xs text-gray-400 mb-1">{msg.sender.name}</div>
                      <div>{msg.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        socket.emit('send_message', {
                          caseId: caseRecord.id,
                          senderId: user.id,
                          receiverId: caseRecord.lawyerId || caseRecord.clientId,  // opposite party
                          message: chatInput
                        });
                        setChatInput('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (chatInput.trim()) {
                        socket.emit('send_message', {
                          caseId: caseRecord.id,
                          senderId: user.id,
                          receiverId: caseRecord.lawyerId || caseRecord.clientId,
                          message: chatInput
                        });
                        setChatInput('');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                  >
                    Send
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Client</h3>
                  <p className="text-gray-300">{caseRecord.client?.name} ({caseRecord.client?.email})</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Assigned Lawyer</h3>
                  <p className="text-gray-300">{caseRecord.lawyer?.User?.name || 'Unassigned'}</p>
                </div>
              </div>
              {caseRecord.hearingDates && caseRecord.hearingDates.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Hearing Dates</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseRecord.hearingDates.map((date, index) => (
                      <span key={index} className="bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-sm text-indigo-300">
                        {new Date(date).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseDetail

