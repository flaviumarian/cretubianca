const express        = require("express"),
      expressSession = require("express-session"),
      app            = express(),
      bodyParser     = require("body-parser"),
      methodOverride = require("method-override"),
      flash          = require("connect-flash"),
      firebase       = require("firebase"),
      path           = require("path"),
      favicon        = require('serve-favicon'),
      indexRoutes    = require("./routes/index"),
      patientRoutes  = require("./routes/patients"),
      port 			 = process.env.PORT || 3000;


var user    = null;

// Check for user authentification status
firebase.auth().onAuthStateChanged(function(currentUser){
    
    if(user){
        user = null;
    }else{
        user = currentUser;
    }
    
});

// Settings      
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSession({
    secret: "Once again a key",
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(flash());
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(function(req, res, next){
    res.locals.user = user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(methodOverride("_method"));


// Routes
app.use("/", indexRoutes);
app.use("/patients", patientRoutes)

    
app.listen(port, function(){
    console.log("Server is listening");
});