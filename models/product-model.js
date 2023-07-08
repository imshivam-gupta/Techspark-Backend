const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true, default: "Anonymous" },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, required: true },
    image: { type: String, required: true },
    comment: { type: String, required: true },
    user_email: { type: String, required: true },
  },
  {
    timestamps: true
  }
);

const offerSchema = mongoose.Schema(
  {
    offer: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const locationSchema = mongoose.Schema({
  city: { type: String, required: true, default: "Mumbai" },
  pincode: { type: Number, required: true, default: 400001 },
  state: { type: String, required: true, default: "Maharashtra" },
  country: { type: String, required: true, default: "India" },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A product must have a title"],
      unique: true,
      minlength: [5, "A product title must have more than 5 characters"],
    },
    image: {
      type: String,
      required: [true, "A product must have an image"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
    },
    other_images: [
      {
        type: String,
        trim: true,
      },
    ],
    is_prime: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < 100;
        },
        message: "Discount ({VALUE}) cannot be more than or equal to 100%",
      },
    },
    category: {
      type: String,
      required: [true, "A product must have a category"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    brand: {
      type: String,
      required: [true, "A product must have a brand"],
    },
    count_in_stock: {
      type: Number,
      required: [true, "A product must have a count in stock"],
    },
    seller_name: {
      type: String,
      required: [true, "A product must have a seller name"],
    },
    seller_email: {
      type: String,
      required: [true, "A product must have a seller email"],
    },
    recommedation_score: {
      type: Number,
      default: 0,
    },
    description: [
      {
        type: String,
      },
    ],
    offers: [offerSchema],
    reviews: [reviewSchema],
    location: { locationSchema },
    rating: {
      type: Number,
      default: 4.5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    numViews: {
      type: Number,
      default: 0,
    },
    tagline: {
      type: String,
      required: [true, "A product must have a tagline"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("discountedPrice").get(function () {
  return Math.round(this.price - (this.price * this.discount) / 100);
});

productSchema.pre("save", function (next) {
  next();
});

productSchema.post("save", function (doc, next) {
  next();
});

productSchema.post(/^find/, function (doc, next) {
  next();
});

module.exports = mongoose.model("Product", productSchema);
