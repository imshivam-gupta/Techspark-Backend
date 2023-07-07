const dotenv = require("dotenv"); 
const mongoose  = require("mongoose");
const cloudinary = require('cloudinary').v2;

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err, err.message);
    process.exit(1);
});
  

const app = require("./app");
dotenv.config(); 

console.log("ye dikkat hai",process.env.DATABASE);

mongoose.connect(process.env.DATABASE,{
    newUrlParser: true,
    useCreateIndex: true
}).then( () => {
    console.log("DB connection Successful");
});


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const port = process.env.port ||  4000;
const server = app.listen(port,()=>{
    console.log(`Server running on port: ${port}`); 
})
 
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
});


