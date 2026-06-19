import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '../../local_db.json');

let useLocalDB = false;

// Attempt to connect to MongoDB
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/placementpilot';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fall back fast
    });
    console.log('>>> Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('>>> MongoDB connection failed. Falling back to Local JSON DB.');
    useLocalDB = true;
    initializeLocalDB();
  }
};

// Initialize Local JSON file if it doesn't exist
const initializeLocalDB = () => {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialData = {
      users: [],
      resumes: [],
      roadmaps: [],
      interviews: [],
      applications: [],
      experiences: [
        {
          _id: "exp_1",
          userId: "admin_1",
          userName: "Placement Coordinator",
          company: "Google",
          role: "Software Engineer",
          rounds: ["Coding Round (2 DSA)", "System Design", "Googliness & Behavioral"],
          questions: [
            "Given a binary tree, find the maximum path sum between two nodes.",
            "Design a distributed rate limiter.",
            "Tell me about a time you had a conflict with a team member."
          ],
          difficulty: "Hard",
          status: "Selected",
          approved: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: "exp_2",
          userId: "admin_1",
          userName: "Alumni Mentor",
          company: "Amazon",
          role: "SDE 1",
          rounds: ["Online Assessment", "Technical Round 1", "Bar Raiser"],
          questions: [
            "LRU Cache implementation.",
            "Merge K Sorted Lists.",
            "Describe a project you worked on where you took complete ownership."
          ],
          difficulty: "Medium",
          status: "Selected",
          approved: true,
          createdAt: new Date().toISOString()
        }
      ],
      battles: []
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
    console.log(`>>> Local database initialized at: ${LOCAL_DB_PATH}`);
  }
};

// Helper to read local DB
const readLocalDB = () => {
  initializeLocalDB();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading local db, returning empty template", e);
    return { users: [], resumes: [], roadmaps: [], interviews: [], applications: [], experiences: [], battles: [] };
  }
};

// Helper to write local DB
const writeLocalDB = (data) => {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
};

