const User = require("../models/user-model");
const Order = require("../models/order-model");
const AppError = require("../utility/app-error");
const catchAsync = require("../utility/catch-async");
const factory = require("../utility/factory-handler");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { Readable } = require("stream");


const multerStrorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};


const upload = multer({ 
    storage: multerStrorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');


async function uploadStream(req) {
    const buffer = req.file.buffer;
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    return new Promise((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream({
        resource_type: "auto",
        public_id: req.file.filename,
    },
      (err, result) => {
        if (err) return rej(err);
        res(result);
      }
    );
    Readable.from(buffer).pipe(theTransformStream);
  });
}

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })


    const temp = await uploadStream(req);
    req.fileurl = temp.secure_url;
    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).populate('items.productId');
    res.status(200).json({ status: 'success', data: { orders }});
});

exports.updateMe = catchAsync(async (req, res, next) => {


    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.image = req.fileurl;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({ status: 'success', data: { user: updatedUser}});
});


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(200).json({ status: 'success', data: null});
});


