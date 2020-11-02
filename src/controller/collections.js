const { Collections } = require("../../models");

exports.add = async (req, res) => {
  try {
    let payload = req.body;
    const data = await Collections.create(payload);
    res.send({
      message: "This literature has been added to your collection",
      data,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      error: {
        message: "Server ERROR",
      },
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { userId, literatureId } = req.query;
    const removed = await Collections.destroy({
      where: {
        userId,
        literatureId,
      },
    });

    if (removed) {
      res.send({
        message: "This literature has been removed from your collection",
        userId,
        literatureId,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server ERROR",
      },
    });
  }
};

// exports.getCollectionsUser = async (req, res) => {
//   try {
//     const bookData = await Books.findAll({
//       include: {
//         model: Users,
//         as: "user_bookmarks",
//         through: {
//           model: Collections,
//           as: "info",
//         },
//       },
//     });

//     res.send({
//       message: "Success",
//       data: {
//         book: bookData,
//       },
//     });
//   } catch (err) {
//     console.log(err);

//     res.status(500).send({
//       error: {
//         message: "Server ERROR",
//       },
//     });
//   }
// };

// exports.getUsersBookmark = async (req, res) => {
//   try {
//     const data = await Users.findAll({
//       include: {
//         model: Books,
//         as: "bookmarks_data",
//         through: {
//           model: Collections,
//           as: "info",
//         },
//       },
//     });

//     res.send({
//       message: "Response Success",
//       data: {
//         bookmarks: data,
//       },
//     });
//   } catch (err) {
//     console.log(err);

//     res.status(500).send({
//       error: {
//         message: "Server ERROR",
//       },
//     });
//   }
// };
