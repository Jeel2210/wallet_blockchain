'use strict';
const { Model } = require('sequelize');
const Roles = require('../helpers/roles');


module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      // this.hasOne(models.wallet, {
      //   foreignKey: 'user_id',
      // });
      this.hasOne(models.wallet, { foreignKey: 'user_id', as: 'wallet' })
    }
  };
  user.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: Roles.employee
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,

    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,

    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,

    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'user',
    freezeTableName: true,
    underscored: true,
    freezeTableName: true,
  });
  return user;
};
