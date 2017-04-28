const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/database");

router.post('/register', (req,res) => {
    let newUser = new User ({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) => {
        if(err){
            res.json({success: false, msg: "Failed to register user."});
        }else{
            res.json({success: true, msg: "User registered."});
        }
    });
});

router.post('/authenticate', (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => { // check for user
        if(err) throw err;

        if(!user){ // no match
            return res.json({success: false, msg: "User not found."});
        }

        User.comparePassword(password, user.password, (err, isMatch) => { // if user exists, check for password
            if(err) throw err;

            if(isMatch){
                const token = jwt.sign(user, config.secret, { // sign the user in
                    expiresIn: 604800 // keep him sign in for 1 week (in seconds)
                });

                res.json({ // send the user to the client side
                    success: true,
                    token: "JWT "+token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            }else{ // no match
                return res.json({success: false, msg: "Wrong password."});
            }
        });
    });
});

router.post('/changepassword', passport.authenticate('jwt', {session: false}), (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    User.getUserByUsername(username, (err, user) => { // check for user
        if(err) throw err;

        if(!user){ // no match
            return res.json({success: false, msg: "User not found."});
        }

        User.comparePassword(password, user.password, (err, isMatch) => { // if user exists, check for password
            if(err) throw err;

            if(isMatch){ // if the old password matches
                // change his old password
                User.changePassword(username, newPassword, (err, isChanged) => {
                    if(err) throw err;

                    if(isChanged){
                        res.json({success: true, msg: "Password changed successfully."});
                    }else{
                        return res.json({success: false, msg: "Unable to change password."});
                    }

                })
            }else{ // no match
                return res.json({success: false, msg: "Wrong password."});
            }
        });
    });
});

router.post('/deleteuser', passport.authenticate('jwt', {session: false}), (req,res) => {
    const username = req.body.username;

    User.deleteUser(username, (err, isDeleted) => {
        if(err) throw err;

        if(isDeleted){
            return res.json({success: true, msg: "User deleted successfully."});
        }else{
            return res.json({success: false, msg: "Couldn't delete user."});
        }
    });
});

router.get('/profile', passport.authenticate('jwt', {session: false}), (req,res) => {
    res.json({
        user: req.user
    });
});

module.exports = router;
