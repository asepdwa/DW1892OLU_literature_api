const { Users, Books, Bookmarks } = require("../../models");
const userQuery = {
  include: {
    model: Books,
    as: "bookmarks_data",
    through: {
      model: Bookmarks,
      as: "info",
      attributes: {
        include: ["id"],
        exclude: ["createdAt", "updatedAt"],
      },
    },
  },
  attributes: {
    exclude: ["createdAt", "updatedAt", "password"],
  },
};

exports.get = async (req, res) => {
  try {
    const id = req.params.id;
    let data = null;
    !id
      ? data = await Users.findAll(userQuery)
      : data = await Users.findOne({
        where: {
          id,
        },
        include: {
          model: Books,
          as: "bookmarks_data",
          through: {
            model: Bookmarks,
            as: "info",
            attributes: {
              include: ["id"],
              exclude: ["createdAt", "updatedAt"],
            },
          },
          include: {
            model: Users,
            as: "uploader",
            attributes: {
              exclude: ["createdAt", "updatedAt", "password"],
            },
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "info"],
          },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });

    if (data !== null) {
      res.send({
        message: "Response Successfully",
        data,
      });
    } else {
      res.status(500).send({
        error: {
          message: "User Not Found",
        },
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

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Users.destroy({
      where: {
        id,
      },
    })

    if (deleted) {
      res.send({
        message: "Successfully Deleted",
        id,
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

exports.patch_avatar = async (req, res) => {
  try {
    const id = req.params.id;

    const fullUrl = req.protocol + '://' + req.get('host') + "/avatar/";
    const photoUrl = fullUrl + req.files["avatar"][0].filename;

    const patch = await Users.update({ photoUrl }, {
      where: {
        id,
      },
    })

    if (patch) {
      res.send({
        message: "Successfully change photo profile",
        data: {
          id,
          photoUrl,
        },
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

exports.patch = async (req, res) => {
  try {
    const id = req.params.id;
    let updated = req.body;

    const patch = await Users.update(updated, {
      where: {
        id,
      },
    })

    if (patch) {
      res.send({
        message: "Successfully Updated",
        data: {
          id,
          updated,
        },
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
