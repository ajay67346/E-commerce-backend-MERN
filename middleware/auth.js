const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization denied. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Verify user exists in DB
    const user = await Users.findById(decoded.id).select("id role name");
    if (!user) {
      return res.status(401).json({ message: "User not found. Unauthorized." });
    }

    // Attach only necessary info to req.user
    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({
      message: "Invalid or expired token.",
      details: err.message,
    });
  }
};

module.exports = auth;
