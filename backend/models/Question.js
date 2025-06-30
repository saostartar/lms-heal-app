import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Quizzes',
      key: 'id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
    allowNull: false,
    defaultValue: 'multiple_choice'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

export default Question;
