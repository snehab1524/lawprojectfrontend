import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../api/articleApi.js';
import Navbar from '../components/Navbar';

const FALLBACK_ARTICLE_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="%234f46e5"/><stop offset="1" stop-color="%230f172a"/></linearGradient></defs><rect width="800" height="400" fill="url(%23g)"/><text x="50%25" y="50%25" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="%23ffffff">Legal Article</text></svg>';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticles();
        setArticles(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // Latest first
        setError("");
      } catch (err) {
        setError(err?.response?.data?.error || 'Unable to load articles right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xl text-gray-500">Loading latest legal news...</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent mb-6">
            Latest Legal News & Articles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest legal developments, case laws, and expert insights from our legal team.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            {error}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h8v8H7V8z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles yet</h3>
            <p className="text-gray-500 mb-8">Check back soon for latest legal updates.</p>
            <Link 
              to="/admin" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-lg"
            >
              Publish First Article
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
{article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_ARTICLE_IMAGE;
                    }}
                  />
                ) : article.videoUrl ? (
                  <div className="h-48 bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-white absolute z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-white text-lg font-semibold truncate max-w-[80%] px-4 text-center">
                        {article.videoUrl.slice(0, 50)}...
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white opacity-75" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                )}
                <div className="p-8">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {article.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                    {article.content}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">Published by Admin</span>
                      <span className="text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {article.videoUrl && (
                      <div className="pt-2">
                        <a 
                          href={article.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 text-sm font-medium underline decoration-indigo-200"
                        >
                          ▶️ Watch Video
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Articles;

