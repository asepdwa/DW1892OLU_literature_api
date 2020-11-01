"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Literatures extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Literatures.belongsTo(models.Users, {
        as: "uploader",
        foreignKey: {
          name: "userId",
          onDelete: "CASCADE",
        },
      });
      Literatures.belongsToMany(models.Users, {
        as: "user_collections",
        through: {
          model: "Collections",
          as: "info",
        },
      });
    }
  }
  Literatures.init(
    {
      title: DataTypes.STRING,
      publication: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      pages: DataTypes.INTEGER,
      isbn: DataTypes.STRING,
      author: DataTypes.STRING,
      fileUrl: DataTypes.STRING,
      thumbnailUrl: DataTypes.STRING,
      status: DataTypes.ENUM("Waiting to be verified", "Approved", "Canceled"),
    },
    {
      sequelize,
      modelName: "Literatures",
    }
  );
  return Literatures;
};
