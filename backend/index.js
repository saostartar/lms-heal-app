import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import modulesRoutes from './routes/modulesRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import learnerRoutes from './routes/learnerRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import forumRoutes from './routes/forumRoutes.js';

// Configure environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.API_PORT || 5000; // Changed from PORT to API_PORT to avoid conflict

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('E-Learning Platform API is running');
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes (if any)
app.use('/api/public', publicRoutes);

// Routes configuration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/forum', forumRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server after database connection
// Start server after database connection
const startServer = async () => {
  try {
    // Test database connection without syncing models
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Only sync database models in development, and with safer options
    if (process.env.NODE_ENV === 'development') {
      try {
        // Use alter:true instead of force:true for a safer update
        // This will update tables to match models without dropping data
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized successfully.');
      } catch (error) {
        console.error('Error synchronizing database models:', error);
        process.exit(1);
      }
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process with failure
  }
};

startServer();