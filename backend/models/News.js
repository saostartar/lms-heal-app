import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import User from './User.js';

const News = db.define('News', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('mental_health', 'obesity', 'general'),
    defaultValue: 'general'
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Association with the user who created it (admin)
News.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

export default News;