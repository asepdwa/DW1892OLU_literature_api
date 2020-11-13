const { Literatures, Users } = require("../../models");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("@hapi/joi");

const { Storage } = require("@google-cloud/storage");
const { buketUri, storageConfig } = require("../../config/firebase");

const storage = new Storage(storageConfig);

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
        exclude: ["createdAt", "updatedAt"],
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
            exclude: ["createdAt", "updatedAt"],
          },
        });

    if (data) {
      console.log(data[0].fileUrl);
      if (id) {
        const downloadUrl = await storage
          .refFromURL(data[0].fileUrl)
          .getDownloadURL();
        res.send({
          message: "Response Successfully",
          data,
          downloadUrl,
        });
      } else {
        res.send({
          message: "Response Successfully",
          data,
        });
      }
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
    const fileName = Date.now() + "-" + req.files["file"][0].originalname;
    const thumbnailUrl =
      "https://res.cloudinary.com/literature/image/upload/v1604297802/literature/thumbnails/default_splwib.png";

    // Create a bucket associated to Firebase storage bucket
    const bucket = storage.bucket(buketUri);
    const blob = await bucket.file(fileName);
    // Create writable stream and specifying file mimetype
    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: req.files["file"][0].mimetype,
        firebaseStorageDownloadTokens: null,
      },
    });

    blobWriter.on("error", (err) => new Error(err));
    blobWriter.on("finish", async () => {
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

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
    });

    // When there is no more data to be consumed from the stream
    blobWriter.end(req.files["file"][0].buffer);
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
