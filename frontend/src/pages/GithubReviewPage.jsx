import React, { useState } from 'react';
import { Github, Play, CheckCircle, AlertTriangle, RefreshCw, Star } from 'lucide-react';

const GithubReviewPage = ({ token, API_BASE }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReview = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim() || !repoUrl.includes('github.com')) {
      setError('Please provide a valid GitHub repository URL');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/github/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setReview(data);
      } else {
        setError(data.message || 'Review execution failed');
      }
    } catch (err) {
      setError('Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">GitHub Project Reviewer</h2>
        <p className="text-xs text-slate-400">Scan repository structure, README files, documentation completeness, and code modularity ratings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Github className="w-5 h-5 text-slate-300" />
              <h3 className="text-sm font-semibold text-white">Select Project Repo</h3>
            </div>

            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">GitHub Repository Link</label>
                <input
                  type="text"
                  placeholder="https://github.com/username/project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-neonBlue transition-colors"
                />
              </div>

              {error && <div className="text-red-400 text-xs">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/15"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Scanning Codebase...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Audit Project
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results output */}
        <div className="lg:col-span-3">
          {review ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              
              {/* Score breakdown */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-neonBlue">{review.overallScore}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Total</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Repository Health Assessment</h3>
                    <p className="text-[11px] text-slate-400">
                      {review.overallScore >= 80 ? 'Highly robust and well-documented repository.' : review.overallScore >= 65 ? 'Good quality, requires better modular design.' : 'Critically lacks structure or README explanation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specific dimension ratings */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { title: 'Code Quality', score: review.codeQuality },
                  { title: 'Docs / README', score: review.documentation },
                  { title: 'Readability', score: review.readability },
                  { title: 'Scalability', score: review.scalability },
                  { title: 'Resume Impact', score: review.resumeImpact }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-lg p-2.5 text-center space-y-1">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block truncate">{item.title}</span>
                    <p className="text-sm font-extrabold text-white">{item.score}/10</p>
                  </div>
                ))}
              </div>

              {/* Actionable Suggestions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-350">Improvement Checklist</h4>
                <ul className="space-y-2.5">
                  {review.suggestions && review.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/10 text-slate-505 space-y-2">
              <Github className="w-12 h-12 text-slate-650" />
              <h3 className="text-sm font-semibold text-slate-400">No active scan loaded</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Provide your public GitHub repository URL link and run the AI analyzer to inspect files.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default GithubReviewPage;
