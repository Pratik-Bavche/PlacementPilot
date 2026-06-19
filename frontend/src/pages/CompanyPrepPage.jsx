import React, { useState, useEffect } from 'react';
import { 
  Building, BookOpen, Clock, HelpCircle, 
  ChevronRight, ArrowLeft, ArrowUpRight, ShieldAlert 
} from 'lucide-react';

const CompanyPrepPage = ({ user, token, API_BASE, updateProfile }) => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const COMPANIES = [
    'Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 
    'Accenture', 'PhonePe', 'Razorpay', 'Uber', 'Flipkart'
  ];

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyDetails(selectedCompany);
    }
  }, [selectedCompany]);

  // Set initial selected company based on user profile
  useEffect(() => {
    if (user && user.targetCompany && !selectedCompany) {
      setSelectedCompany(user.targetCompany);
    }
  }, [user]);

  const fetchCompanyDetails = async (name) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/company/${name}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyDetails(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetTarget = async () => {
    if (!selectedCompany) return;
    try {
      await updateProfile({ targetCompany: selectedCompany });
      alert(`Success: Target company set to ${selectedCompany}. We've aligned your readiness predictor models.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Company Prep Engine</h2>
        <p className="text-xs text-slate-400">Master hiring rounds, DSA topics, and core CS questions for top-tier companies</p>
      </div>

      {/* Directory Slider */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {COMPANIES.map((company, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCompany(company)}
            className={`px-4 py-2 rounded-lg text-xs font-bold shrink-0 border transition-all duration-300 ${
              selectedCompany === company
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
            }`}
          >
            {company}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : companyDetails ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview & Set Target */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/5 rounded-full blur-3xl pulse-glow-bg"></div>
              <div className="flex justify-between items-start z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center font-extrabold text-lg text-slate-300">
                    {selectedCompany[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedCompany}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Overview & Recruitment Path</span>
                  </div>
                </div>
                
                {user.targetCompany !== selectedCompany ? (
                  <button 
                    onClick={handleSetTarget}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold px-3 py-1.5 rounded transition-colors"
                  >
                    Set as Goal Company
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded font-semibold">
                    Current Placement Target Goal
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-350 leading-relaxed z-10 relative">{companyDetails.overview}</p>
              
              <div className="pt-2 border-t border-white/5 z-10 relative">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Hiring Pipeline Summary</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{companyDetails.process}</p>
              </div>
            </div>

            {/* Core Interview Rounds details */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Clock className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-semibold text-white">Specific Interview Stages</h4>
              </div>

              <div className="relative border-l border-white/10 ml-3 pl-5 space-y-5">
                {companyDetails.rounds && companyDetails.rounds.map((round, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle timeline index */}
                    <div className="absolute -left-[26px] top-0.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-darkCard"></div>
                    <span className="text-xs font-bold text-slate-200">Round {idx + 1}: {round}</span>
                    <p className="text-[11px] text-slate-550 mt-0.5">Focus areas: Speed code optimizations, correctness, behavioral parameters.</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Asked Q&A */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">Recruitment FAQs</h4>
              </div>

              <div className="space-y-4">
                {companyDetails.faqs && companyDetails.faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">Q: {faq.q}</span>
                    <p className="text-xs text-slate-400 leading-relaxed pl-4 border-l border-white/5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar Topics List */}
          <div className="space-y-6">
            
            {/* DSA Topics asked */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">DSA Algorithms Frequency</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {companyDetails.dsaTopics && companyDetails.dsaTopics.map((topic, idx) => (
                  <span key={idx} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-bold">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Tech CS Subjects */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Building className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-semibold text-white">Core Technical Subjects</h4>
              </div>
              <ul className="space-y-2">
                {companyDetails.techSubjects && companyDetails.techSubjects.map((sub, idx) => (
                  <li key={idx} className="text-xs text-slate-350 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                    {sub}
                  </li>
                ))}
              </ul>
            </div>

            {/* Behavioral Questions */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-semibold text-white">Sample Behavioral Prompts</h4>
              </div>
              <ul className="space-y-3">
                {companyDetails.behavioralQuestions && companyDetails.behavioralQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-slate-400 leading-relaxed border-l border-rose-500/30 pl-3">
                    "{q}"
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 text-xs">
          Select a target company to load prep materials.
        </div>
      )}

    </div>
  );
};

export default CompanyPrepPage;
