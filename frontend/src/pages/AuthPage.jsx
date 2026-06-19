import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Sparkles, LogIn, UserPlus } from 'lucide-react';

const AuthPage = () => {
  const { login, register, loginGoogle } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const mockName = role === 'admin' ? 'Google Admin' : 'John Doe';
      const mockEmail = role === 'admin' ? 'admin@placementpilot.ai' : 'johndoe@gmail.com';
      const mockId = 'google_oauth_secret_12345';
      await loginGoogle(mockName, mockEmail, mockId);
    } catch (err) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-darkBg px-4 overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-neonBlue/10 blur-[120px] pulse-glow-bg"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-royalViolet/10 blur-[150px] pulse-glow-bg"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10 shadow-2xl border border-white/5">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-xl mb-3 border border-blue-500/20">
            <Shield className="w-8 h-8 text-neonBlue" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-neonBlue to-royalViolet bg-clip-text text-transparent">
            PlacementPilot AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI-Powered Placement Readiness & Mentorship</p>
        </div>

        {/* Toggle Role */}
        <div className="flex bg-slate-900/60 p-1 rounded-lg mb-6 border border-white/5">
          <button
            type="button"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
              role === 'student'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setRole('student')}
          >
            Student Gateway
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
              role === 'admin'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setRole('admin')}
          >
            Admin Panel
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neonBlue transition-colors"
                placeholder="Pratik Patil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neonBlue transition-colors"
              placeholder={role === 'admin' ? 'admin@placementpilot.ai' : 'student@college.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neonBlue transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 text-white shadow-lg transition-all duration-300 ${
              role === 'admin' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/10'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/10'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest px-3">or continue with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Mock Google Login */}
        <button
          onClick={handleMockGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.147 4.114-3.488 0-6.315-2.827-6.315-6.315s2.827-6.315 6.315-6.315c1.517 0 2.89.536 3.978 1.425l3.074-3.074C18.966 2.21 15.823 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c5.786 0 10.457-4.22 10.957-9.714H12.24z"
            />
          </svg>
          Google Authentication
        </button>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-neonBlue transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        {role === 'admin' && isLogin && (
          <div className="mt-5 p-3 rounded-lg bg-violet-600/10 border border-violet-500/20 text-center">
            <p className="text-[10px] text-violet-400 font-mono">
              Demo Admin Mode:<br/>
              User: <span className="text-white">admin@placementpilot.ai</span><br/>
              Pass: <span className="text-white">admin_password_123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
