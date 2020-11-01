"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.Literatures);
      Users.belongsToMany(models.Literatures, {
        as: "collections_data",
        through: {
          model: "Collections",
          as: "info",
        },
      });
    }
  }
  Users.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      fullName: DataTypes.STRING,
      gender: DataTypes.ENUM("Male", "Female"),
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      photoUrl: DataTypes.STRING,
      role: DataTypes.ENUM("Guest", "Admin"),
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
