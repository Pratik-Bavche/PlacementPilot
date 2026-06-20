import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { protect, adminOnly } from '../middleware/auth.js';
import { db } from '../services/dbService.js';
import { 
  analyzeResume, 
  generateRoadmap, 
  evaluateInterviewAnswer, 
  reviewGitHubRepo, 
  getMentorChatResponse 
} from '../services/geminiService.js';


const router = express.Router();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'placementpilot_super_secret_token_12345', {
    expiresIn: '30d',
  });
};

// ==========================================
// AUTHENTICATION MODULE
// ==========================================

// Register User
router.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await db.users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.users.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      targetCompany: 'Google',
      streak: 1,
      skills: ['HTML', 'CSS', 'JavaScript'],
      strengths: ['Frontend development', 'Problem-solving'],
      weaknesses: ['Data Structures', 'Communication skills'],
      readinessScore: 45
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      streak: user.streak,
      readinessScore: user.readinessScore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Increment streak if last active is a different day
    const today = new Date().toDateString();
    const lastActiveDay = new Date(user.lastActive).toDateString();
    let updatedStreak = user.streak;
    if (today !== lastActiveDay) {
      updatedStreak += 1;
      await db.users.findByIdAndUpdate(user._id, { 
        streak: updatedStreak, 
        lastActive: new Date().toISOString() 
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      streak: updatedStreak,
      readinessScore: user.readinessScore,
      targetCompany: user.targetCompany
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google OAuth Mock
router.post('/auth/google', async (req, res) => {
  const { name, email, googleId } = req.body;
  try {
    let user = await db.users.findOne({ email });
    if (!user) {
      // Create user if not existing
      const salt = await bcrypt.genSalt(10);
      const dummyPassword = await bcrypt.hash(googleId || 'google_oauth_123', salt);
      user = await db.users.create({
        name,
        email,
        password: dummyPassword,
        role: 'student',
        streak: 1,
        skills: ['HTML', 'CSS', 'React'],
        strengths: ['Web Development'],
        weaknesses: ['DSA fundamentals'],
        readinessScore: 40
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      streak: user.streak,
      readinessScore: user.readinessScore,
      targetCompany: user.targetCompany
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Google authentication error' });
  }
});

// Forgot Password - simulate sending email
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }
    // Simulate email sending success
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
});

// Reset Password - updates password
router.post('/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.users.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    res.json({ message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Get User Profile
router.get('/auth/profile', protect, async (req, res) => {
  try {
    const user = await db.users.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetCompany: user.targetCompany,
      streak: user.streak,
      readinessScore: user.readinessScore,
      skills: user.skills || [],
      strengths: user.strengths || [],
      weaknesses: user.weaknesses || [],
      predictedTimeline: user.predictedTimeline || 'October 2027'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user details' });
  }
});

// Update Profile
router.put('/auth/profile', protect, async (req, res) => {
  const { targetCompany, skills, strengths, weaknesses } = req.body;
  try {
    const updated = await db.users.findByIdAndUpdate(req.user._id, {
      targetCompany,
      skills,
      strengths,
      weaknesses
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating details' });
  }
});

// ==========================================
// MODULE 1: ATS RESUME ANALYZER
// ==========================================
router.post('/resume/analyze', protect, async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) {
    return res.status(400).json({ message: 'Resume text content is required' });
  }

  try {
    const analysis = await analyzeResume(resumeText);
    
    // Save to Database
    await db.resumes.create({
      userId: req.user._id,
      atsScore: analysis.atsScore,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions,
      completenessScore: analysis.completenessScore,
      formattingReview: analysis.formattingReview
    });

    // Recalculate and update user overall readiness score
    const currentReadiness = req.user.readinessScore || 45;
    const newReadiness = Math.round((currentReadiness * 0.6) + (analysis.atsScore * 0.4));
    await db.users.findByIdAndUpdate(req.user._id, { readinessScore: newReadiness });

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error analyzing resume' });
  }
});

// Get Latest Resume Analytics
router.get('/resume/latest', protect, async (req, res) => {
  try {
    const list = await db.resumes.find({ userId: req.user._id });
    if (!list || list.length === 0) {
      return res.json(null);
    }
    // Return the latest analysis (last element)
    res.json(list[list.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest resume metrics' });
  }
});

// ==========================================
// MODULE 2: COMPANY PREPARATION ENGINE
// ==========================================
const COMPANY_DATABASE = {
  Google: {
    overview: "Google is a global technology leader focused on search, cloud computing, online advertising, and AI.",
    process: "Online Assessment (2 DSA Coding Questions) -> 3-4 Technical Rounds (DSA, System Design) -> 1 Googliness & Leadership behavioral interview.",
    rounds: ["Online Assessment", "Technical DSA Round 1", "Technical DSA Round 2", "Googliness & Leadership (Behavioral)"],
    faqs: [
      { q: "What language does Google prefer?", a: "C++, Java, Python, or Go are widely preferred." },
      { q: "How heavily is Googliness graded?", a: "Very heavily. Fits in Google culture are crucial." }
    ],
    dsaTopics: ["Binary Search", "Graphs (BFS/DFS, Dijkstra)", "Tries", "Dynamic Programming (Grid/Interval)"],
    techSubjects: ["Operating Systems (Process synchronization, threads)", "Computer Networks (HTTP/TCP/IP)", "System Design principles"],
    behavioralQuestions: [
      "Tell me about a time you solved a complex technical problem with constraints.",
      "How do you handle disagreement within a group project?"
    ]
  },
  Amazon: {
    overview: "Amazon is an e-commerce, cloud computing (AWS), and digital streaming giant.",
    process: "OA (Debug, DSA, Work Simulation) -> 2-3 Technical Rounds (DSA + Leadership Principles) -> 1 Bar Raiser.",
    rounds: ["Online Assessment", "Technical DSA + System Architecture", "Bar Raiser Behavioral (STAR Method)"],
    faqs: [
      { q: "What is the Bar Raiser?", a: "An independent interviewer who ensures the candidate raises the bar of the current team." }
    ],
    dsaTopics: ["Heaps", "HashMaps & LRU Cache", "Trees", "Sorting & Merging Algorithms"],
    techSubjects: ["Object Oriented Design (OOD)", "DBMS (SQL vs NoSQL, Transaction Isolation)", "System Scalability"],
    behavioralQuestions: [
      "Tell me about a time when you had to make a decision without all the data (Bias for Action).",
      "Describe a time you failed and how you corrected it (Ownership)."
    ]
  },
  Microsoft: {
    overview: "Microsoft is a multinational technology giant developing software, hardware, cloud, and productivity tools.",
    process: "OA -> 3 Technical Rounds (DSA, System Design, Code Quality/Readability) -> Executive/HR Round.",
    rounds: ["Online Assessment", "Technical Coding (Code Quality focus)", "System Design / Architecture", "Asappropriate Interview (Manager Behavioral)"],
    faqs: [
      { q: "Do they care about syntax correctness?", a: "Yes, they value compilable, clean, and logical code style." }
    ],
    dsaTopics: ["Linked Lists", "Strings (Manipulation & Patterns)", "Trees & Traversals", "Dynamic Programming"],
    techSubjects: ["Compiler design basics", "DBMS", "Operating Systems (Memory Management)"],
    behavioralQuestions: [
      "Why do you want to join Microsoft and what is your passion project?",
      "How do you learn new technology trends?"
    ]
  },
  TCS: {
    overview: "Tata Consultancy Services (TCS) is a leading global IT services and consulting enterprise.",
    process: "TCS National Qualifier Test (NQT) (Aptitude + Verbal + Coding) -> Technical Round -> HR/Managerial Round.",
    rounds: ["TCS NQT National Written Test", "Technical Interview (DSA basics, OOP, project)", "HR & Managerial Interview"],
    faqs: [
      { q: "Is aptitude highly critical?", a: "Yes, the NQT written test filter depends heavily on numerical and logical aptitude." }
    ],
    dsaTopics: ["Searching & Sorting", "Array operations", "String Manipulation", "Matrix problems"],
    techSubjects: ["OOP Concepts (Inheritance, Polymorphism)", "Basic SQL Queries", "Software Engineering SDLC Models"],
    behavioralQuestions: [
      "Are you comfortable with night shifts and relocating?",
      "Tell me about your final year project."
    ]
  },
  Infosys: {
    overview: "Infosys is a global leader in next-generation digital services and consulting.",
    process: "InfyTQ / HackWithInfy coding test -> Technical Round -> HR Round.",
    rounds: ["HackWithInfy Coding Exam", "Technical Interview", "HR Round"],
    faqs: [
      { q: "What is HackWithInfy?", a: "A national level coding hackathon/contest that secures direct technical developer interview rounds." }
    ],
    dsaTopics: ["Recursion", "Arrays and Lists", "Basic Dynamic Programming", "Math-based algorithms"],
    techSubjects: ["DBMS SQL joins and queries", "Computer Networks basics", "Python / Java Syntax OOP"],
    behavioralQuestions: [
      "Why Infosys and what are your strengths?",
      "How do you handle client escalations (roleplay)?"
    ]
  },
  Accenture: {
    overview: "Accenture is a professional services company with leading capabilities in digital, cloud, and security.",
    process: "Cognitive Assessment -> Coding Assessment -> Communication Assessment -> HR / Technical Interview.",
    rounds: ["Cognitive & Technical MCQ", "Coding Test (2 Questions)", "Communication Test (Speech AI)", "One-on-One Interview"],
    faqs: [
      { q: "What is the Communication Test?", a: "An automated audio-verbal scoring test tracking reading speed, listening, and sentence completion." }
    ],
    dsaTopics: ["Strings & Arrays", "Searching (Binary/Linear)", "Bit Manipulation"],
    techSubjects: ["MS Office tools & Cloud basics", "OOP concepts", "Basic Database queries"],
    behavioralQuestions: [
      "Describe a project challenge you resolved as a team member.",
      "How do you plan to upscale your technical skills?"
    ]
  },
  PhonePe: {
    overview: "PhonePe is India's leading digital payments and financial services platform.",
    process: "Online Coding Test -> Machine Coding Round (2 Hours) -> System Design -> HR Round.",
    rounds: ["Coding Test", "Machine Coding (Working executable code built on-the-spot)", "System Design Round", "HR Round"],
    faqs: [
      { q: "What is the Machine Coding round?", a: "You have to implement a fully working console-based app (e.g. Splitwise or Snake Game) with SOLID principles in 2 hours." }
    ],
    dsaTopics: ["Design Patterns", "Graphs & Trees", "Recursion", "Queues (Concurrency control)"],
    techSubjects: ["Multithreading & Concurrency", "L1/L2 Cache caching", "DB Transactions & Locking"],
    behavioralQuestions: [
      "What is the most challenging feature you built?",
      "Why digital payments fintech?"
    ]
  },
  Razorpay: {
    overview: "Razorpay is a major fintech payment gateway enabling businesses to accept, process, and disburse payments.",
    process: "OA -> Machine Coding -> DSA Technical Round -> System Design -> Hiring Manager Round.",
    rounds: ["Online Assessment", "Machine Coding (Clean Architecture)", "DSA & Design Patterns", "System Design", "HM Round"],
    faqs: [
      { q: "Does Razorpay focus on system performance?", a: "Yes, scalable architectural design is heavily evaluated." }
    ],
    dsaTopics: ["Hashing", "Graphs (Dijkstra)", "Tries", "Dynamic Programming"],
    techSubjects: ["Database Indexing", "Message Queues (Kafka)", "API Rate limiting and Security"],
    behavioralQuestions: [
      "How did you handle a technical bug under production pressure?",
      "Describe a time you built a complex system module."
    ]
  },
  Uber: {
    overview: "Uber is a mobility service provider managing ride-sharing, food delivery, and freight.",
    process: "Online Coding (Hard) -> 2-3 DSA Interviews (High efficiency code) -> System Design (Scalable) -> Bar Raiser.",
    rounds: ["Online Code Test (Codesignal)", "Technical DSA (Optimize time & memory complexity)", "System Design (Large Scale Architecture)", "HR / Leadership Alignment"],
    faqs: [
      { q: "How difficult are Uber DSA rounds?", a: "Very high difficulty. Leetcode Hard problems are frequently asked." }
    ],
    dsaTopics: ["Graphs & Geo-spatial indexes (Quadtree, H3)", "Dynamic Programming (Hard)", "Advanced Trees (Segment trees)"],
    techSubjects: ["Concurrent Systems", "Network Protocols (WebSockets)", "Load Balancing & Partitioning"],
    behavioralQuestions: [
      "Tell me about a time you pushed technical boundaries.",
      "How do you resolve architectural conflicts?"
    ]
  },
  Flipkart: {
    overview: "Flipkart is India's leading digital e-commerce platform and competitor to Amazon.",
    process: "OA -> Machine Coding Round -> DSA Coding Round -> System Design Round -> Hiring Manager Round.",
    rounds: ["Online Test", "Machine Coding (OOD, Extensible design)", "DSA Round", "System Design Round", "Managerial Review"],
    faqs: [
      { q: "Is Machine Coding round critical?", a: "It is the major filter. Your code must compile, run, handle edge cases, and follow clean design patterns." }
    ],
    dsaTopics: ["Dynamic Programming", "Heaps", "Graphs", "String pattern search (KMP)"],
    techSubjects: ["OOP Design Patterns", "SQL Transaction levels", "Caching systems"],
    behavioralQuestions: [
      "Describe your contribution in your group project.",
      "Why e-commerce backend?"
    ]
  }
};

router.get('/company/:name', protect, (req, res) => {
  const companyName = req.params.name;
  const companyInfo = COMPANY_DATABASE[companyName];
  if (!companyInfo) {
    return res.status(404).json({ message: 'Company details not found' });
  }
  res.json(companyInfo);
});

// ==========================================
// MODULE 3: PERSONALIZED ROADMAP GENERATOR
// ==========================================
router.post('/roadmap/generate', protect, async (req, res) => {
  const { targetCompany, goal } = req.body;
  try {
    const roadmap = await generateRoadmap(req.user.skills, targetCompany || req.user.targetCompany, goal || 'SDE');
    
    // Delete existing roadmaps of this user
    // (We will simulate deleteMany in local DB or run in mongo)
    if (db.isLocal()) {
      // Clean up local roadmap for user
      const localDBData = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../local_db.json'), 'utf-8'));
      localDBData.roadmaps = localDBData.roadmaps.filter(r => r.userId !== req.user._id);
      fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../local_db.json'), JSON.stringify(localDBData, null, 2));
    } else {
      await mongoose.model('Roadmap').deleteMany({ userId: req.user._id });
    }

    const savedRoadmap = await db.roadmaps.create({
      userId: req.user._id,
      weeks: roadmap
    });

    res.status(201).json(savedRoadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating personalized roadmap' });
  }
});

// Fetch current Roadmap
router.get('/roadmap', protect, async (req, res) => {
  try {
    const roadmap = await db.roadmaps.findOne({ userId: req.user._id });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmap' });
  }
});

// Update Task Status in Roadmap
router.put('/roadmap/task', protect, async (req, res) => {
  const { weekNumber, taskId, completed } = req.body;
  try {
    const roadmap = await db.roadmaps.findOne({ userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Find week and task
    const week = roadmap.weeks.find(w => w.weekNumber === parseInt(weekNumber));
    if (week) {
      const task = week.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = completed;
      }
    }

    // Save update
    await db.roadmaps.findByIdAndUpdate(roadmap._id, roadmap);

    // Calculate completed count to update user statistics
    let totalTasks = 0;
    let completedTasks = 0;
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });

    const completionRatio = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    
    // Update user readiness score based on task completions (adds weight)
    const baseReadiness = req.user.readinessScore || 45;
    const finalReadiness = Math.min(100, Math.round(baseReadiness + (completionRatio * 15)));
    await db.users.findByIdAndUpdate(req.user._id, { readinessScore: finalReadiness });

    res.json(roadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating roadmap task status' });
  }
});

// ==========================================
// MODULE 4 & 6: AI INTERVIEW SIMULATOR & COMMUNICATION COACH
// ==========================================
router.post('/interview/evaluate', protect, async (req, res) => {
  const { question, answer, company, role } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: 'Question and answer text are required' });
  }

  try {
    const evaluation = await evaluateInterviewAnswer(question, answer);
    
    // Save to Database
    await db.interviews.create({
      userId: req.user._id,
      company: company || 'General HR',
      role: role || 'Software Developer',
      answers: [{
        question,
        answer,
        confidence: evaluation.confidence,
        communication: evaluation.communication,
        grammar: evaluation.grammar,
        clarity: evaluation.clarity,
        fluency: evaluation.fluency,
        fillerWords: evaluation.fillerWords,
        feedback: evaluation.feedback
      }],
      overallScore: evaluation.communication
    });

    // Update readiness score based on speech evaluations
    const currentReadiness = req.user.readinessScore || 45;
    const newReadiness = Math.min(100, Math.round((currentReadiness * 0.7) + (evaluation.communication * 0.3)));
    await db.users.findByIdAndUpdate(req.user._id, { readinessScore: newReadiness });

    res.json(evaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error evaluating interview question response' });
  }
});

// Fetch user interview analytics history
router.get('/interview/history', protect, async (req, res) => {
  try {
    const history = await db.interviews.find({ userId: req.user._id });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving mock interview records' });
  }
});

// ==========================================
// MODULE 5: PLACEMENT READINESS PREDICTOR
// ==========================================
router.get('/readiness/predict', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch latest resume
    const resumes = await db.resumes.find({ userId: user._id });
    const latestResumeScore = resumes.length > 0 ? resumes[resumes.length - 1].atsScore : 65;

    // Fetch latest interview
    const interviews = await db.interviews.find({ userId: user._id });
    const latestInterviewScore = interviews.length > 0 ? interviews[interviews.length - 1].overallScore : 55;

    // Base skill score (length of skills * 12, max 100)
    const skillScore = Math.min(100, (user.skills || []).length * 12 + 40);

    // Calculate company matching readiness matrices
    const tcsReadiness = Math.min(100, Math.round(latestResumeScore * 0.4 + skillScore * 0.3 + latestInterviewScore * 0.3 + 10));
    const infosysReadiness = Math.min(100, Math.round(latestResumeScore * 0.35 + skillScore * 0.35 + latestInterviewScore * 0.3 + 8));
    const accentureReadiness = Math.min(100, Math.round(latestResumeScore * 0.3 + skillScore * 0.3 + latestInterviewScore * 0.4 + 5));
    const amazonReadiness = Math.max(25, Math.min(98, Math.round(latestResumeScore * 0.25 + skillScore * 0.4 + latestInterviewScore * 0.35 - 10)));
    const googleReadiness = Math.max(20, Math.min(95, Math.round(latestResumeScore * 0.2 + skillScore * 0.45 + latestInterviewScore * 0.35 - 15)));

    const overallScore = Math.round((tcsReadiness + infosysReadiness + accentureReadiness + amazonReadiness + googleReadiness) / 5);

    // Cache overallScore in user profile
    await db.users.findByIdAndUpdate(user._id, { readinessScore: overallScore });

    res.json({
      overallPlacementReadiness: overallScore,
      resumeScore: latestResumeScore,
      communicationScore: latestInterviewScore,
      dsaScore: Math.round(skillScore * 0.8),
      projectScore: Math.round(skillScore * 0.75 + 10),
      githubScore: Math.round(skillScore * 0.7 + 15),
      predictions: [
        { company: 'TCS', score: tcsReadiness },
        { company: 'Infosys', score: infosysReadiness },
        { company: 'Accenture', score: accentureReadiness },
        { company: 'Amazon', score: amazonReadiness },
        { company: 'Google', score: googleReadiness }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to compile readiness analytics' });
  }
});

// ==========================================
// MODULE 7: GITHUB PROJECT REVIEWER
// ==========================================
router.post('/github/review', protect, async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ message: 'GitHub repository link is required' });
  }
  try {
    const review = await reviewGitHubRepo(repoUrl);
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reviewing repository structure' });
  }
});

// ==========================================
// MODULE 8: PLACEMENT TWIN (AI CAREER MENTOR)
// ==========================================
router.post('/mentor/chat', protect, async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Chat message content is required' });
  }

  try {
    // Get metrics cache for prompt injection
    const resumes = await db.resumes.find({ userId: req.user._id });
    const resumeScore = resumes.length > 0 ? resumes[resumes.length - 1].atsScore : 70;

    const userMetrics = {
      skills: req.user.skills,
      strengths: req.user.strengths,
      weaknesses: req.user.weaknesses,
      readinessScore: req.user.readinessScore,
      targetCompany: req.user.targetCompany,
      resumeScore
    };

    const reply = await getMentorChatResponse(userMetrics, message, chatHistory || []);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI Mentor is currently offline' });
  }
});

