const Cart = require("../models/cart-model");
const Product = require("../models/product-model");
const AppError = require("../utility/app-error");
const catchAsync = require("../utility/catch-async");


exports.getUserCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.productId");

    if (!cart) {
        await Cart.create({
            user: req.user._id,
            items: [],
        });

        return res.status(200).json({
            status: "success",
            data: {
                cart: [],
            },
        });
    }   

    res.status(200).json({
        status: "success",
        data: {
            cart,
        },
    });
});


exports.AddToCart = catchAsync(async (req, res, next) => {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        const newCart = await Cart.create({
            user: req.user._id,
            items: [{ productId, qty }],
        });
        return res.status(200).json({
            status: "success",
            data: {
                cart: newCart,
            },
        });
    }
    
    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }

    const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId.toString());

    
    if (itemIndex > -1) {
        const productItem = cart.items[itemIndex];
        productItem.qty += qty;
        cart.items[itemIndex] = productItem;
    } else {
        cart.items.push({ productId, qty });
    }

    await cart.save();
    const data = await cart.populate("items.productId");
    res.status(200).json({ success: true, data });
});


exports.deleteCartItem = catchAsync(async (req, res, next) => {
    const productId  = req.params.id;
   
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new AppError("No cart found with that ID", 404));
    }

    const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
    if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    const data = await cart.populate("items.productId");
    res.status(200).json({ success: true, data });
});


exports.deleteCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new AppError("No cart found with that ID", 404));
    }

    cart.items = [];

    await cart.save();
    res.status(200).json({ success: true, data: {} });
});

