import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to check if key exists
const isAIActive = () => genAI !== null;

export const analyzeResume = async (resumeContent) => {
  if (!isAIActive()) {
    console.log(">>> Gemini Key not found. Using Mock ATS Resume Analyzer.");
    // Simulate minor delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const sampleScores = [74, 82, 88, 91];
    const score = sampleScores[Math.floor(Math.random() * sampleScores.length)];
    return {
      atsScore: score,
      missingKeywords: ["Docker", "Kubernetes", "Redis", "AWS CloudFormation", "CI/CD Pipelines", "System Design"],
      suggestions: [
        "Include metrics on project descriptions (e.g., 'Optimized query efficiency by 34%').",
        "Add a summary profile at the top highlighting cloud engineering capabilities.",
        "Refine skills section, splitting into Frontend, Backend, Databases, and DevOps categories."
      ],
      completenessScore: 85,
      formattingReview: [
        "Font consistency check: Passed.",
        "Section hierarchy: Clear header layout.",
        "Link validation: Missing LinkedIn or GitHub links in header."
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert resume parsing and ATS auditing software. Analyze the following resume content and output a JSON object containing:
      1. atsScore (Number from 0-100)
      2. missingKeywords (Array of technical terms commonly expected for developers but missing here)
      3. suggestions (Array of actionable bullets to improve formatting/writing)
      4. completenessScore (Number from 0-100 checking core sections like Education, Experience, Skills, Projects)
      5. formattingReview (Array of formatting/structural warnings or logs)

      Return ONLY the JSON block. Do not wrap it in markdown or details.
      Resume text:
      "${resumeContent}"
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Strip potential markdown code blocks
    const cleanJSONText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJSONText);
  } catch (e) {
    console.error("Gemini API resume analysis failed. Falling back to mock data.", e);
    return {
      atsScore: 75,
      missingKeywords: ["TypeScript", "Docker", "Unit Testing"],
      suggestions: ["Add project links", "Highlight metrics in work details"],
      completenessScore: 80,
      formattingReview: ["Verified basic columns."]
    };
  }
};

export const generateRoadmap = async (skills = [], targetCompany = "Google", goal = "SDE") => {
  if (!isAIActive()) {
    console.log(">>> Gemini Key not found. Using Mock Roadmap Generator.");
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
      {
        weekNumber: 1,
        title: "Foundation: Data Structures & Algorithms (Core)",
        tasks: [
          { id: "w1_t1", title: "Master Array operations and sliding window technique", completed: false },
          { id: "w1_t2", title: "Implement Linked Lists, Double Linked Lists, Stack, and Queue", completed: false },
          { id: "w1_t3", title: "Solve 10 Medium-level Array/String tasks on LeetCode", completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Core Computer Science Fundamentals",
        tasks: [
          { id: "w2_t1", title: "Revise OOP Principles in Java/C++ and Database Normalization", completed: false },
          { id: "w2_t2", title: "Revise SQL operations, Indexing, and transaction ACID properties", completed: false },
          { id: "w2_t3", title: "Study OS Processes, threads, mutex locks, and page fault handling", completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Advanced Data Structures & Design",
        tasks: [
          { id: "w3_t1", title: "Learn Binary Trees, Traversals (Pre/Post/In-Order) and BST search", completed: false },
          { id: "w3_t2", title: "Study System Design: Scalability, Load Balancers, and Caching mechanisms", completed: false },
          { id: "w3_t3", title: "Solve 5 medium-difficulty recursion/backtracking problems", completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Company Mock Prep & HR Fine-Tuning",
        tasks: [
          { id: "w4_t1", title: "Read 10 previous candidate interview experiences for " + targetCompany, completed: false },
          { id: "w4_t2", title: "Complete 3 full technical DSA mock challenges under timed pressure", completed: false },
          { id: "w4_t3", title: "Practice HR Mock Simulator responses using the audio voice coach", completed: false }
        ]
      }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert career advisor. Generate a 4-week placement preparation roadmap for a student.
      Student Skills: ${skills.join(', ')}
      Target Company: ${targetCompany}
      Target Role/Goal: ${goal}

      Output a JSON array of weekly plans. Each weekly plan must contain:
      1. weekNumber (Number)
      2. title (String summarizing focus area)
      3. tasks (Array of tasks, each containing a unique string 'id' (like w1_t1, w1_t2), 'title' description, and 'completed' set to false)

      Return ONLY the JSON array. Do not wrap in markdown tags.
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJSONText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJSONText);
  } catch (e) {
    console.error("Gemini Roadmap generator failed. Returning fallback.", e);
    return [
      {
        weekNumber: 1,
        title: "Vite/Mock Roadmap: Algorithms basics",
        tasks: [{ id: "fallback_1", title: "Practice dynamic programming basics", completed: false }]
      }
    ];
  }
};

export const evaluateInterviewAnswer = async (question, answer) => {
  if (!isAIActive()) {
    console.log(">>> Gemini Key not found. Using Mock Interview Evaluator.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Evaluate based on length and common filler patterns
    const fillerWords = [];
    const lowerAnswer = answer.toLowerCase();
    if (lowerAnswer.includes("uh")) fillerWords.push("uh");
    if (lowerAnswer.includes("um")) fillerWords.push("um");
    if (lowerAnswer.includes("like")) fillerWords.push("like");
    if (lowerAnswer.split(" ").length < 10) fillerWords.push("short_response");

    const speed = Math.floor(Math.random() * (150 - 110 + 1)) + 110; // words per minute
    const clarity = answer.split(" ").length > 30 ? 85 : 65;
    const confidence = answer.includes("confident") || answer.length > 50 ? 90 : 75;
    const communication = (clarity + confidence) / 2;

    let textFeedback = "Your response is structured, but could benefit from using the STAR method (Situation, Task, Action, Result) to layout your details. Try to avoid fillers like 'um' and 'like'.";
    if (answer.split(" ").length < 15) {
      textFeedback = "Your answer is extremely brief. Try expanding your response with specific examples of projects, academic achievements, or team situations you have handled.";
    }

    return {
      confidence,
      communication,
      grammar: 85,
      clarity,
      fluency: 80,
      fillerWords,
      feedback: textFeedback
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert HR Interview trainer. Assess the following answer to this interview question:
      Question: "${question}"
      User's Answer: "${answer}"

      Generate a JSON object evaluating these categories:
      1. confidence (Number from 0-100)
      2. communication (Number from 0-100)
      3. grammar (Number from 0-100)
      4. clarity (Number from 0-100)
      5. fluency (Number from 0-100)
      6. fillerWords (Array of strings - words like 'um', 'like', 'uh' or other repetitive fillers detected)
      7. feedback (String detailing constructive feedback, specific strengths, weaknesses, and structural recommendations)

      Return ONLY the JSON object. Do not wrap in markdown.
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJSONText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJSONText);
  } catch (e) {
    console.error("Gemini Interview evaluator failed. Returning fallback.", e);
    return {
      confidence: 70,
      communication: 70,
      grammar: 80,
      clarity: 70,
      fluency: 75,
      fillerWords: ["um"],
      feedback: "Communication was adequate, but could be structured better. Practice standard HR sample sets."
    };
  }
};

export const reviewGitHubRepo = async (repoUrl) => {
  if (!isAIActive()) {
    console.log(">>> Gemini Key not found. Using Mock GitHub Repository Reviewer.");
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    // Generate pseudo-random metrics based on repoUrl string to ensure different repos yield different results
    let seed = 0;
    for (let i = 0; i < repoUrl.length; i++) {
      seed += repoUrl.charCodeAt(i);
    }
    
    const codeQuality = 5 + (seed % 5); // 5-9
    const documentation = 4 + ((seed * 2) % 6); // 4-9
    const scalability = 6 + ((seed * 3) % 4); // 6-9
    const readability = 5 + ((seed * 7) % 5); // 5-9
    const resumeImpact = 6 + ((seed * 11) % 5); // 6-10
    
    const overallScore = Math.round((codeQuality + documentation + scalability + readability + resumeImpact) * 2);
    
    const allSuggestions = [
      "Add a comprehensive README.md containing build/run commands and architectural flow diagrams.",
      "Modularize utility functions inside helper files to separate routes/handlers from core business logic.",
      "Include configuration samples for system environment variables rather than hardcoding credentials.",
      "Implement unit tests using Jest/mocha to improve code test coverage stats.",
      "Consider using TypeScript to enforce static typing and prevent runtime type errors.",
      "Add GitHub Actions CI/CD workflows to automatically run linters and tests.",
      "Implement proper error boundaries and global exception handlers to prevent app crashes."
    ];
    
    const suggestions = [];
    suggestions.push(allSuggestions[seed % allSuggestions.length]);
    suggestions.push(allSuggestions[(seed * 2) % allSuggestions.length]);
    suggestions.push(allSuggestions[(seed * 3) % allSuggestions.length]);

    return {
      codeQuality,
      documentation,
      scalability,
      overallScore,
      readability,
      resumeImpact,
      suggestions: [...new Set(suggestions)] // remove duplicates
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a senior tech lead reviewing a student's GitHub repository. Analyze the repository URL context:
      Repo URL: "${repoUrl}"

      Output a JSON object rating these dimensions (out of 10):
      1. codeQuality
      2. documentation
      3. scalability
      4. readability
      5. resumeImpact
      And calculate:
      6. overallScore (out of 100)
      7. suggestions (Array of strings - detailed, actionable code improvement steps, structure guidelines, README instructions)

      Return ONLY the JSON object. Do not wrap in markdown.
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJSONText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJSONText);
  } catch (e) {
    console.error("Gemini GitHub reviewer failed. Returning fallback.", e);
    return {
      codeQuality: 7,
      documentation: 6,
      scalability: 7,
      overallScore: 72,
      readability: 7,
      resumeImpact: 7,
      suggestions: ["Write code explanations", "Include config files example"]
    };
  }
};

export const getMentorChatResponse = async (userMetrics, message, chatHistory = []) => {
  if (!isAIActive()) {
    console.log(">>> Gemini Key not found. Using Mock Career Mentor.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("tcs") || lowerMsg.includes("infosys") || lowerMsg.includes("accenture")) {
      return "For service-based companies like TCS, Infosys, and Accenture, focus strongly on your core technical subjects (DBMS, OS, OOPs), Aptitude skills, and basic coding constructs (Strings, Arrays, and searching/sorting algorithms). Try completing the weekly mock challenges in our Placement Battle Arena to boost your scores!";
    }
    if (lowerMsg.includes("resume") || lowerMsg.includes("ats")) {
      return "Your current ATS score is " + (userMetrics.resumeScore || 82) + "/100. I recommend uploading your revised resume in the Resume Analyzer module. Focus on adding high-impact keywords like 'AWS', 'Redis', and 'CI/CD' which are currently missing.";
    }
    if (lowerMsg.includes("dsa") || lowerMsg.includes("leetcode")) {
      return "Your DSA progress is at Intermediate. I suggest focusing on Tree traversals and Graph traversals this week. Check out the DSA Topics Asked in our Company-Specific Prep Engine for customized learning tracks.";
    }
    if (lowerMsg.includes("google") || lowerMsg.includes("amazon") || lowerMsg.includes("microsoft")) {
      return "To target FAANG tier companies like Google or Amazon, your current readiness prediction is " + (userMetrics.googleReadiness || "40") + "%. You need to improve your DSA score (currently Intermediate) and GitHub Health. Target solving at least 150 Medium-Hard LeetCode problems and clean up your portfolio projects using our GitHub reviewer.";
    }

    return "Hello! I am your AI Placement Twin mentor. Currently, your strengths lie in React and Backend architecture, while your main area of growth is Data Structures (DSA) and Communication. Let me know what company you are preparing for so I can guide you through their specific interview rounds and recommend next actions!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const formattedHistory = chatHistory.map(chat => `${chat.sender === 'user' ? 'User' : 'AI'}: ${chat.text}`).join('\n');
    const prompt = `
      You are Placement Twin, an intelligent AI career mentor for a college student preparing for jobs.
      Student Current Profile:
      - Skills: ${JSON.stringify(userMetrics.skills || [])}
      - Strengths: ${JSON.stringify(userMetrics.strengths || [])}
      - Weaknesses: ${JSON.stringify(userMetrics.weaknesses || [])}
      - Placement Readiness: ${userMetrics.readinessScore || 45}%
      - Target Company: ${userMetrics.targetCompany || 'Google'}

      Conversation History:
      ${formattedHistory}

      Student Message: "${message}"

      Write a supportive, highly specific, and actionable mentoring response. Recommend particular modules in the system (e.g. Resume Analyzer, Company-Specific Prep Engine, Interview Simulator, Battle Arena) when appropriate. Keep the tone inspiring and direct.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Gemini Career Mentor chat failed.", e);
    return "I am having a small trouble reaching the core mentor server, but I advise practicing interview scenarios in the HR Simulator and keeping up your daily DSA streak!";
  }
};
