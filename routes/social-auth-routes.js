const passport = require("passport");
const expressRouter = require('express').Router();

expressRouter.get(`/google`,passport.authenticate("google", ["profile", "email"]));

expressRouter.get("/google/callback",passport.authenticate("google", {
		successRedirect : 'https://techspark.vercel.app/',
		failureRedirect : '/api/v1/auth/failed'
	}),
);

// expressRouter.get("/current-user",(req,res)=>{
//     res.send(req.user);
// });

expressRouter.get('/failed', (req,res)=>{
    res.status(400).json({error:"Please try again"})
});

expressRouter.get('/logout',  (req, res) => {
   if(req.logout()) req.logout();
    res.redirect('https://techspark.vercel.app/');
});


module.exports = expressRouter;

