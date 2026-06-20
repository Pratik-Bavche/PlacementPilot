import React, { useEffect, useState } from 'react';
import { 
  Flame, Award, BookOpen, Briefcase, FileText, CheckCircle2, ChevronRight,
  TrendingUp, BarChart2, Star, Users, BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = ({ user, token, API_BASE, setTab }) => {
  const [stats, setStats] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch readiness prediction metrics
      const rRes = await fetch(`${API_BASE}/readiness/predict`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        setStats(rData);
      }

      // 2. Fetch current roadmap tasks
      const mapRes = await fetch(`${API_BASE}/roadmap`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mapRes.ok) {
        const mapData = await mapRes.json();
        setRoadmap(mapData);
      }
    } catch (e) {
      console.error("Error loading dashboard metrics", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (weekNumber, taskId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/roadmap/task`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weekNumber,
          taskId,
          completed: !currentStatus
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setRoadmap(updated);
        // Refresh prediction metrics
        const rRes = await fetch(`${API_BASE}/readiness/predict`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (rRes.ok) {
          const rData = await rRes.json();
          setStats(rData);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get active tasks (e.g. from Week 1 or first uncompleted tasks)
  const dailyTasks = [];
  if (roadmap && roadmap.weeks) {
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        if (!t.completed && dailyTasks.length < 3) {
          dailyTasks.push({ ...t, weekNumber: w.weekNumber });
        }
      });
    });
    // If no uncompleted tasks, display first few tasks
    if (dailyTasks.length === 0) {
      roadmap.weeks.slice(0, 1).forEach(w => {
        w.tasks.slice(0, 3).forEach(t => {
          dailyTasks.push({ ...t, weekNumber: w.weekNumber });
        });
      });
    }
  }

  const readinessVal = stats ? stats.overallPlacementReadiness : (user.readinessScore || 45);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Welcome Card */}
        <motion.div whileHover={{ scale: 1.01 }} className="md:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-neonBlue/5 rounded-full blur-3xl pulse-glow-bg"></div>
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-neonBlue bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 w-fit">
              <BrainCircuit className="w-3.5 h-3.5" />
              Active AI Guidance
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hello, {user.name}!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              Your AI Mentor suggests preparing for <span className="text-slate-900 dark:text-white font-semibold">{user.targetCompany || 'Google'}</span> SDE interviews. Solve dynamic programming challenges and review your resume keywords to accelerate your readiness score.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setTab('twin')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Talk to AI Mentor <ChevronRight className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setTab('roadmap')}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                View Learning Roadmap
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/5 w-36">
            <Flame className="w-10 h-10 text-orange-500 animate-pulse fill-orange-500/20" />
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{user.streak || 1} Days</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Current Streak</span>
          </div>
        </motion.div>

        {/* Readiness Circular Score Widget */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Overall Placement Readiness</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                strokeWidth="10"
                stroke="rgba(255,255,255,0.03)"
                fill="transparent"
              />
              {/* Foreground Gradient Circle */}
              <circle
                cx="64"
                cy="64"
                r="52"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - readinessVal / 100)}
                strokeLinecap="round"
                stroke="url(#bluePurpleGradient)"
                fill="transparent"
              />
              <defs>
                <linearGradient id="bluePurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center z-10">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white glow-text-blue">{readinessVal}%</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Readiness Score</p>
            </div>
          </div>
          <button 
            onClick={() => setTab('readiness')}
            className="mt-4 text-xs font-semibold text-neonBlue hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors"
          >
            Check Company Eligibility <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

      </div>

      {/* Grid of Scores Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-4 rounded-xl space-y-1 bg-slate-50 dark:bg-slate-900/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Resume Score</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats ? stats.resumeScore : 82}/100</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full" style={{ width: `${stats ? stats.resumeScore : 82}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1 bg-slate-100/80 dark:bg-slate-900/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Communication</span>
            <BrainCircuit className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats ? stats.communicationScore : 78}/100</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-violet-400 h-full rounded-full" style={{ width: `${stats ? stats.communicationScore : 78}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1 bg-slate-100/80 dark:bg-slate-900/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">DSA Progress</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats ? stats.dsaScore : 80}/100</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stats ? stats.dsaScore : 80}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1 bg-slate-100/80 dark:bg-slate-900/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">GitHub Health</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats ? stats.githubScore : 75}/100</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${stats ? stats.githubScore : 75}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1 bg-slate-100/80 dark:bg-slate-900/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Project Score</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats ? stats.projectScore : 70}/100</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-400 h-full rounded-full" style={{ width: `${stats ? stats.projectScore : 70}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1 bg-slate-100/80 dark:bg-slate-900/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Target company</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.targetCompany || 'Google'}</p>
          <div className="text-[9px] text-indigo-300 font-medium">Predicted for {user.predictedTimeline || 'Oct 2027'}</div>
        </motion.div>

      </div>

      {/* Main Grid: Tasks checklist vs Recommended Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Checklist */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Daily Learning Tasks</h3>
            </div>
            <button 
              onClick={() => setTab('roadmap')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
            >
              Configure Roadmap
            </button>
          </div>

          <div className="space-y-3">
            {dailyTasks.length > 0 ? (
              dailyTasks.map((t, idx) => (
                <div 
                  key={t.id || idx}
                  onClick={() => handleToggleTask(t.weekNumber, t.id, t.completed)}
                  className={`p-4 rounded-xl flex items-center justify-between border cursor-pointer transition-all duration-300 ${
                    t.completed 
                      ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40' 
                      : 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-slate-100/80 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      t.completed ? 'bg-emerald-500 border-emerald-500 text-slate-900 dark:text-white' : 'border-slate-600'
                    }`}>
                      {t.completed && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span className={`text-xs font-medium ${t.completed ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    Week {t.weekNumber}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No active tasks found. Go to the <span className="text-neonBlue underline cursor-pointer" onClick={() => setTab('roadmap')}>Roadmap Generator</span> to construct a plan.
              </div>
            )}
          </div>
        </div>

        {/* Recommended Companies Panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 dark:border-white/5 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recommended Companies</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Based on your capability matching model</p>
          </div>
          
          <div className="space-y-3.5">
            {stats && stats.predictions ? (
              stats.predictions.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-white/5">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{p.company[0]}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.company}</span>
                      <p className="text-[9px] text-slate-500 font-medium">Readiness Match</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-extrabold ${p.score >= 80 ? 'text-emerald-400' : p.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {p.score}%
                    </span>
                    <button 
                      onClick={() => {
                        user.targetCompany = p.company;
                        setTab('prep');
                      }}
                      className="p-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys'].map((company, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{company}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">Analyze to view</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
