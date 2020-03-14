require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// var encrypt = require('mongoose-encryption');
// const md5 = require("md5");
const bcrypt = require('bcrypt');




const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

const saltRounds = 5;


mongoose.connect("mongodb://localhost:27017/secretsDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



// console.log(process.env.SECRET);

// userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});

const User = mongoose.model("user", userSchema);

app.get("/", function(req, res) {

  res.render("home");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login")
});

app.post("/register", function(req, res) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    const email = req.body.username;
    const password = hash;

    User.findOne({
      email: email
    }, function(err, userFound) {
      if (!err) {
        if (userFound) {
          console.log("Email is already in use");
          res.redirect("register");
        } else {
          const nUser = new User({
            email: email,
            password: password
          });

          nUser.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              res.render("secrets");
            }
          });
        }
      }
    });
  });




});


app.post("/login", function(req, res) {

    const email = req.body.username;
    const password = req.body.password;

    User.findOne({email: email}, function(err, foundUser) {
      if (err) {
            console.log(err);
      }
      else{
        if(foundUser){
          bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) { res.render('secrets');  }
        });
        }

      }
    });
});



app.listen(3000, function() {
  console.log("Server started at 3000");
})
