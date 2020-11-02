"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "Literatures",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          type: Sequelize.STRING,
        },
        publication: {
          type: Sequelize.DATE,
        },
        UserId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        pages: {
          type: Sequelize.INTEGER,
        },
        isbn: {
          type: Sequelize.STRING,
        },
        author: {
          type: Sequelize.STRING,
        },
        status: {
          type: Sequelize.ENUM(
            "Waiting to be verified",
            "Approved",
            "Canceled"
          ),
        },
        fileUrl: {
          type: Sequelize.STRING,
        },
        thumbnailUrl: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Literatures");
  },
};
