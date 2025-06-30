import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ForumPost = sequelize.define('ForumPost', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default ForumPost;