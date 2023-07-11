const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/user-model");
const dotenv = require("dotenv");
dotenv.config(); 

passport.serializeUser(function(user, done){
    console.log("serializing user")
	done(null, user._id);
    console.log(user._id)
});


passport.deserializeUser(function(id, done) {
    User.findById(id).then((user)=>{
        done(null,user);
    })
    console.log("deserializing user")
});


passport.use(
	new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID_WEB,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET_APP,
		callbackURL: "/api/v1/auth/google/callback",
        proxy:true,
		scope: ["profile", "email"]
	},

	function (req,accessToken, refreshToken, profile, done) {
        console.log(profile)
		User.findOne({email: profile.emails[0].value})
        .then((user)=>{
            console.log(user)
            if(user) return(done(null,user));

            const name = profile.displayName;
            const password= `${profile.displayName}@2023`;
            const passwordConfirm = `${profile.displayName}@2023`;
            const email = profile.emails[0].value;
            const image = profile.photos[0].value;

            User.create({name,password,passwordConfirm,email,image})
            .then((user)=>{
                return done(null,user)
            })
            .catch((err)=>{
                console.log("Error in creating user by google oauth", err);
                return done(null,err);
            })
				
			})
			.catch((err)=>{
				console.log("Error un creating user by google oauth",err);
                return;
			})
    })
)
