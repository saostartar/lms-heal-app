import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quizAttemptId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'QuizAttempts',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'id'
    }
  },
  selectedOptionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Options',
      key: 'id'
    }
  },
  textAnswer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

export default Answer;
