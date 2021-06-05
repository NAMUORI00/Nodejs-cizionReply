'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reply extends Model {
    static associate(models) {
      reply.belongsTo(models.post, {
        foreignKey: "postId"
      });
      reply.belongsTo(models.user, {
        foreignKey: "userEmail"
      });
      reply.hasMany(models.like);
    }
  };
  reply.init({
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unlikeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'reply',
  });
  return reply;
};