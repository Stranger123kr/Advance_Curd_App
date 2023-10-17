const UserData = require("../Models/UserSchema");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
// ------------------------------------------

//  create user

const CreateUser = async (req, res) => {
  try {
    const file = req.file.filename;
    const { fname, lname, email, mobile, gender, location, status } = req.body;
    const EmailChecker = await UserData.findOne({ email: email });
    if (
      !fname ||
      !lname ||
      !email ||
      !mobile ||
      !gender ||
      !location ||
      !status ||
      !file
    ) {
      res.status(401).json("Please Fill All The Fields");
    } else if (EmailChecker) {
      res
        .status(409)
        .json({ message: "You Are Already Exist Add New Email Id" });
    } else {
      const CreateDate = moment().format("MMMM Do YYYY, h:mm:ss a");

      const NewUser = new UserData({
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        CreateDate,
      });
      const UserCreate = await NewUser.save();
      res.status(200).json(UserCreate);
    }
  } catch (error) {
    res.status(404).json(error);
  }
};

// ------------------------------------------

//  get user data and run some filter operations and sorting methods on user data

const ReadUser = async (req, res) => {
  try {
    const { fname, gender, status, sort, page, limit } = req.query;

    const queryApi = {};

    if (fname) {
      queryApi.fname = { $regex: fname, $options: "is" };
    }

    if (gender) {
      queryApi.gender = { $regex: gender, $options: "is" };
    }

    if (status) {
      queryApi.status =
        status === "Active" ? "Active" : { $regex: status, $options: "is" };
    }

    let UserPage = Number(page) || 1;
    let UserLimit = Number(limit) || 4;

    let skip = (UserPage - 1) * UserLimit;

    // ========================================================

    const count = await UserData.countDocuments(queryApi);

    // ----------------------------------------------------------

    const NewUser = await UserData.find(queryApi)
      .sort({
        CreateDate: sort === "new" ? -1 : 1,
      })
      .skip(skip)
      .limit(UserLimit);

    const PageCount = Math.ceil(count / UserLimit);

    res.status(200).json({
      Pagination: {
        count,
        PageCount,
      },
      NewUser,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};

// ------------------------------------------

//  get user particular id  matching in database

const FetchUser = async (req, res) => {
  try {
    const { id } = req.params;
    const NewUser = await UserData.findById({ _id: id });
    res.status(200).json(NewUser);
  } catch (error) {
    res.status(404).json(error);
  }
};

// ------------------------------------------

//  update user

const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fname, lname, email, mobile, gender, location, status, profile } =
      req.body;
    const file = req.file ? req.file.filename : profile;

    const UpdateDate = moment().format("MMMM Do YYYY, h:mm:ss a");
    const NewUser = await UserData.findByIdAndUpdate(
      id,
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        UpdateDate,
      },
      {
        new: true,
      }
    );
    res.status(200).json(NewUser);
  } catch (error) {
    res.status(404).json(error);
  }
};

// ------------------------------------------

//  delete user

const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const NewUser = await UserData.findByIdAndDelete({ _id: id });
    res.status(200).json(NewUser);
  } catch (error) {
    res.status(404).json(error);
  }
};

// ------------------------------------------

//  update user status directly in frontend without going update page

const UpdateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body;

    const NewUser = await UserData.findByIdAndUpdate(id, status, {
      new: true,
    });
    res.status(200).json(NewUser);
  } catch (error) {
    res.status(404).json(error);
  }
};

// ------------------------------------------

//  export user data and convert text format and then put into excel file

const UserExport = async (req, res) => {
  try {
    const NewUser = await UserData.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }

      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export");
      }
    }

    const date = new Date().getMilliseconds().toExponential() * 5621209;

    const WritableStream = fs.createWriteStream(
      `./public/files/export/${date}-users.csv`
    );
    csvStream.pipe(WritableStream);
    WritableStream.on("finish", function () {
      res.status(200).json({
        downloadUrl: `${process.env.BASE_URL}/files/export/${date}-users.csv`,
      });
    });

    if (NewUser.length > 0) {
      NewUser.map((user) => {
        csvStream.write({
          FirstName: user.fname ? user.fname : "-",
          LastName: user.lname ? user.lname : "-",
          Email: user.email ? user.email : "-",
          Mobile: user.mobile ? user.mobile : "-",
          Gender: user.gender ? user.gender : "-",
          Status: user.status ? user.status : "-",
          Profile: user.profile ? user.profile : "-",
          Location: user.location ? user.location : "-",

          CreateDate: user.CreateDate ? user.CreateDate : "-",

          UpdateDate: user.UpdateDate ? user.UpdateDate : "-",
        });
      });
    }

    csvStream.end();
    WritableStream.end();
  } catch (error) {
    res.status(404).json(error);
  }
};

// ----------------------------------------------------------

module.exports = {
  ReadUser,
  CreateUser,
  DeleteUser,
  UpdateUser,
  FetchUser,
  UpdateUserStatus,
  UserExport,
};
