const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const upload = require("../Multer/Storage");
const {
  ReadUser,
  CreateUser,
  DeleteUser,
  UpdateUser,
  FetchUser,
  UpdateUserStatus,
  UserExport,
} = UserController;

// ------------------------------------------

router
  .get("/", ReadUser)
  .get("/profile/:id", FetchUser)
  .get("/export", UserExport)
  .post("/register", upload.single("profile"), CreateUser)
  .patch("/update/:id", upload.single("profile"), UpdateUser)
  .patch("/status/:id", UpdateUserStatus)
  .delete("/delete/:id", DeleteUser);

module.exports = router;
