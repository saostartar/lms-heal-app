import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ForumTopic = sequelize.define('ForumTopic', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

export default ForumTopic;