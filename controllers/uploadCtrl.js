const fs = require("fs");
const path = require("path");

const uploadCtrl = {
  uploadImage: async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const file = req.files.image;

      // Check file type
      if (!file.mimetype.startsWith("image")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed.",
          statusCode: 400,
          fileType: file.mimetype,
          timestamp: new Date().toISOString(),
        });
      }

      // File size limit: 2MB
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "File size should be less than 2MB.",
          statusCode: 400,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          timestamp: new Date().toISOString(),
        });
      }

      // Generate unique filename
      const fileName = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(__dirname, "../uploads", fileName);

      // Move file
      file.mv(uploadPath, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Server error while uploading file.",
            error: err.message,
            statusCode: 500,
            timestamp: new Date().toISOString(),
          });
        }

        const fileUrl = `/uploads/${fileName}`;
        const public_id = fileName.split(".")[0]; // filename without extension

        return res.status(201).json({
          success: true,
          message: "Image uploaded successfully.",
          statusCode: 201,
          url: fileUrl,
          file: {
            public_id, // Add this line
            name: fileName,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.mimetype,
          },
          timestamp: new Date().toISOString(),
        });
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Unexpected server error.",
        error: err.message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }
  },

  deleteImage: async (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: "No filename provided.",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const filePath = path.join(__dirname, "../uploads", filename);

      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to delete file.",
            error: err.message,
            statusCode: 500,
            timestamp: new Date().toISOString(),
          });
        }

        res.json({
          success: true,
          message: "File deleted successfully.",
          filename,
          statusCode: 200,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Unexpected server error.",
        error: err.message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

module.exports = uploadCtrl;
