import React, { useState, useEffect } from 'react';
import { Share2, Swords, Plus, HelpCircle, Trophy, BookOpen, Clock } from 'lucide-react';

const HubAndArenaPage = ({ user, token, API_BASE }) => {
  const [subTab, setSubTab] = useState('hub'); // 'hub' or 'arena'
  const [experiences, setExperiences] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedContest, setSelectedContest] = useState('DSA Contest');
  const [loading, setLoading] = useState(false);

  // Experience share form fields
  const [showShareForm, setShowShareForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [roundsText, setRoundsText] = useState('');
  const [questionsText, setQuestionsText] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [status, setStatus] = useState('Selected');

  useEffect(() => {
    if (subTab === 'hub') {
      fetchExperiences();
    } else {
      fetchLeaderboard(selectedContest);
    }
  }, [subTab, selectedContest]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hub/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (contest) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/battle/leaderboard/${contest}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const rounds = roundsText.split('\n').filter(r => r.trim() !== '');
    const questions = questionsText.split('\n').filter(q => q.trim() !== '');

    try {
      const res = await fetch(`${API_BASE}/hub/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company, role, rounds, questions, difficulty, status })
      });
      if (res.ok) {
        alert("Thank you! Your experience has been submitted for coordination review.");
        setCompany('');
        setRole('');
        setRoundsText('');
        setQuestionsText('');
        setShowShareForm(false);
        fetchExperiences();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinBattle = async () => {
    const mockScores = [75, 80, 85, 90, 95];
    const userScore = mockScores[Math.floor(Math.random() * mockScores.length)];
    
    if (!window.confirm(`Launch battle simulator for ${selectedContest}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/battle/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: userScore,
          contestName: selectedContest
        })
      });
      if (res.ok) {
        alert(`Contest Completed! You scored ${userScore}/100. Check the global leaderboard.`);
        fetchLeaderboard(selectedContest);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Placement Hub & Battle Arena</h2>
          <p className="text-xs text-slate-400">Share previous recruitment experiences or challenge colleagues in mock battles</p>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex bg-slate-900/60 p-1 rounded-lg border border-white/5 w-fit">
        <button
          onClick={() => setSubTab('hub')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
            subTab === 'hub' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Interview Experience Hub
        </button>
        <button
          onClick={() => setSubTab('arena')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
            subTab === 'arena' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Placement Battle Arena
        </button>
      </div>

      {subTab === 'hub' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Main Experience Logs List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-semibold text-white">Recent Interview Reviews</h3>
              <button
                onClick={() => setShowShareForm(!showShareForm)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Share Experience
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading experiences...</div>
            ) : experiences.length > 0 ? (
              experiences.map((exp) => (
                <div key={exp._id} className="glass-panel p-5 rounded-2xl space-y-3 relative">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2">
                    <div>
                      <span className="text-xs font-black text-white">{exp.company}</span>
                      <p className="text-[10px] text-slate-400 font-medium">{exp.role} • {exp.userName}</p>
                    </div>

                    <div className="flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        exp.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : exp.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {exp.difficulty}
                      </span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">
                        {exp.status}
                      </span>
                    </div>
                  </div>

                  {/* Rounds details */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Recruitment Rounds</span>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.rounds.map((rnd, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 border border-white/5 text-slate-300 px-2.5 py-0.5 rounded">
                          {rnd}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Questions details */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Questions Recalled</span>
                    <ul className="space-y-1 pl-4 list-disc">
                      {exp.questions.map((q, idx) => (
                        <li key={idx} className="text-xs text-slate-400 leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">No experience review sheets logged. Be the first to share!</div>
            )}
          </div>

          {/* Share Experience form card */}
          <div className="lg:col-span-2">
            {showShareForm && (
              <div className="glass-panel p-6 rounded-2xl space-y-4 border border-blue-500/20">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Share2 className="w-5 h-5 text-blue-450" />
                  <h3 className="text-sm font-semibold text-white">Share Interview Experience</h3>
                </div>

                <form onSubmit={handleShareSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Company Name</label>
                    <input 
                      type="text" required placeholder="Google" value={company} onChange={e => setCompany(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Hiring Role</label>
                    <input 
                      type="text" required placeholder="Software Engineer Intern" value={role} onChange={e => setRole(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Interview Rounds (One per line)</label>
                    <textarea 
                      required placeholder="Coding OA&#10;Technical DSA Round" value={roundsText} onChange={e => setRoundsText(e.target.value)}
                      className="w-full h-20 bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue resize-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Questions Recalled (One per line)</label>
                    <textarea 
                      required placeholder="Reverse linked list.&#10;System architecture basics." value={questionsText} onChange={e => setQuestionsText(e.target.value)}
                      className="w-full h-24 bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Difficulty</label>
                      <select 
                        value={difficulty} onChange={e => setDifficulty(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Selection Status</label>
                      <select 
                        value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neonBlue"
                      >
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow"
                  >
                    Post Interview Review
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Contest challenges list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-2">Active Battle arenas</h3>

            {['DSA Contest', 'Resume Battle', 'Mock Interview Arena'].map((contest) => (
              <div 
                key={contest} 
                onClick={() => setSelectedContest(contest)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                  selectedContest === contest 
                    ? 'bg-blue-600/10 border-blue-500/40 hover:border-blue-500/60' 
                    : 'bg-slate-900/35 border-white/5 hover:border-blue-500/25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Swords className={`w-5 h-5 ${selectedContest === contest ? 'text-blue-450 animate-pulse' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-200">{contest}</span>
                    <p className="text-[9px] text-slate-500">Weekly Competitive Event</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Active</span>
              </div>
            ))}

            <button
              onClick={handleJoinBattle}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow shadow-blue-600/10"
            >
              <Swords className="w-3.5 h-3.5" /> Start Arena Challenge
            </button>
          </div>

          {/* Leaderboard tables */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-white">{selectedContest} Rankings</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-xs">Fetching rankings...</div>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((usr, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-white/5 rounded-lg text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-350/20' : idx === 2 ? 'bg-amber-700/20 text-amber-700 border border-amber-800/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-200">{usr.userName || 'Student'}</span>
                    </div>

                    <span className="text-neonBlue font-extrabold">{usr.score} Points</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No scoreboard entries compiled yet. Complete a battle simulator check to score points.</div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default HubAndArenaPage;
