'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class like extends Model {
    static associate(models) {
      like.belongsTo(models.user, {
        foreignKey: "userEmail"
      });
      like.belongsTo(models.reply, {
        foreignKey: "replyId"
      });
    }
  };
  like.init({
    replyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'like',
  });
  return like;
};