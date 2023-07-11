const express = require('express'); 

const productRoutes = require('./routes/product-routes.js');
const userRoutes = require('./routes/user-routes.js');
const orderRoutes = require('./routes/order-routes.js');
const cartRoutes = require('./routes/cart-routes.js');
const authRoutes = require('./routes/social-auth-routes.js');
const AppError = require('./utility/app-error.js');
const globalErrorHandler = require('./controllers/error-controller.js');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp'); 
const path = require('path');
const cors = require('cors');
const passport = require("passport");

const passportSetup = require('./config/passport');

const cookieParser = require('cookie-parser');

const cookieSession = require('cookie-session');
const session = require('express-session');

const { createWebhookCheckout } = require('./controllers/order-controller.js');
const morgan = require('morgan');
const app = express();



app.enable('trust proxy');

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     if ('OPTIONS' == req.method) {
//          res.send(200);
//      } else {
//          next();
//      }
//     });
    
app.use(cors({credentials: true, origin: 'https://techspark.vercel.app/'}));


app.use(cookieParser())

app.use(cookieSession({
    maxAge: 12* 24 * 60 * 60 * 1000, // 24 hours
    keys : ['hello','heera']
}));


app.use(session({
    secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});



app.use(morgan('dev'));

const limiter = rateLimit({
    max: 1000,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});



app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use('/api', limiter);

app.post('/webhook-checkout', express.raw({ type: 'application/json' }), createWebhookCheckout);


app.use(express.json(  { limit: '30kb' })); 

app.use(mongoSanitize());  // Data sanitization against NoSQL query injection like $gt, $gte
app.use(xss()); // Data sanitization against XSS like <script> tags, etc.
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price']
})); // Prevent HTTP Parameter Pollution like sort=price&sort=rating


app.use(`/api/v1/auth`, authRoutes);
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



