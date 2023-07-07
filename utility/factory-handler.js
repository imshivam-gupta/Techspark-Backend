const catchAsync = require("./catch-async");
const AppError = require("./app-error");
const ApiFeatures = require("./api-features");


exports.deleteOne = Model =>  catchAsync(async(req,res,next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  
   if(!doc){
       return next(new AppError('No document found with that ID',404));
   }

   res.status(200).json({
       status: 'success',
       data: null
   });
});

exports.getAll = Model => catchAsync(async(req,res,next) => {
  const features = new ApiFeatures(Model.find(),req.query).filter().sort().limitfields().paginate();
  const docs = await features.query;

  res.status(200).json({
      status: 'success',
      results: docs.length,
      data:{
          docs
      }
  })
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
});

exports.createOne = (Model,user_to_add) => catchAsync(async (req, res, next) => {
    
    let doc;
    if(user_to_add && user_to_add===true) doc = await Model.create({...req.body,user:req.user._id});
    else doc = await Model.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
});