module.exports = class AppError extends Error {
    constructor(message, statusCode) {
      console.log("AppError",message,statusCode);
      super(message);
      this.errmsg = message;
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  