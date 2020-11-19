const express    = require("express"),
      router     = express.Router(),
      firebase   = require("firebase"),
      middleware  = require("../middleware/index.js");

var user    = null;

var firebaseConfig = {
    apiKey: "AIzaSyBCw5eX4J4yKmYDYruB8NjCXN65ki0SJ7M",
    authDomain: "biancacretumd-172bf.firebaseapp.com",
    databaseURL: "https://biancacretumd-172bf.firebaseio.com",
    projectId: "biancacretumd-172bf",
    storageBucket: "biancacretumd-172bf.appspot.com",
    messagingSenderId: "820457141492",
    appId: "1:820457141492:web:38d1bbfe362e0d1f24daa1",
    measurementId: "G-VW4KT5WHLD"
};

firebase.initializeApp(firebaseConfig);

// // Check for user authentification status
firebase.auth().onAuthStateChanged(function(currentUser){
    
    if(user){
        user = null;
    }else{
        user = currentUser;
    }
    
});

// ===========================================================
// SHOW ALL PATIENTS
// ===========================================================  
router.get("/", middleware.isLoggedIn, function(req, res){

    var currentPatients = [];


    // Get all patients for current user
    firebase.database().ref("/users/" + user.uid + "/patients/").once('value').then(function(snapshot){

        var currentKeys = Object.keys(snapshot.val()).sort(function(a,b) { 
            return (snapshot.val()[a].lastName > snapshot.val()[b].lastName) ? 1 : (snapshot.val()[a].lastName === snapshot.val()[b].lastName) ? ((snapshot.val()[a].firstName > snapshot.val()[b].firstName) ? 1 : -1) : -1;
        });
        
        snapshot.forEach(function(childSnapshot){
            currentPatients.push(childSnapshot.val());
        });
        
        currentPatients.sort((a, b) => (a.lastName > b.lastName) ? 1 : (a.lastName === b.lastName) ? ((a.firstName > b.firstName) ? 1 : -1) : -1 );
        
        
        res.render("patients/patients", {page: "patient", patients: currentPatients, keys: currentKeys});
    }).catch((error) => {
        res.render("patients/patients", {page: "patient", patients: currentPatients});
    });
    
});



// ===========================================================
// NEW
// ===========================================================    
// Form
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("patients/new");  
});

// Logic
router.post("/", middleware.isLoggedIn, function(req, res){ 
    // Path to realtime database
    const rootRef = firebase.database().ref("users/" + user.uid + "/patients/");
    
    // New Patient
    var patient = {};
    
    patient.lastName = req.body.lastName;
    patient.firstName = req.body.firstName;
    patient.phone = req.body.phone;
    
    if(req.body.observations && req.body.observations != ""){
        patient.observations = req.body.observations;
    }
    
    patient.gender = req.body.gender;
    
    // Add Patient
    rootRef.child(rootRef.push().key).set(patient);
    req.flash("success", "Pacient nou adăugat!");
    res.redirect("/patients");
    
    
});


// ===========================================================
// SEARCH
// =========================================================== 
router.get("/search=:term", middleware.isLoggedIn, function(req, res){

    const searchedTerm = req.params['term'].toLowerCase();

    var searchedPatients = [];
    var searchedKeys = [];
    firebase.database().ref("/users/" + user.uid + "/patients/").once('value').then(function(snapshot){

        snapshot.forEach(function(childSnapshot){

            if(childSnapshot.val().firstName.toLowerCase().includes(searchedTerm)){

                searchedPatients.push(childSnapshot.val());
                searchedKeys.push(childSnapshot.key);
            }
        });
        
        res.render("patients/patients", {page: "patient", patients: searchedPatients, keys: searchedKeys, searched: searchedTerm});
    });
});

// SHOW
router.get("/:id", middleware.isLoggedIn, function(req, res){
    
    firebase.database().ref("/users/" + user.uid + "/patients/" + req.params['id']).once('value').then(function(snapshot){
        
        res.render("patients/patient", {patient: snapshot.val(), id: req.params['id']});
        
    });
    
});

// ===========================================================
// EDIT
// ===========================================================    
// Form
router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    
    firebase.database().ref("/users/" + user.uid + "/patients/" + req.params['id']).once('value').then(function(snapshot){
        
        res.render("patients/edit", {patient: snapshot.val(), id: req.params['id']});
        
    });
    
});

// Logic
router.put("/:id", middleware.isLoggedIn, function(req, res){
    
    // Path to realtime database
    const rootRef = firebase.database().ref("users/" + user.uid + "/patients/" + req.params['id']);
    
    firebase.database().ref("/users/" + user.uid + "/patients/" + req.params['id']).once('value').then(function(snapshot){
        
        // Old patient
        var currentPatient = snapshot.val();
        
        // New Patient
        var patient = {};
        
        patient.lastName = req.body.lastName;
        patient.firstName = req.body.firstName;
        patient.phone = req.body.phone;
        
        if(req.body.observations && req.body.observations != ""){
            patient.observations = req.body.observations;
        }
        
        patient.gender = req.body.gender;
        
        if(currentPatient.lastName === patient.lastName && currentPatient.firstName === patient.firstName && currentPatient.phone === patient.phone && patient.observations && currentPatient.observations === patient.observations && currentPatient.gender === patient.gender){
            // No change
        }else{
            // Add Patient
            rootRef.set(patient);
            req.flash("success", "Informații pacient actualizate!");
        }
        
        res.redirect("/patients/" + req.params['id']);
        
    });
});
    
// ===========================================================
// DELETE
// ===========================================================    
router.delete("/:id", middleware.isLoggedIn, function(req, res){

    firebase.database().ref("/users/" + user.uid + "/patients/"  + req.params['id']).once('value').then(function(snapshot){

        const rootRef = firebase.database().ref("users/" + user.uid + "/patients/" + req.params['id']);
        rootRef.remove().then( ()=> {
            
            req.flash("success", "Pacient șters cu succes!");
            res.redirect("/patients/");

        }).catch((error) => {
            req.flash("error", "A intervenit o eroare. Vă rog încercați mai târziu");
            res.redirect("/patients/");

        });

    });
});    
    

module.exports = router;

