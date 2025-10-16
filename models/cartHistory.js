const mongoose = require("mongoose");

const cartHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    title: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },

    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity can not be less than 1"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price can't be negative"],
    },

    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order-History", cartHistorySchema);
