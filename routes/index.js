const express    = require("express"),
      router     = express.Router(),
      firebase   = require("firebase"),
      middleware  = require("../middleware/index.js");


// ===========================================================
// LANDING PAGE
// ===========================================================      
router.get("/", function(req, res){
    res.render("landing", {page: 'home'});
});



// ===========================================================
// REGISTER
// ===========================================================   
// Form
router.get("/register", function(req, res){
	res.render("register", {page: 'register'}); 
});

 // Logic
 router.post("/register", function(req, res){

    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(registeredUser){
        
        // add to realtime database
        firebase.database().ref("users/" + registeredUser.user.uid).set({
            email: email
        });

        req.flash("success", "Cont creat cu succes. Bine ai venit!");
        res.redirect("/");

    }).catch(function(error) {
        error = parseError(error.message);
        req.flash("error", error);
		res.redirect("back");
    });

});



// ===========================================================
// LOGIN
// ===========================================================   
// Form
router.get("/login", function(req, res){
	res.render("login", {page: 'login'}); 
 });

 // Logic
 router.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
        // user signed in
        req.flash("success", "Bine ai venit!");
        res.redirect("/");
     }).catch(function(error) {
        error = parseError(error.message);
        req.flash("error", error);
		res.redirect("back");
     });

});



// ===========================================================
// LOGOUT
// ===========================================================   
router.get("/logout", function(req, res){

	firebase.auth().signOut().then(function() {
        
      }).catch(function(error) {
        console.log("error: " + error.message);
      }).then(() => {
        userId = null;
        res.redirect("/");
      });

});



// ===========================================================
// PROFILE
// ===========================================================   
router.get("/profile", middleware.isLoggedIn, function(req, res){

    res.render("profile", {page: 'profile', user: firebase.auth().currentUser});

});


module.exports = router;


function parseError(error){
    if(error === "The password is invalid or the user does not have a password."){
        return "Parola/Adresă mail invalidă. Mai încearcă";
    }
    if(error === "There is no user record corresponding to this identifier. The user may have been deleted."){
        return "Utilizatorul nu există. Creați un cont și apoi reîncercați autentificarea!";
    }
    if(error === "The email address is already in use by another account."){
        return "Această adresă de mail este folosită deja de către un alt utilizator";
    }
    if(error === "The password must be 6 characters long or more."){
        return "Parola trebuie să aibă un minim de 6 caractere";
    }
    if(error === "The email address is badly formatted."){
        return "Vă rog introduceți o adresă de mail validă";
    }

    return "A intervenit o eroare neașteptată, vă rugăm să încercați mai târziu.";
}