const AppError = require("../utility/app-error");

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.errmsg,
        stack: err.stack,
        error: err
    });
}

const sendErrorProd = (err, res) => {

    console.log(err)
    if(err.isOperational===true){
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.errmsg
        });
    } 

    else{
        res.status(500).json({
            status: 'error',
            message: err.errmsg
        });
    }
};


const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;   
    return new AppError(message, 400);
};

const handleDuplicationField = err => {
    const value = err.keyValue;
    const key = Object.keys(value)[0];
    let message= '';
    if(key==='email') message = `Email already exists!`;
    else message = `Duplicate field value: ${key}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = err => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = err => new AppError('Your token has expired! Please log in again!', 401);


module.exports = (err, req, res, next) => {

    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';
    err.errmsg = err.errmsg || 'Something went wrong!';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
        return;
    } 


    let error = {...err};
    if(err.name === 'CastError') error = handleCastErrorDB(error);
    if(err.code===11000) error = handleDuplicationField(error);
    if(err.name==='ValidationError') error = handleValidationErrorDB(error);
    if(err.name==='JsonWebTokenError') error = handleJWTError(error);
    if(err.name==='TokenExpiredError') error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
}


