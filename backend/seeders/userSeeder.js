import { fileURLToPath } from 'url';
import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const { User } = db;

const seedUsers = async () => {
  try {
    console.log('Starting user seeder...');
    
    // Clean up existing users if needed (optional)
    // await User.destroy({ where: {}, truncate: true });
    
    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create instructor users
    const instructors = [
      {
        name: 'John Instructor',
        email: 'instructor@example.com',
        password: 'instructor123',
        role: 'instructor',
        bio: 'Expert in mental health with 10+ years of experience.',
        isActive: true
      },
      {
        name: 'Sarah Teacher',
        email: 'sarah@example.com',
        password: 'instructor123',
        role: 'instructor',
        bio: 'Certified nutrition coach specializing in obesity management.',
        isActive: true
      }
    ];
    
    for (const instructorData of instructors) {
      const instructorExists = await User.findOne({ where: { email: instructorData.email } });
      if (!instructorExists) {
        await User.create(instructorData);
        console.log(`Instructor ${instructorData.name} created`);
      } else {
        console.log(`Instructor ${instructorData.name} already exists`);
      }
    }
    
    // Create learner users
    const learners = [
      {
        name: 'Alice Student',
        email: 'learner@example.com',
        password: 'learner123',
        role: 'learner',
        interests: 'Mental health, meditation',
        isActive: true
      },
      {
        name: 'Bob Learner',
        email: 'bob@example.com',
        password: 'learner123',
        role: 'learner',
        interests: 'Nutrition, weight management',
        isActive: true
      },
      {
        name: 'Charlie User',
        email: 'charlie@example.com',
        password: 'learner123',
        role: 'learner',
        interests: 'General health, wellbeing',
        isActive: true
      }
    ];
    
    for (const learnerData of learners) {
      const learnerExists = await User.findOne({ where: { email: learnerData.email } });
      if (!learnerExists) {
        await User.create(learnerData);
        console.log(`Learner ${learnerData.name} created`);
      } else {
        console.log(`Learner ${learnerData.name} already exists`);
      }
    }
    
    console.log('User seeding completed!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Close database connection if needed
    // await db.sequelize.close();
  }
};

// Check if this file is being run directly (not imported)
const isMainModule = fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  seedUsers()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

export default seedUsers;