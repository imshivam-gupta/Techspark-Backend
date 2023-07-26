const expressRouter = require('express').Router();
const authController = require('../controllers/auth-controller');

expressRouter.post(`/google`,authController.googleAuthenticator);

module.exports = expressRouter;

