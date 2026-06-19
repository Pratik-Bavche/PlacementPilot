import React, { useState, useEffect } from 'react';
import { Compass, Calendar, CheckSquare, Plus, RefreshCw, Star } from 'lucide-react';

const RoadmapPage = ({ user, token, API_BASE }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetCompany, setTargetCompany] = useState(user?.targetCompany || 'Google');
  const [goal, setGoal] = useState('SDE');

  const COMPANIES = [
    'Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 
    'Accenture', 'PhonePe', 'Razorpay', 'Uber', 'Flipkart'
  ];

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`${API_BASE}/roadmap`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetCompany, goal })
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate completion percentage
  let totalTasks = 0;
  let completedTasks = 0;
  if (roadmap && roadmap.weeks) {
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });
  }
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Personalized Learning Roadmap</h2>
        <p className="text-xs text-slate-400">Customized day-by-day learning tasks tailored to match your target placements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Settings Generator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Roadmap Parameters</h3>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neonBlue"
                >
                  {COMPANIES.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Career Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neonBlue"
                >
                  <option value="SDE">Software Development Engineer (SDE)</option>
                  <option value="Frontend Engineer">Frontend Specialist</option>
                  <option value="Backend Developer">Backend Specialist</option>
                  <option value="DevOps Engineer">DevOps & Cloud Engineer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/15"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    Re-Generate Core Track
                  </>
                )}
              </button>
            </form>

            {roadmap && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450 font-medium">Roadmap Progress</span>
                  <span className="text-neonBlue font-extrabold">{completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-neonBlue to-royalViolet h-full rounded-full transition-all duration-500" 
                    style={{ width: `${completionPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  Completing tasks raises your placement readiness predictions!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Tasks Tracker */}
        <div className="lg:col-span-3">
          {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
            <div className="space-y-4">
              {roadmap.weeks.map((week) => (
                <div key={week.weekNumber} className="glass-panel p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-black text-neonBlue uppercase tracking-wider">
                      Week {week.weekNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {week.title}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {week.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(week.weekNumber, task.id, task.completed)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                          task.completed
                            ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/30'
                            : 'bg-slate-900/30 border-white/5 hover:border-blue-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'
                          }`}>
                            {task.completed && <span className="text-[9px] font-bold">✓</span>}
                          </div>
                          <span className={`text-xs ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/10 text-slate-500 space-y-2">
              <Compass className="w-12 h-12 text-slate-650" />
              <h3 className="text-sm font-semibold text-slate-400">No Learning Roadmap Generated</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Select your target company parameters and goal, and launch a re-generation track.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default RoadmapPage;
