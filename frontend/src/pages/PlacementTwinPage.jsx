import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';

const PlacementTwinPage = ({ user, token, API_BASE }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user.name}! I am your Placement Twin career mentor. I have audited your skills, resume scores, and target goals. How can I guide your studies today?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: messages.slice(-6) // Send last few messages for context
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "I'm having a brief connection drop to the twin server, let me get back to you shortly!" }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "API offline fallback. Keep practicing DSA patterns and update your resume keywords!" }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Placement Twin & AI Mentor</h2>
        <p className="text-xs text-slate-400">Consult your digital double matching capabilities to target roles and review next action sequences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Digital Twin Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pulse-glow-bg"></div>
            
            {/* Holographic Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white border border-white/10">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Digital Twin Profile</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Student Level: Intermediate</span>
              </div>
            </div>

            {/* Placement Timeline Meter */}
            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Expected Placement Window</span>
              <div className="text-base font-extrabold text-white">
                {user.predictedTimeline || 'October 2027'}
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[65%] rounded-full"></div>
              </div>
              <p className="text-[9px] text-slate-500">65% profile milestones completed. Speed up DSA checks.</p>
            </div>

            {/* Strengths / Growth areas */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Audited Strengths</span>
                <div className="flex flex-wrap gap-2">
                  {(user.skills || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Primary Growth Areas</span>
                <div className="flex flex-wrap gap-2">
                  {['Advanced DSA', 'Communication Pacing', 'System Design'].map((growth, idx) => (
                    <span key={idx} className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded font-bold">
                      {growth}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Chat Room */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-2xl flex flex-col h-[60vh] relative overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-xs font-bold text-slate-200">AI Twin Consultant</span>
              </div>
            </div>

            {/* Messages Listing */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  )}
                  
                  <div className={`p-3.5 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/60 border border-white/5 text-slate-250 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {sending && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-xs text-slate-500 rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2 bg-slate-900/20">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about TCS rounds, DSA goals, or resume keyword fixes..."
                className="flex-1 bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neonBlue transition-colors"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

export default PlacementTwinPage;
