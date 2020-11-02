"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hashSync(
      "12345678",
      bcrypt.genSaltSync(10)
    );

    try {
      const query = await queryInterface.bulkInsert("Users", [
        {
          email: "dumb@ways.id",
          password: hashedPassword,
          fullName: "DumbWays",
          gender: "Male",
          phone: "0813 - 1111 - 2222",
          address:
            "Jl. Elang IV, Sawah Lama, Kec. Ciputat, Kota Tangerang Selatan, Banten 15413",
          photoUrl: "https://dumbways.id/assets/images/brandwhite.png",
          role: "Admin",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          email: "andreahirata@gmail.com",
          password: hashedPassword,
          fullName: "Andrea Hirata",
          gender: "Male",
          phone: "0813 - 1111 - 2222",
          address: "Jl. Pegangsaan timur, Jakarta",
          photoUrl:
            "https://blue.kumparan.com/image/upload/fl_progressive,fl_lossy,c_fill,q_auto:best,w_640/v1553850277/zxw7yum1w0wx0ynkhg5r.jpg",
          role: "Guest",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          email: "jkrowling@gmail.com",
          password: hashedPassword,
          fullName: "J.K Rowling",
          gender: "Male",
          phone: "0813 - 1111 - 2222",
          address: "Jl. Lele raya, Jakarta",
          photoUrl:
            "https://pbs.twimg.com/profile_images/1265044655890149376/WpCp6n9e.jpg",
          role: "Guest",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      if (query) console.log("Success");
      else console.log("Failed");
    } catch (error) {
      console.log(error);
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
