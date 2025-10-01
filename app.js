const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRoutes = require("./routes/useRouter");
const categoryRoutes = require("./routes/categoryRouter");
const uploadRoutes = require("./routes/upload");
const productRoutes = require("./routes/productRouter");
const subCategoryRoutes = require("./routes/subCategoryRouter");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// File Upload Middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the eCommerce Backend API" });
});
app.use("/user", userRoutes);
app.use("/resources", categoryRoutes);
app.use("/resources", uploadRoutes);
app.use("/resources", productRoutes);
app.use("/resources", subCategoryRoutes);

module.exports = app;