// Simple CRUD creator for fallback local collections
const createLocalCollection = (collectionName) => {
  return {
    find: async (query = {}) => {
      const data = readLocalDB();
      const list = data[collectionName] || [];
      return list.filter(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findOne: async (query = {}) => {
      const data = readLocalDB();
      const list = data[collectionName] || [];
      return list.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      const data = readLocalDB();
      const list = data[collectionName] || [];
      return list.find(item => item._id === id || item.id === id) || null;
    },
    create: async (doc) => {
      const data = readLocalDB();
      if (!data[collectionName]) data[collectionName] = [];
      const newDoc = {
        _id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        ...doc
      };
      data[collectionName].push(newDoc);
      writeLocalDB(data);
      return newDoc;
    },
    findByIdAndUpdate: async (id, updateDoc, options = {}) => {
      const data = readLocalDB();
      const list = data[collectionName] || [];
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      
      const updated = {
        ...list[index],
        ...(updateDoc.$set ? updateDoc.$set : updateDoc),
        updatedAt: new Date().toISOString()
      };
      
      list[index] = updated;
      writeLocalDB(data);
      return updated;
    },
    deleteOne: async (query = {}) => {
      const data = readLocalDB();
      const list = data[collectionName] || [];
      const index = list.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (index === -1) return { deletedCount: 0 };
      list.splice(index, 1);
      writeLocalDB(data);
      return { deletedCount: 1 };
    },
    deleteMany: async (query = {}) => {
      const data = readLocalDB();
      const list = data[collectionName] || [];
      const originalLength = list.length;
      const filtered = list.filter(item => {
        for (let key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });
      data[collectionName] = filtered;
      writeLocalDB(data);
      return { deletedCount: originalLength - filtered.length };
    }
  };
};

// Interface router that delegates to either mongoose or the JSON DB
export const db = {
  isLocal: () => useLocalDB,
  users: {
    find: async (q) => useLocalDB ? createLocalCollection('users').find(q) : mongoose.model('User').find(q),
    findOne: async (q) => useLocalDB ? createLocalCollection('users').findOne(q) : mongoose.model('User').findOne(q),
    findById: async (id) => useLocalDB ? createLocalCollection('users').findById(id) : mongoose.model('User').findById(id),
    create: async (doc) => useLocalDB ? createLocalCollection('users').create(doc) : mongoose.model('User').create(doc),
    findByIdAndUpdate: async (id, update) => useLocalDB ? createLocalCollection('users').findByIdAndUpdate(id, update) : mongoose.model('User').findByIdAndUpdate(id, update, { new: true })
  },
  resumes: {
    find: async (q) => useLocalDB ? createLocalCollection('resumes').find(q) : mongoose.model('Resume').find(q),
    findOne: async (q) => useLocalDB ? createLocalCollection('resumes').findOne(q) : mongoose.model('Resume').findOne(q),
    create: async (doc) => useLocalDB ? createLocalCollection('resumes').create(doc) : mongoose.model('Resume').create(doc),
    findByIdAndUpdate: async (id, update) => useLocalDB ? createLocalCollection('resumes').findByIdAndUpdate(id, update) : mongoose.model('Resume').findByIdAndUpdate(id, update, { new: true }),
    deleteOne: async (q) => useLocalDB ? createLocalCollection('resumes').deleteOne(q) : mongoose.model('Resume').deleteOne(q)
  },
  roadmaps: {
    findOne: async (q) => useLocalDB ? createLocalCollection('roadmaps').findOne(q) : mongoose.model('Roadmap').findOne(q),
    create: async (doc) => useLocalDB ? createLocalCollection('roadmaps').create(doc) : mongoose.model('Roadmap').create(doc),
    findByIdAndUpdate: async (id, update) => useLocalDB ? createLocalCollection('roadmaps').findByIdAndUpdate(id, update) : mongoose.model('Roadmap').findByIdAndUpdate(id, update, { new: true })
  },
  interviews: {
    find: async (q) => useLocalDB ? createLocalCollection('interviews').find(q) : mongoose.model('Interview').find(q),
    create: async (doc) => useLocalDB ? createLocalCollection('interviews').create(doc) : mongoose.model('Interview').create(doc)
  },
  applications: {
    find: async (q) => useLocalDB ? createLocalCollection('applications').find(q) : mongoose.model('Application').find(q),
    create: async (doc) => useLocalDB ? createLocalCollection('applications').create(doc) : mongoose.model('Application').create(doc),
    findByIdAndUpdate: async (id, update) => useLocalDB ? createLocalCollection('applications').findByIdAndUpdate(id, update) : mongoose.model('Application').findByIdAndUpdate(id, update, { new: true }),
    deleteOne: async (q) => useLocalDB ? createLocalCollection('applications').deleteOne(q) : mongoose.model('Application').deleteOne(q)
  },
  experiences: {
    find: async (q) => useLocalDB ? createLocalCollection('experiences').find(q) : mongoose.model('Experience').find(q),
    create: async (doc) => useLocalDB ? createLocalCollection('experiences').create(doc) : mongoose.model('Experience').create(doc),
    findByIdAndUpdate: async (id, update) => useLocalDB ? createLocalCollection('experiences').findByIdAndUpdate(id, update) : mongoose.model('Experience').findByIdAndUpdate(id, update, { new: true }),
    deleteOne: async (q) => useLocalDB ? createLocalCollection('experiences').deleteOne(q) : mongoose.model('Experience').deleteOne(q)
  },
  battles: {
    find: async (q) => useLocalDB ? createLocalCollection('battles').find(q) : mongoose.model('Battle').find(q),
    create: async (doc) => useLocalDB ? createLocalCollection('battles').create(doc) : mongoose.model('Battle').create(doc)
  }
};
