const { Literatures, Users } = require("../../models");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("@hapi/joi");

const schema = Joi.object({
  title: Joi.string().min(6).required(),
  publication: Joi.string().required(),
  pages: Joi.number().required(),
  isbn: Joi.string().required(),
  author: Joi.string().required(),
  status: Joi.string(),
  userId: Joi.number(),
});

const ebookDestination = process.env.MULTER_EBOOK_DESTINATION;
const thumbDestination = process.env.MULTER_EBOOK_THUMBNAIL_DESTINATION;

exports.get = async (req, res) => {
  try {
    const { q, from, to, status } = req.query;
    const { id } = req.params;

    const literatureQuery = {
      where: {
        [Op.and]: [
          // sequelize.where(sequelize.fn("YEAR", sequelize.col("publication")), {
          sequelize.where(
            sequelize.literal("TO_CHAR(\"publication\", 'YYYY')"),
            {
              [Op.between]: [from || "0", to || "2020"],
            }
          ),
          {
            title: {
              [Op.like]: "%" + (q || "") + "%",
            },
          },
          status && {
            status: status,
          },
        ],
      },
      include: {
        model: Users,
        as: "uploader",
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "UserId"],
      },
    };

    const data = !id
      ? await Literatures.findAll(literatureQuery)
      : await Literatures.findOne({
          where: {
            id,
          },
          include: {
            model: Users,
            as: "uploader",
            attributes: {
              exclude: ["createdAt", "updatedAt", "password"],
            },
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "UserId"],
          },
        });

    if (data) {
      res.send({
        message: "Response Successfully",
        data,
      });
    } else {
      throw new Error();
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
  let payload = req.body;
  const { error } = await schema.validate(payload);
  if (error) {
    return res
      .status(400)
      .send({ error: { message: error.details[0].message } });
  }

  try {
    const fullUrl = req.protocol + "://" + req.get("host");
    const fileUrl =
      fullUrl + `${ebookDestination}/` + req.files["file"][0].filename;
    const thumbnailUrl = fullUrl + `${thumbDestination}/default.png`;

    const data = await Literatures.create({
      ...payload,
      fileUrl,
      thumbnailUrl,
    });
    res.send({
      message:
        payload.status === "Approved"
          ? "Thank you for adding your own literature to our website."
          : "Thank you for adding your own literature to our website, please wait 1 x 24 hours to verifying by admin",
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
    const id = req.params.id;
    const removed = await Literatures.destroy({
      where: {
        id,
      },
    });

    if (removed) {
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

exports.patch = async (req, res) => {
  let data = req.body;

  try {
    const id = req.params.id;
    const updated = await Literatures.update(data, {
      where: {
        id,
      },
    });

    if (updated) {
      res.send({
        message: "Successfully Updated",
        data,
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
