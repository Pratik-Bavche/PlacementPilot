import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, Play, AlertTriangle, 
  CheckCircle, MessageSquare, RefreshCw, BarChart2 
} from 'lucide-react';

const InterviewPage = ({ user, token, API_BASE }) => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [history, setHistory] = useState([]);
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  
  const recognitionRef = useRef(null);

  const QUESTIONS = [
    "Tell me about yourself and your academic background.",
    "What are your greatest technical strengths and your major area of weakness?",
    "Describe a time you worked in a team and faced a major conflict. How did you resolve it?",
    "Why do you want to join our company and where do you see yourself in five years?",
    "Describe a challenging project you built. What were the outcomes and what did you learn?"
  ];

  const EXERCISE_PROMPTS = [
    "Read this clearly: Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?",
    "Read this paragraph aloud: The quick brown fox jumps over the lazy dog. It is an english pangram.",
    "Speak about your favorite hobby for 1 minute continuously without using filler words."
  ];

  useEffect(() => {
    fetchHistory();
    // Initialize Web Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTrans) {
          setAnswerText(prev => prev + finalTrans);
        }
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/interview/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startSession = (exercise = false) => {
    setIsExerciseMode(exercise);
    setSessionStarted(true);
    setQuestionIndex(0);
    setEvaluation(null);
    setAnswerText('');
    speakQuestion(exercise ? EXERCISE_PROMPTS[0] : QUESTIONS[0]);
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speaking
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Select a neat English voice if available
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (defaultVoice) utterance.voice = defaultVoice;
      utterance.rate = 0.95; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser. Please type your answer directly.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setAnswerText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleNextQuestion = () => {
    const currentList = isExerciseMode ? EXERCISE_PROMPTS : QUESTIONS;
    if (questionIndex < currentList.length - 1) {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      setEvaluation(null);
      setAnswerText('');
      speakQuestion(currentList[nextIdx]);
    } else {
      // End session
      setSessionStarted(false);
      fetchHistory();
      alert("Session completed! We have logged your performance in your dashboard analytics.");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      alert("Please record or write your answer before submitting.");
      return;
    }

    setLoadingEval(true);
    try {
      const currentList = isExerciseMode ? EXERCISE_PROMPTS : QUESTIONS;
      const res = await fetch(`${API_BASE}/interview/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: currentList[questionIndex],
          answer: answerText,
          company: user.targetCompany,
          role: isExerciseMode ? 'Speaking Exercise' : 'SDE Intern'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEvaluation(data);
      } else {
        alert(data.message || 'Evaluation error');
      }
    } catch (e) {
      alert('Failed to connect to AI evaluation engine.');
    } finally {
      setLoadingEval(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">AI HR Interview Simulator</h2>
        <p className="text-xs text-slate-400">Practice behavioral rounds with real-time vocal feedback, speech cadence analytics, and grammar ratings</p>
      </div>

      {!sessionStarted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Landing Card */}
          <div className="lg:col-span-1 glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-5 min-h-[50vh]">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-neonBlue" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Start Behavioral Mock</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Experience a 5-question structured HR interview. Record responses and get graded.
              </p>
            </div>

            <button
              onClick={() => startSession(false)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              <Play className="w-4 h-4" /> Launch Mock
            </button>
          </div>

          {/* Daily Speaking Exercises Card */}
          <div className="lg:col-span-1 glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-5 min-h-[50vh]">
            <div className="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/25 flex items-center justify-center">
              <Mic className="w-8 h-8 text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Daily Speaking Exercises</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Practice short reading prompts and tongue twisters to improve speech cadence, pacing, and reduce filler words.
              </p>
            </div>

            <button
              onClick={() => startSession(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Volume2 className="w-4 h-4" /> Start Practice
            </button>
          </div>

          {/* Historical Attempts */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-semibold text-white border-b border-white/5 pb-2">Recent Sessions History</h4>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {history && history.length > 0 ? (
                history.map((h, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/40 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{h.company || 'General HR'}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-neonBlue font-extrabold">{h.overallScore || 70}%</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No previous attempts logged.</div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Active Interview Panel */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl space-y-6 relative">
            
            {/* Header / Question Index */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-black text-neonBlue uppercase tracking-wider">
                {isExerciseMode ? 'Speaking Prompt' : 'Question'} {questionIndex + 1} of {isExerciseMode ? EXERCISE_PROMPTS.length : QUESTIONS.length}
              </span>
              <button 
                onClick={() => speakQuestion(isExerciseMode ? EXERCISE_PROMPTS[questionIndex] : QUESTIONS[questionIndex])}
                className="p-1.5 bg-slate-900 border border-white/5 hover:border-white/10 rounded text-slate-350 hover:text-white transition-colors"
                title="Speak question again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Question prompt block */}
            <div className="p-5 bg-slate-950/40 border border-white/5 rounded-xl text-center">
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                "{isExerciseMode ? EXERCISE_PROMPTS[questionIndex] : QUESTIONS[questionIndex]}"
              </p>
            </div>

            {/* Mic input trigger / waveform animation */}
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                  isRecording 
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 scale-105' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                
                {/* Radar glow loop */}
                {isRecording && (
                  <span className="absolute -inset-2 rounded-full border border-rose-500/30 animate-ping"></span>
                )}
              </button>

              <div className="text-center">
                <span className="text-xs font-semibold text-slate-350">
                  {isRecording ? "Recording... Click to stop." : "Click microphone to record your answer"}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Or type your response inside the textbox below</p>
              </div>

              {/* Mock Web Speech visual wave */}
              {isRecording && (
                <div className="flex items-center gap-1 h-6">
                  {[0.3, 0.7, 0.4, 0.9, 0.5, 0.8, 0.4, 0.6, 0.3].map((val, idx) => (
                    <div 
                      key={idx} 
                      className="w-1 bg-neonBlue rounded-full animate-pulse" 
                      style={{ height: `${val * 100}%`, animationDelay: `${idx * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Display / Edit Area */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">Response Text</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full h-32 bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neonBlue transition-colors resize-none"
                placeholder="Your spoken words will appear here. Feel free to edit or type directly..."
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setSessionStarted(false);
                  fetchHistory();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Quit Session
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loadingEval || !answerText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {loadingEval ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </button>

                {evaluation && (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {questionIndex < QUESTIONS.length - 1 ? "Next Question" : "Complete Interview"}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* AI Metrics Overlay */}
          <div className="lg:col-span-2">
            {evaluation ? (
              <div className="glass-panel p-6 rounded-2xl space-y-5">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Vocal Communication Metrics</h3>

                {/* Score meters grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/30 border border-white/5 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Confidence</span>
                    <p className="text-lg font-black text-neonBlue">{evaluation.confidence}%</p>
                  </div>
                  
                  <div className="bg-slate-950/30 border border-white/5 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Grammar</span>
                    <p className="text-lg font-black text-violet-400">{evaluation.grammar}%</p>
                  </div>

                  <div className="bg-slate-950/30 border border-white/5 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Clarity</span>
                    <p className="text-lg font-black text-sky-400">{evaluation.clarity}%</p>
                  </div>

                  <div className="bg-slate-950/30 border border-white/5 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fluency</span>
                    <p className="text-lg font-black text-emerald-400">{evaluation.fluency}%</p>
                  </div>
                </div>

                {/* Filler Words warning */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-350">Filler Words Alerts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.fillerWords && evaluation.fillerWords.length > 0 ? (
                      evaluation.fillerWords.map((word, idx) => (
                        <span key={idx} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                          ⚠ Filler: "{word}"
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Perfect speech pacing, no fillers!
                      </span>
                    )}
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-xs font-semibold text-slate-300">Mentorship Feedback</span>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-3 rounded border border-white/5">
                    {evaluation.feedback}
                  </p>
                </div>

              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl text-center flex flex-col items-center justify-center h-full min-h-[30vh] border border-dashed border-white/10 text-slate-505">
                <BarChart2 className="w-10 h-10 text-slate-650 mb-2" />
                <h3 className="text-xs font-semibold text-slate-400">Waiting for response</h3>
                <p className="text-[10px] text-slate-550 max-w-[180px] mt-0.5">
                  Speak or type your answer and hit submit to generate communication matrices.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default InterviewPage;
