const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const createError = require("../error");

const router = express.Router();

// Create a user
router.post("/signup", async (req, res, next) => {
    try {
        const hashedPass = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({...req.body, password: hashedPass});
        await newUser.save();
        res.status(200).send("User created");
    } catch (err) {
        next(err);
    }
});

// Sign IN
router.post("/signin", async (req, res, next) => {
    try {
        const user = await User.findOne({name: req.body.name});
        if(!user) {
            return next(createError(404, "User not found!"));
        }
        if(!await bcrypt.compare(req.body.password, user.password)) {
            return next(createError(400, "Invalid password entered!"));
        }

        const {password, ...others} = user._doc;
        // Creating authToken
        const token = jwt.sign({
            id: user._id
        }, process.env.JWTSecret);

        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(others);
    } catch (err) {
        next(err);
    }
});

// Google OAuth
router.post("/google", (req, res) => {

});

module.exports = router