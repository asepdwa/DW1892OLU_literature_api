const { Literatures, Users } = require("../../models");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("@hapi/joi");

// const convertapi = require("convertapi")("7ZtF3Ao7avqqbYHm");
// const pdfThumb = require("pdf-thumbnail");

const { Storage } = require("@google-cloud/storage");
const { buketUri, storageConfig } = require("../../config/firebase");

const storage = new Storage(storageConfig);
const bucket = storage.bucket(buketUri);

const schema = Joi.object({
  title: Joi.string().min(6).required(),
  publication: Joi.string().required(),
  pages: Joi.number().required(),
  isbn: Joi.string().required(),
  author: Joi.string().required(),
  status: Joi.string(),
  UserId: Joi.number(),
});

exports.get = async (req, res) => {
  try {
    const {
      q,
      from,
      to,
      status,
      sort,
      order,
      uploader,
      page: pageQuery,
      limit: limitQuery,
    } = req.query;
    const { id } = req.params;

    const page = pageQuery ? pageQuery - 1 : 0;
    const pageSize = parseInt(limitQuery ? limitQuery : 12);

    const literatureQuery = {
      where: {
        [Op.and]: [
          // sequelize.where(sequelize.fn("YEAR", sequelize.col("publication")), {
          sequelize.where(
            sequelize.literal("TO_CHAR(\"publication\", 'YYYY')"),
            {
              [Op.between]: [from || "0", to || "2030"],
            }
          ),
          {
            title: {
              [Op.iLike]: "%" + (q || "") + "%",
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
        where: {
          [Op.and]: [{ id: uploader }],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [
        ["createdAt", "DESC"],
        [sort || "id", order || "ASC"],
      ],
      offset: page * pageSize,
      limit: pageSize,
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
            exclude: ["createdAt", "updatedAt"],
          },
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
  let payload = req.body;
  const { error } = await schema.validate(payload);
  if (error) {
    return res
      .status(400)
      .send({ error: { message: error.details[0].message } });
  }

  try {
    const fileName = Date.now() + "-" + req.files["file"][0].originalname;
    const thumbnailName =
      Date.now() + "-" + req.files["thumbnail"][0].originalname;
    // Create a bucket associated to Firebase storage bucket

    const blob = await bucket.file(fileName);

    // Create writable stream and specifying file mimetype
    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: req.files["file"][0].mimetype,
        firebaseStorageDownloadTokens: null,
      },
    });

    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURI(blob.name)}?alt=media`;

    // When there is no more data to be consumed from the stream
    blobWriter.end(req.files["file"][0].buffer);

    const blob_2 = await bucket.file(thumbnailName);

    // Create writable stream and specifying file mimetype
    const blobWriter_2 = blob_2.createWriteStream({
      metadata: {
        contentType: req.files["thumbnail"][0].mimetype,
        firebaseStorageDownloadTokens: null,
      },
    });

    const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURI(blob_2.name)}?alt=media`;

    // When there is no more data to be consumed from the stream
    blobWriter_2.end(req.files["thumbnail"][0].buffer);

    // const pdfThumb = await convertapi.convert("thumbnail", {
    //   File: req.file,
    // });

    // console.log(pdfThumb);

    try {
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
    } catch (error) {
      console.log(err);

      res.status(500).send({
        error: {
          message: "Server ERROR",
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
