const Cart = require("../models/cart-model");
const Order = require("../models/order-model");
const User = require("../models/user-model");
const AppError = require("../utility/app-error");
const factory = require("../utility/factory-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order, { path: "items.productId" });
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

exports.createOrder = catchAsync(async(req,res,next) => {

    const cart = await Cart.findOne({user:req.user._id});
    req.body.items = cart.items;

    const order = await Order.create({...req.body,user:req.user._id});
    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    })
});

exports.getCheckoutSession = catchAsync(async(req,res,next) => {
    const order = await Order.findById(req.params.id).populate('items.productId');

    const items = order.items.map(item => ({
        price_data: {
            currency: 'INR',
            product_data: {
                name: item.productId.title,
                images: [item.productId.image],
                metadata: { product_id: item.productId._id }
            },
            unit_amount: Number(item.productId.price) * 100,
        },
        quantity: Number(item.qty),
        tax_rates: ['txr_1NFXChSHS6cBSQ8V3ta64dXl']
    }));


    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: items || [],
        success_url: `https://techspark.vercel.app/`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.id,
        custom_text: {
            submit: {
              message: 'We\'ll email you instructions tracking details.',
            },
        },
        allow_promotion_codes: true,
    },{
        apiKey: process.env.STRIPE_SECRET_KEY
    }
    );

    res.status(200).json({
        status: 'success',
        session
    })
});

exports.createIntent = catchAsync(async(req,res,next) => {
    const order = await Order.findById(req.params.id).populate('items.productId');

    let amount = 0;
    order.items.forEach(item => {
        amount += item.qty * item.productId.price;
    });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'IN',
        automatic_payment_methods: {
          enabled: true,
        },
    },{
        apiKey: process.env.STRIPE_SECRET_KEY
    });

    res.json({ paymentIntent: paymentIntent.client_secret });
});

completeOrder = async(session) => {
    // console.log(session);
    const order = await Order.findById(session.client_reference_id);
    const user = (await User.findOne({email: session.customer_email}))._id;
    
    order.paymentMethod = session.payment_method_types[0];
    order.isPaid = true;
    order.paidAt = Date.now();
    order.user = user;
    order.totalPrice = session.amount_total / 100;
    await order.save();
}

exports.createWebhookCheckout = catchAsync(async(req,res,next) => {
    let event;
    try{
        const signature = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch(error) {
        return next(new AppError('Webhook error',400));
    }

    if(event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // console.log(session);
        completeOrder(event.data.object);
    }

    res.status(200).json({
        received: true
    });
});


exports.getOrderStats = async(req,res) => {
    try{
        const stats = await Order.aggregate([
            {
                $match: { isPaid: { $eq: true } }
            },
            {
                $group: {
                    _id: null,
                    num_orders: {$sum: 1},
                    avgPrice: {$avg: "$totalPrice"},
                    totalPrice: {$sum:"$totalPrice"}
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
        ])
        res.status(200).json({
            status: 'success',
            results: stats.length,
            data:{
                stats
            }
        })
    } catch(error) {
        res.status(400).json({
            status: 'fail',
            message: "Error in fetching the order stats please try again"
        })
    }
};

