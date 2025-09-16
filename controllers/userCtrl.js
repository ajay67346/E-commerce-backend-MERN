const Users = require("../models/userModel"); // Import User model
const jwt = require("jsonwebtoken"); // For creating and verifying JWT tokens
const bcrypt = require("bcrypt"); // For hashing passwords securely

// Controller object to handle user-related operations
const userCtrl = {
  // REGISTER FUNCTION
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "Email Already Registered" });

      if (password.length < 6)
        return res.status(400).json({
          msg: "Password must be at least 6 characters long",
        });

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = new Users({ name, email, password: hashPassword });
      await newUser.save();

      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });

      res.json({ accessToken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // LOGIN FUNCTION
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists with this email
      const user = await Users.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password." });

      // If all good, generate tokens
      const accessToken = createAccessToken({ id: user._id });
      const refreshToken = createRefreshToken({ id: user._id });

      // Set refresh token in cookie
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });

      res.json({ accessToken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // LOGOUT FUNCTION
  logout: async (req, res) => {
    try {
      // Remove the refresh token cookie
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Logged out successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // GET USER
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) return res.status(400).json({ msg: "User Not Found" });
      res.json(user);
    } catch (err) {}
  },
  // REFRESH TOKEN FUNCTION
  refreshtoken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) return res.status(400).json({ msg: "Please login now." });

      const user = jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET);
      if (!user) return res.status(400).json({ msg: "Please login now." });

      const accessToken = createAccessToken({ id: user.id });

      res.json({ user, accessToken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

// ACCESS TOKEN FUNCTION
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

// REFRESH TOKEN FUNCTION
const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = userCtrl;
