const express = require("express");

const router = express.Router();

// >>>>>>>> Authentication <<<<<<<<<
const {
  signin: userSignIn,
  signup: userSignUp,
  AuthCheck: userAuthCheck,
} = require("../controller/auth");

const { authentication } = require("../middleware/auth.js");

router.post("/signin", userSignIn);
router.post("/signup", userSignUp);
router.get("/auth", [authentication.authorization], userAuthCheck);

// >>>>>>>> Users And Auth <<<<<<<<<
const {
  get: getUserData,
  delete: deleteUser,
  patch: updateUser,
  patch_avatar: updateUserAvatar,
} = require("../controller/users");

router.get("/users", [authentication.authorization], getUserData);

router.get("/user/:id", [authentication.authorization], getUserData);
router.patch("/user/:id", [authentication.authorization], updateUser);
router.patch(
  "/user/avatar/:id",
  [authentication.authorization, authentication.file_upload("avatar")],
  updateUserAvatar
);
router.delete("/user/:id", [authentication.authorization], deleteUser);

// >>>>>>>>>>> Literatures  <<<<<<<<<<<<<<<
const {
  add: addLiterature,
  get: getLiteratureData,
  delete: deleteLiterature,
  patch: updateLiterature,
} = require("../controller/literatures");

router.get("/literatures", [authentication.authorization], getLiteratureData);

router.post(
  "/literature",
  [authentication.authorization, authentication.file_upload("file")],
  addLiterature
);

router.get(
  "/literature/:id",
  [authentication.authorization],
  getLiteratureData
);

router.patch(
  "/literature/:id",
  [authentication.authorization],
  updateLiterature
);

router.delete(
  "/literature/:id",
  [authentication.authorization],
  deleteLiterature
);

// >>>>>>>>>>> Literature Collection <<<<<<<<<<<<<<<<
const {
  add: addCollection,
  delete: deleteCollection,
} = require("../controller/collections");
router.post("/collection", [authentication.authorization], addCollection);
router.delete("/collection", [authentication.authorization], deleteCollection);

module.exports = router;
