const authController = require('../controllers/auth-controller');
const orderController = require('../controllers/order-controller');
const expressRouter = require('express').Router();


expressRouter.route('/')
.get(authController.protect, authController.restrictTo('admin') ,orderController.getAllOrders)
.delete(authController.protect, orderController.deleteOrder)
.post(authController.protect, orderController.createOrder);

expressRouter.route('/:id')
.get(authController.protect, orderController.getOrder)


expressRouter.post('/checkout-session/:id', authController.protect, orderController.getCheckoutSession)
expressRouter.post('/createIntent',  orderController.createIntent)
module.exports = expressRouter;

