const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Product ID is required."],
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "SubCategory is required."],
    },

    title: {
      type: String,
      trim: true,
      required: [true, "Product title is required."],
      minlength: [3, "Title must be at least 3 characters long."],
      maxlength: [100, "Title cannot exceed 100 characters."],
    },

    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },

    description: {
      type: String,
      required: [true, "Description is required."],
      minlength: [10, "Description must be at least 10 characters."],
    },

    content: {
      type: String,
      required: [true, "Content is required."],
      minlength: [10, "Content must be at least 10 characters."],
    },

    images: {
      type: Array,
      required: [true, "At least one image is required."],
    },

    checked: {
      type: Boolean,
      default: false,
    },

    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative."],
    },

    // ✅ New: Track who created it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdByRole: {
      type: String,
      enum: ["admin", "vendor"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Product", productSchema);
