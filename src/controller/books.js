const { Books, Users } = require("../../models");
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

exports.get = async (req, res) => {
  try {
    const { year, search } = req.query;
    const { id } = req.params;

    const bookQuery = {
      where: ((year || search) && {
        [Op.and]: [
          (year && sequelize.where(sequelize.fn('YEAR', sequelize.col('publication')), parseInt(year))),
          (search && { 'title': { [Op.like]: '%' + search + '%' } }),
        ]
      }),
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

    const data = !id ? await Books.findAll(bookQuery)
      : await Books.findOne(
        {
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
        }
      );

    if (data) {
      res.send({
        message: "Response Successfully",
        data,
      });
    } else {
      throw new Error;
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
    const fullUrl = req.protocol + '://' + req.get('host');
    const fileUrl = fullUrl + "/ebook/" + req.files["file"][0].filename;

    const data = await Books.create({
      ...payload,
      fileUrl
    });
    res.send({
      message: payload.status === "Approved" ? "Thank you for adding your own literature to our website."
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
    const removed = await Books.destroy({
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
    const updated = await Books.update(data, {
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