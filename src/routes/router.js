const express = require("express");
require('dotenv').config()

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
router.patch("/user/avatar/:id", [authentication.authorization, authentication.files_upload([
  { name: "avatar", maxCount: 1 },
])], updateUserAvatar);
router.delete("/user/:id", [authentication.authorization], deleteUser);

// >>>>>>>>>>> Books <<<<<<<<<<<<<<<
const {
  add: addBook,
  get: getBookData,
  delete: deleteBook,
  patch: updateBook,
} = require("../controller/books");

router.get("/books", [authentication.authorization], getBookData);
router.get("/books/category/:category", [authentication.authorization], getBookData);

router.post("/book", [authentication.authorization, authentication.files_upload([
  { name: "file", maxCount: 1 },
])], addBook);
router.get("/book/:id", [authentication.authorization], getBookData);
router.patch("/book/:id", [authentication.authorization], updateBook);
router.delete("/book/:id", [authentication.authorization], deleteBook);

// >>>>>>>>>>> Bookmark <<<<<<<<<<<<<<<<
const {
  add: addBookmark,
  delete: deleteBookmark,
} = require("../controller/bookmarks");
router.post("/bookmark", [authentication.authorization], addBookmark);
router.delete("/bookmark/:UserId/:BookId", [authentication.authorization], deleteBookmark);

module.exports = router;
