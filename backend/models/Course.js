import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Course = sequelize.define('Course', {
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
    allowNull: false
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('psikologi', 'mental', 'gizi'),
    defaultValue: 'gizi'
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  preTestQuizId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Quizzes',
      key: 'id'
    }
  },
  postTestQuizId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Quizzes',
      key: 'id'
    }
  },
  requirePreTest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Course;