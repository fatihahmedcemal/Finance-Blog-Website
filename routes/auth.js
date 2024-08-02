const express = require("express");
const router = express.Router();

const User = require("../schemas/userSchema");
const helperProfile = require("../schemas/helperProfile");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
    if(!req.user) return res.render("login.ejs");
    res.redirect("/")
});

router.get("/login", async (req, res) => {
    res.render("login.ejs")
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log(user);
        if (!user) {
            return res.status(400).send("Wrong email or password.");
        }

        const comparePassword = await bcrypt.compare(req.body.password, user.password); 
        console.log(comparePassword);
        if (!comparePassword) {
            res.status(400).send("Wrong email or password");
        }
        req.session.userId = user.id;
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.redirect("/auth");
    }
});

router.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

router.post("/signup", async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10)
    var user = new User({
        name: req.body.username,
        email: req.body.email,
        password: password,
        role: req.body.role,
        contacts: []
    }); 

    if(req.body.role == "Helper") {
        var HelperProfile = new helperProfile({
            name: req.body.username,
            email: req.body.email
        });
    }
    try {
        user = await user.save();
        if(HelperProfile) HelperProfile = await HelperProfile.save();
        req.session.userId = user.id;
        res.redirect("/");
        console.log(user._id);
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.get("/logout", (req, res) => {
    req.session.userId = null;
    return res.redirect("/")
});


module.exports = router;