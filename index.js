require("dotenv").config();
const express = require("express");
const server = express();
const cors = require("cors");
require("./DB/Connection");

const router = require("./Routes/Routers");
// -----------------------------------------

server.use(cors());
server.use(express.json());
server.use("/user", router);
server.use("/user/uploads", express.static("./uploads"));
server.use("/files", express.static("./public/files"));
// -----------------------------------------

server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

// V4EM7JxfN8HdIlVD
