import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Rest of the fields remain the same
  passingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 0,
      max: 100
    }
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: true, // null means no time limit
    comment: 'Time limit in minutes'
  },
  shuffleQuestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allowReview: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    allowNull: true, // null means unlimited attempts
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft'
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPreTest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if this quiz is a pre-test for a course'
  },
  isPostTest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if this quiz is a post-test for a course'
  }
}, {
  indexes: [
    {
      fields: ['moduleId']
    },
    {
      fields: ['lessonId']
    },
    {
      fields: ['courseId']
    }
  ]
});

export default Quiz;