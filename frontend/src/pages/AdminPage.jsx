import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle2, ShieldAlert, XCircle, RefreshCw } from 'lucide-react';

const AdminPage = ({ token, API_BASE }) => {
  const [users, setUsers] = useState([]);
  const [pendingExps, setPendingExps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all platform users
      const usersRes = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // 2. Fetch all experience posts (we filter out approved in frontend or fetch all)
      const expRes = await fetch(`${API_BASE}/hub/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (expRes.ok) {
        const expData = await expRes.json();
        // Moderate only pending (approved = false)
        setPendingExps(expData.filter(e => !e.approved));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExperience = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/experiences/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: true })
      });
      if (res.ok) {
        alert("Experience post approved successfully.");
        fetchAdminData();
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

  // Calculate statistics
  const totalStudents = users.filter(u => u.role === 'student').length;
  const avgReadiness = totalStudents > 0 
    ? Math.round(users.filter(u => u.role === 'student').reduce((acc, u) => acc + (u.readinessScore || 0), 0) / totalStudents)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Control Panel</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Review student statistics, moderate interview hubs, and adjust content guidelines</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:border-white/10 text-slate-350 hover:text-slate-900 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Data
        </button>
      </div>

      {/* Admin stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registered Students</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</p>
          </div>
          <Users className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Readiness Score</span>
            <p className="text-2xl font-black text-violet-400">{avgReadiness}%</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-violet-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Moderations</span>
            <p className="text-2xl font-black text-rose-500">{pendingExps.length}</p>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-500/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student directory list */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/5 pb-2">Student Directory</h3>
          
          <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {users.filter(u => u.role === 'student').map((stud) => (
              <div key={stud._id} className="flex justify-between items-center p-3.5 bg-slate-200/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{stud.name}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{stud.email} • Streak: {stud.streak} days</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-450 block uppercase tracking-wider">Goal: {stud.targetCompany}</span>
                  <span className="text-neonBlue font-black">{stud.readinessScore || 45}% Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience moderation queue */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/5 pb-2">Interview Hub Moderation</h3>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {pendingExps.map((exp) => (
              <div key={exp._id} className="p-3.5 bg-slate-200/50 dark:bg-slate-950/30 border border-slate-200 dark:border-white/5 rounded-xl space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{exp.company} ({exp.role})</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Submitted by: {exp.userName}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveExperience(exp._id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-colors"
                  >
                    Approve Post
                  </button>
                </div>
              </div>
            ))}

            {pendingExps.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">No pending moderation reviews.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminPage;
