const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createAccessToken, createRefreshToken } = require("../utils/token");

const userCtrl = {
  // REGISTER FUNCTION
  register: async (req, res) => {
    try {
      if (
        !req.body ||
        Object.keys(req.body).every(
          (key) => req.body[key] === undefined || req.body[key] === ""
        )
      ) {
        return res.status(400).json({
          success: false,
          status: 400,
          code: "VALIDATION_ERROR",
          message:
            "Request body is missing. Please provide name, email, and password.",
          hint: "Make sure to send JSON data in the body with 'Content-Type: application/json'.",
          requiredFields: ["name", "email", "password"],
        });
      }

      const { name, email, password } = req.body;

      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");

      if (missingFields.length > 0) {
        const formatFieldList = (fields) => {
          if (fields.length === 1) return fields[0];
          return (
            fields.slice(0, -1).join(", ") + " and " + fields[fields.length - 1]
          );
        };

        return res.status(400).json({
          status: 400,
          success: false,
          code: "FIELD_MISSING",
          message: `Please provide ${formatFieldList(missingFields)}.`,
          requiredFields: missingFields,
        });
      }

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          success: false,
          code: "EMAIL_EXISTS",
          message: "Email already registered.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 400,
          success: false,
          code: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters long.",
          hint: "Try using a stronger password with symbols or numbers.",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = new Users({ name, email, password: hashPassword });
      await newUser.save();

      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        status: 201,
        success: true,
        message: "User registered successfully.",
        data: {
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        success: false,
        code: "SERVER_ERROR",
        message: "Something went wrong on the server. Please try again later.",
        details: err.message,
      });
    }
  },

  // LOGIN FUNCTION
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          success: false,
          code: "MISSING_FIELDS",
          message: `Please enter ${missingFields.join(" and ")}.`,
          requiredFields: missingFields,
        });
      }

      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: 404,
          success: false,
          code: "USER_NOT_FOUND",
          message: "User with this email does not exist.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 401,
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Incorrect password.",
        });
      }

      const accessToken = createAccessToken({ id: user._id });
      const refreshToken = createRefreshToken({ id: user._id });

      // Set cookie
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        status: 200,
        success: true,
        message: "You have logged in successfully.",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          tokens: {
            accessToken,
            expiresIn: 86400,
          },
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        status: 500,
        code: "SERVER_ERROR",
        message: "An unexpected error occurred during login.",
        details: err.message,
      });
    }
  },

  // LOGOUT FUNCTION
  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshtoken;

      //Step 1: Check if refresh token is present
      if (!refreshToken) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Refresh token not found in cookies.",
        });
      }

      //Step 3: Clear the cookie securely
      res.clearCookie("refreshtoken", {
        path: "/user/refresh_token", // same path as when you set it
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });

      //Step 4: Send success response
      return res.status(200).json({
        status: 200,
        success: true,
        message: "You have been logged out successfully.",
      });
    } catch (err) {
      //Error handling
      return res.status(500).json({
        success: false,
        status: 500,
        code: "LOGOUT_FAILED",
        message: "An error occurred while logging out.",
        details: err.message,
      });
    }
  },

  // GET USER
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({
          status: 404,
          success: false,
          code: "USER_NOT_FOUND",
          message: "User not found.",
          userId: req.user.id,
        });
      }

      return res.status(200).json({
        status: 200,
        success: true,
        message: "User fetched successfully.",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          
        },
      });
    } catch (err) {
      console.error("Get user error:", err);
      return res.status(500).json({
        status: 500,
        success: false,
        code: "SERVER_ERROR",
        message: "Server error while fetching user.",
        details: err.message,
      });
    }
  },

  // GET USER BY ID
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await Users.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({
          status: 404,
          success: false,
          code: "USER_NOT_FOUND",
          message: "User not found.",
          userId,
        });
      }

      return res.status(200).json({
        status: 200,
        success: true,
        message: "User fetched successfully.",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          
        },
      });
    } catch (err) {
      console.error("Admin get user error:", err);
      return res.status(500).json({
        status: 500,
        success: false,
        code: "SERVER_ERROR",
        message: "Server error while fetching user.",
        details: err.message,
      });
    }
  },

  // REFRESH TOKEN FUNCTION
  refreshtoken: async (req, res) => {
    try {
      const rf_token = req.cookies?.refreshtoken;

      if (!rf_token) {
        return res.status(401).json({
          status: 401,
          success: false,
          code: "MISSING_REFRESH_TOKEN",
          message: "Refresh token missing. Please log in again.",
          hint: "Make sure cookies are enabled and valid refresh token is present.",
        });
      }

      let payload;
      try {
        payload = jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET);
      } catch (verifyErr) {
        console.error("Refresh token verify error:", verifyErr);
        return res.status(403).json({
          status: 403,
          success: false,
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid or expired refresh token. Please log in again.",
          details: verifyErr.message,
        });
      }

      const accessToken = createAccessToken({ id: payload.id });

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Access token refreshed successfully.",
        data: {
          accessToken,
          expiresIn: 86400,
          tokenType: "Bearer",
          user: {
            id: payload.id,
          },
        },
      });
    } catch (err) {
      console.error("Refresh token error:", err);
      return res.status(500).json({
        status: 500,
        success: false,
        code: "SERVER_ERROR",
        message: "Server error while refreshing token.",
        details: err.message,
      });
    }
  },
};

module.exports = userCtrl;
