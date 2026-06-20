import React, { useState, useEffect } from 'react';
import { Award, Compass, TrendingUp, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const ReadinessPage = ({ token, API_BASE }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchReadiness();
  }, []);

  const fetchReadiness = async (isRecalculating = false) => {
    if (isRecalculating) setRecalculating(true);
    else setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/readiness/predict`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isRecalculating) setRecalculating(false);
      else setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const overallVal = predictions ? predictions.overallPlacementReadiness : 45;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Placement Readiness Predictor</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Track company eligibility indices computed from your resume, DSA progress, and communication tests</p>
        </div>
        <button
          onClick={() => fetchReadiness(true)}
          disabled={recalculating}
          className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} /> {recalculating ? 'Re-Evaluating...' : 'Re-Evaluate'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Core Dimensions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Circular Overall Score Card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Composite Placement Rating</h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  strokeWidth="10"
                  stroke="rgba(255,255,255,0.03)"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 58}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - overallVal / 100)}
                  strokeLinecap="round"
                  stroke="url(#readinessGrad)"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className={`absolute inset-0 flex flex-col items-center justify-center text-center z-10 transition-opacity duration-300 ${recalculating ? 'opacity-50' : 'opacity-100'}`}>
                <span className="text-4xl font-black text-slate-900 dark:text-white glow-text-purple">{overallVal}%</span>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Ready Index</p>
              </div>
            </div>

            <p className="text-xs text-slate-450 mt-4 leading-relaxed max-w-xs">
              Based on composite metrics: your technical knowledge is strong, but your mock speech scoring is pulling down FAANG eligibilities.
            </p>
          </div>

          {/* Breakdown parameters */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/5 pb-2">Capability Dimensions</h4>

            <div className="space-y-3.5">
              {[
                { title: 'Resume Fit', val: predictions ? predictions.resumeScore : 82, color: 'bg-blue-500' },
                { title: 'Communication Pacing', val: predictions ? predictions.communicationScore : 78, color: 'bg-purple-500' },
                { title: 'DSA Scope', val: predictions ? predictions.dsaScore : 80, color: 'bg-emerald-500' },
                { title: 'Project Modularity', val: predictions ? predictions.projectScore : 70, color: 'bg-rose-500' },
                { title: 'GitHub Health Rating', val: predictions ? predictions.githubScore : 75, color: 'bg-amber-500' }
              ].map((dim, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{dim.title}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{dim.val}%</span>
                  </div>
                  <div className="w-full bg-white dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className={`${dim.color} h-full rounded-full`} style={{ width: `${dim.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Company Eligibilities lists */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/5 pb-2">Target Placements Compatibility</h4>

            <div className="space-y-4">
              {predictions && predictions.predictions ? (
                predictions.predictions.map((p, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-white/5">
                          {p.company[0]}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.company}</span>
                      </div>
                      <span className={`font-extrabold ${p.score >= 85 ? 'text-emerald-400' : p.score >= 60 ? 'text-amber-400' : 'text-rose-450'}`}>
                        {p.score}% Match
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.score >= 85 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : p.score >= 60 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                            : 'bg-gradient-to-r from-rose-500 to-pink-500'
                        }`} 
                        style={{ width: `${p.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-6 text-xs">No prediction matrices processed.</div>
              )}
            </div>
          </div>

          {/* Actionable recommendations card */}
          <div className="glass-panel p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Recommended Next Steps</h5>
              <p className="text-xs text-slate-450 leading-relaxed">
                Add Docker and Redis to your Resume Analyzer. This will boost your Amazon score from {predictions ? predictions.predictions.find(p => p.company === 'Amazon')?.score || 55 : 55}% to 67%. Also complete 3 voice rounds in the Interview Coach.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReadinessPage;
