const express = require('express'); 

const productRoutes = require('./routes/product-routes.js');
const userRoutes = require('./routes/user-routes.js');
const orderRoutes = require('./routes/order-routes.js');
const cartRoutes = require('./routes/cart-routes.js');

const AppError = require('./utility/app-error.js');
const globalErrorHandler = require('./controllers/error-controller.js');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp'); 
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createWebhookCheckout } = require('./controllers/order-controller.js');
const morgan = require('morgan')
const app = express();

app.enable('trust proxy');

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(morgan('dev'));

const limiter = rateLimit({
    max: 1000,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});



app.use(helmet());
app.use('/api', limiter);

app.post('/webhook-checkout', express.raw({ type: 'application/json' }), createWebhookCheckout);


app.use(express.json(  { limit: '30kb' })); 
app.use(cookieParser())
app.use(mongoSanitize());  // Data sanitization against NoSQL query injection like $gt, $gte
app.use(xss()); // Data sanitization against XSS like <script> tags, etc.
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price']
})); // Prevent HTTP Parameter Pollution like sort=price&sort=rating


app.use(`/api/v1/products`, productRoutes); 
app.use(`/api/v1/users`, userRoutes); 
app.use(`/api/v1/orders`, orderRoutes);
app.use(`/api/v1/cart`, cartRoutes);

app.use(express.static(path.join(__dirname,'public')));


app.all('*', (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`,404);
    err.status = 'fail';
    next(err);
});

app.use( globalErrorHandler);
  
module.exports = app;



