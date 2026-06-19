import React, { useState, useEffect } from 'react';
import { Kanban, Plus, Trash2, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';

const ApplicationTrackerPage = ({ token, API_BASE }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form fields
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState('Applied');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const STAGES = ['Applied', 'OA Scheduled', 'Interview Scheduled', 'Offer Extended', 'Rejected'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company, role, stage, salary, deadline, notes })
      });
      if (res.ok) {
        const newJob = await res.json();
        setJobs(prev => [...prev, newJob]);
        
        // Reset form
        setCompany('');
        setRole('');
        setStage('Applied');
        setSalary('');
        setDeadline('');
        setNotes('');
        setShowAddForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdvanceStage = async (id, currentStage) => {
    const currentIdx = STAGES.indexOf(currentStage);
    if (currentIdx === -1 || currentIdx === STAGES.length - 1) return;
    const nextStage = STAGES[currentIdx + 1];

    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: nextStage })
      });
      if (res.ok) {
        setJobs(prev => prev.map(job => job._id === id ? { ...job, stage: nextStage } : job));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setJobs(prev => prev.filter(job => job._id !== id));
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

  // Calculate success rates
  const offersCount = jobs.filter(j => j.stage === 'Offer Extended').length;
  const activeInterviews = jobs.filter(j => j.stage === 'Interview Scheduled' || j.stage === 'OA Scheduled').length;
  const totalApplied = jobs.length;
  const successRate = totalApplied > 0 ? Math.round((offersCount / totalApplied) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">Application Tracker</h2>
          <p className="text-xs text-slate-400">Manage job responses, online assessments, and dynamic schedule timelines</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Statistics dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Applications</span>
            <p className="text-2xl font-black text-white">{totalApplied}</p>
          </div>
          <Kanban className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Rounds</span>
            <p className="text-2xl font-black text-amber-500">{activeInterviews}</p>
          </div>
          <RefreshCw className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Offer Success Rate</span>
            <p className="text-2xl font-black text-emerald-500">{successRate}%</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/30" />
        </div>
      </div>

      {/* Add application form overlay/box */}
      {showAddForm && (
        <form onSubmit={handleAddJob} className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-blue-500/20">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Company Name</label>
            <input 
              type="text" required placeholder="Amazon" value={company} onChange={e => setCompany(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Target Role</label>
            <input 
              type="text" required placeholder="SDE Intern" value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Salary Package</label>
            <input 
              type="text" placeholder="12 LPA" value={salary} onChange={e => setSalary(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Submission Stage</label>
            <select 
              value={stage} onChange={e => setStage(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neonBlue"
            >
              {STAGES.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Deadline Date</label>
            <input 
              type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Additional Notes</label>
            <input 
              type="text" placeholder="Referral code applied." value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-white/5">
            <button 
              type="button" onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-slate-450 hover:text-white px-3 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Log Application
            </button>
          </div>
        </form>
      )}

      {/* Kanban Pipeline Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((currentStage) => {
          const stageJobs = jobs.filter(j => j.stage === currentStage);
          return (
            <div key={currentStage} className="bg-slate-900/35 border border-white/5 rounded-2xl p-4 space-y-4 shrink-0 min-w-[220px]">
              
              {/* Header column title */}
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-extrabold text-slate-300">{currentStage}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                  {stageJobs.length}
                </span>
              </div>

              {/* Jobs List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {stageJobs.map((job) => (
                  <div key={job._id} className="p-3 bg-slate-950/50 border border-white/5 hover:border-blue-500/20 rounded-xl space-y-2 relative group transition-all duration-300">
                    
                    {/* Trash delete */}
                    <button 
                      onClick={() => handleDeleteJob(job._id)}
                      className="absolute top-2 right-2 p-1 bg-slate-900 border border-white/5 rounded text-slate-500 hover:text-red-400 hover:border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <span className="text-xs font-bold text-slate-200 block truncate pr-5">{job.company}</span>
                      <span className="text-[10px] text-slate-500">{job.role}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-white/5">
                      <span className="text-[9px] text-slate-400">{job.salary || 'Salary N/A'}</span>
                      
                      {currentStage !== 'Offer Extended' && currentStage !== 'Rejected' && (
                        <button
                          onClick={() => handleAdvanceStage(job._id, currentStage)}
                          className="p-1 bg-slate-900 hover:bg-slate-850 rounded border border-white/5 text-slate-400 hover:text-white transition-colors"
                          title="Advance stage"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                  </div>
                ))}

                {stageJobs.length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-[10px]">Empty stage.</div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ApplicationTrackerPage;
