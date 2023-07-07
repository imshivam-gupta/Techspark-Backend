const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
          default: 0,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.virtual("totalPrice").get(function () {
  let totalPrice = 0;
  this.items.forEach((item) => {
    totalPrice += item.qty * item.productId.price;
  });
  return totalPrice;
});

cartSchema.virtual("totalQty").get(function () {
  let totalQty = 0;
  this.items.forEach((item) => {
    totalQty += item.qty;
  });
  return totalQty;
});

cartSchema.virtual("totalItems").get(function () {
  let totalItems = 0;
  this.items.forEach((item) => {
    totalItems += 1;
  });
  return totalItems;
});

cartSchema.virtual("totalDiscountedPrice").get(function () {
  let totalDiscountedPrice = 0;
  this.items.forEach((item) => {
    totalDiscountedPrice += item.qty * item.productId.discountedPrice;
  });
  return totalDiscountedPrice;
});

module.exports = mongoose.model("Cart", cartSchema);
