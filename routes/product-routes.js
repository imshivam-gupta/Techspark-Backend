const productControllers = require('../controllers/product-controller');
const authController = require('../controllers/auth-controller');
const expressRouter = require('express').Router();


expressRouter.route(`/`).get(authController.protect,productControllers.getAllProducts).post(productControllers.createProduct);

expressRouter.route(`/:id`)
.patch(authController.protect,authController.restrictTo('admin'),productControllers.uploadProductImages,productControllers.resizeProductPhoto,productControllers.updateProduct)
.delete(authController.protect,authController.restrictTo('admin'),productControllers.deleteProduct)
.get(productControllers.getProduct);

expressRouter.route(`/:id/review`)
.get(productControllers.getProductReviews)
.patch(authController.protect,productControllers.createProductReview);
 
module.exports = expressRouter;

