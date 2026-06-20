import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, RefreshCw, Star } from 'lucide-react';

const AtsAnalyzerPage = ({ token, API_BASE }) => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const fetchLatestAnalysis = async () => {
    try {
      const res = await fetch(`${API_BASE}/resume/latest`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    
    // Read file if text/plain
    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target.result);
    };
    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      // For PDF/DOCX mock reading text based on standard templates
      setResumeText(`
        PRATIK PATIL
        Software Engineering Student
        Skills: React, JavaScript, Node.js, Express, MongoDB, HTML, CSS.
        Experience: Built an E-Commerce portal backend using Node.js and React.
        Education: Bachelor of Engineering (Computer Engineering) - DYPCOE.
        Projects: Developed PlacementPilot AI frontend using Vite.
      `);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please copy-paste your resume text or upload a plain file first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/resume/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText })
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysis(data);
      } else {
        setError(data.message || 'Analysis failed');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">ATS Resume Analyzer</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Optimize your resume keyword frequency and layout formatting to bypass filters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload or Input Resume</h3>
            
            {/* File upload zone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
              <input 
                type="file" 
                accept=".txt,.pdf,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-350">
                {fileName ? `Loaded: ${fileName}` : 'Drag & Drop Resume (PDF, DOCX, TXT)'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Accepts text parsing or loads SDE demo resume</p>
            </div>

            <div className="flex items-center my-2 text-slate-500 text-xs justify-center font-bold">
              OR
            </div>

            {/* Paste text area */}
            <form onSubmit={handleAnalyze} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Paste Raw Resume Text</label>
                <textarea
                  className="w-full h-48 bg-slate-200/50 dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neonBlue transition-colors font-mono resize-none"
                  placeholder="Paste contents of your PDF here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
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
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    Run ATS Audit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {analysis ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              
              {/* Scores Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-neonBlue">{analysis.atsScore}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Score</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">ATS Quality Rating</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {analysis.atsScore >= 85 ? 'Highly Competitive Resume structure.' : analysis.atsScore >= 70 ? 'Good layout, needs technical keywords.' : 'Critical improvements needed.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Completeness: {analysis.completenessScore || 80}%
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Missing Key Skills & Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                    analysis.missingKeywords.map((kw, idx) => (
                      <span key={idx} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded font-medium">
                        + {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No critical keywords missing.</span>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Actionable Suggestions</h4>
                <ul className="space-y-2">
                  {analysis.suggestions && analysis.suggestions.length > 0 ? (
                    analysis.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-350 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500">None detected.</li>
                  )}
                </ul>
              </div>

              {/* Formatting Reviews */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format & Structure Audit</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysis.formattingReview && analysis.formattingReview.length > 0 ? (
                    analysis.formattingReview.map((rev, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-200/50 dark:bg-slate-950/30 rounded border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        {rev}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">Format is valid.</div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-slate-300 dark:border-white/10 text-slate-500 space-y-2">
              <FileText className="w-12 h-12 text-slate-650" />
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">No Active Audit Data</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Upload your latest resume or paste plain text content to run our AI-powered ATS checker.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AtsAnalyzerPage;
