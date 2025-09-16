const fs = require("fs");
const path = require("path");

const uploadCtrl = {
  uploadImage: async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ msg: "No file uploaded." });
      }

      const file = req.files.image;

      // Optional: Check file type
      if (!file.mimetype.startsWith("image")) {
        return res.status(400).json({ msg: "Only image files are allowed." });
      }

      // Optional: File size limit (e.g. 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return res
          .status(400)
          .json({ msg: "File size should be less than 2MB." });
      }

      // Create unique file name
      const fileName = Date.now() + "_" + file.name;
      const uploadPath = path.join(__dirname, "../uploads", fileName);

      // Move file to /uploads
      file.mv(uploadPath, (err) => {
        if (err) return res.status(500).json({ msg: err.message });

        const fileUrl = `/uploads/${fileName}`;
        return res.json({ msg: "File uploaded successfully", url: fileUrl });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteImage: async (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename)
        return res.status(400).json({ msg: "No filename provided." });

      const filePath = path.join(__dirname, "../uploads", filename);

      fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ msg: "Failed to delete file." });

        res.json({ msg: "File deleted successfully." });
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = uploadCtrl;

