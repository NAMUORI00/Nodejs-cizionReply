'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      user.hasMany(models.post);
      user.hasMany(models.reply);
      user.hasMany(models.like);
    }
  };
  user.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      },
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};