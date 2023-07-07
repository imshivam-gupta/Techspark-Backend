const AppError = require("../utility/app-error");

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
}

const sendErrorProd = (err, res) => {

    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } 
    else{
        console.error('ERROR', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};


const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;   
    return new AppError(message, 400);
};

const handleDuplicationField = err => {
    const value = err.keyValue.title;
    const message = `Duplicate field value: ${value}. Please use another value!`;
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

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';
    
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    } else{
        let error = {...err};
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code===11000) error = handleDuplicationField(error);
        if(err.name==='ValidationError') error = handleValidationErrorDB(error);
        if(err.name==='JsonWebTokenError') error = handleJWTError(error);
        if(err.name==='TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorProd(error, res);
    }
}


