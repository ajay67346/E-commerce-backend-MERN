// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");

// Load environment variables
dotenv.config();

// Import custom route files
const useRouter = require("./routes/useRouter");
const categoryRouter = require("./routes/categoryRouter");
const uploadRouter = require("./routes/upload"); // ✔ Upload route
const productRouter = require("./routes/productRouter");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// express-fileupload config
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, 
  })
);

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Root test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the eCommerce Backend API" });
});

// Routes
app.use("/user", useRouter);
app.use("/api", categoryRouter);
app.use("/api", uploadRouter); // ✔ File upload route connected
app.use("/api", productRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


