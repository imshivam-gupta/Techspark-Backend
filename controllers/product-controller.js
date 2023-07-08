const Product = require("../models/product-model");
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

exports.uploadProductImages = upload.fields(
    [
        { name: 'image', maxCount: 1 },
        { name: 'other_images', maxCount: 5}
    ]
);

upload.single('image');
upload.array('other_images', 5);


async function uploadStream(file) {
    return new Promise((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream({
        resource_type: "auto",
        public_id: file.filename,
    },
      (err, result) => {
        if (err) return rej(err);
        res(result);
      }
    );
    Readable.from(file.buffer).pipe(theTransformStream);
  });
}

exports.resizeProductPhoto = catchAsync(async (req, res, next) => {

    if(!req.files.image || !req.files.other_images) return next();

    await sharp(req.files.image[0].buffer) 
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })

    req.files.image.filename = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
    let temp = await uploadStream(req.files.image[0]);

    req.body.image = temp.secure_url;

    console.log(req.body.image);

    req.body.other_images = [];

    await Promise.all(
        req.files.other_images.map(async (file, i) => {
            file.filename = `product-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
            await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })

            let temp = await uploadStream(file);
            req.body.other_images.push(temp.secure_url);
        })
    );

    next();
});


exports.getAllProducts = factory.getAll(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.getProduct = factory.getOne(Product);
exports.createProduct = factory.createOne(Product);


exports.createProductReview = catchAsync(async(req,res,next) => {
    const { title,rating,comment} = req.body;
    
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new AppError('No product found with that ID',404));
    }

    if(rating<1 || rating>5){
        return next(new AppError('Please rate between 1 to 5',400));
    }

    const alreadyReviewed = product.reviews.find(r => r.user_email === req.user.email);
    if(alreadyReviewed){
        return next(new AppError('Product already reviewed',400));
    }

    const review = {
        name: req.user.name ,
        rating: Number(rating),
        image: req.user.image,
        title,
        comment,
        user_email: req.user.email
    }

    product.reviews.push(review);
    product.numReviews= product.reviews.length;
    product.rating= product.reviews.reduce((acc,item)=> item.rating+acc,0)/product.reviews.length;
    
    await product.save();

    res.status(201).json({
        status: 'success',
        data: {
            message: 'Review added'
        }
    });
});


exports.getProductReviews = catchAsync(async(req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new AppError('No product found with that ID',404));
    }

    res.status(200).json({
        status: 'success',
        results: product.reviews.length,
        data: {
            reviews: product.reviews
        }
    });
});

exports.deleteProductReview = catchAsync(async(req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new AppError('No product found with that ID',404));
    }

    const review = product.reviews.find(r => r.user_email === req.user.email);
    if(!review){
        return next(new AppError('Review not found',404));
    }

    product.reviews.splice(product.reviews.indexOf(review),1);
    product.numReviews= product.reviews.length;
    product.rating= product.reviews.reduce((acc,item)=> item.rating+acc,0)/product.reviews.length;

    await product.save();
    
    res.status(200).json({
        status: 'success',
        data: {
            message: 'Review deleted'
        }
    });
});