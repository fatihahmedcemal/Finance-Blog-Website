const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const authRoute = require("./auth");
const adminRoute = require("./admin");
const dashboardRoute = require("./dashboard.js");
const chatRoute = require("./chat.js");
const meetingRoute = require("./meeting.js");


const User = require("../schemas/userSchema");
const Chat = require("../schemas/chatSchema");

router.get("/", (req, res) => {
    res.render("home.ejs");
});

// Account and Help
router.get("/account", async (req, res) => {
    console.log(req.user);
    if(!req.user) return res.render("account.ejs", { notLoggedIn: true })
    if(req.user.role == "Admin") return res.redirect("/admin");

    const userProfile = await User.findOne({ email: req.user.email });

    res.render("account.ejs", { user: userProfile, notLoggedIn: false })
});

// meetings page 
router.get("/account/meetings", async (req, res) => {
    var meetings = [];
    var chatsOfUser;
    // find user chats
    if(req.user.role == 'Helper') {
        chatsOfUser = await Chat.find({ helper: req.user.name });
    } else if(req.user.role == 'Customer') {
        chatsOfUser = await Chat.find({ customer: req.user.name });
    }
    // check if the user doesn't have any chats
    if(chatsOfUser.length === 0) return res.render("meetings.ejs", { meetings });
    // add the meetings in every chat to the 'meetings' array
    chatsOfUser.forEach(chat => {
        if(chat.meetings) {
            const meetingsOfChat = chat.meetings;
            meetingsOfChat.forEach(meeting => {
                meetings.push(meeting);
            });
        }
    });
    // render the page with the meetings the user has scheduled
    res.render("meetings.ejs", { meetings });
});

router.get("/help", (req, res) => {
    res.render("help.ejs");
});

// auth
router.use("/auth", authRoute);

// admin
router.use("/admin", adminRoute);

// discover
router.use("/dashboard", dashboardRoute);

// chat
router.use("/chat", chatRoute);

// meeting
router.use("/meeting", meetingRoute);

module.exports = router;