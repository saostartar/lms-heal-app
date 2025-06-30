import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ForumCategory = sequelize.define(
  "ForumCategory",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["slug"],
        name: "forum_categories_slug_unique",
      },
    ],
  }
);

export default ForumCategory;
