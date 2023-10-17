const multer = require("multer");

// ----------------------------------------------------

// Storage config

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination where to upload all images
    cb(null, "./uploads");
  },

  //   ------------------------------------

  filename: function (req, file, cb) {
    // this is the filename of the file
    const filename = `image-${Date.now()}.${file.originalname}`;
    cb(null, filename);
  },
});

//filter

const FileFilter = (req, file, cb) => {
  if (
    file.mimetype !== `image/png` ||
    file.mimetype !== "image/jpeg" ||
    file.mimetype !== "image/jpg"
  ) {
    cb(null, false);
    return cb(
      new Error(" ! Wrong file type:  Only png , jpeg and jpg are supported")
    );
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage: storage, FileFilter: FileFilter });

module.exports = upload;
