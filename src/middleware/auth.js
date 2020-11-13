const jwt = require("jsonwebtoken");
const multer = require("multer");
const { cloudinary } = require("../../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const jwtKey = process.env.JWT_KEY;
const maxSize = process.env.MULTER_MAX_SIZE;

exports.authentication = {
  authorization: function (req, res, next) {
    let header, token;
    if (
      !(header = req.header("Authorization")) ||
      !(token = header.replace("Bearer ", ""))
    ) {
      return res.status(400).send({
        error: {
          message: "access_denied",
        },
      });
    }

    try {
      const verified = jwt.verify(token, jwtKey);
      req.user = verified;
      next();
    } catch (err) {
      console.log(err);
      res.status(400).send({
        error: {
          message: "invalid_token",
        },
      });
    }
  },

  file_upload: function (uploadField) {
    const storage =
      uploadField === "file"
        ? multer.memoryStorage()
        : new CloudinaryStorage({
            cloudinary: cloudinary,
            params: (req, file) => {
              return {
                folder: `literature/${file.fieldname}s`,
                resource_type: "image",
                public_id:
                  Date.now() + "-" + file.originalname.replace(" ", "-"),
              };
            },
          });

    // var storage = multer.diskStorage({
    //   destination: function (req, file, cb) {
    //     if (file.originalname.match(/\.(PDF|pdf)$/)) {
    //       cb(null, ebookDestination);
    //     } else {
    //       if (file.fieldname === "avatar") {
    //         cb(null, avatarDestination);
    //       } else if (file.fieldname === "thumbnail") {
    //         cb(null, ebookThumbDestination);
    //       } else {
    //         cb(null, defaultDestination);
    //       }
    //     }
    //   },
    //   filename: function (req, file, cb) {
    //     cb(null, Date.now() + "-" + file.originalname.replace(" ", "-"));
    //   },
    // });

    const typeFileFilters = function (req, file, cb) {
      if (file.fieldname === "file") {
        if (!file.originalname.match(/\.(PDF|pdf)$/)) {
          req.errorValidation = {
            message: "Only PDF File Are Allowed",
          };
          return cb(new Error(req.errorValidation.message), false);
        }
      } else if (
        file.fieldname === "avatar" ||
        file.fieldname === "thumbnail"
      ) {
        if (!file.mimetype.match("image.*")) {
          req.errorValidation = {
            error: {
              message: "Only Image File Are Allowed",
            },
          };
          return cb(new Error(req.errorValidation.message), false);
        }
      }
      cb(null, true);
    };

    const upload = multer({
      storage,
      fileFilter: typeFileFilters,
      limits: {
        fileSize: parseInt(maxSize),
      },
    }).single(uploadField);

    return (req, res, next) => {
      upload(req, res, function (err) {
        if (!req.file && !err)
          return res.status(400).send({
            error: {
              message: "Please select file to upload",
            },
          });

        if (req.errorValidation)
          return res.status(400).send(req.errorValidation);

        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).send({
              error: {
                message: `Max file sized ${maxSize / 1000000}MB`,
              },
            });
          }
          return res.status(400).send(err);
        }

        return next();
      });
    };
  },
};
