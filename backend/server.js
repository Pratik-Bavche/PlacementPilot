import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, db } from './services/dbService.js';

// Pre-load Mongoose models so registrations happen before routing
import './models/user.js';
import './models/resume.js';
import './models/roadmap.js';
import './models/interview.js';
import './models/application.js';
import './models/experience.js';
import './models/battle.js';

import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow connections from all origins for easy development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main entry check
app.get('/', (req, res) => {
  res.json({ message: 'PlacementPilot AI API Server is running', status: 'Healthy', dbMode: db.isLocal() ? 'Local JSON file' : 'MongoDB Mongoose' });
});

// Mount Routes
app.use('/api', apiRoutes);

// Database connection and server initialization
const startServer = async () => {
  await connectDB();
  
  // Seed initial Admin Account if no users exist
  try {
    const adminEmail = 'admin@placementpilot.ai';
    const existingAdmin = await db.users.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log('>>> Seeding Default Administrator Account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin_password_123', salt);
      await db.users.create({
        name: 'Placement Coordinator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        streak: 1,
        targetCompany: 'Google',
        skills: ['Management', 'Strategy', 'Algorithms'],
        strengths: ['Coordination', 'Communication'],
        weaknesses: ['None'],
        readinessScore: 99
      });
      console.log(`>>> Admin Account Registered:`);
      console.log(`    Email: ${adminEmail}`);
      console.log(`    Password: admin_password_123`);
    }
  } catch (err) {
    console.error('Error seeding admin user', err);
  }

  app.listen(PORT, () => {
    console.log(`>>> Express Server running on port ${PORT}`);
  });
};

startServer();
