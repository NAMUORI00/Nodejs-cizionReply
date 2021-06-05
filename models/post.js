'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    static associate(models) {
      post.belongsTo(models.user, {
        foreignKey: "userEmail"
      });
      post.hasMany(models.reply);
    }
  };
  post.init({
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};