const { Users, Literatures, Collections } = require("../../models");

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const joi = require("@hapi/joi");

// Macros dotenv
const jwtKey = process.env.JWT_KEY;

exports.AuthCheck = async (req, res) => {
  try {
    const data = await Users.findOne({
      where: {
        id: req.user.id,
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
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    res.send({
      message: "user_valid",
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

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const schema = joi.object({
      email: joi.string().email().min(8).required(),
      password: joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        error: {
          message: error.details[0].message,
        },
      });
    }

    const data = await Users.findOne({
      where: {
        email,
      },
    });

    if (data) {
      const validPassword = await bcrypt.compare(password, data.password);
      if (!validPassword) {
        return res.status(400).send({
          error: {
            message: "Wrong email or password",
          },
        });
      }
      const token = jwt.sign(
        {
          id: data.id,
        },
        jwtKey
      );

      res.send({
        message: "Login Success",
        data: {
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          token,
        },
      });
    } else {
      return res.status(400).send({
        error: {
          message: "Wrong email or password",
        },
      });
    }
  } catch (err) {
    res.status(500).send({
      error: {
        message: "Server ERROR",
      },
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      gender,
      phone,
      address,
      role,
    } = req.body;

    const schema = joi.object({
      email: joi.string().email().min(10).required(),
      password: joi.string().min(8).required(),
      fullName: joi.string().min(3).required(),
      gender: joi.string().valid("Male", "Female").required(),
      phone: joi.string().min(10).required(),
      address: joi.string().min(8).required(),
      role: joi.string().valid("Guest", "Admin").required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        error: {
          message: error.details[0].message,
        },
      });
    }

    const checkEmail = await Users.findOne({
      where: {
        email,
      },
    });

    if (checkEmail) {
      return res.status(400).send({
        error: {
          message: "Email already been existed",
        },
      });
    }

    const hashedPassword = await bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(10)
    );

    const photoUrl =
      "https://res.cloudinary.com/literature/image/upload/v1604299425/literature/avatars/default_i8xtzv.png";
    const data = await Users.create({
      email,
      password: hashedPassword,
      fullName,
      gender,
      phone,
      address,
      photoUrl,
      role,
    });

    if (data) {
      const token = jwt.sign(
        {
          id: data.id,
        },
        jwtKey
      );

      return res.send({
        message: "SignUp Successfully",
        data: {
          email,
          fullName,
          role,
          token,
        },
      });
    }
  } catch (err) {
    res.status(500).send({
      error: {
        message: "Server ERROR",
      },
    });
  }
};
