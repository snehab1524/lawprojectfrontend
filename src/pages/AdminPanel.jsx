import { useState, useEffect } from "react";
import { login, getCurrentUser, logout } from "../api/authApi.js";
import { getArticles, createArticle, updateArticle, deleteArticle, getArticleById } from "../api/articleApi.js";
import { getJudges, createJudge, getJudgeById, updateJudge, deleteJudge } from "../api/judgeApi.js";
import JudgeCard from "../components/JudgeCard.jsx";

const AdminPanel = () => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
const [editVideoUrl, setEditVideoUrl] = useState("");

  const [judges, setJudges] = useState([]);
  const [judgeName, setJudgeName] = useState("");
  const [judgeCourt, setJudgeCourt] = useState("");
  const [judgeSpecialization, setJudgeSpecialization] = useState("");
  const [judgeExperience, setJudgeExperience] = useState("");
  const [judgeBio, setJudgeBio] = useState("");
  const [judgeImageUrl, setJudgeImageUrl] = useState("");
  const [judgeRating, setJudgeRating] = useState("");
  const [editingJudgeId, setEditingJudgeId] = useState(null);
  const [editJudgeName, setEditJudgeName] = useState("");
  const [editJudgeCourt, setEditJudgeCourt] = useState("");
  const [editJudgeSpecialization, setEditJudgeSpecialization] = useState("");
  const [editJudgeExperience, setEditJudgeExperience] = useState("");
  const [editJudgeBio, setEditJudgeBio] = useState("");
  const [editJudgeImageUrl, setEditJudgeImageUrl] = useState("");
  const [editJudgeRating, setEditJudgeRating] = useState("");;

  const fetchArticles = async () => {
    const res = await getArticles();
    setArticles(res.data);
  };

  const fetchJudges = async () => {
    const res = await getJudges();
    setJudges(res.data);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.role === "admin" || currentUser.role === "lawyer")) {
      setUser(currentUser);
      setMode("dashboard");
      fetchArticles();
      fetchJudges();
    } else if (currentUser) {
      logout();
      setError("Access restricted to Admin/Lawyer");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.target);
    await login(Object.fromEntries(formData));
    const currentUser = getCurrentUser();
    if (['admin', 'lawyer'].includes(currentUser.role)) {
      setUser(currentUser);
      setMode("dashboard");
      fetchArticles();
    } else {
      logout();
      setError("Admin or Lawyer access only");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('Registration disabled. Use seeded admin.');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setMode("login");
    setArticles([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (user.role !== "admin") {
      setError("Create: Admin only");
      return;
    }
    await createArticle({ title, content, category, imageUrl, videoUrl });
    setTitle("");
    setContent("");
    setCategory("");
    setImageUrl("");
    setVideoUrl("");
    fetchArticles();
  };

  const handleEdit = async (id) => {
    const res = await getArticleById(id);
    const art = res.data;
    setEditTitle(art.title);
    setEditContent(art.content);
    setEditCategory(art.category);
    setEditImageUrl(art.imageUrl || '');
    setEditVideoUrl(art.videoUrl || '');
    setEditingId(id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateArticle(editingId, { title: editTitle, content: editContent, category: editCategory, imageUrl: editImageUrl, videoUrl: editVideoUrl });
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory("");
    setEditImageUrl("");
    setEditVideoUrl("");
    fetchArticles();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete article?")) return;
    if (user.role !== "admin") {
      setError("Delete: Admin only");
      return;
    }
    await deleteArticle(id);
    fetchArticles();
  };

  const isAdminUser = user?.role === "admin";

  if (mode === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Admin Panel</h2>
          <p className="text-center text-gray-600 mb-8">Admin or Lawyer access</p>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input name="email" type="email" placeholder="Email" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-black" />
            <input name="password" type="password" placeholder="Password" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-black" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 text-black">
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
          {error && <p className="text-red-600 text-center p-4 bg-red-50 rounded-xl">{error}</p>}
          <button type="button" onClick={() => setMode("register")} className="w-full text-blue-600 hover:text-blue-500 font-semibold text-black">
            Create Admin Account
          </button>
        </div>
      </div>
    );
  }

  if (mode === "register") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Admin Register</h2>
          <form className="space-y-4" onSubmit={handleRegister}>
            <input name="name" type="text" placeholder="Name" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-black" />
            <input name="email" type="email" placeholder="Email" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-black" />
            <input name="password" type="password" placeholder="Password" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-black" />
            <button type="submit" className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-green-700 text-black">
              Register
            </button>
          </form>
          {error && <p className="text-red-600 text-center p-4 bg-red-50 rounded-xl">{error}</p>}
          <button type="button" onClick={() => setMode("login")} className="w-full text-blue-600 hover:text-blue-500 font-semibold text-black">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                isAdminUser ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdminUser ? 'ADMIN' : 'LAWYER'}
              </span>
              <span className="text-gray-900 font-semibold">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl mb-8 max-w-2xl mx-auto text-black">
            {error}
          </div>
        )}

        {/* Create Article */}
        <div className="bg-white shadow-xl rounded-3xl p-10 mb-12">

        {/* Create Judge */}
        <div className="bg-white shadow-xl rounded-3xl p-10 mb-12 mt-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Judge Flashcard</h2>
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
              Admin & Lawyer: Full CRUD
            </span>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            createJudge({
              name: judgeName,
              court: judgeCourt,
              specialization: judgeSpecialization,
              experience: parseInt(judgeExperience),
              bio: judgeBio,
              imageUrl: judgeImageUrl,
              rating: parseFloat(judgeRating) || 0
            }).then(() => {
              setJudgeName("");
              setJudgeCourt("");
              setJudgeSpecialization("");
              setJudgeExperience("");
              setJudgeBio("");
              setJudgeImageUrl("");
              setJudgeRating("");
              fetchJudges();
            }).catch(err => setError(err.response?.data?.message || 'Error creating judge'));
          }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Name</label>
              <input type="text" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="Judge Full Name" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Court</label>
              <input type="text" value={judgeCourt} onChange={(e) => setJudgeCourt(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="Supreme Court, High Court etc." required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Specialization</label>
              <input type="text" value={judgeSpecialization} onChange={(e) => setJudgeSpecialization(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="Criminal Law, Constitutional" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Experience (years)</label>
              <input type="number" value={judgeExperience} onChange={(e) => setJudgeExperience(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="25" required />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Bio</label>
              <textarea rows="4" value={judgeBio} onChange={(e) => setJudgeBio(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="Brief bio and notable cases..." required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Image URL</label>
              <input type="url" value={judgeImageUrl} onChange={(e) => setJudgeImageUrl(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="Judge photo URL" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" value={judgeRating} onChange={(e) => setJudgeRating(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" placeholder="4.5" />
            </div>
            <button type="submit" className="lg:col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:from-emerald-700 hover:to-teal-700 shadow-2xl transform hover:scale-105 transition-all">
              👨‍⚖️ Add Judge Flashcard
            </button>
          </form>
        </div> 
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Article</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              isAdminUser ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {isAdminUser ? "Admin: Full Access" : "Lawyer: Edit Only"}
            </span>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" 
                placeholder="Enter article title"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Category</label>
              <input 
                type="text" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" 
                placeholder="e.g. Criminal Law"
                required 
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Content</label>
              <textarea 
                rows="8" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg resize-vertical" 
                placeholder="Write detailed article content..."
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Image URL (optional)</label>
              <input 
                type="url" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" 
                placeholder="https://example.com/image.jpg" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Video URL (optional)</label>
              <input 
                type="url" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black shadow-lg" 
                placeholder="https://youtube.com/watch?v=..." 
              />
            </div>
            <button 
              type="submit" 
              disabled={!isAdminUser}
              className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 shadow-2xl transform hover:scale-105 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:text-gray-200"
            >
              {isAdminUser ? "🚀 Publish Article" : "👤 Lawyer: Create Disabled"}
            </button>
          </form>
        </div>

        {/* Judges Grid */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden mb-12">
          <div className="p-8 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-3xl font-bold text-gray-900">Judges Flashcards ({judges.length})</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {judges.map((judge) => (
              <div key={judge.id} className="group">
                <JudgeCard judge={judge} />
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setEditJudgeName(judge.name || '');
                      setEditJudgeCourt(judge.court || '');
                      setEditJudgeSpecialization(judge.specialization || '');
                      setEditJudgeExperience(judge.experience?.toString() || '');
                      setEditJudgeBio(judge.bio || '');
                      setEditJudgeImageUrl(judge.imageUrl || '');
                      setEditJudgeRating(judge.rating?.toString() || '');
                      setEditingJudgeId(judge.id);
                    }} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm(`Delete judge ${judge.name}?`)) {
                        await deleteJudge(judge.id);
                        fetchJudges();
                      }
                    }} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {judges.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500">
                <p className="text-2xl mb-4">No Judges Yet</p>
                <p>Use the form above to add judge flashcards!</p>
              </div>
            )}
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden"> 
          <div className="p-8 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-3xl font-bold text-gray-900">Articles ({articles.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Title</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Category</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Image</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Video</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Created</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-8 py-6 text-black font-semibold">{article.title}</td>
                    <td className="px-8 py-6 text-black">{article.category}</td>
                    <td className="px-8 py-6">
                      {article.imageUrl ? (
                        <a href={article.imageUrl} target="_blank" className="text-blue-600 hover:underline text-black">🖼️ View</a>
                      ) : '—'}
                    </td>
                    <td className="px-8 py-6">
                      {article.videoUrl ? (
                        <a href={article.videoUrl} target="_blank" className="text-blue-600 hover:underline text-black">▶️ View</a>
                      ) : '—'}
                    </td>
                    <td className="px-8 py-6 text-black">{new Date(article.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 space-x-3">
                      <button 
                        onClick={() => handleEdit(article.id)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-md"
                      >
                        Edit
                      </button>
                      {isAdminUser && (
                        <button 
                          onClick={() => handleDelete(article.id)} 
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-md"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
{editingJudgeId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">
            <div className="bg-white rounded-3xl p-10 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Edit Judge Flashcard</h2>
                <button onClick={() => setEditingJudgeId(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await updateJudge(editingJudgeId, {
                  name: editJudgeName,
                  court: editJudgeCourt,
                  specialization: editJudgeSpecialization,
                  experience: parseInt(editJudgeExperience),
                  bio: editJudgeBio,
                  imageUrl: editJudgeImageUrl,
                  rating: parseFloat(editJudgeRating) || 0
                });
                setEditingJudgeId(null);
                Object.assign(editJudgeName, editJudgeCourt, etc = "");
                fetchJudges();
              }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Name</label>
                  <input type="text" value={editJudgeName} onChange={(e) => setEditJudgeName(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Court</label>
                  <input type="text" value={editJudgeCourt} onChange={(e) => setEditJudgeCourt(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Specialization</label>
                  <input type="text" value={editJudgeSpecialization} onChange={(e) => setEditJudgeSpecialization(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Experience</label>
                  <input type="number" value={editJudgeExperience} onChange={(e) => setEditJudgeExperience(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" required />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Bio</label>
                  <textarea rows="4" value={editJudgeBio} onChange={(e) => setEditJudgeBio(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Image URL</label>
                  <input type="url" value={editJudgeImageUrl} onChange={(e) => setEditJudgeImageUrl(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Rating</label>
                  <input type="number" min="0" max="5" step="0.1" value={editJudgeRating} onChange={(e) => setEditJudgeRating(e.target.value)} className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" />
                </div>
                <div className="lg:col-span-2 flex space-x-4 mt-8">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all">
                    Update Judge
                  </button>
                  <button type="button" onClick={() => setEditingJudgeId(null)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {editingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">
            <div className="bg-white rounded-3xl p-10 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Edit Article</h2>
                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>
              <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Title</label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 shadow-lg text-black" 
                    required 
                  />
                </div>
                {/* Similar for other fields */}
                <div className="lg:col-span-2 flex space-x-4 mt-8">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all">
                    Update Article
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
