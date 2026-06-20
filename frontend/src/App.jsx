import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AtsAnalyzerPage from './pages/AtsAnalyzerPage';
import CompanyPrepPage from './pages/CompanyPrepPage';
import RoadmapPage from './pages/RoadmapPage';
import InterviewPage from './pages/InterviewPage';
import ReadinessPage from './pages/ReadinessPage';
import GithubReviewPage from './pages/GithubReviewPage';
import PlacementTwinPage from './pages/PlacementTwinPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import HubAndArenaPage from './pages/HubAndArenaPage';
import AdminPage from './pages/AdminPage';

import { 
  LayoutDashboard, FileText, Briefcase, Calendar, MessageSquare, 
  TrendingUp, Github, Brain, Kanban, Share2, Shield, LogOut, Flame, Menu, X, Moon, Sun
} from 'lucide-react';

const App = () => {
  const { user, token, loading, logout, updateProfile, API_BASE } = useContext(AuthContext);
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newVal;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Sidebar navigation mapping
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ats', label: 'Resume Analyzer', icon: FileText },
    { id: 'prep', label: 'Company Prep', icon: Briefcase },
    { id: 'roadmap', label: 'Roadmap Generator', icon: Calendar },
    { id: 'interview', label: 'HR Interview Simulator', icon: MessageSquare },
    { id: 'readiness', label: 'Readiness Predictor', icon: TrendingUp },
    { id: 'github', label: 'GitHub Reviewer', icon: Github },
    { id: 'twin', label: 'Placement Twin (AI)', icon: Brain },
    { id: 'tracker', label: 'Application Tracker', icon: Kanban },
    { id: 'hub', label: 'Battle Arena & Hub', icon: Share2 }
  ];

  // Insert Admin options if account has privilege
  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  const renderActiveTab = () => {
    switch (tab) {
      case 'dashboard':
        return <DashboardPage user={user} token={token} API_BASE={API_BASE} setTab={setTab} />;
      case 'ats':
        return <AtsAnalyzerPage token={token} API_BASE={API_BASE} />;
      case 'prep':
        return <CompanyPrepPage user={user} token={token} API_BASE={API_BASE} updateProfile={updateProfile} />;
      case 'roadmap':
        return <RoadmapPage user={user} token={token} API_BASE={API_BASE} />;
      case 'interview':
        return <InterviewPage user={user} token={token} API_BASE={API_BASE} />;
      case 'readiness':
        return <ReadinessPage token={token} API_BASE={API_BASE} />;
      case 'github':
        return <GithubReviewPage token={token} API_BASE={API_BASE} />;
      case 'twin':
        return <PlacementTwinPage user={user} token={token} API_BASE={API_BASE} />;
      case 'tracker':
        return <ApplicationTrackerPage token={token} API_BASE={API_BASE} />;
      case 'hub':
        return <HubAndArenaPage user={user} token={token} API_BASE={API_BASE} />;
      case 'admin':
        return <AdminPage token={token} API_BASE={API_BASE} />;
      default:
        return <DashboardPage user={user} token={token} API_BASE={API_BASE} setTab={setTab} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-darkBg flex relative transition-colors duration-300">
      
      {/* Dynamic Glowing Accents */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/80 backdrop-blur-md border-r border-white/5 p-4 flex flex-col justify-between transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white">
                P
              </div>
              <span className="font-extrabold tracking-tight text-white bg-gradient-to-r from-neonBlue to-royalViolet bg-clip-text text-transparent">
                PlacementPilot
              </span>
            </div>
            
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setSidebarOpen(false); // Close on mobile
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/10 border border-blue-500/20 text-neonBlue glow-text-blue' 
                      : 'border border-transparent text-slate-450 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neonBlue' : 'text-slate-450'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile details bottom */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-200">
              {user.name[0]}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-200 block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Navbar */}
        <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between relative z-40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 bg-slate-900 border border-white/5 rounded text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider hidden sm:block">
              Workspace Platform
            </h1>
          </div>

          {/* Quick Widgets: Streak count and Theme Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/10 hover:shadow-md transition-all"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/25 rounded-lg text-orange-500 text-xs font-extrabold shadow-sm">
              <Flame className="w-4 h-4 fill-orange-500/10 animate-pulse" />
              <span>{user.streak || 1} Days Active</span>
            </div>
          </div>
        </header>

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};

export default App;
