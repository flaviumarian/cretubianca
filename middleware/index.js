const firebase = require("firebase");



// All the middleware goes here
var middlewareObj = {};


// User Logged In
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){

    if(firebase.auth().currentUser){
        return next();
    }

    req.flash("error", "Trebuie să fii autentificat pentru a accesa această pagină");
	res.redirect("/login");
}


module.exports = middlewareObj;
