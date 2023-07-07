const authController = require('../controllers/auth-controller');
const cartController = require('../controllers/cart-controller');
const expressRouter = require('express').Router();


expressRouter.route('/')
.get(authController.protect, cartController.getUserCart)
.delete(authController.protect, cartController.deleteCart);


expressRouter.route('/item/')
.post(authController.protect, cartController.AddToCart);

expressRouter.route('/item/:id')
.delete(authController.protect, cartController.deleteCartItem);



module.exports = expressRouter;

