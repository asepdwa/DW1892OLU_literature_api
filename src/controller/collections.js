const { Collections, Literatures, Users } = require("../../models");

exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const { page: pageQuery, limit: limitQuery } = req.query;

    const page = pageQuery ? pageQuery - 1 : 0;
    const pageSize = parseInt(limitQuery ? limitQuery : 12);

    const data = await Users.findOne({
      where: {
        id,
      },
      include: {
        model: Literatures,
        as: "collections_data",
        through: {
          model: Collections,
          as: "info",
          attributes: {
            include: ["id"],
            exclude: ["createdAt", "updatedAt"],
          },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        offset: page * pageSize,
        limit: pageSize,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
    });

    if (data) {
      res.send({
        message: "Response Successfully",
        data,
      });
    } else {
      res.status(500).send({
        message: "Not Found",
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
    const { UserId, LiteratureId } = req.query;
    const removed = await Collections.destroy({
      where: {
        UserId,
        LiteratureId,
      },
    });

    if (removed) {
      res.send({
        message: "This literature has been removed from your collection",
        UserId,
        LiteratureId,
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