// ==========================================
// MODULE 9: INTERVIEW EXPERIENCE HUB
// ==========================================

// Submit interview experience
router.post('/hub/share', protect, async (req, res) => {
  const { company, role, rounds, questions, difficulty, status } = req.body;
  try {
    const exp = await db.experiences.create({
      userId: req.user._id,
      userName: req.user.name,
      company,
      role,
      rounds: rounds || [],
      questions: questions || [],
      difficulty: difficulty || 'Medium',
      status: status || 'Selected',
      approved: false // requires admin review
    });
    res.status(201).json({ message: 'Interview review submitted successfully and is awaiting moderation', data: exp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging interview review' });
  }
});

// Get approved experiences
router.get('/hub/list', protect, async (req, res) => {
  try {
    // Let students see approved posts; let Admin see all posts
    const query = req.user.role === 'admin' ? {} : { approved: true };
    const list = await db.experiences.find(query);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving experience sheets' });
  }
});

// ==========================================
// MODULE 10: APPLICATION TRACKER
// ==========================================
router.post('/applications', protect, async (req, res) => {
  const { company, role, stage, salary, deadline, notes } = req.body;
  try {
    const job = await db.applications.create({
      userId: req.user._id,
      company,
      role,
      stage: stage || 'Applied',
      salary: salary || '',
      deadline: deadline || '',
      notes: notes || ''
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record job pipeline item' });
  }
});

// Get Job applications
router.get('/applications', protect, async (req, res) => {
  try {
    const list = await db.applications.find({ userId: req.user._id });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error loading job tracking list' });
  }
});

// Update Job Application Stage
router.put('/applications/:id', protect, async (req, res) => {
  const { stage, salary, deadline, notes } = req.body;
  try {
    const updated = await db.applications.findByIdAndUpdate(req.params.id, {
      stage,
      salary,
      deadline,
      notes
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error modifying job status' });
  }
});

// Delete Job Application
router.delete('/applications/:id', protect, async (req, res) => {
  try {
    await db.applications.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Application log removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application' });
  }
});

// ==========================================
// MODULE 11: PLACEMENT BATTLE ARENA
// ==========================================

// Submit weekly contest score
router.post('/battle/submit', protect, async (req, res) => {
  const { score, contestName } = req.body;
  try {
    const record = await db.battles.create({
      userId: req.user._id,
      userName: req.user.name,
      score,
      contestName
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error recording quiz results' });
  }
});

// Fetch Leaderboard for a contest
router.get('/battle/leaderboard/:contest', protect, async (req, res) => {
  try {
    const submissions = await db.battles.find({ contestName: req.params.contest });
    // Sort descending by score
    const sorted = submissions.sort((a, b) => b.score - a.score);
    // Assign ranks
    const ranked = sorted.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: 'Error sorting ranking records' });
  }
});

// ==========================================
// ADMIN CONTROL MODULE
// ==========================================

// Fetch platform users
router.get('/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await db.users.find({});
    // Strip passwords before returning
    const safeUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      streak: u.streak,
      readinessScore: u.readinessScore,
      targetCompany: u.targetCompany
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving student listing' });
  }
});

// Moderate experience log approval
router.put('/admin/experiences/:id/approve', protect, adminOnly, async (req, res) => {
  const { approved } = req.body;
  try {
    const updated = await db.experiences.findByIdAndUpdate(req.params.id, { approved });
    res.json({ message: 'Experience record moderation status updated', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to moderate post' });
  }
});

export default router;
