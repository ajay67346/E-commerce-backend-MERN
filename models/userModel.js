const mongoose = require("mongoose");

const validator = require("validator");

// User schema definition
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: Number,
      default: 0, // 0 = user, 1 = admin (example)
    },
    cart: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // assumes you have a Product model
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            min: [1, "Quantity can not be less than 1"],
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("User", userSchema);
