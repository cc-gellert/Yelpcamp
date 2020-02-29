//1. download dependencies, 2. require dependencies here 3. add below to app.use
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
	flash 		= require("connect-flash"), 
	passport 	= require("passport"),
	localStrategy = require("passport-local"),
	methodOverride = require("method-override"),
    Campground  = require("./models/campgrounds"),
    Comment     = require("./models/comment"),
	User 		= require("./models/user");

var commentRoutes = require("./routes/comments"),
	reviewRoutes = require("./routes/reviews"), 
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");
	

mongoose.connect('mongodb+srv://devsquash:flop*973@cluster0-hgvtd.mongodb.net/yelp_camp?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useCreateIndex: true 
}).then(() => {
	console.log('Connected to db');
}).catch(err => {
	console.log('ERROR', err.message); 
}); 
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); 
app.use(flash()); 

//passport configuration
app.use(require("express-session")({
	secret: "Paws is fat n dumb",
	resave: false,
	saveUninitialize: false
})); 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

//middleware to be used for every route 
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error"); 
	res.locals.success = req.flash("success"); 
	next(); 
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes); 

app.listen(9000, () => {
	console.log('server is listening on port 9000'); 
}); 