const authController = require('../controllers/auth-controller');
const userController = require('../controllers/user-controller');
const expressRouter = require('express').Router();


expressRouter.route(`/signup`).post(authController.signup);
// expressRouter.route(`/login/google/callback`).get(authController.glogin);
expressRouter.route(`/login`).post(authController.login);

expressRouter.route(`/forgotPassword`).post(authController.forgotPassword);
expressRouter.route(`/resetPassword/:token`).patch(authController.resetPassword);
expressRouter.route(`/updatePassword`).patch(authController.protect, authController.updatePassword);


expressRouter.route(`/me`).get(authController.protect, userController.getMe, userController.getUser);
expressRouter.route(`/myorders`).get(authController.protect,  userController.getMyOrders);
expressRouter.route(`/updateMe`).patch(authController.protect, userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
expressRouter.route(`/deleteMe`).delete(authController.protect, userController.deleteMe);
expressRouter.route(`/`).get(authController.protect,authController.restrictTo('admin'),userController.getAllUsers);
expressRouter.route(`/:id`).patch(userController.updateUser).delete(userController.deleteUser).get(userController.getUser);


module.exports = expressRouter;

